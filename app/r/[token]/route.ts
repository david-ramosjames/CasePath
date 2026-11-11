import { NextResponse } from "next/server";
import { sharePreviewCopy, sharePreviewHtml } from "@/lib/share-preview";
import { cleanToken, resolveVisitTarget, visitDestination } from "@/lib/visit";

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
  const html = sharePreviewHtml({
    token,
    title: copy.title,
    description: copy.description,
    destination: visitDestination(target),
    lang: target.lang,
  });

  // No Set-Cookie and no meta-refresh: preview crawlers need a normal page at this exact URL.
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
