// Data structure for the Tree of Vines: Civilizations

export interface CivilizationNode {
  id: string;
  name: string;
  type: 'trunk' | 'vine' | 'cross-vine';
  emoji?: string;
  themes: string[];
  gifts: string[];
  description?: string;
  // For visual representation
  color?: string;
  thickness?: number; // Visual thickness of the vine
  // Detailed information
  links?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  questions?: string[];
  rubric?: {
    categories: Array<{
      name: string;
      criteria: string[];
      weight?: number;
    }>;
  };
  relatedReadings?: Array<{
    title: string;
    author?: string;
    url?: string;
  }>;
  timePeriod?: string;
  timeStart?: number; // Year (BCE as negative, CE as positive)
  timeEnd?: number; // Year (BCE as negative, CE as positive)
  longitude?: number; // Geographic longitude (-180 to 180)
  keyFigures?: string[];
}

export interface CivilizationRelation {
  id: string;
  from_id: string;
  to_id: string;
  relation_type: 'grows_from' | 'grafts' | 'pollinates' | 'strangles' | 'carries' | 'synthesizes';
  description?: string;
}

// Trunk (pre-vines, deep roots) - earliest time, spread across longitudes
export const trunkNodes: CivilizationNode[] = [
  {
    id: 'trunk-language',
    name: 'Language',
    type: 'trunk',
    themes: ['communication', 'abstraction', 'memory'],
    gifts: ['symbolic thought', 'narrative', 'transmission'],
    color: '#4a4a4a',
    timeStart: -100000,
    timeEnd: -10000,
    longitude: 0, // Center
  },
  {
    id: 'trunk-fire',
    name: 'Fire',
    type: 'trunk',
    themes: ['transformation', 'energy', 'control'],
    gifts: ['cooking', 'metallurgy', 'ceramics'],
    color: '#8b4513',
    timeStart: -400000,
    timeEnd: -10000,
    longitude: -20, // West
  },
  {
    id: 'trunk-ritual',
    name: 'Ritual',
    type: 'trunk',
    themes: ['meaning', 'order', 'continuity'],
    gifts: ['ceremony', 'calendar', 'social cohesion'],
    color: '#5d4037',
    timeStart: -50000,
    timeEnd: -10000,
    longitude: 20, // East
  },
  {
    id: 'trunk-tools',
    name: 'Tool-making',
    type: 'trunk',
    themes: ['extension', 'efficiency', 'adaptation'],
    gifts: ['technology', 'craft', 'innovation'],
    color: '#616161',
    timeStart: -3000000,
    timeEnd: -10000,
    longitude: 0, // Center
  },
  {
    id: 'trunk-kinship',
    name: 'Kinship & Myth',
    type: 'trunk',
    themes: ['identity', 'belonging', 'narrative'],
    gifts: ['social structure', 'cosmology', 'tradition'],
    color: '#424242',
    timeStart: -100000,
    timeEnd: -10000,
    longitude: 40, // Further east
  },
];

