// Integration with ocw-to-go repository for MIT OCW course data
// Reference: https://github.com/bmuramatsu/ocw-to-go

import type { ExternalCourse } from '../types/external-course';

/**
 * ocw-to-go course JSON structure
 */
interface OCWToGoCourse {
  course_name: string;
  title?: string;
  description?: string;
  url?: string;
  videos?: Array<{
    title: string;
    url: string;
  }>;
  // Additional fields may exist
}

/**
 * Fetch course list from ocw-to-go repository
 */
export async function fetchOCWToGoCourseList(): Promise<string[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/bmuramatsu/ocw-to-go/main/src/courses/index.txt'
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch course list: ${response.statusText}`);
    }
    
    const text = await response.text();
    const courseIds = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    
    return courseIds;
  } catch (error) {
    console.error('Error fetching ocw-to-go course list:', error);
    return [];
  }
}

/**
 * Fetch a single course JSON from ocw-to-go repository
 */
export async function fetchOCWToGoCourse(courseId: string): Promise<OCWToGoCourse | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/bmuramatsu/ocw-to-go/main/src/courses/${courseId}.json`
    );
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }
}

/**
 * Convert ocw-to-go course to ExternalCourse format
 */
export function convertOCWToGoToExternalCourse(
  courseId: string,
  ocwCourse: OCWToGoCourse
): ExternalCourse {
  // Extract course metadata
  const title = ocwCourse.title || ocwCourse.course_name || courseId;
  const description = ocwCourse.description;
  
  // Extract course number and department from course ID
  // Format: "18-01sc-single-variable-calculus-fall-2010"
  const parts = courseId.split('-');
  const deptNumber = parts[0] ? parseInt(parts[0]) : null;
  const level = deptNumber && deptNumber >= 17 ? 'Graduate' : 'Undergraduate';
  
  // Map department numbers to subjects (MIT course numbering)
  const subject = deptNumber ? getSubjectFromDeptNumber(deptNumber) : 'Unknown';
  
  return {
    id: `mit-${courseId}`,
    source: 'mit_ocw',
    title,
    url: ocwCourse.url || `https://ocw.mit.edu/courses/${courseId}/`,
    description,
    level,
    subject,
    duration_weeks: 16, // Standard semester
    prerequisites_detected: true, // Will need to fetch from MIT OCW directly
  };
}

/**
 * Map MIT department numbers to subjects
 */
function getSubjectFromDeptNumber(deptNum: number): string {
  const deptMap: Record<number, string> = {
    1: 'Civil and Environmental Engineering',
    2: 'Mechanical Engineering',
    3: 'Materials Science and Engineering',
    4: 'Architecture',
    5: 'Chemistry',
    6: 'Electrical Engineering and Computer Science',
    7: 'Biology',
    8: 'Physics',
    9: 'Brain and Cognitive Sciences',
    10: 'Chemical Engineering',
    11: 'Urban Studies and Planning',
    12: 'Earth, Atmospheric, and Planetary Sciences',
    14: 'Economics',
    15: 'Management',
    16: 'Aeronautics and Astronautics',
    17: 'Political Science',
    18: 'Mathematics',
    20: 'Biological Engineering',
    21: 'Humanities',
    22: 'Nuclear Science and Engineering',
    24: 'Linguistics and Philosophy',
  };
  
  return deptMap[deptNum] || 'Unknown';
}

/**
 * Fetch all courses from ocw-to-go repository
 */
export async function fetchAllOCWToGoCourses(): Promise<ExternalCourse[]> {
  console.log('Fetching course list from ocw-to-go...');
  const courseIds = await fetchOCWToGoCourseList();
  console.log(`Found ${courseIds.length} courses in ocw-to-go`);
  
  const courses: ExternalCourse[] = [];
  let successCount = 0;
  
  for (const courseId of courseIds) {
    try {
      const ocwCourse = await fetchOCWToGoCourse(courseId);
      if (ocwCourse) {
        const externalCourse = convertOCWToGoToExternalCourse(courseId, ocwCourse);
        courses.push(externalCourse);
        successCount++;
      }
      
      // Rate limiting
      if (successCount % 10 === 0) {
        console.log(`  Fetched ${successCount}/${courseIds.length} courses...`);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error processing course ${courseId}:`, error);
    }
  }
  
  console.log(`Successfully converted ${successCount} courses`);
  return courses;
}
