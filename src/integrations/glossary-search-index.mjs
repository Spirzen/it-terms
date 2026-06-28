import {writeGlossarySearchIndex} from '../../scripts/build-search-index.mjs';

/** Генерирует public/glossary/search-index.json перед dev и build. */
export default function glossarySearchIndex() {
  return {
    name: 'glossary-search-index',
    hooks: {
      'astro:config:setup': async () => {
        await writeGlossarySearchIndex();
      },
    },
  };
}
