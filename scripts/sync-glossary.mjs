#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {mirrorMarkdownDir, repoRoot, resolveKnowledgeBaseRoot} from './lib.mjs';

const dest = path.join(repoRoot, 'content/glossary');
const src = path.join(resolveKnowledgeBaseRoot(), 'docs/glossary');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, {recursive: true, force: true});
}
fs.mkdirSync(dest, {recursive: true});
const count = mirrorMarkdownDir(src, dest);
console.log(`sync-glossary: ${count} files → content/glossary`);
