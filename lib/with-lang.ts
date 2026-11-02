import type { Lang } from "@/lib/types";

export function withLang(path: string, lang: Lang) {
  if (lang !== "es") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=es`;
}
