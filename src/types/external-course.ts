// Type definitions for external course resources (Khan Academy, MIT OCW)

export interface ExternalCourse {
  id: string;
  source: 'khan_academy' | 'mit_ocw';
  title: string;
  url: string;
  description?: string;
  level?: string; // e.g., "K-12", "Undergraduate", "Graduate"
  subject?: string; // e.g., "Mathematics", "Biology"
  duration_weeks?: number;
  prerequisites?: string[]; // Array of course IDs or titles
  prerequisites_detected?: boolean; // Whether prerequisites were LLM-detected
  microcredential_id?: string; // Link to our microcredential if it exists
  tags?: string[];
}

export interface CourseCatalog {
  khan_academy: ExternalCourse[];
  mit_ocw: ExternalCourse[];
}

export interface PrerequisiteAnalysis {
  course_id: string;
  course_title: string;
  prerequisites: Array<{
    title: string;
    confidence: number; // 0-1
    source: 'explicit' | 'llm_detected' | 'inferred';
    microcredential_match?: string; // ID of matching microcredential
  }>;
  analysis_notes?: string;
}
