// Course discovery and cataloging system
// Discovers Khan Academy and MIT OCW courses and maps them to microcredentials

import type { ExternalCourse, CourseCatalog } from '../types/external-course';
import type { Credential } from '../types/credential';

/**
 * Known Khan Academy course categories and their mappings
 * This is a curated list - in production, you'd want to scrape or use their API
 */
export const KHAN_ACADEMY_COURSES: ExternalCourse[] = [
  // Math courses
  {
    id: 'ka-arithmetic',
    source: 'khan_academy',
    title: 'Arithmetic',
    url: 'https://www.khanacademy.org/math/arithmetic',
    level: 'K-12',
    subject: 'Mathematics',
    duration_weeks: 8,
  },
  {
    id: 'ka-pre-algebra',
    source: 'khan_academy',
    title: 'Pre-algebra',
    url: 'https://www.khanacademy.org/math/pre-algebra',
    level: 'G7-8',
    subject: 'Mathematics',
    duration_weeks: 10,
  },
  {
    id: 'ka-algebra',
    source: 'khan_academy',
    title: 'Algebra',
    url: 'https://www.khanacademy.org/math/algebra',
    level: 'G9-10',
    subject: 'Mathematics',
    duration_weeks: 12,
  },
  {
    id: 'ka-geometry',
    source: 'khan_academy',
    title: 'Geometry',
    url: 'https://www.khanacademy.org/math/geometry',
    level: 'G9-10',
    subject: 'Mathematics',
    duration_weeks: 12,
  },
  {
    id: 'ka-algebra2',
    source: 'khan_academy',
    title: 'Algebra 2',
    url: 'https://www.khanacademy.org/math/algebra2',
    level: 'G11-12',
    subject: 'Mathematics',
    duration_weeks: 14,
  },
  {
    id: 'ka-trigonometry',
    source: 'khan_academy',
    title: 'Trigonometry',
    url: 'https://www.khanacademy.org/math/trigonometry',
    level: 'G11-12',
    subject: 'Mathematics',
    duration_weeks: 10,
  },
  {
    id: 'ka-precalculus',
    source: 'khan_academy',
    title: 'Precalculus',
    url: 'https://www.khanacademy.org/math/precalculus',
    level: 'G11-12',
    subject: 'Mathematics',
    duration_weeks: 14,
  },
  {
    id: 'ka-calculus',
    source: 'khan_academy',
    title: 'Calculus',
    url: 'https://www.khanacademy.org/math/calculus-1',
    level: 'UG',
    subject: 'Mathematics',
    duration_weeks: 16,
  },
  {
    id: 'ka-statistics',
    source: 'khan_academy',
    title: 'Statistics and Probability',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    level: 'G11-12',
    subject: 'Mathematics',
    duration_weeks: 12,
  },
  
  // Science courses
  {
    id: 'ka-biology',
    source: 'khan_academy',
    title: 'Biology',
    url: 'https://www.khanacademy.org/science/biology',
    level: 'G9-10',
    subject: 'Biology',
    duration_weeks: 14,
  },
  {
    id: 'ka-chemistry',
    source: 'khan_academy',
    title: 'Chemistry',
    url: 'https://www.khanacademy.org/science/chemistry',
    level: 'G9-10',
    subject: 'Chemistry',
    duration_weeks: 14,
  },
  {
    id: 'ka-physics',
    source: 'khan_academy',
    title: 'Physics',
    url: 'https://www.khanacademy.org/science/physics',
    level: 'G9-10',
    subject: 'Physics',
    duration_weeks: 14,
  },
  {
    id: 'ka-ap-biology',
    source: 'khan_academy',
    title: 'AP Biology',
    url: 'https://www.khanacademy.org/science/ap-biology',
    level: 'G11-12',
    subject: 'Biology',
    duration_weeks: 16,
  },
  {
    id: 'ka-ap-chemistry',
    source: 'khan_academy',
    title: 'AP Chemistry',
    url: 'https://www.khanacademy.org/science/ap-chemistry',
    level: 'G11-12',
    subject: 'Chemistry',
    duration_weeks: 16,
  },
  {
    id: 'ka-ap-physics',
    source: 'khan_academy',
    title: 'AP Physics',
    url: 'https://www.khanacademy.org/science/ap-physics-1',
    level: 'G11-12',
    subject: 'Physics',
    duration_weeks: 16,
  },
  
  // Computer Science
  {
    id: 'ka-computer-programming',
    source: 'khan_academy',
    title: 'Computer Programming',
    url: 'https://www.khanacademy.org/computing/computer-programming',
    level: 'G7-8',
    subject: 'Computer Science',
    duration_weeks: 12,
  },
  {
    id: 'ka-algorithms',
    source: 'khan_academy',
    title: 'Algorithms',
    url: 'https://www.khanacademy.org/computing/computer-science/algorithms',
    level: 'UG',
    subject: 'Computer Science',
    duration_weeks: 14,
  },
  
  // ELA
  {
    id: 'ka-ela',
    source: 'khan_academy',
    title: 'English Language Arts',
    url: 'https://www.khanacademy.org/ela',
    level: 'K-12',
    subject: 'English Language Arts',
    duration_weeks: 10,
  },
  
  // Social Studies
  {
    id: 'ka-us-history',
    source: 'khan_academy',
    title: 'US History',
    url: 'https://www.khanacademy.org/humanities/us-history',
    level: 'G9-10',
    subject: 'History',
    duration_weeks: 14,
  },
  {
    id: 'ka-world-history',
    source: 'khan_academy',
    title: 'World History',
    url: 'https://www.khanacademy.org/humanities/world-history',
    level: 'G9-10',
    subject: 'History',
    duration_weeks: 14,
  },
  {
    id: 'ka-us-government',
    source: 'khan_academy',
    title: 'US Government and Civics',
    url: 'https://www.khanacademy.org/humanities/us-government-and-civics',
    level: 'G9-10',
    subject: 'Civics',
    duration_weeks: 12,
  },
  {
    id: 'ka-economics',
    source: 'khan_academy',
    title: 'Economics',
    url: 'https://www.khanacademy.org/economics-finance-domain',
    level: 'G11-12',
    subject: 'Economics',
    duration_weeks: 14,
  },
];

