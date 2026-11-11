import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import type { Lang } from "@/lib/types";
import { publicSiteUrl } from "@/lib/public-site";
import { withLang } from "@/lib/with-lang";

export type VisitClient = {
  id: string;
  caseId: string | null;
  caseNumber: string | null;
  clientName: string | null;
};

/** New links are 10 chars; older texts used longer tokens. */
export const TOKEN = /^[A-Za-z0-9_-]{8,128}$/;
export const TOKEN_PATH = /\/t\/[A-Za-z0-9_-]{8,128}$/;
export const VISIT_COOKIE = "casepath_vt";

const PREVIEW_CRAWLER =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|skypeuripreview|applebot|google-pagerenderer|embedly|quora link preview|pinterest|redditbot|vkshare|w3c_validator|preview/i;

export function cleanToken(value: string | null | undefined) {
  const token = value?.trim() ?? "";
  return TOKEN.test(token) ? token : null;
}

export function isPreviewCrawler(userAgent: string | null | undefined) {
  return PREVIEW_CRAWLER.test(userAgent ?? "");
}

export async function readVisitToken(raw?: string | null) {
  const fromUrl = cleanToken(raw);
  if (fromUrl) return fromUrl;
  try {
    const jar = await cookies();
    return cleanToken(jar.get(VISIT_COOKIE)?.value);
  } catch {
    return null;
  }
}

export function cleanPagePath(value: string | null | undefined) {
  const path = (value ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("?") || path.includes("#")) {
    return null;
  }
  if (path.length > 180) return null;
  return path;
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newVisitToken() {
  return randomBytes(8).toString("base64url").replace(/=+$/, "").slice(0, 10);
}

export async function resolveVisit(raw: string | null | undefined): Promise<VisitClient | null> {
  const token = cleanToken(raw);
  const client = db();
  if (!token || !client) return null;
  const { data, error } = await client
    .from("casepath_visit_tokens")
    .select("id, case_id, case_number, client_name, revoked_at")
    .eq("token_hash", tokenHash(token))
    .maybeSingle();
  if (error || !data || data.revoked_at) return null;
  return {
    id: data.id as string,
    caseId: (data.case_id as string | null) ?? null,
    caseNumber: (data.case_number as string | null) ?? null,
    clientName: (data.client_name as string | null) ?? null,
  };
}

export async function recordPageView(input: {
  token: string | null;
  path: string;
  label: string;
  lang: Lang;
}) {
  const client = db();
  const path = cleanPagePath(input.path);
  if (!client || !path) return;
  try {
    if (isPreviewCrawler((await headers()).get("user-agent"))) return;
  } catch {
    // headers() unavailable outside a request — still record
  }
  const visit = await resolveVisit(input.token);
  if (visit) {
    const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const { data: recent } = await client
      .from("casepath_page_views")
      .select("id")
      .eq("token_id", visit.id)
      .eq("page_path", path)
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) return;
  }
  const { error } = await client.from("casepath_page_views").insert({
    token_id: visit?.id ?? null,
    case_number: visit?.caseNumber ?? null,
    client_name: visit?.clientName ?? null,
    page_path: path,
    page_label: input.label.slice(0, 180),
    lang: input.lang,
  });
  if (error) console.error("page view", error.message);
}

export async function latestRating(token: string | null, path: string) {
  const client = db();
  const visit = await resolveVisit(token);
  if (!client || !visit) return null;
  const { data } = await client
    .from("casepath_ratings")
    .select("stars")
    .eq("token_id", visit.id)
    .eq("page_path", path)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const stars = Number(data?.stars);
  return stars >= 1 && stars <= 5 ? stars : null;
}

export async function saveRating(input: {
  token: string | null;
  path: string;
  label: string;
  lang: Lang;
  stars: number;
}) {
  const client = db();
  const path = cleanPagePath(input.path);
  if (!client || !path || !Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) return null;
  const visit = await resolveVisit(input.token);
  const row = {
    token_id: visit?.id ?? null,
    case_number: visit?.caseNumber ?? null,
    client_name: visit?.clientName ?? null,
    page_path: path,
    page_label: input.label.slice(0, 180) || path,
    lang: input.lang === "es" ? "es" : "en",
    stars: input.stars,
  };
  const { error } = await client.from("casepath_ratings").insert(row);
  if (error) throw new Error(error.message);
  return row;
}

