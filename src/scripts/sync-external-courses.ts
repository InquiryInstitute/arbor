// Script to sync external courses (Khan Academy, MIT OCW) with microcredentials
// Ensures every course has a corresponding microcredential and captures prerequisites

import { buildCourseCatalog, findMissingMicrocredentials, findMatchingMicrocredential } from '../utils/course-discovery';
import { batchAnalyzePrerequisites } from '../utils/prerequisite-detection';
import { sampleCredentials } from '../data/sample-credentials';
import type { ExternalCourse, PrerequisiteAnalysis } from '../types/external-course';
import type { Credential } from '../types/credential';

/**
 * Generate microcredential suggestions for missing courses
 */
export function generateMicrocredentialSuggestions(
  missingCourses: ExternalCourse[]
): Array<{
  course: ExternalCourse;
  suggestedCredential: Partial<Credential>;
}> {
  return missingCourses.map(course => {
    // Map external course to credential structure
    const levelMap: Record<string, string> = {
      'K-12': 'G4-6',
      'G7-8': 'G7-8',
      'G9-10': 'G9-10',
      'G11-12': 'G11-12',
      'Undergraduate': 'UG',
      'Graduate': 'MS',
    };
    
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
    
    const levelBand = levelMap[course.level || ''] || 'UG';
    const college = collegeMap[course.subject || ''] || 'META';
    
    // Determine cadence based on duration
    const cadence = (course.duration_weeks || 12) <= 6 ? 'monthly' : 'seasonal';
    
    return {
      course,
      suggestedCredential: {
        title: course.title,
        cadence,
        college_primary: college as any,
        level_band: levelBand as any,
        duration_weeks: course.duration_weeks || 12,
        khan_academy_url: course.source === 'khan_academy' ? course.url : undefined,
        mit_ocw_url: course.source === 'mit_ocw' ? course.url : undefined,
        estimated_duration_source: 'estimated',
        tags: course.tags || [],
        summary: course.description,
      },
    };
  });
}

/**
 * Generate a comprehensive sync report
 */
export async function generateSyncReport(useLLM: boolean = false): Promise<{
  catalog: { khan_academy: number; mit_ocw: number };
  matched: { khan_academy: number; mit_ocw: number };
  missing: { khan_academy: ExternalCourse[]; mit_ocw: ExternalCourse[] };
  suggestions: Array<{ course: ExternalCourse; suggestedCredential: Partial<Credential> }>;
  prerequisiteAnalyses: PrerequisiteAnalysis[];
}> {
  const catalog = buildCourseCatalog();
  const missing = findMissingMicrocredentials(catalog, sampleCredentials);
  
  // Count matched courses
  const matched = {
    khan_academy: catalog.khan_academy.length - missing.khan_academy.length,
    mit_ocw: catalog.mit_ocw.length - missing.mit_ocw.length,
  };
  
  // Generate suggestions for missing courses
  const allMissing = [...missing.khan_academy, ...missing.mit_ocw];
  const suggestions = generateMicrocredentialSuggestions(allMissing);
  
  // Analyze prerequisites for all courses
  const allCourses = [...catalog.khan_academy, ...catalog.mit_ocw];
  const prerequisiteAnalyses = await batchAnalyzePrerequisites(
    allCourses,
    sampleCredentials,
    useLLM
  );
  
  return {
    catalog: {
      khan_academy: catalog.khan_academy.length,
      mit_ocw: catalog.mit_ocw.length,
    },
    matched,
    missing: {
      khan_academy: missing.khan_academy,
      mit_ocw: missing.mit_ocw,
    },
    suggestions,
    prerequisiteAnalyses,
  };
}

/**
 * Print sync report to console
 */
export async function printSyncReport(useLLM: boolean = false): Promise<void> {
  console.log('=== External Course Sync Report ===\n');
  
  const report = await generateSyncReport(useLLM);
  
  console.log('Catalog Summary:');
  console.log(`  Khan Academy courses: ${report.catalog.khan_academy}`);
  console.log(`  MIT OCW courses: ${report.catalog.mit_ocw}`);
  console.log(`  Total: ${report.catalog.khan_academy + report.catalog.mit_ocw}\n`);
  
  console.log('Matching Status:');
  console.log(`  Khan Academy matched: ${report.matched.khan_academy}/${report.catalog.khan_academy}`);
  console.log(`  MIT OCW matched: ${report.matched.mit_ocw}/${report.catalog.mit_ocw}`);
  console.log(`  Total matched: ${report.matched.khan_academy + report.matched.mit_ocw}/${report.catalog.khan_academy + report.catalog.mit_ocw}\n`);
  
  console.log('Missing Microcredentials:');
  console.log(`  Khan Academy: ${report.missing.khan_academy.length}`);
  if (report.missing.khan_academy.length > 0) {
    console.log('  Top 10 missing KA courses:');
    report.missing.khan_academy.slice(0, 10).forEach(c => {
      console.log(`    - ${c.title} (${c.subject}, ${c.level})`);
    });
  }
  
  console.log(`  MIT OCW: ${report.missing.mit_ocw.length}`);
  if (report.missing.mit_ocw.length > 0) {
    console.log('  Top 10 missing MIT courses:');
    report.missing.mit_ocw.slice(0, 10).forEach(c => {
      console.log(`    - ${c.title} (${c.subject}, ${c.level})`);
    });
  }
  
  console.log('\nPrerequisite Analysis:');
  const withPrereqs = report.prerequisiteAnalyses.filter(a => a.prerequisites.length > 0);
  console.log(`  Courses with prerequisites: ${withPrereqs.length}/${report.prerequisiteAnalyses.length}`);
  
  if (withPrereqs.length > 0) {
    console.log('  Sample prerequisite analyses:');
    withPrereqs.slice(0, 5).forEach(a => {
      console.log(`    ${a.course_title}:`);
      a.prerequisites.forEach(p => {
        const match = p.microcredential_match ? ` → ${p.microcredential_match}` : ' (no match)';
        console.log(`      - ${p.title} (${p.confidence.toFixed(2)}, ${p.source})${match}`);
      });
    });
  }
}

// If run as a script (ESM module check)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-external-courses.ts')) {
  const useLLM = process.argv.includes('--use-llm');
  printSyncReport(useLLM).catch(console.error);
}
