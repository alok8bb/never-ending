const QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "I cannot live without books.", author: "Thomas Jefferson" },
  { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "Rene Descartes" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
  { text: "Reading furnishes the mind only with materials of knowledge; it is thinking that makes what we read ours.", author: "John Locke" },
  { text: "The only thing you absolutely have to know, is the location of the library.", author: "Albert Einstein" },
  { text: "Think before you speak. Read before you think.", author: "Fran Lebowitz" },
  { text: "Reading is a discount ticket to everywhere.", author: "Mary Schmich" },
  { text: "In the case of good books, the point is not to see how many of them you can get through, but how many can get through to you.", author: "Mortimer J. Adler" },
  { text: "Reading brings us unknown friends.", author: "Honore de Balzac" },
  { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", author: "Harper Lee" },
];

function getDailyIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % QUOTES.length;
}

export function DailyQuote() {
  const quote = QUOTES[getDailyIndex()];
  return (
    <p className="max-w-md text-center text-xs italic text-stone-400/80 dark:text-stone-500/80">
      &ldquo;{quote.text}&rdquo; — <span className="not-italic">{quote.author}</span>
    </p>
  );
}
