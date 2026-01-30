// Data structure for Common Core Curriculum Tree
// Organized bottom-to-top: Kindergarten at bottom, 12th grade at top

export interface CommonCoreNode {
  id: string;
  name: string;
  type: 'grade' | 'subject' | 'domain' | 'cluster' | 'standard';
  grade?: number; // 0 for K, 1-12 for grades
  subject?: 'math' | 'ela';
  domain?: string; // e.g., "Number and Operations", "Reading Literature"
  cluster?: string;
  description?: string;
  color?: string;
  // For visual representation
  level: number; // 0 = grade, 1 = subject, 2 = domain, 3 = cluster, 4 = standard
}

export interface CommonCoreRelation {
  id: string;
  from_id: string;
  to_id: string;
  relation_type: 'contains' | 'prerequisite' | 'builds_on';
  description?: string;
}

// Grade levels (bottom to top: K, 1, 2, ..., 12)
export const gradeNodes: CommonCoreNode[] = [
  { id: 'grade-k', name: 'Kindergarten', type: 'grade', grade: 0, level: 0, color: '#e3f2fd' },
  { id: 'grade-1', name: 'Grade 1', type: 'grade', grade: 1, level: 0, color: '#bbdefb' },
  { id: 'grade-2', name: 'Grade 2', type: 'grade', grade: 2, level: 0, color: '#90caf9' },
  { id: 'grade-3', name: 'Grade 3', type: 'grade', grade: 3, level: 0, color: '#64b5f6' },
  { id: 'grade-4', name: 'Grade 4', type: 'grade', grade: 4, level: 0, color: '#42a5f5' },
  { id: 'grade-5', name: 'Grade 5', type: 'grade', grade: 5, level: 0, color: '#2196f3' },
  { id: 'grade-6', name: 'Grade 6', type: 'grade', grade: 6, level: 0, color: '#1e88e5' },
  { id: 'grade-7', name: 'Grade 7', type: 'grade', grade: 7, level: 0, color: '#1976d2' },
  { id: 'grade-8', name: 'Grade 8', type: 'grade', grade: 8, level: 0, color: '#1565c0' },
  { id: 'grade-9', name: 'Grade 9', type: 'grade', grade: 9, level: 0, color: '#0d47a1' },
  { id: 'grade-10', name: 'Grade 10', type: 'grade', grade: 10, level: 0, color: '#0a3d91' },
  { id: 'grade-11', name: 'Grade 11', type: 'grade', grade: 11, level: 0, color: '#083d82' },
  { id: 'grade-12', name: 'Grade 12', type: 'grade', grade: 12, level: 0, color: '#063d73' },
];

// Subject nodes (Math and ELA for each grade)
export const subjectNodes: CommonCoreNode[] = [
  // Math subjects
  { id: 'math-k', name: 'Mathematics', type: 'subject', grade: 0, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-1', name: 'Mathematics', type: 'subject', grade: 1, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-2', name: 'Mathematics', type: 'subject', grade: 2, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-3', name: 'Mathematics', type: 'subject', grade: 3, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-4', name: 'Mathematics', type: 'subject', grade: 4, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-5', name: 'Mathematics', type: 'subject', grade: 5, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-6', name: 'Mathematics', type: 'subject', grade: 6, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-7', name: 'Mathematics', type: 'subject', grade: 7, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-8', name: 'Mathematics', type: 'subject', grade: 8, subject: 'math', level: 1, color: '#4caf50' },
  { id: 'math-hs', name: 'Mathematics', type: 'subject', grade: 9, subject: 'math', level: 1, color: '#4caf50' },
  
  // ELA subjects
  { id: 'ela-k', name: 'English Language Arts', type: 'subject', grade: 0, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-1', name: 'English Language Arts', type: 'subject', grade: 1, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-2', name: 'English Language Arts', type: 'subject', grade: 2, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-3', name: 'English Language Arts', type: 'subject', grade: 3, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-4', name: 'English Language Arts', type: 'subject', grade: 4, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-5', name: 'English Language Arts', type: 'subject', grade: 5, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-6', name: 'English Language Arts', type: 'subject', grade: 6, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-7', name: 'English Language Arts', type: 'subject', grade: 7, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-8', name: 'English Language Arts', type: 'subject', grade: 8, subject: 'ela', level: 1, color: '#ff9800' },
  { id: 'ela-hs', name: 'English Language Arts', type: 'subject', grade: 9, subject: 'ela', level: 1, color: '#ff9800' },
];

