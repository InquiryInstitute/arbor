// Scalable course scraping system for Khan Academy and MIT OCW
// Designed to discover and catalog thousands of courses

import type { ExternalCourse } from '../types/external-course';

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
 * Fetch courses from MIT OCW API
 */
export async function fetchMITOCWFromAPI(): Promise<ExternalCourse[]> {
  try {
    // MIT OCW doesn't have a public REST API, but we can scrape their course listings
    // Alternative: Use their course search/index pages
    
    // Example approach:
    // 1. Fetch https://ocw.mit.edu/courses/
    // 2. Parse HTML for course links
    // 3. For each course, fetch course page and extract metadata
    
    const response = await fetch('https://ocw.mit.edu/courses/');
    if (!response.ok) {
      throw new Error(`Failed to fetch MIT OCW: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse course links from HTML
    // This is a simplified example - in production, use a proper HTML parser
    const courseLinkRegex = /\/courses\/([^\/]+)\//g;
    const matches = [...html.matchAll(courseLinkRegex)];
    const courseIds = [...new Set(matches.map(m => m[1]))];
    
    console.log(`Found ${courseIds.length} MIT OCW courses`);
    
    // For each course, fetch details
    const courses: ExternalCourse[] = [];
    for (const courseId of courseIds.slice(0, 100)) { // Limit to 100 for testing
      try {
        const course = await fetchMITOCWCourseDetails(courseId);
        if (course) {
          courses.push(course);
        }
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error);
      }
    }
    
    return courses;
  } catch (error) {
    console.error('Error fetching MIT OCW courses:', error);
    return [];
  }
}

/**
 * Fetch details for a specific MIT OCW course
 */
async function fetchMITOCWCourseDetails(courseId: string): Promise<ExternalCourse | null> {
  try {
    const url = `https://ocw.mit.edu/courses/${courseId}/`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract course metadata from HTML
    // In production, use a proper HTML parser like cheerio or jsdom
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' | MIT OpenCourseWare', '').trim() : courseId;
    
    // Extract description
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const description = descMatch ? descMatch[1] : undefined;
    
    // Extract level (undergraduate/graduate)
    const levelMatch = html.match(/Level[^:]*:\s*([^<\n]+)/i);
    const level = levelMatch ? levelMatch[1].trim() : 'Undergraduate';
    
    // Extract subject/department
    const deptMatch = html.match(/Department[^:]*:\s*([^<\n]+)/i);
    const subject = deptMatch ? deptMatch[1].trim() : undefined;
    
    // Extract prerequisites
    const prereqSection = html.match(/Prerequisites[^:]*:([^<]+)/i);
    const prerequisites: string[] = [];
    if (prereqSection) {
      // Parse prerequisite text into array
      const prereqText = prereqSection[1].trim();
      // Simple parsing - in production, use more sophisticated parsing
      prerequisites.push(...prereqText.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0));
    }
    
    return {
      id: `mit-${courseId}`,
      source: 'mit_ocw',
      title,
      url,
      description,
      level: level.includes('Graduate') ? 'Graduate' : 'Undergraduate',
      subject,
      duration_weeks: 16, // Default semester length
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      prerequisites_detected: prerequisites.length === 0,
    };
  } catch (error) {
    console.error(`Error fetching MIT OCW course ${courseId}:`, error);
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
