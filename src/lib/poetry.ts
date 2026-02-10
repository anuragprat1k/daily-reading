/**
 * Poetry and essay utilities
 * Uses pre-stored poems and essays from JSON databases
 */

import essayDatabase from '@/data/essays/essays.json';
import poemDatabase from '@/data/poems/poems.json';
import quoteDatabase from '@/data/quotes/quotes.json';
import type { StoredEssay, EssayDatabase } from '@/data/essays';
import type { StoredPoem, PoemDatabase } from '@/data/poems';
import type { StoredQuote, QuoteDatabase } from '@/data/quotes';

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

/**
 * Get all poems from the database
 */
function getStoredPoems(): StoredPoem[] {
  const db = poemDatabase as PoemDatabase;
  return db.poems;
}

/**
 * Get a poem as a Reading object
 */
function getPoem(poemId: string): Reading {
  const db = poemDatabase as PoemDatabase;
  const poem = db.poems.find(p => p.id === poemId);

  if (!poem) {
    return {
      type: 'poem',
      title: 'Poem Unavailable',
      author: 'Unknown',
      content: ['This poem is temporarily unavailable.'],
    };
  }

  return {
    type: 'poem',
    title: poem.title,
    author: poem.author,
    content: poem.lines,
    source: 'PoetryDB',
    sourceUrl: 'https://poetrydb.org',
  };
}

export interface Quote {
  text: string;
  author: string;
}

/**
 * Get all quotes from the database
 */
function getStoredQuotes(): StoredQuote[] {
  const db = quoteDatabase as QuoteDatabase;
  return db.quotes;
}

export interface DailyReadings {
  poem: Reading;
  essay: Reading;
  quote: Quote;
}

/**
 * Get a deterministic daily poem and essay based on the date
 * Same readings for everyone on the same day
 */
export function getDailyReadings(date: Date = new Date()): DailyReadings {
  // Create a seed from the date (YYYYMMDD format)
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seed = parseInt(dateStr, 10);

  // Get poems, essays, and quotes from stored databases
  const poems = getStoredPoems();
  const essayIds = getEssayIds();
  const quotes = getStoredQuotes();

  // Use different seeds for poem, essay, and quote to get variety
  const poemIndex = seed % poems.length;
  const essayIndex = (seed * 7) % essayIds.length;
  const quoteIndex = (seed * 13) % quotes.length;

  // Get poem from stored database
  const poemId = poems[poemIndex].id;
  const poem = getPoem(poemId);

  // Get essay from stored database
  const essayId = essayIds[essayIndex];
  const essay = getEssay(essayId);

  // Get quote from stored database
  const storedQuote = quotes[quoteIndex];
  const quote: Quote = {
    text: storedQuote.text,
    author: storedQuote.author,
  };

  return { poem, essay, quote };
}

/**
 * Get a deterministic daily reading based on the date (legacy, returns single reading)
 * Same reading for everyone on the same day
 */
export function getDailyReading(date: Date = new Date()): Reading {
  const { poem } = getDailyReadings(date);
  return poem;
}
