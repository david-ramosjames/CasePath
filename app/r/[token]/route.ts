import { NextResponse } from "next/server";
import { cleanToken, resolveVisitTarget, visitDestination } from "@/lib/visit";

export const dynamic = "force-dynamic";

/** Older /r/TOKEN texts redirect onto the shared page with ?rid=. */
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token: raw } = await context.params;
  const token = cleanToken(raw);
  const target = await resolveVisitTarget(token);
  if (!token || !target) {
    return new NextResponse("This link is no longer available.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return NextResponse.redirect(visitDestination(target), 302);
}
