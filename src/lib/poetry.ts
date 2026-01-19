/**
 * Poetry and essay fetching utilities
 * Uses PoetryDB API for poems and curated essays
 */

export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

export interface Reading {
  type: 'poem' | 'essay';
  title: string;
  author: string;
  content: string[];
  source?: string;
  sourceUrl?: string;
}

// Curated list of classic essays with excerpts (public domain)
const CURATED_ESSAYS: Reading[] = [
  {
    type: 'essay',
    title: 'Self-Reliance',
    author: 'Ralph Waldo Emerson',
    content: [
      'There is a time in every man\'s education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better, for worse, as his portion.',
      'Trust thyself: every heart vibrates to that iron string.',
      'Society everywhere is in conspiracy against the manhood of every one of its members. Society is a joint-stock company, in which the members agree, for the better securing of his bread to each shareholder, to surrender the liberty and culture of the eater.',
      'Whoso would be a man must be a nonconformist. He who would gather immortal palms must not be hindered by the name of goodness, but must explore if it be goodness.',
      'A foolish consistency is the hobgoblin of little minds, adored by little statesmen and philosophers and divines.',
    ],
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/16643',
  },
  {
    type: 'essay',
    title: 'On the Shortness of Life',
    author: 'Seneca',
    content: [
      'It is not that we have a short time to live, but that we waste a lot of it.',
      'Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested.',
      'But when it is wasted in heedless luxury and spent on no good activity, we are forced at last by death\'s final constraint to realize that it has passed away before we knew it was passing.',
      'So it is: we are not given a short life but we make it short, and we are not ill-supplied but wasteful of it.',
      'You act like mortals in all that you fear, and like immortals in all that you desire.',
    ],
    source: 'De Brevitate Vitae (49 AD)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/67617',
  },
  {
    type: 'essay',
    title: 'Walden - Economy',
    author: 'Henry David Thoreau',
    content: [
      'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.',
      'I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary.',
      'I wanted to live deep and suck out all the marrow of life, to live so sturdily and Spartan-like as to put to rout all that was not life.',
      'Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand.',
      'Our life is frittered away by detail. Simplify, simplify.',
    ],
    source: 'Walden (1854)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/205',
  },
  {
    type: 'essay',
    title: 'The Myth of Sisyphus',
    author: 'Albert Camus',
    content: [
      'There is but one truly serious philosophical problem, and that is suicide.',
      'Judging whether life is or is not worth living amounts to answering the fundamental question of philosophy.',
      'The absurd does not liberate; it binds. It does not authorize all actions. Everything is permitted does not mean that nothing is forbidden.',
      'One must imagine Sisyphus happy.',
      'The struggle itself toward the heights is enough to fill a man\'s heart.',
    ],
    source: 'The Myth of Sisyphus (1942)',
  },
  {
    type: 'essay',
    title: 'Of Studies',
    author: 'Francis Bacon',
    content: [
      'Studies serve for delight, for ornament, and for ability.',
      'Their chief use for delight is in privateness and retiring; for ornament, is in discourse; and for ability, is in the judgment and disposition of business.',
      'Read not to contradict and confute; nor to believe and take for granted; nor to find talk and discourse; but to weigh and consider.',
      'Some books are to be tasted, others to be swallowed, and some few to be chewed and digested.',
      'Reading maketh a full man; conference a ready man; and writing an exact man.',
    ],
    source: 'Essays (1597)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/56968',
  },
];

// Curated list of famous poets to fetch from PoetryDB
const FEATURED_POETS = [
  'Emily Dickinson',
  'Robert Frost',
  'William Shakespeare',
  'Walt Whitman',
  'William Blake',
  'John Keats',
  'Percy Bysshe Shelley',
  'William Wordsworth',
  'Edgar Allan Poe',
  'Langston Hughes',
  'Maya Angelou',
  'Sylvia Plath',
  'W.B. Yeats',
  'T.S. Eliot',
  'Rumi',
];

/**
 * Fetch poems from PoetryDB API
 */
export async function fetchPoems(): Promise<Poem[]> {
  try {
    // Fetch poems from multiple featured poets
    const allPoems: Poem[] = [];

    for (const poet of FEATURED_POETS.slice(0, 10)) {
      try {
        const response = await fetch(
          `https://poetrydb.org/author/${encodeURIComponent(poet)}/title,author,lines,linecount`,
          { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        if (response.ok) {
          const poems = await response.json();
          if (Array.isArray(poems)) {
            // Filter to poems with reasonable length (4-50 lines)
            const filtered = poems.filter(
              (p: Poem) => parseInt(p.linecount) >= 4 && parseInt(p.linecount) <= 50
            );
            allPoems.push(...filtered.slice(0, 10)); // Take up to 10 per poet
          }
        }
      } catch {
        // Continue if one poet fails
      }
    }

    return allPoems;
  } catch (error) {
    console.error('Failed to fetch poems:', error);
    return [];
  }
}

/**
 * Get a deterministic daily reading based on the date
 * Same reading for everyone on the same day
 */
export async function getDailyReading(date: Date = new Date()): Promise<Reading> {
  // Create a seed from the date (YYYYMMDD format)
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seed = parseInt(dateStr, 10);

  // Fetch poems
  const poems = await fetchPoems();

  // Combine poems and essays into one collection
  const poemReadings: Reading[] = poems.map((poem) => ({
    type: 'poem' as const,
    title: poem.title,
    author: poem.author,
    content: poem.lines,
    source: 'PoetryDB',
    sourceUrl: 'https://poetrydb.org',
  }));

  const allReadings = [...poemReadings, ...CURATED_ESSAYS];

  // Use the seed to pick a reading deterministically
  const index = seed % allReadings.length;

  return allReadings[index] || CURATED_ESSAYS[0];
}

/**
 * Get curated essays (for fallback or direct access)
 */
export function getEssays(): Reading[] {
  return CURATED_ESSAYS;
}

/**
 * Simple seeded random for deterministic selection
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
