// MIT OCW discovery using sitemap - most reliable method
// MIT OCW sitemap lists all courses: https://ocw.mit.edu/sitemap.xml

import type { ExternalCourse } from '../types/external-course';
import { mapSubjectToCollege } from './ocw-to-go-integration';

/**
 * Parse sitemap XML to extract course URLs
 */
function parseSitemapXML(xml: string): string[] {
  const courseUrls: string[] = [];
  
  // Extract course URLs from sitemap
  // Format: <loc>https://ocw.mit.edu/courses/{course-id}/sitemap.xml</loc>
  const locRegex = /<loc>https:\/\/ocw\.mit\.edu\/courses\/([^\/]+)\/sitemap\.xml<\/loc>/gi;
  const matches = [...xml.matchAll(locRegex)];
  
  matches.forEach(match => {
    const courseId = match[1];
    if (courseId && courseId.length > 3) {
      courseUrls.push(courseId);
    }
  });
  
  return courseUrls;
}

/**
 * Discover all MIT OCW courses using sitemap
 */
export async function discoverMITOCWFromSitemap(): Promise<ExternalCourse[]> {
  console.log('Discovering MIT OCW courses from sitemap...');
  
  try {
    // Fetch main sitemap
    const response = await fetch('https://ocw.mit.edu/sitemap.xml');
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
    }
    
    const sitemapXML = await response.text();
    const courseIds = parseSitemapXML(sitemapXML);
    
    console.log(`Found ${courseIds.length} course IDs in sitemap`);
    
    // Fetch course details
    const courses: ExternalCourse[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < courseIds.length; i++) {
      const courseId = courseIds[i];
      
      try {
        const course = await fetchCourseFromJSON(courseId);
        if (course) {
          courses.push(course);
          successCount++;
        } else {
          errorCount++;
        }
        
        // Progress logging
        if ((i + 1) % 50 === 0) {
          console.log(`  Progress: ${i + 1}/${courseIds.length} (${successCount} found, ${errorCount} failed)`);
        }
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        continue;
      }
    }
    
    console.log(`\nDiscovery complete: ${successCount} courses found, ${errorCount} failed`);
    return courses;
  } catch (error) {
    console.error('Error discovering from sitemap:', error);
    return [];
  }
}

/**
 * Fetch a course from MIT OCW's JSON endpoint
 */
async function fetchCourseFromJSON(courseId: string): Promise<ExternalCourse | null> {
  try {
    const url = `https://ocw.mit.edu/courses/${courseId}/index.json`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
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
      duration_weeks: 16,
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      prerequisites_detected: prerequisites.length === 0,
      tags: courseData['course-features'] || [],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Discover courses by trying common course ID patterns (fallback method)
 */
export async function discoverMITOCWByPattern(): Promise<ExternalCourse[]> {
  console.log('Discovering MIT OCW courses by pattern matching...');
  
  const courses: ExternalCourse[] = [];
  
  // Known course patterns by department
  const departmentPatterns = [
    { dept: 18, name: 'Mathematics', courses: ['01', '02', '03', '06', '05', '700', '701'] },
    { dept: 6, name: 'Computer Science', courses: ['0001', '0002', '006', '034', '042', '046'] },
    { dept: 8, name: 'Physics', courses: ['01', '02', '04', '05', '07'] },
    { dept: 7, name: 'Biology', courses: ['012', '03', '014', '016'] },
    { dept: 5, name: 'Chemistry', courses: ['111', '112', '60'] },
    { dept: 14, name: 'Economics', courses: ['01', '02', '03'] },
    { dept: 24, name: 'Philosophy', courses: ['04', '231', '908'] },
  ];
  
  // Try fetching courses with common patterns
  for (const dept of departmentPatterns) {
    for (const courseNum of dept.courses) {
      // Try different formats: 18-01, 18-01sc, 18-01-fall-2006
      const patterns = [
        `${dept.dept}-${courseNum}`,
        `${dept.dept}-${courseNum}sc`,
        `${dept.dept}-${courseNum}-fall-2006`,
        `${dept.dept}-${courseNum}-spring-2010`,
      ];
      
      for (const pattern of patterns) {
        try {
          const course = await fetchCourseFromJSON(pattern);
          if (course) {
            courses.push(course);
            console.log(`  Found: ${course.title}`);
          }
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          continue;
        }
      }
    }
  }
  
  console.log(`\nDiscovered ${courses.length} courses by pattern`);
  return courses;
}
