import { db } from "@/lib/db";

type SlackApiResult = {
  ok?: boolean;
  error?: string;
  channel?: string;
  ts?: string;
};

async function slackApi(token: string, method: string, body: Record<string, unknown>): Promise<SlackApiResult> {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return (await response.json().catch(() => ({}))) as SlackApiResult;
}

/** Public channels only — private case channels still need a manual invite for Sentiment Scout. */
async function joinChannel(token: string, channel: string) {
  const joined = await slackApi(token, "conversations.join", { channel });
  if (joined.ok || joined.error === "already_in_channel") return true;
  if (
    joined.error === "method_not_supported_for_channel_type" ||
    joined.error === "channel_not_found" ||
    joined.error === "missing_scope" ||
    joined.error === "is_archived"
  ) {
    console.warn("slack join", channel, joined.error);
    return false;
  }
  console.warn("slack join", channel, joined.error ?? "failed");
  return false;
}

async function postMessage(token: string, channel: string, text: string) {
  const posted = await slackApi(token, "chat.postMessage", {
    channel,
    text,
    unfurl_links: false,
  });
  if (posted.ok) return true;

  if (posted.error === "not_in_channel") {
    const joined = await joinChannel(token, channel);
    if (!joined) return false;
    const retry = await slackApi(token, "chat.postMessage", {
      channel,
      text,
      unfurl_links: false,
    });
    if (retry.ok) return true;
    console.warn("slack post", channel, retry.error ?? "failed");
    return false;
  }

  console.warn("slack post", channel, posted.error ?? "failed");
  return false;
}

async function caseChannelId(caseNumber: string | null) {
  const key = caseNumber?.trim() ?? "";
  if (!key) return null;
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("case_slack_channels")
    .select("slack_channel_id")
    .eq("case_number", key)
    .maybeSingle();
  if (error) {
    console.warn("case slack channel", error.message);
    return null;
  }
  const id = typeof data?.slack_channel_id === "string" ? data.slack_channel_id.trim() : "";
  return id || null;
}

export async function notifyRating(input: {
  stars: number;
  pageLabel: string;
  pagePath: string;
  clientName: string | null;
  caseNumber: string | null;
}) {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const feedbackChannel = process.env.SLACK_FEEDBACK_CHANNEL_ID?.trim();
  if (!token || !feedbackChannel) return false;

  const who = input.clientName
    ? `${input.clientName}${input.caseNumber ? ` · #${input.caseNumber}` : ""}`
    : "No client link";
  const text = [`*CasePath rating: ${input.stars}/5*`, input.pageLabel, who, input.pagePath].join("\n");

  try {
    const feedbackOk = await postMessage(token, feedbackChannel, text);
    const caseChannel = await caseChannelId(input.caseNumber);
    if (caseChannel && caseChannel !== feedbackChannel) {
      await postMessage(token, caseChannel, text);
    }
    return feedbackOk;
  } catch (error) {
    console.error("slack rating", error);
    return false;
  }
}
