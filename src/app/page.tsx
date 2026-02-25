import { db } from "@/lib/db";
import { articles, contentTypeEnum } from "@/lib/db/schema";
import { desc, sql, and, eq, or, ilike } from "drizzle-orm";
import { ArticleList } from "@/components/article-list";
import { SearchBar } from "@/components/search-bar";
import { Pagination } from "@/components/pagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
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
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {total} {total === 1 ? "article" : "articles"}
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
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 sm:px-6">
        <header className="animate-fade-in-down py-12 mb-10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-serif text-4xl tracking-tight text-stone-900 dark:text-stone-100">
              never ending.
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-sm text-stone-400 dark:text-stone-500">
            articles we come across, and find interesting
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

        <Footer />
      </div>
    </ViewProvider>
  );
}
