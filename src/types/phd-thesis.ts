// Type definitions for PhD Thesis Topics

/**
 * College mapping from the Arbor credential system
 */
export type College = 'HUM' | 'MATH' | 'NAT' | 'AINS' | 'SOC' | 'ELA' | 'ARTS' | 'HEAL' | 'CEF' | 'META';

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
  | 'openalex'        // From OpenAlex API
  | 'oatd'            // From OATD (Open Access Theses and Dissertations)
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
  
  // College mapping
  college_primary?: College; // Primary college from Arbor system
  colleges?: College[]; // Multiple colleges if interdisciplinary
  
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
  
  // OpenAlex integration
  openalex_id?: string; // OpenAlex work ID
  openalex_topics?: Array<{
    id: string;
    display_name: string;
    score?: number;
  }>;
  
  // OATD integration
  oatd_id?: string; // OATD record ID
  has_full_text?: boolean; // Whether full text is available via OATD
  full_text_url?: string; // Direct link to full text if available
  
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
    type?: 'paper' | 'dataset' | 'code' | 'website' | 'full_text' | 'other';
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

/**
 * Map discipline to Arbor college(s)
 * Returns primary college and potentially additional colleges for interdisciplinary work
 */
export function mapDisciplineToCollege(discipline: Discipline, keywords: string[] = []): { primary: College; additional?: College[] } {
  const keywordStr = keywords.join(' ').toLowerCase();
  const discLower = discipline.toLowerCase();
  
  // Direct mappings
  if (discLower.includes('mathematics') || discLower.includes('math')) {
    return { primary: 'MATH' };
  }
  
  if (discLower.includes('computer science') || discLower.includes('artificial intelligence') || 
      discLower.includes('machine learning') || discLower.includes('ai') || keywordStr.includes('ai') ||
      keywordStr.includes('machine learning') || keywordStr.includes('neural network')) {
    return { primary: 'AINS' };
  }
  
  if (discLower.includes('physics') || discLower.includes('chemistry') || 
      discLower.includes('biology') || discLower.includes('natural science')) {
    return { primary: 'NAT' };
  }
  
  if (discLower.includes('philosophy') || discLower.includes('literature') || 
      discLower.includes('history') || discLower.includes('theology') ||
      discLower.includes('classics') || discLower.includes('humanities')) {
    return { primary: 'HUM' };
  }
  
  if (discLower.includes('language') || discLower.includes('linguistics') ||
      discLower.includes('english') || discLower.includes('writing')) {
    return { primary: 'ELA' };
  }
  
  if (discLower.includes('art') || discLower.includes('music') || 
      discLower.includes('aesthetic') || discLower.includes('visual')) {
    return { primary: 'ARTS' };
  }
  
  if (discLower.includes('psychology') || discLower.includes('sociology') ||
      discLower.includes('economics') || discLower.includes('political science') ||
      discLower.includes('social science')) {
    return { primary: 'SOC' };
  }
  
  if (discLower.includes('health') || discLower.includes('medicine') ||
      discLower.includes('public health')) {
    return { primary: 'HEAL' };
  }
  
  if (discLower.includes('ecology') || discLower.includes('environment') ||
      discLower.includes('sustainability') || discLower.includes('climate')) {
    return { primary: 'CEF' };
  }
  
  if (discLower.includes('education') || discLower.includes('pedagogy') ||
      discLower.includes('learning') || discLower.includes('teaching')) {
    return { primary: 'META' };
  }
  
  // Default to META for interdisciplinary or unknown
  return { primary: 'META' };
}
