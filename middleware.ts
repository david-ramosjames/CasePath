import { NextResponse, type NextRequest } from "next/server";

const TOKEN = /^[A-Za-z0-9_-]{8,128}$/;
const PATH_TOKEN = /^(.*)\/t\/([A-Za-z0-9_-]{8,128})$/;
const VISIT_COOKIE = "casepath_vt";
const PREVIEW_CRAWLER =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|skypeuripreview|applebot|google-pagerenderer|embedly|quora link preview|pinterest|redditbot|vkshare|w3c_validator|preview/i;

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
  const pathToken = pathname.match(PATH_TOKEN);
  const queryToken = searchParams.get("t") ?? "";
  const isCrawler = PREVIEW_CRAWLER.test(request.headers.get("user-agent") ?? "");

  // Old ?t= links become path tokens (humans) or the bare page (preview crawlers).
  if (!pathToken && TOKEN.test(queryToken)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete("t");
    if (isCrawler) {
      return clearLangCookie(NextResponse.redirect(redirectUrl, 302), request);
    }
    const base = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    redirectUrl.pathname = `${base}/t/${queryToken}`;
    return clearLangCookie(setVisitCookie(NextResponse.redirect(redirectUrl, 302), queryToken), request);
  }

  const headers = new Headers(request.headers);
  headers.set("x-casepath-lang", searchParams.get("lang") === "es" ? "es" : "en");

  if (!pathToken) {
    return clearLangCookie(NextResponse.next({ request: { headers } }), request);
  }

  const barePath = pathToken[1] || "/";
  const token = pathToken[2];

  // Preview bots get the shared page HTML so the card matches the plain link.
  if (isCrawler) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = barePath;
    rewriteUrl.searchParams.delete("t");
    return clearLangCookie(NextResponse.rewrite(rewriteUrl, { request: { headers } }), request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath;
  rewriteUrl.searchParams.set("t", token);
  return clearLangCookie(
    setVisitCookie(NextResponse.rewrite(rewriteUrl, { request: { headers } }), token),
    request,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|previews/).*)"],
};
