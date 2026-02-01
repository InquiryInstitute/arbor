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
    
    // Check content type, but be lenient - some endpoints might return HTML
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Try to parse anyway - might be JSON with wrong content-type
      const text = await response.text();
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
          const courseData = JSON.parse(text);
          return processCourseData(courseId, courseData);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    
    const courseData = await response.json();
    return processCourseData(courseId, courseData);
  } catch (error) {
    // JSON endpoint might not exist - try HTML scraping as fallback
    return await fetchCourseFromHTML(courseId);
  }
}

/**
 * Fetch course from HTML page (fallback when JSON not available)
 */
async function fetchCourseFromHTML(courseId: string): Promise<ExternalCourse | null> {
  try {
    const url = `https://ocw.mit.edu/courses/${courseId}/`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract title from HTML
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' | MIT OpenCourseWare', '').trim() : courseId;
    
    // Extract description from meta tag
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    const description = descMatch ? descMatch[1] : undefined;
    
    // Infer level from course number
    let level = 'Undergraduate';
    const deptMatch = courseId.match(/^(\d+)-/);
    if (deptMatch) {
      const deptNum = parseInt(deptMatch[1]);
      level = deptNum >= 17 ? 'Graduate' : 'Undergraduate';
    }
    
    // Extract subject from department number
    const subject = deptMatch ? getSubjectFromDeptNumber(parseInt(deptMatch[1])) : 'Unknown';
    
    return {
      id: `mit-${courseId}`,
      source: 'mit_ocw',
      title,
      url,
      description: description?.substring(0, 500),
      level,
      subject,
      duration_weeks: 16,
      prerequisites_detected: true,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get subject from department number
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
 * Process course data into ExternalCourse format
 */
function processCourseData(courseId: string, courseData: any): ExternalCourse | null {
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
