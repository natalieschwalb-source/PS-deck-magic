import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai/node';
import { jsonrepair } from 'jsonrepair';
import { ingestDocument } from './lib/rag/ingest.js';
import { retrieve, buildQueryFromBrief } from './lib/rag/retrieve.js';
import { getStatus, deleteDoc } from './lib/rag/store.js';
import { syncKnowledgeBase, reindexKnowledgeBase } from './lib/rag/sync.js';

const app = express();
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '32mb' }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 5184; // V5 — V4 stays on 5183
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_TEXT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
// gemini-2.0-flash is deprecated for new API users; use 2.5+ (see https://ai.google.dev/gemini-api/docs/models)
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
/** Nano Banana 2 (native Gemini image). Override or set GEMINI_IMAGE_BACKEND=imagen for Imagen. */
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview';
const GEMINI_IMAGEN_MODEL = process.env.GEMINI_IMAGEN_MODEL || 'imagen-4.0-fast-generate-001';
const GEMINI_VIDEO_MODEL = process.env.GEMINI_VIDEO_MODEL || 'veo-3.1-generate-preview';
const GEMINI_ENABLE_VEO = process.env.GEMINI_ENABLE_VEO === '1' || process.env.GEMINI_ENABLE_VEO === 'true';
const GEMINI_TEXT_FALLBACK_MODELS = String(process.env.GEMINI_MODEL_FALLBACKS || 'gemini-2.5-flash-lite')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function resolveProvider() {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === 'openai') return 'openai';
  if (explicit === 'gemini') return 'gemini';
  if (GEMINI_API_KEY) return 'gemini';
  if (OPENAI_API_KEY) return 'openai';
  return 'none';
}

const PROVIDER = resolveProvider();

if (PROVIDER === 'gemini' && !GEMINI_API_KEY) {
  console.warn('[ps-deck-magic] AI_PROVIDER is gemini but GEMINI_API_KEY is missing.');
}
if (PROVIDER === 'openai' && !OPENAI_API_KEY) {
  console.warn('[ps-deck-magic] AI_PROVIDER is openai but OPENAI_API_KEY is missing.');
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

let geminiAi = null;
function getGeminiAi() {
  if (!GEMINI_API_KEY) return null;
  if (!geminiAi) geminiAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return geminiAi;
}

app.use(express.static('public'));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    provider: PROVIDER,
    hasOpenaiKey: Boolean(OPENAI_API_KEY),
    hasGeminiKey: Boolean(GEMINI_API_KEY),
    hasKey: PROVIDER === 'gemini' ? Boolean(GEMINI_API_KEY) : PROVIDER === 'openai' ? Boolean(OPENAI_API_KEY) : false,
    models: {
      text: PROVIDER === 'gemini' ? GEMINI_TEXT_MODEL : OPENAI_TEXT_MODEL,
      image:
        PROVIDER === 'gemini'
          ? (process.env.GEMINI_IMAGE_BACKEND || 'nano') === 'imagen'
            ? GEMINI_IMAGEN_MODEL
            : GEMINI_IMAGE_MODEL
          : OPENAI_IMAGE_MODEL,
      video: GEMINI_VIDEO_MODEL
    },
    imageBackend: PROVIDER === 'gemini' ? (process.env.GEMINI_IMAGE_BACKEND || 'nano').toLowerCase() : null,
    veoEnabled: PROVIDER === 'gemini' && GEMINI_ENABLE_VEO && Boolean(GEMINI_API_KEY)
  });
});

function parseNestedJsonMessage(msg) {
  if (typeof msg !== 'string') return null;
  const t = msg.trim();
  if (!t.startsWith('{')) return null;
  try {
    const j = JSON.parse(t);
    return j?.error?.message || j?.message || null;
  } catch {
    return null;
  }
}

function apiErrorMessage(err) {
  let raw =
    err?.error?.message ||
    err?.response?.data?.error?.message ||
    err?.message ||
    'Unknown error';
  if (typeof raw === 'object' && raw != null && 'message' in raw) raw = raw.message;
  raw = String(raw);
  const inner = parseNestedJsonMessage(raw);
  if (inner) raw = inner;
  const st = err?.status ?? err?.statusCode;
  if (st === 503 && !/try again|later|wait/i.test(raw)) {
    raw += ' If this keeps happening, wait 1–2 minutes and retry.';
  }
  return raw;
}

function apiErrorStatus(err) {
  if (err?.status != null) return err.status;
  if (err?.statusCode != null) return err.statusCode;
  try {
    const j = JSON.parse(String(err?.message || '').trim());
    const c = j?.error?.code;
    if (typeof c === 'number' && c >= 400 && c < 600) return c;
  } catch {
    /* ignore */
  }
  return typeof err?.code === 'number' && err.code >= 400 ? err.code : 500;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Strip trailing commas before } or ] (common LLM mistake). */
function stripTrailingCommasJson(str) {
  return String(str).replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Extract first balanced {...} or [...] from text, respecting JSON string escapes.
 */
function extractBalancedJson(text) {
  const s = String(text).trim();
  const i = s.search(/[\[{]/);
  if (i < 0) return null;
  const open = s[i];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let p = i; p < s.length; p++) {
    const c = s[p];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return s.slice(i, p + 1);
    }
  }
  return null;
}

/**
 * Parse JSON from model output: tolerate markdown fences, trailing commas, extra prose,
 * and minor syntax errors (via jsonrepair).
 */
function parseJsonFromLlmText(raw) {
  let txt = String(raw)
    .replace(/```json|```/gi, '')
    .trim();
  const attempts = [
    () => JSON.parse(txt),
    () => JSON.parse(stripTrailingCommasJson(txt)),
    () => {
      const ex = extractBalancedJson(txt);
      if (!ex) throw new Error('No JSON object or array found');
      return JSON.parse(stripTrailingCommasJson(ex));
    },
    () => JSON.parse(jsonrepair(txt)),
    () => {
      const ex = extractBalancedJson(txt);
      return JSON.parse(jsonrepair(ex || txt));
    },
  ];
  let lastErr;
  for (const fn of attempts) {
    try {
      return fn();
    } catch (e) {
      lastErr = e;
    }
  }
  const hint = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`Invalid JSON from model: ${hint}`);
}


