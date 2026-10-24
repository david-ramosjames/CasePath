import { db } from "@/lib/db";
import type { Stage, Video } from "@/lib/types";

type StageRow = {
  id: string;
  sort_order: number;
  label_en: string;
  label_es: string;
  optional: boolean;
};

type VideoRow = {
  id: string;
  slug: string;
  stage_id: string;
  automation_id: string | null;
  title_en: string;
  title_es: string;
  intro_en: string;
  intro_es: string;
  youtube_url_en: string | null;
  youtube_url_es: string | null;
  takeaways_en: string[] | null;
  takeaways_es: string[] | null;
  next_steps_en: string;
  next_steps_es: string;
  sort_order: number;
  published: boolean;
};

function stageFrom(row: StageRow): Stage {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    labelEn: row.label_en,
    labelEs: row.label_es,
    optional: row.optional,
  };
}

function videoFrom(row: VideoRow): Video {
  return {
    id: row.id,
    slug: row.slug,
    stageId: row.stage_id,
    automationId: row.automation_id,
    titleEn: row.title_en,
    titleEs: row.title_es,
    introEn: row.intro_en,
    introEs: row.intro_es,
    youtubeUrlEn: row.youtube_url_en,
    youtubeUrlEs: row.youtube_url_es,
    takeawaysEn: row.takeaways_en ?? [],
    takeawaysEs: row.takeaways_es ?? [],
    nextStepsEn: row.next_steps_en,
    nextStepsEs: row.next_steps_es,
    sortOrder: row.sort_order,
    published: row.published,
  };
}

export async function listStages(): Promise<Stage[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("casepath_stages")
    .select("id, sort_order, label_en, label_es, optional")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as StageRow[]).map(stageFrom);
}

export async function listVideos(): Promise<Video[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("casepath_videos")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as VideoRow[]).map(videoFrom);
}

export async function getVideo(slug: string): Promise<Video | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client.from("casepath_videos").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? videoFrom(data as VideoRow) : null;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parseTakeaways(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}
