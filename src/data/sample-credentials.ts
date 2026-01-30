// Comprehensive credential data for Tree of Vines
// Full K-PhD+ progression with all level bands and cross-college prerequisites
import type { Credential, CredentialRelation } from '../types/credential';

// Helper to generate IDs
const id = (level: string, college: string, slug: string) => 
  `${level}.${college}.${slug}`;

export const sampleCredentials: Credential[] = [
  // ============================================
  // 1. Form & Number (MATH) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'MATH', 'counting-patterns'),
    title: 'Counting and Patterns',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'MATH', 'art-arithmetic'),
    title: 'The Art of Arithmetic',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'MATH', 'fractions-decimals'),
    title: 'Fractions, Decimals, and Ratios',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'MATH', 'pre-algebra'),
    title: 'Pre-Algebra Foundations',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'MATH', 'algebraic-thinking'),
    title: 'Algebraic Thinking',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'MATH', 'functions-analysis'),
    title: 'Functions and Analysis',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'MATH', 'calculus'),
    title: 'Calculus: The Mathematics of Change',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'UG',
    duration_weeks: 14,
  },
  {
    id: id('MS', 'MATH', 'infinity-set-theory'),
    title: 'Infinity and Set Theory',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'MS',
    duration_weeks: 12,
  },
  {
    id: id('PhD', 'MATH', 'topology'),
    title: 'Topology: The Shape of Space',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 2. Matter & Life (NAT) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'NAT', 'what-alive'),
    title: 'What Makes Something Alive?',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'NAT', 'cell-unit-life'),
    title: 'The Cell: Unit of Life',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'NAT', 'ecosystems'),
    title: 'Ecosystems and Interdependence',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'NAT', 'matter-energy'),
    title: 'Matter, Energy, and Change',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'NAT', 'evolution'),
    title: 'Evolution by Natural Selection',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'NAT', 'molecular-foundations'),
    title: 'Molecular Foundations of Life',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'NAT', 'genetics'),
    title: 'Genetics and Heredity',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'NAT', 'molecular-bio'),
    title: 'Molecular Biology',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'NAT', 'systems-bio'),
    title: 'Systems Biology',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 3. Value & Virtue (HUM) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'HUM', 'what-fair'),
    title: 'What is Fair?',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'HUM', 'intro-ethics'),
    title: 'Introduction to Ethics',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'HUM', 'virtue-character'),
    title: 'Virtue and Character',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'HUM', 'moral-reasoning'),
    title: 'Moral Reasoning',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'HUM', 'moral-philosophy'),
    title: 'Moral Philosophy',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'HUM', 'ethical-theories'),
    title: 'Ethical Theories and Applications',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'HUM', 'existential-ethics'),
    title: 'Existential Ethics',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'HUM', 'beyond-good-evil'),
    title: 'Beyond Good and Evil',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'HUM', 'metaethics'),
    title: 'Metaethics',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 4. Mind & Machine (AINS) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'AINS', 'how-think'),
    title: 'How Do We Think?',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'AINS', 'intro-computation'),
    title: 'Introduction to Computation',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'AINS', 'algorithms-logic'),
    title: 'Algorithms and Logic',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'AINS', 'programming-fundamentals'),
    title: 'Programming Fundamentals',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'AINS', 'art-programming'),
    title: 'The Art of Programming',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'AINS', 'data-structures'),
    title: 'Data Structures and Algorithms',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'AINS', 'artificial-intelligence'),
    title: 'Artificial Intelligence',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'AINS', 'machine-learning'),
    title: 'Machine Learning and Neural Networks',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'AINS', 'consciousness'),
    title: 'Consciousness and Machine Minds',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 5. Word & Meaning (ELA) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'ELA', 'power-stories'),
    title: 'The Power of Stories',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'ELA', 'language-meaning'),
    title: 'Language and Meaning',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'ELA', 'reading-writing'),
    title: 'Reading and Writing Deeply',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'ELA', 'literary-forms'),
    title: 'Literary Forms and Genres',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'ELA', 'literary-analysis'),
    title: 'Literary Analysis',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'ELA', 'rhetoric-argument'),
    title: 'Rhetoric and Argumentation',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'ELA', 'hermeneutics'),
    title: 'Hermeneutics: The Art of Interpretation',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'ELA', 'semiotics'),
    title: 'Semiotics and Sign Systems',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'ELA', 'deconstruction'),
    title: 'Deconstruction and Textuality',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 6. Learning & Becoming (META) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'META', 'learning-discovery'),
    title: 'Learning Through Discovery',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'META', 'art-teaching'),
    title: 'The Art of Teaching',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'META', 'learning-strategies'),
    title: 'Learning Strategies and Metacognition',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'META', 'critical-thinking'),
    title: 'Critical Thinking and Inquiry',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'META', 'cognitive-development'),
    title: 'Cognitive Development',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'META', 'epistemology'),
    title: 'Epistemology: How We Know',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'META', 'constructivist-learning'),
    title: 'Constructivist Learning Theory',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'META', 'adult-learning'),
    title: 'Adult Learning and Andragogy',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'META', 'lifelong-learning'),
    title: 'Lifelong Learning and Becoming',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 7. Time & Memory (HUM - second branch) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'HUM', 'what-history'),
    title: 'What is History?',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'HUM', 'historical-sources'),
    title: 'Historical Sources and Evidence',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'HUM', 'world-civilizations'),
    title: 'World Civilizations',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'HUM', 'historical-thinking'),
    title: 'Historical Thinking and Analysis',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'HUM', 'historiography'),
    title: 'Historiography: How History is Written',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'HUM', 'historical-methods'),
    title: 'Historical Methods and Research',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'HUM', 'memory-studies'),
    title: 'Memory Studies',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'HUM', 'philosophy-history'),
    title: 'Philosophy of History',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'HUM', 'temporal-being'),
    title: 'Temporality and Historical Being',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 8. Society & Economy (SOC) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'SOC', 'living-community'),
    title: 'Living Together in Community',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'SOC', 'government-society'),
    title: 'Government and Society',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'SOC', 'civics-citizenship'),
    title: 'Civics and Citizenship',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'SOC', 'social-systems'),
    title: 'Social Systems and Institutions',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'SOC', 'political-theory'),
    title: 'Political Theory',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'SOC', 'political-economy'),
    title: 'Political Economy',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'SOC', 'economic-systems'),
    title: 'Economic Systems and Theory',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'SOC', 'capital-political-economy'),
    title: 'Capital and Political Economy',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'SOC', 'advanced-social-theory'),
    title: 'Advanced Social Theory',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 9. Culture & Creation (ARTS) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'ARTS', 'making-creating'),
    title: 'Making and Creating',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'ARTS', 'nature-art'),
    title: 'The Nature of Art',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'ARTS', 'artistic-expression'),
    title: 'Artistic Expression and Media',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'ARTS', 'art-criticism'),
    title: 'Art Criticism and Analysis',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'ARTS', 'aesthetics-beauty'),
    title: 'Aesthetics and Beauty',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'ARTS', 'art-movements'),
    title: 'Art Movements and Context',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'ARTS', 'art-history'),
    title: 'Art History and Cultural Context',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'ARTS', 'art-criticism-theory'),
    title: 'Art Criticism and Theory',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'ARTS', 'philosophy-art'),
    title: 'Philosophy of Art',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // 10. Spirit & Nature (CEF) - Full K-PhD progression
  // ============================================
  {
    id: id('K-1', 'CEF', 'wonder-natural-world'),
    title: 'Wonder at the Natural World',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('G2-3', 'CEF', 'ecology-interconnection'),
    title: 'Ecology and Interconnection',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G4-6', 'CEF', 'environmental-stewardship'),
    title: 'Environmental Stewardship',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G4-6',
    duration_weeks: 10,
  },
  {
    id: id('G7-8', 'CEF', 'sustainability'),
    title: 'Sustainability and Systems',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G7-8',
    duration_weeks: 10,
  },
  {
    id: id('G9-10', 'CEF', 'environmental-philosophy'),
    title: 'Environmental Philosophy',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G9-10',
    duration_weeks: 10,
  },
  {
    id: id('G11-12', 'CEF', 'ecological-ethics'),
    title: 'Ecological Ethics',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G11-12',
    duration_weeks: 12,
  },
  {
    id: id('UG', 'CEF', 'deep-ecology'),
    title: 'Deep Ecology',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'UG',
    duration_weeks: 12,
  },
  {
    id: id('MS', 'CEF', 'theology-nature'),
    title: 'Theology and Nature',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'MS',
    duration_weeks: 14,
  },
  {
    id: id('PhD', 'CEF', 'transcendence-sacred'),
    title: 'Transcendence and the Sacred',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'PhD',
    duration_weeks: 16,
  },

  // ============================================
  // Faculty Level (Canopy) - All Colleges
  // ============================================
  {
    id: id('Faculty', 'MATH', 'mathematical-philosophy'),
    title: 'Mathematical Philosophy',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'NAT', 'philosophy-of-science'),
    title: 'Philosophy of Science',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'HUM', 'philosophical-synthesis'),
    title: 'Philosophical Synthesis',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'AINS', 'philosophy-of-ai'),
    title: 'Philosophy of Artificial Intelligence',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'ELA', 'philosophy-of-language'),
    title: 'Philosophy of Language',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'META', 'philosophy-of-education'),
    title: 'Philosophy of Education',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'SOC', 'critical-social-theory'),
    title: 'Critical Social Theory',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'ARTS', 'aesthetic-philosophy'),
    title: 'Aesthetic Philosophy',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
  {
    id: id('Faculty', 'CEF', 'environmental-philosophy-advanced'),
    title: 'Advanced Environmental Philosophy',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'Faculty',
    duration_weeks: 16,
  },
];

