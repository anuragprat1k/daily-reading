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

// Essay metadata - we fetch full text dynamically from Wikisource
interface EssayMetadata {
  title: string;
  author: string;
  wikisourceTitle: string; // The exact Wikisource page title
  source: string;
  sourceUrl?: string;
}

const ESSAY_CATALOG: EssayMetadata[] = [
  // Short classic essays that work well for daily reading
  {
    title: 'Self-Reliance',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_First_Series/Self-Reliance',
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_First_Series/Self-Reliance',
  },
  {
    title: 'On the Shortness of Life',
    author: 'Seneca',
    wikisourceTitle: 'On_the_shortness_of_life',
    source: 'De Brevitate Vitae (49 AD)',
    sourceUrl: 'https://en.wikisource.org/wiki/On_the_shortness_of_life',
  },
  {
    title: 'Civil Disobedience',
    author: 'Henry David Thoreau',
    wikisourceTitle: 'Civil_Disobedience',
    source: 'Resistance to Civil Government (1849)',
    sourceUrl: 'https://en.wikisource.org/wiki/Civil_Disobedience',
  },
  {
    title: 'Of Studies',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/L_Of_Studies',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/L_Of_Studies',
  },
  {
    title: 'Of Truth',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/I_Of_Truth',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/I_Of_Truth',
  },
  {
    title: 'A Modest Proposal',
    author: 'Jonathan Swift',
    wikisourceTitle: 'A_Modest_Proposal',
    source: 'A Modest Proposal (1729)',
    sourceUrl: 'https://en.wikisource.org/wiki/A_Modest_Proposal',
  },
  {
    title: 'The Philosophy of Composition',
    author: 'Edgar Allan Poe',
    wikisourceTitle: 'The_Philosophy_of_Composition',
    source: "Graham's Magazine (1846)",
    sourceUrl: 'https://en.wikisource.org/wiki/The_Philosophy_of_Composition',
  },
  {
    title: 'Nature',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Nature_(Emerson,_1836)',
    source: 'Nature (1836)',
    sourceUrl: 'https://en.wikisource.org/wiki/Nature_(Emerson,_1836)',
  },
  {
    title: 'Walking',
    author: 'Henry David Thoreau',
    wikisourceTitle: 'Walking_(Thoreau)',
    source: 'The Atlantic Monthly (1862)',
    sourceUrl: 'https://en.wikisource.org/wiki/Walking_(Thoreau)',
  },
  {
    title: 'The American Scholar',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'The_American_Scholar',
    source: 'Phi Beta Kappa Address (1837)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_American_Scholar',
  },
  {
    title: 'Of Friendship',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/XXVII_Of_Friendship',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/XXVII_Of_Friendship',
  },
  {
    title: 'Compensation',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_First_Series/Compensation',
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_First_Series/Compensation',
  },
  {
    title: 'The Over-Soul',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_First_Series/The_Over-Soul',
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_First_Series/The_Over-Soul',
  },
  {
    title: 'Experience',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_Second_Series/Experience',
    source: 'Essays: Second Series (1844)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_Second_Series/Experience',
  },
  {
    title: 'Of Revenge',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/IV_Of_Revenge',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/IV_Of_Revenge',
  },
  {
    title: 'Of Death',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/II_Of_Death',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/II_Of_Death',
  },
  {
    title: 'Of Love',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/X_Of_Love',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/X_Of_Love',
  },
  {
    title: 'Of Great Place',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/XI_Of_Great_Place',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/XI_Of_Great_Place',
  },
  {
    title: 'Of Adversity',
    author: 'Francis Bacon',
    wikisourceTitle: 'The_Essays_of_Francis_Bacon/V_Of_Adversity',
    source: 'Essays (1625)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Essays_of_Francis_Bacon/V_Of_Adversity',
  },
  {
    title: 'Circles',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_First_Series/Circles',
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_First_Series/Circles',
  },
];

/**
 * Fetch full essay text from Wikisource API
 */
