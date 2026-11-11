import { NextResponse, type NextRequest } from "next/server";

const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;

function clearLangCookie(response: NextResponse, request: NextRequest) {
  if (request.cookies.has("casepath_lang")) {
    response.cookies.set("casepath_lang", "", { path: "/", maxAge: 0 });
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const pathToken = pathname.match(/^(.*)\/t\/([A-Za-z0-9_-]{32,128})$/);
  const queryToken = searchParams.get("t") ?? "";

  if (!pathToken && TOKEN.test(queryToken)) {
    const redirectUrl = request.nextUrl.clone();
    const base = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    redirectUrl.pathname = `${base}/t/${queryToken}`;
    redirectUrl.searchParams.delete("t");
    return clearLangCookie(NextResponse.redirect(redirectUrl, 302), request);
  }

  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", searchParams.get("lang") === "es" ? "es" : "en");

  if (!pathToken) {
    return clearLangCookie(NextResponse.next({ request: { headers } }), request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathToken[1] || "/";
  rewriteUrl.searchParams.set("t", pathToken[2]);
  return clearLangCookie(NextResponse.rewrite(rewriteUrl, { request: { headers } }), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