/**
 * Known MIT OCW courses (sample - in production, scrape from ocw.mit.edu)
 */
export const MIT_OCW_COURSES: ExternalCourse[] = [
  // Math
  {
    id: 'mit-18-01',
    source: 'mit_ocw',
    title: 'Single Variable Calculus',
    url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/',
    level: 'UG',
    subject: 'Mathematics',
    duration_weeks: 16,
  },
  {
    id: 'mit-18-06',
    source: 'mit_ocw',
    title: 'Linear Algebra',
    url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
    level: 'UG',
    subject: 'Mathematics',
    duration_weeks: 16,
  },
  {
    id: 'mit-18-03',
    source: 'mit_ocw',
    title: 'Differential Equations',
    url: 'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/',
    level: 'UG',
    subject: 'Mathematics',
    duration_weeks: 16,
  },
  {
    id: 'mit-18-05',
    source: 'mit_ocw',
    title: 'Introduction to Probability and Statistics',
    url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/',
    level: 'UG',
    subject: 'Mathematics',
    duration_weeks: 16,
  },
  
  // Science
  {
    id: 'mit-7-012',
    source: 'mit_ocw',
    title: 'Introduction to Biology',
    url: 'https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/',
    level: 'UG',
    subject: 'Biology',
    duration_weeks: 16,
  },
  {
    id: 'mit-7-03',
    source: 'mit_ocw',
    title: 'Genetics',
    url: 'https://ocw.mit.edu/courses/7-03-genetics-fall-2004/',
    level: 'UG',
    subject: 'Biology',
    duration_weeks: 16,
  },
  {
    id: 'mit-5-111',
    source: 'mit_ocw',
    title: 'Principles of Chemical Science',
    url: 'https://ocw.mit.edu/courses/5-111-principles-of-chemical-science-fall-2008/',
    level: 'UG',
    subject: 'Chemistry',
    duration_weeks: 16,
  },
  {
    id: 'mit-8-01',
    source: 'mit_ocw',
    title: 'Physics I: Classical Mechanics',
    url: 'https://ocw.mit.edu/courses/8-01-physics-i-classical-mechanics-fall-2016/',
    level: 'UG',
    subject: 'Physics',
    duration_weeks: 16,
  },
  
  // Computer Science
  {
    id: 'mit-6-0001',
    source: 'mit_ocw',
    title: 'Introduction to Computer Science and Programming in Python',
    url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    level: 'UG',
    subject: 'Computer Science',
    duration_weeks: 16,
  },
  {
    id: 'mit-6-006',
    source: 'mit_ocw',
    title: 'Introduction to Algorithms',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
    level: 'UG',
    subject: 'Computer Science',
    duration_weeks: 16,
  },
  {
    id: 'mit-6-034',
    source: 'mit_ocw',
    title: 'Artificial Intelligence',
    url: 'https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/',
    level: 'UG',
    subject: 'Computer Science',
    duration_weeks: 16,
  },
  
  // Humanities
  {
    id: 'mit-24-04',
    source: 'mit_ocw',
    title: 'Justice',
    url: 'https://ocw.mit.edu/courses/24-04-justice-spring-2012/',
    level: 'UG',
    subject: 'Philosophy',
    duration_weeks: 16,
  },
  {
    id: 'mit-24-231',
    source: 'mit_ocw',
    title: 'Ethics',
    url: 'https://ocw.mit.edu/courses/24-231-ethics-fall-2009/',
    level: 'UG',
    subject: 'Philosophy',
    duration_weeks: 16,
  },
];

