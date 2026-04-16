// lib/rag/ingest.js
// Ingestion pipeline: text → paragraph-aware chunks → embeddings → vector store.

import { embed } from './embedder.js';
import { upsertDoc, contentHash, isDocIndexed } from './store.js';

// Target ~500 tokens per chunk (1 token ≈ 4 chars)
const CHUNK_SIZE_CHARS = 2000;
const CHUNK_OVERLAP_CHARS = 200;

/**
 * Split text into overlapping, paragraph-aware chunks.
 * @param {string} text
 * @returns {string[]}
 */
function chunkText(text) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    const wouldExceed = current.length + para.length + 2 > CHUNK_SIZE_CHARS;
    if (wouldExceed && current.length > 0) {
      chunks.push(current.trim());
      // Carry a short tail into the next chunk for context continuity
      const tail = current.slice(-CHUNK_OVERLAP_CHARS);
      current = tail + '\n\n' + para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Hard-split any chunks that are still oversized (e.g. large tables/code blocks)
  const result = [];
  for (const chunk of chunks) {
    if (chunk.length <= CHUNK_SIZE_CHARS * 1.5) {
      result.push(chunk);
    } else {
      for (let i = 0; i < chunk.length; i += CHUNK_SIZE_CHARS) {
        const slice = chunk.slice(i, i + CHUNK_SIZE_CHARS).trim();
        if (slice) result.push(slice);
      }
    }
  }
  return result;
}

/**
 * Ingest a document into the vector store.
 *
 * @param {import('@google/genai/node').GoogleGenAI} ai
 * @param {object} opts
 * @param {string}  opts.text         - Extracted text content
 * @param {string}  opts.filename     - Original filename (used in metadata + logs)
 * @param {'knowledge_base'|'user_upload'|'prompt_template'} opts.source_type
 * @param {string}  [opts.industry]   - Industry key (e.g. 'financial-services')
 * @param {string}  [opts.deck_type]  - Deck type id (e.g. 'executive-summary')
 * @param {string}  [opts.session_id] - Session ID for user-uploaded docs
 * @param {boolean} [opts.force]      - Re-index even if content hash unchanged
 * @returns {Promise<{doc_id: string|null, chunk_count: number, skipped: boolean}>}
 */
export async function ingestDocument(ai, { text, filename, source_type, industry, deck_type, session_id, force = false }) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { doc_id: null, chunk_count: 0, skipped: true };

  const hash = contentHash(trimmed);

  if (!force && isDocIndexed(hash)) {
    console.log(`[rag/ingest] Unchanged — skip: ${filename}`);
    return { doc_id: hash, chunk_count: 0, skipped: true };
  }

  const docId = hash; // content hash is the stable doc identifier
  const rawChunks = chunkText(trimmed);
  console.log(`[rag/ingest] Indexing ${filename} → ${rawChunks.length} chunks…`);

  const embeddedChunks = [];
  for (let i = 0; i < rawChunks.length; i++) {
    try {
      const embedding = await embed(ai, rawChunks[i]);
      embeddedChunks.push({
        id: `${docId}_${i}`,
        text: rawChunks[i],
        embedding,
        metadata: {
          source_type,
          filename,
          industry: industry || null,
          deck_type: deck_type || null,
          session_id: session_id || null,
          chunk_index: i,
          content_hash: hash,
        },
      });
    } catch (err) {
      console.error(`[rag/ingest] Embed failed for chunk ${i} of ${filename}: ${err.message}`);
    }
  }

  if (embeddedChunks.length === 0) {
    console.warn(`[rag/ingest] No chunks could be embedded for ${filename}`);
    return { doc_id: docId, chunk_count: 0, skipped: false };
  }

  upsertDoc(docId, {
    filename,
    source_type,
    industry: industry || null,
    deck_type: deck_type || null,
    session_id: session_id || null,
    content_hash: hash,
  }, embeddedChunks);

  console.log(`[rag/ingest] Done: ${filename} — ${embeddedChunks.length} chunks stored`);
  return { doc_id: docId, chunk_count: embeddedChunks.length, skipped: false };
}
