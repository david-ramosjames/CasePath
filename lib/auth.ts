import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "casepath_admin";

export function adminPassword() {
  return process.env.CASEPATH_ADMIN_PASSWORD?.trim() ?? "";
}

function token(password: string) {
  return createHmac("sha256", password).update("casepath-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function isAdmin() {
  const password = adminPassword();
  if (!password) return false;
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  return safeEqual(got, token(password));
}

export async function setAdminCookie() {
  const password = adminPassword();
  (await cookies()).set(COOKIE, token(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}

export function passwordsMatch(given: string) {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(given, expected);
}
