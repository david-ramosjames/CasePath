import type { Lang } from "@/lib/types";

const TOKEN = /\/t\/[A-Za-z0-9_-]{32,128}$/;

/** Token lives in the path so text-message apps can still show the page preview. */
export function withLang(path: string, lang: Lang, token: string | null = null) {
  const [pathname, query] = path.split("?");
  const params = new URLSearchParams(query ?? "");
  params.delete("t");
  const bare = pathname.replace(TOKEN, "") || "/";
  const next = token ? `${bare === "/" ? "" : bare}/t/${token}` : bare;
  if (lang === "es") params.set("lang", "es");
  else params.delete("lang");
  const built = params.toString();
  return built ? `${next}?${built}` : next;
}
