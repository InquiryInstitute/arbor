// Full MIT OCW course discovery - fetch all courses from MIT OCW website
// MIT OCW has 2,500+ courses, not just the 59 in ocw-to-go

import type { ExternalCourse } from '../types/external-course';
import { mapSubjectToCollege } from './ocw-to-go-integration';

/**
 * Fetch all course IDs from MIT OCW by scraping their course listing pages
 * MIT OCW organizes courses by department/subject
 */
export async function discoverAllMITOCWCourses(): Promise<ExternalCourse[]> {
  console.log('Discovering all MIT OCW courses...');
  
  // MIT OCW has course listings by department
  // We can fetch from their browse pages or search API
  const courses: ExternalCourse[] = [];
  
  // Known MIT OCW department URLs
  const departments = [
    'aeronautics-astronautics',
    'anthropology',
    'architecture',
    'biological-engineering',
    'biology',
    'brain-cognitive-sciences',
    'chemical-engineering',
    'chemistry',
    'civil-environmental-engineering',
    'comparative-media-studies',
    'earth-atmospheric-planetary-sciences',
    'economics',
    'electrical-engineering-computer-science',
    'engineering-systems-division',
    'experimental-study-group',
    'global-studies-languages',
    'health-sciences-technology',
    'history',
    'linguistics-philosophy',
    'literature',
    'materials-science-engineering',
    'mathematics',
    'mechanical-engineering',
    'media-arts-sciences',
    'music-theater-arts',
    'nuclear-science-engineering',
    'physics',
    'political-science',
    'science-technology-society',
    'sloan-school-management',
    'urban-studies-planning',
    'women-gender-studies',
  ];
  
  console.log(`Checking ${departments.length} departments...`);
  
  for (const dept of departments) {
    try {
      const deptCourses = await fetchDepartmentCourses(dept);
      courses.push(...deptCourses);
      console.log(`  ${dept}: ${deptCourses.length} courses`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching ${dept} courses:`, error);
    }
  }
  
  console.log(`\nTotal courses discovered: ${courses.length}`);
  return courses;
}

/**
 * Fetch courses from a specific department page
 */
async function fetchDepartmentCourses(department: string): Promise<ExternalCourse[]> {
  try {
    // MIT OCW department pages have course listings
    const url = `https://ocw.mit.edu/courses/${department}/`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    
    // Extract course links - MIT OCW course URLs follow pattern: /courses/{course-id}/
    // Look for links like: <a href="/courses/18-01-single-variable-calculus-fall-2006/">
    const courseLinkRegex = /\/courses\/([a-z0-9-]+)\//gi;
    const matches = [...html.matchAll(courseLinkRegex)];
    const courseIds = [...new Set(matches.map(m => m[1]))]
      .filter(id => 
        id && 
        id !== department && 
        !id.includes('index') && 
        id.length > 3 &&
        /^\d+/.test(id) // Course IDs start with numbers
      );
    
    // For each course, try to fetch its JSON endpoint
    const courses: ExternalCourse[] = [];
    
    for (const courseId of courseIds) {
      try {
        const course = await fetchCourseFromJSON(courseId);
        if (course) {
          courses.push(course);
        }
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Skip courses that fail
        continue;
      }
    }
    
    return courses;
  } catch (error) {
    console.error(`Error fetching department ${department}:`, error);
    return [];
  }
}

/**
 * Fetch a course from MIT OCW's JSON endpoint
 * Format: https://ocw.mit.edu/courses/{course-id}/index.json
 */
async function fetchCourseFromJSON(courseId: string): Promise<ExternalCourse | null> {
  try {
    const url = `https://ocw.mit.edu/courses/${courseId}/index.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const courseData = await response.json();
    
    // Extract course metadata
    const title = courseData.title || courseData['course-title'] || courseId;
    const description = courseData.description || courseData['course-description'];
    
    // Extract level
    let level = 'Undergraduate';
    if (courseData.level) {
      level = courseData.level.toLowerCase().includes('graduate') ? 'Graduate' : 'Undergraduate';
    } else {
      // Infer from course number (MIT: 1-16 = UG, 17+ = Grad)
      const deptMatch = courseId.match(/^(\d+)-/);
      if (deptMatch) {
        const deptNum = parseInt(deptMatch[1]);
        level = deptNum >= 17 ? 'Graduate' : 'Undergraduate';
      }
    }
    
    // Extract subject/department
    const subject = courseData.department || 
                   courseData['department-number']?.split('-')[0] || 
                   courseData.category ||
                   'Unknown';
    
    // Extract prerequisites
    const prerequisites: string[] = [];
    if (courseData.prerequisites) {
      const prereqText = typeof courseData.prerequisites === 'string' 
        ? courseData.prerequisites 
        : JSON.stringify(courseData.prerequisites);
      prerequisites.push(...prereqText
        .split(/[,;]|and|or/i)
        .map(p => p.trim())
        .filter(p => p.length > 0 && !p.match(/^(none|n\/a|not required)$/i))
      );
    }
    
    // Map subject to college
    const college = mapSubjectToCollege(subject);
    
    return {
      id: `mit-${courseId}`,
      source: 'mit_ocw',
      title,
      url: `https://ocw.mit.edu/courses/${courseId}/`,
      description: description?.substring(0, 500),
      level,
      subject,
      duration_weeks: 16, // Standard semester
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      prerequisites_detected: prerequisites.length === 0,
      tags: courseData['course-features'] || [],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Alternative: Use MIT OCW's search/browse API if available
 */
export async function discoverMITOCWViaSearch(): Promise<ExternalCourse[]> {
  // MIT OCW might have a search API or sitemap
  // This is a placeholder for future implementation
  
  console.log('MIT OCW search API not yet implemented');
  return [];
}
