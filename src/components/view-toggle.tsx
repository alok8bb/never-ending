"use client";

import { useView } from "./view-provider";

export function ViewToggle() {
  const { view, setView } = useView();

  return (
    <div className="inline-flex items-center rounded-lg border border-stone-200 dark:border-stone-700 p-0.5">
      <button
        onClick={() => setView("compact")}
        aria-label="Compact view"
        className={`rounded-md p-1.5 transition-colors ${
          view === "compact"
            ? "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        }`}
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => setView("expanded")}
        aria-label="Expanded view"
        className={`rounded-md p-1.5 transition-colors ${
          view === "expanded"
            ? "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        }`}
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </button>
    </div>
  );
}
