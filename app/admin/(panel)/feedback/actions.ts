"use server";

import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { cleanPagePath, mintVisitLink } from "@/lib/visit";

export async function createVisitLink(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const caseNumber = String(formData.get("caseNumber") ?? "").trim();
  const path = cleanPagePath(String(formData.get("path") ?? ""));
  if (!caseNumber || !path) redirect("/admin/feedback?error=Enter%20a%20case%20number%20and%20a%20page%20path");
  try {
    const link = await mintVisitLink({ caseNumber, path });
    if (!link) redirect("/admin/feedback?error=Could%20not%20create%20that%20link");
    redirect(`/admin/feedback?url=${encodeURIComponent(link.url)}`);
  } catch {
    redirect("/admin/feedback?error=Could%20not%20create%20that%20link");
  }
}
