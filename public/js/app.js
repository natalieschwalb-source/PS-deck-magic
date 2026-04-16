// ─── APP STATE & UTILITIES ────────────────────────────────────────────────────

window.App = {
  phase: 1,

  // Shared state
  state: {
    apiHealth: null,
    busy: false,
    deckName: 'Deck',
    // Stable ID for this browser session — scopes user-uploaded docs in the RAG index
    sessionId: crypto.randomUUID(),

    // Phase 1
    chatHistory: [],   // [{role:'user'|'ai', text:'...'}]
    uploadedDocs: [],  // [{filename, text}]
    confirmedDeckType: null,
    confirmedDeckTypeName: null,
    confirmedSlideCount: 8,
    phase1Context: '', // full brief text for later phases (consumed by Phase 2 prompt)
    brief: null,       // structured brief object (set by Phase1.buildBrief)
    solutionConcept: null, // Generated solution design (set by GenerationBrain.generateSolutionConcept)
    sectionPlan: null,     // Computed section depth plan (set by GenerationBrain.allocateSections)

    // Phase 2
    wireframeSlides: [],
    selectedSlideIdx: 0,

    // Phase 3
    brand: {
      clientName: '',
      logoDataUrl: null,
      brandWebsiteUrl: '',
      primaryColor: '#7c6af7',
      accentColor: '#ffffff',
      extraColors: [],
      font: '',
      artPresetId: 'cinematic-dark',
      toneId: 'visionary',
    },
    generatedSlides: [],
    /** First time user enters Design (phase 3); used to apply default brand once. */
    phase3EnteredOnce: false,
    /** Current slide index in phase 3 (persisted when switching phases). */
    p3Cur: 0,
  },

  // ── Phase transition ──────────────────────────────────────────────────────
  /**
   * @param {number} n - 1 | 2 | 3
   * @param {{ regenerateWireframe?: boolean }} [opts] - If true (e.g. "Build Wireframe"), Phase 2 regenerates from AI.
   */
  goToPhase(n, opts = {}) {
    if (n < 1 || n > 3) return;
    if (window.VoiceInput && typeof VoiceInput.stop === 'function') VoiceInput.stop();
    const same =
      this.phase === n && !(opts.regenerateWireframe && n === 2);
    if (same) {
      if (n === 1 && window.Phase1 && typeof Phase1.onShow === 'function') Phase1.onShow();
      return;
    }
    this.phase = n;
    [1, 2, 3].forEach((i) => {
      const el = document.getElementById('phase' + i);
      const step = document.getElementById('step' + i);
      if (!el || !step) return;
      el.classList.toggle('active', i === n);
      step.classList.remove('active', 'done');
      if (i === n) step.classList.add('active');
      else if (i < n) step.classList.add('done');
    });

    this.updateStepperAvailability();

    if (n === 1) {
      if (window.Phase1 && typeof Phase1.onShow === 'function') Phase1.onShow();
    } else if (n === 2) {
      if (opts.regenerateWireframe) {
        Phase2.init();
      } else if (App.state.wireframeSlides && App.state.wireframeSlides.length > 0) {
        Phase2.restoreFromState();
      } else {
        Phase2.showNeedsWireframeFirst();
      }
    } else if (n === 3) {
      Phase3.onEnter();
    }
  },

  /** Enable stepper clicks: Structure after wireframe exists; Design after wireframe exists. */
  updateStepperAvailability() {
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    if (!step2 || !step3) return;
    const hasWire =
      App.state.wireframeSlides && App.state.wireframeSlides.length > 0;
    const onP2 = this.phase === 2;
    step2.classList.toggle('step-locked', !hasWire && !onP2);
    step3.classList.toggle('step-locked', !hasWire);
  },

  /**
   * Plain text from a contenteditable (strip leading • from body lines if present).
   */
  normalizeInlineFieldValue(field, innerText) {
    let t = String(innerText ?? '').replace(/\r/g, '').trim();
    if (field.startsWith('body-')) {
      t = t.replace(/^•\s*/, '').trim();
    }
    if (field === 'cta') {
      t = t.replace(/\s*→\s*$/, '').trim();
    }
    return t;
  },

  /**
   * Update the same slide copy in Structure (wireframe) and Design (generated) decks.
   */
  syncSlideTextToBothPhases(slideIdx, field, rawText) {
    const text = this.normalizeInlineFieldValue(field, rawText);
    const apply = (arr) => {
      if (!Array.isArray(arr) || slideIdx < 0 || slideIdx >= arr.length) return;
      const s = arr[slideIdx];
      if (!s || typeof s !== 'object') return;
      if (field.startsWith('body-')) {
        const i = parseInt(field.slice(5), 10);
        if (Number.isNaN(i) || i < 0) return;
        if (!Array.isArray(s.body)) s.body = [];
        while (s.body.length <= i) s.body.push('');
        s.body[i] = text;
      } else {
        s[field] = text;
      }
    };
    apply(App.state.wireframeSlides);
    apply(App.state.generatedSlides);
  },

  // ── API: JSON completion via /api/chat ────────────────────────────────────
  async callChat(prompt) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(this.formatError(data, res.status));
    return data;
  },

  // ── API: JSON completion via /api/generate ────────────────────────────────
  async callGenerate(prompt) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(this.formatError(data, res.status));
    return data;
  },

  // ── API: extract document text ────────────────────────────────────────────
  async extractDoc(file) {
    const buf = await file.arrayBuffer();
    const res = await fetch('/api/extract-doc', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-filename': file.name,
        'x-session-id': this.state.sessionId,
      },
      body: buf,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Extract failed');
    return data; // { text, chars, filename }
  },

  // ── API: generate image ───────────────────────────────────────────────────
  async generateImage(prompt) {
    const res = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Image generation failed');
    return data; // { b64, mime }
  },

  // ── Health check ──────────────────────────────────────────────────────────
  async checkHealth() {
    const dot = document.getElementById('status-dot');
    const txt = document.getElementById('status-text');
    try {
      const r = await fetch('/api/health');
      const j = await r.json();
      this.state.apiHealth = j;
      if (!j.hasKey) {
        dot.className = 'status-dot err';
        txt.textContent = 'MISSING API KEY — set GEMINI_API_KEY or OPENAI_API_KEY in .env';
      } else {
        dot.className = 'status-dot ok';
        const p = (j.provider || '?').toUpperCase();
        const t = (j.models?.text || '').replace('gemini-','').replace('gpt-','');
        txt.textContent = `${p} · ${t}`;
      }
    } catch {
      dot.className = 'status-dot err';
      txt.textContent = 'Server offline';
      this.state.apiHealth = null;
    }
  },

  // ── Error formatting ──────────────────────────────────────────────────────
  formatError(data, status) {
    let e = data?.error;
    if (!e) return 'HTTP ' + status;
    if (typeof e === 'object') return e.message ? String(e.message) : JSON.stringify(e);
    const s = String(e);
    if (s.trim().startsWith('{')) {
      try { const j = JSON.parse(s); return j?.error?.message || j?.message || s; } catch { /* */ }
    }
    return s;
  },

  // ── Build Phase 1 context summary (for Phase 2 & 3 prompts) ──────────────
  buildContextSummary() {
    const { chatHistory, uploadedDocs, confirmedDeckType, confirmedDeckTypeName, confirmedSlideCount } = this.state;
    const conv = chatHistory.map(m => `${m.role === 'user' ? 'USER' : 'AI'}: ${m.text}`).join('\n');
    const docs = uploadedDocs.map(d => `[${d.filename}]\n${d.text.slice(0, 4000)}`).join('\n\n');
    const psKnowledge = window.Phase1 ? Phase1.PS_KNOWLEDGE : '';
    return (
      `DECK TYPE: ${confirmedDeckTypeName || confirmedDeckType || 'General'}\n` +
      `SLIDE COUNT: ${confirmedSlideCount}\n\n` +
      (psKnowledge ? `PUBLICIS SAPIENT PLATFORM KNOWLEDGE:\n${psKnowledge}\n\n` : '') +
      (docs ? `UPLOADED DOCUMENTS:\n${docs}\n\n` : '') +
      `CONVERSATION:\n${conv}`
    );
  },

  bindStepperNav() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    step1?.addEventListener('click', () => App.goToPhase(1));
    step2?.addEventListener('click', () => {
      if (step2.classList.contains('step-locked')) return;
      App.goToPhase(2);
    });
    step3?.addEventListener('click', () => {
      if (step3.classList.contains('step-locked')) return;
      App.goToPhase(3);
    });
  },
};

// ── Init on load ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (window.loadGoogleFontsManifest) await window.loadGoogleFontsManifest();
  App.checkHealth();
  Phase1.init();
  App.bindStepperNav();
  App.updateStepperAvailability();

  if (window.VoiceInput) {
    VoiceInput.attach(document.getElementById('p1-voice'), document.getElementById('p1-input'));
    VoiceInput.attach(document.getElementById('p2-voice'), document.getElementById('p2-chat-input'), {
      syncSend: 'p2-chat-send',
      isBusy: () => !!window.Phase2?.busy,
    });
    VoiceInput.attach(document.getElementById('p3-voice'), document.getElementById('p3-chat-input'), {
      syncSend: 'p3-chat-send',
      isBusy: () => !!window.Phase3?.busy,
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.VoiceInput?.stop) VoiceInput.stop();
  });
});
