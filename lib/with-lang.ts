import type { Lang } from "@/lib/types";

const PATH_TOKEN = /\/t\/[A-Za-z0-9_-]{8,128}$/;

/**
 * Keep the shared page path stable for SMS previews.
 * Tracking rides on a short ?rid= query param instead of /r/TOKEN or /t/TOKEN.
 */
export function withLang(path: string, lang: Lang, token: string | null = null) {
  const [pathname, query] = path.split("?");
  const params = new URLSearchParams(query ?? "");
  params.delete("t");
  params.delete("rid");
  const bare = pathname.replace(PATH_TOKEN, "") || "/";
  if (token) params.set("rid", token);
  if (lang === "es") params.set("lang", "es");
  else params.delete("lang");
  const built = params.toString();
  return built ? `${bare}?${built}` : bare;
}
