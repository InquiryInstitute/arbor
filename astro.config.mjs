import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://inquiryinstitute.github.io',
  base: '/arbor',
  output: 'static',
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        // Use bundled version to avoid web-worker issues
        'elkjs': 'elkjs/lib/elk.bundled.js',
      },
    },
  },
});
