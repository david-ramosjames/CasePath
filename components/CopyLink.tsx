"use client";

import { useState } from "react";

export function CopyLink({ url, label = "Texting link" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-link">
      {label ? <span className="copy-label">{label}</span> : null}
      <input readOnly value={url} aria-label={label} onFocus={(event) => event.currentTarget.select()} />
      <button
        type="button"
        className="contact compact"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
