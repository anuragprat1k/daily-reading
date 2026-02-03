/**
 * Script to fetch essays from Wikisource and store them locally
 * Run with: npm run fetch-essays
 */

import * as fs from 'fs';
import * as path from 'path';

interface EssayMetadata {
  title: string;
  author: string;
  wikisourceTitle: string;
  source: string;
  sourceUrl?: string;
}

interface StoredEssay {
  id: string;
  title: string;
  author: string;
  source: string;
  sourceUrl?: string;
  paragraphs: string[];
  wordCount: number;
  fetchedAt: string;
}

interface EssayDatabase {
  version: number;
  lastUpdated: string;
  essays: StoredEssay[];
}

interface ValidationResult {
  valid: boolean;
  wordCount: number;
  issues: string[];
}

// Essay catalog with corrected Wikisource page titles
const ESSAY_CATALOG: EssayMetadata[] = [
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
    wikisourceTitle: 'Moral_letters_to_Lucilius/Letter_49',
    source: 'Moral Letters to Lucilius (65 AD)',
    sourceUrl: 'https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_49',
  },
  {
    title: 'Civil Disobedience',
    author: 'Henry David Thoreau',
    wikisourceTitle: 'Aesthetic_Papers/Resistance_to_Civil_Government',
    source: 'Resistance to Civil Government (1849)',
    sourceUrl: 'https://en.wikisource.org/wiki/Aesthetic_Papers/Resistance_to_Civil_Government',
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
    wikisourceTitle: 'The_Works_of_the_Rev._Jonathan_Swift/Volume_9/A_Modest_Proposal',
    source: 'A Modest Proposal (1729)',
    sourceUrl: 'https://en.wikisource.org/wiki/The_Works_of_the_Rev._Jonathan_Swift/Volume_9/A_Modest_Proposal',
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
    wikisourceTitle: 'Essays:_Second_Series/Nature',
    source: 'Essays: Second Series (1844)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_Second_Series/Nature',
  },
  {
    title: 'Walking',
    author: 'Henry David Thoreau',
    wikisourceTitle: 'Excursions_(1863)_Thoreau/Walking',
    source: 'The Atlantic Monthly (1862)',
    sourceUrl: 'https://en.wikisource.org/wiki/Excursions_(1863)_Thoreau/Walking',
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
    title: 'Love',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_First_Series/Love',
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_First_Series/Love',
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
    title: 'Gifts',
    author: 'Ralph Waldo Emerson',
    wikisourceTitle: 'Essays:_Second_Series/Gifts',
    source: 'Essays: Second Series (1844)',
    sourceUrl: 'https://en.wikisource.org/wiki/Essays:_Second_Series/Gifts',
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
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&#32;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#8203;/g, '') // zero-width space
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse HTML to extract paragraph content
 * Handles both <p> tag content and prose content sections
 */
function parseHtmlToParagraphs(html: string): string[] {
  const paragraphs: string[] = [];

  // Remove Wikisource navigation/metadata sections and other non-content elements
  let cleanedHtml = html
    // Remove ws-noexport blocks (headers, nav, etc)
    .replace(/<div[^>]*class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove style and script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    // Remove page number markers
    .replace(/<span[^>]*class="[^"]*pagenum[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    // Remove sup/footnote references
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    // Remove table of contents
    .replace(/<div[^>]*id="toc"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove center-aligned headers/titles
    .replace(/<div[^>]*class="[^"]*wst-center[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Try to extract content from prp-pages-output div (common Wikisource structure)
  const prpMatch = cleanedHtml.match(/<div[^>]*class="[^"]*prp-pages-output[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(<div[^>]*class="[^"]*printfooter|<\/div>\s*$)/i);
  if (prpMatch) {
    cleanedHtml = prpMatch[1];
  }

  // First try: Extract <p> tags
  const pTagRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = pTagRegex.exec(cleanedHtml)) !== null) {
    // Remove HTML tags but keep text
    const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ''));
    if (text.length > 50) {
      paragraphs.push(text);
    }
  }

  // If we got enough content from <p> tags, return it
  if (paragraphs.length > 0) {
    const wordCount = paragraphs.join(' ').split(/\s+/).length;
    if (wordCount >= 500) {
      return paragraphs;
    }
  }

  // Second try: Extract text content more broadly (for pages without <p> tags)
  // Remove remaining tags but preserve line breaks for block elements
  const blockElements = ['div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'];
  let textContent = cleanedHtml;

  // Add newlines before/after block elements
  for (const elem of blockElements) {
    textContent = textContent.replace(new RegExp(`<${elem}[^>]*>`, 'gi'), '\n');
    textContent = textContent.replace(new RegExp(`</${elem}>`, 'gi'), '\n');
  }

  // Remove all remaining HTML tags
  textContent = textContent.replace(/<[^>]+>/g, '');

  // Decode entities and clean up
  textContent = decodeHtmlEntities(textContent);

  // Split into paragraphs by double newlines or significant whitespace
  const rawParagraphs = textContent
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 50);

  // If we got more content this way, use it
  if (rawParagraphs.length > paragraphs.length) {
    return rawParagraphs;
  }

  return paragraphs;
}

