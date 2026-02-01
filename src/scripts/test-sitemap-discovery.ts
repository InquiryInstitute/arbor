// Quick test of sitemap discovery
import { discoverMITOCWFromSitemap } from '../utils/mit-ocw-sitemap-discovery';

async function test() {
  console.log('Testing MIT OCW sitemap discovery...\n');
  
  // Test with first 10 courses only
  const courses = await discoverMITOCWFromSitemap();
  
  console.log(`\n✅ Test complete: Found ${courses.length} courses`);
  console.log('\nSample courses:');
  courses.slice(0, 5).forEach(c => {
    console.log(`  - ${c.title} (${c.subject}, ${c.level})`);
  });
}

test().catch(console.error);
