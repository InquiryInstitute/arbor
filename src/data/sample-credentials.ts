// Comprehensive credential data for Tree of Vines
// All 70 microcredentials across 10 colleges and all level bands
import type { Credential, CredentialRelation } from '../types/credential';

// Helper to generate IDs
const id = (level: string, college: string, slug: string) => 
  `${level}.${college}.${slug}`;

// College mapping from MICROCREDENTIALS.md to our college codes
const collegeMap: Record<string, 'MATH' | 'NAT' | 'HUM' | 'AINS' | 'ELA' | 'META' | 'SOC' | 'ARTS' | 'CEF' | 'HEAL'> = {
  'Form & Number': 'MATH',
  'Matter & Life': 'NAT',
  'Value & Virtue': 'HUM',
  'Mind & Machine': 'AINS',
  'Word & Meaning': 'ELA',
  'Learning & Becoming': 'META',
  'Time & Memory': 'HUM',
  'Society & Economy': 'SOC',
  'Culture & Creation': 'ARTS',
  'Spirit & Nature': 'CEF',
};

// Level mapping from MICROCREDENTIALS.md to our level bands
const levelMap: Record<string, 'K-1' | 'G2-3' | 'G4-6' | 'G7-8' | 'G9-10' | 'G11-12' | 'UG' | 'MS' | 'PhD'> = {
  'K-5': 'K-1',
  '6-8': 'G2-3',
  '9-12': 'G9-10',
  'Undergraduate': 'UG',
  'Graduate': 'MS',
  'PhD': 'PhD',
};

// Helper to create slug from title
const slugify = (title: string) => 
  title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const sampleCredentials: Credential[] = [
  // ============================================
  // 1. Form & Number (MATH)
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
    id: id('G9-10', 'MATH', 'algebraic-thinking'),
    title: 'Algebraic Thinking',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 2. Matter & Life (NAT)
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
    id: id('G9-10', 'NAT', 'evolution'),
    title: 'Evolution by Natural Selection',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 3. Value & Virtue (HUM)
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
    id: id('G9-10', 'HUM', 'moral-philosophy'),
    title: 'Moral Philosophy',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 4. Mind & Machine (AINS)
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
    id: id('G9-10', 'AINS', 'art-programming'),
    title: 'The Art of Programming',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 5. Word & Meaning (ELA)
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
    id: id('G9-10', 'ELA', 'literary-analysis'),
    title: 'Literary Analysis',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 6. Learning & Becoming (META)
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
    id: id('G9-10', 'META', 'cognitive-development'),
    title: 'Cognitive Development',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 7. Time & Memory (HUM - second branch)
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
    id: id('G9-10', 'HUM', 'historiography'),
    title: 'Historiography: How History is Written',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 8. Society & Economy (SOC)
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
    id: id('G9-10', 'SOC', 'political-theory'),
    title: 'Political Theory',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'G9-10',
    duration_weeks: 10,
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
  // 9. Culture & Creation (ARTS)
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
    id: id('G9-10', 'ARTS', 'aesthetics-beauty'),
    title: 'Aesthetics and Beauty',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'G9-10',
    duration_weeks: 10,
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
    id: id('MS', 'ARTS', 'art-criticism'),
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
  // 10. Spirit & Nature (CEF)
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
    id: id('G9-10', 'CEF', 'environmental-philosophy'),
    title: 'Environmental Philosophy',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'G9-10',
    duration_weeks: 10,
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
];

