// Script to discover and catalog all Khan Academy and MIT OCW courses
// Designed to scale to thousands of courses

import { fetchMITOCWFromAPI, fetchKhanAcademyCourses, saveCoursesToFile, loadCoursesFromFile } from '../utils/course-scraper';
import { buildCourseCatalog, findMissingMicrocredentials } from '../utils/course-discovery';
import { sampleCredentials } from '../data/sample-credentials';
import type { ExternalCourse } from '../types/external-course';
import { existsSync } from 'fs';

const CACHE_DIR = './data/course-cache';
const MIT_OCW_CACHE = `${CACHE_DIR}/mit-ocw-courses.json`;
const KHAN_ACADEMY_CACHE = `${CACHE_DIR}/khan-academy-courses.json`;

/**
 * Discover all MIT OCW courses
 */
async function discoverMITOCWCourses(useCache: boolean = true): Promise<ExternalCourse[]> {
  if (useCache && existsSync(MIT_OCW_CACHE)) {
    console.log('Loading MIT OCW courses from cache...');
    const cached = await loadCoursesFromFile(MIT_OCW_CACHE);
    if (cached.length > 0) {
      console.log(`Loaded ${cached.length} MIT OCW courses from cache`);
      return cached;
    }
  }
  
  console.log('Discovering MIT OCW courses...');
  const courses = await fetchMITOCWFromAPI();
  
  if (courses.length > 0) {
    // Ensure cache directory exists
    const fs = await import('fs/promises');
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await saveCoursesToFile(courses, MIT_OCW_CACHE);
  }
  
  return courses;
}

/**
 * Discover all Khan Academy courses
 */
async function discoverKhanAcademyCourses(useCache: boolean = true): Promise<ExternalCourse[]> {
  if (useCache && existsSync(KHAN_ACADEMY_CACHE)) {
    console.log('Loading Khan Academy courses from cache...');
    const cached = await loadCoursesFromFile(KHAN_ACADEMY_CACHE);
    if (cached.length > 0) {
      console.log(`Loaded ${cached.length} Khan Academy courses from cache`);
      return cached;
    }
  }
  
  console.log('Discovering Khan Academy courses...');
  console.log('Note: Khan Academy scraping requires browser automation or API access');
  const courses = await fetchKhanAcademyCourses();
  
  if (courses.length > 0) {
    const fs = await import('fs/promises');
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await saveCoursesToFile(courses, KHAN_ACADEMY_CACHE);
  }
  
  return courses;
}

/**
 * Generate comprehensive discovery report
 */
async function generateDiscoveryReport(
  refresh: boolean = false,
  limit: number = 0
): Promise<void> {
  console.log('=== Course Discovery Report ===\n');
  
  // Discover courses
  const mitCourses = await discoverMITOCWCourses(!refresh);
  const khanCourses = await discoverKhanAcademyCourses(!refresh);
  
  console.log('\nDiscovery Summary:');
  console.log(`  MIT OCW courses discovered: ${mitCourses.length}`);
  console.log(`  Khan Academy courses discovered: ${khanCourses.length}`);
  console.log(`  Total: ${mitCourses.length + khanCourses.length}\n`);
  
  // Analyze missing microcredentials
  const allCourses = [...mitCourses, ...khanCourses];
  const missing = findMissingMicrocredentials(
    { khan_academy: khanCourses, mit_ocw: mitCourses },
    sampleCredentials
  );
  
  console.log('Missing Microcredentials:');
  console.log(`  MIT OCW: ${missing.mit_ocw.length}/${mitCourses.length}`);
  console.log(`  Khan Academy: ${missing.khan_academy.length}/${khanCourses.length}`);
  console.log(`  Total missing: ${missing.mit_ocw.length + missing.khan_academy.length}\n`);
  
  if (missing.mit_ocw.length > 0 && (limit === 0 || limit > 0)) {
    console.log('Sample missing MIT OCW courses:');
    missing.mit_ocw.slice(0, limit || 10).forEach(c => {
      console.log(`  - ${c.title} (${c.subject}, ${c.level})`);
    });
  }
  
  if (missing.khan_academy.length > 0 && (limit === 0 || limit > 0)) {
    console.log('\nSample missing Khan Academy courses:');
    missing.khan_academy.slice(0, limit || 10).forEach(c => {
      console.log(`  - ${c.title} (${c.subject}, ${c.level})`);
    });
  }
  
  // Statistics by subject
  const subjectStats: Record<string, { mit: number; khan: number }> = {};
  allCourses.forEach(c => {
    const subject = c.subject || 'Unknown';
    if (!subjectStats[subject]) {
      subjectStats[subject] = { mit: 0, khan: 0 };
    }
    if (c.source === 'mit_ocw') {
      subjectStats[subject].mit++;
    } else {
      subjectStats[subject].khan++;
    }
  });
  
  console.log('\nCourses by Subject:');
  Object.entries(subjectStats)
    .sort((a, b) => (b[1].mit + b[1].khan) - (a[1].mit + a[1].khan))
    .forEach(([subject, stats]) => {
      console.log(`  ${subject}: ${stats.mit} MIT, ${stats.khan} Khan`);
    });
  
  // Statistics by level
  const levelStats: Record<string, number> = {};
  allCourses.forEach(c => {
    const level = c.level || 'Unknown';
    levelStats[level] = (levelStats[level] || 0) + 1;
  });
  
  console.log('\nCourses by Level:');
  Object.entries(levelStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes('--refresh');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  await generateDiscoveryReport(refresh, limit);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('discover-all-courses.ts')) {
  main().catch(console.error);
}