async function fetchEssayFromWikisource(wikisourceTitle: string): Promise<string[]> {
  try {
    const apiUrl = `https://en.wikisource.org/w/api.php?action=query&titles=${encodeURIComponent(wikisourceTitle)}&prop=extracts&explaintext=true&format=json&origin=*`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Wikisource API error: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages;

    if (!pages) {
      throw new Error('No pages in response');
    }

    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract;

    if (!extract || pageId === '-1') {
      throw new Error('Page not found');
    }

    // Split into paragraphs and clean up
    const paragraphs = extract
      .split(/\n\n+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0 && !p.startsWith('=='));

    // Return a reasonable portion (first ~2000 words or 15 paragraphs)
    let wordCount = 0;
    const result: string[] = [];

    for (const para of paragraphs) {
      const words = para.split(/\s+/).length;
      if (wordCount + words > 2500 && result.length > 5) {
        break;
      }
      result.push(para);
      wordCount += words;
      if (result.length >= 20) break;
    }

    return result;
  } catch (error) {
    console.error(`Failed to fetch essay "${wikisourceTitle}":`, error);
    return [];
  }
}

// Cache for fetched essays
const essayCache = new Map<string, Reading>();

/**
 * Get a specific essay with full text
 */
async function getEssay(metadata: EssayMetadata): Promise<Reading> {
  // Check cache first
  const cacheKey = metadata.wikisourceTitle;
  if (essayCache.has(cacheKey)) {
    return essayCache.get(cacheKey)!;
  }

  const content = await fetchEssayFromWikisource(metadata.wikisourceTitle);

  const essay: Reading = {
    type: 'essay',
    title: metadata.title,
    author: metadata.author,
    content: content.length > 0 ? content : [
      'This essay could not be loaded at this time. Please check back later.',
    ],
    source: metadata.source,
    sourceUrl: metadata.sourceUrl,
  };

  // Cache it
  essayCache.set(cacheKey, essay);

  return essay;
}

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

export interface DailyReadings {
  poem: Reading;
  essay: Reading;
}

/**
 * Get a deterministic daily poem and essay based on the date
 * Same readings for everyone on the same day
 */
export async function getDailyReadings(date: Date = new Date()): Promise<DailyReadings> {
  // Create a seed from the date (YYYYMMDD format)
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seed = parseInt(dateStr, 10);

  // Fetch poems and essay in parallel
  const poems = await fetchPoems();

  // Convert poems to Reading format
  const poemReadings: Reading[] = poems.map((poem) => ({
    type: 'poem' as const,
    title: poem.title,
    author: poem.author,
    content: poem.lines,
    source: 'PoetryDB',
    sourceUrl: 'https://poetrydb.org',
  }));

  // Use different seeds for poem and essay to get variety
  const poemIndex = seed % Math.max(poemReadings.length, 1);
  const essayIndex = (seed * 7) % ESSAY_CATALOG.length; // Use different multiplier for variety

  const poem = poemReadings[poemIndex] || {
    type: 'poem' as const,
    title: 'Hope is the thing with feathers',
    author: 'Emily Dickinson',
    content: [
      'Hope is the thing with feathers',
      'That perches in the soul,',
      'And sings the tune without the words,',
      'And never stops at all,',
    ],
    source: 'PoetryDB',
    sourceUrl: 'https://poetrydb.org',
  };

  // Fetch the full essay text from Wikisource
  const essayMetadata = ESSAY_CATALOG[essayIndex];
  const essay = await getEssay(essayMetadata);

  return { poem, essay };
}

/**
 * Get a deterministic daily reading based on the date (legacy, returns single reading)
 * Same reading for everyone on the same day
 */
export async function getDailyReading(date: Date = new Date()): Promise<Reading> {
  const { poem } = await getDailyReadings(date);
  return poem;
}

/**
 * Get the essay catalog metadata
 */
export function getEssayCatalog(): EssayMetadata[] {
  return ESSAY_CATALOG;
}
