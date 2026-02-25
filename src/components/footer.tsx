export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-6 pb-8 flex items-center justify-center text-center text-xs text-stone-400 dark:text-stone-500">
      <span>
        Curated by{" "}
        <a
          href="https://x.com/alok8bb"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          Alok
        </a>
        {" & "}
        <a
          href="https://x.com/shreyanshpa"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          Shreyansh
        </a>
      </span>
    </footer>
  );
}
