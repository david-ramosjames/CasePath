export function NextSteps({ title, body }: { title: string; body: string }) {
  return (
    <section className="next">
      <span className="next-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3.5v3M16 3.5v3M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </section>
  );
}
