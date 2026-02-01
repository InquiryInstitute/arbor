// Script to generate microcredential suggestions for missing courses
// Creates suggested credential structures that can be added to sample-credentials.ts

import { buildCourseCatalog, findMissingMicrocredentials } from '../utils/course-discovery';
import { generateMicrocredentialSuggestions } from '../scripts/sync-external-courses';
import { sampleCredentials } from '../data/sample-credentials';
import { loadCoursesFromFile } from '../utils/course-scraper';
import type { Credential } from '../types/credential';
import { existsSync } from 'fs';

const MIT_OCW_CACHE = './data/course-cache/mit-ocw-courses.json';

/**
 * Generate microcredential suggestions and output them in a format ready to add
 */
async function generateSuggestions(): Promise<void> {
  console.log('=== Generating Microcredential Suggestions ===\n');
  
  // Load cached courses if available
  let mitCourses = [];
  if (existsSync(MIT_OCW_CACHE)) {
    mitCourses = await loadCoursesFromFile(MIT_OCW_CACHE);
  } else {
    // Build catalog from discovery
    const catalog = buildCourseCatalog();
    mitCourses = catalog.mit_ocw;
  }
  
  // Find missing microcredentials
  const missing = findMissingMicrocredentials(
    { khan_academy: [], mit_ocw: mitCourses },
    sampleCredentials
  );
  
  console.log(`Found ${missing.mit_ocw.length} missing MIT OCW microcredentials\n`);
  
  if (missing.mit_ocw.length === 0) {
    console.log('All courses have matching microcredentials!');
    return;
  }
  
  // Generate suggestions
  const suggestions = generateMicrocredentialSuggestions(missing.mit_ocw);
  
  console.log('Suggested Microcredentials to Add:\n');
  console.log('// Add these to src/data/sample-credentials.ts\n');
  console.log('// ============================================');
  console.log('// Missing MIT OCW Courses');
  console.log('// ============================================\n');
  
  // Group by college for better organization
  const byCollege: Record<string, typeof suggestions> = {};
  suggestions.forEach(s => {
    const college = s.suggestedCredential.college_primary || 'META';
    if (!byCollege[college]) {
      byCollege[college] = [];
    }
    byCollege[college].push(s);
  });
  
  // Output suggestions grouped by college
  Object.entries(byCollege).forEach(([college, collegeSuggestions]) => {
    console.log(`// ${college} College - ${collegeSuggestions.length} courses\n`);
    
    collegeSuggestions.forEach((suggestion, index) => {
      const cred = suggestion.suggestedCredential;
      const course = suggestion.course;
      
      // Generate ID from title
      const slug = course.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const id = `${cred.level_band}.${cred.college_primary}.${slug}`;
      
      console.log(`// ${course.title}`);
      console.log(`// Source: ${course.url}`);
      if (course.description) {
        const shortDesc = course.description.substring(0, 100).replace(/\n/g, ' ');
        console.log(`// ${shortDesc}...`);
      }
      console.log(`{`);
      console.log(`  id: '${id}',`);
      console.log(`  title: '${cred.title}',`);
      console.log(`  cadence: '${cred.cadence}',`);
      console.log(`  college_primary: '${cred.college_primary}',`);
      console.log(`  level_band: '${cred.level_band}',`);
      console.log(`  duration_weeks: ${cred.duration_weeks},`);
      if (cred.mit_ocw_url) {
        console.log(`  mit_ocw_url: '${cred.mit_ocw_url}',`);
      }
      if (cred.khan_academy_url) {
        console.log(`  khan_academy_url: '${cred.khan_academy_url}',`);
      }
      console.log(`  estimated_duration_source: 'estimated',`);
      if (course.description) {
        console.log(`  summary: '${course.description.substring(0, 200).replace(/'/g, "\\'")}...',`);
      }
      console.log(`},`);
      console.log('');
    });
  });
  
  console.log('\n// ============================================');
  console.log(`// Total: ${suggestions.length} suggested microcredentials`);
  console.log('// ============================================\n');
  
  // Also output as JSON for easier processing
  const jsonOutput = suggestions.map(s => ({
    course: {
      title: s.course.title,
      url: s.course.url,
      subject: s.course.subject,
      level: s.course.level,
    },
    suggestedCredential: s.suggestedCredential,
  }));
  
  const fs = await import('fs/promises');
  await fs.writeFile(
    './data/suggested-microcredentials.json',
    JSON.stringify(jsonOutput, null, 2),
    'utf-8'
  );
  
  console.log('✅ Suggestions saved to data/suggested-microcredentials.json');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-missing-credentials.ts')) {
  generateSuggestions().catch(console.error);
}
