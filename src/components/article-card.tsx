"use client";

import type { Article } from "@/lib/db/schema";
import { useView } from "./view-provider";

const SOURCE_COLORS: Record<string, string> = {
  twitter: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  arxiv: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  substack: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  youtube: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  github: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
  default: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

const PLACEHOLDER_COLORS: Record<string, string> = {
  article: "bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400",
  pdf: "bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400",
  tweet: "bg-sky-200 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400",
  video: "bg-purple-200 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400",
  image: "bg-green-200 dark:bg-green-900/50 text-green-700 dark:text-green-400",
  other: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
};

function formatSource(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function getSource(article: Article): string {
  if (article.contentType === "tweet") return "twitter";
  if (article.contentType === "pdf") return "pdf";
  if (article.contentType === "video") return "youtube";
  if (!article.url) return article.contentType;
  try {
    const host = new URL(article.url).hostname.replace("www.", "");
    if (host.includes("x.com") || host.includes("twitter.com")) return "twitter";
    if (host.includes("arxiv.org")) return "arxiv";
    if (host.includes("substack.com")) return "substack";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("github.com")) return "github";
    return host.split(".").slice(-2, -1)[0] ?? article.contentType;
  } catch {
    return article.contentType;
  }
}

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

function getLink(article: Article): string | null {
  if (article.url) return article.url;
  if (article.localFilePath) return `/api/files/${article.id}`;
  return null;
}

function getAuthor(article: Article): string | null {
  if (article.forwardedFrom) return article.forwardedFrom;
  if (article.contentType === "tweet" && article.description) {
    return article.description;
  }
  return article.siteName ?? null;
}

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const { view } = useView();
  const source = getSource(article);
  const title = article.title ?? article.rawText?.slice(0, 120) ?? "Untitled";
  const author = getAuthor(article);
  const sourceColor = SOURCE_COLORS[source] ?? SOURCE_COLORS.default;
  const href = getLink(article);
  const isExternal = href?.startsWith("http");

  const sourceBadge = (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sourceColor}`}
    >
      {formatSource(source)}
    </span>
  );

  const animationStyle = { animationDelay: `${index * 50}ms` };

  if (view === "expanded") {
    const content = (
      <div
        className="group animate-fade-in-up overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 transition-all duration-200 hover:shadow-lg hover:border-stone-300 dark:hover:border-stone-700"
        style={animationStyle}
      >
        {article.imageUrl ? (
          <div className="overflow-hidden">
            <img
              src={article.imageUrl}
              alt=""
              className="aspect-[2/1] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`flex aspect-[2/1] w-full items-center justify-center text-sm font-medium uppercase tracking-wide ${PLACEHOLDER_COLORS[article.contentType] ?? PLACEHOLDER_COLORS.other}`}
          >
            {formatSource(article.contentType)}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
            {sourceBadge}
            {author && <span className="truncate">{author}</span>}
            <span>·</span>
            <time>{timeAgo(article.postedAt)}</time>
          </div>
          <h3 className="mt-2 font-serif text-lg font-normal leading-relaxed text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
            {title}
          </h3>
          {article.description && article.contentType !== "tweet" && (
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
              {article.description}
            </p>
          )}
        </div>
      </div>
    );

    if (href) {
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="block"
        >
          {content}
        </a>
      );
    }

    return content;
  }

  // Compact view
  const content = (
    <div
      className="group flex items-center gap-4 py-4 animate-fade-in-up"
      style={animationStyle}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
          {sourceBadge}
          {author && <span className="truncate">{author}</span>}
          <span>·</span>
          <time>{timeAgo(article.postedAt)}</time>
        </div>
        <h3 className="mt-1 font-serif text-base font-normal leading-relaxed text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
          {title}
        </h3>
      </div>
      {article.imageUrl && (
        <div className="overflow-hidden rounded-md shrink-0">
          <img
            src={article.imageUrl}
            alt=""
            className="size-20 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