function isRetryableGeminiError(err) {
  const st = err?.status ?? err?.statusCode;
  if (st === 429 || st === 503) return true;
  const msg = String(err?.message || '').toLowerCase();
  if (
    msg.includes('resource_exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout')
  ) {
    return true;
  }
  try {
    const j = JSON.parse(String(err?.message || '').trim());
    const code = j?.error?.code;
    const status = j?.error?.status;
    if (code === 429 || code === 503) return true;
    if (status === 'UNAVAILABLE' || status === 'RESOURCE_EXHAUSTED') return true;
  } catch {
    /* ignore */
  }
  return false;
}

async function withGeminiRetry(operation, label = 'gemini') {
  const max = Math.min(6, Math.max(1, Number(process.env.GEMINI_RETRY_MAX) || 4));
  const base = Math.max(500, Number(process.env.GEMINI_RETRY_BASE_MS) || 1500);
  let last;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      return await operation();
    } catch (err) {
      last = err;
      if (!isRetryableGeminiError(err) || attempt === max - 1) throw err;
      const delay = base * 2 ** attempt + Math.random() * 500;
      console.warn(
        `[ps-deck-magic] ${label}: attempt ${attempt + 1}/${max} failed, retry in ${Math.round(delay)}ms`,
        err?.status ?? err?.statusCode ?? ''
      );
      await sleep(delay);
    }
  }
  throw last;
}

// ─── OpenAI (legacy / optional) ───────────────────────────────────────
async function openaiJsonCompletion({ system, user, model }) {
  if (!openai) {
    const e = new Error('Server missing OPENAI_API_KEY.');
    e.statusCode = 500;
    throw e;
  }
  const resp = await openai.responses.create({
    model: model || OPENAI_TEXT_MODEL,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: system }] },
      { role: 'user', content: [{ type: 'input_text', text: user }] }
    ],
    text: { format: { type: 'json_object' } }
  });
  const txt = resp.output_text;
  if (!txt) throw new Error('Empty response from OpenAI.');
  return parseJsonFromLlmText(txt);
}

async function openaiGenerateImageB64({ prompt, size }) {
  if (!openai) {
    const e = new Error('Server missing OPENAI_API_KEY.');
    e.statusCode = 500;
    throw e;
  }
  const resp = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: size || '1024x1024'
  });
  const b64 = resp?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image generation returned no data.');
  return b64;
}

// ─── Gemini text (JSON) ───────────────────────────────────────────────
async function geminiJsonCompletion({ system, user, model }) {
  const ai = getGeminiAi();
  if (!ai) {
    const e = new Error('Server missing GEMINI_API_KEY.');
    e.statusCode = 500;
    throw e;
  }
  const combined = `${system}\n\n---\n\n${user}`;
  const primary = model || GEMINI_TEXT_MODEL;
  const chain = [primary, ...GEMINI_TEXT_FALLBACK_MODELS.filter((m) => m !== primary)];
  let lastErr;
  for (let i = 0; i < chain.length; i++) {
    const m = chain[i];
    try {
      return await withGeminiRetry(async () => {
        const response = await ai.models.generateContent({
          model: m,
          contents: combined,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 16384
          }
        });
        let txt = response.text;
        if (!txt) {
          const parts = response.candidates?.[0]?.content?.parts;
          const t = parts?.find((p) => p.text);
          txt = t?.text;
        }
        if (!txt) throw new Error('Empty response from Gemini.');
        return parseJsonFromLlmText(txt);
      }, `generateContent(${m})`);
    } catch (err) {
      lastErr = err;
      const retryable = isRetryableGeminiError(err);
      const hasNextModel = i < chain.length - 1;
      if (!retryable || !hasNextModel) throw err;
      console.warn(`[ps-deck-magic] Switching Gemini text model from ${m} to ${chain[i + 1]} after retryable error.`);
    }
  }
  throw lastErr;
}

// ─── Gemini images: Nano Banana (native) or Imagen ───────────────────
async function geminiGenerateImageB64({ prompt }) {
  const ai = getGeminiAi();
  if (!ai) {
    const e = new Error('Server missing GEMINI_API_KEY.');
    e.statusCode = 500;
    throw e;
  }
  const backend = (process.env.GEMINI_IMAGE_BACKEND || 'nano').toLowerCase();

  if (backend === 'imagen') {
    return withGeminiRetry(async () => {
      const response = await ai.models.generateImages({
        model: GEMINI_IMAGEN_MODEL,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9'
        }
      });
      const bytes = response?.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) throw new Error('Imagen returned no image.');
      return typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('base64');
    }, `generateImages(${GEMINI_IMAGEN_MODEL})`);
  }

  const imagePrompt = `16:9 widescreen, cinematic, high contrast, suitable as a presentation slide visual. No text, no logos, no watermarks. ${prompt}`;
  return withGeminiRetry(async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT']
      }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    throw new Error('Gemini image model returned no image (try GEMINI_IMAGE_BACKEND=imagen or another GEMINI_IMAGE_MODEL).');
  }, `generateContent-image(${GEMINI_IMAGE_MODEL})`);
}

