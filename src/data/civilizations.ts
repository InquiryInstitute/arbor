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
}

export interface CivilizationRelation {
  id: string;
  from_id: string;
  to_id: string;
  relation_type: 'grows_from' | 'grafts' | 'pollinates' | 'strangles' | 'carries' | 'synthesizes';
  description?: string;
}

// Trunk (pre-vines, deep roots)
export const trunkNodes: CivilizationNode[] = [
  {
    id: 'trunk-language',
    name: 'Language',
    type: 'trunk',
    themes: ['communication', 'abstraction', 'memory'],
    gifts: ['symbolic thought', 'narrative', 'transmission'],
    color: '#4a4a4a',
  },
  {
    id: 'trunk-fire',
    name: 'Fire',
    type: 'trunk',
    themes: ['transformation', 'energy', 'control'],
    gifts: ['cooking', 'metallurgy', 'ceramics'],
    color: '#8b4513',
  },
  {
    id: 'trunk-ritual',
    name: 'Ritual',
    type: 'trunk',
    themes: ['meaning', 'order', 'continuity'],
    gifts: ['ceremony', 'calendar', 'social cohesion'],
    color: '#5d4037',
  },
  {
    id: 'trunk-tools',
    name: 'Tool-making',
    type: 'trunk',
    themes: ['extension', 'efficiency', 'adaptation'],
    gifts: ['technology', 'craft', 'innovation'],
    color: '#616161',
  },
  {
    id: 'trunk-kinship',
    name: 'Kinship & Myth',
    type: 'trunk',
    themes: ['identity', 'belonging', 'narrative'],
    gifts: ['social structure', 'cosmology', 'tradition'],
    color: '#424242',
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
  },
];

// Cross-Vines (forces that weave through all)
export const crossVines: CivilizationNode[] = [
  {
    id: 'cross-trade',
    name: 'Trade',
    type: 'cross-vine',
    themes: ['exchange', 'connection', 'diffusion'],
    gifts: ['commerce', 'cultural exchange', 'technology transfer'],
    color: '#ff9800',
    thickness: 3,
  },
  {
    id: 'cross-religion',
    name: 'Religion',
    type: 'cross-vine',
    themes: ['meaning', 'community', 'transcendence'],
    gifts: ['ethics', 'ritual', 'cosmology'],
    color: '#9c27b0',
    thickness: 4,
  },
  {
    id: 'cross-war',
    name: 'War',
    type: 'cross-vine',
    themes: ['conflict', 'conquest', 'destruction'],
    gifts: ['military technology', 'state formation', 'cultural mixing'],
    color: '#d32f2f',
    thickness: 3,
  },
  {
    id: 'cross-technology',
    name: 'Technology',
    type: 'cross-vine',
    themes: ['innovation', 'efficiency', 'transformation'],
    gifts: ['tools', 'machines', 'systems'],
    color: '#1976d2',
    thickness: 4,
  },
  {
    id: 'cross-art',
    name: 'Art',
    type: 'cross-vine',
    themes: ['expression', 'beauty', 'meaning'],
    gifts: ['aesthetics', 'symbolism', 'cultural identity'],
    color: '#e91e63',
    thickness: 3,
  },
  {
    id: 'cross-law',
    name: 'Law',
    type: 'cross-vine',
    themes: ['order', 'justice', 'governance'],
    gifts: ['legal systems', 'rights', 'institutions'],
    color: '#424242',
    thickness: 3,
  },
  {
    id: 'cross-language-families',
    name: 'Language Families',
    type: 'cross-vine',
    themes: ['connection', 'migration', 'evolution'],
    gifts: ['linguistic kinship', 'cultural transmission', 'identity'],
    color: '#795548',
    thickness: 3,
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
];
