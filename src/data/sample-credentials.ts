// Comprehensive credential data for Tree of Vines
// Based on the Mermaid diagram structure with all 10 colleges and multiple level bands
import type { Credential, CredentialRelation } from '../types/credential';

// Helper to generate IDs
const id = (level: string, college: string, type: string, num: string) => 
  `${level}.${college}.${type}.${num}`;

export const sampleCredentials: Credential[] = [
  // ============================================
  // K-1 LEVEL (Roots) - All 10 Colleges
  // ============================================
  
  // ELA Vine - K-1
  {
    id: id('K1', 'ELA', 'LIT', 'S1'),
    title: 'Stories & Sounds',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'ELA', 'PHON', 'M1'),
    title: 'Phonemic Play',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ELA', 'LIT', 'S1'),
  },
  {
    id: id('K1', 'ELA', 'LETTERS', 'M2'),
    title: 'Letters & Hand',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ELA', 'LIT', 'S1'),
  },
  {
    id: id('K1', 'ELA', 'READ', 'M3'),
    title: 'Early Decoding',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ELA', 'LIT', 'S1'),
  },
  
  // MATH Vine - K-1
  {
    id: id('K1', 'MATH', 'NUM', 'S1'),
    title: 'Number Sense I',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'MATH', 'COUNT', 'M1'),
    title: 'Counting & Cardinality',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'MATH', 'NUM', 'S1'),
  },
  {
    id: id('K1', 'MATH', 'COMP', 'M2'),
    title: 'Compare & Order',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'MATH', 'NUM', 'S1'),
  },
  {
    id: id('K1', 'MATH', 'ADD', 'M3'),
    title: 'Join & Separate (Intro)',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'MATH', 'NUM', 'S1'),
  },
  
  // NAT Vine - K-1
  {
    id: id('K1', 'NAT', 'WORLD', 'S1'),
    title: 'Senses & Seasons',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'NAT', 'OBS', 'M1'),
    title: 'Observe & Describe',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'NAT', 'WORLD', 'S1'),
  },
  {
    id: id('K1', 'NAT', 'SEAS', 'M2'),
    title: 'Seasonal Patterns',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'NAT', 'WORLD', 'S1'),
  },
  {
    id: id('K1', 'NAT', 'CARE', 'M3'),
    title: 'Care of Living Things',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'NAT', 'WORLD', 'S1'),
  },
  
  // SOC Vine - K-1
  {
    id: id('K1', 'SOC', 'COMM', 'S1'),
    title: 'Community & Belonging',
    cadence: 'seasonal',
    college_primary: 'SOC',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'SOC', 'RULES', 'M1'),
    title: 'Rules & Fairness',
    cadence: 'monthly',
    college_primary: 'SOC',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'SOC', 'COMM', 'S1'),
  },
  {
    id: id('K1', 'SOC', 'MAPS', 'M2'),
    title: 'Places & Simple Maps',
    cadence: 'monthly',
    college_primary: 'SOC',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'SOC', 'COMM', 'S1'),
  },
  {
    id: id('K1', 'SOC', 'TIME', 'M3'),
    title: 'Past/Present/Future',
    cadence: 'monthly',
    college_primary: 'SOC',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'SOC', 'COMM', 'S1'),
  },
  
  // ARTS Vine - K-1
  {
    id: id('K1', 'ARTS', 'MAKE', 'S1'),
    title: 'Making & Mark',
    cadence: 'seasonal',
    college_primary: 'ARTS',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'ARTS', 'LINE', 'M1'),
    title: 'Line/Shape/Texture',
    cadence: 'monthly',
    college_primary: 'ARTS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ARTS', 'MAKE', 'S1'),
  },
  {
    id: id('K1', 'ARTS', 'COLOR', 'M2'),
    title: 'Color & Mood',
    cadence: 'monthly',
    college_primary: 'ARTS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ARTS', 'MAKE', 'S1'),
  },
  {
    id: id('K1', 'ARTS', 'STORY', 'M3'),
    title: 'Story Pictures',
    cadence: 'monthly',
    college_primary: 'ARTS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'ARTS', 'MAKE', 'S1'),
  },
  
  // HEAL Vine - K-1
  {
    id: id('K1', 'HEAL', 'BODY', 'S1'),
    title: 'Body, Breath, Balance',
    cadence: 'seasonal',
    college_primary: 'HEAL',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'HEAL', 'SENSES', 'M1'),
    title: 'Body Signals',
    cadence: 'monthly',
    college_primary: 'HEAL',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HEAL', 'BODY', 'S1'),
  },
  {
    id: id('K1', 'HEAL', 'MOVE', 'M2'),
    title: 'Movement & Rest',
    cadence: 'monthly',
    college_primary: 'HEAL',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HEAL', 'BODY', 'S1'),
  },
  {
    id: id('K1', 'HEAL', 'FOOD', 'M3'),
    title: 'Food & Water Basics',
    cadence: 'monthly',
    college_primary: 'HEAL',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HEAL', 'BODY', 'S1'),
  },
  
  // AINS Vine - K-1
  {
    id: id('K1', 'AINS', 'TOOLS', 'S1'),
    title: 'Tools & Instructions',
    cadence: 'seasonal',
    college_primary: 'AINS',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'AINS', 'SEQ', 'M1'),
    title: 'Sequencing & Steps',
    cadence: 'monthly',
    college_primary: 'AINS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'AINS', 'TOOLS', 'S1'),
  },
  {
    id: id('K1', 'AINS', 'DEBUG', 'M2'),
    title: 'Notice, Fix, Try Again',
    cadence: 'monthly',
    college_primary: 'AINS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'AINS', 'TOOLS', 'S1'),
  },
  {
    id: id('K1', 'AINS', 'SAFETY', 'M3'),
    title: 'Safety & Care of Tools',
    cadence: 'monthly',
    college_primary: 'AINS',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'AINS', 'TOOLS', 'S1'),
  },
  
  // HUM Vine - K-1
  {
    id: id('K1', 'HUM', 'WONDER', 'S1'),
    title: 'Wonder & Why',
    cadence: 'seasonal',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'HUM', 'QUEST', 'M1'),
    title: 'Asking Good Questions',
    cadence: 'monthly',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HUM', 'WONDER', 'S1'),
  },
  {
    id: id('K1', 'HUM', 'KIND', 'M2'),
    title: 'Kindness & Courage',
    cadence: 'monthly',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HUM', 'WONDER', 'S1'),
  },
  {
    id: id('K1', 'HUM', 'MYTH', 'M3'),
    title: 'Myths & Motifs (Intro)',
    cadence: 'monthly',
    college_primary: 'HUM',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'HUM', 'WONDER', 'S1'),
  },
  
  // META Vine - K-1
  {
    id: id('K1', 'META', 'LEARN', 'S1'),
    title: 'Attention & Reflection',
    cadence: 'seasonal',
    college_primary: 'META',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'META', 'NOTICE', 'M1'),
    title: 'Notice & Name',
    cadence: 'monthly',
    college_primary: 'META',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'META', 'LEARN', 'S1'),
  },
  {
    id: id('K1', 'META', 'PRACT', 'M2'),
    title: 'Practice & Patience',
    cadence: 'monthly',
    college_primary: 'META',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'META', 'LEARN', 'S1'),
  },
  {
    id: id('K1', 'META', 'SHARE', 'M3'),
    title: 'Explain to a Friend',
    cadence: 'monthly',
    college_primary: 'META',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'META', 'LEARN', 'S1'),
  },
  
  // CEF Vine - K-1
  {
    id: id('K1', 'CEF', 'CARE', 'S1'),
    title: 'Care for Place',
    cadence: 'seasonal',
    college_primary: 'CEF',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: id('K1', 'CEF', 'CLEAN', 'M1'),
    title: 'Clean/Reuse/Respect',
    cadence: 'monthly',
    college_primary: 'CEF',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'CEF', 'CARE', 'S1'),
  },
  {
    id: id('K1', 'CEF', 'OUT', 'M2'),
    title: 'Outdoor Habits',
    cadence: 'monthly',
    college_primary: 'CEF',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'CEF', 'CARE', 'S1'),
  },
  {
    id: id('K1', 'CEF', 'KIND', 'M3'),
    title: 'Care for Creatures',
    cadence: 'monthly',
    college_primary: 'CEF',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: id('K1', 'CEF', 'CARE', 'S1'),
  },
  
  // ============================================
  // G2-3 LEVEL - Sample from key colleges
  // ============================================
  
  // ELA Vine - G2-3
  {
    id: id('G23', 'ELA', 'READ', 'S1'),
    title: 'Reading Fluency & Meaning',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G23', 'ELA', 'FLUENT', 'M1'),
    title: 'Fluency Routines',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'ELA', 'READ', 'S1'),
  },
  {
    id: id('G23', 'ELA', 'VOCAB', 'M2'),
    title: 'Words & Nuance',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'ELA', 'READ', 'S1'),
  },
  {
    id: id('G23', 'ELA', 'SUMM', 'M3'),
    title: 'Retell & Summarize',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'ELA', 'READ', 'S1'),
  },
  
  // MATH Vine - G2-3
  {
    id: id('G23', 'MATH', 'NUM', 'S1'),
    title: 'Number Sense II',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G23', 'MATH', 'PLACE', 'M1'),
    title: 'Place Value',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'MATH', 'NUM', 'S1'),
  },
  {
    id: id('G23', 'MATH', 'ADD', 'M2'),
    title: 'Add/Subtract Strategies',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'MATH', 'NUM', 'S1'),
  },
  {
    id: id('G23', 'MATH', 'TIME', 'M3'),
    title: 'Time & Money (Intro)',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'MATH', 'NUM', 'S1'),
  },
  
  // NAT Vine - G2-3
  {
    id: id('G23', 'NAT', 'INQ', 'S1'),
    title: 'Inquiry & Patterns',
    cadence: 'seasonal',
    college_primary: 'NAT',
    level_band: 'G2-3',
    duration_weeks: 10,
  },
  {
    id: id('G23', 'NAT', 'QS', 'M1'),
    title: 'Questions & Predictions',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'NAT', 'INQ', 'S1'),
  },
  {
    id: id('G23', 'NAT', 'MEAS', 'M2'),
    title: 'Measure in Experiments',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'NAT', 'INQ', 'S1'),
  },
  {
    id: id('G23', 'NAT', 'LIFE', 'M3'),
    title: 'Habitats & Lifecycles',
    cadence: 'monthly',
    college_primary: 'NAT',
    level_band: 'G2-3',
    duration_weeks: 4,
    parent_seasonal_id: id('G23', 'NAT', 'INQ', 'S1'),
  },
];

