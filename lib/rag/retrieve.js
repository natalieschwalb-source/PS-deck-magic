// lib/rag/retrieve.js
// Retrieval pipeline: embed query → cosine search → MMR deduplication → token budget trim → context string.

import { embed } from './embedder.js';
import { search } from './store.js';

const CHARS_PER_TOKEN = 4; // rough approximation

/**
 * Maximal Marginal Relevance: greedily select k items that are relevant to the query
 * but dissimilar to each other. Balances relevance (lambda) vs. diversity (1-lambda).
 *
 * @param {number[]} queryEmbedding
 * @param {Array<{embedding: number[], score: number}>} candidates - pre-sorted by relevance
 * @param {number} k
 * @param {number} lambda - 0 = max diversity, 1 = max relevance (default 0.7)
 */
function applyMMR(queryEmbedding, candidates, k, lambda = 0.7) {
  if (candidates.length === 0) return [];

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

  const selected = [];
  const remaining = [...candidates];

  while (selected.length < k && remaining.length > 0) {
    let bestScore = -Infinity;
    let bestIdx = 0;

    for (let i = 0; i < remaining.length; i++) {
      const relevance = remaining[i].score;
      // Max similarity to any already-selected item
      let maxRedundancy = 0;
      for (const sel of selected) {
        const sim = cosineSim(remaining[i].embedding, sel.embedding);
        if (sim > maxRedundancy) maxRedundancy = sim;
      }
      const mmrScore = lambda * relevance - (1 - lambda) * maxRedundancy;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

/**
 * Retrieve relevant context for a generation request.
 *
 * Strategy:
 *  1. Search knowledge base with industry filter (most specific)
 *  2. Search all knowledge base (broader PS content)
 *  3. Search prompt templates
 *  4. Search user-uploaded docs for this session (if session_id provided)
 *  Merge + deduplicate → MMR → token budget trim → format.
 *
 * @param {import('@google/genai/node').GoogleGenAI} ai
 * @param {object} opts
 * @param {string}  opts.query          - Free-text query built from the brief
 * @param {string}  [opts.industry]     - Industry key for metadata boosting
 * @param {string}  [opts.session_id]   - Include user-uploaded docs for this session
 * @param {number}  [opts.candidates_k] - Candidates fetched per source before MMR (default 20)
 * @param {number}  [opts.top_k]        - Final chunks after MMR (default 8)
 * @param {number}  [opts.token_budget] - Max tokens for returned context (default 6000)
 * @returns {Promise<{context: string, chunks: Array, token_estimate: number}>}
 */
export async function retrieve(ai, {
  query,
  industry,
  session_id,
  candidates_k = 20,
  top_k = 8,
  token_budget = 6000,
} = {}) {
  if (!query) return { context: '', chunks: [], token_estimate: 0 };

  let queryEmbedding;
  try {
    queryEmbedding = await embed(ai, query);
  } catch (err) {
    console.error('[rag/retrieve] Failed to embed query:', err.message);
    return { context: '', chunks: [], token_estimate: 0 };
  }

  // Collect candidates from multiple sources, deduplicating by chunk id
  const seen = new Set();
  const candidates = [];

  const addResults = (results) => {
    for (const r of results) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        candidates.push(r);
      }
    }
  };

  // 1. Knowledge base — industry-specific (highest precision)
  if (industry) {
    addResults(search(queryEmbedding, {
      k: candidates_k,
      filter: { source_type: 'knowledge_base', industry },
    }));
  }

  // 2. Knowledge base — all PS content
  addResults(search(queryEmbedding, {
    k: candidates_k,
    filter: { source_type: 'knowledge_base' },
  }));

  // 3. Prompt templates (deck type / tone guidance)
  addResults(search(queryEmbedding, {
    k: Math.ceil(candidates_k / 2),
    filter: { source_type: 'prompt_template' },
  }));

  // 4. User-uploaded docs for this session
  if (session_id) {
    addResults(search(queryEmbedding, {
      k: candidates_k,
      filter: { session_id },
    }));
  }

  if (candidates.length === 0) {
    return { context: '', chunks: [], token_estimate: 0 };
  }

  // Sort by score before MMR (MMR needs relevance pre-sorted)
  candidates.sort((a, b) => b.score - a.score);

  // Apply MMR for diversity
  const selected = applyMMR(queryEmbedding, candidates, top_k);

  // Trim to token budget
  const budgetChars = token_budget * CHARS_PER_TOKEN;
  const trimmed = [];
  let usedChars = 0;
  for (const chunk of selected) {
    if (usedChars + chunk.text.length > budgetChars) break;
    trimmed.push(chunk);
    usedChars += chunk.text.length;
  }

  if (trimmed.length === 0) return { context: '', chunks: [], token_estimate: 0 };

  // Format for prompt injection
  const contextParts = trimmed.map((chunk, i) => {
    const src = chunk.metadata?.filename || chunk.metadata?.source_type || 'document';
    const scoreLabel = typeof chunk.score === 'number' ? ` [relevance: ${chunk.score.toFixed(2)}]` : '';
    return `### Context ${i + 1}: ${src}${scoreLabel}\n${chunk.text}`;
  });

  return {
    context: contextParts.join('\n\n---\n\n'),
    chunks: trimmed.map((c) => ({
      id: c.id,
      text: c.text,
      score: c.score,
      metadata: c.metadata,
    })),
    token_estimate: Math.ceil(usedChars / CHARS_PER_TOKEN),
  };
}

/**
 * Build a retrieval query string from a Phase 2 brief object.
 * Synthesises the brief fields that matter most for semantic search.
 *
 * @param {object} brief
 * @returns {string}
 */
export function buildQueryFromBrief(brief) {
  const parts = [];
  if (brief?.clientName)   parts.push(`Client: ${brief.clientName}`);
  if (brief?.objective)    parts.push(`Objective: ${brief.objective}`);
  if (brief?.industry)     parts.push(`Industry: ${brief.industry}`);
  if (brief?.audience)     parts.push(`Audience: ${brief.audience}`);
  if (brief?.deckType)     parts.push(`Deck type: ${brief.deckType}`);
  if (brief?.tone)         parts.push(`Tone: ${brief.tone}`);
  // Append any freeform context
  const extras = [brief?.context, brief?.challenge, brief?.summary]
    .filter(Boolean)
    .join(' ');
  if (extras) parts.push(extras);
  return parts.join('. ');
}
