// External resource mapping system
// Maps credentials to Khan Academy and MIT OpenCourseWare resources

import type { Credential, LevelBand, College } from '../types/credential';

/**
 * Khan Academy course/topic mappings
 * Maps credential titles and topics to Khan Academy URLs
 */
const KHAN_ACADEMY_MAPPINGS: Record<string, string> = {
  // Math topics
  'number-operations': 'https://www.khanacademy.org/math/arithmetic',
  'arithmetic-operations': 'https://www.khanacademy.org/math/arithmetic',
  'place-value': 'https://www.khanacademy.org/math/cc-fourth-grade-math/imp-place-value-and-rounding-2',
  'fractions-decimals': 'https://www.khanacademy.org/math/cc-fourth-grade-math/imp-decimals',
  'ratios-proportions': 'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-ratios-prop-topic',
  'pre-algebra': 'https://www.khanacademy.org/math/pre-algebra',
  'algebraic-thinking': 'https://www.khanacademy.org/math/algebra',
  'functions-analysis': 'https://www.khanacademy.org/math/algebra2',
  'calculus': 'https://www.khanacademy.org/math/calculus-1',
  'geometry-spatial': 'https://www.khanacademy.org/math/geometry',
  'geometry-measurement': 'https://www.khanacademy.org/math/geometry',
  'data-statistics': 'https://www.khanacademy.org/math/statistics-probability',
  
  // Science topics
  'life-cycles': 'https://www.khanacademy.org/science/biology',
  'ecosystems': 'https://www.khanacademy.org/science/biology/ecology',
  'energy-matter': 'https://www.khanacademy.org/science/physics',
  'earth-systems': 'https://www.khanacademy.org/science/earth-science',
  'evolution': 'https://www.khanacademy.org/science/biology/her',
  'genetics': 'https://www.khanacademy.org/science/biology/classical-genetics',
  'molecular-bio': 'https://www.khanacademy.org/science/biology/macromolecules',
  'chemistry': 'https://www.khanacademy.org/science/chemistry',
  'physics': 'https://www.khanacademy.org/science/physics',
  
  // ELA topics
  'reading-foundations': 'https://www.khanacademy.org/ela/cc-2nd-reading-vocab',
  'writing-foundations': 'https://www.khanacademy.org/ela/cc-2nd-reading-vocab',
  'literary-analysis': 'https://www.khanacademy.org/ela/cc-9th-reading-vocab',
  'rhetoric-argument': 'https://www.khanacademy.org/test-prep/sat-reading-writing',
  
  // Social Studies
  'civics-citizenship': 'https://www.khanacademy.org/humanities/us-government-and-civics',
  'economics-basics': 'https://www.khanacademy.org/economics-finance-domain',
  'political-theory': 'https://www.khanacademy.org/humanities/us-government-and-civics',
  'historical-thinking': 'https://www.khanacademy.org/humanities/world-history',
  
  // Computer Science / AI
  'programming-fundamentals': 'https://www.khanacademy.org/computing/computer-programming',
  'data-structures': 'https://www.khanacademy.org/computing/computer-science/algorithms',
  'artificial-intelligence': 'https://www.khanacademy.org/computing/computer-science',
};

/**
 * MIT OpenCourseWare course mappings
 * Maps credential titles to MIT OCW course URLs
 */
const MIT_OCW_MAPPINGS: Record<string, string> = {
  // Math courses
  'calculus': 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/',
  'linear-algebra': 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
  'differential-equations': 'https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/',
  'probability': 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/',
  
  // Science courses
  'biology': 'https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/',
  'chemistry': 'https://ocw.mit.edu/courses/5-111-principles-of-chemical-science-fall-2008/',
  'physics': 'https://ocw.mit.edu/courses/8-01-physics-i-classical-mechanics-fall-2016/',
  'genetics': 'https://ocw.mit.edu/courses/7-03-genetics-fall-2004/',
  'evolution': 'https://ocw.mit.edu/courses/7-014-introductory-biology-spring-2005/',
  
  // Computer Science
  'programming-fundamentals': 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
  'data-structures': 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
  'artificial-intelligence': 'https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/',
  
  // Humanities
  'moral-philosophy': 'https://ocw.mit.edu/courses/24-04-justice-spring-2012/',
  'ethical-theories': 'https://ocw.mit.edu/courses/24-231-ethics-fall-2009/',
  'historiography': 'https://ocw.mit.edu/courses/21h-001-how-to-stage-a-revolution-fall-2013/',
  
  // Social Sciences
  'economics-basics': 'https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2018/',
  'political-theory': 'https://ocw.mit.edu/courses/17-20-introduction-to-american-politics-spring-2013/',
};

