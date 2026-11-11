"use client";

import { useState } from "react";
import type { Lang } from "@/lib/types";

const labels = {
  en: ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"],
  es: ["1 estrella", "2 estrellas", "3 estrellas", "4 estrellas", "5 estrellas"],
};

export function ExperienceRating({
  lang,
  token,
  pagePath,
  pageLabel,
  initialStars,
}: {
  lang: Lang;
  token: string | null;
  pagePath: string;
  pageLabel: string;
  initialStars: number | null;
}) {
  const es = lang === "es";
  const [stars, setStars] = useState(initialStars);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const prompt = es ? "¿Cómo ha sido su experiencia con nosotros?" : "How has your experience with us been?";
  const hint = es ? "Toque de 1 a 5 estrellas." : "Tap 1 to 5 stars.";

  async function choose(value: number) {
    if (pending) return;
    setPending(value);
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: value, path: pagePath, label: pageLabel, lang, token }),
      });
      if (!response.ok) throw new Error("save failed");
      setStars(value);
    } catch {
      setError(es ? "No se pudo guardar. Inténtelo de nuevo." : "That did not save. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="experience" aria-labelledby="experience-prompt">
      <h2 id="experience-prompt">{prompt}</h2>
      <p>{stars ? (es ? "Gracias." : "Thank you.") : hint}</p>
      <div className="stars" role="radiogroup" aria-label={prompt}>
        {labels[lang].map((name, index) => {
          const value = index + 1;
          const on = stars != null && value <= stars;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={stars === value}
              aria-label={name}
              className={on ? "star on" : "star"}
              disabled={pending != null}
              onClick={() => choose(value)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.2 14.7 9l6.3.6-4.8 4.1 1.5 6.1L12 16.8 6.3 19.8 7.8 13.7 3 9.6 9.3 9 12 3.2Z" />
              </svg>
            </button>
          );
        })}
      </div>
      {error ? <p className="experience-error">{error}</p> : null}
    </section>
  );
}
