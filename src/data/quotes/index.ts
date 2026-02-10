/**
 * Quote database types
 */

export interface StoredQuote {
  id: string;
  text: string;
  author: string;
}

export interface QuoteDatabase {
  version: number;
  lastUpdated: string;
  quotes: StoredQuote[];
}