// ─── Gemini video (Veo) — slow, optional ─────────────────────────────
async function geminiGenerateVideoPublicPath(ai, prompt) {
  const clipsDir = path.join(process.cwd(), 'public', 'clips');
  if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
  const id = randomBytes(10).toString('hex');
  const outPath = path.join(clipsDir, `${id}.mp4`);

  let operation = await ai.models.generateVideos({
    model: GEMINI_VIDEO_MODEL,
    source: { prompt },
    config: { numberOfVideos: 1 }
  });
  const started = Date.now();
  const maxMs = Number(process.env.GEMINI_VIDEO_TIMEOUT_MS) || 480000;
  while (!operation.done) {
    if (Date.now() - started > maxMs) throw new Error('Video generation timed out.');
    await new Promise((r) => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error('Veo returned no video.');
  await ai.files.download({ file: video, downloadPath: outPath });
  return `/clips/${id}.mp4`;
}

async function jsonOnlyCompletion({ system, user, model }) {
  if (PROVIDER === 'gemini') return geminiJsonCompletion({ system, user, model });
  if (PROVIDER === 'openai') return openaiJsonCompletion({ system, user, model });
  const e = new Error('Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY in .env.');
  e.statusCode = 500;
  throw e;
}

async function generateImageB64({ prompt, size }) {
  if (PROVIDER === 'gemini') return geminiGenerateImageB64({ prompt });
  if (PROVIDER === 'openai') return openaiGenerateImageB64({ prompt, size });
  const e = new Error('Set GEMINI_API_KEY or OPENAI_API_KEY in .env.');
  e.statusCode = 500;
  throw e;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string).' });
    }
    const data = await jsonOnlyCompletion({
      model,
      system:
        'You are an expert agency presentation strategist and visual storyteller. Always respond with valid JSON only (no markdown, no code fences, no explanations). Every image_prompt and video_prompt must directly illustrate that slide’s specific title, headline, stats, bullets, and CTA—not generic stock scenes. Media should advance the same narrative as the words on the slide.',
      user: prompt
    });
    res.json(data);
  } catch (e) {
    const status = e?.status ?? e?.statusCode ?? apiErrorStatus(e);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: apiErrorMessage(e) });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, model } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string).' });
    }
    const data = await jsonOnlyCompletion({
      model,
      system:
        'You are an expert presentation designer and visual storyteller. Always respond with valid JSON only (no markdown, no code fences, no explanations). Whenever slide copy changes, rewrite image_prompt and video_prompt so they stay tightly aligned with that slide’s message (title, headline, body, stats, CTA). Never leave generic or mismatched media prompts.',
      user: prompt
    });
    res.json(data);
  } catch (e) {
    const status = e?.status ?? e?.statusCode ?? apiErrorStatus(e);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: apiErrorMessage(e) });
  }
});

app.post('/api/image', async (req, res) => {
  try {
    const { prompt, size } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string).' });
    }
    const b64 = await generateImageB64({ prompt, size });
    res.json({ b64, mime: 'image/png' });
  } catch (e) {
    const status = e?.status ?? e?.statusCode ?? apiErrorStatus(e);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: apiErrorMessage(e) });
  }
});

app.post('/api/video', async (req, res) => {
  if (!GEMINI_ENABLE_VEO) {
    return res.status(400).json({
      error: 'Veo is disabled. Set GEMINI_ENABLE_VEO=1 in .env and restart (paid / slow).'
    });
  }
  if (PROVIDER !== 'gemini') {
    return res.status(400).json({ error: 'Veo requires AI_PROVIDER=gemini (default when GEMINI_API_KEY is set).' });
  }
  const ai = getGeminiAi();
  if (!ai) {
    return res.status(500).json({ error: 'Server missing GEMINI_API_KEY.' });
  }
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt (string).' });
    }
    const urlPath = await geminiGenerateVideoPublicPath(ai, prompt);
    const origin = req.get('host') ? `${req.protocol}://${req.get('host')}` : '';
    res.json({ path: urlPath, url: origin ? `${origin}${urlPath}` : urlPath });
  } catch (e) {
    const status = e?.status ?? e?.statusCode ?? apiErrorStatus(e);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: apiErrorMessage(e) });
  }
});

// ── Document extraction helpers ───────────────────────────────────────────────

const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function extractStatusFromError(err) {
  if (err.status && typeof err.status === 'number') return err.status;
  if (err.statusCode && typeof err.statusCode === 'number') return err.statusCode;
  const msg = String(err.message || '');
  const m = msg.match(/\b([45]\d{2})\b/);
  if (m) return parseInt(m[1], 10);
  if (/unavailable|overload|capacity|quota/i.test(msg)) return 503;
  if (/rate.?limit|too many/i.test(msg)) return 429;
  return null;
}