// Major Civilizational Vines
export const majorVines: CivilizationNode[] = [
  {
    id: 'vine-mesopotamian',
    name: 'Mesopotamian',
    type: 'vine',
    emoji: '🌾',
    themes: ['writing', 'law', 'bureaucracy', 'time'],
    gifts: ['cuneiform', 'contracts', 'accounting', 'calendars'],
    description: 'Winds early and thick, then thins—but its fibers run through almost everything that follows.',
    color: '#8b6914',
    thickness: 8,
    timePeriod: 'c. 3500 BCE - 539 BCE',
    timeStart: -3500,
    timeEnd: -539,
    longitude: 44.4, // Mesopotamia (Iraq)
    keyFigures: ['Hammurabi', 'Gilgamesh', 'Sargon of Akkad'],
    links: [
      {
        title: 'Code of Hammurabi',
        url: 'https://en.wikipedia.org/wiki/Code_of_Hammurabi',
        description: 'One of the oldest deciphered writings of significant length',
      },
      {
        title: 'Epic of Gilgamesh',
        url: 'https://en.wikipedia.org/wiki/Epic_of_Gilgamesh',
        description: 'Ancient Mesopotamian epic poem',
      },
    ],
    questions: [
      'How did writing transform human memory and administration?',
      'What role did law play in creating social order?',
      'How did bureaucratic systems enable large-scale civilization?',
    ],
    rubric: {
      categories: [
        {
          name: 'Understanding of Writing Systems',
          criteria: [
            'Explains the development of cuneiform',
            'Describes the impact of written records on administration',
            'Analyzes the relationship between writing and power',
          ],
          weight: 30,
        },
        {
          name: 'Legal and Bureaucratic Systems',
          criteria: [
            'Understands the Code of Hammurabi and its principles',
            'Explains how bureaucracy enabled empire',
            'Analyzes the role of contracts and accounting',
          ],
          weight: 35,
        },
        {
          name: 'Temporal and Cosmological Understanding',
          criteria: [
            'Describes calendar systems and time measurement',
            'Explains cosmological beliefs',
            'Analyzes the relationship between time and power',
          ],
          weight: 35,
        },
      ],
    },
    relatedReadings: [
      {
        title: 'The Epic of Gilgamesh',
        author: 'Anonymous',
      },
      {
        title: 'Mesopotamia: The Invention of the City',
        author: 'Gwendolyn Leick',
      },
    ],
  },
  {
    id: 'vine-egyptian',
    name: 'Egyptian',
    type: 'vine',
    emoji: '🏺',
    themes: ['afterlife', 'monumental memory', 'sacred kingship'],
    gifts: ['geometry', 'medicine', 'architecture', 'symbolic continuity'],
    description: 'A slow, vertical vine—less branching, more enduring.',
    color: '#d4af37',
    thickness: 7,
    timePeriod: 'c. 3100 BCE - 30 BCE',
    timeStart: -3100,
    timeEnd: -30,
    longitude: 31.2, // Egypt
  },
  {
    id: 'vine-mediterranean',
    name: 'Mediterranean',
    type: 'vine',
    emoji: '🏛',
    themes: ['reason', 'politics', 'aesthetics', 'empire'],
    gifts: ['philosophy', 'democracy', 'engineering', 'law'],
    description: 'Spreads laterally, grabbing others and training them onto trellises called "institutions."',
    color: '#1e88e5',
    thickness: 9,
    timePeriod: 'c. 800 BCE - 476 CE',
    timeStart: -800,
    timeEnd: 476,
    longitude: 23.7, // Mediterranean (Greece/Rome)
    keyFigures: ['Socrates', 'Plato', 'Aristotle', 'Cicero', 'Augustus'],
    links: [
      {
        title: 'Plato\'s Republic',
        url: 'https://en.wikipedia.org/wiki/Republic_(Plato)',
        description: 'Foundational work of political philosophy',
      },
      {
        title: 'Aristotle\'s Politics',
        url: 'https://en.wikipedia.org/wiki/Politics_(Aristotle)',
        description: 'Analysis of political systems and governance',
      },
      {
        title: 'Roman Law',
        url: 'https://en.wikipedia.org/wiki/Roman_law',
        description: 'Legal system that influenced Western law',
      },
    ],
    questions: [
      'What is the relationship between reason and democracy?',
      'How do institutions shape human behavior?',
      'What role does aesthetics play in political power?',
      'How did empire transform local cultures?',
    ],
    rubric: {
      categories: [
        {
          name: 'Philosophical Foundations',
          criteria: [
            'Understands Socratic method and dialectic',
            'Explains Platonic forms and idealism',
            'Analyzes Aristotelian logic and empiricism',
          ],
          weight: 25,
        },
        {
          name: 'Political Systems',
          criteria: [
            'Compares Athenian democracy with Roman republic',
            'Explains the concept of citizenship',
            'Analyzes the transition from republic to empire',
          ],
          weight: 30,
        },
        {
          name: 'Engineering and Infrastructure',
          criteria: [
            'Describes Roman engineering achievements',
            'Explains how infrastructure enabled empire',
            'Analyzes the relationship between technology and power',
          ],
          weight: 25,
        },
        {
          name: 'Aesthetic and Cultural Influence',
          criteria: [
            'Understands classical art and architecture',
            'Explains the concept of beauty in Greek thought',
            'Analyzes cultural transmission through empire',
          ],
          weight: 20,
        },
      ],
    },
    relatedReadings: [
      {
        title: 'The Republic',
        author: 'Plato',
      },
      {
        title: 'Politics',
        author: 'Aristotle',
      },
      {
        title: 'The Aeneid',
        author: 'Virgil',
      },
    ],
  },
  {
    id: 'vine-hebraic',
    name: 'Hebraic',
    type: 'vine',
    emoji: '🕎',
    themes: ['covenant', 'ethics', 'text', 'law-as-morality'],
    gifts: ['monotheism', 'prophetic critique', 'textual tradition'],
    description: 'A vine that climbs inside other vines—often invisible, structurally essential.',
    color: '#1976d2',
    thickness: 6,
    timePeriod: 'c. 2000 BCE - present',
    timeStart: -2000,
    timeEnd: 2024,
    longitude: 35.2, // Levant/Israel
  },
  {
    id: 'vine-islamic',
    name: 'Islamic',
    type: 'vine',
    emoji: '☪️',
    themes: ['synthesis', 'transmission', 'unity of knowledge'],
    gifts: ['algebra', 'optics', 'medicine', 'philosophy preservation'],
    description: 'Acts like a conduit, carrying sap from antiquity into Europe and Asia when others went dormant.',
    color: '#00695c',
    thickness: 7,
    timePeriod: 'c. 622 CE - present',
    timeStart: 622,
    timeEnd: 2024,
    longitude: 39.8, // Middle East (Mecca/Medina)
  },
  {
    id: 'vine-indic',
    name: 'Indic',
    type: 'vine',
    emoji: '🏯',
    themes: ['consciousness', 'cycles', 'inward exploration'],
    gifts: ['mathematics (zero)', 'logic', 'meditation systems'],
    description: 'Coils inward and upward at once—less conquest, more recursion.',
    color: '#f57c00',
    thickness: 8,
    timePeriod: 'c. 1500 BCE - present',
    timeStart: -1500,
    timeEnd: 2024,
    longitude: 77.2, // India
  },
  {
    id: 'vine-sinitic',
    name: 'Sinitic (Chinese)',
    type: 'vine',
    emoji: '🀄',
    themes: ['harmony', 'bureaucracy', 'continuity'],
    gifts: ['paper', 'printing', 'civil service', 'systems thinking'],
    description: 'Grows parallel to the trunk, rarely snapping, always adapting.',
    color: '#c62828',
    thickness: 9,
    timePeriod: 'c. 1600 BCE - present',
    timeStart: -1600,
    timeEnd: 2024,
    longitude: 116.4, // China
  },
  {
    id: 'vine-mesoamerican',
    name: 'Mesoamerican',
    type: 'vine',
    emoji: '🗿',
    themes: ['time', 'cosmology', 'sacrifice', 'astronomy'],
    gifts: ['calendars', 'agriculture', 'urban planning'],
    description: 'A brilliant vine cut too early—but its pollen still drifts.',
    color: '#7b1fa2',
    thickness: 6,
    timePeriod: 'c. 2000 BCE - 1521 CE',
    timeStart: -2000,
    timeEnd: 1521,
    longitude: -99.1, // Mesoamerica (Mexico)
  },
  {
    id: 'vine-medieval',
    name: 'European Medieval',
    type: 'vine',
    emoji: '🛡',
    themes: ['synthesis of faith and reason'],
    gifts: ['universities', 'scholastic method', 'clocks'],
    description: 'A grafted vine—Roman rootstock, Hebraic ethics, Islamic sap.',
    color: '#455a64',
    thickness: 7,
    timePeriod: 'c. 476 CE - 1500 CE',
    timeStart: 476,
    timeEnd: 1500,
    longitude: 2.3, // Europe (Paris)
  },
  {
    id: 'vine-modern',
    name: 'Modern Western',
    type: 'vine',
    emoji: '⚙️',
    themes: ['extraction', 'acceleration', 'abstraction'],
    gifts: ['science', 'industry', 'rights discourse'],
    description: 'Grows fast, sometimes choking others—now cracking under its own weight.',
    color: '#e53935',
    thickness: 10,
    timePeriod: 'c. 1500 CE - present',
    timeStart: 1500,
    timeEnd: 2024,
    longitude: 0.1, // Europe (Greenwich/London)
    keyFigures: ['Galileo', 'Newton', 'Locke', 'Kant', 'Darwin', 'Einstein'],
    links: [
      {
        title: 'Scientific Revolution',
        url: 'https://en.wikipedia.org/wiki/Scientific_Revolution',
        description: 'The emergence of modern science',
      },
      {
        title: 'Industrial Revolution',
        url: 'https://en.wikipedia.org/wiki/Industrial_Revolution',
        description: 'Transformation of manufacturing and society',
      },
      {
        title: 'Enlightenment',
        url: 'https://en.wikipedia.org/wiki/Age_of_Enlightenment',
        description: 'Intellectual movement emphasizing reason and rights',
      },
    ],
    questions: [
      'How did the scientific method transform knowledge?',
      'What are the costs and benefits of industrialization?',
      'How do abstract systems (money, law, rights) shape reality?',
      'What is the relationship between progress and destruction?',
    ],
    rubric: {
      categories: [
        {
          name: 'Scientific Method and Epistemology',
          criteria: [
            'Understands the development of empirical science',
            'Explains the relationship between observation and theory',
            'Analyzes the impact of scientific knowledge on society',
          ],
          weight: 30,
        },
        {
          name: 'Industrial and Technological Transformation',
          criteria: [
            'Describes the Industrial Revolution and its effects',
            'Explains the relationship between technology and power',
            'Analyzes environmental and social costs of extraction',
          ],
          weight: 30,
        },
        {
          name: 'Rights Discourse and Political Theory',
          criteria: [
            'Understands the development of human rights concepts',
            'Explains social contract theory',
            'Analyzes the relationship between rights and responsibilities',
          ],
          weight: 25,
        },
        {
          name: 'Abstraction and Systems Thinking',
          criteria: [
            'Describes how abstract systems (money, law, data) function',
            'Explains the relationship between abstraction and power',
            'Analyzes the limits and dangers of abstraction',
          ],
          weight: 15,
        },
      ],
    },
    relatedReadings: [
      {
        title: 'The Structure of Scientific Revolutions',
        author: 'Thomas Kuhn',
      },
      {
        title: 'The Wealth of Nations',
        author: 'Adam Smith',
      },
      {
        title: 'On Liberty',
        author: 'John Stuart Mill',
      },
    ],
  },
  {
    id: 'vine-indigenous',
    name: 'Indigenous & Oral',
    type: 'vine',
    emoji: '🌍',
    themes: ['land', 'reciprocity', 'animacy'],
    gifts: ['ecological intelligence', 'non-dual cosmologies'],
    description: 'Often grow below the canopy, surviving fires others set.',
    color: '#2e7d32',
    thickness: 8,
    timePeriod: 'c. 10000 BCE - present',
    timeStart: -10000,
    timeEnd: 2024,
    longitude: -100.0, // Americas (approximate center)
  },
];

