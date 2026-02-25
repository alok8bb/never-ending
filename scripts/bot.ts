import "dotenv/config";
import { Bot } from "grammy";
import { db } from "../src/lib/db";
import { articles } from "../src/lib/db/schema";
import { parseMessage } from "../src/lib/telegram/parser";
import { fetchMetadata } from "../src/lib/telegram/metadata";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL = process.env.TELEGRAM_CHANNEL!;
const FILES_DIR = path.join(process.cwd(), "data", "files");

if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.on("channel_post", async (ctx) => {
  const msg = ctx.channelPost;
  const chatId = msg.chat.id.toString();

  // Only process messages from our channel
  const channelId = CHANNEL.startsWith("-") ? CHANNEL : undefined;
  const channelUsername = CHANNEL.startsWith("-") ? undefined : CHANNEL;

  if (channelId && chatId !== channelId) return;
  if (
    channelUsername &&
    msg.chat.type === "channel" &&
    "username" in msg.chat &&
    msg.chat.username !== channelUsername
  )
    return;

  const text = msg.text ?? msg.caption ?? "";
  const parsed = parseMessage({
    text,
    document: msg.document
      ? {
          file_id: msg.document.file_id,
          file_name: msg.document.file_name,
        }
      : null,
  });

  // Skip text-only messages (no URL, no file)
  if (!parsed.url && !parsed.telegramFileId) return;

  // Download file locally if present
  let localFilePath: string | null = null;
  if (parsed.telegramFileId) {
    try {
      fs.mkdirSync(FILES_DIR, { recursive: true });
      const file = await bot.api.getFile(parsed.telegramFileId);
      const filePath = file.file_path!;
      const ext = path.extname(parsed.telegramFileName ?? filePath) || "";
      const localName = `${randomUUID()}${ext}`;
      const localPath = path.join(FILES_DIR, localName);

      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
      const resp = await fetch(fileUrl);
      if (resp.ok) {
        const buffer = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        localFilePath = `data/files/${localName}`;
        console.log(`Downloaded file: ${localFilePath}`);
      }
    } catch (err) {
      console.error(`Failed to download file for message ${msg.message_id}:`, err);
    }
  }

  // Get forward info
  let forwardedFrom: string | null = null;
  if (msg.forward_origin) {
    const origin = msg.forward_origin;
    if (origin.type === "user") {
      forwardedFrom = [origin.sender_user.first_name, origin.sender_user.last_name]
        .filter(Boolean)
        .join(" ");
    } else if (origin.type === "channel") {
      forwardedFrom = origin.chat.title;
    } else if (origin.type === "hidden_user") {
      forwardedFrom = origin.sender_user_name;
    }
  }

  // Fetch OG metadata
  let title: string | null = null;
  let description: string | null = null;
  let imageUrl: string | null = null;
  let siteName: string | null = null;
  let metadataFetched = false;
  let metadataError: string | null = null;

  if (parsed.url) {
    try {
      const meta = await fetchMetadata(parsed.url);
      title = meta.title;
      description = meta.description;
      imageUrl = meta.imageUrl;
      siteName = meta.siteName;
      metadataFetched = true;
    } catch (err) {
      metadataError = String(err);
    }
  }

  try {
    await db
      .insert(articles)
      .values({
        url: parsed.url,
        title,
        description,
        imageUrl,
        siteName,
        contentType: parsed.contentType,
        telegramMessageId: msg.message_id,
        telegramChatId: chatId,
        rawText: parsed.rawText,
        senderName: msg.author_signature ?? msg.sender_chat?.title ?? null,
        forwardedFrom,
        telegramFileId: parsed.telegramFileId,
        telegramFileName: parsed.telegramFileName,
        localFilePath,
        metadataFetched,
        metadataError,
        postedAt: new Date(msg.date * 1000),
      })
      .onConflictDoNothing({
        target: [articles.telegramChatId, articles.telegramMessageId],
      });

    console.log(
      `Saved message ${msg.message_id}: ${parsed.url ?? "(no url)"}`
    );
  } catch (err) {
    console.error(`Failed to save message ${msg.message_id}:`, err);
  }
});

console.log(`Bot starting... Listening for posts in channel: ${CHANNEL}`);
bot.start();
