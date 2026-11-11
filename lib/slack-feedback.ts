export async function notifyRating(input: {
  stars: number;
  pageLabel: string;
  pagePath: string;
  clientName: string | null;
  caseNumber: string | null;
}) {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const channel = process.env.SLACK_FEEDBACK_CHANNEL_ID?.trim();
  if (!token || !channel) return false;
  const who = input.clientName
    ? `${input.clientName}${input.caseNumber ? ` · #${input.caseNumber}` : ""}`
    : "No client link";
  const text = [`*CasePath rating: ${input.stars}/5*`, input.pageLabel, who, input.pagePath].join("\n");
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, text }),
    });
    const body = (await response.json()) as { ok?: boolean };
    return Boolean(body.ok);
  } catch (error) {
    console.error("slack rating", error);
    return false;
  }
}
