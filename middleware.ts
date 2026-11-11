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

  // Old /r/TOKEN texts keep working by sending people to the real page with ?rid=.
  const short = pathname.match(/^\/r\/([A-Za-z0-9_-]{8,128})\/?$/);
  if (short && TOKEN.test(short[1])) {
    return NextResponse.next();
  }

  const pathToken = pathname.match(PATH_TOKEN);
  const rid = searchParams.get("rid") ?? "";
  const legacyT = searchParams.get("t") ?? "";

  // Old ?t= links become ?rid= on the same shared page path.
  if (!pathToken && !TOKEN.test(rid) && TOKEN.test(legacyT)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete("t");
    redirectUrl.searchParams.set("rid", legacyT);
    return clearLangCookie(setVisitCookie(NextResponse.redirect(redirectUrl, 302), legacyT), request);
  }

  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", searchParams.get("lang") === "es" ? "es" : "en");

  // Old /…/t/TOKEN path links rewrite onto the shared page with ?rid=.
  if (pathToken) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathToken[1] || "/";
    rewriteUrl.searchParams.delete("t");
    rewriteUrl.searchParams.set("rid", pathToken[2]);
    return clearLangCookie(
      setVisitCookie(NextResponse.rewrite(rewriteUrl, { request: { headers } }), pathToken[2]),
      request,
    );
  }

  if (TOKEN.test(rid)) {
    return clearLangCookie(setVisitCookie(NextResponse.next({ request: { headers } }), rid), request);
  }

  return clearLangCookie(NextResponse.next({ request: { headers } }), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
