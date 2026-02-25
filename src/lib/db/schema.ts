import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("content_type", [
  "article",
  "pdf",
  "tweet",
  "video",
  "image",
  "other",
]);

export type ContentType = (typeof contentTypeEnum.enumValues)[number];

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url"),
    title: text("title"),
    description: text("description"),
    imageUrl: text("image_url"),
    siteName: text("site_name"),
    contentType: contentTypeEnum("content_type").notNull().default("other"),
    telegramMessageId: integer("telegram_message_id").notNull(),
    telegramChatId: text("telegram_chat_id").notNull(),
    rawText: text("raw_text"),
    senderName: text("sender_name"),
    forwardedFrom: text("forwarded_from"),
    telegramFileId: text("telegram_file_id"),
    telegramFileName: text("telegram_file_name"),
    localFilePath: text("local_file_path"),
    metadataFetched: boolean("metadata_fetched").notNull().default(false),
    metadataError: text("metadata_error"),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_articles_posted_at").on(table.postedAt),
    index("idx_articles_content_type").on(table.contentType),
    uniqueIndex("idx_articles_chat_msg").on(
      table.telegramChatId,
      table.telegramMessageId
    ),
  ]
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
