# Scaling to Thousands of Courses

This document outlines the strategy for scaling the course sync system to handle thousands of Khan Academy and MIT OCW courses.

## Current Status

- **Current catalog**: ~35 courses (22 Khan Academy, 13 MIT OCW)
- **Target**: Thousands of courses
- **Challenge**: Manual cataloging doesn't scale

## Strategy

### 1. Automated Course Discovery

#### MIT OpenCourseWare
- **Approach**: Web scraping + HTML parsing
- **Source**: https://ocw.mit.edu/courses/
- **Method**:
  1. Fetch course listing pages
  2. Parse HTML for course links
  3. For each course, fetch course page and extract:
     - Title, description
     - Level (undergraduate/graduate)
     - Subject/department
     - Prerequisites (from course page)
     - Duration (typically 16 weeks for semester courses)
- **Estimated courses**: ~2,500+ courses

#### Khan Academy
- **Approach**: Browser automation or API discovery
- **Challenge**: Khan Academy uses React, so static HTML scraping is limited
- **Methods**:
  1. **Browser automation** (Puppeteer/Playwright):
     - Navigate to subject pages
     - Extract React-rendered course listings
     - Parse course metadata
  2. **API discovery**:
     - Find internal API endpoints
     - Use their GraphQL API if available
  3. **Sitemap parsing**:
     - Parse sitemap.xml for all course URLs
- **Estimated courses**: ~1,000+ courses/topics

### 2. Caching System

- **Cache directory**: `./data/course-cache/`
- **Files**:
  - `mit-ocw-courses.json` - Cached MIT OCW courses
  - `khan-academy-courses.json` - Cached Khan Academy courses
- **Benefits**:
  - Avoid re-scraping on every run
  - Faster development/testing
  - Can refresh with `--refresh` flag

### 3. Batch Processing

- **Rate limiting**: Delay between requests (100-500ms)
- **Error handling**: Continue on individual course failures
- **Progress tracking**: Log progress for long-running operations
- **Resume capability**: Can restart from last successful batch

### 4. Prerequisite Detection at Scale

- **LLM batching**: Process prerequisites in batches to manage API costs
- **Caching**: Cache LLM results to avoid re-analyzing same courses
- **Confidence thresholds**: Only create relations for high-confidence matches
- **Fallback**: Use pattern-based inference when LLM unavailable

### 5. Database Storage (Future)

For thousands of courses, consider moving from JSON files to database:

```sql
CREATE TABLE external_courses (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'khan_academy' | 'mit_ocw'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  level TEXT,
  subject TEXT,
  duration_weeks INTEGER,
  prerequisites JSONB,
  prerequisites_detected BOOLEAN,
  microcredential_id TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_external_courses_source ON external_courses(source);
CREATE INDEX idx_external_courses_subject ON external_courses(subject);
CREATE INDEX idx_external_courses_level ON external_courses(level);
```

## Implementation Steps

### Phase 1: MIT OCW Scraping (Easier)
1. ✅ Create scraping utilities (`course-scraper.ts`)
2. ✅ Implement HTML parsing for course listings
3. ⏳ Test with first 100 courses
4. ⏳ Scale to all courses
5. ⏳ Extract prerequisites from course pages

### Phase 2: Khan Academy Scraping (Harder)
1. ✅ Create scraping utilities
2. ⏳ Set up browser automation (Puppeteer)
3. ⏳ Extract course listings from React pages
4. ⏳ Parse course metadata
5. ⏳ Handle rate limiting and anti-bot measures

### Phase 3: Prerequisite Detection at Scale
1. ⏳ Implement LLM batching
2. ⏳ Add caching for LLM results
3. ⏳ Set up confidence thresholds
4. ⏳ Create background job for processing

### Phase 4: Database Migration
1. ⏳ Create Supabase schema for external_courses
2. ⏳ Migrate from JSON to database
3. ⏳ Set up periodic sync jobs
4. ⏳ Add change detection (new/updated courses)

## Usage

### Discover Courses
```bash
# Discover all courses (uses cache if available)
npm run discover-courses

# Refresh from source (ignore cache)
npm run discover-courses -- --refresh

# Limit output
npm run discover-courses -- --limit=20
```

### Sync with Microcredentials
```bash
# Generate sync report
npm run sync-courses

# With LLM prerequisite detection
npm run sync-courses -- --use-llm
```

## Next Steps

1. **Implement MIT OCW scraping** - Start with HTML parsing
2. **Set up browser automation** - For Khan Academy
3. **Add database storage** - For better scalability
4. **Create sync jobs** - Periodic updates of course catalog
5. **Build matching algorithms** - Better course-to-credential matching

## Resources

- MIT OCW: https://ocw.mit.edu/courses/
- Khan Academy: https://www.khanacademy.org/
- Puppeteer: https://pptr.dev/
- Playwright: https://playwright.dev/