async function geminiExtractWithRetry(ai, model, mimeType, base64, filename) {
  const MAX_RETRIES = 3;
  const BACKOFF_MS  = [1000, 2000, 4000];
  let lastErr = null;
  let lastStatus = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: 'Extract all text content from this document. Return the full text verbatim, preserving paragraph and section structure. Do not summarize, interpret, or add commentary — output the extracted text only.' }
          ]
        }]
      });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, text };
    } catch (e) {
      lastErr   = e;
      lastStatus = extractStatusFromError(e);
      const isTransient = lastStatus === null || TRANSIENT_STATUS_CODES.has(lastStatus);
      console.error(
        `[extract-doc] attempt ${attempt + 1}/${MAX_RETRIES} failed` +
        ` | file: ${filename} | mime: ${mimeType}` +
        ` | status: ${lastStatus ?? 'unknown'}` +
        ` | reason: ${e.message}`
      );
      if (!isTransient) break; // bad-request style — do not retry
      if (attempt < MAX_RETRIES - 1) await new Promise(r => setTimeout(r, BACKOFF_MS[attempt]));
    }
  }

  const isTransient = lastStatus === null || TRANSIENT_STATUS_CODES.has(lastStatus);
  console.error(
    `[extract-doc] all retries exhausted` +
    ` | file: ${filename} | final status: ${lastStatus ?? 'unknown'}` +
    ` | final reason: ${lastErr?.message}`
  );
  return {
    success: false,
    transient: isTransient,
    reason: isTransient
      ? 'Gemini temporarily unavailable — please retry'
      : 'Document extraction failed: ' + (lastErr?.message || 'unknown error'),
    providerStatus: lastStatus,
  };
}

