// Duration estimation system for credentials
// Estimates appropriate duration (weeks) based on topic complexity and level band

import type { LevelBand, College } from '../types/credential';

/**
 * Base duration multipliers by level band
 * Higher levels require more time due to increased complexity
 */
const LEVEL_DURATION_MULTIPLIERS: Record<LevelBand, number> = {
  'K-1': 0.8,      // 8-10 weeks typical
  'G2-3': 0.9,     // 9-11 weeks typical
  'G4-6': 1.0,     // 10-12 weeks typical (baseline)
  'G7-8': 1.1,     // 11-13 weeks typical
  'G9-10': 1.2,    // 12-14 weeks typical
  'G11-12': 1.3,   // 13-15 weeks typical
  'UG': 1.5,       // 15-18 weeks typical (semester-length)
  'MS': 1.8,       // 18-20 weeks typical
  'PhD': 2.0,      // 20-24 weeks typical
  'Faculty': 2.5,  // 24+ weeks for advanced research topics
};

/**
 * Topic complexity multipliers by college
 * Some subjects are inherently more complex or require more practice
 */
const COLLEGE_COMPLEXITY_MULTIPLIERS: Record<College, number> = {
  'MATH': 1.1,     // Math requires practice and problem-solving
  'NAT': 1.0,      // Natural sciences baseline
  'ELA': 0.95,     // Language arts slightly less time-intensive
  'SOC': 0.9,      // Social sciences often more reading-focused
  'HUM': 1.05,     // Humanities require deep reading and reflection
  'ARTS': 0.85,    // Arts are more project-based, variable timing
  'AINS': 1.15,    // AI/CS requires hands-on coding practice
  'HEAL': 1.0,     // Health sciences baseline
  'CEF': 0.95,     // Civic/Environmental slightly less intensive
  'META': 0.9,     // Meta-learning is more conceptual
};

/**
 * Topic size indicators based on title keywords
 * Helps estimate if a topic is foundational, intermediate, or advanced
 */
const TOPIC_SIZE_INDICATORS = {
  // Foundational/small topics (1-2 weeks)
  small: [
    'foundations', 'basics', 'introduction', 'overview', 'fundamentals',
    'beginnings', 'first steps', 'getting started', 'primer'
  ],
  // Medium topics (3-6 weeks)
  medium: [
    'operations', 'strategies', 'analysis', 'exploration', 'study',
    'investigation', 'methods', 'approaches', 'techniques'
  ],
  // Large/comprehensive topics (7-12 weeks)
  large: [
    'systems', 'comprehensive', 'advanced', 'theory', 'philosophy',
    'history', 'complete', 'full', 'extensive', 'deep dive'
  ],
  // Very large topics (12+ weeks, semester-length)
  veryLarge: [
    'complete course', 'full program', 'comprehensive study',
    'advanced research', 'graduate level', 'doctoral'
  ]
};

/**
 * Estimate duration in weeks based on topic and level
 */
export function estimateDuration(
  title: string,
  levelBand: LevelBand,
  college: College,
  cadence: 'monthly' | 'seasonal' = 'seasonal'
): number {
  // Base duration for seasonal credentials (typically 10-12 weeks)
  const baseDuration = cadence === 'seasonal' ? 10 : 4;
  
  // Apply level multiplier
  const levelMultiplier = LEVEL_DURATION_MULTIPLIERS[levelBand];
  
  // Apply college complexity multiplier
  const collegeMultiplier = COLLEGE_COMPLEXITY_MULTIPLIERS[college];
  
  // Detect topic size from title
  const titleLower = title.toLowerCase();
  let topicMultiplier = 1.0;
  
  if (TOPIC_SIZE_INDICATORS.veryLarge.some(keyword => titleLower.includes(keyword))) {
    topicMultiplier = 1.5;
  } else if (TOPIC_SIZE_INDICATORS.large.some(keyword => titleLower.includes(keyword))) {
    topicMultiplier = 1.2;
  } else if (TOPIC_SIZE_INDICATORS.medium.some(keyword => titleLower.includes(keyword))) {
    topicMultiplier = 1.0;
  } else if (TOPIC_SIZE_INDICATORS.small.some(keyword => titleLower.includes(keyword))) {
    topicMultiplier = 0.8;
  }
  
  // Calculate estimated duration
  const estimated = Math.round(baseDuration * levelMultiplier * collegeMultiplier * topicMultiplier);
  
  // Clamp to reasonable bounds
  if (cadence === 'monthly') {
    return Math.max(2, Math.min(6, estimated)); // Monthly: 2-6 weeks
  } else {
    return Math.max(8, Math.min(16, estimated)); // Seasonal: 8-16 weeks
  }
}

/**
 * Convert weeks to human-readable duration
 */
export function formatDuration(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (weeks < 12) {
    const months = Math.round(weeks / 4);
    return `${months} month${months !== 1 ? 's' : ''} (${weeks} weeks)`;
  } else {
    const seasons = Math.round(weeks / 12);
    return `${seasons} season${seasons !== 1 ? 's' : ''} (${weeks} weeks)`;
  }
}

/**
 * Determine if a credential should be monthly or seasonal based on estimated duration
 */
export function suggestCadence(estimatedWeeks: number): 'monthly' | 'seasonal' {
  // If estimated duration is 6 weeks or less, suggest monthly
  // Otherwise, suggest seasonal
  return estimatedWeeks <= 6 ? 'monthly' : 'seasonal';
}
