import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findRepoRoot} from '../ecosystem.mjs';
import {listMarkdownFiles, parseMarkdownFile, glossaryPageSlug} from './parse-markdown.mjs';
import {renderMarkdownToHtml} from './render-markdown.mjs';

export async function loadGlossaryPages(contentDir) {
  const dir = contentDir ?? path.join(findRepoRoot(path.dirname(fileURLToPath(import.meta.url))), 'content/glossary');
  const files = listMarkdownFiles(dir, {skip: new Set(['intro.md', '_category_.json', 'README.md'])});
  const pages = [];
  for (const fileName of files) {
    pages.push(await buildGlossaryPage(path.join(dir, fileName)));
  }
  const introPath = path.join(dir, 'intro.md');
  const intro = fs.existsSync(introPath) ? await buildGlossaryPage(introPath, {isIntro: true}) : null;
  const letters = [...pages].sort((a, b) => a.slug.localeCompare(b.slug, 'ru'));
  return {
    intro,
    letters,
    sidebar: buildSidebar(intro, letters),
  };
}

function buildSidebar(intro, letters) {
  const items = [];
  if (intro) {
    items.push({slug: 'intro', label: 'О разделе', href: '/glossary/intro'});
  }
  for (const page of letters) {
    items.push({slug: page.slug, label: page.label, href: page.href});
  }
  return items;
}

async function buildGlossaryPage(filePath, options = {}) {
  const parsed = parseMarkdownFile(filePath);
  const slug = options.isIntro ? 'intro' : glossaryPageSlug(parsed.fileName);
  const terms = [];
  for (const term of parsed.terms) {
    terms.push({...term, html: await renderMarkdownToHtml(term.markdown)});
  }
  return {
    slug,
    label: parsed.title,
    title: parsed.title,
    description: parsed.description,
    href: `/glossary/${slug}`,
    introHtml: await renderMarkdownToHtml(parsed.introMarkdown),
    terms,
  };
}
