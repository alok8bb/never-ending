"use client";

import type { Article } from "@/lib/db/schema";
import { useView } from "./view-provider";


const PLACEHOLDER_COLORS: Record<string, string> = {
  article: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  pdf: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  tweet: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  video: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  image: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  other: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
};

function formatSource(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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
  const title = article.title ?? article.rawText?.slice(0, 120) ?? "Untitled";
  const author = getAuthor(article);
  const href = getLink(article);
  const isExternal = href?.startsWith("http");

  if (view === "expanded") {
    const content = (
      <div className="group overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 transition-all duration-200 hover:shadow-md">
        {article.imageUrl ? (
          <div className="overflow-hidden">
            <img
              src={article.imageUrl}
              alt=""
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`flex aspect-video w-full items-center justify-center text-sm font-medium uppercase tracking-wide ${PLACEHOLDER_COLORS[article.contentType] ?? PLACEHOLDER_COLORS.other}`}
          >
            {formatSource(article.contentType)}
          </div>
        )}
        <div className="p-3.5">
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
            {author && <span className="truncate">{author}</span>}
            <span>·</span>
            <time>{formatDate(article.postedAt)}</time>
          </div>
          <h3 className="mt-2 font-serif text-lg font-normal leading-snug text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
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
    <div className="group flex items-center gap-4 py-5">
      {article.imageUrl && (
        <div
          className="flex-none rounded-md w-20 h-14 md:w-72 md:h-36 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.imageUrl})` }}
          role="img"
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
          {author && <span className="truncate">{author}</span>}
          <span>·</span>
          <time>{formatDate(article.postedAt)}</time>
        </div>
        <h3 className="mt-1 font-serif text-lg font-normal leading-snug tracking-[0.01em] text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
          {title}
        </h3>
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