// Generate PREREQ relations (linear chains within each college)
export const sampleRelations: CredentialRelation[] = [
  // MATH chain
  { id: 'r-math-1', from_credential_id: id('K-1', 'MATH', 'counting-patterns'), to_credential_id: id('G2-3', 'MATH', 'art-arithmetic'), relation_type: 'PREREQ' },
  { id: 'r-math-2', from_credential_id: id('G2-3', 'MATH', 'art-arithmetic'), to_credential_id: id('G9-10', 'MATH', 'algebraic-thinking'), relation_type: 'PREREQ' },
  { id: 'r-math-3', from_credential_id: id('G9-10', 'MATH', 'algebraic-thinking'), to_credential_id: id('UG', 'MATH', 'calculus'), relation_type: 'PREREQ' },
  { id: 'r-math-4', from_credential_id: id('UG', 'MATH', 'calculus'), to_credential_id: id('MS', 'MATH', 'infinity-set-theory'), relation_type: 'PREREQ' },
  { id: 'r-math-5', from_credential_id: id('MS', 'MATH', 'infinity-set-theory'), to_credential_id: id('PhD', 'MATH', 'topology'), relation_type: 'PREREQ' },

  // NAT chain
  { id: 'r-nat-1', from_credential_id: id('K-1', 'NAT', 'what-alive'), to_credential_id: id('G2-3', 'NAT', 'cell-unit-life'), relation_type: 'PREREQ' },
  { id: 'r-nat-2', from_credential_id: id('G2-3', 'NAT', 'cell-unit-life'), to_credential_id: id('G9-10', 'NAT', 'evolution'), relation_type: 'PREREQ' },
  { id: 'r-nat-3', from_credential_id: id('G9-10', 'NAT', 'evolution'), to_credential_id: id('UG', 'NAT', 'genetics'), relation_type: 'PREREQ' },
  { id: 'r-nat-4', from_credential_id: id('UG', 'NAT', 'genetics'), to_credential_id: id('MS', 'NAT', 'molecular-bio'), relation_type: 'PREREQ' },
  { id: 'r-nat-5', from_credential_id: id('MS', 'NAT', 'molecular-bio'), to_credential_id: id('PhD', 'NAT', 'systems-bio'), relation_type: 'PREREQ' },

  // HUM (Value & Virtue) chain
  { id: 'r-hum-vv-1', from_credential_id: id('K-1', 'HUM', 'what-fair'), to_credential_id: id('G2-3', 'HUM', 'intro-ethics'), relation_type: 'PREREQ' },
  { id: 'r-hum-vv-2', from_credential_id: id('G2-3', 'HUM', 'intro-ethics'), to_credential_id: id('G9-10', 'HUM', 'moral-philosophy'), relation_type: 'PREREQ' },
  { id: 'r-hum-vv-3', from_credential_id: id('G9-10', 'HUM', 'moral-philosophy'), to_credential_id: id('UG', 'HUM', 'existential-ethics'), relation_type: 'PREREQ' },
  { id: 'r-hum-vv-4', from_credential_id: id('UG', 'HUM', 'existential-ethics'), to_credential_id: id('MS', 'HUM', 'beyond-good-evil'), relation_type: 'PREREQ' },
  { id: 'r-hum-vv-5', from_credential_id: id('MS', 'HUM', 'beyond-good-evil'), to_credential_id: id('PhD', 'HUM', 'metaethics'), relation_type: 'PREREQ' },

  // AINS chain
  { id: 'r-ains-1', from_credential_id: id('K-1', 'AINS', 'how-think'), to_credential_id: id('G2-3', 'AINS', 'intro-computation'), relation_type: 'PREREQ' },
  { id: 'r-ains-2', from_credential_id: id('G2-3', 'AINS', 'intro-computation'), to_credential_id: id('G9-10', 'AINS', 'art-programming'), relation_type: 'PREREQ' },
  { id: 'r-ains-3', from_credential_id: id('G9-10', 'AINS', 'art-programming'), to_credential_id: id('UG', 'AINS', 'artificial-intelligence'), relation_type: 'PREREQ' },
  { id: 'r-ains-4', from_credential_id: id('UG', 'AINS', 'artificial-intelligence'), to_credential_id: id('MS', 'AINS', 'machine-learning'), relation_type: 'PREREQ' },
  { id: 'r-ains-5', from_credential_id: id('MS', 'AINS', 'machine-learning'), to_credential_id: id('PhD', 'AINS', 'consciousness'), relation_type: 'PREREQ' },

  // ELA chain
  { id: 'r-ela-1', from_credential_id: id('K-1', 'ELA', 'power-stories'), to_credential_id: id('G2-3', 'ELA', 'language-meaning'), relation_type: 'PREREQ' },
  { id: 'r-ela-2', from_credential_id: id('G2-3', 'ELA', 'language-meaning'), to_credential_id: id('G9-10', 'ELA', 'literary-analysis'), relation_type: 'PREREQ' },
  { id: 'r-ela-3', from_credential_id: id('G9-10', 'ELA', 'literary-analysis'), to_credential_id: id('UG', 'ELA', 'hermeneutics'), relation_type: 'PREREQ' },
  { id: 'r-ela-4', from_credential_id: id('UG', 'ELA', 'hermeneutics'), to_credential_id: id('MS', 'ELA', 'semiotics'), relation_type: 'PREREQ' },
  { id: 'r-ela-5', from_credential_id: id('MS', 'ELA', 'semiotics'), to_credential_id: id('PhD', 'ELA', 'deconstruction'), relation_type: 'PREREQ' },

  // META chain
  { id: 'r-meta-1', from_credential_id: id('K-1', 'META', 'learning-discovery'), to_credential_id: id('G2-3', 'META', 'art-teaching'), relation_type: 'PREREQ' },
  { id: 'r-meta-2', from_credential_id: id('G2-3', 'META', 'art-teaching'), to_credential_id: id('G9-10', 'META', 'cognitive-development'), relation_type: 'PREREQ' },
  { id: 'r-meta-3', from_credential_id: id('G9-10', 'META', 'cognitive-development'), to_credential_id: id('UG', 'META', 'constructivist-learning'), relation_type: 'PREREQ' },
  { id: 'r-meta-4', from_credential_id: id('UG', 'META', 'constructivist-learning'), to_credential_id: id('MS', 'META', 'adult-learning'), relation_type: 'PREREQ' },
  { id: 'r-meta-5', from_credential_id: id('MS', 'META', 'adult-learning'), to_credential_id: id('PhD', 'META', 'lifelong-learning'), relation_type: 'PREREQ' },

  // HUM (Time & Memory) chain
  { id: 'r-hum-tm-1', from_credential_id: id('K-1', 'HUM', 'what-history'), to_credential_id: id('G2-3', 'HUM', 'historical-sources'), relation_type: 'PREREQ' },
  { id: 'r-hum-tm-2', from_credential_id: id('G2-3', 'HUM', 'historical-sources'), to_credential_id: id('G9-10', 'HUM', 'historiography'), relation_type: 'PREREQ' },
  { id: 'r-hum-tm-3', from_credential_id: id('G9-10', 'HUM', 'historiography'), to_credential_id: id('UG', 'HUM', 'memory-studies'), relation_type: 'PREREQ' },
  { id: 'r-hum-tm-4', from_credential_id: id('UG', 'HUM', 'memory-studies'), to_credential_id: id('MS', 'HUM', 'philosophy-history'), relation_type: 'PREREQ' },
  { id: 'r-hum-tm-5', from_credential_id: id('MS', 'HUM', 'philosophy-history'), to_credential_id: id('PhD', 'HUM', 'temporal-being'), relation_type: 'PREREQ' },

  // SOC chain
  { id: 'r-soc-1', from_credential_id: id('K-1', 'SOC', 'living-community'), to_credential_id: id('G2-3', 'SOC', 'government-society'), relation_type: 'PREREQ' },
  { id: 'r-soc-2', from_credential_id: id('G2-3', 'SOC', 'government-society'), to_credential_id: id('G9-10', 'SOC', 'political-theory'), relation_type: 'PREREQ' },
  { id: 'r-soc-3', from_credential_id: id('G9-10', 'SOC', 'political-theory'), to_credential_id: id('UG', 'SOC', 'economic-systems'), relation_type: 'PREREQ' },
  { id: 'r-soc-4', from_credential_id: id('UG', 'SOC', 'economic-systems'), to_credential_id: id('MS', 'SOC', 'capital-political-economy'), relation_type: 'PREREQ' },
  { id: 'r-soc-5', from_credential_id: id('MS', 'SOC', 'capital-political-economy'), to_credential_id: id('PhD', 'SOC', 'advanced-social-theory'), relation_type: 'PREREQ' },

  // ARTS chain
  { id: 'r-arts-1', from_credential_id: id('K-1', 'ARTS', 'making-creating'), to_credential_id: id('G2-3', 'ARTS', 'nature-art'), relation_type: 'PREREQ' },
  { id: 'r-arts-2', from_credential_id: id('G2-3', 'ARTS', 'nature-art'), to_credential_id: id('G9-10', 'ARTS', 'aesthetics-beauty'), relation_type: 'PREREQ' },
  { id: 'r-arts-3', from_credential_id: id('G9-10', 'ARTS', 'aesthetics-beauty'), to_credential_id: id('UG', 'ARTS', 'art-history'), relation_type: 'PREREQ' },
  { id: 'r-arts-4', from_credential_id: id('UG', 'ARTS', 'art-history'), to_credential_id: id('MS', 'ARTS', 'art-criticism'), relation_type: 'PREREQ' },
  { id: 'r-arts-5', from_credential_id: id('MS', 'ARTS', 'art-criticism'), to_credential_id: id('PhD', 'ARTS', 'philosophy-art'), relation_type: 'PREREQ' },

  // CEF chain
  { id: 'r-cef-1', from_credential_id: id('K-1', 'CEF', 'wonder-natural-world'), to_credential_id: id('G2-3', 'CEF', 'ecology-interconnection'), relation_type: 'PREREQ' },
  { id: 'r-cef-2', from_credential_id: id('G2-3', 'CEF', 'ecology-interconnection'), to_credential_id: id('G9-10', 'CEF', 'environmental-philosophy'), relation_type: 'PREREQ' },
  { id: 'r-cef-3', from_credential_id: id('G9-10', 'CEF', 'environmental-philosophy'), to_credential_id: id('UG', 'CEF', 'deep-ecology'), relation_type: 'PREREQ' },
  { id: 'r-cef-4', from_credential_id: id('UG', 'CEF', 'deep-ecology'), to_credential_id: id('MS', 'CEF', 'theology-nature'), relation_type: 'PREREQ' },
  { id: 'r-cef-5', from_credential_id: id('MS', 'CEF', 'theology-nature'), to_credential_id: id('PhD', 'CEF', 'transcendence-sacred'), relation_type: 'PREREQ' },
];
