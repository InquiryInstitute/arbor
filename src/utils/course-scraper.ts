// Scalable course scraping system for Khan Academy and MIT OCW
// Designed to discover and catalog thousands of courses

import type { ExternalCourse } from '../types/external-course';
import { fetchAllOCWToGoCourses } from './ocw-to-go-integration';

/**
 * Khan Academy API/Scraping
 * Khan Academy has a public API and structured course pages
 */
export async function scrapeKhanAcademyCourses(): Promise<ExternalCourse[]> {
  const courses: ExternalCourse[] = [];
  
  // Khan Academy course structure:
  // - Main subjects: Math, Science, Computing, Arts & Humanities, Economics, Reading & Language Arts
  // - Each subject has multiple courses/topics
  // - Courses are organized by grade level (K-12) and subject area
  
  // Known Khan Academy subject areas
  const khanSubjects = [
    { path: 'math', subject: 'Mathematics' },
    { path: 'science', subject: 'Science' },
    { path: 'computing', subject: 'Computer Science' },
    { path: 'humanities', subject: 'Arts & Humanities' },
    { path: 'economics-finance-domain', subject: 'Economics' },
    { path: 'ela', subject: 'English Language Arts' },
  ];
  
  // For now, return a structured approach
  // In production, this would:
  // 1. Fetch from Khan Academy API if available
  // 2. Scrape course listing pages
  // 3. Parse course metadata (title, description, level, duration)
  // 4. Extract prerequisites from course pages
  
  console.log('Khan Academy scraping: Use their API or scrape course listing pages');
  console.log('Example: https://www.khanacademy.org/math (contains all math courses)');
  
  return courses;
}

/**
 * MIT OCW Scraping
 * MIT OCW has a comprehensive course catalog with API access
 */
export async function scrapeMITOCWCourses(): Promise<ExternalCourse[]> {
  const courses: ExternalCourse[] = [];
  
  // MIT OCW has:
  // - REST API: https://ocw.mit.edu/courses/
  // - Course listings by department
  // - Course metadata includes prerequisites, level, duration
  
  // MIT OCW API endpoints:
  // - GET /courses/ - List all courses
  // - GET /courses/{course_id}/ - Course details
  // - GET /departments/ - List departments
  
  console.log('MIT OCW scraping: Use their REST API');
  console.log('API Base: https://ocw.mit.edu/courses/');
  console.log('Example: https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/');
  
  // In production, this would:
  // 1. Fetch course list from MIT OCW API
  // 2. For each course, fetch detailed metadata
  // 3. Extract prerequisites, level, subject, duration
  // 4. Map to our ExternalCourse format
  
  return courses;
}

/**
 * MIT OCW Course from JSON API
 */
interface MITOCWCourseJSON {
  id: string;
  title: string;
  url: string;
  description?: string;
  level?: string;
  department?: string;
  department_number?: string;
  prerequisites?: string;
  'as-taught-in'?: string;
  'term-offered'?: string;
  'course-features'?: string[];
  instructors?: Array<{ name: string }>;
}

/**
 * Fetch courses from MIT OCW JSON API
 * API endpoint: https://ocw.mit.edu/courses/index.json
 */
