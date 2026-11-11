import type { Lang } from "@/lib/types";

export function withLang(path: string, lang: Lang, token: string | null = null) {
  const params = new URLSearchParams();
  if (lang === "es") params.set("lang", "es");
  if (token) params.set("t", token);
  const query = params.toString();
  return query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path;
}
