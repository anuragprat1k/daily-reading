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
  // Ralph Waldo Emerson
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
    title: 'The Over-Soul',
    author: 'Ralph Waldo Emerson',
    content: [
      'There is a difference between one and another hour of life in their authority and subsequent effect. Our faith comes in moments; our vice is habitual.',
      'We live in succession, in division, in parts, in particles. Meantime within man is the soul of the whole; the wise silence; the universal beauty.',
      'We see the world piece by piece, as the sun, the moon, the animal, the tree; but the whole, of which these are the shining parts, is the soul.',
      'The soul knows only the soul; the web of events is the flowing robe in which she is clothed.',
      'Ineffable is the union of man and God in every act of the soul. The simplest person who in his integrity worships God, becomes God.',
    ],
    source: 'Essays: First Series (1841)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/16643',
  },
  // Seneca
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
    title: 'On the Tranquility of Mind',
    author: 'Seneca',
    content: [
      'We are all chained to fortune: the chain of one is made of gold, and wide, while that of another is short and rusty. But what difference does it make?',
      'The same prison surrounds all of us, and even those who have bound others are bound themselves.',
      'No man is free who is a slave to his body.',
      'It is not the man who has too little that is poor, but the one who hankers after more.',
      'Until we have begun to go without them, we fail to realize how unnecessary many things are. We\'ve been using them not because we needed them but because we had them.',
    ],
    source: 'De Tranquillitate Animi',
    sourceUrl: 'https://www.gutenberg.org/ebooks/67617',
  },
  // Henry David Thoreau
  {
    type: 'essay',
    title: 'Walden - Where I Lived',
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
    title: 'Civil Disobedience',
    author: 'Henry David Thoreau',
    content: [
      'That government is best which governs least.',
      'Under a government which imprisons any unjustly, the true place for a just man is also a prison.',
      'The mass of men serve the state thus, not as men mainly, but as machines, with their bodies.',
      'If the injustice is part of the necessary friction of the machine of government, let it go, let it go: perchance it will wear smooth.',
      'Let your life be a counter-friction to stop the machine. What I have to do is to see, at any rate, that I do not lend myself to the wrong which I condemn.',
    ],
    source: 'Resistance to Civil Government (1849)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/71',
  },
  // Marcus Aurelius
  {
    type: 'essay',
    title: 'Meditations - Book II',
    author: 'Marcus Aurelius',
    content: [
      'Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial.',
      'All these things happen to them by reason of their ignorance of what is good and evil.',
      'But I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, can neither be injured by any of them.',
      'We are made for cooperation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth.',
      'To act against one another then is contrary to nature; and it is acting against one another to be vexed and to turn away.',
    ],
    source: 'Meditations (180 AD)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/2680',
  },
  {
    type: 'essay',
    title: 'Meditations - Book IV',
    author: 'Marcus Aurelius',
    content: [
      'That which rules within, when it is according to nature, is so affected with respect to the events which happen, that it always easily adapts itself to that which is and is presented to it.',
      'Take away thy opinion, and then there is taken away the complaint, "I have been harmed." Take away the complaint, and the harm is taken away.',
      'The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.',
      'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
      'Waste no more time arguing about what a good man should be. Be one.',
    ],
    source: 'Meditations (180 AD)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/2680',
  },
  // Francis Bacon
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
  {
    type: 'essay',
    title: 'Of Truth',
    author: 'Francis Bacon',
    content: [
      '"What is truth?" said jesting Pilate, and would not stay for an answer.',
      'Certainly there be that delight in giddiness, and count it a bondage to fix a belief; affecting free-will in thinking, as well as in acting.',
      'But it is not the lie that passeth through the mind, but the lie that sinketh in and settleth in it, that doth the hurt.',
      'The inquiry of truth, which is the love-making or wooing of it, the knowledge of truth, which is the presence of it, and the belief of truth, which is the enjoying of it, is the sovereign good of human nature.',
      'Truth is a naked and open daylight, that doth not show the masks and mummeries and triumphs of the world half so stately and daintily as candle-lights.',
    ],
    source: 'Essays (1597)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/56968',
  },
  // Michel de Montaigne
  {
    type: 'essay',
    title: 'Of Solitude',
    author: 'Michel de Montaigne',
    content: [
      'We should have wife, children, goods, and above all health, if we can; but we must not bind ourselves to them so strongly that our happiness depends on them.',
      'We must reserve a back shop all our own, entirely free, in which to establish our real liberty and our principal retreat and solitude.',
      'The greatest thing in the world is to know how to belong to oneself.',
      'Let us cut loose from all the ties that bind us to others; let us win from ourselves the power to live really alone.',
      'Solitude can be well enjoyed only by a well-furnished mind that is capable of entertaining itself.',
    ],
    source: 'Essays (1580)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/3600',
  },
  {
    type: 'essay',
    title: 'Of Experience',
    author: 'Michel de Montaigne',
    content: [
      'There is no desire more natural than the desire for knowledge. We try all the ways that can lead us to it.',
      'I study myself more than any other subject. That is my metaphysics; that is my physics.',
      'We are never at home, we are always beyond ourselves. Fear, desire, hope, project us toward the future.',
      'My life has been full of terrible misfortunes, most of which never happened.',
      'The most certain sign of wisdom is cheerfulness.',
    ],
    source: 'Essays (1580)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/3600',
  },
  // Oscar Wilde
  {
    type: 'essay',
    title: 'The Soul of Man Under Socialism',
    author: 'Oscar Wilde',
    content: [
      'The chief advantage that would result from the establishment of Socialism is, undoubtedly, the fact that Socialism would relieve us from that sordid necessity of living for others.',
      'Individualism, then, is what through Socialism we are to attain to.',
      'A man who does not think for himself does not think at all.',
      'Selfishness is not living as one wishes to live, it is asking others to live as one wishes to live.',
      'Art is the most intense mode of individualism that the world has known.',
    ],
    source: 'The Soul of Man Under Socialism (1891)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/1017',
  },
  {
    type: 'essay',
    title: 'The Decay of Lying',
    author: 'Oscar Wilde',
    content: [
      'The telling of beautiful untrue things, is the proper aim of Art.',
      'Life imitates Art far more than Art imitates Life.',
      'No great artist ever sees things as they really are. If he did, he would cease to be an artist.',
      'The only beautiful things are the things that do not concern us.',
      'Lying, the telling of beautiful untrue things, is the proper aim of Art.',
    ],
    source: 'Intentions (1891)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/887',
  },
  // William Hazlitt
  {
    type: 'essay',
    title: 'On the Pleasure of Hating',
    author: 'William Hazlitt',
    content: [
      'The pleasure of hating, like a poisonous mineral, eats into the heart of religion, and turns it to rankling spleen and bigotry.',
      'It makes patriotism an excuse for carrying fire, pestilence, and famine into other lands.',
      'It leaves to virtue nothing but the spirit of censoriousness, and a narrow, jealous, inquisitorial watchfulness over the actions and motives of others.',
      'We grow tired of everything but turning others into ridicule, and congratulating ourselves on their defects.',
      'Pure good soon grows insipid, wants variety and spirit. Pain is a bittersweet, which never surfeits.',
    ],
    source: 'The Plain Speaker (1826)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/6716',
  },
  {
    type: 'essay',
    title: 'On Going a Journey',
    author: 'William Hazlitt',
    content: [
      'One of the pleasantest things in the world is going a journey; but I like to go by myself.',
      'I can enjoy society in a room; but out of doors, nature is company enough for me.',
      'I am then never less alone than when alone.',
      'The soul of a journey is liberty, perfect liberty, to think, feel, do, just as one pleases.',
      'Give me the clear blue sky over my head, and the green turf beneath my feet, a winding road before me, and a three hours\' march to dinner.',
    ],
    source: 'Table Talk (1821)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/6716',
  },
  // G.K. Chesterton
  {
    type: 'essay',
    title: 'On Running After One\'s Hat',
    author: 'G.K. Chesterton',
    content: [
      'An adventure is only an inconvenience rightly considered. An inconvenience is only an adventure wrongly considered.',
      'If a man could regard his circumstances as adventures rather than afflictions, he would find that even trying incidents become tolerable.',
      'When we were children we were grateful to those who filled our stockings at Christmas time. Why are we not grateful to God for filling our stockings with legs?',
      'There is no such thing on earth as an uninteresting subject; the only thing that can exist is an uninterested person.',
      'The way to love anything is to realize that it might be lost.',
    ],
    source: 'All Things Considered (1908)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/11505',
  },
  {
    type: 'essay',
    title: 'A Defence of Nonsense',
    author: 'G.K. Chesterton',
    content: [
      'Nonsense and faith are the two supreme symbolic assertions of the truth that to draw out the soul of things with a syllogism is as impossible as to draw out Leviathan with a hook.',
      'This simple sense of wonder at the shapes of things, and at their exuberant independence of our intellectual standards and our trivial definitions, is the basis of spirituality.',
      'It is the test of a good religion whether you can joke about it.',
      'Fairy tales do not give the child his first idea of bogey. What fairy tales give the child is his first clear idea of the possible defeat of bogey.',
      'The most incredible thing about miracles is that they happen.',
    ],
    source: 'The Defendant (1901)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/12245',
  },
  // Mark Twain
  {
    type: 'essay',
    title: 'On the Decay of the Art of Lying',
    author: 'Mark Twain',
    content: [
      'Observe, I do not mean to suggest that the custom of lying has suffered any decay or interruption—no, for the Lie, as a Virtue, is eternal.',
      'What I bemoan is the decay of the art of lying. No high-minded man, no man of right feeling, can contemplate the lumbering and slovenly lying of the present day without grief.',
      'The wise thing is for us diligently to train ourselves to lie thoughtfully, judiciously; to lie with a good object, and not an evil one.',
      'Lying is universal—we all do it; we all must do it. Therefore, the wise thing is to train ourselves carefully.',
      'An injurious truth has no merit over an injurious lie. Neither should ever be uttered.',
    ],
    source: 'On the Decay of the Art of Lying (1880)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/5835',
  },
  {
    type: 'essay',
    title: 'Advice to Youth',
    author: 'Mark Twain',
    content: [
      'Always obey your parents, when they are present. This is the best policy in the long run, because if you don\'t they will make you.',
      'Be respectful to your superiors, if you have any, also to strangers, and sometimes to others.',
      'Go to bed early, get up early—this is wise. Some authorities say get up with the sun; some say get up with one thing, others with another. But a lark is really the best thing to get up with.',
      'Never handle firearms carelessly. The sorrow and suffering that have been caused through innocent victims who have been killed through careless handling of firearms by the young!',
      'Build your character thoughtfully and painstakingly upon these precepts, and by and by, when you have got it built, you will be surprised and gratified to see how nicely and sharply it resembles everybody else\'s.',
    ],
    source: 'Advice to Youth (1882)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/5835',
  },
  // Virginia Woolf
  {
    type: 'essay',
    title: 'The Death of the Moth',
    author: 'Virginia Woolf',
    content: [
      'Moths that fly by day are not properly to be called moths; they do not excite that pleasant sense of dark autumn nights and ivy-blossom which the commonest yellow-underwing asleep in the shadow of the curtain never fails to rouse in us.',
      'The same energy which inspired the rooks, the ploughmen, the horses, and even, it seemed, the lean bare-backed downs, sent the moth fluttering from side to side of his square of the window-pane.',
      'One could only watch the extraordinary efforts made by those tiny legs against an oncoming doom which could, had it chosen, have submerged an entire city.',
      'It was useless to try to do anything. One could only watch the extraordinary efforts made by those tiny legs against an oncoming doom.',
      'O yes, he seemed to say, death is stronger than I am.',
    ],
    source: 'The Death of the Moth and Other Essays (1942)',
  },
  // Plato
  {
    type: 'essay',
    title: 'The Allegory of the Cave',
    author: 'Plato',
    content: [
      'Behold! human beings living in an underground den, which has a mouth open towards the light and reaching all along the den; here they have been from their childhood, and have their legs and necks chained so that they cannot move.',
      'To them the truth would be literally nothing but the shadows of the images.',
      'And if he is compelled to look straight at the light, will he not have a pain in his eyes which will make him turn away to take refuge in the objects of vision?',
      'Last of all he will be able to see the sun, and not mere reflections of him in the water, but he will see him in his own proper place.',
      'Anyone who has common sense will remember that the bewilderments of the eyes are of two kinds, and arise from two causes—either from coming out of the light or from going into the light.',
    ],
    source: 'The Republic (380 BC)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/1497',
  },
  // Epictetus
  {
    type: 'essay',
    title: 'The Enchiridion',
    author: 'Epictetus',
    content: [
      'Some things are within our power, while others are not. Within our power are opinion, motivation, desire, aversion, and, in a word, whatever is of our own doing.',
      'Not within our power are our body, our property, reputation, office, and, in a word, whatever is not of our own doing.',
      'Men are disturbed not by things, but by the views which they take of things.',
      'Don\'t demand that things happen as you wish, but wish that they happen as they do happen, and you will go on well.',
      'It is not things that disturb us, but our judgments about things.',
    ],
    source: 'The Enchiridion (135 AD)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/45109',
  },
  // Benjamin Franklin
  {
    type: 'essay',
    title: 'The Way to Wealth',
    author: 'Benjamin Franklin',
    content: [
      'Dost thou love life? Then do not squander time, for that is the stuff life is made of.',
      'Early to bed and early to rise makes a man healthy, wealthy, and wise.',
      'God helps those who help themselves.',
      'An investment in knowledge pays the best interest.',
      'By failing to prepare, you are preparing to fail.',
    ],
    source: 'The Way to Wealth (1758)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/14154',
  },
  // Friedrich Nietzsche
  {
    type: 'essay',
    title: 'On the Genealogy of Morals - First Essay',
    author: 'Friedrich Nietzsche',
    content: [
      'The slave revolt in morality begins when ressentiment itself becomes creative and gives birth to values.',
      'While every noble morality develops from a triumphant affirmation of itself, slave morality from the outset says No to what is "outside," what is "different," what is "not itself."',
      'The man of ressentiment is neither upright nor naïve nor honest and straightforward with himself. His soul squints.',
      'To be incapable of taking one\'s enemies, one\'s accidents, even one\'s misdeeds seriously for very long—that is the sign of strong, full natures.',
      'One thing is needful: to give style to one\'s character—a great and rare art!',
    ],
    source: 'On the Genealogy of Morals (1887)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/52319',
  },
  // Arthur Schopenhauer
  {
    type: 'essay',
    title: 'On the Suffering of the World',
    author: 'Arthur Schopenhauer',
    content: [
      'Unless suffering is the direct and immediate object of life, our existence must entirely fail of its aim.',
      'It is absurd to look upon the enormous amount of pain that abounds everywhere in the world, and originates in needs and necessities inseparable from life itself, as serving no purpose at all and the result of mere chance.',
      'The conviction that the world and man is something that had better not have been, is of a kind to fill us with indulgence towards one another.',
      'Mostly it is loss which teaches us about the worth of things.',
      'Life is a constant process of dying.',
    ],
    source: 'Studies in Pessimism (1851)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/10732',
  },
  // Charles Lamb
  {
    type: 'essay',
    title: 'A Dissertation Upon Roast Pig',
    author: 'Charles Lamb',
    content: [
      'Mankind, says a Chinese manuscript, which my friend M. was obliging enough to read and explain to me, for the first seventy thousand ages ate their meat raw.',
      'The manuscript goes on to say, that the art of roasting, or rather broiling, was accidentally discovered in the manner following.',
      'Bo-bo was in the utmost consternation, as you may think, not so much for the sake of the tenement, which his father and he could easily build up again with a few dry branches, as for the loss of the pigs.',
      'While he was thinking what he should say to his father, an odour assailed his nostrils, unlike any scent which he had before experienced.',
      'Of all the delicacies in the whole mundus edibilis, I will maintain it to be the most delicate—princeps obsoniorum.',
    ],
    source: 'Essays of Elia (1823)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/2307',
  },
  // John Stuart Mill
  {
    type: 'essay',
    title: 'On Liberty - Of Individuality',
    author: 'John Stuart Mill',
    content: [
      'He who lets the world, or his own portion of it, choose his plan of life for him, has no need of any other faculty than the ape-like one of imitation.',
      'He who chooses his plan for himself, employs all his faculties. He must use observation to see, reasoning and judgment to foresee, activity to gather materials for decision.',
      'If a person possesses any tolerable amount of common sense and experience, his own mode of laying out his existence is the best, not because it is the best in itself, but because it is his own mode.',
      'The human faculties of perception, judgment, discriminative feeling, mental activity, and even moral preference, are exercised only in making a choice.',
      'A person whose desires and impulses are his own—are the expression of his own nature—is said to have a character.',
    ],
    source: 'On Liberty (1859)',
    sourceUrl: 'https://www.gutenberg.org/ebooks/34901',
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
