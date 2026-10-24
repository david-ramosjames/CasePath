"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-link">
      <input readOnly value={url} aria-label="Texting link" />
      <button
        type="button"
        className="contact compact"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
