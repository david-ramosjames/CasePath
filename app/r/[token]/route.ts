import { NextResponse } from "next/server";
import { sharePreviewCopy, sharePreviewHtml } from "@/lib/share-preview";
import { VISIT_COOKIE, cleanToken, resolveVisitTarget, visitDestination } from "@/lib/visit";

export const dynamic = "force-dynamic";

function notFoundHtml() {
  return `<!DOCTYPE html><html><head><title>Link not found</title></head><body><p>This link is no longer available.</p></body></html>`;
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token: raw } = await context.params;
  const token = cleanToken(raw);
  const target = await resolveVisitTarget(token);
  if (!token || !target) {
    return new NextResponse(notFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const copy = await sharePreviewCopy(target.path, target.lang);
  const destination = visitDestination(target);
  const html = sharePreviewHtml({
    token,
    title: copy.title,
    description: copy.description,
    destination,
    lang: target.lang,
  });

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Allow phones to keep the preview card briefly; HTML itself is tiny.
      "Cache-Control": "public, max-age=300",
    },
  });
  response.cookies.set(VISIT_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