// Cross-Vines (forces that weave through all) - span across time and longitudes
export const crossVines: CivilizationNode[] = [
  {
    id: 'cross-trade',
    name: 'Trade',
    type: 'cross-vine',
    themes: ['exchange', 'connection', 'diffusion'],
    gifts: ['commerce', 'cultural exchange', 'technology transfer'],
    color: '#ff9800',
    thickness: 3,
    timeStart: -5000,
    timeEnd: 2024,
    longitude: 50, // Silk Road region
  },
  {
    id: 'cross-religion',
    name: 'Religion',
    type: 'cross-vine',
    themes: ['meaning', 'community', 'transcendence'],
    gifts: ['ethics', 'ritual', 'cosmology'],
    color: '#9c27b0',
    thickness: 4,
    timeStart: -10000,
    timeEnd: 2024,
    longitude: 35, // Middle East
  },
  {
    id: 'cross-war',
    name: 'War',
    type: 'cross-vine',
    themes: ['conflict', 'conquest', 'destruction'],
    gifts: ['military technology', 'state formation', 'cultural mixing'],
    color: '#d32f2f',
    thickness: 3,
    timeStart: -10000,
    timeEnd: 2024,
    longitude: 0, // Center
  },
  {
    id: 'cross-technology',
    name: 'Technology',
    type: 'cross-vine',
    themes: ['innovation', 'efficiency', 'transformation'],
    gifts: ['tools', 'machines', 'systems'],
    color: '#1976d2',
    thickness: 4,
    timeStart: -3000000,
    timeEnd: 2024,
    longitude: 0, // Universal
  },
  {
    id: 'cross-art',
    name: 'Art',
    type: 'cross-vine',
    themes: ['expression', 'beauty', 'meaning'],
    gifts: ['aesthetics', 'symbolism', 'cultural identity'],
    color: '#e91e63',
    thickness: 3,
    timeStart: -40000,
    timeEnd: 2024,
    longitude: 0, // Universal
  },
  {
    id: 'cross-law',
    name: 'Law',
    type: 'cross-vine',
    themes: ['order', 'justice', 'governance'],
    gifts: ['legal systems', 'rights', 'institutions'],
    color: '#424242',
    thickness: 3,
    timeStart: -3000,
    timeEnd: 2024,
    longitude: 44, // Mesopotamia origin
  },
  {
    id: 'cross-language-families',
    name: 'Language Families',
    type: 'cross-vine',
    themes: ['connection', 'migration', 'evolution'],
    gifts: ['linguistic kinship', 'cultural transmission', 'identity'],
    color: '#795548',
    thickness: 3,
    timeStart: -100000,
    timeEnd: 2024,
    longitude: 0, // Universal
  },
];

