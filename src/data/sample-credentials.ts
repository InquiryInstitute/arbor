// Sample credential data for K-1 level (from the Mermaid diagram)
import type { Credential, CredentialRelation } from '../types/credential';

export const sampleCredentials: Credential[] = [
  // ELA Vine - K-1
  {
    id: 'K1.ELA.LIT.S1',
    title: 'Stories & Sounds',
    cadence: 'seasonal',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: 'K1.ELA.PHON.M1',
    title: 'Phonemic Play',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.ELA.LIT.S1',
  },
  {
    id: 'K1.ELA.LETTERS.M2',
    title: 'Letters & Hand',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.ELA.LIT.S1',
  },
  {
    id: 'K1.ELA.READ.M3',
    title: 'Early Decoding',
    cadence: 'monthly',
    college_primary: 'ELA',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.ELA.LIT.S1',
  },
  
  // MATH Vine - K-1
  {
    id: 'K1.MATH.NUM.S1',
    title: 'Number Sense I',
    cadence: 'seasonal',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 10,
  },
  {
    id: 'K1.MATH.COUNT.M1',
    title: 'Counting & Cardinality',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.MATH.NUM.S1',
  },
  {
    id: 'K1.MATH.COMP.M2',
    title: 'Compare & Order',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.MATH.NUM.S1',
  },
  {
    id: 'K1.MATH.ADD.M3',
    title: 'Join & Separate (Intro)',
    cadence: 'monthly',
    college_primary: 'MATH',
    level_band: 'K-1',
    duration_weeks: 4,
    parent_seasonal_id: 'K1.MATH.NUM.S1',
  },
];

export const sampleRelations: CredentialRelation[] = [
  // PART_OF relations (🌙 → 🌱)
  {
    id: 'r1',
    from_credential_id: 'K1.ELA.PHON.M1',
    to_credential_id: 'K1.ELA.LIT.S1',
    relation_type: 'PART_OF',
  },
  {
    id: 'r2',
    from_credential_id: 'K1.ELA.LETTERS.M2',
    to_credential_id: 'K1.ELA.LIT.S1',
    relation_type: 'PART_OF',
  },
  {
    id: 'r3',
    from_credential_id: 'K1.ELA.READ.M3',
    to_credential_id: 'K1.ELA.LIT.S1',
    relation_type: 'PART_OF',
  },
  {
    id: 'r4',
    from_credential_id: 'K1.MATH.COUNT.M1',
    to_credential_id: 'K1.MATH.NUM.S1',
    relation_type: 'PART_OF',
  },
  {
    id: 'r5',
    from_credential_id: 'K1.MATH.COMP.M2',
    to_credential_id: 'K1.MATH.NUM.S1',
    relation_type: 'PART_OF',
  },
  {
    id: 'r6',
    from_credential_id: 'K1.MATH.ADD.M3',
    to_credential_id: 'K1.MATH.NUM.S1',
    relation_type: 'PART_OF',
  },
];
