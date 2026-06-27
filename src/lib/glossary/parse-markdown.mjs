import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {createSlugger} from './slugger.mjs';

export {parseMarkdownFile, listMarkdownFiles, glossaryPageSlug};

function glossaryPageSlug(fileName) {
  const letter = fileName.replace(/\.mdx?$/i, '');
  return letter === 'intro' ? 'intro' : letter;
}

function listMarkdownFiles(dir, options = {}) {
  const skip = options.skip ?? new Set(['_category_.json']);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => /\.mdx?$/i.test(name) && !skip.has(name))
    .sort((a, b) => a.localeCompare(b, 'ru'));
}

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const {data, content} = matter(raw);
  const fileName = path.basename(filePath);
  const cleaned = stripDocusaurusArtifacts(content);

  return {
    fileName,
    title: data.title ?? data.sidebar_label ?? fileName.replace(/\.mdx?$/i, ''),
    description: data.description ?? '',
    introMarkdown: cleaned.introMarkdown,
    terms: extractHeadingTerms(cleaned.bodyForTerms),
  };
}

function stripDocusaurusArtifacts(content) {
  let body = content;
  body = body.replace(/import\s+[\s\S]*?from\s+['"]@theme\/[^'"]+['"];?\s*/g, '');
  body = body.replace(/import\s+[\s\S]*?from\s+['"]@site\/[^'"]+['"];?\s*/g, '');
  body = body.replace(/<DocCardList\s*\/>/g, '');
  body = body.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '');

  const lines = body.split(/\r?\n/);
  const kept = [];
  let inTags = false;
  for (const line of lines) {
    if (/^<div class="article-tags">/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags) {
      if (/<\/div>/.test(line)) {
        inTags = false;
      }
      continue;
    }
    kept.push(line);
  }
  body = kept.join('\n').trim();
  const sections = body.split(/\n(?=##\s+)/);
  const intro = sections.shift() ?? '';
  return {
    introMarkdown: intro.trim(),
    bodyForTerms: [intro, ...sections].join('\n').trim(),
  };
}

function extractHeadingTerms(content) {
  const slugger = createSlugger();
  const terms = [];
  for (const part of content.split(/\n(?=##\s+)/)) {
    const match = /^##\s+(.+?)\s*(?:\r?\n|$)/.exec(part);
    if (!match?.[1]?.trim()) {
      continue;
    }
    const title = match[1].trim();
    terms.push({
      title,
      anchor: slugger.slug(title),
      markdown: part.replace(/^##\s+.+?\s*(?:\r?\n|$)/, '').trim(),
    });
  }
  return terms;
}
