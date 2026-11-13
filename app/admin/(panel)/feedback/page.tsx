import { createVisitLink } from "@/app/admin/(panel)/feedback/actions";
import { db } from "@/lib/db";

type ViewRow = {
  page_path: string;
  page_label: string;
  case_number: string | null;
  client_name: string | null;
  token_id: string | null;
  created_at: string;
};

type RatingRow = {
  page_path: string;
  page_label: string;
  case_number: string | null;
  client_name: string | null;
  stars: number;
  lang: string;
  created_at: string;
};

export default async function FeedbackDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; url?: string; error?: string }>;
}) {
  const { range, url, error } = await searchParams;
  const days = range === "7" ? 7 : range === "all" ? null : 30;
  const client = db();
  if (!client) {
    return (
      <main className="sheet admin-sheet">
        <p className="form-error">Database is not configured.</p>
      </main>
    );
  }
  const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;
  let viewsQuery = client
    .from("casepath_page_views")
    .select("page_path, page_label, case_number, client_name, token_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  let ratingsQuery = client
    .from("casepath_ratings")
    .select("page_path, page_label, case_number, client_name, stars, lang, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (since) {
    viewsQuery = viewsQuery.gte("created_at", since);
    ratingsQuery = ratingsQuery.gte("created_at", since);
  }
  const [viewsResult, ratingsResult] = await Promise.all([viewsQuery, ratingsQuery]);
  if (viewsResult.error || ratingsResult.error) {
    return (
      <main className="sheet admin-sheet">
        <p className="form-error">{viewsResult.error?.message || ratingsResult.error?.message}</p>
      </main>
    );
  }
  const views = (viewsResult.data ?? []) as ViewRow[];
  const ratings = (ratingsResult.data ?? []) as RatingRow[];
  const linkedViews = views.filter((view) => view.token_id);
  const clients = new Set(linkedViews.map((view) => view.case_number).filter(Boolean));
  const average = ratings.length ? ratings.reduce((sum, row) => sum + row.stars, 0) / ratings.length : 0;
  const pages = new Map<string, { label: string; views: number; linked: number; ratings: number; stars: number }>();
  for (const view of views) {
    const current = pages.get(view.page_path) ?? { label: view.page_label, views: 0, linked: 0, ratings: 0, stars: 0 };
    current.views += 1;
    if (view.token_id) current.linked += 1;
    if (!current.label) current.label = view.page_label;
    pages.set(view.page_path, current);
  }
  for (const rating of ratings) {
    const current = pages.get(rating.page_path) ?? { label: rating.page_label, views: 0, linked: 0, ratings: 0, stars: 0 };
    current.ratings += 1;
    current.stars += rating.stars;
    pages.set(rating.page_path, current);
  }
  const pageRows = [...pages.entries()].sort((a, b) => b[1].views - a[1].views || b[1].ratings - a[1].ratings);
  const windowLabel = days ? `Last ${days} days` : "All time";
  const slackReady = Boolean(process.env.SLACK_BOT_TOKEN?.trim() && process.env.SLACK_FEEDBACK_CHANNEL_ID?.trim());

  return (
    <main className="sheet admin-sheet">
      <h1>Page feedback</h1>
      <p>
        {windowLabel}. A visit counts when someone opens a page. A linked visit is one that arrived from a text with a
        client token.
      </p>
      <p className="range-links">
        <a href="/admin/feedback?range=7" aria-current={days === 7 ? "page" : undefined}>
          7 days
        </a>
        <a href="/admin/feedback?range=30" aria-current={days === 30 ? "page" : undefined}>
          30 days
        </a>
        <a href="/admin/feedback?range=all" aria-current={days == null ? "page" : undefined}>
          All
        </a>
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      {url ? (
        <p className="form-ok">
          Client link: <a href={url}>{url}</a>
        </p>
      ) : null}
      {!slackReady ? (
        <p className="form-error">Slack alerts are off until SLACK_BOT_TOKEN and SLACK_FEEDBACK_CHANNEL_ID are set.</p>
      ) : (
        <p className="form-ok">
          Ratings also post to the mapped case Slack channel when one exists. Sentiment Scout will join public channels
          automatically; private channels still need a one-time invite.
        </p>
      )}

      <div className="stat-row">
        <p>
          <strong>{views.length}</strong>
          <span>Page views</span>
        </p>
        <p>
          <strong>{linkedViews.length}</strong>
          <span>Linked visits</span>
        </p>
        <p>
          <strong>{clients.size}</strong>
          <span>Clients</span>
        </p>
        <p>
          <strong>{ratings.length ? average.toFixed(1) : "—"}</strong>
          <span>Average of {ratings.length} ratings</span>
        </p>
      </div>

      <section className="editor-section">
        <h2>By page</h2>
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Views</th>
              <th>Linked</th>
              <th>Ratings</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5}>No visits in this window.</td>
              </tr>
            ) : (
              pageRows.map(([path, row]) => (
                <tr key={path}>
                  <td>
                    {row.label}
                    <span>{path}</span>
                  </td>
                  <td>{row.views}</td>
                  <td>{row.linked}</td>
                  <td>{row.ratings}</td>
                  <td>{row.ratings ? (row.stars / row.ratings).toFixed(1) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="editor-section">
        <h2>Recent ratings</h2>
        <table className="feedback-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Page</th>
              <th>Client</th>
              <th>Stars</th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={4}>No ratings yet.</td>
              </tr>
            ) : (
              ratings.slice(0, 40).map((rating, index) => (
                <tr key={`${rating.created_at}-${rating.page_path}-${index}`}>
                  <td>{new Date(rating.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}</td>
                  <td>
                    {rating.page_label}
                    <span>{rating.page_path}</span>
                  </td>
                  <td>{rating.client_name ? `${rating.client_name}${rating.case_number ? ` · #${rating.case_number}` : ""}` : "No client link"}</td>
                  <td>{rating.stars}/5</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="editor-section">
        <h2>Client text link</h2>
        <p>
          Case Tracker calls <code>POST /api/visit-tokens</code> with <code>Authorization: Bearer
          CASEPATH_TOKEN_SECRET</code> and{" "}
          <code>{`{ "caseNumber": "153", "path": "/v/welcome", "phone": "+15125550100", "lang": "en" }`}</code> when it
          builds the Quo text. The response URL is what goes in the message.
        </p>
        <form action={createVisitLink} className="stage-row">
          <label>
            Case number
            <input name="caseNumber" required />
          </label>
          <label>
            Page path
            <input name="path" defaultValue="/s/getting-started" required />
          </label>
          <button className="contact compact" type="submit">
            Create link
          </button>
        </form>
      </section>
    </main>
  );
}
