import { NextResponse, type NextRequest } from "next/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "es" ? "es" : "en";
  const nextPath = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set("casepath_lang", lang, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
