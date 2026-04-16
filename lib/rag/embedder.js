// lib/rag/embedder.js
// Wrapper around Gemini text-embedding-004 for generating 768-dim text embeddings.

const EMBED_MODEL = 'gemini-embedding-001';

// gemini-embedding-001 has a ~2048 token input limit (~8000 chars)
const MAX_INPUT_CHARS = 7500;

/**
 * Embed a single string. Returns a number[] of length 3072.
 * @param {import('@google/genai/node').GoogleGenAI} ai
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embed(ai, text) {
  const truncated = text.slice(0, MAX_INPUT_CHARS);
  const result = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: [truncated],
  });
  const values = result?.embeddings?.[0]?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('[rag/embedder] Empty embedding returned from Gemini');
  }
  return Array.from(values);
}
