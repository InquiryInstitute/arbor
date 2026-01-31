// Script to import prerequisite analyses as PREREQ relations
// Converts prerequisite detection results into credential relations

import { buildCourseCatalog } from '../utils/course-discovery';
import { batchAnalyzePrerequisites } from '../utils/prerequisite-detection';
import { findMatchingMicrocredential } from '../utils/course-discovery';
import { sampleCredentials } from '../data/sample-credentials';
import type { PrerequisiteAnalysis } from '../types/external-course';
import type { CredentialRelation } from '../types/credential';

/**
 * Convert prerequisite analysis to credential relations
 */
export function convertPrerequisitesToRelations(
  analysis: PrerequisiteAnalysis,
  targetCredential: { id: string } | undefined
): CredentialRelation[] {
  if (!targetCredential) {
    return [];
  }

  const relations: CredentialRelation[] = [];

  for (const prereq of analysis.prerequisites) {
    // Only create relations for prerequisites that have a matching microcredential
    if (prereq.microcredential_match && prereq.confidence >= 0.6) {
      // Check if relation already exists
      const relationId = `prereq-${prereq.microcredential_match}-${targetCredential.id}`;
      
      relations.push({
        id: relationId,
        from_credential_id: prereq.microcredential_match,
        to_credential_id: targetCredential.id,
        relation_type: prereq.confidence >= 0.8 ? 'PREREQ' : 'RECOMMENDED',
      });
    }
  }

  return relations;
}

/**
 * Generate new relations from prerequisite analyses
 */
export async function generateRelationsFromPrerequisites(
  useLLM: boolean = false
): Promise<{
  newRelations: CredentialRelation[];
  skipped: CredentialRelation[];
  existingCount: number;
}> {
  const catalog = buildCourseCatalog();
  const allCourses = [...catalog.khan_academy, ...catalog.mit_ocw];
  
  // Analyze prerequisites for all courses
  const analyses = await batchAnalyzePrerequisites(
    allCourses,
    sampleCredentials,
    useLLM
  );

  const newRelations: CredentialRelation[] = [];
  const skipped: CredentialRelation[] = [];
  const existingRelationIds = new Set(
    // Import existing relations - would need to read from sample-credentials.ts
    // For now, we'll check against a placeholder
    []
  );

  for (const analysis of analyses) {
    // Find the matching microcredential for the course
    const course = allCourses.find(c => c.id === analysis.course_id);
    if (!course) continue;

    const targetCredential = findMatchingMicrocredential(course, sampleCredentials);
    if (!targetCredential) {
      console.warn(`No matching credential found for course: ${analysis.course_title}`);
      continue;
    }

    // Convert prerequisites to relations
    const relations = convertPrerequisitesToRelations(analysis, targetCredential);

    for (const relation of relations) {
      // Check if relation already exists
      if (existingRelationIds.has(relation.id)) {
        skipped.push(relation);
        continue;
      }

      // Check for reverse relation (might already exist in opposite direction)
      const reverseId = `prereq-${relation.to_credential_id}-${relation.from_credential_id}`;
      if (existingRelationIds.has(reverseId)) {
        skipped.push(relation);
        continue;
      }

      newRelations.push(relation);
      existingRelationIds.add(relation.id);
    }
  }

  return {
    newRelations,
    skipped,
    existingCount: existingRelationIds.size,
  };
}

/**
 * Print import report
 */
export async function printImportReport(useLLM: boolean = false): Promise<void> {
  console.log('=== Prerequisite Import Report ===\n');

  const result = await generateRelationsFromPrerequisites(useLLM);

  console.log('Summary:');
  console.log(`  New relations to add: ${result.newRelations.length}`);
  console.log(`  Skipped (already exist): ${result.skipped.length}`);
  console.log(`  Existing relations: ${result.existingCount}\n`);

  if (result.newRelations.length > 0) {
    console.log('New PREREQ Relations (top 20):');
    result.newRelations.slice(0, 20).forEach(rel => {
      const fromCred = sampleCredentials.find(c => c.id === rel.from_credential_id);
      const toCred = sampleCredentials.find(c => c.id === rel.to_credential_id);
      console.log(`  ${rel.id}:`);
      console.log(`    From: ${fromCred?.title || rel.from_credential_id}`);
      console.log(`    To: ${toCred?.title || rel.to_credential_id}`);
      console.log(`    Type: ${rel.relation_type}`);
    });
  }

  if (result.newRelations.length > 20) {
    console.log(`\n  ... and ${result.newRelations.length - 20} more relations`);
  }

  console.log('\nTo import these relations, add them to sample-credentials.ts');
  console.log('Example format:');
  if (result.newRelations.length > 0) {
    const example = result.newRelations[0];
    console.log(`  { id: '${example.id}', from_credential_id: '${example.from_credential_id}', to_credential_id: '${example.to_credential_id}', relation_type: '${example.relation_type}' },`);
  }
}

// If run as a script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('import-prerequisites.ts')) {
  const useLLM = process.argv.includes('--use-llm');
  printImportReport(useLLM).catch(console.error);
}