/**
 * Validate essay content quality
 */
function validateEssayContent(paragraphs: string[]): ValidationResult {
  const wordCount = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0);
  const issues: string[] = [];

  // Check minimum content
  if (wordCount < 500) {
    issues.push(`Too short: ${wordCount} words (minimum 500)`);
  }

  // Check for metadata instead of content
  const metadataPatterns = [
    /This page has been proofread/i,
    /^This work is in the public domain/i,
    /^\d{4}$/,
  ];

  const firstPara = paragraphs[0] || '';
  for (const pattern of metadataPatterns) {
    if (pattern.test(firstPara)) {
      issues.push(`Possible metadata detected: "${firstPara.substring(0, 50)}..."`);
    }
  }

  // Check if paragraphs seem too uniform (could be table of contents)
  const avgLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  if (avgLength < 100 && paragraphs.length > 5) {
    issues.push(`Paragraphs seem too short (avg ${Math.round(avgLength)} chars)`);
  }

  return {
    valid: issues.length === 0,
    wordCount,
    issues,
  };
}

/**
 * Fetch essay from Wikisource API
 */
async function fetchEssayFromWikisource(wikisourceTitle: string): Promise<string[]> {
  const apiUrl = `https://en.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(wikisourceTitle)}&prop=text&format=json&formatversion=2`;

  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'DailyReadingApp/1.0 (https://github.com/daily-reading; contact@example.com)',
    },
  });

  if (!response.ok) {
    throw new Error(`Wikisource API error: ${response.status}`);
  }

  const data = await response.json();
  const html = data?.parse?.text || '';

  if (!html) {
    throw new Error('No text content in API response');
  }

  return parseHtmlToParagraphs(html);
}

/**
 * Generate essay ID from wikisourceTitle
 */
function generateEssayId(wikisourceTitle: string): string {
  return wikisourceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Main fetch function
 */
async function main() {
  console.log('Fetching essays from Wikisource...\n');

  const essays: StoredEssay[] = [];
  const warnings: string[] = [];

  for (const metadata of ESSAY_CATALOG) {
    const id = generateEssayId(metadata.wikisourceTitle);
    console.log(`Fetching: ${metadata.title} by ${metadata.author}`);

    try {
      const paragraphs = await fetchEssayFromWikisource(metadata.wikisourceTitle);
      const validation = validateEssayContent(paragraphs);

      if (validation.issues.length > 0) {
        warnings.push(`${metadata.title}: ${validation.issues.join(', ')}`);
        console.log(`  WARNING: ${validation.issues.join(', ')}`);
      }

      console.log(`  ${validation.wordCount} words, ${paragraphs.length} paragraphs`);

      essays.push({
        id,
        title: metadata.title,
        author: metadata.author,
        source: metadata.source,
        sourceUrl: metadata.sourceUrl,
        paragraphs,
        wordCount: validation.wordCount,
        fetchedAt: new Date().toISOString(),
      });

      // Rate limit to be nice to Wikisource
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      warnings.push(`${metadata.title}: FAILED - ${message}`);
      console.log(`  ERROR: ${message}`);
    }
  }

  // Write database
  const database: EssayDatabase = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    essays,
  };

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'essays', 'essays.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Successfully fetched ${essays.length}/${ESSAY_CATALOG.length} essays`);
  console.log(`Output: ${outputPath}`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  const totalWords = essays.reduce((sum, e) => sum + e.wordCount, 0);
  console.log(`\nTotal word count: ${totalWords.toLocaleString()}`);
}

main().catch(console.error);