/**
 * Build complete course catalog
 */
export function buildCourseCatalog(): CourseCatalog {
  return {
    khan_academy: KHAN_ACADEMY_COURSES,
    mit_ocw: MIT_OCW_COURSES,
  };
}

/**
 * Find matching microcredential for an external course
 */
export function findMatchingMicrocredential(
  course: ExternalCourse,
  credentials: Credential[]
): Credential | undefined {
  // Try exact title match
  let match = credentials.find(c => 
    c.title.toLowerCase() === course.title.toLowerCase()
  );
  
  if (match) return match;
  
  // Try partial title match
  const courseWords = course.title.toLowerCase().split(/\s+/);
  match = credentials.find(c => {
    const credWords = c.title.toLowerCase().split(/\s+/);
    // Check if at least 2 significant words match
    const matches = courseWords.filter(w => 
      w.length > 3 && credWords.includes(w)
    );
    return matches.length >= 2;
  });
  
  if (match) return match;
  
  // Try matching by subject/college and level
  const collegeMap: Record<string, string> = {
    'Mathematics': 'MATH',
    'Biology': 'NAT',
    'Chemistry': 'NAT',
    'Physics': 'NAT',
    'Computer Science': 'AINS',
    'English Language Arts': 'ELA',
    'History': 'HUM',
    'Civics': 'SOC',
    'Economics': 'SOC',
    'Philosophy': 'HUM',
  };
  
  const college = collegeMap[course.subject || ''];
  if (!college) return undefined;
  
  const levelMap: Record<string, string> = {
    'K-12': 'G4-6',
    'G7-8': 'G7-8',
    'G9-10': 'G9-10',
    'G11-12': 'G11-12',
    'Undergraduate': 'UG',
    'Graduate': 'MS',
  };
  
  const levelBand = levelMap[course.level || ''] || 'UG';
  
  // Find credentials in same college and level
  const candidates = credentials.filter(c => 
    c.college_primary === college && c.level_band === levelBand
  );
  
  // Return the first one if any exist (could be improved with better matching)
  return candidates[0];
}

/**
 * Find courses without matching microcredentials
 */
export function findMissingMicrocredentials(
  catalog: CourseCatalog,
  credentials: Credential[]
): {
  khan_academy: ExternalCourse[];
  mit_ocw: ExternalCourse[];
} {
  const missingKA = catalog.khan_academy.filter(course => {
    const match = findMatchingMicrocredential(course, credentials);
    return !match;
  });
  
  const missingMIT = catalog.mit_ocw.filter(course => {
    const match = findMatchingMicrocredential(course, credentials);
    return !match;
  });
  
  return {
    khan_academy: missingKA,
    mit_ocw: missingMIT,
  };
}
