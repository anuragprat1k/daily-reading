/**
 * Poem database types
 */

export interface StoredPoem {
  id: string;                    // Unique identifier
  title: string;
  author: string;
  lines: string[];               // Full poem content as array of lines
  lineCount: number;
}

export interface PoemDatabase {
  version: number;
  lastUpdated: string;
  poems: StoredPoem[];
}
