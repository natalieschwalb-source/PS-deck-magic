// lib/rag/store.js
// Flat-file vector store persisted to data/rag/index.json.
// Supports upsert, delete, and cosine-similarity search.
// No external dependencies — pure Node.js.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'rag');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');

// In-memory cache — loaded once, kept in sync with disk
let _index = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadIndex() {
  if (_index) return _index;
  ensureDir();
  if (fs.existsSync(INDEX_PATH)) {
    try {
      _index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
      // Migration: ensure expected shape
      if (!_index.chunks) _index.chunks = [];
      if (!_index.docs) _index.docs = {};
      return _index;
    } catch {
      console.warn('[rag/store] Corrupted index; starting fresh.');
    }
  }
  _index = { version: 1, chunks: [], docs: {} };
  return _index;
}

function saveIndex() {
  ensureDir();
  fs.writeFileSync(INDEX_PATH, JSON.stringify(_index), 'utf8');
}

export function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/**
 * Returns true if a document with this content hash is already indexed.
 */
export function isDocIndexed(docHash) {
  const idx = loadIndex();
  return Object.values(idx.docs).some((d) => d.content_hash === docHash);
}

/**
 * Upsert all chunks for a document. Replaces any existing chunks for the same doc_id.
 * @param {string} docId
 * @param {object} docMeta - { filename, source_type, industry, deck_type, session_id, content_hash }
 * @param {Array<{id: string, text: string, embedding: number[], metadata: object}>} chunks
 */
export function upsertDoc(docId, docMeta, chunks) {
  const idx = loadIndex();
  // Remove old chunks
  idx.chunks = idx.chunks.filter((c) => c.doc_id !== docId);
  // Append new chunks
  for (const chunk of chunks) {
    idx.chunks.push({ ...chunk, doc_id: docId });
  }
  idx.docs[docId] = {
    ...docMeta,
    chunk_count: chunks.length,
    indexed_at: new Date().toISOString(),
  };
  saveIndex();
}

/**
 * Delete a document and all its chunks.
 */
export function deleteDoc(docId) {
  const idx = loadIndex();
  idx.chunks = idx.chunks.filter((c) => c.doc_id !== docId);
  delete idx.docs[docId];
  saveIndex();
}

/**
 * Delete all chunks for a given session (user uploads).
 */
export function deleteSession(sessionId) {
  const idx = loadIndex();
  const toRemove = new Set(
    idx.chunks
      .filter((c) => c.metadata?.session_id === sessionId)
      .map((c) => c.doc_id)
  );
  if (toRemove.size === 0) return;
  idx.chunks = idx.chunks.filter((c) => !toRemove.has(c.doc_id));
  for (const docId of toRemove) delete idx.docs[docId];
  saveIndex();
}

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Return top-k chunks by cosine similarity to queryEmbedding.
 * @param {number[]} queryEmbedding
 * @param {object} opts
 * @param {number} [opts.k=10]
 * @param {object} [opts.filter] - { source_type?, industry?, deck_type?, session_id? }
 */
export function search(queryEmbedding, { k = 10, filter = {} } = {}) {
  const idx = loadIndex();
  const chunks = idx.chunks.filter((c) => {
    if (filter.source_type && c.metadata?.source_type !== filter.source_type) return false;
    if (filter.industry && c.metadata?.industry && c.metadata.industry !== filter.industry) return false;
    if (filter.deck_type && c.metadata?.deck_type && c.metadata.deck_type !== filter.deck_type) return false;
    if (filter.session_id && c.metadata?.session_id !== filter.session_id) return false;
    return true;
  });

  const scored = chunks.map((c) => ({
    ...c,
    score: cosineSim(queryEmbedding, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export function getStatus() {
  const idx = loadIndex();
  return {
    total_docs: Object.keys(idx.docs).length,
    total_chunks: idx.chunks.length,
    docs: idx.docs,
  };
}

/** Wipe the entire index (used by reindex). */
export function clearIndex() {
  _index = { version: 1, chunks: [], docs: {} };
  saveIndex();
}
