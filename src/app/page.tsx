import { getDailyReadings, Reading, Quote } from '@/lib/poetry';
import ExpandableContent from './components/ExpandableContent';

export const revalidate = 3600; // Revalidate every hour

function ReadingSection({ reading, label }: { reading: Reading; label: string }) {
  return (
    <section className="py-12">
      {/* Title & Author */}
      <div className="mb-10">
        <span className="inline-block rounded-full bg-stone-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          {label}
        </span>
        <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
          {reading.title}
        </h2>
        <p className="mt-3 text-lg text-stone-600 dark:text-stone-400">
          by <span className="font-medium text-stone-800 dark:text-stone-200">{reading.author}</span>
        </p>
      </div>

      {/* Content */}
      <article className="prose prose-stone prose-lg dark:prose-invert max-w-none">
        <ExpandableContent
          type={reading.type}
          content={reading.content}
          fullContent={reading.fullContent}
          isTruncated={reading.isTruncated}
        />
      </article>

      {/* Source */}
      {reading.source && (
        <div className="mt-8">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            From{' '}
            {reading.sourceUrl ? (
              <a
                href={reading.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-stone-700 dark:hover:text-stone-300"
              >
                {reading.source}
              </a>
            ) : (
              <span className="italic">{reading.source}</span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}

function QuoteSection({ quote }: { quote: Quote }) {
  return (
    <section className="py-12">
      <div className="mb-10">
        <span className="inline-block rounded-full bg-stone-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          Today&apos;s Courage Quote
        </span>
      </div>
      <blockquote className="border-l-4 border-stone-300 pl-6 dark:border-stone-600">
        <p className="font-serif text-2xl leading-relaxed text-stone-800 dark:text-stone-200 sm:text-3xl">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-4 text-lg text-stone-600 dark:text-stone-400">
          &mdash; <span className="font-medium text-stone-800 dark:text-stone-200">{quote.author}</span>
        </footer>
      </blockquote>
    </section>
  );
}

export default async function Home() {
  const { poem, essay, quote } = await getDailyReadings();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500 dark:text-stone-400">
            {today}
          </p>
          <h1 className="mt-2 font-serif text-2xl text-stone-900 dark:text-stone-100">
            Today&apos;s Reading
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6">
        {/* Today's Courage Quote */}
        <QuoteSection quote={quote} />

        {/* Divider */}
        <div className="border-t border-stone-300 dark:border-stone-700" />

        {/* Today's Poem */}
        <ReadingSection reading={poem} label="Today's Poem" />

        {/* Divider */}
        <div className="border-t border-stone-300 dark:border-stone-700" />

        {/* Today's Essay */}
        <ReadingSection reading={essay} label="Today's Essay" />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-center text-sm text-stone-500 dark:text-stone-400">
            A new quote, poem, and essay every day. Come back tomorrow.
          </p>
        </div>
      </footer>
    </div>
  );
}
