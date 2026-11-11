import { NextResponse } from "next/server";
import { cleanPagePath, mintVisitLink, tokenSecretMatches } from "@/lib/visit";

export async function POST(request: Request) {
  if (!process.env.CASEPATH_TOKEN_SECRET?.trim()) {
    return NextResponse.json({ error: "Token secret is not configured." }, { status: 503 });
  }
  if (!tokenSecretMatches(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    caseNumber?: unknown;
    path?: unknown;
    lang?: unknown;
    phone?: unknown;
  } | null;
  const caseNumber = typeof body?.caseNumber === "string" ? body.caseNumber.trim() : "";
  const path = cleanPagePath(typeof body?.path === "string" ? body.path : "/");
  const lang = body?.lang === "es" ? "es" : body?.lang === "en" ? "en" : undefined;
  const phone = typeof body?.phone === "string" ? body.phone : null;
  if (!caseNumber || !path) return NextResponse.json({ error: "Case number and path are required." }, { status: 400 });
  try {
    const link = await mintVisitLink({ caseNumber, path, lang, phone });
    if (!link) return NextResponse.json({ error: "Could not create a link." }, { status: 400 });
    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: "Could not create a link." }, { status: 500 });
  }
}