// Math Domains (K-8)
const mathDomainsK8: Array<{ id: string; name: string; grades: number[] }> = [
  { id: 'counting', name: 'Counting & Cardinality', grades: [0] },
  { id: 'operations', name: 'Operations & Algebraic Thinking', grades: [0, 1, 2, 3, 4, 5] },
  { id: 'number', name: 'Number & Operations in Base Ten', grades: [0, 1, 2, 3, 4, 5] },
  { id: 'fractions', name: 'Number & Operations—Fractions', grades: [3, 4, 5] },
  { id: 'measurement', name: 'Measurement & Data', grades: [0, 1, 2, 3, 4, 5] },
  { id: 'geometry', name: 'Geometry', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'ratios', name: 'Ratios & Proportional Relationships', grades: [6, 7] },
  { id: 'expressions', name: 'Expressions & Equations', grades: [6, 7, 8] },
  { id: 'statistics', name: 'Statistics & Probability', grades: [6, 7, 8] },
  { id: 'functions', name: 'Functions', grades: [8] },
];

// Math Domains (High School)
const mathDomainsHS: Array<{ id: string; name: string }> = [
  { id: 'hs-number', name: 'Number & Quantity' },
  { id: 'hs-algebra', name: 'Algebra' },
  { id: 'hs-functions', name: 'Functions' },
  { id: 'hs-modeling', name: 'Modeling' },
  { id: 'hs-geometry', name: 'Geometry' },
  { id: 'hs-statistics', name: 'Statistics & Probability' },
];

