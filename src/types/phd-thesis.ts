// Type definitions for PhD Thesis Topics

/**
 * Academic discipline or field of study
 */
export type Discipline =
  | 'Computer Science'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Philosophy'
  | 'Literature'
  | 'History'
  | 'Economics'
  | 'Psychology'
  | 'Sociology'
  | 'Political Science'
  | 'Education'
  | 'Engineering'
  | 'Art'
  | 'Music'
  | 'Theology'
  | 'Linguistics'
  | 'Anthropology'
  | 'Interdisciplinary';

/**
 * Research methodology or approach
 */
export type Methodology =
  | 'Experimental'
  | 'Theoretical'
  | 'Computational'
  | 'Empirical'
  | 'Qualitative'
  | 'Quantitative'
  | 'Mixed Methods'
  | 'Historical'
  | 'Philosophical'
  | 'Comparative'
  | 'Case Study'
  | 'Survey'
  | 'Meta-Analysis'
  | 'Simulation'
  | 'Fieldwork';

/**
 * Status of the thesis topic
 */
export type TopicStatus =
  | 'proposed'      // Topic has been proposed but not yet started
  | 'in_progress'   // Currently being researched
  | 'completed'     // Thesis has been completed
  | 'published'     // Thesis has been published
  | 'archived';     // Topic is archived or no longer active

/**
 * Source of the thesis topic
 */
export type TopicSource =
  | 'university'      // From university databases
  | 'proquest'        // From ProQuest Dissertations
  | 'github'          // From GitHub repositories
  | 'manual'          // Manually curated
  | 'conference'      // From conference proceedings
  | 'journal'         // From academic journals
  | 'other';

/**
 * Core PhD thesis topic structure
 */
export interface PhDThesisTopic {
  id: string;
  title: string;
  discipline: Discipline;
  subdiscipline?: string;
  
  // Research details
  abstract?: string;
  keywords: string[];
  methodology?: Methodology[];
  
  // Authorship
  author?: string;
  advisor?: string;
  institution?: string;
  year?: number;
  
  // Status and metadata
  status: TopicStatus;
  source: TopicSource;
  source_url?: string;
  
  // Relationships
  related_topics?: string[]; // IDs of related thesis topics
  prerequisites?: string[]; // Knowledge areas required
  applications?: string[]; // Potential applications or outcomes
  
  // Additional metadata
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: string; // e.g., "3-5 years"
  funding_opportunities?: string[];
  
  // Links and resources
  links?: Array<{
    title: string;
    url: string;
    type?: 'paper' | 'dataset' | 'code' | 'website' | 'other';
  }>;
  
  // Notes and curation
  notes?: string;
  curated_date?: string; // ISO date string
  curator?: string;
}

/**
 * Collection of thesis topics organized by discipline
 */
export interface ThesisTopicCollection {
  metadata: {
    title: string;
    description: string;
    version: string;
    last_updated: string;
    total_topics: number;
    curator?: string;
  };
  topics: PhDThesisTopic[];
  statistics: {
    by_discipline: Record<Discipline, number>;
    by_status: Record<TopicStatus, number>;
    by_methodology: Record<Methodology, number>;
  };
}

/**
 * Search and filter criteria for thesis topics
 */
export interface ThesisTopicFilter {
  disciplines?: Discipline[];
  keywords?: string[];
  status?: TopicStatus[];
  methodology?: Methodology[];
  year_range?: { start?: number; end?: number };
  difficulty?: string[];
  tags?: string[];
}

/**
 * Helper function to generate a unique ID for a thesis topic
 */
export function generateThesisTopicId(title: string, author?: string, year?: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  const parts = [slug];
  if (author) {
    parts.push(author.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20));
  }
  if (year) {
    parts.push(year.toString());
  }
  
  return parts.join('-');
}
