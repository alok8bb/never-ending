CREATE TYPE "public"."content_type" AS ENUM('article', 'pdf', 'tweet', 'video', 'image', 'other');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text,
	"title" text,
	"description" text,
	"image_url" text,
	"site_name" text,
	"content_type" "content_type" DEFAULT 'other' NOT NULL,
	"telegram_message_id" integer NOT NULL,
	"telegram_chat_id" text NOT NULL,
	"raw_text" text,
	"sender_name" text,
	"forwarded_from" text,
	"telegram_file_id" text,
	"telegram_file_name" text,
	"metadata_fetched" boolean DEFAULT false NOT NULL,
	"metadata_error" text,
	"posted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_articles_posted_at" ON "articles" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "idx_articles_content_type" ON "articles" USING btree ("content_type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_articles_chat_msg" ON "articles" USING btree ("telegram_chat_id","telegram_message_id");