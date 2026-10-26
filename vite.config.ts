import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { site } from './src/config/site';
import { buildJsonLd } from './src/lib/seo';

// Injects title, description and LocalBusiness JSON-LD from the single site config.
function seoPlugin(): Plugin {
  return {
    name: 'site-seo',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
        .replaceAll('%SITE_TITLE%', site.seo.title)
        .replaceAll('%SITE_DESCRIPTION%', site.seo.description)
        .replaceAll('%SITE_URL%', site.url)
          .replace('%JSON_LD%', JSON.stringify(buildJsonLd())),
    },
  };
}

export default defineConfig({
  plugins: [react(), seoPlugin()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2021',
    chunkSizeWarningLimit: 1000, // the lazy Three.js chunk (club medallion) is the largest
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Keep Vite's preload helper out of the Three.js chunk, or the main bundle would import it eagerly.
          if (id.includes('preload-helper')) return 'preload';
        },
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
} as never);
