// lib/rag/sync.js
// Startup sync: walk .md/ and prompts/ directories and index any new or changed files.
// Content-hash based — unchanged files are skipped instantly.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestDocument } from './ingest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const KB_BASE = path.join(ROOT, '.md');
const PROMPTS_BASE = path.join(ROOT, 'prompts');

/**
 * Recursively list all non-empty .md files under a directory.
 * Returns array of { full: string, rel: string } objects.
 */
function listMdFiles(baseDir, subDir = '') {
  const dir = subDir ? path.join(baseDir, subDir) : baseDir;
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const rel = subDir ? `${subDir}/${entry}` : entry;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return listMdFiles(baseDir, rel);
    if (entry.endsWith('.md') && stat.size > 0) return [{ full, rel }];
    return [];
  });
}

/**
 * Infer industry key from a relative path under .md/
 * e.g. "industry/financial-services.md" → "financial-services"
 */
function inferIndustry(rel) {
  if (rel.startsWith('industry/')) {
    return rel.replace('industry/', '').replace('.md', '');
  }
  return null;
}

/**
 * Infer deck_type from a relative path under prompts/
 * e.g. "deck-types/executive-summary.md" → "executive-summary"
 */
function inferDeckType(rel) {
  if (rel.startsWith('deck-types/')) {
    return rel.replace('deck-types/', '').replace('.md', '');
  }
  return null;
}

/**
 * Sync all knowledge base and prompt template .md files into the vector store.
 * Safe to call on every server startup — skips unchanged files.
 * Runs in the background; does not block startup.
 *
 * @param {import('@google/genai/node').GoogleGenAI} ai
 */
export async function syncKnowledgeBase(ai) {
  if (!ai) {
    console.log('[rag/sync] No AI client — skipping knowledge base sync.');
    return;
  }

  console.log('[rag/sync] Starting knowledge base sync…');
  let indexed = 0, skipped = 0, failed = 0;

  // Sync .md/ — PS knowledge + industry files
  for (const { full, rel } of listMdFiles(KB_BASE)) {
    const text = fs.readFileSync(full, 'utf8').trim();
    if (!text) { skipped++; continue; }

    try {
      const result = await ingestDocument(ai, {
        text,
        filename: rel,
        source_type: 'knowledge_base',
        industry: inferIndustry(rel),
      });
      result.skipped ? skipped++ : indexed++;
    } catch (err) {
      console.error(`[rag/sync] Failed to index ${rel}: ${err.message}`);
      failed++;
    }
  }

  // Sync prompts/ — deck type and tone templates
  for (const { full, rel } of listMdFiles(PROMPTS_BASE)) {
    const text = fs.readFileSync(full, 'utf8').trim();
    if (!text) { skipped++; continue; }

    try {
      const result = await ingestDocument(ai, {
        text,
        filename: `prompts/${rel}`,
        source_type: 'prompt_template',
        deck_type: inferDeckType(rel),
      });
      result.skipped ? skipped++ : indexed++;
    } catch (err) {
      console.error(`[rag/sync] Failed to index prompts/${rel}: ${err.message}`);
      failed++;
    }
  }

  console.log(`[rag/sync] Complete — indexed: ${indexed}, unchanged: ${skipped}, failed: ${failed}`);
}

/**
 * Force full re-index: clears the store and re-indexes everything from disk.
 * @param {import('@google/genai/node').GoogleGenAI} ai
 */
export async function reindexKnowledgeBase(ai) {
  const { clearIndex } = await import('./store.js');
  clearIndex();
  console.log('[rag/sync] Index cleared — starting full re-index…');
  await syncKnowledgeBase(ai);
}
