/**
 * Essay database types and utilities
 */

export interface StoredEssay {
  id: string;                    // Slug from wikisourceTitle
  title: string;
  author: string;
  source: string;
  sourceUrl?: string;
  paragraphs: string[];          // Full content as paragraph array
  wordCount: number;
  fetchedAt: string;             // ISO timestamp
}

export interface EssayDatabase {
  version: number;
  lastUpdated: string;
  essays: StoredEssay[];
}
