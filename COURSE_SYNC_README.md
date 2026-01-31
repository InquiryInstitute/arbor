# Course Sync System

This system ensures that every Khan Academy and MIT OpenCourseWare course has a corresponding microcredential, and captures prerequisites using LLM analysis when they're not explicitly available.

## Overview

The course sync system consists of:

1. **Course Discovery** (`src/utils/course-discovery.ts`)
   - Catalogs Khan Academy and MIT OCW courses
   - Maps external courses to microcredentials
   - Identifies missing microcredentials

2. **Prerequisite Detection** (`src/utils/prerequisite-detection.ts`)
   - Detects prerequisites from explicit course data
   - Uses LLM to infer prerequisites when not available
   - Matches prerequisites to existing microcredentials

3. **Sync Scripts** (`src/scripts/sync-external-courses.ts`)
   - Generates sync reports
   - Suggests new microcredentials for missing courses
   - Analyzes prerequisite relationships

## Usage

### Generate Sync Report

```bash
# Basic report (no LLM calls)
npm run sync-courses

# Full report with LLM prerequisite detection
npm run sync-courses -- --use-llm
```

### Generate Duration Estimates

```bash
npm run enhance-credentials
```

## System Components

### External Course Types

```typescript
interface ExternalCourse {
  id: string;
  source: 'khan_academy' | 'mit_ocw';
  title: string;
  url: string;
  description?: string;
  level?: string;
  subject?: string;
  duration_weeks?: number;
  prerequisites?: string[];
  prerequisites_detected?: boolean;
  microcredential_id?: string;
  tags?: string[];
}
```

### Prerequisite Analysis

```typescript
interface PrerequisiteAnalysis {
  course_id: string;
  course_title: string;
  prerequisites: Array<{
    title: string;
    confidence: number; // 0-1
    source: 'explicit' | 'llm_detected' | 'inferred';
    microcredential_match?: string;
  }>;
  analysis_notes?: string;
}
```

## LLM Integration

The prerequisite detection system uses the Supabase LLM Gateway Edge Function to analyze courses and detect prerequisites when they're not explicitly listed.

### Configuration

Set these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`

### LLM Prompt

The system uses a structured prompt to ask the LLM:
1. Analyze the course title, subject, level, and description
2. Identify prerequisite knowledge/skills
3. Return a JSON array of prerequisite course titles

## Current Course Catalog

### Khan Academy Courses
- Currently includes ~20 major courses
- Covers Math, Science, Computer Science, ELA, Social Studies
- **TODO**: Expand to full catalog (scraping or API integration)

### MIT OCW Courses
- Currently includes ~15 major courses
- Focuses on undergraduate-level courses
- **TODO**: Expand to full catalog (scraping or API integration)

## Next Steps

1. **Expand Course Catalogs**
   - Scrape or use APIs to discover all Khan Academy courses
   - Scrape or use APIs to discover all MIT OCW courses
   - Store in database for easier management

2. **Automated Microcredential Generation**
   - Create microcredentials automatically from missing courses
   - Use duration estimation system
   - Map to appropriate colleges and level bands

3. **Prerequisite Relation Import**
   - Import detected prerequisites as PREREQ relations
   - Validate prerequisite chains
   - Handle circular dependencies

4. **Continuous Sync**
   - Set up periodic sync jobs
   - Track changes in external course catalogs
   - Update microcredentials when courses change

## Example Output

```
=== External Course Sync Report ===

Catalog Summary:
  Khan Academy courses: 20
  MIT OCW courses: 15
  Total: 35

Matching Status:
  Khan Academy matched: 15/20
  MIT OCW matched: 12/15
  Total matched: 27/35

Missing Microcredentials:
  Khan Academy: 5
  MIT OCW: 3

Prerequisite Analysis:
  Courses with prerequisites: 25/35
```
