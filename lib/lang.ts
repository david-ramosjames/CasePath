import { cookies } from "next/headers";
import type { Lang } from "@/lib/types";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("casepath_lang")?.value;
  return value === "es" ? "es" : "en";
}

export function text(lang: Lang, english: string, spanish: string): string {
  if (lang === "es" && spanish.trim()) return spanish;
  return english;
}

export function lines(lang: Lang, english: string[], spanish: string[]): string[] {
  if (lang === "es" && spanish.some((item) => item.trim())) return spanish.filter((item) => item.trim());
  return english.filter((item) => item.trim());
}
