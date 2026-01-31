// Type definitions for the Tree of Vines credential system

export type Cadence = 'monthly' | 'seasonal';
export type LevelBand = 'K-1' | 'G2-3' | 'G4-6' | 'G7-8' | 'G9-10' | 'G11-12' | 'UG' | 'MS' | 'PhD' | 'Faculty';
export type College = 'HUM' | 'MATH' | 'NAT' | 'AINS' | 'SOC' | 'ELA' | 'ARTS' | 'HEAL' | 'CEF' | 'META';
export type RelationType = 'PART_OF' | 'PREREQ' | 'RECOMMENDED' | 'COREQ';
export type CredentialStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'SUBMITTED' | 'PASSED' | 'REVISE' | 'FAILED';

export interface Credential {
  id: string;
  title: string;
  cadence: Cadence;
  college_primary: College;
  level_band: LevelBand;
  duration_weeks: number;
  status?: CredentialStatus;
  parent_seasonal_id?: string; // For 🌙 → 🌱 composition
  summary?: string;
  tags?: string[];
  // External resource links
  khan_academy_url?: string; // Link to Khan Academy course/topic
  mit_ocw_url?: string; // Link to MIT OpenCourseWare course
  estimated_duration_source?: 'manual' | 'estimated'; // How duration was determined
}

export interface CredentialRelation {
  id: string;
  from_credential_id: string;
  to_credential_id: string;
  relation_type: RelationType;
}

export interface CredentialGraph {
  credentials: Credential[];
  relations: CredentialRelation[];
}

// For ELK.js layout
export interface ELKNode {
  id: string;
  labels?: Array<{ text: string }>;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: ELKNode[];
}

export interface ELKEdge {
  id: string;
  sources: string[];
  targets: string[];
  labels?: Array<{ text: string }>;
}

export interface ELKGraph {
  id: string;
  children: ELKNode[];
  edges: ELKEdge[];
}
