"use client";

import { useState } from "react";
import { CopyLink } from "@/components/CopyLink";
import { publicSiteUrl } from "@/lib/public-site";

export type PageLink = {
  title: string;
  path: string;
};

export type SectionLinks = PageLink & {
  videos: PageLink[];
};

function url(path: string, lang: "en" | "es") {
  return lang === "es" ? `${publicSiteUrl}${path}?lang=es` : `${publicSiteUrl}${path}`;
}

function lines(sections: SectionLinks[], lang: "en" | "es") {
  return sections
    .flatMap((section) => [section, ...section.videos])
    .map((item) => `${item.title}\n${url(item.path, lang)}`)
    .join("\n\n");
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="contact compact"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function LinkRow({ title, path }: PageLink) {
  return (
    <div className="link-row">
      <span className="link-title">{title}</span>
      <CopyLink label="EN" url={url(path, "en")} />
      <CopyLink label="ES" url={url(path, "es")} />
    </div>
  );
}

export function PageLinkBoard({ sections }: { sections: SectionLinks[] }) {
  return (
    <section className="editor-section link-board" id="page-links">
      <h2>Page links</h2>
      <p>
        Copy these into text messages. They use <strong>{publicSiteUrl.replace("https://", "")}</strong>. Spanish links
        end in <strong>?lang=es</strong>.
      </p>
      <div className="link-actions">
        <CopyBlock label="Copy all links" text={`${lines(sections, "en")}\n\n${lines(sections, "es")}`} />
        <CopyBlock label="Copy English links" text={lines(sections, "en")} />
        <CopyBlock label="Copy Spanish links" text={lines(sections, "es")} />
      </div>
      {sections.map((section) => (
        <div className="link-stage" key={section.path}>
          <h3>{section.title}</h3>
          <LinkRow title="Stage page" path={section.path} />
          {section.videos.map((video) => (
            <LinkRow key={video.path} title={video.title} path={video.path} />
          ))}
        </div>
      ))}
    </section>
  );
}