export async function lookupCase(caseNumber: string) {
  const client = db();
  const key = caseNumber.trim();
  if (!client || !key) return null;
  const { data } = await client
    .from("case_tracker_entries")
    .select("case_id, case_number, client_name_snapshot, client_phone")
    .eq("case_number", key)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  let lang: Lang = "en";
  if (data.case_id) {
    const { data: matter } = await client.from("cases").select("preferred_language").eq("id", data.case_id).maybeSingle();
    if (matter?.preferred_language === "Spanish") lang = "es";
  }
  return {
    caseId: (data.case_id as string | null) ?? null,
    caseNumber: String(data.case_number ?? key),
    clientName: (data.client_name_snapshot as string | null) ?? null,
    phone: (data.client_phone as string | null) ?? null,
    lang,
  };
}

function cleanPhone(value: string | null | undefined) {
  const phone = value?.trim() ?? "";
  const digits = phone.replace(/\D/g, "");
  if (!phone || phone.length > 40 || digits.length < 10 || digits.length > 15) return null;
  return phone;
}

export async function mintVisitLink(input: { caseNumber: string; path: string; lang?: Lang; phone?: string | null }) {
  const client = db();
  const path = cleanPagePath(input.path);
  if (!client || !path) return null;
  const found = await lookupCase(input.caseNumber);
  const lang = input.lang === "es" || input.lang === "en" ? input.lang : (found?.lang ?? "en");
  const phone = cleanPhone(input.phone) ?? found?.phone ?? null;
  const caseNumber = found?.caseNumber ?? input.caseNumber.trim();
  const clientName = found?.clientName ?? null;
  const caseId = found?.caseId ?? null;

  let token = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    token = newVisitToken();
    if (!TOKEN.test(token)) continue;
    const { error } = await client.from("casepath_visit_tokens").insert({
      token_hash: tokenHash(token),
      case_id: caseId,
      case_number: caseNumber,
      client_name: clientName,
      phone,
      page_path: path,
      lang,
    });
    if (!error) {
      // Same shared page path that already previews in SMS, plus a short ?rid= for tracking.
      return { url: `${publicSiteUrl}${withLang(path, lang, token)}`, caseNumber, clientName };
    }
    if (!/duplicate|unique/i.test(error.message)) throw new Error(error.message);
  }
  throw new Error("Could not mint a unique visit token.");
}

export type VisitTarget = VisitClient & {
  path: string;
  lang: Lang;
  token: string;
};

/** Resolve a short /r/TOKEN link to the CasePath page it should open. */
export async function resolveVisitTarget(raw: string | null | undefined): Promise<VisitTarget | null> {
  const token = cleanToken(raw);
  const client = db();
  if (!token || !client) return null;
  const { data, error } = await client
    .from("casepath_visit_tokens")
    .select("id, case_id, case_number, client_name, page_path, lang, revoked_at")
    .eq("token_hash", tokenHash(token))
    .maybeSingle();
  if (error || !data || data.revoked_at) return null;
  const path = cleanPagePath((data.page_path as string | null) ?? "") ?? "/";
  const lang: Lang = data.lang === "es" ? "es" : "en";
  return {
    id: data.id as string,
    caseId: (data.case_id as string | null) ?? null,
    caseNumber: (data.case_number as string | null) ?? null,
    clientName: (data.client_name as string | null) ?? null,
    path,
    lang,
    token,
  };
}

export function visitDestination(target: Pick<VisitTarget, "path" | "lang" | "token">) {
  return `${publicSiteUrl}${withLang(target.path, target.lang, target.token)}`;
}

export function tokenSecretMatches(header: string | null) {
  const expected = process.env.CASEPATH_TOKEN_SECRET?.trim() ?? "";
  const given = header?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!expected || !given) return false;
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
