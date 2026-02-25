import type { ContentType } from "@/lib/db/schema";

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;

export function extractUrls(text: string | undefined): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Deduplicate and clean trailing punctuation
  const cleaned = matches.map((u) => u.replace(/[.,;:!?]+$/, ""));
  return [...new Set(cleaned)];
}

const TWEET_HOSTS = [
  "twitter.com",
  "x.com",
  "nitter.net",
  "vxtwitter.com",
  "fxtwitter.com",
];
const VIDEO_HOSTS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "twitch.tv",
  "dailymotion.com",
];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export function detectContentType(url: string): ContentType {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const path = parsed.pathname.toLowerCase();

    if (TWEET_HOSTS.some((h) => host.includes(h))) return "tweet";
    if (VIDEO_HOSTS.some((h) => host.includes(h))) return "video";
    if (path.endsWith(".pdf")) return "pdf";
    if (IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext))) return "image";
    return "article";
  } catch {
    return "other";
  }
}

export interface ParsedMessage {
  url: string | null;
  rawText: string | null;
  contentType: ContentType;
  telegramFileId: string | null;
  telegramFileName: string | null;
}

/**
 * Parse a Telegram message into a structured format.
 * Works with both GramJS and grammY message objects via duck typing.
 */
export function parseMessage(msg: {
  message?: string;
  text?: string;
  caption?: string;
  document?: { id?: string; fileName?: string; file_id?: string; file_name?: string } | null;
}): ParsedMessage {
  const text = msg.message ?? msg.text ?? msg.caption ?? "";
  const urls = extractUrls(text);
  const primaryUrl = urls[0] ?? null;
  const contentType = primaryUrl ? detectContentType(primaryUrl) : "other";

  // Handle document/PDF (supports both GramJS and grammY field names)
  const doc = msg.document;
  let telegramFileId: string | null = null;
  let telegramFileName: string | null = null;
  let finalContentType = contentType;

  if (doc) {
    telegramFileId = (doc.file_id ?? doc.id?.toString()) || null;
    telegramFileName = (doc.file_name ?? doc.fileName) || null;
    if (
      telegramFileName?.toLowerCase().endsWith(".pdf") ||
      finalContentType === "other"
    ) {
      finalContentType = "pdf";
    }
  }

  return {
    url: primaryUrl,
    rawText: text || null,
    contentType: finalContentType,
    telegramFileId,
    telegramFileName,
  };
}
