export type Lang = "en" | "es";

export type Stage = {
  id: string;
  sortOrder: number;
  labelEn: string;
  labelEs: string;
  optional: boolean;
  headerEn: string;
  headerEs: string;
  introEn: string;
  introEs: string;
  youtubeUrlEn: string | null;
  youtubeUrlEs: string | null;
  imageUrlEn: string | null;
  imageUrlEs: string | null;
  takeawaysEn: string[];
  takeawaysEs: string[];
  nextStepsEn: string;
  nextStepsEs: string;
};

export type Brand = {
  logoUrl: string;
  firmName: string;
  phone: string;
};

export type Video = {
  id: string;
  slug: string;
  stageId: string;
  automationId: string | null;
  titleEn: string;
  titleEs: string;
  introEn: string;
  introEs: string;
  youtubeUrlEn: string | null;
  youtubeUrlEs: string | null;
  imageUrlEn: string | null;
  imageUrlEs: string | null;
  takeawaysEn: string[];
  takeawaysEs: string[];
  nextStepsEn: string;
  nextStepsEs: string;
  sortOrder: number;
  published: boolean;
};
