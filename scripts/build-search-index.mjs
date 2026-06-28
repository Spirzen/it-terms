import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findRepoRoot} from '../src/lib/ecosystem.mjs';
import {loadGlossaryPages} from '../src/lib/glossary/load-glossary.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function writeGlossarySearchIndex() {
  const contentDir = path.join(findRepoRoot(repoRoot), 'content/glossary');
  const outDir = path.join(repoRoot, 'public/glossary');
  const outFile = path.join(outDir, 'search-index.json');

  const glossary = await loadGlossaryPages(contentDir);
  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(outFile, JSON.stringify(glossary.searchIndex));
  console.log(`glossary-search-index: ${glossary.searchIndex.length} terms → public/glossary/search-index.json`);
  return glossary.searchIndex.length;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  await writeGlossarySearchIndex();
}
