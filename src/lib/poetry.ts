/**
 * Poetry and essay fetching utilities
 * Uses PoetryDB API for poems and pre-stored essays from JSON
 */

import essayDatabase from '@/data/essays/essays.json';
import type { StoredEssay, EssayDatabase } from '@/data/essays';

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
  isTruncated?: boolean;
  fullContent?: string[];
}

/**
 * Create a snippet from full essay content
 */
function createSnippet(paragraphs: string[]): { snippet: string[]; isTruncated: boolean } {
  const MIN_WORDS = 1000;
  const MAX_WORDS = 2500;
  const MAX_PARAGRAPHS = 25;

  let wordCount = 0;
  const snippet: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (wordCount >= MIN_WORDS && wordCount + words > MAX_WORDS && snippet.length > 5) {
      break;
    }
    snippet.push(para);
    wordCount += words;
    if (wordCount >= MIN_WORDS && snippet.length >= MAX_PARAGRAPHS) break;
  }

  return {
    snippet,
    isTruncated: snippet.length < paragraphs.length,
  };
}

/**
 * Get a stored essay by its ID
 */
function getStoredEssay(id: string): StoredEssay | undefined {
  const db = essayDatabase as EssayDatabase;
  return db.essays.find(e => e.id === id);
}

/**
 * Get an essay from the stored database
 */
function getEssay(essayId: string): Reading {
  const storedEssay = getStoredEssay(essayId);

  if (!storedEssay || storedEssay.paragraphs.length === 0) {
    return {
      type: 'essay',
      title: 'Essay Unavailable',
      author: 'Unknown',
      content: ['This essay is temporarily unavailable. Please check back later.'],
    };
  }

  const { snippet, isTruncated } = createSnippet(storedEssay.paragraphs);

  return {
    type: 'essay',
    title: storedEssay.title,
    author: storedEssay.author,
    content: snippet,
    source: storedEssay.source,
    sourceUrl: storedEssay.sourceUrl,
    isTruncated,
    fullContent: isTruncated ? storedEssay.paragraphs : undefined,
  };
}

/**
 * Get all essay IDs from the database
 */
function getEssayIds(): string[] {
  const db = essayDatabase as EssayDatabase;
  return db.essays.map(e => e.id);
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

  // Fetch poems from PoetryDB
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

  // Get essay IDs from stored database
  const essayIds = getEssayIds();

  // Use different seeds for poem and essay to get variety
  const poemIndex = seed % Math.max(poemReadings.length, 1);
  const essayIndex = (seed * 7) % essayIds.length;

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

  // Get essay from stored database
  const essayId = essayIds[essayIndex];
  const essay = getEssay(essayId);

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