// Generate relations
export const sampleRelations: CredentialRelation[] = [
  // PART_OF relations (🌙 → 🌱) for K-1
  ...['ELA', 'MATH', 'NAT', 'SOC', 'ARTS', 'HEAL', 'AINS', 'HUM', 'META', 'CEF'].flatMap(college => {
    const seasonalId = id('K1', college, college === 'ELA' ? 'LIT' : college === 'MATH' ? 'NUM' : college === 'NAT' ? 'WORLD' : college === 'SOC' ? 'COMM' : college === 'ARTS' ? 'MAKE' : college === 'HEAL' ? 'BODY' : college === 'AINS' ? 'TOOLS' : college === 'HUM' ? 'WONDER' : college === 'META' ? 'LEARN' : 'CARE', 'S1');
    const monthlyIds = [
      id('K1', college, college === 'ELA' ? 'PHON' : college === 'MATH' ? 'COUNT' : college === 'NAT' ? 'OBS' : college === 'SOC' ? 'RULES' : college === 'ARTS' ? 'LINE' : college === 'HEAL' ? 'SENSES' : college === 'AINS' ? 'SEQ' : college === 'HUM' ? 'QUEST' : college === 'META' ? 'NOTICE' : 'CLEAN', 'M1'),
      id('K1', college, college === 'ELA' ? 'LETTERS' : college === 'MATH' ? 'COMP' : college === 'NAT' ? 'SEAS' : college === 'SOC' ? 'MAPS' : college === 'ARTS' ? 'COLOR' : college === 'HEAL' ? 'MOVE' : college === 'AINS' ? 'DEBUG' : college === 'HUM' ? 'KIND' : college === 'META' ? 'PRACT' : 'OUT', 'M2'),
      id('K1', college, college === 'ELA' ? 'READ' : college === 'MATH' ? 'ADD' : college === 'NAT' ? 'CARE' : college === 'SOC' ? 'TIME' : college === 'ARTS' ? 'STORY' : college === 'HEAL' ? 'FOOD' : college === 'AINS' ? 'SAFETY' : college === 'HUM' ? 'MYTH' : college === 'META' ? 'SHARE' : 'KIND', 'M3'),
    ];
    return monthlyIds.map((monthlyId, idx) => ({
      id: `r-${college}-K1-${idx + 1}`,
      from_credential_id: monthlyId,
      to_credential_id: seasonalId,
      relation_type: 'PART_OF' as const,
    }));
  }),
  
  // PART_OF relations for G2-3
  {
    id: 'r-G23-ELA-1',
    from_credential_id: id('G23', 'ELA', 'FLUENT', 'M1'),
    to_credential_id: id('G23', 'ELA', 'READ', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-ELA-2',
    from_credential_id: id('G23', 'ELA', 'VOCAB', 'M2'),
    to_credential_id: id('G23', 'ELA', 'READ', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-ELA-3',
    from_credential_id: id('G23', 'ELA', 'SUMM', 'M3'),
    to_credential_id: id('G23', 'ELA', 'READ', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-MATH-1',
    from_credential_id: id('G23', 'MATH', 'PLACE', 'M1'),
    to_credential_id: id('G23', 'MATH', 'NUM', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-MATH-2',
    from_credential_id: id('G23', 'MATH', 'ADD', 'M2'),
    to_credential_id: id('G23', 'MATH', 'NUM', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-MATH-3',
    from_credential_id: id('G23', 'MATH', 'TIME', 'M3'),
    to_credential_id: id('G23', 'MATH', 'NUM', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-NAT-1',
    from_credential_id: id('G23', 'NAT', 'QS', 'M1'),
    to_credential_id: id('G23', 'NAT', 'INQ', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-NAT-2',
    from_credential_id: id('G23', 'NAT', 'MEAS', 'M2'),
    to_credential_id: id('G23', 'NAT', 'INQ', 'S1'),
    relation_type: 'PART_OF',
  },
  {
    id: 'r-G23-NAT-3',
    from_credential_id: id('G23', 'NAT', 'LIFE', 'M3'),
    to_credential_id: id('G23', 'NAT', 'INQ', 'S1'),
    relation_type: 'PART_OF',
  },
  
  // PREREQ relations (K-1 → G2-3)
  {
    id: 'prereq-ELA-K1-G23',
    from_credential_id: id('K1', 'ELA', 'LIT', 'S1'),
    to_credential_id: id('G23', 'ELA', 'READ', 'S1'),
    relation_type: 'PREREQ',
  },
  {
    id: 'prereq-MATH-K1-G23',
    from_credential_id: id('K1', 'MATH', 'NUM', 'S1'),
    to_credential_id: id('G23', 'MATH', 'NUM', 'S1'),
    relation_type: 'PREREQ',
  },
  {
    id: 'prereq-NAT-K1-G23',
    from_credential_id: id('K1', 'NAT', 'WORLD', 'S1'),
    to_credential_id: id('G23', 'NAT', 'INQ', 'S1'),
    relation_type: 'PREREQ',
  },
];
