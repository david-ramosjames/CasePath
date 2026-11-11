import { NextResponse } from "next/server";
import { notifyRating } from "@/lib/slack-feedback";
import { cleanPagePath, readVisitToken, saveRating } from "@/lib/visit";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    stars?: unknown;
    path?: unknown;
    label?: unknown;
    lang?: unknown;
    token?: unknown;
  } | null;
  const stars = Number(body?.stars);
  const path = cleanPagePath(typeof body?.path === "string" ? body.path : "");
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 180) : "";
  const lang = body?.lang === "es" ? "es" : "en";
  const token = await readVisitToken(typeof body?.token === "string" ? body.token : null);
  if (!path || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const saved = await saveRating({ token, path, label: label || path, lang, stars });
    if (!saved) return NextResponse.json({ ok: false }, { status: 400 });
    await notifyRating({
      stars,
      pageLabel: saved.page_label,
      pagePath: saved.page_path,
      clientName: saved.client_name,
      caseNumber: saved.case_number,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
