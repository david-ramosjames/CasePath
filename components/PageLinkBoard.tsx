"use client";

import { useState } from "react";
import { CopyLink } from "@/components/CopyLink";
import { publicSiteUrl } from "@/lib/public-site";

export type PageLink = {
  title: string;
  path: string;
};

function lines(items: PageLink[], lang: "en" | "es") {
  return items
    .map((item) => {
      const url = lang === "es" ? `${publicSiteUrl}${item.path}?lang=es` : `${publicSiteUrl}${item.path}`;
      return `${item.title}\n${url}`;
    })
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

function LinkGroup({ heading, items }: { heading: string; items: PageLink[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3>{heading}</h3>
      <ul className="link-group">
        {items.map((item) => (
          <li key={item.path}>
            <strong>{item.title}</strong>
            <CopyLink label="English" url={`${publicSiteUrl}${item.path}`} />
            <CopyLink label="Spanish" url={`${publicSiteUrl}${item.path}?lang=es`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageLinkBoard({ stages, videos }: { stages: PageLink[]; videos: PageLink[] }) {
  const everything = [...stages, ...videos];
  return (
    <section className="editor-section link-board" id="page-links">
      <h2>Page links</h2>
      <p>
        Copy these into text messages. They use <strong>{publicSiteUrl.replace("https://", "")}</strong>. A Spanish link
        ends in <strong>?lang=es</strong> so the message preview is in Spanish.
      </p>
      <div className="link-actions">
        <CopyBlock label="Copy all links" text={`${lines(stages, "en")}\n\n${lines(stages, "es")}\n\n${lines(videos, "en")}\n\n${lines(videos, "es")}`} />
        <CopyBlock label="Copy English links" text={lines(everything, "en")} />
        <CopyBlock label="Copy Spanish links" text={lines(everything, "es")} />
      </div>
      <LinkGroup heading="Stage pages" items={stages} />
      <LinkGroup heading="Video pages" items={videos} />
    </section>
  );
}
