/**
 * TypeScript types for MIT OCW course graph data
 */

export interface MITOCWNode {
  id: string;
  label: string;
  title: string;
  url: string;
  department?: string;
  level?: string;
  description?: string;
}

export interface MITOCWEdge {
  source: string;
  target: string;
  type: 'prerequisite' | 'corequisite';
  label: string;
}

export interface MITOCWGraph {
  nodes: MITOCWNode[];
  edges: MITOCWEdge[];
  metadata: {
    total_courses: number;
    total_prerequisites: number;
    total_corequisites: number;
  };
}
