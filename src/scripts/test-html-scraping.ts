// Quick test of HTML scraping for MIT OCW courses
import { discoverMITOCWFromSitemap } from '../utils/mit-ocw-sitemap-discovery';

async function test() {
  console.log('Testing MIT OCW HTML scraping (first 10 courses)...\n');
  
  // Test with limit of 10 courses
  const courses = await discoverMITOCWFromSitemap(10);
  
  console.log(`\n✅ Test complete: Found ${courses.length} courses`);
  if (courses.length > 0) {
    console.log('\nSample courses:');
    courses.slice(0, 5).forEach(c => {
      console.log(`  - ${c.title} (${c.subject}, ${c.level})`);
    });
  } else {
    console.log('\n⚠️  No courses found - HTML scraping may need adjustment');
  }
}

test().catch(console.error);
