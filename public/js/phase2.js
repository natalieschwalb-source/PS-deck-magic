// ─── PHASE 2: WIREFRAME & STRUCTURE ──────────────────────────────────────────

window.Phase2 = {
  busy: false,
  slides: [],
  selectedIdx: 0,
  _eventsBound: false,

  // ── Init: generate wireframe (from Phase 1 “Build Wireframe” only) ───────
  async init() {
    this.slides = [];
    this.selectedIdx = 0;
    this._chatFiles = [];

    document.getElementById('p2-status').textContent = 'Generating wireframe…';
    document.getElementById('p2-approve').disabled = true;
    document.getElementById('p2-dl').disabled = true;
    document.getElementById('p2-chat-send').disabled = true;
    document.getElementById('p2-rail').innerHTML = '';
    document.getElementById('p2-slide').innerHTML = `<div class="empty-state" style="height:360px;"><div class="spinner"></div><p style="margin-top:12px;font-size:12px;color:var(--text3)">Building your wireframe…</p></div>`;

    this.bindEvents();

    try {
      await this.generateWireframe();
    } catch (err) {
      document.getElementById('p2-status').textContent = 'Error: ' + err.message;
      document.getElementById('p2-slide').innerHTML = `<div class="empty-state" style="height:360px;"><p style="color:#e05555">Failed to generate wireframe.</p><small>${err.message}</small></div>`;
    }
  },

  bindEvents() {
    if (this._eventsBound) return;
    this._eventsBound = true;

    document.getElementById('p2-approve').onclick = () => this.approve();
    // p2-dl now uses inline onclick for dropdown; close menu when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('#p2-dl-wrap')) this.closeDlMenu();
    }, { capture: false });
    document.getElementById('p2-chat-send').onclick = () => this.sendChat();

    const inp = document.getElementById('p2-chat-input');
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendChat(); }
    });
    inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
      document.getElementById('p2-chat-send').disabled = !inp.value.trim() || this.busy;
    });

    const fileInp = document.getElementById('p2-file-inp');
    fileInp.addEventListener('change', () => {
      this.handleAttach(Array.from(fileInp.files));
      fileInp.value = '';
    });

    document.getElementById('p2-slide').addEventListener(
      'blur',
      (e) => {
        const el = e.target.closest('.wf-editable[data-field]');
        if (!el) return;
        this.commitWireframeInlineEdit(el);
      },
      true
    );
  },

  commitWireframeInlineEdit(el) {
    const field = el.getAttribute('data-field');
    if (!field) return;
    const slideIdx = this.selectedIdx;
    App.syncSlideTextToBothPhases(slideIdx, field, el.innerText);
    if (field === 'title') {
      const tab = document.querySelectorAll('.wf-tab')[slideIdx];
      if (tab) tab.textContent = `${slideIdx + 1}. ${this.truncate(App.state.wireframeSlides[slideIdx]?.title || 'Untitled', 22)}`;
    }
  },

  /** Restore UI from App.state (stepper back to Structure) — no API call. */
  restoreFromState() {
    this.bindEvents();
    this.slides = App.state.wireframeSlides;
    this.selectedIdx = Math.min(
      App.state.selectedSlideIdx ?? 0,
      Math.max(0, this.slides.length - 1)
    );
    document.getElementById('p2-status').textContent = `${this.slides.length} slides — chat below to refine anything`;
    document.getElementById('p2-approve').disabled = false;
    document.getElementById('p2-dl').disabled = this.slides.length === 0;
    document.getElementById('p2-chat-send').disabled = false;
    this.render();
  },

  /** Stepper → Structure before any wireframe exists. */
  showNeedsWireframeFirst() {
    this.bindEvents();
    document.getElementById('p2-status').textContent =
      'Complete Phase 1 and click “Build Wireframe →” to generate a structure.';
    document.getElementById('p2-approve').disabled = true;
    document.getElementById('p2-dl').disabled = true;
    document.getElementById('p2-rail').innerHTML = '';
    document.getElementById('p2-slide').innerHTML = `
      <div class="empty-state" style="height:360px;">
        <div class="ei">📋</div>
        <p>No wireframe yet</p>
        <small>Go to <strong>Context</strong>, finish the brief, then use <strong>Build Wireframe →</strong>.</small>
      </div>`;
  },

  // ── RAG knowledge retrieval ──────────────────────────────────────────────
  /**
   * Fetch semantically relevant knowledge chunks via the RAG system.
   * Falls back to the full-file injection approach if RAG is unavailable.
   */
  async loadKnowledge() {
    const brief = App.state.brief || {};
    const industryKey = App.state.industryKey || brief.industryKey || '';
    const sessionId = App.state.sessionId || null;

    // Attempt RAG retrieval first
    try {
      const ragRes = await fetch('/api/rag/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: {
            clientName: brief.clientName || App.state.clientName,
            objective: brief.objective || App.state.objective,
            industryKey,
            industry: industryKey,
            audience: brief.audience || App.state.audience,
            deckType: App.state.confirmedDeckTypeName || App.state.confirmedDeckType,
            tone: App.state.brand?.toneId,
            context: App.state.phase1Context || '',
          },
          session_id: sessionId,
          top_k: 10,
          token_budget: 6000,
        }),
      });

      if (ragRes.ok) {
        const ragData = await ragRes.json();
        if (ragData.context && ragData.token_estimate > 0) {
          console.log(`[rag] Retrieved ${ragData.chunks?.length || 0} chunks (~${ragData.token_estimate} tokens)`);
          return { _rag: true, ragContext: ragData.context, industryKey };
        }
      }
    } catch (err) {
      console.warn('[rag] Retrieval failed, falling back to full-file injection:', err.message);
    }

    // Fallback: load full knowledge files as before
    try {
      const url = `/api/knowledge${industryKey ? `?industry=${encodeURIComponent(industryKey)}` : ''}`;
      const res  = await fetch(url);
      const data = await res.json();
      return data; // { psCore, psAi, psPowerOfOne, industry, industryKey }
    } catch {
      return { psCore: '', psAi: '', psPowerOfOne: '', industry: '', industryKey: null };
    }
  },

  /** Build a single knowledge block string for prompt injection. */
  _buildKnowledgeBlock(k) {
    // RAG path: context already assembled and scored by the server
    if (k._rag && k.ragContext) {
      return (
        `Use the following retrieved knowledge when generating the deck:\n` +
        `- Use "Reusable Claims" for headlines\n` +
        `- Use "Executive Hooks" for C-suite/executive slides\n` +
        `- Use "Core Problems" for problem framing slides\n` +
        `- Use "Solution Themes" for solution/capability slides\n` +
        `- Do NOT invent industry structure if knowledge is provided below\n` +
        `- Prefer specific claims over generic language\n\n` +
        k.ragContext
      );
    }
    // Fallback path: full-file injection
    const parts = [];
    if (k.psCore)       parts.push(`## Publicis Sapient — Core Capabilities\n${k.psCore}`);
    if (k.psPowerOfOne) parts.push(`## Power of One\n${k.psPowerOfOne}`);
    if (k.psAi)         parts.push(`## PS AI Capability\n${k.psAi}`);
    if (k.industry)     parts.push(`## Industry Context: ${k.industryKey || 'Selected Industry'}\n${k.industry}`);
    if (!parts.length) return '';
    return (
      `Use the following knowledge when generating the deck:\n` +
      `- Use "Reusable Claims" for headlines\n` +
      `- Use "Executive Hooks" for C-suite/executive slides\n` +
      `- Use "Core Problems" for problem framing slides\n` +
      `- Use "Solution Themes" for solution/capability slides\n` +
      `- Do NOT invent industry structure if knowledge is provided below\n` +
      `- Prefer specific claims over generic language\n\n` +
      parts.join('\n\n')
    );
  },

  // ── Generate wireframe from Phase 1 context ──────────────────────────────
  async fetchDeckTypePrompt(deckTypeId) {
    if (!deckTypeId) return '';
    try {
      const res  = await fetch(`/api/deck-type-prompt/${encodeURIComponent(deckTypeId)}`);
      const data = await res.json();
      return data.content || '';
    } catch {
      return '';
    }
  },

  async fetchTonePrompt(toneId) {
    // Map UI state IDs to file IDs (warm → warm_human, data → data_driven)
    const TONE_FILE_IDS = { warm: 'warm_human', data: 'data_driven' };
    const fileId = TONE_FILE_IDS[toneId] || toneId || 'executive';
    try {
      const res  = await fetch(`/api/tone-prompt/${encodeURIComponent(fileId)}`);
      const data = await res.json();
      return data.content || '';
    } catch {
      return '';
    }
  },

  async generateWireframe() {
    const ctx          = App.state.phase1Context || App.buildContextSummary();
    const deckType     = App.state.confirmedDeckTypeName || App.state.confirmedDeckType || 'General Presentation';
    const deckTypeId   = App.state.confirmedDeckType || '';
    const brain        = App.state.brain;
    const slideCount   = brain?.targetSlides || App.state.confirmedSlideCount || 8;
    const richnessBand = brain?.richnessBand || App.state.brief?.richnessBand || '';
    document.getElementById('p2-status').textContent =
      `Generating wireframe — ${slideCount} slides inferred (${richnessBand || 'brief'})…`;

    const deckTypePrompt = await this.fetchDeckTypePrompt(deckTypeId);
    const knowledge = await this.loadKnowledge();
    const knowledgeBlock = this._buildKnowledgeBlock(knowledge);

    // ── Solution Synthesis Layer ─────────────────────────────────────────────
    // Pre-generate a structured solution concept so "Our Solution" slides are
    // anchored to a real consulting idea, not generic PS capability language.
    let solutionConceptBlock = '';
    const hasSolutionSection = brain?.sections?.some(
      s => s.role === 'synthesis' && ['solution', 'our-solution', 'our-approach'].includes(s.sectionId)
    );
    if (brain?.buildMode === 'full-proposal' && hasSolutionSection && window.GenerationBrain) {
      document.getElementById('p2-status').textContent = 'Designing solution concept…';
      const sc = await GenerationBrain.generateSolutionConcept(App.state.brief, App.state.uploadedDocs);
      if (sc) {
        solutionConceptBlock = GenerationBrain.buildSolutionConceptBlock(sc, App.state.brief?.proposalSizeId);
      }
    }

    // ── Section Allocation Layer ──────────────────────────────────────────────
    // Refine section depth now that solution concept is known.
    // Mutates brain.sections[].targetSlides and brain.targetSlides.
    if (brain && window.GenerationBrain) {
      document.getElementById('p2-status').textContent = 'Planning section depth…';
      GenerationBrain.allocateSections(brain, App.state.solutionConcept);
    }

    // ── Concept Promotion Layer ───────────────────────────────────────────────
    // Promote expandable bullets into named standalone slides.
    // Solution pillars/components become explicit blueprint slots in the prompt.
    // Other high-priority synthesis sections get extra concept-depth room.
    if (brain && window.GenerationBrain) {
      document.getElementById('p2-status').textContent = 'Promoting key concepts…';
      GenerationBrain.promoteSlideConcepts(brain, App.state.solutionConcept);
    }

    // Build brain block AFTER allocation — slot counts now reflect refined depth
    const brainBlock      = (brain && window.GenerationBrain) ? GenerationBrain.toPromptBlock(brain) : '';
    const finalSlideCount = brain?.targetSlides || slideCount;
    document.getElementById('p2-status').textContent = `Generating wireframe — ${finalSlideCount} slides…`;

    const toneId    = App.state.brand?.toneId || 'visionary';
    const toneGuide = await this.fetchTonePrompt(toneId);

    const prompt =
      `Generate a complete wireframe outline for a "${deckType}" presentation.\n\n` +
      (deckTypePrompt ? `DECK TYPE GUIDANCE:\n${deckTypePrompt}\n\n` : '') +
      `BRIEF AND CONTEXT:\n${ctx}\n\n` +
      (knowledgeBlock ? `KNOWLEDGE BASE:\n${knowledgeBlock}\n\n` : '') +
      (brainBlock ? `${brainBlock}\n\n` : '') +
      (solutionConceptBlock ? `${solutionConceptBlock}\n\n` : '') +
      (toneGuide ? `TONE OF VOICE:\n${toneGuide}\n` : '') +
      `Apply this tone to ALL copy — titles, headlines, and body bullets must reflect this voice.\n\n` +
      `INSTRUCTIONS:\n` +
      `- Generate exactly ${brain?.targetSlides || slideCount} slides (or within ±2)\n` +
      `- Use REAL, specific copy based on the brief — not placeholder text\n` +
      `- Every slide MUST have a headline. A slide without a headline is invalid.\n` +
      `- Write the FINAL copy as it should appear on the slides — this is not a draft\n` +
      `- Every slide must have a strong title and a claim-led headline sentence\n` +
      `- For stats slides, always fill both stat1 and stat2 with real numbers from the brief\n` +
      `- TYPE field (mandatory on every slide): "title" = deck opening slide, "divider" = section chapter slide, "content" = all other slides\n` +
      `- Layout rules: "hero" = title/divider/intro/closing, "stats" = data/results (fill stat1+stat2), "split" = narrative+bullets, "bullets" = actions/recommendations\n\n` +
      `SYNTHESIS vs RETRIEVAL:\n` +
      `- [SYNTHESIS] sections (Our Solution, Delivery, Platform, etc.): generate TAILORED content for THIS client.\n` +
      `  The first content slide in any synthesis section = Solution Overview (what we are building/doing and why).\n` +
      `  The second content slide = Components/Architecture (key layers, modules, or workstreams).\n` +
      `  Do NOT place company product names or marketing copy in synthesis sections.\n` +
      (solutionConceptBlock
        ? `  IMPORTANT: An OUR SOLUTION CONCEPT block is provided above. The "Our Solution" section MUST be built from it — use solutionName, pillars, and components as specified. Do NOT substitute PS capability language.\n`
        : '') +
      `- [RETRIEVAL] sections (Why Publicis Sapient, Our Team): draw from the KNOWLEDGE BASE provided above.\n` +
      `  This is the ONLY place where company capabilities, platforms, and credentials belong.\n` +
      `- [CLOSING] section: restate the central argument as a conviction statement, state the decision ask, list 2–3 next steps with timing. Must appear before appendix.\n` +
      `- Team slides: factual and informational only — who is involved and why they are relevant. No CTA or promotional language.\n\n` +
      `CLAIM QUALITY RULES (apply to every headline and bullet):\n` +
      `- Strip the client name from the headline. If it still works on any other deck → it is too generic. Rewrite it.\n` +
      `- FORBIDDEN phrases (unless tied to a specific brief constraint): "digital transformation", "modernisation roadmap", "improve agility", "reduce TCO", "API-first architecture"\n` +
      `- NEVER output <<REPLACE:...>> or [INPUT REQUIRED]. If a specific fact is missing, use directional language:\n` +
      `  Examples: "significant cost reduction", "double-digit efficiency gain", "substantial time savings", "up to X% based on comparable programmes"\n` +
      `- Do NOT invent specific named metrics, percentages, or outcomes not in the brief\n\n` +
      `RETURN ONLY VALID JSON (no markdown). Inside string values, escape double-quotes as \\" and line breaks as \\n.\n` +
      `{\n` +
      `  "slides": [\n` +
      `    {\n` +
      `      "id": "1",\n` +
      `      "type": "title|divider|content",\n` +
      `      "title": "Slide Title",\n` +
      `      "subtitle": "Section tag or chapter label (optional)",\n` +
      `      "headline": "One powerful sentence — the key message of this slide",\n` +
      `      "body": ["Bullet 1", "Bullet 2", "Bullet 3"],\n` +
      `      "stat1_label": "Metric Name",\n` +
      `      "stat1_value": "42%",\n` +
      `      "stat2_label": "Second Metric",\n` +
      `      "stat2_value": "3.2x",\n` +
      `      "cta": "Call to action text (optional)",\n` +
      `      "layout": "hero|split|stats|bullets",\n` +
      `      "hasImage": true,\n` +
      `      "image_description": "1-2 sentences describing what this image will show — subject, setting, mood, visual metaphor",\n` +
      `      "image_type": "lifestyle|decorative|floating-ui|product-mockup|abstract|hero-photo|data-viz"\n` +
      `    }\n` +
      `  ]\n` +
      `}`;

    const data = await App.callGenerate(prompt);
    if (!data.slides || !data.slides.length) throw new Error('No slides returned from AI.');

    const enforcedSlides = (window.GenerationBrain && App.state.brain)
      ? GenerationBrain.enforceStructure(data.slides, App.state.brain)
      : data.slides;

    this.slides = enforcedSlides;
    App.state.wireframeSlides = this.slides;
    App.updateStepperAvailability();
    this.render();
  },

  // ── Render all slides ────────────────────────────────────────────────────
  render() {
    const rail = document.getElementById('p2-rail');
    rail.innerHTML = '';

    this.slides.forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.className = 'wf-tab' + (i === this.selectedIdx ? ' active' : '');
      btn.textContent = `${i + 1}. ${this.truncate(slide.title || 'Untitled', 22)}`;
      btn.onclick = () => this.selectSlide(i);
      rail.appendChild(btn);
    });

    document.getElementById('p2-status').textContent = `${this.slides.length} slides — chat below to refine anything`;
    document.getElementById('p2-approve').disabled = false;
    document.getElementById('p2-dl').disabled = this.slides.length === 0;
    document.getElementById('p2-chat-send').disabled = false;

    this.selectSlide(this.selectedIdx);
  },

  // ── Select & render a slide ──────────────────────────────────────────────
  selectSlide(idx) {
    this.selectedIdx = idx;
    App.state.selectedSlideIdx = idx;

    // Update rail tab states
    document.querySelectorAll('.wf-tab').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });

    const slide = this.slides[idx];
    const wrap = document.getElementById('p2-slide');
    wrap.innerHTML = this.renderWireframeSlide(slide, idx);
  },

  // ── Render a single wireframe slide ─────────────────────────────────────
  renderWireframeSlide(slide, idx) {
    const layout = slide.layout || 'split';
    const hasStats = slide.stat1_value;
    const hasBullets = slide.body && slide.body.length;
    const hasImg = slide.hasImage !== false;

    let bodyHtml = '';

    const bulletRow = (b, bi) =>
      `<div class="wf-bullet wf-editable slide-editable" contenteditable="true" data-field="body-${bi}" spellcheck="true">${this.esc(b)}</div>`;

    if (layout === 'hero') {
      bodyHtml = `
        <div style="flex:1;display:flex;flex-direction:column;gap:3%;">
          ${hasBullets ? `<div class="wf-bullets">${slide.body.map((b, bi) => bulletRow(b, bi)).join('')}</div>` : ''}
          ${hasImg ? `<div class="wf-img-box" style="flex:1;min-height:28%;">${this.imgPlaceholderContent(slide, 'hero')}</div>` : ''}
        </div>`;
    } else if (layout === 'stats') {
      bodyHtml = `
        <div class="wf-stats-row">
          ${hasStats ? `
            <div class="wf-stat">
              <div class="wf-stat-val wf-editable slide-editable" contenteditable="true" data-field="stat1_value" spellcheck="true">${this.esc(slide.stat1_value)}</div>
              <div class="wf-stat-lbl wf-editable slide-editable" contenteditable="true" data-field="stat1_label" spellcheck="true">${this.esc(slide.stat1_label || '')}</div>
            </div>
            ${slide.stat2_value ? `<div class="wf-stat">
              <div class="wf-stat-val wf-editable slide-editable" contenteditable="true" data-field="stat2_value" spellcheck="true">${this.esc(slide.stat2_value)}</div>
              <div class="wf-stat-lbl wf-editable slide-editable" contenteditable="true" data-field="stat2_label" spellcheck="true">${this.esc(slide.stat2_label || '')}</div>
            </div>` : ''}
          ` : ''}
        </div>
        ${hasBullets ? `<div class="wf-bullets" style="margin-top:3%">${slide.body.slice(0,3).map((b, bi) => bulletRow(b, bi)).join('')}</div>` : ''}`;
    } else {
      // split or bullets
      const textCol = `
        <div class="wf-text-col">
          ${hasBullets ? `<div class="wf-bullets">${slide.body.slice(0,4).map((b, bi) => bulletRow(b, bi)).join('')}</div>` : ''}
          ${hasStats ? `<div class="wf-stats-row" style="margin-top:4%">
            <div class="wf-stat">
              <div class="wf-stat-val wf-editable slide-editable" contenteditable="true" data-field="stat1_value" spellcheck="true">${this.esc(slide.stat1_value)}</div>
              <div class="wf-stat-lbl wf-editable slide-editable" contenteditable="true" data-field="stat1_label" spellcheck="true">${this.esc(slide.stat1_label || '')}</div>
            </div>
            ${slide.stat2_value ? `<div class="wf-stat">
              <div class="wf-stat-val wf-editable slide-editable" contenteditable="true" data-field="stat2_value" spellcheck="true">${this.esc(slide.stat2_value)}</div>
              <div class="wf-stat-lbl wf-editable slide-editable" contenteditable="true" data-field="stat2_label" spellcheck="true">${this.esc(slide.stat2_label || '')}</div>
            </div>` : ''}
          </div>` : ''}
        </div>`;
      const imgCol = hasImg ? `<div class="wf-img-box">${this.imgPlaceholderContent(slide, 'split')}</div>` : '';
      bodyHtml = `<div class="wf-body-cols">${textCol}${imgCol}</div>`;
    }

    const ed = (field, cls, inner) =>
      `<div class="${cls} wf-editable slide-editable" contenteditable="true" data-field="${field}" spellcheck="true">${inner}</div>`;

    return `
      <div class="wf-slide selected" style="cursor:default">
        <div class="wf-inner">
          ${slide.subtitle ? ed('subtitle', 'wf-tag', this.esc(slide.subtitle)) : ''}
          ${ed('title', 'wf-title', this.esc(slide.title || 'Untitled Slide'))}
          ${slide.headline ? ed('headline', 'wf-headline', this.esc(slide.headline)) : ''}
          ${bodyHtml}
          ${slide.cta ? ed('cta', 'wf-cta', `${this.esc(slide.cta)} →`) : ''}
        </div>
        <div style="position:absolute;bottom:2%;right:2%;font-size:1.5%;color:#c0c0d0;font-family:'DM Mono',monospace;">${(idx+1)} / ${this.slides.length}</div>
      </div>`;
  },

  // ── Chat: send message → AI updates the whole deck ───────────────────────
  async sendChat() {
    const inp = document.getElementById('p2-chat-input');
    const text = inp.value.trim();
    if (!text || this.busy) return;

    this.busy = true;
    inp.value = '';
    inp.style.height = 'auto';
    document.getElementById('p2-chat-send').disabled = true;

    this.addChatMsg('user', text);

    // Build file context string
    let fileContext = '';
    if (this._chatFiles && this._chatFiles.length) {
      fileContext = '\n\nATTACHED FILES:\n' +
        this._chatFiles.map(f => `[${f.name}]\n${f.content}`).join('\n\n');
      this._chatFiles = [];
      document.getElementById('p2-chat-files').innerHTML = '';
    }

    const toneId    = App.state.brand?.toneId || 'visionary';
    const toneGuide = await this.fetchTonePrompt(toneId);
    const prompt =
      `You are a presentation strategist editing a wireframe deck based on user feedback.\n\n` +
      `CURRENT DECK (${this.slides.length} slides):\n${JSON.stringify(this.slides, null, 2)}\n` +
      fileContext + `\n\n` +
      (toneGuide ? `TONE OF VOICE:\n${toneGuide}\nMaintain this tone throughout all copy.\n\n` : '') +
      `USER REQUEST: "${text}"\n\n` +
      `Apply the requested changes. You can update any slide(s), add new slides, remove slides, or restructure the deck. ` +
      `Use REAL, specific copy — not placeholder text. Write final copy as it should appear on slides. Preserve all content the user hasn't asked to change.\n` +
      `Every slide MUST have a headline — never return a slide with an empty or missing headline.\n` +
      `If a specific fact is missing, embed <<REPLACE: description>> inside the sentence — do NOT write [INPUT REQUIRED].\n\n` +
      `RETURN ONLY VALID JSON (no markdown). Inside string values, escape double-quotes as \\" and line breaks as \\n.\n` +
      `{ "slides": [ ...same schema as input... ] }`;

    try {
      const data = await App.callGenerate(prompt);
      if (data.slides && data.slides.length) {
        this.slides = data.slides;
        App.state.wireframeSlides = this.slides;
        App.updateStepperAvailability();

        // Keep selected index in bounds
        this.selectedIdx = Math.min(this.selectedIdx, this.slides.length - 1);
        App.state.selectedSlideIdx = this.selectedIdx;

        this.render();
        this.addChatMsg('ai', `Done — ${this.slides.length} slides updated. Any other changes?`);
      } else {
        this.addChatMsg('ai', "I couldn't update the deck. Could you rephrase your request?");
      }
    } catch (err) {
      this.addChatMsg('ai', 'Error: ' + err.message);
    } finally {
      this.busy = false;
      document.getElementById('p2-chat-send').disabled = false;
    }
  },

  addChatMsg(role, text) {
    const msgs = document.getElementById('p2-chat-msgs');
    const div = document.createElement('div');
    div.className = `cmsg ${role}`;
    div.innerHTML = String(text||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/\n/g,'<br>');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  // ── File attachments ──────────────────────────────────────────────────────
  async handleAttach(files) {
    if (!files.length) return;
    if (!this._chatFiles) this._chatFiles = [];

    for (const file of files) {
      const chipId = 'p2fc-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      this.addFileChip(file.name, chipId);

      try {
        let content = '';
        if (file.type.startsWith('image/')) {
          // For images read as base64 and note it for context
          const dataUrl = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          content = `[Image file — ${file.name}. Dimensions and visual content are available to the user. Reference this image in the deck as appropriate.]`;
          // Store data URL on the file object for potential slide image use
          file._dataUrl = dataUrl;
        } else {
          const result = await App.extractDoc(file);
          content = result.text ? result.text.slice(0, 8000) : `[${file.name} — no text extracted]`;
        }
        this._chatFiles.push({ name: file.name, content });
        this.updateFileChip(chipId, '✓');
      } catch (err) {
        this.updateFileChip(chipId, '✗');
      }
    }

    // Enable send now there are files ready
    document.getElementById('p2-chat-send').disabled = this.busy;
  },

  addFileChip(name, id) {
    const bar = document.getElementById('p2-chat-files');
    const chip = document.createElement('div');
    chip.className = 'chat-file-chip';
    chip.id = id;
    chip.innerHTML = `<span>${this.truncate(name, 22)}</span><span style="color:var(--text3);font-size:9px;margin-left:3px" class="fc-status">…</span><button onclick="Phase2.removeFileChip('${id}')">×</button>`;
    bar.appendChild(chip);
  },

  updateFileChip(id, status) {
    const chip = document.getElementById(id);
    if (chip) { const s = chip.querySelector('.fc-status'); if (s) s.textContent = status; }
  },

  removeFileChip(id) {
    document.getElementById(id)?.remove();
    // Also remove from _chatFiles by matching chip position is hard; just keep content and let it be sent
  },

  // ── Approve structure → Phase 3 ──────────────────────────────────────────
  approve() {
    App.state.wireframeSlides = this.slides;
    App.goToPhase(3);
  },

  // ── PPTX: structure / wireframe only (no images, B&W) ─────────────────────
  async downloadWireframePPTX() {
    const slides = this.slides.length ? this.slides : App.state.wireframeSlides;
    if (!slides.length) return;

    const btn = document.getElementById('p2-dl');
    btn.disabled = true;
    btn.textContent = '⏳ Exporting…';

    const fontFace = 'Arial';
    const BG = 'FFFFFF';
    const ink = '111111';
    const sub = '555555';
    const muted = '888888';
    const boxFill = 'EEEEEE';
    const boxLine = 'BBBBBB';

    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDE169', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE169';

    const addPlaceholder = (s, x, y, w, h, slide) => {
      s.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w,
        h,
        fill: { color: boxFill },
        line: { color: boxLine, width: 1 }
      });
      const type = (slide.image_type || 'image').replace(/-/g, ' ');
      const desc = (slide.image_description || '').slice(0, 220);
      s.addText('IMAGE PLACEHOLDER', {
        x: x + 0.05,
        y: y + 0.08,
        w: w - 0.1,
        h: 0.25,
        fontSize: 8,
        bold: true,
        color: muted,
        fontFace,
        align: 'center'
      });
      s.addText(type.toUpperCase(), {
        x: x + 0.05,
        y: y + 0.35,
        w: w - 0.1,
        h: 0.25,
        fontSize: 7,
        color: sub,
        fontFace,
        align: 'center'
      });
      if (desc) {
        s.addText(desc, {
          x: x + 0.12,
          y: y + 0.65,
          w: w - 0.24,
          h: h - 0.75,
          fontSize: 8,
          color: sub,
          fontFace,
          align: 'center',
          valign: 'top',
          wrap: true
        });
      }
    };

    try {
      const baseName =
        App.state.confirmedDeckTypeName ||
        App.state.confirmedDeckType ||
        App.state.deckName ||
        'Deck';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const s = pptx.addSlide();
        s.background = { color: BG };

        if (i === 0) {
          s.addText('WIREFRAME · STRUCTURE ONLY', {
            x: 0.5,
            y: 0.25,
            w: 6,
            h: 0.3,
            fontSize: 8,
            color: muted,
            fontFace,
            italic: true
          });
        }

        let y = i === 0 ? 0.55 : 0.45;

        if (slide.subtitle) {
          s.addText(String(slide.subtitle).toUpperCase(), {
            x: 0.5,
            y,
            w: 10,
            h: 0.35,
            fontSize: 9,
            bold: true,
            color: sub,
            charSpacing: 2,
            fontFace
          });
          y += 0.42;
        }

        const layout = slide.layout || 'split';
        const isHero = layout === 'hero' || i === 0;

        if (slide.title) {
          s.addText(slide.title, {
            x: 0.5,
            y,
            w: isHero ? 11 : 7,
            h: isHero ? 1.2 : 0.85,
            fontSize: isHero ? 36 : 26,
            bold: true,
            color: ink,
            fontFace,
            wrap: true
          });
          y += isHero ? 1.25 : 0.95;
        }

        if (slide.headline) {
          s.addText(slide.headline, {
            x: 0.5,
            y,
            w: isHero ? 10 : 6.5,
            h: 0.65,
            fontSize: 14,
            color: sub,
            fontFace,
            wrap: true
          });
          y += 0.72;
        }

        const hasImg = slide.hasImage !== false;

        if (layout === 'stats') {
          if (slide.stat1_value) {
            s.addShape(pptx.ShapeType.rect, {
              x: 0.5,
              y: 2.0,
              w: 5.8,
              h: 2.2,
              fill: { color: BG },
              line: { color: boxLine, width: 1 }
            });
            s.addText(slide.stat1_value, {
              x: 0.5,
              y: 2.15,
              w: 5.8,
              h: 1.1,
              fontSize: 44,
              bold: true,
              color: ink,
              align: 'center',
              fontFace
            });
            s.addText((slide.stat1_label || '').toUpperCase(), {
              x: 0.5,
              y: 3.3,
              w: 5.8,
              h: 0.4,
              fontSize: 9,
              color: muted,
              align: 'center',
              fontFace
            });
          }
          if (slide.stat2_value) {
            s.addShape(pptx.ShapeType.rect, {
              x: 6.6,
              y: 2.0,
              w: 5.8,
              h: 2.2,
              fill: { color: BG },
              line: { color: boxLine, width: 1 }
            });
            s.addText(slide.stat2_value, {
              x: 6.6,
              y: 2.15,
              w: 5.8,
              h: 1.1,
              fontSize: 40,
              bold: true,
              color: ink,
              align: 'center',
              fontFace
            });
            s.addText((slide.stat2_label || '').toUpperCase(), {
              x: 6.6,
              y: 3.3,
              w: 5.8,
              h: 0.4,
              fontSize: 9,
              color: muted,
              align: 'center',
              fontFace
            });
          }
          if (slide.body && slide.body.length) {
            const bullets = slide.body.map((b) => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
            s.addText(bullets, {
              x: 0.5,
              y: 4.45,
              w: 11.5,
              h: 2.4,
              fontSize: 12,
              color: sub,
              fontFace,
              wrap: true
            });
          }
        } else if (layout === 'hero') {
          if (slide.body && slide.body.length) {
            const bullets = slide.body.map((b) => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
            s.addText(bullets, {
              x: 0.5,
              y: y,
              w: 6.5,
              h: 2.2,
              fontSize: 13,
              color: sub,
              fontFace,
              wrap: true
            });
          }
          if (hasImg) {
            addPlaceholder(s, 0.5, 4.5, 12.3, 2.5, slide);
          }
        } else {
          if (slide.body && slide.body.length) {
            const bullets = slide.body.map((b) => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
            s.addText(bullets, {
              x: 0.5,
              y: y,
              w: hasImg ? 5.8 : 11.5,
              h: 4,
              fontSize: 13,
              color: sub,
              fontFace,
              wrap: true
            });
          }
          if (slide.stat1_value) {
            s.addText(slide.stat1_value, {
              x: 0.5,
              y: 5.4,
              w: 3,
              h: 0.6,
              fontSize: 22,
              bold: true,
              color: ink,
              fontFace
            });
            s.addText(slide.stat1_label || '', {
              x: 0.5,
              y: 5.95,
              w: 3,
              h: 0.3,
              fontSize: 9,
              color: muted,
              fontFace
            });
          }
          if (hasImg) {
            addPlaceholder(s, 6.5, 1.5, 6.3, 5, slide);
          }
        }

        if (slide.cta) {
          s.addText(slide.cta + '  →', {
            x: 0.5,
            y: 6.75,
            w: 4,
            h: 0.45,
            fontSize: 11,
            bold: true,
            color: ink,
            fontFace,
            shape: pptx.ShapeType.rect,
            fill: { color: BG },
            border: { type: 'solid', pt: 1, color: ink },
            align: 'center',
            valign: 'middle'
          });
        }

        s.addText(`${i + 1}`, {
          x: 12.8,
          y: 7.0,
          w: 0.4,
          h: 0.35,
          fontSize: 8,
          color: muted,
          align: 'center',
          fontFace
        });
      }

      const safe = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      await pptx.writeFile({ fileName: `${safe}_wireframe.pptx` });
    } catch (err) {
      alert('PPTX export failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬇ Download <span class="dl-arrow">▾</span>';
    }
  },

  downloadPPTX() { return this.downloadWireframePPTX(); },

  async downloadPDF() {
    const slides = this.slides.length ? this.slides : App.state.wireframeSlides;
    if (!slides.length) return;
    const btn = document.getElementById('p2-dl');
    btn.disabled = true;
    btn.textContent = '⏳ Exporting…';
    try {
      await this._exportSlidesToPDF(slides);
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬇ Download <span class="dl-arrow">▾</span>';
    }
  },

  async _exportSlidesToPDF(slides) {
    // Render each slide to a hidden div, then print to PDF using browser print
    const baseName = (App.state.confirmedDeckTypeName || App.state.deckName || 'Deck').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to download PDF.'); return; }

    const htmlSlides = slides.map((slide, i) => {
      const html = this.renderWireframeSlide(slide, i);
      return `<div class="pdf-slide">${html}</div>`;
    }).join('');

    const content = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>${baseName}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;font-family:Arial,sans-serif}
        .pdf-slide{width:297mm;height:167mm;page-break-after:always;overflow:hidden;position:relative;background:#fff;padding:20px 28px}
        @page{size:A4 landscape;margin:0}
        @media print{body{margin:0}.pdf-slide{page-break-after:always}}
        .wf-slide{background:#fff!important;border:none!important;box-shadow:none!important;height:100%!important;padding:0!important}
      </style>
    </head><body>${htmlSlides}<script>window.onload=function(){window.print();window.close()}<\/script></body></html>`;
    win.document.open();
    win.document.write(content);
    win.document.close();
  },

  toggleDlMenu(e) {
    e.stopPropagation();
    document.getElementById('p2-dl-wrap').classList.toggle('open');
  },

  closeDlMenu() {
    document.getElementById('p2-dl-wrap')?.classList.remove('open');
  },

  // ── Utilities ────────────────────────────────────────────────────────────
  esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>');
  },
  truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; },

  imgPlaceholderContent(slide, variant) {
    const typeLabel = slide.image_type
      ? slide.image_type.replace(/-/g, ' ').toUpperCase()
      : (variant === 'hero' ? 'HERO IMAGE' : 'IMAGE');
    const desc = slide.image_description || null;
    return `
      <span style="font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:${desc ? '1.5%' : '0'};">${typeLabel}</span>
      ${desc ? `<small style="line-height:1.4;max-width:88%;text-align:center;padding:0 4%;">${this.esc(desc)}</small>` : ''}
    `;
  },
};
