import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findRepoRoot} from '../ecosystem.mjs';
import {buildPortalCardListHtml, compareGlossaryLetters} from '../markdown/shared.mjs';
import {listMarkdownFiles, parseMarkdownFile, glossaryPageSlug} from './parse-markdown.mjs';
import {renderMarkdownToHtml} from './render-markdown.mjs';

export async function loadGlossaryPages(contentDir) {
  const dir = contentDir ?? path.join(findRepoRoot(path.dirname(fileURLToPath(import.meta.url))), 'content/glossary');
  const files = listMarkdownFiles(dir, {skip: new Set(['intro.md', '_category_.json', 'README.md'])});
  const pages = [];
  for (const fileName of files) {
    pages.push(await buildGlossaryPage(path.join(dir, fileName)));
  }
  const letters = [...pages].sort(compareGlossaryLetters);
  const introPath = path.join(dir, 'intro.md');
  const intro = fs.existsSync(introPath)
    ? await buildGlossaryPage(introPath, {isIntro: true, letters})
    : null;
  return {
    intro,
    letters,
    sidebar: buildSidebar(intro, letters),
    searchIndex: buildSearchIndex(letters),
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

function buildSearchIndex(letters) {
  const index = [];
  for (const page of letters) {
    for (const term of page.terms) {
      index.push({
        t: term.title,
        l: page.slug,
        a: term.anchor,
        s: plainSnippet(term.markdown),
      });
    }
  }
  return index;
}

function plainSnippet(markdown) {
  return markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

function buildIntroDocCards(letters) {
  const cards = letters.map((page) => ({
    title: page.slug,
    description: formatLetterCardDescription(page),
    href: page.href,
  }));
  return buildPortalCardListHtml(cards, 'Алфавитные разделы глоссария');
}

function formatLetterCardDescription(page) {
  const count = page.terms.length;
  if (count > 0) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    let word = 'терминов';
    if (mod10 === 1 && mod100 !== 11) {
      word = 'термин';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      word = 'термина';
    }
    return `${count} ${word}`;
  }
  if (page.description) {
    return page.description.replace(/\s+/g, ' ').trim().slice(0, 110);
  }
  return 'Раздел глоссария';
}

async function buildGlossaryPage(filePath, options = {}) {
  const parsed = parseMarkdownFile(filePath);
  const slug = options.isIntro ? 'intro' : glossaryPageSlug(parsed.fileName);
  const terms = [];
  for (const term of parsed.terms) {
    terms.push({...term, html: await renderMarkdownToHtml(term.markdown)});
  }

  let introMarkdown = parsed.introMarkdown;
  if (options.isIntro && introMarkdown.includes('<!-- DOC_CARD_LIST -->')) {
    const cardsHtml = buildIntroDocCards(options.letters ?? []);
    introMarkdown = introMarkdown.replace('<!-- DOC_CARD_LIST -->', cardsHtml);
  }

  return {
    slug,
    label: parsed.title,
    title: parsed.title,
    description: parsed.description,
    href: `/glossary/${slug}`,
    introHtml: await renderMarkdownToHtml(introMarkdown),
    terms,
    termCount: terms.length,
  };
}