// ELA Domains (K-12)
const elaDomains: Array<{ id: string; name: string; grades: number[] }> = [
  { id: 'reading-literature', name: 'Reading: Literature', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 'reading-informational', name: 'Reading: Informational Text', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 'reading-foundational', name: 'Reading: Foundational Skills', grades: [0, 1, 2, 3, 4, 5] },
  { id: 'writing', name: 'Writing', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 'speaking', name: 'Speaking & Listening', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 'language', name: 'Language', grades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

// Generate domain nodes
export const domainNodes: CommonCoreNode[] = [
  // Math domains K-8
  ...mathDomainsK8.flatMap(domain => 
    domain.grades.map(grade => ({
      id: `math-${domain.id}-${grade}`,
      name: domain.name,
      type: 'domain' as const,
      grade,
      subject: 'math' as const,
      domain: domain.id,
      level: 2,
      color: '#66bb6a',
    }))
  ),
  // Math domains HS (apply to all HS grades)
  ...mathDomainsHS.flatMap(domain => 
    [9, 10, 11, 12].map(grade => ({
      id: `math-${domain.id}-${grade}`,
      name: domain.name,
      type: 'domain' as const,
      grade,
      subject: 'math' as const,
      domain: domain.id,
      level: 2,
      color: '#66bb6a',
    }))
  ),
  // ELA domains
  ...elaDomains.flatMap(domain =>
    domain.grades.map(grade => ({
      id: `ela-${domain.id}-${grade}`,
      name: domain.name,
      type: 'domain' as const,
      grade,
      subject: 'ela' as const,
      domain: domain.id,
      level: 2,
      color: '#ffb74d',
    }))
  ),
];

// Sample cluster nodes (representing key clusters within domains)
export const clusterNodes: CommonCoreNode[] = [
  // Sample Math clusters
  { id: 'math-operations-add', name: 'Addition & Subtraction', type: 'cluster', grade: 1, subject: 'math', domain: 'operations', cluster: 'add-sub', level: 3, color: '#81c784' },
  { id: 'math-operations-mult', name: 'Multiplication & Division', type: 'cluster', grade: 3, subject: 'math', domain: 'operations', cluster: 'mult-div', level: 3, color: '#81c784' },
  { id: 'math-number-place', name: 'Place Value', type: 'cluster', grade: 2, subject: 'math', domain: 'number', cluster: 'place-value', level: 3, color: '#81c784' },
  { id: 'math-fractions-equivalent', name: 'Equivalent Fractions', type: 'cluster', grade: 4, subject: 'math', domain: 'fractions', cluster: 'equivalent', level: 3, color: '#81c784' },
  { id: 'math-geometry-shapes', name: 'Shapes & Attributes', type: 'cluster', grade: 1, subject: 'math', domain: 'geometry', cluster: 'shapes', level: 3, color: '#81c784' },
  { id: 'math-ratios-ratios', name: 'Understanding Ratios', type: 'cluster', grade: 6, subject: 'math', domain: 'ratios', cluster: 'understanding', level: 3, color: '#81c784' },
  
  // Sample ELA clusters
  { id: 'ela-reading-key-ideas', name: 'Key Ideas & Details', type: 'cluster', grade: 3, subject: 'ela', domain: 'reading-literature', cluster: 'key-ideas', level: 3, color: '#ffcc80' },
  { id: 'ela-reading-craft', name: 'Craft & Structure', type: 'cluster', grade: 4, subject: 'ela', domain: 'reading-literature', cluster: 'craft', level: 3, color: '#ffcc80' },
  { id: 'ela-writing-opinion', name: 'Opinion Writing', type: 'cluster', grade: 2, subject: 'ela', domain: 'writing', cluster: 'opinion', level: 3, color: '#ffcc80' },
  { id: 'ela-writing-narrative', name: 'Narrative Writing', type: 'cluster', grade: 3, subject: 'ela', domain: 'writing', cluster: 'narrative', level: 3, color: '#ffcc80' },
  { id: 'ela-language-vocab', name: 'Vocabulary Acquisition', type: 'cluster', grade: 5, subject: 'ela', domain: 'language', cluster: 'vocab', level: 3, color: '#ffcc80' },
];

// All nodes combined
export const allCommonCoreNodes: CommonCoreNode[] = [
  ...gradeNodes,
  ...subjectNodes,
  ...domainNodes,
  ...clusterNodes,
];

// Relations: grade -> subject -> domain -> cluster
export const commonCoreRelations: CommonCoreRelation[] = [
  // Grade to Subject relations
  ...gradeNodes.flatMap(grade => {
    const relations: CommonCoreRelation[] = [];
    if (grade.grade! <= 8) {
      relations.push({
        id: `rel-${grade.id}-math`,
        from_id: grade.id,
        to_id: `math-${grade.grade === 0 ? 'k' : grade.grade}`,
        relation_type: 'contains',
      });
      relations.push({
        id: `rel-${grade.id}-ela`,
        from_id: grade.id,
        to_id: `ela-${grade.grade === 0 ? 'k' : grade.grade}`,
        relation_type: 'contains',
      });
    } else {
      // High school: all grades share math-hs and ela-hs
      relations.push({
        id: `rel-${grade.id}-math`,
        from_id: grade.id,
        to_id: 'math-hs',
        relation_type: 'contains',
      });
      relations.push({
        id: `rel-${grade.id}-ela`,
        from_id: grade.id,
        to_id: 'ela-hs',
        relation_type: 'contains',
      });
    }
    return relations;
  }),
  
  // Subject to Domain relations
  ...subjectNodes.flatMap(subject => {
    const relatedDomains = domainNodes.filter(
      d => d.subject === subject.subject && 
      (subject.grade! <= 8 ? d.grade === subject.grade : subject.grade! >= 9)
    );
    return relatedDomains.map(domain => ({
      id: `rel-${subject.id}-${domain.id}`,
      from_id: subject.id,
      to_id: domain.id,
      relation_type: 'contains',
    }));
  }),
  
  // Domain to Cluster relations
  ...domainNodes.flatMap(domain => {
    const relatedClusters = clusterNodes.filter(
      c => c.subject === domain.subject && 
      c.domain === domain.domain && 
      c.grade === domain.grade
    );
    return relatedClusters.map(cluster => ({
      id: `rel-${domain.id}-${cluster.id}`,
      from_id: domain.id,
      to_id: cluster.id,
      relation_type: 'contains',
    }));
  }),
  
  // Vertical progression relations (prerequisites)
  // Math: Operations progression
  { id: 'rel-math-operations-1-to-2', from_id: 'math-operations-add', to_id: 'math-operations-mult', relation_type: 'prerequisite' },
  // ELA: Reading progression
  { id: 'rel-ela-reading-3-to-4', from_id: 'ela-reading-key-ideas', to_id: 'ela-reading-craft', relation_type: 'builds_on' },
  // Writing progression
  { id: 'rel-ela-writing-2-to-3', from_id: 'ela-writing-opinion', to_id: 'ela-writing-narrative', relation_type: 'builds_on' },
];