// All nodes
export const allCivilizationNodes = [...trunkNodes, ...majorVines, ...crossVines];

// Relations: How vines connect
export const civilizationRelations: CivilizationRelation[] = [
  // Trunk to major vines - all civilizations grow from the shared roots
  {
    id: 'rel-trunk-mesopotamian',
    from_id: 'trunk-language',
    to_id: 'vine-mesopotamian',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-egyptian',
    from_id: 'trunk-ritual',
    to_id: 'vine-egyptian',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-mediterranean',
    from_id: 'trunk-tools',
    to_id: 'vine-mediterranean',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-hebraic',
    from_id: 'trunk-kinship',
    to_id: 'vine-hebraic',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-indic',
    from_id: 'trunk-ritual',
    to_id: 'vine-indic',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-sinitic',
    from_id: 'trunk-tools',
    to_id: 'vine-sinitic',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-mesoamerican',
    from_id: 'trunk-ritual',
    to_id: 'vine-mesoamerican',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-indigenous',
    from_id: 'trunk-kinship',
    to_id: 'vine-indigenous',
    relation_type: 'grows_from',
  },
  
  // Inter-civilizational connections - how vines intertwine
  {
    id: 'rel-mesopotamian-egyptian',
    from_id: 'vine-mesopotamian',
    to_id: 'vine-egyptian',
    relation_type: 'pollinates',
    description: 'Early writing and administrative systems',
  },
  {
    id: 'rel-mediterranean-hebraic',
    from_id: 'vine-hebraic',
    to_id: 'vine-mediterranean',
    relation_type: 'grafts',
    description: 'Ethical and legal traditions merge',
  },
  {
    id: 'rel-mediterranean-egyptian',
    from_id: 'vine-egyptian',
    to_id: 'vine-mediterranean',
    relation_type: 'pollinates',
    description: 'Geometry, architecture, and symbolic systems',
  },
  {
    id: 'rel-islamic-medieval',
    from_id: 'vine-islamic',
    to_id: 'vine-medieval',
    relation_type: 'carries',
    description: 'Preserved and transmitted classical knowledge',
  },
  {
    id: 'rel-medieval-modern',
    from_id: 'vine-medieval',
    to_id: 'vine-modern',
    relation_type: 'grows_from',
    description: 'Scholastic method leads to scientific method',
  },
  {
    id: 'rel-mediterranean-modern',
    from_id: 'vine-mediterranean',
    to_id: 'vine-modern',
    relation_type: 'grafts',
    description: 'Classical philosophy and law inform modernity',
  },
  {
    id: 'rel-indic-sinitic',
    from_id: 'vine-indic',
    to_id: 'vine-sinitic',
    relation_type: 'pollinates',
    description: 'Buddhism, mathematics, and philosophical exchange',
  },
  {
    id: 'rel-modern-indigenous',
    from_id: 'vine-modern',
    to_id: 'vine-indigenous',
    relation_type: 'strangles',
    description: 'Colonial suppression, but also cross-pollination',
  },
  {
    id: 'rel-islamic-indic',
    from_id: 'vine-indic',
    to_id: 'vine-islamic',
    relation_type: 'pollinates',
    description: 'Mathematics, philosophy, and scientific methods',
  },
  
  // Cross-vines weave through civilizations
  // Trade connects many civilizations
  {
    id: 'rel-trade-mesopotamian',
    from_id: 'cross-trade',
    to_id: 'vine-mesopotamian',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-mediterranean',
    from_id: 'cross-trade',
    to_id: 'vine-mediterranean',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-sinitic',
    from_id: 'cross-trade',
    to_id: 'vine-sinitic',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-egyptian',
    from_id: 'cross-trade',
    to_id: 'vine-egyptian',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-indic',
    from_id: 'cross-trade',
    to_id: 'vine-indic',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-islamic',
    from_id: 'cross-trade',
    to_id: 'vine-islamic',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-medieval',
    from_id: 'cross-trade',
    to_id: 'vine-medieval',
    relation_type: 'carries',
  },
  {
    id: 'rel-trade-modern',
    from_id: 'cross-trade',
    to_id: 'vine-modern',
    relation_type: 'carries',
  },
  
  // Religion synthesizes with multiple traditions
  {
    id: 'rel-religion-hebraic',
    from_id: 'cross-religion',
    to_id: 'vine-hebraic',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-islamic',
    from_id: 'cross-religion',
    to_id: 'vine-islamic',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-medieval',
    from_id: 'cross-religion',
    to_id: 'vine-medieval',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-indic',
    from_id: 'cross-religion',
    to_id: 'vine-indic',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-egyptian',
    from_id: 'cross-religion',
    to_id: 'vine-egyptian',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-mesoamerican',
    from_id: 'cross-religion',
    to_id: 'vine-mesoamerican',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-indigenous',
    from_id: 'cross-religion',
    to_id: 'vine-indigenous',
    relation_type: 'synthesizes',
  },
  {
    id: 'rel-religion-sinitic',
    from_id: 'cross-religion',
    to_id: 'vine-sinitic',
    relation_type: 'synthesizes',
  },
  
  // Technology grafts onto various civilizations
  {
    id: 'rel-technology-modern',
    from_id: 'cross-technology',
    to_id: 'vine-modern',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-sinitic',
    from_id: 'cross-technology',
    to_id: 'vine-sinitic',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-mediterranean',
    from_id: 'cross-technology',
    to_id: 'vine-mediterranean',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-mesopotamian',
    from_id: 'cross-technology',
    to_id: 'vine-mesopotamian',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-egyptian',
    from_id: 'cross-technology',
    to_id: 'vine-egyptian',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-indic',
    from_id: 'cross-technology',
    to_id: 'vine-indic',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-mesoamerican',
    from_id: 'cross-technology',
    to_id: 'vine-mesoamerican',
    relation_type: 'grafts',
  },
  {
    id: 'rel-technology-indigenous',
    from_id: 'cross-technology',
    to_id: 'vine-indigenous',
    relation_type: 'grafts',
  },
  
  // Art pollinates civilizations
  {
    id: 'rel-art-mediterranean',
    from_id: 'cross-art',
    to_id: 'vine-mediterranean',
    relation_type: 'pollinates',
  },
  {
    id: 'rel-art-egyptian',
    from_id: 'cross-art',
    to_id: 'vine-egyptian',
    relation_type: 'pollinates',
  },
  {
    id: 'rel-art-mesoamerican',
    from_id: 'cross-art',
    to_id: 'vine-mesoamerican',
    relation_type: 'pollinates',
  },
  {
    id: 'rel-art-indic',
    from_id: 'cross-art',
    to_id: 'vine-indic',
    relation_type: 'pollinates',
  },
  {
    id: 'rel-art-sinitic',
    from_id: 'cross-art',
    to_id: 'vine-sinitic',
    relation_type: 'pollinates',
  },
  {
    id: 'rel-art-indigenous',
    from_id: 'cross-art',
    to_id: 'vine-indigenous',
    relation_type: 'pollinates',
  },
  
  // Law grows from and grafts onto civilizations
  {
    id: 'rel-law-mesopotamian',
    from_id: 'cross-law',
    to_id: 'vine-mesopotamian',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-law-mediterranean',
    from_id: 'cross-law',
    to_id: 'vine-mediterranean',
    relation_type: 'grafts',
  },
  {
    id: 'rel-law-modern',
    from_id: 'cross-law',
    to_id: 'vine-modern',
    relation_type: 'grafts',
  },
  {
    id: 'rel-law-hebraic',
    from_id: 'cross-law',
    to_id: 'vine-hebraic',
    relation_type: 'grafts',
  },
  {
    id: 'rel-law-medieval',
    from_id: 'cross-law',
    to_id: 'vine-medieval',
    relation_type: 'grafts',
  },
  
  // War strangles and sometimes pollinates
  {
    id: 'rel-war-modern',
    from_id: 'cross-war',
    to_id: 'vine-modern',
    relation_type: 'strangles',
  },
  {
    id: 'rel-war-mediterranean',
    from_id: 'cross-war',
    to_id: 'vine-mediterranean',
    relation_type: 'strangles',
  },
  {
    id: 'rel-war-mesoamerican',
    from_id: 'cross-war',
    to_id: 'vine-mesoamerican',
    relation_type: 'strangles',
  },
  {
    id: 'rel-war-indigenous',
    from_id: 'cross-war',
    to_id: 'vine-indigenous',
    relation_type: 'strangles',
  },
  
  // Language Families connects to all civilizations
  {
    id: 'rel-language-families-all',
    from_id: 'cross-language-families',
    to_id: 'vine-mesopotamian',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-egyptian',
    from_id: 'cross-language-families',
    to_id: 'vine-egyptian',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-mediterranean',
    from_id: 'cross-language-families',
    to_id: 'vine-mediterranean',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-hebraic',
    from_id: 'cross-language-families',
    to_id: 'vine-hebraic',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-islamic',
    from_id: 'cross-language-families',
    to_id: 'vine-islamic',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-indic',
    from_id: 'cross-language-families',
    to_id: 'vine-indic',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-sinitic',
    from_id: 'cross-language-families',
    to_id: 'vine-sinitic',
    relation_type: 'carries',
  },
  {
    id: 'rel-language-families-indigenous',
    from_id: 'cross-language-families',
    to_id: 'vine-indigenous',
    relation_type: 'carries',
  },
  
  // Additional inter-civilizational connections
  {
    id: 'rel-mesopotamian-mediterranean',
    from_id: 'vine-mesopotamian',
    to_id: 'vine-mediterranean',
    relation_type: 'pollinates',
    description: 'Writing, law, and administrative systems',
  },
  {
    id: 'rel-egyptian-hebraic',
    from_id: 'vine-egyptian',
    to_id: 'vine-hebraic',
    relation_type: 'pollinates',
    description: 'Monotheistic and symbolic traditions',
  },
  {
    id: 'rel-hebraic-islamic',
    from_id: 'vine-hebraic',
    to_id: 'vine-islamic',
    relation_type: 'grafts',
    description: 'Shared Abrahamic roots',
  },
  {
    id: 'rel-hebraic-medieval',
    from_id: 'vine-hebraic',
    to_id: 'vine-medieval',
    relation_type: 'grafts',
    description: 'Biblical and ethical foundations',
  },
  {
    id: 'rel-islamic-sinitic',
    from_id: 'vine-islamic',
    to_id: 'vine-sinitic',
    relation_type: 'pollinates',
    description: 'Scientific and mathematical exchange',
  },
  {
    id: 'rel-sinitic-modern',
    from_id: 'vine-sinitic',
    to_id: 'vine-modern',
    relation_type: 'pollinates',
    description: 'Paper, printing, and bureaucratic systems',
  },
  {
    id: 'rel-indic-islamic',
    from_id: 'vine-indic',
    to_id: 'vine-islamic',
    relation_type: 'pollinates',
    description: 'Mathematics and philosophy',
  },
  {
    id: 'rel-egyptian-mediterranean',
    from_id: 'vine-egyptian',
    to_id: 'vine-mediterranean',
    relation_type: 'pollinates',
    description: 'Geometry, architecture, and symbolic systems',
  },
  {
    id: 'rel-mesoamerican-modern',
    from_id: 'vine-mesoamerican',
    to_id: 'vine-modern',
    relation_type: 'strangles',
    description: 'Colonial encounter and cultural exchange',
  },
  
  // More trunk connections
  {
    id: 'rel-trunk-fire-technology',
    from_id: 'trunk-fire',
    to_id: 'cross-technology',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-language-all',
    from_id: 'trunk-language',
    to_id: 'cross-language-families',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-ritual-religion',
    from_id: 'trunk-ritual',
    to_id: 'cross-religion',
    relation_type: 'grows_from',
  },
  {
    id: 'rel-trunk-tools-technology',
    from_id: 'trunk-tools',
    to_id: 'cross-technology',
    relation_type: 'grows_from',
  },
];
