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
    <div className="flex items-center justify-center gap-1 pt-10 animate-fade-in">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="rounded-md px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => goToPage(1)}
            className="rounded-md px-2.5 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
          >
            1
          </button>
          {start > 2 && (
            <span className="px-1 text-xs text-stone-400">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
            p === page
              ? "bg-stone-200 dark:bg-stone-800 font-medium text-stone-900 dark:text-stone-100"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-xs text-stone-400">…</span>
          )}
          <button
            onClick={() => goToPage(totalPages)}
            className="rounded-md px-2.5 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        next
      </button>
    </div>
  );
}
