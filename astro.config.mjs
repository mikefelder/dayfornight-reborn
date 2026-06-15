import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://dayfornight.dev',
  base: '/',
  output: 'static',
  integrations: [react()],
  build: {
    assets: '_assets',
  },
});