export async function fetchMITOCWFromAPI(): Promise<ExternalCourse[]> {
  try {
    console.log('Fetching MIT OCW courses from JSON API...');
    const response = await fetch('https://ocw.mit.edu/courses/index.json', {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // If JSON endpoint doesn't exist, try alternative approaches
      console.warn(`JSON endpoint returned ${response.status}, trying alternative...`);
      return await fetchMITOCWAlternative();
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response is not JSON, trying alternative...');
      return await fetchMITOCWAlternative();
    }
    
    const data = await response.json();
    const coursesJson: MITOCWCourseJSON[] = Array.isArray(data) ? data : data.courses || [];
    
    console.log(`Found ${coursesJson.length} MIT OCW courses in JSON`);
    
    // Convert JSON courses to ExternalCourse format
    const courses: ExternalCourse[] = coursesJson.map(course => {
      // Determine level
      let level = 'Undergraduate';
      if (course.level) {
        level = course.level.includes('Graduate') ? 'Graduate' : 'Undergraduate';
      } else if (course.department_number) {
        // MIT course numbers: 1-16 = undergraduate, 17+ = graduate
        const deptNum = parseInt(course.department_number.split('-')[0]);
        level = deptNum >= 17 ? 'Graduate' : 'Undergraduate';
      }
      
      // Extract prerequisites
      const prerequisites: string[] = [];
      if (course.prerequisites) {
        // Parse prerequisites text - could be comma-separated or more complex
        const prereqText = course.prerequisites;
        // Simple parsing - split by common delimiters
        prerequisites.push(...prereqText
          .split(/[,;]|and|or/i)
          .map(p => p.trim())
          .filter(p => p.length > 0 && !p.match(/^(none|n\/a|not required)$/i))
        );
      }
      
      // Determine subject from department
      const subject = course.department || course.department_number?.split('-')[0] || 'Unknown';
      
      // Estimate duration (MIT courses are typically semester-length)
      const duration_weeks = 16; // Standard semester
      
      return {
        id: `mit-${course.id}`,
        source: 'mit_ocw',
        title: course.title,
        url: course.url || `https://ocw.mit.edu/courses/${course.id}/`,
        description: course.description,
        level,
        subject,
        duration_weeks,
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
        prerequisites_detected: prerequisites.length === 0,
        tags: course['course-features'] || [],
      };
    });
    
    console.log(`Converted ${courses.length} courses to ExternalCourse format`);
    return courses;
  } catch (error) {
    console.error('Error fetching MIT OCW courses:', error);
    return [];
  }
}

/**
 * Fetch detailed information for a specific MIT OCW course
 * Can be used to get additional metadata not in the index.json
 */
export async function fetchMITOCWCourseDetails(courseId: string): Promise<Partial<ExternalCourse> | null> {
  try {
    // MIT OCW also has individual course JSON endpoints
    // Format: https://ocw.mit.edu/courses/{course-id}/index.json
    const url = `https://ocw.mit.edu/courses/${courseId}/index.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const courseData = await response.json();
    
    // Extract additional details that might not be in the main index
    return {
      description: courseData.description || courseData['course-description'],
      // Additional fields can be extracted here
    };
  } catch (error) {
    console.error(`Error fetching MIT OCW course details for ${courseId}:`, error);
    return null;
  }
}

/**
 * Fetch courses from Khan Academy
 * Khan Academy doesn't have a public API, so we need to scrape
 */
export async function fetchKhanAcademyCourses(): Promise<ExternalCourse[]> {
  try {
    // Khan Academy course structure:
    // Main subjects -> Courses -> Units -> Lessons
    
    // Known main subject areas
    const subjectAreas = [
      { path: 'math', name: 'Mathematics' },
      { path: 'science', name: 'Science' },
      { path: 'computing', name: 'Computer Science' },
      { path: 'humanities', name: 'Arts & Humanities' },
      { path: 'economics-finance-domain', name: 'Economics' },
      { path: 'ela', name: 'English Language Arts' },
    ];
    
    const courses: ExternalCourse[] = [];
    
    for (const area of subjectAreas) {
      try {
        const url = `https://www.khanacademy.org/${area.path}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const html = await response.text();
        
        // Parse course links from Khan Academy pages
        // Khan Academy uses React, so we need to look for data attributes or API calls
        // Alternative: Use their sitemap or course index pages
        
        // For now, return structured approach
        // In production, would:
        // 1. Parse course listings from HTML
        // 2. Or use browser automation (Puppeteer/Playwright) to extract React-rendered content
        // 3. Or find their internal API endpoints
        
        console.log(`Scraping ${area.name} courses from ${url}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching ${area.name} courses:`, error);
      }
    }
    
    return courses;
  } catch (error) {
    console.error('Error fetching Khan Academy courses:', error);
    return [];
  }
}

/**
 * Batch process courses with rate limiting and error handling
 */
export async function batchFetchCourses(
  fetchFn: () => Promise<ExternalCourse[]>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<ExternalCourse[]> {
  const allCourses: ExternalCourse[] = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const batch = await fetchFn();
      allCourses.push(...batch);
      
      hasMore = batch.length === batchSize;
      offset += batchSize;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Error in batch ${offset}:`, error);
      hasMore = false;
    }
  }
  
  return allCourses;
}

/**
 * Save courses to a JSON file for caching
 */
export async function saveCoursesToFile(
  courses: ExternalCourse[],
  filepath: string
): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(filepath, JSON.stringify(courses, null, 2), 'utf-8');
  console.log(`Saved ${courses.length} courses to ${filepath}`);
}

/**
 * Load courses from a cached JSON file
 */
export async function loadCoursesFromFile(
  filepath: string
): Promise<ExternalCourse[]> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading courses from ${filepath}:`, error);
    return [];
  }
}
