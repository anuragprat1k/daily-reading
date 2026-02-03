/**
 * Script to fetch poems from PoetryDB and store them locally
 * Run with: npm run fetch-poems
 */

import * as fs from 'fs';
import * as path from 'path';

interface PoetryDBPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

interface StoredPoem {
  id: string;
  title: string;
  author: string;
  lines: string[];
  lineCount: number;
}

interface PoemDatabase {
  version: number;
  lastUpdated: string;
  poems: StoredPoem[];
}

// Curated list of famous poets
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
  'William Butler Yeats',
  'Alfred Lord Tennyson',
  'John Donne',
  'George Herbert',
  'Andrew Marvell',
];

/**
 * Generate a unique ID for a poem
 */
function generatePoemId(author: string, title: string): string {
  const slug = `${author}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
  return slug;
}

/**
 * Fetch poems for a single poet from PoetryDB
 */
async function fetchPoemsForPoet(poet: string): Promise<PoetryDBPoem[]> {
  const url = `https://poetrydb.org/author/${encodeURIComponent(poet)}/title,author,lines,linecount`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`PoetryDB API error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}

/**
 * Validate poem content
 */
function validatePoem(poem: PoetryDBPoem): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lineCount = parseInt(poem.linecount, 10);

  // Check line count
  if (lineCount < 4) {
    issues.push(`Too short: ${lineCount} lines (minimum 4)`);
  }

  // Check for empty lines array
  if (!poem.lines || poem.lines.length === 0) {
    issues.push('No content');
  }

  // Check for mostly empty lines
  const nonEmptyLines = poem.lines?.filter(l => l.trim().length > 0).length || 0;
  if (nonEmptyLines < 4) {
    issues.push(`Only ${nonEmptyLines} non-empty lines`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Main fetch function
 */
async function main() {
  console.log('Fetching poems from PoetryDB...\n');

  const poems: StoredPoem[] = [];
  const seenIds = new Set<string>();
  let totalSkipped = 0;

  for (const poet of FEATURED_POETS) {
    console.log(`Fetching: ${poet}`);

    try {
      const poetPoems = await fetchPoemsForPoet(poet);
      let addedForPoet = 0;

      for (const poem of poetPoems) {
        const lineCount = parseInt(poem.linecount, 10);

        // Filter to poems with reasonable length (4-100 lines)
        // We're being more generous than before to get more variety
        if (lineCount < 4 || lineCount > 100) {
          totalSkipped++;
          continue;
        }

        const validation = validatePoem(poem);
        if (!validation.valid) {
          totalSkipped++;
          continue;
        }

        const id = generatePoemId(poem.author, poem.title);

        // Skip duplicates
        if (seenIds.has(id)) {
          continue;
        }
        seenIds.add(id);

        poems.push({
          id,
          title: poem.title,
          author: poem.author,
          lines: poem.lines,
          lineCount,
        });

        addedForPoet++;
      }

      console.log(`  Added ${addedForPoet} poems (${poetPoems.length} total from API)`);

      // Rate limit to be nice to PoetryDB
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ERROR: ${message}`);
    }
  }

  // Sort poems by author then title for consistent ordering
  poems.sort((a, b) => {
    const authorCompare = a.author.localeCompare(b.author);
    if (authorCompare !== 0) return authorCompare;
    return a.title.localeCompare(b.title);
  });

  // Write database
  const database: PoemDatabase = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    poems,
  };

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'poems', 'poems.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Successfully stored ${poems.length} poems`);
  console.log(`Skipped ${totalSkipped} poems (too short/long or invalid)`);
  console.log(`Output: ${outputPath}`);

  // Show distribution by author
  console.log('\nPoems by author:');
  const byAuthor = new Map<string, number>();
  for (const poem of poems) {
    byAuthor.set(poem.author, (byAuthor.get(poem.author) || 0) + 1);
  }
  for (const [author, count] of [...byAuthor.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${author}: ${count}`);
  }

  // Show line count distribution
  const shortPoems = poems.filter(p => p.lineCount <= 20).length;
  const mediumPoems = poems.filter(p => p.lineCount > 20 && p.lineCount <= 50).length;
  const longPoems = poems.filter(p => p.lineCount > 50).length;
  console.log(`\nLine count distribution:`);
  console.log(`  Short (4-20 lines): ${shortPoems}`);
  console.log(`  Medium (21-50 lines): ${mediumPoems}`);
  console.log(`  Long (51-100 lines): ${longPoems}`);
}

main().catch(console.error);
