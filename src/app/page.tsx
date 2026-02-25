import { db } from "@/lib/db";
import { articles, contentTypeEnum } from "@/lib/db/schema";
import { desc, sql, and, eq, or, ilike } from "drizzle-orm";
import { ArticleList } from "@/components/article-list";
import { SearchBar } from "@/components/search-bar";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViewProvider } from "@/components/view-provider";
import { ViewToggle } from "@/components/view-toggle";
import { Suspense } from "react";

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ArticlesContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Math.max(1, parseInt((searchParams.page as string) ?? "1"));
  const search =
    ((searchParams.search as string) ?? "").trim() || null;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(articles.title, `%${search}%`),
        ilike(articles.rawText, `%${search}%`),
        ilike(articles.description, `%${search}%`),
        ilike(articles.url, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(where)
      .orderBy(desc(articles.postedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(where),
  ]);

  const total = Number(countResult[0].count);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
          <span>{total} {total === 1 ? "read" : "reads"}</span>
          <span className="relative group/tip cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5 text-stone-400 dark:text-stone-500">
              <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
            </svg>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-md bg-stone-800 dark:bg-stone-200 px-3 py-2 text-[11px] leading-snug text-stone-100 dark:text-stone-800 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 text-center">
              Titles are sourced from OpenGraph metadata and may not always be accurate.
            </span>
          </span>
        </p>
        <ViewToggle />
      </div>
      <ArticleList articles={rows} />
      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <ViewProvider>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
        <header className="animate-fade-in-down py-8 mb-2">
          <div className="flex items-center justify-between mb-1">
            <a href="/" className="font-serif text-4xl tracking-tight text-stone-900 dark:text-stone-100">
              <h1>never ending.</h1>
            </a>
            <ThemeToggle />
          </div>
          <p className="text-sm text-stone-400 dark:text-stone-500">
            Things worth reading, curated by{" "}
            <a href="https://x.com/shreyanshpa" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Shreyansh</a>
            {" & "}
            <a href="https://x.com/alok8bb" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Alok</a>
          </p>
          <hr className="mt-6 border-stone-200 dark:border-stone-800" />
        </header>

        <div className="flex-1">
          <div className="mb-8">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4">
            <Suspense
              fallback={
                <div className="space-y-4 pt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded bg-stone-100 dark:bg-stone-800/50"
                    />
                  ))}
                </div>
              }
            >
              <ArticlesContent searchParams={params} />
            </Suspense>
          </div>
        </div>

      </div>
    </ViewProvider>
  );
}
