import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import bigInt from "big-integer";
import { db } from "../src/lib/db";
import { articles } from "../src/lib/db/schema";
import { parseMessage } from "../src/lib/telegram/parser";
import { fetchMetadata } from "../src/lib/telegram/metadata";
import * as readline from "readline";

const API_ID = parseInt(process.env.TELEGRAM_API_ID!);
const API_HASH = process.env.TELEGRAM_API_HASH!;
const SESSION = process.env.TELEGRAM_SESSION || "";
const CHANNEL = process.env.TELEGRAM_CHANNEL!;

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const session = new StringSession(SESSION);
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: () => prompt("Phone number: "),
    password: () => prompt("2FA password (if any): "),
    phoneCode: () => prompt("OTP code: "),
    onError: (err) => console.error("Auth error:", err),
  });

  // Save session for reuse
  const savedSession = client.session.save() as unknown as string;
  console.log("\n=== Save this session string to TELEGRAM_SESSION env var ===");
  console.log(savedSession);
  console.log("=============================================================\n");

  // Resolve channel entity
  const entity = await client.getEntity(CHANNEL);
  const chatId = entity.id.toString();
  console.log(`Fetching history from channel: ${CHANNEL} (ID: ${chatId})`);

  let offsetId = 0;
  let total = 0;
  const BATCH_SIZE = 100;

  while (true) {
    const history = await client.invoke(
      new Api.messages.GetHistory({
        peer: entity,
        offsetId,
        limit: BATCH_SIZE,
        addOffset: 0,
        maxId: 0,
        minId: 0,
        hash: bigInt(0),
      })
    );

    if (!("messages" in history) || history.messages.length === 0) break;

    const messages = history.messages as Api.Message[];

    for (const msg of messages) {
      if (!msg.message && !msg.media) continue;

      const parsed = parseMessage({
        message: msg.message,
        document: msg.media instanceof Api.MessageMediaDocument &&
          msg.media.document instanceof Api.Document
          ? {
              id: msg.media.document.id.toString(),
              fileName:
                (
                  msg.media.document.attributes.find(
                    (a): a is Api.DocumentAttributeFilename =>
                      a instanceof Api.DocumentAttributeFilename
                  ) as Api.DocumentAttributeFilename | undefined
                )?.fileName ?? undefined,
            }
          : null,
      });

      // Skip text-only messages (no URL, no file)
      if (!parsed.url && !parsed.telegramFileId) continue;

      // Get sender info
      let senderName: string | null = null;
      if (msg.fromId) {
        try {
          const sender = await client.getEntity(msg.fromId);
          if ("firstName" in sender) {
            senderName = [sender.firstName, sender.lastName]
              .filter(Boolean)
              .join(" ");
          } else if ("title" in sender) {
            senderName = sender.title;
          }
        } catch {
          // ignore
        }
      }

      // Get forwarded from info
      let forwardedFrom: string | null = null;
      if (msg.fwdFrom?.fromName) {
        forwardedFrom = msg.fwdFrom.fromName;
      } else if (msg.fwdFrom?.fromId) {
        try {
          const fwdEntity = await client.getEntity(msg.fwdFrom.fromId);
          if ("title" in fwdEntity) {
            forwardedFrom = fwdEntity.title;
          } else if ("firstName" in fwdEntity) {
            forwardedFrom = [fwdEntity.firstName, fwdEntity.lastName]
              .filter(Boolean)
              .join(" ");
          }
        } catch {
          // ignore
        }
      }

      // Fetch OG metadata if URL exists
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
        // Rate limit between metadata fetches
        await new Promise((r) => setTimeout(r, 500));
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
            telegramMessageId: msg.id,
            telegramChatId: chatId,
            rawText: parsed.rawText,
            senderName,
            forwardedFrom,
            telegramFileId: parsed.telegramFileId,
            telegramFileName: parsed.telegramFileName,
            metadataFetched,
            metadataError,
            postedAt: new Date(msg.date * 1000),
          })
          .onConflictDoNothing({
            target: [articles.telegramChatId, articles.telegramMessageId],
          });

        total++;
      } catch (err) {
        console.error(`Failed to insert message ${msg.id}:`, err);
      }
    }

    const lastMsg = messages[messages.length - 1];
    offsetId = lastMsg.id;
    console.log(`Processed ${total} messages so far (offset: ${offsetId})`);
  }

  console.log(`\nDone! Inserted ${total} messages total.`);
  await client.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
