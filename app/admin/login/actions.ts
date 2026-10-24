"use server";

import { redirect } from "next/navigation";
import { adminPassword, passwordsMatch, setAdminCookie } from "@/lib/auth";

export async function login(formData: FormData) {
  if (!adminPassword()) redirect("/admin/login?error=setup");
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password)) redirect("/admin/login?error=1");
  await setAdminCookie();
  redirect("/admin");
}
