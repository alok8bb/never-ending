"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  }

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-8 pb-16 animate-fade-in">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent transition-colors"
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => goToPage(1)}
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
          >
            1
          </button>
          {start > 2 && (
            <span className="px-1 text-sm text-stone-400">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
            p === page
              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-sm text-stone-400">…</span>
          )}
          <button
            onClick={() => goToPage(totalPages)}
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent transition-colors"
      >
        Next
      </button>
    </div>
  );
}
