import { getDailyReading } from '@/lib/poetry';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const reading = await getDailyReading();
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
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Title & Author */}
        <div className="mb-10">
          <span className="inline-block rounded-full bg-stone-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-stone-600 dark:bg-stone-800 dark:text-stone-400">
            {reading.type}
          </span>
          <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            {reading.title}
          </h2>
          <p className="mt-3 text-lg text-stone-600 dark:text-stone-400">
            by <span className="font-medium text-stone-800 dark:text-stone-200">{reading.author}</span>
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-stone prose-lg dark:prose-invert max-w-none">
          {reading.type === 'poem' ? (
            <div className="space-y-1 font-serif text-xl leading-relaxed">
              {reading.content.map((line, index) => (
                <p key={index} className={line === '' ? 'h-6' : 'my-0'}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-6 font-serif text-xl leading-relaxed">
              {reading.content.map((paragraph, index) => (
                <p key={index} className="text-stone-700 dark:text-stone-300">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </article>

        {/* Source */}
        {reading.source && (
          <footer className="mt-12 border-t border-stone-200 pt-6 dark:border-stone-800">
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
          </footer>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-center text-sm text-stone-500 dark:text-stone-400">
            A new reading every day. Come back tomorrow.
          </p>
        </div>
      </footer>
    </div>
  );
}
