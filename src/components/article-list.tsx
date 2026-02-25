"use client";

import type { Article } from "@/lib/db/schema";
import { ArticleCard } from "./article-card";
import { AnimateOnScroll } from "./animate-on-scroll";
import { useView } from "./view-provider";

export function ArticleList({ articles }: { articles: Article[] }) {
  const { view } = useView();

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-stone-500">No articles found</p>
      </div>
    );
  }

  if (view === "expanded") {
    return (
      <div className="sm:columns-2 gap-6 space-y-6">
        {articles.map((article, i) => (
          <AnimateOnScroll key={article.id} delay={(i % 6) * 50}>
            <div className="break-inside-avoid">
              <ArticleCard article={article} index={i} />
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-200/60 dark:divide-stone-800/50">
      {articles.map((article, i) => (
        <AnimateOnScroll key={article.id} delay={(i % 6) * 50}>
          <ArticleCard article={article} index={i} />
        </AnimateOnScroll>
      ))}
    </div>
  );
}
