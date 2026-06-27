import {defineConfig} from 'astro/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import patchAstroRedirects from './src/integrations/patch-astro-redirects.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Прод: IT_TERMS_SITE=https://terms.spirzen.ru, IT_TERMS_BASE=/ */
const site = process.env.IT_TERMS_SITE ?? 'http://localhost:4330';
const base = process.env.IT_TERMS_BASE ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'never',
  integrations: [patchAstroRedirects()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
});
