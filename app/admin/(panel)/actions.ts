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

function cleanPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/^[0-9+().\-\s]+$/.test(trimmed) || trimmed.replace(/\D/g, "").length < 10) return undefined;
  return trimmed;
}

function cleanImage(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
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

export async function saveStagePage(formData: FormData) {
  const client = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const labelEs = String(formData.get("labelEs") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const optional = formData.get("optional") === "on";
  if (!id || !labelEn || !labelEs) redirect(`/admin/stages/${id}?error=${encodeURIComponent("Both stage names are required.")}`);
  const youtubeEn = cleanUrl(String(formData.get("youtubeUrlEn") ?? ""));
  const youtubeEs = cleanUrl(String(formData.get("youtubeUrlEs") ?? ""));
  const imageEn = cleanImage(String(formData.get("imageUrlEn") ?? ""));
  const imageEs = cleanImage(String(formData.get("imageUrlEs") ?? ""));
  if (youtubeEn === undefined || youtubeEs === undefined) {
    redirect(`/admin/stages/${id}?error=${encodeURIComponent("Use a YouTube link, or leave the video field blank.")}`);
  }
  if (imageEn === undefined || imageEs === undefined) {
    redirect(`/admin/stages/${id}?error=${encodeURIComponent("Photo links must start with http:// or https://.")}`);
  }
  const { error } = await client
    .from("casepath_stages")
    .update({
      label_en: labelEn,
      label_es: labelEs,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      optional,
      header_en: String(formData.get("headerEn") ?? "").trim(),
      header_es: String(formData.get("headerEs") ?? "").trim(),
      intro_en: String(formData.get("introEn") ?? "").trim(),
      intro_es: String(formData.get("introEs") ?? "").trim(),
      youtube_url_en: youtubeEn,
      youtube_url_es: youtubeEs,
      image_url_en: imageEn,
      image_url_es: imageEs,
      takeaways_en: parseTakeaways(String(formData.get("takeawaysEn") ?? "")),
      takeaways_es: parseTakeaways(String(formData.get("takeawaysEs") ?? "")),
      next_steps_en: String(formData.get("nextStepsEn") ?? "").trim(),
      next_steps_es: String(formData.get("nextStepsEs") ?? "").trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) redirect(`/admin/stages/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath(`/s/${id}`);
  redirect(`/admin/stages/${id}?saved=1`);
}

export async function saveBrand(formData: FormData) {
  const client = await requireAdmin();
  const firmName = String(formData.get("firmName") ?? "").trim() || "Ramos James Law, PLLC";
  const phone = cleanPhone(String(formData.get("phone") ?? ""));
  if (phone === undefined) redirect("/admin?error=Enter+a+phone+number+with+at+least+10+digits");
  let logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) redirect("/admin?error=Logo+must+be+under+2+MB");
    const allowed = file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp";
    if (!allowed) redirect("/admin?error=Use+a+PNG,+JPG,+or+WebP+logo");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `brand/logo.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await client.storage.from("casepath").upload(path, bytes, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) redirect(`/admin?error=${encodeURIComponent(uploadError.message)}`);
    const { data } = client.storage.from("casepath").getPublicUrl(path);
    logoUrl = `${data.publicUrl}?v=${Date.now()}`;
  } else if (logoUrl) {
    const checked = cleanImage(logoUrl);
    if (checked === undefined) redirect("/admin?error=Logo+link+must+start+with+http");
    logoUrl = checked ?? "";
  }
  const now = new Date().toISOString();
  const { error } = await client.from("casepath_settings").upsert([
    { key: "firm_name", value: firmName, updated_at: now },
    { key: "logo_url", value: logoUrl, updated_at: now },
    { key: "phone", value: phone, updated_at: now },
  ]);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=brand");
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
  const back = originalSlug ? `/admin/videos/${originalSlug}` : "/admin/videos/new";

  if (!slug || !stageId || !titleEn || !titleEs) {
    redirect(`${back}?error=${encodeURIComponent("Slug, stage, and both titles are required.")}`);
  }

  const youtubeEn = cleanUrl(String(formData.get("youtubeUrlEn") ?? ""));
  const youtubeEs = cleanUrl(String(formData.get("youtubeUrlEs") ?? ""));
  const imageEn = cleanImage(String(formData.get("imageUrlEn") ?? ""));
  const imageEs = cleanImage(String(formData.get("imageUrlEs") ?? ""));
  if (youtubeEn === undefined || youtubeEs === undefined) {
    redirect(`${back}?error=${encodeURIComponent("Use a YouTube link, or leave the field blank.")}`);
  }
  if (imageEn === undefined || imageEs === undefined) {
    redirect(`${back}?error=${encodeURIComponent("Photo links must start with http:// or https://.")}`);
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
    image_url_en: imageEn,
    image_url_es: imageEs,
    takeaways_en: parseTakeaways(String(formData.get("takeawaysEn") ?? "")),
    takeaways_es: parseTakeaways(String(formData.get("takeawaysEs") ?? "")),
    next_steps_en: nextStepsEn,
    next_steps_es: nextStepsEs,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published: true,
    updated_at: new Date().toISOString(),
  };

  const query = originalSlug
    ? client.from("casepath_videos").update(row).eq("slug", originalSlug)
    : client.from("casepath_videos").insert(row);
  const { error } = await query;
  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/stages/${stageId}`);
  revalidatePath(`/v/${slug}`);
  revalidatePath(`/s/${stageId}`);
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