function tryLocalPdfExtract(buffer) {
  try {
    const tmpPath = path.join(process.cwd(), 'public', 'clips',
      'tmp_' + randomBytes(8).toString('hex') + '.pdf');
    fs.writeFileSync(tmpPath, buffer);
    try {
      const out = execSync(`pdftotext -layout "${tmpPath}" -`,
        { maxBuffer: 10 * 1024 * 1024, timeout: 15000 });
      return out.toString('utf8').trim() || null;
    } finally {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  } catch {
    return null;
  }
}

// ── Extract document text ─────────────────────────────────────────────────────

app.post('/api/extract-doc', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const filename = req.headers['x-filename'] || 'upload.pdf';
    const ext = path.extname(filename).toLowerCase();

    let text = '';
    let extractError  = null;
    let transient     = false;
    let providerStatus = null;

    if (['.txt', '.md', '.csv'].includes(ext)) {
      text = req.body.toString('utf8');
    } else if (['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'].includes(ext)) {
      const MIME_TYPES = {
        '.pdf':  'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc':  'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls':  'application/vnd.ms-excel',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt':  'application/vnd.ms-powerpoint',
      };
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const base64   = req.body.toString('base64');
      const ai       = getGeminiAi();

      if (!ai) {
        extractError = 'No Gemini API key configured — cannot extract document text.';
      } else {
        const extraction = await geminiExtractWithRetry(ai, GEMINI_TEXT_MODEL, mimeType, base64, filename);
        if (extraction.success) {
          text = extraction.text;
          if (!text) extractError = 'AI returned no text from the document.';
        } else {
          // PDF-only local fallback (if pdftotext happens to be installed)
          if (ext === '.pdf' && extraction.transient) {
            const localText = tryLocalPdfExtract(req.body);
            if (localText && localText.length > 100) {
              text = localText;
              console.log(`[extract-doc] local fallback used for ${filename} — ${localText.length} chars`);
            }
          }
          if (!text) {
            transient      = extraction.transient;
            providerStatus = extraction.providerStatus;
            extractError   = extraction.reason;
          }
        }
      }
    }
    // Images and other file types: no text extraction attempted

    if (text.length > 150000) {
      text = text.slice(0, 150000) + '\n\n[Document truncated — ' + Math.round(text.length / 1000) + 'K chars total]';
    }

    const trimmedText = text.trim();

    // Fire-and-forget: ingest extracted text into the RAG index for this session
    if (trimmedText && !extractError) {
      const ragAi = getGeminiAi();
      const sessionId = req.headers['x-session-id'] || null;
      if (ragAi) {
        ingestDocument(ragAi, {
          text: trimmedText,
          filename,
          source_type: 'user_upload',
          session_id: sessionId,
        }).catch((e) => console.error('[rag/ingest doc]', e.message));
      }
    }

    res.json({
      text:           trimmedText,
      chars:          trimmedText.length,
      filename,
      error:          extractError  || null,
      transient,
      retryable:      transient,        // explicit alias for frontend
      providerStatus: providerStatus || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Deck type prompt loader ───────────────────────────────────────────────────
// ── Knowledge system: load PS + optional industry markdown files ──────────────
app.get('/api/knowledge', (req, res) => {
  const industryKey = (req.query.industry || '').trim();
  const base = path.join(process.cwd(), '.md');

  const readMd = (rel) => {
    try { return fs.readFileSync(path.join(base, rel), 'utf8').trim(); }
    catch { return ''; }
  };

  const psCore       = readMd('ps/ps_core.md');
  const psAi         = readMd('ps/ps_ai.md');
  const psPowerOfOne = readMd('ps/ps_power_of_one.md');

  let industry = '';
  if (industryKey && /^[a-z0-9-]+$/.test(industryKey)) {
    industry = readMd(`industry/${industryKey}.md`);
  }

  res.json({ psCore, psAi, psPowerOfOne, industry, industryKey: industryKey || null });
});

// ── Design system prompt loader ───────────────────────────────────────────────
// Only 'ps' is supported now. 'custom' will be wired up separately later.
const PS_DESIGN_SYSTEM_FALLBACK =
  `Publicis Sapient brand: white background, Radiant Red #E90130 accents, Lexend Deca headlines, Roboto body.\n` +
  `Assign layoutType per slide from: title-hero, agenda-list, section-divider, one-column-narrative,\n` +
  `two-column-content, solution-hero, pillar-detail, architecture-diagram, stat-impact, case-study-psi,\n` +
  `table-structured, chart-insight, image-headline, headline-only, closing-commitment.\n` +
  `Sparse layouts (title-hero, section-divider, headline-only): minimal copy, no bullets.\n` +
  `Dense layouts (architecture-diagram, case-study-psi, table-structured): concise text, diagram/table dominates.\n` +
  `Stat slides: 1–2 large numbers maximum, lots of whitespace.\n` +
  `Section dividers: feel like a reset — section name only, no body copy.\n` +
  `Closing slide: restate argument, state the ask, 2–3 next steps.`;

app.get('/api/design-system-prompt/:id', (req, res) => {
  const { id } = req.params;
  if (!/^[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'Invalid design system id.' });

  // Only 'ps' is supported now
  if (id !== 'ps') {
    return res.json({ id, content: '', found: false });
  }

  const filePath = path.join(process.cwd(), 'prompts', 'design-systems', `${id}.md`);
  try {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (content) return res.json({ id, content, found: true });
  } catch { /* fall through to fallback */ }

  // Fallback: inline summary — never crash
  res.json({ id, content: PS_DESIGN_SYSTEM_FALLBACK, found: false });
});

app.get('/api/deck-type-prompt/:id', (req, res) => {
  const { id } = req.params;
  if (!/^[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'Invalid deck type id.' });
  const filePath = path.join(process.cwd(), 'prompts', 'deck-types', `${id}.md`);
  try {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    res.json({ id, content, found: !!content });
  } catch {
    res.json({ id, content: '', found: false });
  }
});

app.get('/api/tone-prompt/:id', (req, res) => {
  const { id } = req.params;
  if (!/^[a-z0-9_]+$/.test(id)) return res.status(400).json({ error: 'Invalid tone id.' });
  const EXECUTIVE_FALLBACK = 'Write for someone who reads 200 emails a day. One idea per sentence. No preamble. No hedging. Lead with the conclusion. Every slide must earn its place.';
  const filePath = path.join(process.cwd(), 'prompts', 'tones', `${id}.md`);
  try {
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (content) return res.json({ id, content, found: true });
  } catch { /* fall through to fallback */ }
  // Fallback: try executive.md
  try {
    const execPath = path.join(process.cwd(), 'prompts', 'tones', 'executive.md');
    const content = fs.readFileSync(execPath, 'utf8').trim();
    if (content) return res.json({ id, content, found: false });
  } catch { /* fall through to inline fallback */ }
  // Final fallback: inline string — never crash
  res.json({ id, content: EXECUTIVE_FALLBACK, found: false });
});

// ── Brand website preview (fetch HTML, extract signals, suggest template) ─────
const BRAND_SITE_ALLOWED_PRESETS = [
  'cinematic-dark',
  'clean-executive',
  'bold-editorial',
  'warm-human',
  'data-forward',
  'agency-bold'
];

const GOOGLE_FONTS_JSON_PATH = path.join(process.cwd(), 'public', 'google-fonts.json');
/** Allowlist for brand-site matching & Gemini: synced with public/google-fonts.json */
let BRAND_GOOGLE_FONTS = [
  'DM Sans',
  'Roboto',
  'Lexend Deca',
  'Inter',
  'Poppins',
  'Montserrat',
  'Lato',
  'Open Sans',
  'Source Sans 3',
  'Nunito Sans',
  'Merriweather'
];
try {
  const raw = fs.readFileSync(GOOGLE_FONTS_JSON_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed) && parsed.length) {
    BRAND_GOOGLE_FONTS = parsed.filter((x) => typeof x === 'string' && x.trim());
  }
} catch (e) {
  console.warn(
    '[ps-deck-magic] Could not load public/google-fonts.json; using built-in font list.',
    e && e.message
  );
}

function assertPublicHttpUrl(urlStr) {
  let u;
  try {
    u = new URL(String(urlStr).trim());
  } catch {
    throw new Error('Invalid URL.');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed.');
  }
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new Error('That host is not allowed.');
  }
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new Error('That host is not allowed.');
  }
  const port = u.port || (u.protocol === 'https:' ? '443' : '80');
  if (port !== '80' && port !== '443') {
    throw new Error('Only standard ports 80/443 are allowed.');
  }
  return u.href;
}

function normalizeHex6(raw) {
  if (!raw) return null;
  let h = String(raw).replace(/^#/, '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return '#' + h.toLowerCase();
}

function luminanceHex(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturationHex(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function extractColorsFromHtml(html) {
  const scores = new Map();
  const bump = (hex) => {
    const n = normalizeHex6(hex);
    if (!n) return;
    if (n === '#ffffff' || n === '#000000') return;
    scores.set(n, (scores.get(n) || 0) + 1);
  };

  let m;
  const reHash = /#([0-9a-fA-F]{3,6})\b/g;
  while ((m = reHash.exec(html))) bump(m[1]);

  const metaTheme =
    html.match(/name=["']theme-color["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
  if (metaTheme && metaTheme[1]) {
    const t = metaTheme[1].trim();
    if (t.startsWith('#')) bump(t.replace('#', ''));
  }

  const rgbRe = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
  while ((m = rgbRe.exec(html))) {
    const r = Math.min(255, parseInt(m[1], 10));
    const g = Math.min(255, parseInt(m[2], 10));
    const b = Math.min(255, parseInt(m[3], 10));
    const hex =
      '#' +
      [r, g, b]
        .map((x) => Math.max(0, x).toString(16).padStart(2, '0'))
        .join('');
    bump(hex.replace('#', ''));
  }

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([h]) => h);
  return [...new Set(sorted)];
}

function extractFontsFromHtml(html) {
  const out = [];
  const seen = new Set();
  const add = (name) => {
    const n = String(name || '')
      .trim()
      .replace(/['"]/g, '');
    if (!n || seen.has(n.toLowerCase())) return;
    seen.add(n.toLowerCase());
    out.push(n);
  };

  const linkMatches = html.matchAll(/fonts\.googleapis\.com\/css2?\?([^"'\s>]+)/gi);
  for (const match of linkMatches) {
    const q = match[1];
    const fam = decodeURIComponent(q).match(/family=([^&]+)/);
    if (fam) {
      const name = fam[1].split(':')[0].replace(/\+/g, ' ');
      add(name);
    }
  }

  const fontRe = /font-family:\s*([^;}\n]{1,160})/gi;
  let fm;
  while ((fm = fontRe.exec(html))) {
    const raw = fm[1].split(',')[0].trim();
    const cleaned = raw.replace(/['"]/g, '').trim();
    if (cleaned && !/^(sans-serif|serif|system-ui|inherit|initial|monospace)$/i.test(cleaned)) {
      add(cleaned);
    }
  }

  return out;
}

function extractPageTitle(html) {
  const t = html.match(/<title[^>]*>([^<]{1,240})<\/title>/i);
  return t ? t[1].replace(/\s+/g, ' ').trim() : '';
}

function matchGoogleFont(name) {
  if (!name || typeof name !== 'string') return '';
  const n = name.trim();
  const hit = BRAND_GOOGLE_FONTS.find((g) => g.toLowerCase() === n.toLowerCase());
  return hit || '';
}

/** Map proprietary / system / non-Google names to closest font in BRAND_GOOGLE_FONTS. */
function similarGoogleFont(raw) {
  const direct = matchGoogleFont(raw);
  if (direct) return direct;
  if (!raw || typeof raw !== 'string') return '';
  const n = raw
    .trim()
    .replace(/['"]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const pairs = [
    ['helvetica neue', 'Inter'],
    ['neue haas grotesk', 'Inter'],
    ['neue haas', 'Inter'],
    ['helvetica', 'Inter'],
    ['sf pro display', 'Inter'],
    ['sf pro text', 'Inter'],
    ['sf pro', 'Inter'],
    ['-apple-system', 'Inter'],
    ['blinkmacsystemfont', 'Inter'],
    ['system-ui', 'Inter'],
    ['segoe ui', 'Source Sans 3'],
    ['segoe ui variable', 'Source Sans 3'],
    ['franklin gothic', 'DM Sans'],
    ['franklin', 'DM Sans'],
    ['arial', 'Open Sans'],
    ['arial narrow', 'Roboto'],
    ['tahoma', 'Lato'],
    ['verdana', 'Nunito Sans'],
    ['trebuchet ms', 'Open Sans'],
    ['century gothic', 'Montserrat'],
    ['futura', 'Poppins'],
    ['gotham', 'Montserrat'],
    ['avenir next', 'Montserrat'],
    ['avenir', 'Montserrat'],
    ['proxima nova', 'Montserrat'],
    ['proxima', 'Montserrat'],
    ['brandon grotesque', 'DM Sans'],
    ['circular std', 'Poppins'],
    ['circular', 'Poppins'],
    ['graphik', 'DM Sans'],
    ['calibri', 'Open Sans'],
    ['cambria', 'Merriweather'],
    ['times new roman', 'Merriweather'],
    ['times', 'Merriweather'],
    ['georgia', 'Merriweather'],
    ['palatino', 'Merriweather'],
    ['garamond', 'Merriweather'],
    ['baskerville', 'Merriweather'],
    ['book antiqua', 'Merriweather'],
    ['playfair', 'Merriweather'],
    ['lora', 'Merriweather'],
    ['roboto flex', 'Roboto'],
    ['noto sans', 'Open Sans'],
    ['ibm plex sans', 'Inter'],
    ['ubuntu', 'Nunito Sans'],
    ['din', 'Montserrat'],
    ['acumin', 'Source Sans 3'],
    ['myriad', 'Open Sans'],
    ['whitney', 'Source Sans 3'],
    ['interstate', 'Inter'],
    ['meta', 'Roboto'],
    ['thesans', 'DM Sans'],
    ['aktiv grotesk', 'Inter'],
    ['basis grotesque', 'DM Sans'],
    ['sohne', 'Inter'],
    ['söhne', 'Inter']
  ];
  pairs.sort((a, b) => b[0].length - a[0].length);
  for (const [needle, google] of pairs) {
    if (n.includes(needle)) return google;
  }

  if (/serif|garamond|times|georgia|bookman|minion|caslon|slab/i.test(n)) return 'Merriweather';
  if (/mono|consolas|menlo|monaco|fira code|courier|code/i.test(n)) return 'Source Sans 3';
  if (/display|headline|condensed|compressed|impact|bebas|oswald/i.test(n)) return 'Montserrat';
  if (/rounded|soft|human|friendly/i.test(n)) return 'Nunito Sans';
  if (n.length > 1) return 'Inter';
  return '';
}

function heuristicBrandSuggestion(colors, fonts) {
  const list = (colors || []).filter((c) => {
    const L = luminanceHex(c);
    return L > 22 && L < 248;
  });
  const pool = list.length ? list : colors || [];
  const primary =
    [...pool].sort((a, b) => saturationHex(b) - saturationHex(a))[0] || pool[0] || '#1a1a2e';
  const accent =
    pool.find((c) => c !== primary) || (luminanceHex(primary) > 150 ? '#111111' : '#f4f4f8');

  let artPresetId = 'cinematic-dark';
  const Lp = luminanceHex(primary);
  const sat = saturationHex(primary);
  if (Lp > 185) artPresetId = 'clean-executive';
  else if (Lp > 105) artPresetId = 'warm-human';
  else if (sat > 0.38 && Lp < 95) artPresetId = 'bold-editorial';
  else if (sat < 0.12 && Lp < 70) artPresetId = 'data-forward';
  else if (sat > 0.45) artPresetId = 'agency-bold';

  let font = '';
  for (const f of fonts || []) {
    const m = matchGoogleFont(f) || similarGoogleFont(f);
    if (m) {
      font = m;
      break;
    }
  }
  if (!font && fonts && fonts.length) {
    font = similarGoogleFont(fonts[0]) || 'Inter';
  }

  return {
    primaryColor: primary,
    accentColor: accent,
    font,
    artPresetId,
    rationale:
      'Matched from colors/fonts in the page HTML/CSS (heuristic). ' +
      (fonts && fonts[0] && !matchGoogleFont(fonts[0])
        ? `Font “${String(fonts[0]).slice(0, 48)}” → closest Google Font: ${font || 'Inter'}.`
        : ''),
    extraColors: []
  };
}

async function geminiBrandSiteSuggestion({ pageUrl, title, colors, fonts, fallback }) {
  const system =
    'You are a brand designer. Respond with valid JSON only (no markdown). ' +
    'Pick artPresetId from: ' +
    BRAND_SITE_ALLOWED_PRESETS.join(', ') +
    '. ' +
    'The field `font` MUST be a valid Google Fonts family name (fonts.google.com). ' +
    'Sampled site fonts are often proprietary (e.g. SF Pro, Gotham, custom webfonts). Map to the closest Google Font (neo-grotesque → Inter; geometric sans → Montserrat or Poppins; humanist → Open Sans or Lato; editorial serif → Merriweather). ' +
    'Prefer common web fonts when unsure: Inter, Roboto, Open Sans, Montserrat, Poppins, Lato, Merriweather, Source Sans 3, Nunito Sans, DM Sans, Lexend Deca. ' +
    'Never invent a font name. The backend validates against a large allowlist; if needed it maps to the nearest match. ' +
    'Briefly note the mapping in `rationale` when substituting (e.g. “SF Pro → Inter”). ' +
    'Keys: primaryColor, accentColor, font, artPresetId, rationale, extraColors (optional array of {hex,label}, max 2).';
  const user =
    `Website: ${pageUrl}\n` +
    `Title: ${title || '(unknown)'}\n` +
    `Sampled hex colors: ${colors.slice(0, 20).join(', ')}\n` +
    `Sampled font family names from HTML/CSS (may be non-Google): ${fonts.slice(0, 12).join(', ')}\n\n` +
    'Infer a cohesive deck look: choose primary and accent that reflect the brand. ' +
    'If sampled fonts are not in the allowed Google list, pick the closest match by category (neo-grotesque → Inter; geometric sans → Montserrat or Poppins; humanist → Open Sans or Lato; editorial serif → Merriweather).';

  const data = await jsonOnlyCompletion({ system, user, model: GEMINI_TEXT_MODEL });
  const base = fallback || heuristicBrandSuggestion(colors, fonts);
  if (!data || typeof data !== 'object') return base;

  const out = { ...base };
  const ph = normalizeHex6(data.primaryColor);
  const ah = normalizeHex6(data.accentColor);
  if (ph) out.primaryColor = ph;
  if (ah) out.accentColor = ah;

  let f = matchGoogleFont(data.font) || similarGoogleFont(data.font);
  if (!f && fonts && fonts.length) {
    for (const fo of fonts) {
      f = matchGoogleFont(fo) || similarGoogleFont(fo);
      if (f) break;
    }
  }
  if (!f) f = similarGoogleFont(fonts && fonts[0]) || 'Inter';
  if (f) out.font = f;

  if (typeof data.artPresetId === 'string' && BRAND_SITE_ALLOWED_PRESETS.includes(data.artPresetId)) {
    out.artPresetId = data.artPresetId;
  }
  if (typeof data.rationale === 'string' && data.rationale.trim()) {
    out.rationale = data.rationale.trim();
  }

  if (Array.isArray(data.extraColors)) {
    out.extraColors = data.extraColors
      .slice(0, 2)
      .map((row) => {
        const hx = normalizeHex6(row?.hex);
        if (!hx) return null;
        return { hex: hx, label: String(row?.label || 'Site').slice(0, 40) };
      })
      .filter(Boolean);
  }

  return out;
}

app.post('/api/brand-site', async (req, res) => {
  try {
    const rawUrl = req.body?.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: 'Missing url (string).' });
    }
    const pageUrl = assertPublicHttpUrl(rawUrl);

    const maxBytes = Math.min(2_000_000, Number(process.env.BRAND_SITE_MAX_BYTES) || 1_200_000);
    const timeoutMs = Math.min(45000, Number(process.env.BRAND_SITE_FETCH_MS) || 22000);

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    const r = await fetch(pageUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'PS-Deck-Magic/1.0 (+https://github.com) brand-style-preview',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(to);

    if (!r.ok) {
      return res.status(400).json({ error: `Could not fetch page (HTTP ${r.status}).` });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    const html = buf.slice(0, maxBytes).toString('utf8');

    const pageTitle = extractPageTitle(html);
    const extractedColors = extractColorsFromHtml(html);
    const extractedFonts = extractFontsFromHtml(html);

    const fallback = heuristicBrandSuggestion(extractedColors, extractedFonts);

    let suggestion = fallback;
    if (PROVIDER === 'gemini' && GEMINI_API_KEY) {
      try {
        suggestion = await geminiBrandSiteSuggestion({
          pageUrl,
          title: pageTitle,
          colors: extractedColors,
          fonts: extractedFonts,
          fallback
        });
      } catch (e) {
        suggestion = {
          ...fallback,
          rationale: fallback.rationale + ' AI refinement skipped: ' + (e.message || 'error')
        };
      }
    }

    res.json({
      url: pageUrl,
      pageTitle,
      extractedColors: extractedColors.slice(0, 14),
      extractedFonts: extractedFonts.slice(0, 10),
      primaryColor: suggestion.primaryColor,
      accentColor: suggestion.accentColor,
      font: suggestion.font || '',
      artPresetId: suggestion.artPresetId,
      rationale: suggestion.rationale,
      extraColors: suggestion.extraColors || []
    });
  } catch (e) {
    const msg =
      e.name === 'AbortError'
        ? 'Request timed out while fetching the site.'
        : e.message || 'Failed to analyze website.';
    res.status(400).json({ error: msg });
  }
});

// ── View-only share links (stakeholder preview; JSON on disk under data/shares/) ──
const SHARE_DIR = path.join(process.cwd(), 'data', 'shares');
function ensureShareDir() {
  try {
    fs.mkdirSync(SHARE_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}
ensureShareDir();

function newShareId() {
  return randomBytes(16).toString('hex');
}

function sanitizeShareId(raw) {
  const s = String(raw || '').trim().toLowerCase();
  return /^[a-f0-9]{32}$/.test(s) ? s : null;
}

// ── RAG: status ──────────────────────────────────────────────────────────────
app.get('/api/rag/status', (_req, res) => {
  try {
    res.json({ ok: true, ...getStatus() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── RAG: retrieve relevant context for a brief ────────────────────────────────
app.post('/api/rag/retrieve', async (req, res) => {
  try {
    const { brief, session_id, top_k, token_budget } = req.body || {};
    const ai = getGeminiAi();
    if (!ai) return res.status(503).json({ error: 'Gemini API key not configured.' });

    const query = buildQueryFromBrief(brief || {});
    if (!query.trim()) return res.json({ context: '', chunks: [], token_estimate: 0 });

    const result = await retrieve(ai, {
      query,
      industry: brief?.industryKey || brief?.industry,
      session_id: session_id || null,
      top_k: top_k || 8,
      token_budget: token_budget || 6000,
    });
    res.json(result);
  } catch (e) {
    console.error('[rag/retrieve]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── RAG: ingest a document (admin / session upload) ───────────────────────────
app.post('/api/rag/ingest', async (req, res) => {
  try {
    const { text, filename, source_type, industry, deck_type, session_id, force } = req.body || {};
    if (!text || !filename) return res.status(400).json({ error: 'text and filename are required.' });
    const ai = getGeminiAi();
    if (!ai) return res.status(503).json({ error: 'Gemini API key not configured.' });
    const result = await ingestDocument(ai, { text, filename, source_type: source_type || 'knowledge_base', industry, deck_type, session_id, force: !!force });
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error('[rag/ingest]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── RAG: delete a document from the index ─────────────────────────────────────
app.delete('/api/rag/doc/:id', (req, res) => {
  try {
    deleteDoc(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── RAG: force full re-index of knowledge base ────────────────────────────────
app.post('/api/rag/reindex', async (req, res) => {
  const ai = getGeminiAi();
  if (!ai) return res.status(503).json({ error: 'Gemini API key not configured.' });
  // Respond immediately; re-index runs in background
  res.json({ ok: true, message: 'Re-index started in background.' });
  reindexKnowledgeBase(ai).catch((e) => console.error('[rag/reindex]', e.message));
});

/** POST { slides, brand?, deckName? } → { id, path } */
app.post('/api/share', (req, res) => {
  try {
    const slides = req.body?.slides;
    const brand = req.body?.brand && typeof req.body.brand === 'object' ? req.body.brand : {};
    const deckName = String(req.body?.deckName || '').slice(0, 240);
    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ error: 'A non-empty slides array is required.' });
    }
    if (slides.length > 80) {
      return res.status(400).json({ error: 'Too many slides (max 80).' });
    }
    const id = newShareId();
    const payload = {
      v: 1,
      createdAt: new Date().toISOString(),
      deckName,
      brand,
      slides
    };
    fs.writeFileSync(path.join(SHARE_DIR, `${id}.json`), JSON.stringify(payload), 'utf8');
    res.json({ id, path: `/view/${id}` });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Share failed' });
  }
});

app.get('/api/share/:id', (req, res) => {
  try {
    const id = sanitizeShareId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Not found' });
    const fp = path.join(SHARE_DIR, `${id}.json`);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    res.type('application/json').send(fs.readFileSync(fp, 'utf8'));
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load share' });
  }
});

app.get('/view/:id', (req, res) => {
  const id = sanitizeShareId(req.params.id);
  if (!id) return res.status(404).send('Not found');
  const fp = path.join(SHARE_DIR, `${id}.json`);
  if (!fs.existsSync(fp)) return res.status(404).send('This share link is invalid or no longer available.');
  res.sendFile(path.join(process.cwd(), 'public', 'view.html'));
});

const server = app.listen(PORT, () => {
  console.log(`[ps-deck-magic] http://localhost:${PORT} (AI_PROVIDER=${PROVIDER})`);
  // Kick off knowledge base sync in the background — does not block startup
  const ragAi = getGeminiAi();
  if (ragAi) {
    syncKnowledgeBase(ragAi).catch((e) => console.error('[rag/sync startup]', e.message));
  }
});
server.timeout = Number(process.env.HTTP_TIMEOUT_MS) || 600000;
server.requestTimeout = Number(process.env.HTTP_TIMEOUT_MS) || 600000;
