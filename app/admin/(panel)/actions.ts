"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, clearAdminCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseTakeaways, slugify } from "@/lib/content";
import { youtubeId } from "@/lib/youtube";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const client = db();
  if (!client) throw new Error("Database is not configured.");
  return client;
}

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!youtubeId(trimmed)) return undefined;
  return trimmed;
}

export async function signOut() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function saveStage(formData: FormData) {
  const client = await requireAdmin();
  const existingId = String(formData.get("id") ?? "").trim();
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const labelEs = String(formData.get("labelEs") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const optional = formData.get("optional") === "on";
  if (!labelEn || !labelEs) redirect("/admin?error=Stage+names+are+required");
  const id = existingId || slugify(labelEn);
  if (!id) redirect("/admin?error=Could+not+make+a+stage+id");
  const { error } = await client.from("casepath_stages").upsert({
    id,
    label_en: labelEn,
    label_es: labelEs,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    optional,
    updated_at: new Date().toISOString(),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  redirect("/admin?saved=stage");
}

export async function deleteStage(formData: FormData) {
  const client = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { count, error: countError } = await client
    .from("casepath_videos")
    .select("id", { count: "exact", head: true })
    .eq("stage_id", id);
  if (countError) redirect(`/admin?error=${encodeURIComponent(countError.message)}`);
  if ((count ?? 0) > 0) redirect("/admin?error=Move+or+delete+the+videos+in+this+stage+first");
  const { error } = await client.from("casepath_stages").delete().eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  redirect("/admin?saved=stage");
}

export async function saveVideo(formData: FormData) {
  const client = await requireAdmin();
  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const stageId = String(formData.get("stageId") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const titleEs = String(formData.get("titleEs") ?? "").trim();
  const introEn = String(formData.get("introEn") ?? "").trim();
  const introEs = String(formData.get("introEs") ?? "").trim();
  const nextStepsEn = String(formData.get("nextStepsEn") ?? "").trim();
  const nextStepsEs = String(formData.get("nextStepsEs") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const published = formData.get("published") === "on";
  const back = originalSlug ? `/admin/videos/${originalSlug}` : "/admin/videos/new";

  if (!slug || !stageId || !titleEn || !titleEs) {
    redirect(`${back}?error=${encodeURIComponent("Slug, stage, and both titles are required.")}`);
  }

  const youtubeEn = cleanUrl(String(formData.get("youtubeUrlEn") ?? ""));
  const youtubeEs = cleanUrl(String(formData.get("youtubeUrlEs") ?? ""));
  if (youtubeEn === undefined || youtubeEs === undefined) {
    redirect(`${back}?error=${encodeURIComponent("Use a YouTube link, or leave the field blank.")}`);
  }

  const row = {
    slug,
    stage_id: stageId,
    title_en: titleEn,
    title_es: titleEs,
    intro_en: introEn,
    intro_es: introEs,
    youtube_url_en: youtubeEn,
    youtube_url_es: youtubeEs,
    takeaways_en: parseTakeaways(String(formData.get("takeawaysEn") ?? "")),
    takeaways_es: parseTakeaways(String(formData.get("takeawaysEs") ?? "")),
    next_steps_en: nextStepsEn,
    next_steps_es: nextStepsEs,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published,
    updated_at: new Date().toISOString(),
  };

  const query = originalSlug
    ? client.from("casepath_videos").update(row).eq("slug", originalSlug)
    : client.from("casepath_videos").insert(row);
  const { error } = await query;
  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath(`/v/${slug}`);
  if (originalSlug && originalSlug !== slug) revalidatePath(`/v/${originalSlug}`);
  redirect(`/admin/videos/${slug}?saved=1`);
}

export async function deleteVideo(formData: FormData) {
  const client = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const { error } = await client.from("casepath_videos").delete().eq("slug", slug);
  if (error) redirect(`/admin/videos/${slug}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath(`/v/${slug}`);
  redirect("/admin?saved=video");
}
