import { DailyQuote } from "./daily-quote";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-6 pb-8 flex flex-col items-center gap-3 text-center text-xs text-stone-400 dark:text-stone-500">
      <DailyQuote />
      <span>curated by Alok & Shreyansh</span>
    </footer>
  );
}
