import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "es" ? "es" : "en";
  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", lang);
  const response = NextResponse.next({ request: { headers } });
  if (request.cookies.has("casepath_lang")) {
    response.cookies.set("casepath_lang", "", { path: "/", maxAge: 0 });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