// Generate PREREQ relations (linear chains within each college)
const generatePrereqChain = (
  college: string,
  levels: string[],
  slugs: string[]
): CredentialRelation[] => {
  const relations: CredentialRelation[] = [];
  for (let i = 0; i < levels.length - 1; i++) {
    relations.push({
      id: `prereq-${college}-${i + 1}`,
      from_credential_id: id(levels[i], college, slugs[i]),
      to_credential_id: id(levels[i + 1], college, slugs[i + 1]),
      relation_type: 'PREREQ',
    });
  }
  return relations;
};

export const sampleRelations: CredentialRelation[] = [
  // MATH chain (K-1 → Faculty)
  ...generatePrereqChain('MATH', 
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['counting-patterns', 'art-arithmetic', 'fractions-decimals', 'pre-algebra', 'algebraic-thinking', 'functions-analysis', 'calculus', 'infinity-set-theory', 'topology', 'mathematical-philosophy']
  ),

  // NAT chain
  ...generatePrereqChain('NAT',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['what-alive', 'cell-unit-life', 'ecosystems', 'matter-energy', 'evolution', 'molecular-foundations', 'genetics', 'molecular-bio', 'systems-bio', 'philosophy-of-science']
  ),

  // HUM (Value & Virtue) chain
  ...generatePrereqChain('HUM',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['what-fair', 'intro-ethics', 'virtue-character', 'moral-reasoning', 'moral-philosophy', 'ethical-theories', 'existential-ethics', 'beyond-good-evil', 'metaethics', 'philosophical-synthesis']
  ),

  // AINS chain
  ...generatePrereqChain('AINS',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['how-think', 'intro-computation', 'algorithms-logic', 'programming-fundamentals', 'art-programming', 'data-structures', 'artificial-intelligence', 'machine-learning', 'consciousness', 'philosophy-of-ai']
  ),

  // ELA chain
  ...generatePrereqChain('ELA',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['power-stories', 'language-meaning', 'reading-writing', 'literary-forms', 'literary-analysis', 'rhetoric-argument', 'hermeneutics', 'semiotics', 'deconstruction', 'philosophy-of-language']
  ),

  // META chain
  ...generatePrereqChain('META',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['learning-discovery', 'art-teaching', 'learning-strategies', 'critical-thinking', 'cognitive-development', 'epistemology', 'constructivist-learning', 'adult-learning', 'lifelong-learning', 'philosophy-of-education']
  ),

  // HUM (Time & Memory) chain - Note: HUM has two branches, this one uses same Faculty node
  ...generatePrereqChain('HUM',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD'],
    ['what-history', 'historical-sources', 'world-civilizations', 'historical-thinking', 'historiography', 'historical-methods', 'memory-studies', 'philosophy-history', 'temporal-being']
  ),
  // Connect Time & Memory branch to Faculty
  { id: 'prereq-hum-tm-faculty', from_credential_id: id('PhD', 'HUM', 'temporal-being'), to_credential_id: id('Faculty', 'HUM', 'philosophical-synthesis'), relation_type: 'PREREQ' },

  // SOC chain
  ...generatePrereqChain('SOC',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['living-community', 'government-society', 'civics-citizenship', 'social-systems', 'political-theory', 'political-economy', 'economic-systems', 'capital-political-economy', 'advanced-social-theory', 'critical-social-theory']
  ),

  // ARTS chain
  ...generatePrereqChain('ARTS',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['making-creating', 'nature-art', 'artistic-expression', 'art-criticism', 'aesthetics-beauty', 'art-movements', 'art-history', 'art-criticism-theory', 'philosophy-art', 'aesthetic-philosophy']
  ),

  // CEF chain
  ...generatePrereqChain('CEF',
    ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'],
    ['wonder-natural-world', 'ecology-interconnection', 'environmental-stewardship', 'sustainability', 'environmental-philosophy', 'ecological-ethics', 'deep-ecology', 'theology-nature', 'transcendence-sacred', 'environmental-philosophy-advanced']
  ),

  // ============================================
  // Cross-college prerequisites
  // ============================================
  
  // MATH supports NAT (quantitative biology needs math)
  { id: 'cross-math-nat-1', from_credential_id: id('G7-8', 'MATH', 'pre-algebra'), to_credential_id: id('G9-10', 'NAT', 'evolution'), relation_type: 'RECOMMENDED' },
  { id: 'cross-math-nat-2', from_credential_id: id('G11-12', 'MATH', 'functions-analysis'), to_credential_id: id('UG', 'NAT', 'genetics'), relation_type: 'PREREQ' },
  { id: 'cross-math-nat-3', from_credential_id: id('UG', 'MATH', 'calculus'), to_credential_id: id('MS', 'NAT', 'molecular-bio'), relation_type: 'RECOMMENDED' },

  // MATH supports AINS (computation needs math)
  { id: 'cross-math-ains-1', from_credential_id: id('G4-6', 'MATH', 'fractions-decimals'), to_credential_id: id('G7-8', 'AINS', 'programming-fundamentals'), relation_type: 'RECOMMENDED' },
  { id: 'cross-math-ains-2', from_credential_id: id('G9-10', 'MATH', 'algebraic-thinking'), to_credential_id: id('G11-12', 'AINS', 'data-structures'), relation_type: 'PREREQ' },
  { id: 'cross-math-ains-3', from_credential_id: id('UG', 'MATH', 'calculus'), to_credential_id: id('UG', 'AINS', 'artificial-intelligence'), relation_type: 'RECOMMENDED' },

  // ELA supports HUM (reading/writing needed for philosophy/history)
  { id: 'cross-ela-hum-1', from_credential_id: id('G4-6', 'ELA', 'reading-writing'), to_credential_id: id('G7-8', 'HUM', 'moral-reasoning'), relation_type: 'RECOMMENDED' },
  { id: 'cross-ela-hum-2', from_credential_id: id('G9-10', 'ELA', 'literary-analysis'), to_credential_id: id('G9-10', 'HUM', 'moral-philosophy'), relation_type: 'RECOMMENDED' },
  { id: 'cross-ela-hum-3', from_credential_id: id('G11-12', 'ELA', 'rhetoric-argument'), to_credential_id: id('G11-12', 'HUM', 'ethical-theories'), relation_type: 'RECOMMENDED' },
  { id: 'cross-ela-hum-4', from_credential_id: id('G4-6', 'ELA', 'reading-writing'), to_credential_id: id('G7-8', 'HUM', 'historical-thinking'), relation_type: 'RECOMMENDED' },
  { id: 'cross-ela-hum-5', from_credential_id: id('G9-10', 'ELA', 'literary-analysis'), to_credential_id: id('G9-10', 'HUM', 'historiography'), relation_type: 'RECOMMENDED' },

  // ELA supports SOC (communication for civics)
  { id: 'cross-ela-soc-1', from_credential_id: id('G4-6', 'ELA', 'reading-writing'), to_credential_id: id('G4-6', 'SOC', 'civics-citizenship'), relation_type: 'RECOMMENDED' },
  { id: 'cross-ela-soc-2', from_credential_id: id('G11-12', 'ELA', 'rhetoric-argument'), to_credential_id: id('G9-10', 'SOC', 'political-theory'), relation_type: 'RECOMMENDED' },

  // NAT supports CEF (biology for ecology)
  { id: 'cross-nat-cef-1', from_credential_id: id('G2-3', 'NAT', 'cell-unit-life'), to_credential_id: id('G2-3', 'CEF', 'ecology-interconnection'), relation_type: 'RECOMMENDED' },
  { id: 'cross-nat-cef-2', from_credential_id: id('G4-6', 'NAT', 'ecosystems'), to_credential_id: id('G4-6', 'CEF', 'environmental-stewardship'), relation_type: 'RECOMMENDED' },
  { id: 'cross-nat-cef-3', from_credential_id: id('G9-10', 'NAT', 'evolution'), to_credential_id: id('G9-10', 'CEF', 'environmental-philosophy'), relation_type: 'RECOMMENDED' },

  // META supports all (learning about learning helps everything)
  { id: 'cross-meta-1', from_credential_id: id('G4-6', 'META', 'learning-strategies'), to_credential_id: id('G7-8', 'MATH', 'pre-algebra'), relation_type: 'RECOMMENDED' },
  { id: 'cross-meta-2', from_credential_id: id('G4-6', 'META', 'learning-strategies'), to_credential_id: id('G7-8', 'ELA', 'literary-forms'), relation_type: 'RECOMMENDED' },
  { id: 'cross-meta-3', from_credential_id: id('G7-8', 'META', 'critical-thinking'), to_credential_id: id('G9-10', 'HUM', 'moral-philosophy'), relation_type: 'RECOMMENDED' },
  { id: 'cross-meta-4', from_credential_id: id('G7-8', 'META', 'critical-thinking'), to_credential_id: id('G9-10', 'SOC', 'political-theory'), relation_type: 'RECOMMENDED' },
];