/**
 * Find Khan Academy URL for a credential
 */
export function findKhanAcademyUrl(credential: Credential): string | undefined {
  // Try to match by credential slug (from ID)
  const slug = credential.id.split('.').pop() || '';
  if (KHAN_ACADEMY_MAPPINGS[slug]) {
    return KHAN_ACADEMY_MAPPINGS[slug];
  }
  
  // Try to match by title keywords
  const titleLower = credential.title.toLowerCase();
  for (const [key, url] of Object.entries(KHAN_ACADEMY_MAPPINGS)) {
    if (titleLower.includes(key.replace('-', ' '))) {
      return url;
    }
  }
  
  // Return general subject area if available
  const collegeMap: Record<College, string> = {
    'MATH': 'https://www.khanacademy.org/math',
    'NAT': 'https://www.khanacademy.org/science',
    'ELA': 'https://www.khanacademy.org/ela',
    'SOC': 'https://www.khanacademy.org/humanities',
    'HUM': 'https://www.khanacademy.org/humanities',
    'ARTS': 'https://www.khanacademy.org/humanities',
    'AINS': 'https://www.khanacademy.org/computing',
    'HEAL': 'https://www.khanacademy.org/science',
    'CEF': 'https://www.khanacademy.org/humanities',
    'META': 'https://www.khanacademy.org',
  };
  
  return collegeMap[credential.college_primary];
}

/**
 * Find MIT OpenCourseWare URL for a credential
 */
export function findMITOCWUrl(credential: Credential): string | undefined {
  // MIT OCW is typically for UG+ level
  const ugLevels: LevelBand[] = ['UG', 'MS', 'PhD', 'Faculty'];
  if (!ugLevels.includes(credential.level_band)) {
    return undefined; // MIT OCW doesn't typically cover K-12
  }
  
  // Try to match by credential slug
  const slug = credential.id.split('.').pop() || '';
  if (MIT_OCW_MAPPINGS[slug]) {
    return MIT_OCW_MAPPINGS[slug];
  }
  
  // Try to match by title keywords
  const titleLower = credential.title.toLowerCase();
  for (const [key, url] of Object.entries(MIT_OCW_MAPPINGS)) {
    if (titleLower.includes(key.replace('-', ' '))) {
      return url;
    }
  }
  
  // Return general subject area if available
  const collegeMap: Record<College, string> = {
    'MATH': 'https://ocw.mit.edu/courses/mathematics/',
    'NAT': 'https://ocw.mit.edu/courses/biology/',
    'ELA': 'https://ocw.mit.edu/courses/literature/',
    'SOC': 'https://ocw.mit.edu/courses/political-science/',
    'HUM': 'https://ocw.mit.edu/courses/linguistics-and-philosophy/',
    'ARTS': 'https://ocw.mit.edu/courses/music-and-theater-arts/',
    'AINS': 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
    'HEAL': 'https://ocw.mit.edu/courses/health-sciences-and-technology/',
    'CEF': 'https://ocw.mit.edu/courses/',
    'META': 'https://ocw.mit.edu/courses/',
  };
  
  return collegeMap[credential.college_primary];
}

/**
 * Auto-populate external resource links for a credential
 */
export function populateExternalResources(credential: Credential): Credential {
  return {
    ...credential,
    khan_academy_url: findKhanAcademyUrl(credential),
    mit_ocw_url: findMITOCWUrl(credential),
  };
}
