"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang, Stage } from "@/lib/types";

export function StageTracker({
  lang,
  stages,
  viewingIndex,
}: {
  lang: Lang;
  stages: Stage[];
  viewingIndex: number;
}) {
  const scroller = useRef<HTMLElement>(null);
  const [more, setMore] = useState(false);
  const [progress, setProgress] = useState(0);
  const es = lang === "es";

  function measure() {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setMore(max > 8 && el.scrollLeft < max - 4);
    setProgress(max <= 0 ? 100 : ((el.scrollLeft + el.clientWidth) / el.scrollWidth) * 100);
  }

  useEffect(() => {
    const el = scroller.current;
    const active = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el && active) {
      const elBox = el.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      const contentLeft = activeBox.left - elBox.left + el.scrollLeft;
      const left = contentLeft - (el.clientWidth - activeBox.width) / 2;
      el.scrollTo({ left: Math.max(0, left) });
    }
    measure();
  }, [viewingIndex, lang, stages.length]);

  return (
    <div className="tracker-block">
      <p className="journey">{es ? "El proceso de su caso" : "Your case journey"}</p>
      <div className={more ? "tracker-fade more" : "tracker-fade"}>
        <nav
          ref={scroller}
          className="tracker"
          aria-label={es ? "Temas del caso" : "Case topics"}
          onScroll={measure}
        >
          {stages.map((stage, index) => {
            const label = es ? stage.labelEs : stage.labelEn;
            const active = index === viewingIndex;
            return (
              <a
                key={stage.id}
                className={active ? "stage active" : stage.optional ? "stage optional" : "stage"}
                href={`/s/${stage.id}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="num">{index + 1}</span>
                <span className="stage-label">{label}</span>
                {stage.optional ? <span className="stage-note">{es ? "Si hace falta" : "If needed"}</span> : null}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="tracker-meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
