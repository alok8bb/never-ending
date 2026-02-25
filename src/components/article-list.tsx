"use client";

import type { Article } from "@/lib/db/schema";
import { ArticleCard } from "./article-card";
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
      <div className="flex flex-col gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-200/60 dark:divide-stone-800/50">
      {articles.map((article, i) => (
        <ArticleCard key={article.id} article={article} index={i} />
      ))}
    </div>
  );
}
