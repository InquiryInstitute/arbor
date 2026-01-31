// Script to enhance credentials with duration estimates and external resource links
// Run this to update sample-credentials.ts with estimated durations and resource links

import { sampleCredentials } from '../data/sample-credentials';
import { estimateDuration, suggestCadence } from '../utils/duration-estimation';
import { populateExternalResources } from '../utils/external-resources';
import type { Credential } from '../types/credential';

/**
 * Enhance a credential with estimated duration and external resources
 */
export function enhanceCredential(credential: Credential): Credential {
  // Estimate duration if not already set or marked as manual
  let enhanced = { ...credential };
  
  if (!credential.estimated_duration_source || credential.estimated_duration_source === 'estimated') {
    const estimated = estimateDuration(
      credential.title,
      credential.level_band,
      credential.college_primary,
      credential.cadence
    );
    
    // Only update if significantly different (more than 2 weeks difference)
    if (Math.abs(estimated - credential.duration_weeks) > 2) {
      enhanced.duration_weeks = estimated;
      enhanced.estimated_duration_source = 'estimated';
    }
  }
  
  // Populate external resource links
  enhanced = populateExternalResources(enhanced);
  
  return enhanced;
}

/**
 * Enhance all credentials in the dataset
 */
export function enhanceAllCredentials(): Credential[] {
  return sampleCredentials.map(enhanceCredential);
}

/**
 * Generate a report of duration estimates vs current values
 */
export function generateDurationReport(): {
  unchanged: number;
  changed: Array<{ id: string; title: string; current: number; estimated: number; diff: number }>;
  suggestions: Array<{ id: string; title: string; currentCadence: string; suggestedCadence: string }>;
} {
  const changed: Array<{ id: string; title: string; current: number; estimated: number; diff: number }> = [];
  const suggestions: Array<{ id: string; title: string; currentCadence: string; suggestedCadence: string }> = [];
  let unchanged = 0;
  
  for (const cred of sampleCredentials) {
    const estimated = estimateDuration(
      cred.title,
      cred.level_band,
      cred.college_primary,
      cred.cadence
    );
    
    if (Math.abs(estimated - cred.duration_weeks) > 2) {
      changed.push({
        id: cred.id,
        title: cred.title,
        current: cred.duration_weeks,
        estimated,
        diff: estimated - cred.duration_weeks,
      });
    } else {
      unchanged++;
    }
    
    const suggested = suggestCadence(estimated);
    if (suggested !== cred.cadence) {
      suggestions.push({
        id: cred.id,
        title: cred.title,
        currentCadence: cred.cadence,
        suggestedCadence: suggested,
      });
    }
  }
  
  return { unchanged, changed, suggestions };
}

/**
 * Generate a report of external resource coverage
 */
export function generateResourceReport(): {
  withKhanAcademy: number;
  withMITOCW: number;
  withBoth: number;
  withNeither: number;
  missingKhanAcademy: Credential[];
  missingMITOCW: Credential[];
} {
  const enhanced = enhanceAllCredentials();
  
  const withKhanAcademy = enhanced.filter(c => c.khan_academy_url).length;
  const withMITOCW = enhanced.filter(c => c.mit_ocw_url).length;
  const withBoth = enhanced.filter(c => c.khan_academy_url && c.mit_ocw_url).length;
  const withNeither = enhanced.filter(c => !c.khan_academy_url && !c.mit_ocw_url).length;
  
  const missingKhanAcademy = enhanced.filter(c => !c.khan_academy_url);
  const missingMITOCW = enhanced.filter(c => !c.mit_ocw_url && ['UG', 'MS', 'PhD', 'Faculty'].includes(c.level_band));
  
  return {
    withKhanAcademy,
    withMITOCW,
    withBoth,
    withNeither,
    missingKhanAcademy,
    missingMITOCW,
  };
}

// If run as a script (ESM module check)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('enhance-credentials.ts')) {
  console.log('=== Duration Estimation Report ===\n');
  const durationReport = generateDurationReport();
  console.log(`Unchanged: ${durationReport.unchanged}`);
  console.log(`Changed: ${durationReport.changed.length}`);
  if (durationReport.changed.length > 0) {
    console.log('\nTop 10 changes:');
    durationReport.changed
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 10)
      .forEach(c => {
        console.log(`  ${c.title}: ${c.current} → ${c.estimated} weeks (${c.diff > 0 ? '+' : ''}${c.diff})`);
      });
  }
  
  if (durationReport.suggestions.length > 0) {
    console.log(`\nCadence suggestions: ${durationReport.suggestions.length}`);
    durationReport.suggestions.slice(0, 5).forEach(s => {
      console.log(`  ${s.title}: ${s.currentCadence} → ${s.suggestedCadence}`);
    });
  }
  
  console.log('\n=== External Resource Report ===\n');
  const resourceReport = generateResourceReport();
  console.log(`With Khan Academy: ${resourceReport.withKhanAcademy}`);
  console.log(`With MIT OCW: ${resourceReport.withMITOCW}`);
  console.log(`With Both: ${resourceReport.withBoth}`);
  console.log(`With Neither: ${resourceReport.withNeither}`);
  console.log(`\nMissing Khan Academy (top 10):`);
  resourceReport.missingKhanAcademy.slice(0, 10).forEach(c => {
    console.log(`  ${c.title} (${c.college_primary}, ${c.level_band})`);
  });
  console.log(`\nMissing MIT OCW (UG+ only, top 10):`);
  resourceReport.missingMITOCW.slice(0, 10).forEach(c => {
    console.log(`  ${c.title} (${c.college_primary}, ${c.level_band})`);
  });
}
