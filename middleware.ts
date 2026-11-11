import { NextResponse, type NextRequest } from "next/server";

const TOKEN = /^[A-Za-z0-9_-]{8,128}$/;
const PATH_TOKEN = /^(.*)\/t\/([A-Za-z0-9_-]{8,128})$/;
const VISIT_COOKIE = "casepath_vt";

function clearLangCookie(response: NextResponse, request: NextRequest) {
  if (request.cookies.has("casepath_lang")) {
    response.cookies.set("casepath_lang", "", { path: "/", maxAge: 0 });
  }
  return response;
}

function setVisitCookie(response: NextResponse, token: string) {
  response.cookies.set(VISIT_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Short /r/TOKEN links are handled by their own route (OG HTML for SMS previews).
  if (/^\/r\/[A-Za-z0-9_-]{8,128}\/?$/.test(pathname)) {
    return NextResponse.next();
  }

  const pathToken = pathname.match(PATH_TOKEN);
  const queryToken = searchParams.get("t") ?? "";

  // Old ?t= links become path tokens so the browser URL stays preview-friendly.
  if (!pathToken && TOKEN.test(queryToken)) {
    const redirectUrl = request.nextUrl.clone();
    const base = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    redirectUrl.pathname = `${base}/t/${queryToken}`;
    redirectUrl.searchParams.delete("t");
    return clearLangCookie(setVisitCookie(NextResponse.redirect(redirectUrl, 302), queryToken), request);
  }

  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", searchParams.get("lang") === "es" ? "es" : "en");

  if (!pathToken) {
    return clearLangCookie(NextResponse.next({ request: { headers } }), request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathToken[1] || "/";
  rewriteUrl.searchParams.set("t", pathToken[2]);
  return clearLangCookie(
    setVisitCookie(NextResponse.rewrite(rewriteUrl, { request: { headers } }), pathToken[2]),
    request,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
