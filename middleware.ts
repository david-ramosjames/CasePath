import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (lang !== "en" && lang !== "es") return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", lang);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set("casepath_lang", lang, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
