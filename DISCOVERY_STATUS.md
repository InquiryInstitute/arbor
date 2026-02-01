# Course Discovery Status

## MIT OpenCourseWare

### Current Status
- **Sitemap Discovery**: ✅ Working
- **Total Courses Available**: 2,576 courses
- **Currently Discovered**: 59 courses (from ocw-to-go)
- **Full Discovery**: Ready (takes ~4-5 minutes)

### Discovery Methods

1. **Fast Method (Default)**
   - Uses ocw-to-go repository (59 curated courses)
   - Takes ~10 seconds
   - Command: `npm run discover-courses`

2. **Full Discovery**
   - Parses MIT OCW sitemap (2,576 courses)
   - Fetches individual course JSON endpoints
   - Takes ~4-5 minutes (with rate limiting)
   - Command: `npm run discover-courses -- --full`

### Sitemap Structure
MIT OCW sitemap: `https://ocw.mit.edu/sitemap.xml`
- Lists all course sitemaps
- Format: `https://ocw.mit.edu/courses/{course-id}/sitemap.xml`
- Each course has JSON endpoint: `https://ocw.mit.edu/courses/{course-id}/index.json`

## Khan Academy

### Current Status
- **Discovery**: ⚠️ Not yet implemented
- **Estimated Courses**: 1,000+ courses/topics
- **Method Needed**: Browser automation or API discovery

### Next Steps
1. Set up Puppeteer/Playwright for browser automation
2. Navigate to subject pages
3. Extract React-rendered course listings
4. Parse course metadata

## Summary

- **MIT OCW**: ✅ Ready for full discovery (2,576 courses)
- **Khan Academy**: ⏳ Needs browser automation setup
- **Total Potential**: 3,500+ courses

## Usage Examples

```bash
# Fast discovery (59 courses)
npm run discover-courses

# Full MIT OCW discovery (2,576 courses, ~5 min)
npm run discover-courses -- --full

# Generate microcredential suggestions
npm run generate-credentials

# Sync and analyze prerequisites
npm run sync-courses -- --use-llm
```
