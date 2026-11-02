import { NextResponse, type NextRequest } from "next/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "es" ? "es" : "en";
  const nextPath = safeNext(request.nextUrl.searchParams.get("next"));
  const destination = new URL(nextPath, request.url);
  destination.searchParams.delete("lang");
  if (lang === "es") destination.searchParams.set("lang", "es");
  const response = NextResponse.redirect(destination);
  response.cookies.set("casepath_lang", "", { path: "/", maxAge: 0 });
  return response;
}
