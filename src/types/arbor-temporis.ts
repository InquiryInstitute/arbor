// Type definitions for Arbor Temporis (Tree of Time)

/**
 * The five primary vines (disciplines) that climb the tree
 */
export type Vine = 'History' | 'Music' | 'Art' | 'Literature' | 'Science';

/**
 * Temporal bands (horizontal strata) that cut across all vines
 */
export type TemporalBand =
  | 'Mythic'      // 🪨 Before ~3000 BCE
  | 'Ancient'     // 🏺 ~3000 BCE - 500 CE
  | 'Medieval'    // 🕯️ ~500 CE - 1400 CE
  | 'EarlyModern' // 🖋️ ~1400 CE - 1800 CE
  | 'Industrial'   // ⚙️ ~1800 CE - 1900 CE
  | 'Modern'       // 🧠 ~1900 CE - 2000 CE
  | 'Contemporary' // 🌐 ~2000 CE - present
  | 'Emergent';    // ✨ Future / near-future

/**
 * Node types represent different kinds of temporal knowledge
 */
export type NodeType =
  | 'event'      // Historical events, milestones
  | 'work'       // Compositions, texts, artworks
  | 'idea'       // Theories, concepts, movements
  | 'movement'   // Artistic, literary, scientific movements
  | 'technology' // Tools, instruments, innovations
  | 'person'     // Key figures (composers, authors, scientists)
  | 'rupture'    // Paradigm shifts, revolutions
  | 'cycle';     // Recurring patterns

/**
 * Learner state for personalization overlay
 */
export type LearnerNodeState =
  | 'unseen'    // Not yet encountered
  | 'studied'   // Currently studying or studied
  | 'mastered'  // Fully understood, can apply
  | 'forgotten'; // Previously studied but faded

/**
 * Core node in the Arbor Temporis
 * Represents an event, work, idea, or movement at a specific temporal moment
 */
export interface ArborNode {
  id: string;
  title: string;
  vine: Vine;
  node_type: NodeType;
  
  // Temporal positioning
  time_height: number; // Vertical position (normalized: negative = BCE, positive = CE)
  temporal_band: TemporalBand;
  date_approximate?: string; // Human-readable: "c. 1500", "1865", "476 CE", etc.
  
  // Relationships
  predecessors: string[]; // Node IDs (downward links - what came before)
  successors: string[];   // Node IDs (upward links - what follows)
  cross_links: string[];  // Node IDs (same time, different vine - contemporaries)
  
  // Content
  description: string;
  location?: string;
  creators?: string[]; // Authors, composers, artists, etc.
  tags: string[];
  
  // Visual/metadata
  color_hint?: string; // Optional color override for this node
  intensity?: number;  // 0-1, affects glow/thickness in braids
  
  // Personalization (per learner, stored separately)
  learner_state?: LearnerNodeState;
  learner_connections?: string[]; // Personal path connections
}

/**
 * Braid represents a cross-vine entanglement
 * Multiple nodes from different vines at the same temporal height
 */
export interface Braid {
  id: string;
  name: string; // e.g., "Florence c. 1500", "Vienna c. 1900"
  time_height: number;
  temporal_band: TemporalBand;
  node_ids: string[]; // All nodes participating in this braid
  vines: Vine[]; // Which vines are involved
  
  // Visual properties
  intensity: number; // 0-1, affects glow and thickness
  description: string; // What makes this braid significant
}

/**
 * Connection between nodes
 * Can be predecessor, successor, or cross-link
 */
export interface NodeConnection {
  id: string;
  from_node_id: string;
  to_node_id: string;
  connection_type: 'predecessor' | 'successor' | 'cross_link';
  strength?: number; // 0-1, affects visual weight
  description?: string; // Optional explanation of the connection
}

/**
 * Complete Arbor Temporis graph
 */
export interface ArborTemporisGraph {
  nodes: ArborNode[];
  connections: NodeConnection[];
  braids: Braid[];
}

/**
 * Learner's personal tree state
 */
export interface LearnerTreeState {
  learner_id: string;
  node_states: Record<string, LearnerNodeState>; // node_id -> state
  personal_connections: string[]; // Additional connection IDs (personal paths)
  current_focus?: string; // Currently focused node ID
  studied_path: string[]; // Chronological list of node IDs studied
}

/**
 * Query result for "ask a question" feature
 */
export interface QuestionIllumination {
  target_nodes: string[]; // Nodes that answer the question
  prerequisite_path: string[]; // Path of prerequisites (downward)
  successor_path: string[]; // Path of influences (upward)
  contemporaries: string[]; // Cross-vine nodes at same time
  first_missing?: string; // First prerequisite the learner hasn't mastered
  explanation: string; // Text explanation of the path
}

/**
 * Visual properties for rendering
 */
export interface VineVisualProperties {
  vine: Vine;
  base_color: string; // Hex color
  line_weight: number; // Base thickness
  motion_style: 'steady' | 'spiral' | 'burst' | 'leap' | 'branch';
}

/**
 * Temporal band visual properties
 */
export interface TemporalBandVisualProperties {
  band: TemporalBand;
  symbol: string; // Emoji symbol
  color_tint: string; // Color overlay for this band
  approximate_range: string; // Human-readable time range
}

/**
 * Constants for visual design
 */
export const VINE_COLORS: Record<Vine, string> = {
  History: '#8B4513',      // Earth tones (browns, ochres)
  Music: '#4A90E2',         // Blues and purples
  Art: '#E74C3C',           // Reds and oranges
  Literature: '#27AE60',    // Greens
  Science: '#F39C12',       // Yellows and golds
};

export const TEMPORAL_BAND_SYMBOLS: Record<TemporalBand, string> = {
  Mythic: '🪨',
  Ancient: '🏺',
  Medieval: '🕯️',
  EarlyModern: '🖋️',
  Industrial: '⚙️',
  Modern: '🧠',
  Contemporary: '🌐',
  Emergent: '✨',
};

export const TEMPORAL_BAND_RANGES: Record<TemporalBand, string> = {
  Mythic: 'Before ~3000 BCE',
  Ancient: '~3000 BCE - 500 CE',
  Medieval: '~500 CE - 1400 CE',
  EarlyModern: '~1400 CE - 1800 CE',
  Industrial: '~1800 CE - 1900 CE',
  Modern: '~1900 CE - 2000 CE',
  Contemporary: '~2000 CE - present',
  Emergent: 'Future / near-future',
};

/**
 * Helper: Convert year to time_height
 * Negative = BCE, Positive = CE
 */
export function yearToTimeHeight(year: number, isBCE: boolean = false): number {
  return isBCE ? -year : year;
}

/**
 * Helper: Convert time_height to approximate year
 */
export function timeHeightToYear(timeHeight: number): { year: number; isBCE: boolean } {
  return {
    year: Math.abs(timeHeight),
    isBCE: timeHeight < 0,
  };
}

/**
 * Helper: Determine temporal band from time_height
 */
export function getTemporalBand(timeHeight: number): TemporalBand {
  const year = Math.abs(timeHeight);
  const isBCE = timeHeight < 0;
  
  if (isBCE || year < 500) {
    if (year > 3000) return 'Mythic';
    return 'Ancient';
  }
  if (year < 1400) return 'Medieval';
  if (year < 1800) return 'EarlyModern';
  if (year < 1900) return 'Industrial';
  if (year < 2000) return 'Modern';
  if (year <= new Date().getFullYear()) return 'Contemporary';
  return 'Emergent';
}
