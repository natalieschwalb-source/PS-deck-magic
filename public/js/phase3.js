// ─── PHASE 3: ART DIRECTION & GENERATION ─────────────────────────────────────

window.Phase3 = {
  busy: false,
  slides: [],
  cur: 0,
  _isPresenting: false,
  _presentBaseW: 0,
  _presentBaseH: 0,

  PS_BRAND: {
    primaryColor: '#E2231A',
    accentColor: '#FFFFFF',
    bgColor: '#FFFFFF',
    headlineFont: 'Lexend Deca',
    bodyFont: 'Roboto',
    style: 'clean, minimal white background, professional corporate, Publicis Sapient brand, bold red accents, sharp typography, modern enterprise',
    artPresetId: 'ps-brand',
    palette: ['#E2231A', '#FFFFFF', '#111111', '#F5F5F5'],
  },

  ART_PRESETS: [
    { id: 'cinematic-dark',  label: 'Cinematic dark',    palette: ['#0a0a1a','#1a1a2e','#c9a84c','#ffffff'], style: 'cinematic, dark background, high contrast, dramatic lighting, editorial photography, premium feel' },
    { id: 'clean-executive', label: 'Clean executive',   palette: ['#ffffff','#f4f4f4','#111111','#2563eb'], style: 'clean, minimal, white background, professional, sharp, corporate photography' },
    { id: 'bold-editorial',  label: 'Bold editorial',    palette: ['#111111','#ff3b00','#f5f0e8','#ffffff'], style: 'bold, high contrast, editorial, magazine style, strong composition, vivid colors' },
    { id: 'warm-human',      label: 'Warm & human',      palette: ['#f5ede0','#c4956a','#2d2d2d','#e8ddd0'], style: 'warm, earthy tones, lifestyle photography, natural light, human-centered, authentic' },
    { id: 'data-forward',    label: 'Data forward',      palette: ['#0f172a','#0ea5e9','#f8fafc','#22d3ee'], style: 'data visualization aesthetic, clean, technical, teal and blue tones, structured' },
    { id: 'agency-bold',     label: 'Agency bold',       palette: ['#1a0a2e','#7c3aed','#f0abfc','#ffffff'], style: 'bold, vibrant, creative agency aesthetic, high energy, asymmetric composition' },
  ],

  TONE_OPTIONS: [
    { id: 'warm',      label: 'Warm & human',           guide: 'Use warm, human language. Lead with empathy before data. Avoid jargon. Write as a trusted partner, not a vendor.' },
    { id: 'data',      label: 'Data-driven & precise',  guide: 'Every claim must be specific and quantified. Lead with numbers. Avoid vague superlatives.' },
    { id: 'visionary', label: 'Visionary & cinematic',  guide: 'Write copy that evokes feeling before logic. Think manifesto, not memo. Each headline should feel quotable.' },
    { id: 'executive', label: 'Confident & executive',  guide: 'Write for someone who reads 200 emails a day. One idea per sentence. No preamble. No hedging.' },
    { id: 'punchy',    label: 'Conversational & punchy', guide: 'Short sentences. Active voice. Cut every word that does not earn its place.' },
  ],

  _eventsBound: false,

  /** Options for the custom-design font dropdown (from window.PS_GOOGLE_FONT_FAMILIES). */
  getGoogleFontOptions() {
    const fams = window.PS_GOOGLE_FONT_FAMILIES || [];
    const opts = [{ value: '', label: 'Default (system)' }];
    for (const f of fams) {
      if (typeof f === 'string' && f.trim()) opts.push({ value: f, label: f });
    }
    return opts;
  },

  _escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  },

  /** Escape a font family name for use inside CSS font-family: '…' */
  _cssFontFamilyEscape(name) {
    return String(name).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  },

  setBrandFont(value) {
    App.state.brand.font = value;
    if (window.loadGoogleFontFamily) window.loadGoogleFontFamily(value);
    if (this.slides && this.slides.length) this.renderSlide(this.cur);
    this.updateFontPickerTrigger();
    this.updateFontPickerSelection();
  },

  // ── Enter Design phase (first time or returning via stepper) ──────────────
  onEnter() {
    if (!this._eventsBound) {
      this.bindEvents();
      this._eventsBound = true;
    }

    const first = !App.state.phase3EnteredOnce;
    if (first) {
      App.state.phase3EnteredOnce = true;
      App.state.generatedSlides = [];
      this.slides = [];
      this.cur = 0;
      App.state.p3Cur = 0;
      App.state.brand = {
        clientName: '',
        logoDataUrl: null,
        brandWebsiteUrl: '',
        primaryColor: '#7c6af7',
        accentColor: '#ffffff',
        extraColors: [],
        font: '',
        artPresetId: 'cinematic-dark',
        toneId: 'visionary',
        designMode: 'ps-brand',
      };
    } else {
      this.slides = App.state.generatedSlides && App.state.generatedSlides.length ? App.state.generatedSlides : [];
      this.cur = Math.min(
        App.state.p3Cur || 0,
        Math.max(0, this.slides.length - 1)
      );
      App.state.p3Cur = this.cur;
    }

    if (!this._chatFiles) this._chatFiles = [];
    this._colorRows = [];
    try {
      this.renderBrandPanel();
    } catch (err) {
      const inner = document.getElementById('p3-brand-inner');
      if (inner) inner.innerHTML = `<div style="padding:16px;color:#e05555;font-size:12px;line-height:1.6"><strong>Panel error:</strong><br>${err.message}<br><pre style="font-size:10px;margin-top:8px;white-space:pre-wrap">${err.stack || ''}</pre></div>`;
      console.error('[Phase3.renderBrandPanel]', err);
    }

    const deckName =
      (App.state.generatedSlides?.[0]?.title || '').trim() ||
      (App.state.deckName || '').trim() ||
      (App.state.wireframeSlides?.[0]?.title || '').trim() ||
      (App.state.brand?.clientName || '').trim() ||
      App.state.confirmedDeckTypeName ||
      App.state.confirmedDeckType;
    document.getElementById('p3-badge').textContent = deckName
      ? `${deckName} · ${App.state.wireframeSlides.length} slides`
      : '';

    document.getElementById('p3-gen').disabled = false;

    if (this.slides.length) {
      this.renderSlide(this.cur);
      this.renderThumbs();
      document.getElementById('p3-dl').disabled = false;
      document.getElementById('p3-chat-send').disabled = false;
      document.getElementById('p3-present').disabled = false;
      document.getElementById('p3-share').disabled = false;
      document.getElementById('p3-gen').textContent = '↺ Regenerate';
    } else {
      this.renderEmptyPreview();
      document.getElementById('p3-thumbs').innerHTML = '';
      document.getElementById('p3-dl').disabled = true;
      document.getElementById('p3-chat-send').disabled = true;
      document.getElementById('p3-present').disabled = true;
      document.getElementById('p3-share').disabled = true;
      document.getElementById('p3-ctr').textContent = '— / —';
      document.getElementById('p3-gen').textContent = '✦ Generate Deck';
    }

    this.updateNavState();
  },

  renderEmptyPreview() {
    const card = document.getElementById('p3-slide-card');
    if (!card) return;
    card.innerHTML = `
      <div class="empty-state">
        <div class="ei">🎴</div>
        <p>Set your brand identity and click Generate</p>
        <small>Cinematic slides will appear here</small>
      </div>`;
  },

  /** Full-width preview while /api/generate runs (can take 30–90s). */
  showPreviewGenerating() {
    const card = document.getElementById('p3-slide-card');
    if (!card) return;
    card.innerHTML = `
      <div class="empty-state p3-gen-loading">
        <div class="spinner p3-gen-spinner"></div>
        <p class="p3-gen-loading-title">Generating your deck…</p>
        <small class="p3-gen-loading-hint">Creating slides and copy with your brand. This may take a minute — you can keep this tab open.</small>
      </div>`;
    document.getElementById('p3-thumbs').innerHTML = '';
    document.getElementById('p3-ctr').textContent = '…';
    document.getElementById('p3-prev').disabled = true;
    document.getElementById('p3-next').disabled = true;
  },

  bindEvents() {
    document.getElementById('p3-gen').addEventListener('click', () => this.generateDeck());
    document.getElementById('p3-prev').addEventListener('click', () => this.nav(-1));
    document.getElementById('p3-next').addEventListener('click', () => this.nav(1));
    document.getElementById('p3-chat-send').addEventListener('click', () => this.sendChat());
    document.getElementById('p3-present').addEventListener('click', () => this.togglePresentation());
    document.getElementById('p3-share').addEventListener('click', () => this.shareDeck());
    document.getElementById('share-modal-close').addEventListener('click', () => this.closeShareModal());
    document.getElementById('share-copy-btn').addEventListener('click', () => this.copyShareLink());
    document.getElementById('share-modal').addEventListener('click', () => this.closeShareModal());
    // p3-dl uses inline onclick for dropdown
    document.addEventListener('click', e => {
      if (!e.target.closest('#p3-dl-wrap')) this.closeDlMenu();
    });

    const chatInp = document.getElementById('p3-chat-input');
    chatInp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendChat(); }
    });
    chatInp.addEventListener('input', () => {
      chatInp.style.height = 'auto';
      chatInp.style.height = Math.min(chatInp.scrollHeight, 100) + 'px';
    });

    const fileInp = document.getElementById('p3-file-inp');
    fileInp.addEventListener('change', () => {
      this.handleAttach(Array.from(fileInp.files));
      fileInp.value = '';
    });

    const slideImgInp = document.getElementById('p3-slide-img-inp');
    if (slideImgInp) {
      slideImgInp.addEventListener('change', () => {
        const file = slideImgInp.files[0];
        slideImgInp.value = '';
        if (file) this._handleSlideImageUpload(file);
      });
    }

    this.initElementTooltip();
  },

  bindPresentationHotkeys() {
    if (this._hotkeysBound) return;
    this._hotkeysBound = true;
    document.addEventListener('keydown', (e) => {
      if (!this._isPresenting) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nav(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.nav(-1);
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const area = document.getElementById('p3-preview-area');
      const inFs = document.fullscreenElement === area;
      this._isPresenting = inFs;
      if (inFs) this.enterPresentationMode();
      else this.exitPresentationMode();
      const btn = document.getElementById('p3-present');
      if (btn) btn.textContent = inFs ? 'Exit Fullscreen' : '⛶ Present';
    });
  },

  enterPresentationMode() {
    const area = document.getElementById('p3-preview-area');
    const card = document.getElementById('p3-slide-card');
    if (!area || !card) return;
    this._presentBaseW = card.clientWidth || 720;
    this._presentBaseH = card.clientHeight || 405;
    area.classList.add('p3-presenting');
    card.style.maxWidth = 'none';
    card.style.aspectRatio = 'auto';
    card.style.width = `${this._presentBaseW}px`;
    card.style.height = `${this._presentBaseH}px`;
    card.style.position = 'absolute';
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.borderRadius = '0';
    card.style.boxShadow = 'none';
    this.applyPresentationScale();
    window.addEventListener('resize', this._onPresentResize);
  },

  exitPresentationMode() {
    const area = document.getElementById('p3-preview-area');
    const card = document.getElementById('p3-slide-card');
    if (!area || !card) return;
    area.classList.remove('p3-presenting');
    card.style.transform = '';
    card.style.maxWidth = '';
    card.style.aspectRatio = '';
    card.style.width = '';
    card.style.height = '';
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.borderRadius = '';
    card.style.boxShadow = '';
    window.removeEventListener('resize', this._onPresentResize);
  },

  _onPresentResize() {
    Phase3.applyPresentationScale();
  },

  applyPresentationScale() {
    if (!this._isPresenting) return;
    const area = document.getElementById('p3-preview-area');
    const card = document.getElementById('p3-slide-card');
    if (!area || !card) return;
    const bw = this._presentBaseW || 720;
    const bh = this._presentBaseH || 405;
    const scale = Math.min(area.clientWidth / bw, area.clientHeight / bh);
    card.style.transform = `translate(-50%, -50%) scale(${scale})`;
  },

  async togglePresentation() {
    if (!this.slides.length) return;
    const area = document.getElementById('p3-preview-area');
    if (!area) return;
    this.bindPresentationHotkeys();
    if (document.fullscreenElement === area) {
      if (document.exitFullscreen) await document.exitFullscreen();
      return;
    }
    if (area.requestFullscreen) await area.requestFullscreen();
  },

  // ── Element-level tooltip (click anywhere on slide to edit) ─────────────
  initElementTooltip() {
    const tip = document.getElementById('el-tooltip');
    const tipLabel = document.getElementById('el-tooltip-label');
    const tipRef = document.getElementById('el-tooltip-ref');
    const tipInput = document.getElementById('el-tooltip-input');
    const tipApply = document.getElementById('el-tooltip-apply');
    const tipCancel = document.getElementById('el-tooltip-cancel');
    const tipClose = document.getElementById('el-tooltip-close');

    // What the user clicked — stored for applyElementEdit
    let _clickCtx = null; // { field, label, currentText, clickX, clickY }

    const hideTip = () => {
      tip.classList.remove('visible');
      // Remove selected highlight from any previously highlighted element
      document.querySelectorAll('.el-selected').forEach(el => el.classList.remove('el-selected'));
      tipInput.value = '';
      _clickCtx = null;
    };

    // Helper: infer label + field from what was clicked
    const inferTarget = (target, cardRect) => {
      // Walk up from the clicked element to find the nearest meaningful one
      const fieldEl = target.closest('[data-field]');
      if (fieldEl) {
        return {
          field: fieldEl.dataset.field,
          label: fieldEl.dataset.label || fieldEl.dataset.field,
          currentText: fieldEl.textContent.trim().slice(0, 120),
          highlightEl: fieldEl,
        };
      }
      // Image element
      if (target.closest('img') || target.tagName === 'IMG') {
        return { field: 'image_prompt', label: 'Background image', currentText: '', highlightEl: target.closest('img') || target };
      }
      // Try to infer from position on slide (top/middle/bottom + left/right)
      const clickX = (target.getBoundingClientRect().left + target.getBoundingClientRect().width / 2 - cardRect.left) / cardRect.width;
      const clickY = (target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 - cardRect.top) / cardRect.height;
      const vert = clickY < 0.33 ? 'top' : clickY < 0.67 ? 'middle' : 'bottom';
      const horiz = clickX < 0.5 ? 'left' : 'right';
      return {
        field: null,
        label: `${vert}-${horiz} area`,
        currentText: target.textContent?.trim().slice(0, 80) || '',
        highlightEl: target,
        positionHint: `${vert} ${horiz} area of the slide`,
      };
    };

    // Position tooltip near the click point
    const positionTip = (clickX, clickY) => {
      const tipW = 280;
      const tipH = 220;
      const arrow = document.getElementById('el-tooltip-arrow');
      let left = clickX - tipW / 2;
      let top = clickY + 16;
      // Keep within viewport
      if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
      if (left < 8) left = 8;
      // Flip above if too close to bottom
      if (top + tipH > window.innerHeight - 8) {
        top = clickY - tipH - 16;
        arrow.style.top = 'auto'; arrow.style.bottom = '-6px';
        arrow.style.transform = 'rotate(225deg)';
      } else {
        arrow.style.top = '-6px'; arrow.style.bottom = 'auto';
        arrow.style.transform = 'rotate(45deg)';
      }
      const arrowLeft = Math.min(Math.max(clickX - left - 5, 10), tipW - 20);
      arrow.style.left = arrowLeft + 'px';
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    };

    // Main click handler — fires on ANY click inside the slide card
    const card = document.getElementById('p3-slide-card');
    card.addEventListener('click', e => {
      // Ignore clicks inside the tooltip itself
      if (tip.contains(e.target)) return;
      // Inline text edit: do not open AI tooltip
      if (e.target.closest('.slide-editable')) return;
      // Image placeholder and its buttons: let them fire natively
      if (e.target.closest('.img-placeholder')) return;
      // Layout picker popup: do not close it via this handler
      if (e.target.closest('#layout-picker-popup')) return;
      e.stopPropagation();

      if (!this.slides.length) return;

      const cardRect = card.getBoundingClientRect();
      const ctx = inferTarget(e.target, cardRect);

      // Highlight the clicked element
      document.querySelectorAll('.el-selected').forEach(el => el.classList.remove('el-selected'));
      if (ctx.highlightEl) ctx.highlightEl.classList.add('el-selected');

      _clickCtx = { ...ctx, clickX: e.clientX, clickY: e.clientY };

      // Populate tooltip header
      tipLabel.textContent = ctx.label;
      tipRef.textContent = ctx.currentText || '(click to describe your change)';
      tipInput.value = '';
      tipInput.placeholder = ctx.field === 'image_prompt'
        ? 'Describe the image you want…'
        : 'Describe your change — e.g. "make this bolder" or "use a specific stat"';

      positionTip(e.clientX, e.clientY);
      tip.classList.add('visible');
      setTimeout(() => tipInput.focus(), 50);
    });

    // Close on click outside the card and tooltip
    document.addEventListener('click', e => {
      if (!tip.contains(e.target) && !card.contains(e.target)) hideTip();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && tip.classList.contains('visible')) hideTip();
    });

    // Enter to apply
    tipInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.applyElementEdit(_clickCtx, tipInput.value, hideTip); }
    });

    tipApply.addEventListener('click', () => this.applyElementEdit(_clickCtx, tipInput.value, hideTip));
    tipCancel.addEventListener('click', hideTip);
    tipClose.addEventListener('click', hideTip);

    card.addEventListener(
      'blur',
      (e) => {
        const el = e.target.closest('.slide-editable[data-field]');
        if (!el) return;
        this.commitPhase3InlineEdit(el);
      },
      true
    );
  },

  commitPhase3InlineEdit(el) {
    const field = el.getAttribute('data-field');
    if (!field) return;

    // If this field was provisional, save the displayed/edited value to slide state
    // so future renderSlide() calls no longer see <<REPLACE:...>> for this field
    if (el.getAttribute('data-provisional') === 'true') {
      el.classList.remove('ph-provisional');
      el.removeAttribute('data-provisional');
      el.removeAttribute('title');
    }

    App.syncSlideTextToBothPhases(this.cur, field, el.innerText);
    const s = this.slides[this.cur];
    if (field === 'title' && s) {
      const strip = document.getElementById('p3-thumbs');
      const t = strip && strip.querySelectorAll('.p3-thumb')[this.cur];
      if (t) {
        const lbl = t.querySelector('.p3-thumb-label');
        if (lbl) lbl.textContent = s.title || `Slide ${this.cur + 1}`;
      }
      const badge =
        (s.title || '').trim() ||
        (App.state.deckName || '').trim() ||
        (App.state.wireframeSlides?.[0]?.title || '').trim() ||
        'Deck';
      const elBadge = document.getElementById('p3-badge');
      if (elBadge) elBadge.textContent = `${badge} · ${this.slides.length} slides`;
    }
  },

  async applyElementEdit(ctx, request, hideTip) {
    if (!ctx || !request.trim() || this.busy) return;

    const slideIdx = this.cur;
    const slide = this.slides[slideIdx];
    if (!slide) return;

    const applyBtn = document.getElementById('el-tooltip-apply');
    applyBtn.disabled = true;
    applyBtn.textContent = '…';
    this.busy = true;

    const isPSBrand = (App.state.brand.designMode || 'ps-brand') === 'ps-brand';
    const { image_data_url: _img, ...slideForPrompt } = slide; // eslint-disable-line no-unused-vars

    // Build a targeted description of what to change
    const targetDesc = ctx.field
      ? `The user clicked on the "${ctx.label}" element (field key: "${ctx.field}"). Current value: "${ctx.currentText}".`
      : `The user clicked on the ${ctx.positionHint || ctx.label} of the slide. Nearby text: "${ctx.currentText}".`;

    const prompt =
      `You are editing one slide of a presentation deck based on a targeted user request.\n\n` +
      `CURRENT SLIDE (slide ${slideIdx + 1} of ${this.slides.length}):\n${JSON.stringify(slideForPrompt, null, 2)}\n\n` +
      `WHAT THE USER CLICKED: ${targetDesc}\n` +
      `USER'S REQUESTED CHANGE: "${request.trim()}"\n\n` +
      `BRAND: ${isPSBrand ? 'Publicis Sapient (red #E2231A, white bg, Lexend Deca headlines, Roboto body)' : `Primary ${App.state.brand.primaryColor}`}\n\n` +
      `INSTRUCTIONS:\n` +
      `- Apply the user's change to the most relevant field(s) based on what they clicked.\n` +
      `- If they clicked an image area, update image_prompt.\n` +
      `- Keep all other fields exactly as-is.\n` +
      `- For body arrays, return the full updated array.\n` +
      `- No markdown. No explanation.\n\n` +
      `RESPOND WITH VALID JSON ONLY — the complete updated slide object:\n` +
      `{ "title": "...", "subtitle": "...", "headline": "...", "body": [...], "stat1_value": "...", "stat1_label": "...", "stat2_value": "...", "stat2_label": "...", "cta": "...", "layout": "...", "image_prompt": "..." }`;

    try {
      const data = await App.callChat(prompt);
      const updated = data.slides ? data.slides[0] : data;
      if (updated && typeof updated === 'object') {
        if (slide.image_data_url && !updated.image_data_url) updated.image_data_url = slide.image_data_url;
        this.slides[slideIdx] = updated;
        App.state.generatedSlides = this.slides;
        this.renderSlide(slideIdx);
        this.renderThumbs();
        this.addChatMsg('ai', `Updated "${ctx.label}" on slide ${slideIdx + 1}.`);
      } else {
        this.addChatMsg('ai', 'Could not apply that change. Try rephrasing.');
      }
    } catch (err) {
      this.addChatMsg('ai', 'Edit failed: ' + err.message);
    } finally {
      this.busy = false;
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply ✦';
      hideTip();
    }
  },

  // ── File attachments ──────────────────────────────────────────────────────
  async handleAttach(files) {
    if (!files.length) return;
    if (!this._chatFiles) this._chatFiles = [];

    for (const file of files) {
      const chipId = 'p3fc-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      this.addFileChip(file.name, chipId);
      try {
        let content = '';
        if (file.type.startsWith('image/')) {
          content = `[Image file: ${file.name} — reference in the deck visually as appropriate]`;
        } else {
          const result = await App.extractDoc(file);
          content = result.text ? result.text.slice(0, 8000) : `[${file.name} — no text extracted]`;
        }
        this._chatFiles.push({ name: file.name, content });
        this.updateFileChip(chipId, '✓');
      } catch {
        this.updateFileChip(chipId, '✗');
      }
    }
  },

  addFileChip(name, id) {
    const bar = document.getElementById('p3-chat-files');
    const chip = document.createElement('div');
    chip.className = 'chat-file-chip';
    chip.id = id;
    chip.innerHTML = `<span>${name.length > 22 ? name.slice(0,21)+'…' : name}</span><span style="color:var(--text3);font-size:9px;margin-left:3px" class="fc-status">…</span><button onclick="Phase3.removeFileChip('${id}')">×</button>`;
    bar.appendChild(chip);
  },

  updateFileChip(id, status) {
    const chip = document.getElementById(id);
    if (chip) { const s = chip.querySelector('.fc-status'); if (s) s.textContent = status; }
  },

  removeFileChip(id) {
    document.getElementById(id)?.remove();
  },

  // ── Brand panel ──────────────────────────────────────────────────────────
  renderBrandPanel() {
    const inner = document.getElementById('p3-brand-inner');
    const mode = App.state.brand.designMode || 'ps-brand';

    inner.innerHTML = `
      <div class="sec-lbl" style="margin-top:0">Design Template</div>
      <div class="design-mode-toggle">
        <button class="dmt-btn${mode === 'ps-brand' ? ' sel' : ''}" onclick="Phase3.setDesignMode('ps-brand')">
          <span class="dmt-icon">🔴</span>
          <span class="dmt-lbl">Publicis Sapient</span>
          <span class="dmt-sub">Official PS template</span>
        </button>
        <button class="dmt-btn${mode === 'custom' ? ' sel' : ''}" onclick="Phase3.setDesignMode('custom')">
          <span class="dmt-icon">🎨</span>
          <span class="dmt-lbl">Custom Design</span>
          <span class="dmt-sub">Your own art direction</span>
        </button>
      </div>

      <div class="sec-lbl" style="margin-top:4px">Brand Identity</div>

      <div class="b-field">
        <label>Client / brand name</label>
        <input type="text" id="b-client" placeholder="e.g. Emirates, Nike, HSBC" oninput="App.state.brand.clientName=this.value">
      </div>

      <div class="b-field">
        <label>Logo</label>
        <div class="logo-upload" onclick="document.getElementById('b-logo-inp').click()">
          <div id="logo-preview">🏢</div>
          <span><strong>Upload logo</strong> · PNG, SVG, JPG</span>
        </div>
        <input type="file" id="b-logo-inp" accept=".png,.svg,.jpg,.jpeg,.webp" style="display:none" onchange="Phase3.handleLogo(this)">
      </div>

      <div id="b-custom-fields">
        <div class="b-field">
          <label>Brand website</label>
          <div class="b-brand-url-row">
            <input type="url" id="b-brand-url" placeholder="https://www.example.com" autocomplete="url"
              oninput="App.state.brand.brandWebsiteUrl=this.value">
            <button type="button" id="b-brand-url-btn" class="b-brand-analyze-btn" onclick="Phase3.analyzeBrandSite()">Analyze site</button>
          </div>
          <small id="b-brand-url-hint" class="b-brand-url-hint">Paste your marketing site URL. We fetch public HTML/CSS to suggest colors, a font, and a visual template.</small>
        </div>

        <div class="b-field">
          <label>Brand colors</label>
          <div id="b-colors"></div>
          <button class="add-color-btn" style="margin-top:6px" onclick="Phase3.addColorRow()">+ Add color</button>
        </div>

        <div class="b-field">
          <label>Font preference</label>
          <div class="b-font-picker" id="b-font-picker">
            <button type="button" class="b-font-trigger" id="b-font-trigger" aria-expanded="false" aria-haspopup="listbox">
              <span class="b-font-trigger-label" id="b-font-trigger-label">Default (system)</span>
              <span class="b-font-trigger-caret" aria-hidden="true">▾</span>
            </button>
            <div class="b-font-dropdown" id="b-font-dropdown" hidden>
              <input type="search" class="b-font-search" id="b-font-search" placeholder="Search fonts…" autocomplete="off" />
              <div class="b-font-list" id="b-font-list" role="listbox" aria-labelledby="b-font-trigger"></div>
            </div>
          </div>
        </div>

        <div class="sec-lbl">Visual Style</div>
        <div id="art-rec"></div>
        <div class="presets-grid" id="b-presets"></div>
      </div>

      <div id="b-ps-info" style="display:none">
        <div class="ps-brand-info">
          <div class="ps-bi-row">
            <div class="ps-swatch" style="background:#E2231A"></div>
            <span class="ps-bi-txt"><strong>Headline font:</strong> Lexend Deca Bold</span>
          </div>
          <div class="ps-bi-row">
            <div class="ps-swatch" style="background:#111111"></div>
            <span class="ps-bi-txt"><strong>Body font:</strong> Roboto Regular</span>
          </div>
          <div class="ps-bi-row">
            <div class="ps-swatch" style="background:#E2231A"></div>
            <span class="ps-bi-txt"><strong>Primary:</strong> Publicis Red #E2231A</span>
          </div>
          <div class="ps-bi-row">
            <div class="ps-swatch" style="background:#FFFFFF;border-color:rgba(255,255,255,0.4)"></div>
            <span class="ps-bi-txt"><strong>Background:</strong> White #FFFFFF</span>
          </div>
        </div>
      </div>

    `;

    this._colorRows = [];
    this._applyDesignModeVisibility(mode);

    if (mode === 'custom') {
      const br = App.state.brand;
      const savedExtras = [...(br.extraColors || [])];
      br.extraColors = [];
      this.addColorRow(br.primaryColor || '#7c6af7', 'Primary');
      this.addColorRow(br.accentColor || '#ffffff', 'Accent');
      savedExtras.forEach((c) => this.addColorRow(c.hex, c.label || ''));
      this.renderPresets();
    }

    this.hydrateBrandFields();
  },

  setDesignMode(mode) {
    App.state.brand.designMode = mode;
    // Update toggle button states
    document.querySelectorAll('.dmt-btn').forEach(btn => btn.classList.remove('sel'));
    const btns = document.querySelectorAll('.dmt-btn');
    if (mode === 'ps-brand' && btns[0]) btns[0].classList.add('sel');
    if (mode === 'custom' && btns[1]) btns[1].classList.add('sel');

    this._applyDesignModeVisibility(mode);

    if (mode === 'custom' && this._colorRows.length === 0) {
      const br = App.state.brand;
      const savedExtras = [...(br.extraColors || [])];
      br.extraColors = [];
      this.addColorRow(br.primaryColor || '#7c6af7', 'Primary');
      this.addColorRow(br.accentColor || '#ffffff', 'Accent');
      savedExtras.forEach((c) => this.addColorRow(c.hex, c.label || ''));
      this.renderPresets();
    }
  },

  _applyDesignModeVisibility(mode) {
    const customFields = document.getElementById('b-custom-fields');
    const psInfo = document.getElementById('b-ps-info');
    if (customFields) customFields.style.display = mode === 'custom' ? '' : 'none';
    if (psInfo) psInfo.style.display = mode === 'ps-brand' ? '' : 'none';
  },

  hydrateBrandFields() {
    const bc = document.getElementById('b-client');
    if (bc) bc.value = App.state.brand.clientName || '';
    const bu = document.getElementById('b-brand-url');
    if (bu) bu.value = App.state.brand.brandWebsiteUrl || '';
    this.initFontPicker();
    const prev = document.getElementById('logo-preview');
    if (prev) {
      if (App.state.brand.logoDataUrl) {
        prev.innerHTML = `<img src="${App.state.brand.logoDataUrl}" style="width:100%;height:100%;object-fit:contain;border-radius:4px;">`;
      } else {
        prev.innerHTML = '🏢';
      }
    }
  },

  initFontPicker() {
    const root = document.getElementById('b-font-picker');
    if (!root) return;
    const trigger = document.getElementById('b-font-trigger');
    const dropdown = document.getElementById('b-font-dropdown');
    const list = document.getElementById('b-font-list');
    const search = document.getElementById('b-font-search');
    if (!trigger || !dropdown || !list) return;

    if (this._fontPickerObserver) {
      this._fontPickerObserver.disconnect();
      this._fontPickerObserver = null;
    }
    if (this._fontPickerOutsideHandler) {
      document.removeEventListener('click', this._fontPickerOutsideHandler);
      this._fontPickerOutsideHandler = null;
    }
    if (this._fontPickerEscapeHandler) {
      document.removeEventListener('keydown', this._fontPickerEscapeHandler);
      this._fontPickerEscapeHandler = null;
    }

    const opts = this.getGoogleFontOptions();
    const current = App.state.brand.font || '';
    let merged = opts.slice();
    if (current && !merged.some((o) => o.value === current)) {
      merged = [{ value: current, label: current }, ...merged.filter((o) => o.value !== current)];
    }

    const sampleText = 'The quick brown fox jumps over the lazy dog';
    list.innerHTML = merged
      .map((o) => {
        const v = o.value;
        const escAttr = this._escHtml(v);
        const meta = v || 'Default (system)';
        const style = v
          ? `font-family:'${this._cssFontFamilyEscape(v)}', sans-serif`
          : 'font-family:inherit';
        const mainText = v ? sampleText : 'Uses your system UI fonts (no webfont).';
        const searchBlob = `${meta} ${(o.label || '').toLowerCase()} default system`.toLowerCase();
        return `<button type="button" class="b-font-row" role="option" data-value="${escAttr}" data-search="${this._escHtml(searchBlob)}">
          <span class="b-font-row-main" style="${style}">${this._escHtml(mainText)}</span>
          <span class="b-font-row-meta">${this._escHtml(meta)}</span>
        </button>`;
      })
      .join('');

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (!ent.isIntersecting) continue;
          const row = ent.target;
          const val = row.getAttribute('data-value');
          if (val && window.loadGoogleFontFamily) window.loadGoogleFontFamily(val);
        }
      },
      { root: list, rootMargin: '120px 0px', threshold: 0.01 }
    );
    list.querySelectorAll('.b-font-row').forEach((row) => io.observe(row));
    this._fontPickerObserver = io;

    trigger.onclick = (e) => {
      e.stopPropagation();
      this.toggleFontPicker();
    };
    dropdown.onclick = (e) => e.stopPropagation();

    search.oninput = () => this.filterFontPicker(search.value);

    list.onclick = (e) => {
      const row = e.target.closest('.b-font-row');
      if (!row) return;
      const val = row.getAttribute('data-value');
      this.setBrandFont(val != null ? val : '');
      this.closeFontPicker();
    };

    this._fontPickerOutsideHandler = (e) => {
      if (!this._fontPickerOpen) return;
      if (e.target.closest && e.target.closest('#b-font-picker')) return;
      this.closeFontPicker();
    };
    document.addEventListener('click', this._fontPickerOutsideHandler);

    this._fontPickerEscapeHandler = (e) => {
      if (e.key === 'Escape' && this._fontPickerOpen) this.closeFontPicker();
    };
    document.addEventListener('keydown', this._fontPickerEscapeHandler);

    this.updateFontPickerTrigger();
    this.updateFontPickerSelection();
  },

  toggleFontPicker() {
    const dd = document.getElementById('b-font-dropdown');
    const tr = document.getElementById('b-font-trigger');
    const list = document.getElementById('b-font-list');
    const search = document.getElementById('b-font-search');
    if (!dd || !tr) return;
    const willOpen = !!dd.hidden;
    dd.hidden = !willOpen;
    this._fontPickerOpen = willOpen;
    tr.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) {
      if (search) {
        search.value = '';
        this.filterFontPicker('');
        setTimeout(() => search.focus(), 0);
      }
      const sel = list && list.querySelector('.b-font-row.sel');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  },

  closeFontPicker() {
    const dd = document.getElementById('b-font-dropdown');
    const tr = document.getElementById('b-font-trigger');
    if (dd) dd.hidden = true;
    if (tr) tr.setAttribute('aria-expanded', 'false');
    this._fontPickerOpen = false;
  },

  filterFontPicker(q) {
    const qn = (q || '').trim().toLowerCase();
    const list = document.getElementById('b-font-list');
    if (!list) return;
    list.querySelectorAll('.b-font-row').forEach((row) => {
      const blob = (row.getAttribute('data-search') || '').toLowerCase();
      row.style.display = !qn || blob.includes(qn) ? '' : 'none';
    });
  },

  updateFontPickerTrigger() {
    const el = document.getElementById('b-font-trigger-label');
    if (!el) return;
    const v = App.state.brand.font || '';
    if (!v) {
      el.textContent = 'Default (system)';
      el.style.fontFamily = 'inherit';
      return;
    }
    el.textContent = v;
    el.style.fontFamily = `'${this._cssFontFamilyEscape(v)}', sans-serif`;
    if (window.loadGoogleFontFamily) window.loadGoogleFontFamily(v);
  },

  updateFontPickerSelection() {
    const v = App.state.brand.font || '';
    const list = document.getElementById('b-font-list');
    if (!list) return;
    list.querySelectorAll('.b-font-row').forEach((row) => {
      const rv = row.getAttribute('data-value');
      const match = (rv || '') === v;
      row.classList.toggle('sel', match);
      row.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  },

  async analyzeBrandSite() {
    const inp = document.getElementById('b-brand-url');
    const btn = document.getElementById('b-brand-url-btn');
    const hint = document.getElementById('b-brand-url-hint');
    const raw = (inp?.value || App.state.brand.brandWebsiteUrl || '').trim();
    if (!raw) {
      if (hint) hint.textContent = 'Enter a public https URL first.';
      return;
    }
    let url = raw;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    if (btn) btn.disabled = true;
    if (hint) hint.textContent = 'Fetching and analyzing the page…';

    try {
      const res = await fetch('/api/brand-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not analyze this URL.');

      App.state.brand.brandWebsiteUrl = data.url || url;
      if (inp) inp.value = App.state.brand.brandWebsiteUrl;

      App.state.brand.primaryColor = data.primaryColor || App.state.brand.primaryColor;
      App.state.brand.accentColor = data.accentColor || App.state.brand.accentColor;
      App.state.brand.font = typeof data.font === 'string' ? data.font : '';
      App.state.brand.artPresetId = data.artPresetId || App.state.brand.artPresetId;
      App.state.brand.extraColors = Array.isArray(data.extraColors) ? data.extraColors : [];

      this.renderBrandPanel();
      const hintEl = document.getElementById('b-brand-url-hint');
      if (hintEl) {
        const ex = [data.pageTitle ? `“${data.pageTitle}”` : '', data.rationale || ''].filter(Boolean).join(' — ');
        hintEl.textContent = ex || 'Suggested styles applied. Tweak colors or template below if needed.';
      }
    } catch (e) {
      if (hint) hint.textContent = String(e.message || e);
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  handleLogo(inp) {
    const file = inp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      App.state.brand.logoDataUrl = e.target.result;
      const prev = document.getElementById('logo-preview');
      if (prev) prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;border-radius:4px;">`;
    };
    reader.readAsDataURL(file);
  },

  addColorRow(hex, label) {
    hex = hex || '#ffffff';
    label = label || '';
    const idx = this._colorRows.length;
    this._colorRows.push({ hex, label });

    if (idx === 0) App.state.brand.primaryColor = hex;
    else if (idx === 1) App.state.brand.accentColor = hex;
    else App.state.brand.extraColors.push({ hex, label });

    const container = document.getElementById('b-colors');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'color-row';
    row.dataset.idx = idx;
    row.innerHTML = `
      <input type="color" value="${hex}" onchange="Phase3.updateColor(${idx},this.value)">
      <input type="text" placeholder="${label || 'Label'}" value="${label}" oninput="Phase3.updateColorLabel(${idx},this.value)">
      ${idx > 1 ? `<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;padding:0;line-height:1" onclick="Phase3.removeColorRow(this,${idx})">×</button>` : ''}`;
    container.appendChild(row);
    this.recommendPreset();
  },

  updateColor(idx, hex) {
    if (this._colorRows[idx]) this._colorRows[idx].hex = hex;
    if (idx === 0) { App.state.brand.primaryColor = hex; this.recommendPreset(); }
    else if (idx === 1) App.state.brand.accentColor = hex;
    else if (App.state.brand.extraColors[idx - 2]) App.state.brand.extraColors[idx - 2].hex = hex;
  },

  updateColorLabel(idx, label) {
    if (this._colorRows[idx]) this._colorRows[idx].label = label;
    if (idx >= 2 && App.state.brand.extraColors[idx - 2]) App.state.brand.extraColors[idx - 2].label = label;
  },

  removeColorRow(btn, idx) {
    btn.closest('.color-row')?.remove();
    if (idx >= 2) App.state.brand.extraColors.splice(idx - 2, 1);
  },

  recommendPreset() {
    const hex = App.state.brand.primaryColor.replace('#', '');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    const brightness = 0.299*r + 0.587*g + 0.114*b;
    let rec = 'cinematic-dark';
    if (brightness > 180) rec = 'clean-executive';
    else if (brightness > 100) rec = 'warm-human';
    else if (r > g + 40) rec = 'bold-editorial';

    App.state.brand.artPresetId = rec;
    this.renderPresets();

    const recEl = document.getElementById('art-rec');
    if (recEl) {
      const preset = this.ART_PRESETS.find(p => p.id === rec);
      recEl.textContent = preset ? `✦ Recommended: ${preset.label}` : '';
    }
  },

  renderPresets() {
    const grid = document.getElementById('b-presets');
    if (!grid) return;
    grid.innerHTML = '';
    this.ART_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      const sel = preset.id === App.state.brand.artPresetId;
      btn.className = 'preset-btn' + (sel ? ' sel' : '');
      const swatchSegs = preset.palette.slice(0, 4).map(c =>
        `<div class="preset-swatch-seg" style="background:${c}"></div>`
      ).join('');
      btn.innerHTML = `<div class="preset-swatch">${swatchSegs}</div><span class="pn">${preset.label}</span>`;
      btn.onclick = () => {
        App.state.brand.artPresetId = preset.id;
        this.renderPresets();
      };
      grid.appendChild(btn);
    });
  },

  renderTones() {
    const list = document.getElementById('b-tones');
    if (!list) return;
    list.innerHTML = '';
    const descriptors = {
      warm:      'Empathy-first, human, partner voice',
      data:      'Specific, quantified, numbers-led',
      visionary: 'Cinematic, quotable, manifesto energy',
      executive: 'Sharp, no preamble, one idea per line',
      punchy:    'Short sentences, active voice, zero filler',
    };
    this.TONE_OPTIONS.forEach(tone => {
      const btn = document.createElement('button');
      const sel = tone.id === App.state.brand.toneId;
      btn.className = 'tone-btn' + (sel ? ' sel' : '');
      btn.innerHTML = `<div class="tn">${tone.label}</div><div class="td">${descriptors[tone.id] || ''}</div>`;
      btn.onclick = () => {
        App.state.brand.toneId = tone.id;
        list.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
      };
      list.appendChild(btn);
    });
  },

  /**
   * Keep all agreed structure text from Phase 2.
   * We only let Phase 3 generation provide visual/media fields.
   */
  applyWireframeTextLock(slides, wireframe) {
    if (!Array.isArray(slides) || !Array.isArray(wireframe) || !wireframe.length) return slides || [];
    const byTitle = new Map(
      wireframe
        .filter(s => s && s.title)
        .map(s => [String(s.title).trim().toLowerCase(), s])
    );
    const textKeys = [
      'title', 'subtitle', 'headline', 'body',
      'stat1_label', 'stat1_value', 'stat2_label', 'stat2_value',
      'stat3_label', 'stat3_value', 'cta', 'layout'
    ];
    return slides.map((sl, i) => {
      const wf =
        wireframe[i] ||
        byTitle.get(String(sl?.title || '').trim().toLowerCase()) ||
        null;
      if (!wf) return sl;
      const out = { ...(sl || {}) };
      for (const k of textKeys) {
        if (wf[k] !== undefined) out[k] = k === 'body' ? [...(wf.body || [])] : wf[k];
      }
      if (!Array.isArray(out.body)) out.body = [];
      return out;
    });
  },

  // ── Design system prompt loader ──────────────────────────────────────────
  async fetchDesignSystemPrompt(id) {
    try {
      const res = await fetch(`/api/design-system-prompt/${encodeURIComponent(id)}`);
      const data = await res.json();
      return data.content || '';
    } catch {
      return '';
    }
  },

  // ── PS layout type assignment ─────────────────────────────────────────────
  /**
   * Assign a layoutType from the PS design system catalog to each slide.
   * Runs after generation. Skips slides that already have layoutType set by the LLM.
   * Also sets skipImage=true for layouts that have no image slot per ps.md rules.
   */
  assignPSLayoutType(slides) {
    if (!Array.isArray(slides)) return slides;

    const ARCH_KW   = /architecture|system|platform|infrastructure|integration|api|data.layer|stack|orchestration|tech|pipeline/i;
    const SOLUTION_KW = /our solution|proposed solution|our approach|our platform|operating model|solution overview/i;
    const PILLAR_KW = /pillar|capability|workstream|component|module|dimension|service line/i;
    const CASE_KW   = /case study|proof|evidence|reference|client story|in action|client.name/i;
    const TABLE_KW  = /governance|scope|matrix|comparison|commercial|pricing|model|schedule|roadmap|timeline|milestone|phase\s/i;
    const CHART_KW  = /chart|trend|benchmark|adoption|performance|analytics|graph|data/i;
    const CLOSE_KW  = /next step|ask|recommendation|commit|together|partnership|let.s|close|ready|moving forward/i;
    const AGENDA_KW = /agenda|contents|table of content/i;

    // Layouts that never have an image slot per ps.md
    const NO_IMAGE_LAYOUTS = new Set([
      'section-divider', 'headline-only', 'agenda-list', 'one-column-narrative',
      'stat-impact', 'table-structured', 'closing-commitment',
    ]);

    return slides.map((slide, idx) => {
      const isFirst = idx === 0;
      const isLast  = idx === slides.length - 1;
      const type    = slide.type || 'content';
      const t       = ((slide.title || '') + ' ' + (slide.subtitle || '')).toLowerCase();
      const layout  = slide.layout || slide.render_layout || '';
      const hasStats = !!(slide.stat1_value && slide.stat2_value);

      // LLM already assigned one — just ensure skipImage is consistent
      if (slide.layoutType) {
        const lt = slide.layoutType;
        return NO_IMAGE_LAYOUTS.has(lt)
          ? { ...slide, skipImage: true }
          : slide;
      }

      let layoutType;

      if (isFirst || type === 'title') {
        layoutType = 'title-hero';
      } else if (type === 'divider') {
        layoutType = 'section-divider';
      } else if (isLast) {
        layoutType = 'closing-commitment';
      } else if (hasStats || layout === 'stats') {
        layoutType = 'stat-impact';
      } else if (AGENDA_KW.test(t)) {
        layoutType = 'agenda-list';
      } else if (ARCH_KW.test(t)) {
        layoutType = 'architecture-diagram';
      } else if (SOLUTION_KW.test(t)) {
        layoutType = 'solution-hero';
      } else if (PILLAR_KW.test(t)) {
        layoutType = 'pillar-detail';
      } else if (CASE_KW.test(t)) {
        layoutType = 'case-study-psi';
      } else if (TABLE_KW.test(t)) {
        layoutType = 'table-structured';
      } else if (CHART_KW.test(t)) {
        layoutType = 'chart-insight';
      } else if (CLOSE_KW.test(t)) {
        layoutType = 'closing-commitment';
      } else if (layout === 'bullets' || (!slide.hasImage && !(slide.body || []).length)) {
        layoutType = 'one-column-narrative';
      } else {
        layoutType = 'two-column-content';
      }

      const skipImage = NO_IMAGE_LAYOUTS.has(layoutType) ? true : slide.skipImage;
      return { ...slide, layoutType, skipImage: skipImage ?? slide.skipImage };
    });
  },

  // ── Generate cinematic deck ───────────────────────────────────────────────
  async generateDeck() {
    if (this.busy) return;
    this.busy = true;
    this._overflowProcessed = new Set(); // fresh run — allow overflow handling on all slides

    const genBtn = document.getElementById('p3-gen');
    genBtn.disabled = true;
    genBtn.textContent = '⏳ Generating…';

    this.showPreviewGenerating();

    const brand = App.state.brand;
    const isPSBrand = (brand.designMode || 'ps-brand') === 'ps-brand';
    const wireframe = App.state.wireframeSlides;
    const art = isPSBrand
      ? { label: 'Publicis Sapient', style: this.PS_BRAND.style }
      : (this.ART_PRESETS.find(p => p.id === brand.artPresetId) || this.ART_PRESETS[0]);
    const tone = this.TONE_OPTIONS.find(t => t.id === brand.toneId) || this.TONE_OPTIONS[2];
    const ctx = App.state.phase1Context || '';

    const knowledge = await Phase2.loadKnowledge();
    const knowledgeBlock = Phase2._buildKnowledgeBlock(knowledge);
    const brain = App.state.brain;
    const brainBlock = (brain && window.GenerationBrain) ? GenerationBrain.toPromptBlock(brain) : '';

    // Fetch PS design system prompt when PS brand is active
    const designSystemBlock = isPSBrand ? await this.fetchDesignSystemPrompt('ps') : '';

    const psLayoutInstruction = isPSBrand
      ? `- Each slide MUST include a "layoutType" field chosen from the PS design system catalog:\n` +
        `  title-hero, agenda-list, section-divider, one-column-narrative, two-column-content,\n` +
        `  solution-hero, pillar-detail, architecture-diagram, stat-impact, case-study-psi,\n` +
        `  table-structured, chart-insight, image-headline, headline-only, closing-commitment\n` +
        `- Match layoutType to slide intent per the PS Design System rules above\n` +
        `- Only include image_prompt on slides where an image is truly needed per the layout\n`
      : '';

    const prompt =
      `Generate a complete presentation deck.\n\n` +
      `DECK TYPE: ${App.state.confirmedDeckTypeName || App.state.confirmedDeckType || 'Presentation'}\n\n` +
      `BRAND IDENTITY:\n` +
      `- Client/Brand: ${brand.clientName || 'Not specified'}\n` +
      (isPSBrand
        ? `- Design template: Publicis Sapient official brand\n` +
          `- Primary color: #E2231A (Publicis Red)\n` +
          `- Background: #FFFFFF (white)\n` +
          `- Headline font: Lexend Deca Bold\n` +
          `- Body font: Roboto\n`
        : `- Primary color: ${brand.primaryColor}\n` +
          `- Accent color: ${brand.accentColor}\n` +
          (brand.extraColors.length ? `- Extra colors: ${brand.extraColors.map(c=>c.hex+(c.label?` (${c.label})`:'')).join(', ')}\n` : '') +
          `- Font: ${brand.font || 'Not specified'}\n`) +
      `- Art direction: ${art.label} — ${art.style}\n` +
      `- Tone of voice: ${tone.label} — ${tone.guide}\n\n` +
      (designSystemBlock ? `PS DESIGN SYSTEM:\n${designSystemBlock}\n\n` : '') +
      (knowledgeBlock ? `KNOWLEDGE BASE:\n${knowledgeBlock}\n\n` : '') +
      (brainBlock ? `${brainBlock}\n\n` : '') +
      `APPROVED WIREFRAME STRUCTURE:\n${JSON.stringify(wireframe, null, 2)}\n\n` +
      `ORIGINAL BRIEF:\n${ctx.slice(0, 2000)}\n\n` +
      `INSTRUCTIONS:\n` +
      `- Keep ALL existing slide titles, headlines, body copy, and stats exactly as in the wireframe\n` +
      `- Every slide MUST have a headline. Never return a slide with a missing or empty headline.\n` +
      psLayoutInstruction +
      `- ADD to each slide: image_prompt and image_style\n` +
      `- image_prompt: 1–2 sentences describing a specific visual for this slide's message. No text, no logos.\n` +
      `- Art style for all visuals: ${art.style}\n` +
      `- NEVER output <<REPLACE:...>> or [INPUT REQUIRED]. If a specific fact is missing, use directional language:\n` +
      `  Examples: "significant cost reduction", "double-digit efficiency gain", "substantial time savings", "up to X% based on comparable programmes"\n` +
      `- Synthesis sections (Our Solution, Delivery, Platform): content must be tailored to this client. No generic company brochure copy.\n` +
      `- Retrieval sections (Why Publicis Sapient, Our Team): draw from knowledge base. Company capabilities and credentials belong here only.\n` +
      `- Team slides: factual descriptions only. No CTA or promotional language. One overview slide if no bio data exists in brief.\n` +
      `- Closing section must appear before appendix. It must restate the central argument, state the ask, and define 2–3 next steps with timing.\n\n` +
      `RESPOND WITH VALID JSON ONLY:\n` +
      `{\n` +
      `  "slides": [{\n` +
      `    "type": "title|divider|content", "title": "...", "subtitle": "...", "headline": "...",\n` +
      `    "body": [...], "stat1_label": "...", "stat1_value": "...", "stat2_label": "...", "stat2_value": "...",\n` +
      `    "cta": "...", "layout": "hero|split|stats|bullets",\n` +
      (isPSBrand
        ? `    "layoutType": "title-hero|section-divider|one-column-narrative|two-column-content|solution-hero|pillar-detail|architecture-diagram|stat-impact|case-study-psi|table-structured|chart-insight|image-headline|headline-only|closing-commitment",\n`
        : '') +
      `    "image_prompt": "...", "image_style": "photoreal|3d|illustration|abstract|minimal"\n` +
      `  }],\n` +
      `  "theme": { "tagline": "memorable deck tagline", "tone": "${brand.toneId}", "artPreset": "${brand.artPresetId}" }\n` +
      `}`;

    try {
      const data = await App.callGenerate(prompt);
      if (!data.slides || !data.slides.length) throw new Error('No slides returned.');

      const rawSlides = (window.GenerationBrain && App.state.brain)
        ? GenerationBrain.enforceStructure(data.slides, App.state.brain)
        : data.slides;

      const lockedSlides = this.applyWireframeTextLock(rawSlides, wireframe);
      const classifiedSlides = this.classifySlides(lockedSlides);
      // Assign PS layout types after classification (PS brand only)
      this.slides = isPSBrand ? this.assignPSLayoutType(classifiedSlides) : classifiedSlides;
      App.state.generatedSlides = this.slides;
      App.state.deckName =
        (data.slides?.[0]?.title || '').trim() ||
        (brand.clientName || '').trim() ||
        App.state.confirmedDeckTypeName ||
        'Deck';
      this.cur = 0;
      App.state.p3Cur = 0;

      this.renderSlide(this.cur);
      this.renderThumbs();
      this.updateNavState();

      document.getElementById('p3-dl').disabled = false;
      document.getElementById('p3-chat-send').disabled = false;
      document.getElementById('p3-present').disabled = false;
      document.getElementById('p3-share').disabled = false;
      const deckName =
        (this.slides?.[0]?.title || '').trim() ||
        (App.state.deckName || '').trim() ||
        (App.state.wireframeSlides?.[0]?.title || '').trim() ||
        (App.state.brand?.clientName || '').trim() ||
        App.state.confirmedDeckTypeName ||
        App.state.confirmedDeckType ||
        'Deck';
      document.getElementById('p3-badge').textContent = `${deckName} · ${this.slides.length} slides`;

      this.addChatMsg('ai', `✦ ${this.slides.length} slides generated. Click through to review, or ask me to change anything — copy, structure, tone, stats. I'm here for all of it.`);

    } catch (err) {
      this.addChatMsg('ai', 'Generation failed: ' + err.message + '. Please try again.');
      if (this.slides.length) {
        this.renderSlide(this.cur);
        this.renderThumbs();
      } else {
        this.renderEmptyPreview();
      }
      this.updateNavState();
    } finally {
      this.busy = false;
      genBtn.disabled = false;
      genBtn.textContent = this.slides.length ? '↺ Regenerate' : '✦ Generate Deck';
    }
  },

  // ── Provisional content: <<REPLACE:...>> substitution ───────────────────

  /**
   * Convert a <<REPLACE: hint>> token into a plausible provisional value.
   * Deterministic (same hint always produces same value) so slides don't flicker.
   */
  _resolveToken(hint) {
    // Simple deterministic seed from hint string
    let seed = 0;
    for (let i = 0; i < hint.length; i++) seed += hint.charCodeAt(i) * (i + 1);
    const pick = (arr) => arr[Math.abs(seed) % arr.length];
    const h = hint.toLowerCase();

    // Use directional language — never bare numbers that look fabricated
    if (/percent|%|rate|increase|decrease|faster|slower|reduction|growth|uplift|improvement|efficiency/i.test(h)) {
      return pick(['significant improvement', 'double-digit efficiency gain', 'measurable uplift', 'substantial reduction', 'up to 40% improvement based on comparable programmes', 'meaningful acceleration']);
    }
    if (/roi|return|revenue|saving|cost|budget|invest|profit|value|ltv|arpu|nrr/i.test(h)) {
      return pick(['substantial cost avoidance', 'positive ROI within 12 months', 'significant value creation', 'material cost reduction', 'strong commercial return', 'measurable financial benefit']);
    }
    if (/time|speed|hour|day|week|month|deliver|deploy|launch|cycle|activat/i.test(h)) {
      return pick(['accelerated delivery timeline', 'within a single quarter', 'in weeks not months', 'rapid time-to-value', 'faster than traditional approaches', 'phased over a 6–9 month horizon']);
    }
    if (/number|count|total|volume|user|customer|record|transaction|scale/i.test(h)) {
      return pick(['enterprise scale', 'millions of transactions', 'significant user base', 'high transaction volumes', 'at scale across the organisation', 'thousands of daily interactions']);
    }
    if (/year|quarter|date|when|q[1-4]/i.test(h)) {
      return pick(['within the next quarter', 'over the next 12 months', 'in the near term', 'across a phased timeline', 'starting this year', 'within the planning horizon']);
    }
    if (/headline|proof|claim|key message|finding|insight|takeaway|statement/i.test(h)) {
      return pick([
        'Measurable Impact From Day One',
        'Built for Scale, Designed for People',
        'Proven at Speed and Scale',
        'Trusted by Leading Enterprises',
        'Delivering Results Where It Counts',
        'A Step-Change in Performance',
      ]);
    }
    if (/client|company|brand|partner|organisation|organization|industry/i.test(h)) {
      return pick(['a leading enterprise', 'a global organisation', 'a major industry player', 'a Tier 1 operator', 'an enterprise client']);
    }
    if (/cta|call.to.action|button|action|next step/i.test(h)) {
      return pick(['Start the conversation', 'Let\'s align on next steps', 'Explore the approach', 'Define the path forward']);
    }
    // Generic fallback: directional language based on hint words
    const words = hint.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
    return words ? `[${words}]` : 'to be confirmed';
  },

  /**
   * Pre-process a slide object for rendering:
   * - Replaces all <<REPLACE: hint>> tokens with plausible provisional values
   * - Returns a shallow copy with `_provFields` map recording which fields are provisional
   * - Does NOT mutate the original slide in App.state
   */
  _preprocessSlide(slide) {
    const copy = { ...slide, _provFields: {} };
    const REPLACE_RE = /<<REPLACE:\s*([^>]+?)>>/gi;

    const resolve = (text) => {
      if (!text || typeof text !== 'string') return { value: text, isDummy: false };
      if (!REPLACE_RE.test(text)) { REPLACE_RE.lastIndex = 0; return { value: text, isDummy: false }; }
      REPLACE_RE.lastIndex = 0;
      let isDummy = false;
      const value = text.replace(/<<REPLACE:\s*([^>]+?)>>/gi, (_, hint) => {
        isDummy = true;
        return this._resolveToken(hint.trim());
      });
      return { value, isDummy };
    };

    const STRING_FIELDS = [
      'title','subtitle','headline','cta',
      'stat1_value','stat1_label','stat2_value','stat2_label','stat3_value','stat3_label',
    ];
    for (const f of STRING_FIELDS) {
      const r = resolve(copy[f]);
      copy[f] = r.value;
      if (r.isDummy) copy._provFields[f] = true;
    }
    if (Array.isArray(copy.body)) {
      copy.body = copy.body.map((item, i) => {
        const r = resolve(item);
        if (r.isDummy) copy._provFields[`body-${i}`] = true;
        return r.value;
      });
    }
    return copy;
  },

  /**
   * After innerHTML is set, walk all [data-field] elements and mark provisional ones.
   */
  _markProvisionalFields(card, provFields) {
    const TOOLTIP = 'This is dummy content. Replace with actual content.';
    for (const fieldKey of Object.keys(provFields)) {
      const el = card.querySelector(`[data-field="${CSS.escape(fieldKey)}"]`);
      if (!el) continue;
      el.classList.add('ph-provisional');
      el.setAttribute('title', TOOLTIP);
      el.setAttribute('data-provisional', 'true');
    }
  },

  // ── Visual priority classification ───────────────────────────────────────
  /** Classify each slide by visual priority and set skipImage for low-priority ones. */
  classifySlides(slides) {
    if (!Array.isArray(slides)) return slides;
    const HIGH_KW = /vision|story|future|opportunity|transform|impact|reimagine|revolution|new world|introduce|overview|ambition|narrative/i;
    const LOW_KW  = /roadmap|timeline|milestone|governance|operating model|roi|cost|budget|pricing|risk|compliance|principles|criteria|agenda|next step|appendix|q&a|questions|contact|team|who we are/i;

    // Layout types that have no image slot — never show placeholder
    const NO_IMAGE_LAYOUTS = new Set(['stats', 'bullets', 'text-only', 'diagram', 'data']);

    return slides.map((slide, idx) => {
      // Don't re-classify slides that already have user-set state
      if (slide.imgPriority && (slide.img_uploaded || slide.image_data_url)) return slide;

      const layout = slide.render_layout || slide.layout || '';
      const t = (slide.title || '') + ' ' + (slide.subtitle || '');
      const isFirst = idx === 0;
      const isLast  = idx === slides.length - 1;
      const hasStats = slide.stat1_value && slide.stat2_value;

      // Explicit layout-based skip — no image slot for these
      if (NO_IMAGE_LAYOUTS.has(layout)) {
        return { ...slide, imgPriority: 'low', skipImage: true };
      }

      let priority;
      if (isFirst || isLast) {
        priority = 'high';
      } else if (HIGH_KW.test(t) || layout === 'hero' || layout === 'image-full') {
        priority = 'high';
      } else if (LOW_KW.test(t) || hasStats) {
        priority = 'low';
      } else {
        priority = 'medium';
      }

      const out = { ...slide, imgPriority: priority };

      // Low-priority slides without an existing image → skip image, use bullets layout
      if (priority === 'low' && !out.image_data_url && out.skipImage === undefined) {
        out.skipImage = true;
        if (!NO_IMAGE_LAYOUTS.has(out.layout || '')) {
          out.layout = 'bullets';
          out.render_layout = 'bullets';
        }
      }

      return out;
    });
  },

  // ── Image placeholder ─────────────────────────────────────────────────────
  /**
   * Inject a placeholder into the exact image slot for this slide's layout.
   *
   * Layout → slot position (mirrors where the <img> would be in renderer.js):
   *   hero / image-full  → floating card centered in upper area (image fills full bg,
   *                         but content text lives at bottom, so card lives in the top half)
   *   split / image-right → right column: right:0, top:0, width:46% (PS) or 58% (custom), h:100%
   *
   * Non-image layouts (stats, bullets, text-only, diagram, data) → no placeholder injected.
   */
  _injectImagePlaceholder(card, idx, slide) {
    const resolvedLayout = slide.render_layout || slide.layout || 'split';
    const NO_IMAGE_LAYOUTS = new Set(['stats', 'bullets', 'text-only', 'diagram', 'data']);
    if (NO_IMAGE_LAYOUTS.has(resolvedLayout)) return;

    const isPSBrand = (App.state.brand?.designMode || 'ps-brand') === 'ps-brand';
    const isHero = resolvedLayout === 'hero' || resolvedLayout === 'image-full';
    const isGenerating = this._imagesGenerating && this._imagesGenerating.has(idx);
    const priority = slide.imgPriority || 'medium';

    // ── Slot dimensions (must match renderer.js image positioning exactly) ──
    // hero:        image fills inset:0 — place card in upper-center so it doesn't
    //              cover bottom-left content area
    // split/PS:    image is right:0 top:0 width:46% height:100% (border-radius:16px 0 0 16px)
    // split/custom: image is right:0 top:0 width:58% height:100%
    let slotStyle;
    if (isHero) {
      // Upper-center card; content text is in the bottom ~35% of hero slides
      slotStyle =
        'position:absolute;' +
        'top:8%;left:50%;transform:translateX(-50%);' +
        'width:44%;height:56%;' +
        'border-radius:14px;';
    } else {
      // Right-column slot — architecture-diagram uses a wider zone
      const layoutType = slide.layoutType || '';
      const w = layoutType === 'architecture-diagram' ? '56%' : isPSBrand ? '46%' : '58%';
      const br = isPSBrand ? '16px 0 0 16px' : '0';
      slotStyle =
        `position:absolute;right:0;top:0;` +
        `width:${w};height:100%;` +
        `border-radius:${br};`;
    }

    const PRIORITY_LABELS = { high: '★ High priority', medium: '◆ Medium', low: '● Low' };
    const statusText = isGenerating ? 'Generating…' : 'Not generated yet';
    const desc = (slide.image_prompt || 'Visual for this slide').slice(0, 100);
    const iconHtml = isGenerating
      ? `<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>`
      : `<div class="img-ph-icon">🖼</div>`;

    const ph = document.createElement('div');
    ph.className = 'img-placeholder';
    ph.id = `img-ph-${idx}`;
    ph.style.cssText = slotStyle; // layout-specific slot positioning

    ph.innerHTML =
      `<div class="img-ph-inner">` +
        iconHtml +
        `<div class="img-ph-priority ${priority}">${PRIORITY_LABELS[priority]}</div>` +
        `<div class="img-ph-desc">${this._escHtml(desc)}</div>` +
        `<div class="img-ph-status">${statusText}</div>` +
        `<div class="img-ph-actions">` +
          `<button class="img-ph-btn primary" onclick="event.stopPropagation();Phase3.generateImageForSlide(${idx})" ${isGenerating ? 'disabled' : ''}>✦ Generate</button>` +
          `<button class="img-ph-btn" onclick="event.stopPropagation();Phase3.openUploadForSlide(${idx})">↑ Upload</button>` +
          `<button class="img-ph-btn" onclick="event.stopPropagation();Phase3.showLayoutPicker(${idx},event)">⊞ Layout</button>` +
          `<button class="img-ph-btn danger" onclick="event.stopPropagation();Phase3.removeVisual(${idx})">✕ Remove</button>` +
        `</div>` +
      `</div>`;

    card.querySelector('.sr')?.appendChild(ph);
  },

  // ── On-demand image generation ────────────────────────────────────────────
  async generateImageForSlide(idx) {
    const slide = this.slides[idx];
    if (!slide || !slide.image_prompt) return;

    if (!this._imagesGenerating) this._imagesGenerating = new Set();
    this._imagesGenerating.add(idx);

    // Update placeholder in-place to show generating state
    const ph = document.getElementById(`img-ph-${idx}`);
    if (ph) {
      const inner = ph.querySelector('.img-ph-inner');
      const icon  = ph.querySelector('.img-ph-icon');
      const status = ph.querySelector('.img-ph-status');
      const genBtn = ph.querySelector('.img-ph-btn.primary');
      if (icon) {
        // Replace icon with spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.cssText = 'width:20px;height:20px;border-width:2px';
        icon.replaceWith(spinner);
      }
      if (status) status.textContent = 'Generating…';
      if (genBtn) genBtn.disabled = true;
    }

    try {
      const result = await App.generateImage(slide.image_prompt);
      if (!result.b64) throw new Error('No image returned');

      slide.image_data_url = `data:${result.mime || 'image/png'};base64,${result.b64}`;
      this._imagesGenerating.delete(idx);
      App.state.generatedSlides = this.slides;

      // Re-render current slide (placeholder gone, image shows)
      if (idx === this.cur) this.renderSlide(idx);

      // Refresh thumbnail
      const thumb = document.querySelectorAll('.p3-thumb')[idx];
      if (thumb) {
        const inner = thumb.querySelector('div');
        if (inner) {
          inner.style.backgroundImage = `url(${slide.image_data_url})`;
          inner.style.backgroundSize = 'cover';
          inner.style.backgroundPosition = 'center';
        }
      }
    } catch (err) {
      this._imagesGenerating.delete(idx);
      const phEl = document.getElementById(`img-ph-${idx}`);
      if (phEl) {
        // Replace any spinner back to an icon
        const spinner = phEl.querySelector('.spinner');
        if (spinner) {
          const icon = document.createElement('div');
          icon.className = 'img-ph-icon';
          icon.textContent = '⚠';
          spinner.replaceWith(icon);
        }
        const status = phEl.querySelector('.img-ph-status');
        const genBtn = phEl.querySelector('.img-ph-btn.primary');
        if (status) status.textContent = 'Generation failed — try again';
        if (genBtn) genBtn.disabled = false;
      }
    }
  },

  // ── Per-slide image upload ────────────────────────────────────────────────
  openUploadForSlide(idx) {
    this._pendingUploadIdx = idx;
    document.getElementById('p3-slide-img-inp').click();
  },

  _handleSlideImageUpload(file) {
    const idx = this._pendingUploadIdx;
    this._pendingUploadIdx = null;
    if (idx == null || !file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const slide = this.slides[idx];
      if (!slide) return;
      slide.image_data_url = e.target.result;
      slide.img_uploaded = true;
      slide.skipImage = false;
      App.state.generatedSlides = this.slides;
      if (idx === this.cur) this.renderSlide(idx);
      const thumb = document.querySelectorAll('.p3-thumb')[idx];
      if (thumb) {
        const inner = thumb.querySelector('div');
        if (inner) {
          inner.style.backgroundImage = `url(${e.target.result})`;
          inner.style.backgroundSize = 'cover';
          inner.style.backgroundPosition = 'center';
        }
      }
    };
    reader.readAsDataURL(file);
  },

  // ── Layout picker (per-slide) ─────────────────────────────────────────────
  showLayoutPicker(idx, event) {
    // Toggle: close existing popup if already open
    const existing = document.getElementById('layout-picker-popup');
    if (existing) { existing.remove(); return; }

    const btn = event.currentTarget;
    const popup = document.createElement('div');
    popup.id = 'layout-picker-popup';
    popup.className = 'layout-picker-popup';
    popup.style.position = 'fixed';

    const layouts = [
      { id: 'image-full', icon: '⬛',  label: 'Full image',    desc: 'Full-screen image background' },
      { id: 'image-right',icon: '◧',   label: 'Image right',   desc: 'Text left, image right' },
      { id: 'text-only',  icon: '≡',   label: 'Text only',     desc: 'Clean text, no image slot' },
      { id: 'diagram',    icon: '⬡',   label: 'Diagram',       desc: 'For process & flow layouts' },
      { id: 'data',       icon: '▦',   label: 'Data / stats',  desc: 'Numbers-led layout' },
    ];

    popup.innerHTML = layouts.map(l =>
      `<button class="lp-opt" onclick="Phase3.applySlideLayout(${idx},'${l.id}');document.getElementById('layout-picker-popup')?.remove()">
        <span class="lp-icon">${l.icon}</span>
        <span class="lp-info"><strong>${l.label}</strong><small>${l.desc}</small></span>
      </button>`
    ).join('');

    document.body.appendChild(popup);

    // Position near the button
    const rect = btn.getBoundingClientRect();
    const pw = popup.offsetWidth || 200;
    let left = rect.left;
    let top  = rect.bottom + 6;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';

    // Close on outside click
    setTimeout(() => {
      const close = (e) => {
        if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', close); }
      };
      document.addEventListener('click', close);
    }, 0);
  },

  applySlideLayout(idx, layoutId) {
    const slide = this.slides[idx];
    if (!slide) return;

    // Map user-facing layout IDs to renderer-compatible values
    const LAYOUT_MAP = {
      'image-full':  { layout: 'hero',    render_layout: 'hero',    skipImage: false },
      'image-right': { layout: 'split',   render_layout: 'split',   skipImage: false },
      'text-only':   { layout: 'bullets', render_layout: 'bullets', skipImage: true  },
      'diagram':     { layout: 'bullets', render_layout: 'bullets', skipImage: true  },
      'data':        { layout: 'stats',   render_layout: 'stats',   skipImage: true  },
      // Legacy renderer values — pass through directly
      'hero':        { layout: 'hero',    render_layout: 'hero',    skipImage: false },
      'split':       { layout: 'split',   render_layout: 'split',   skipImage: false },
      'stats':       { layout: 'stats',   render_layout: 'stats',   skipImage: true  },
      'bullets':     { layout: 'bullets', render_layout: 'bullets', skipImage: true  },
    };

    const mapped = LAYOUT_MAP[layoutId] || { layout: layoutId, render_layout: layoutId, skipImage: false };
    slide.layout        = mapped.layout;
    slide.render_layout = mapped.render_layout;
    slide.skipImage     = mapped.skipImage;

    App.state.generatedSlides = this.slides;
    if (idx === this.cur) this.renderSlide(idx);
    this.renderThumbs();
  },

  // ── Remove visual from a slide ────────────────────────────────────────────
  removeVisual(idx) {
    const slide = this.slides[idx];
    if (!slide) return;
    slide.image_data_url = null;
    slide.img_uploaded = false;
    slide.skipImage = true;
    if (slide.layout === 'hero' || slide.layout === 'split') {
      slide.layout = 'bullets';
      slide.render_layout = 'bullets';
    }
    App.state.generatedSlides = this.slides;
    if (idx === this.cur) this.renderSlide(idx);
    this.renderThumbs();
  },

  // ── Overflow detection & handling ────────────────────────────────────────

  /**
   * Measure how much a slide's content overflows its container.
   * Returns a ratio: 0 = no overflow, 0.15 = 15% overflow, etc.
   */
  _measureOverflow(card) {
    // Primary: .cr-root in the custom renderer has overflow-y:auto and a fixed height
    // scrollHeight > offsetHeight is an exact browser measurement
    const crRoot = card.querySelector('.cr-root');
    if (crRoot && crRoot.offsetHeight > 20) {
      const ratio = (crRoot.scrollHeight - crRoot.offsetHeight) / crRoot.offsetHeight;
      if (ratio > 0.02) return ratio;
    }
    // Secondary: check .slide-editable elements whose bottom edge exits the card
    const cardRect = card.getBoundingClientRect();
    if (!cardRect.height) return 0;
    let maxRatio = 0;
    card.querySelectorAll('.slide-editable').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom > cardRect.bottom + 8) {
        // Express overflow as fraction of card height (capped at 2 to avoid huge numbers)
        const ratio = Math.min(2, (r.bottom - cardRect.bottom) / (cardRect.height * 0.35));
        if (ratio > maxRatio) maxRatio = ratio;
      }
    });
    return maxRatio;
  },

  /**
   * Case A — small overflow (≤15%): tighten spacing without touching font size.
   * Purely CSS, instant, no LLM needed.
   */
  _applyFitAdjustment(card) {
    const crRoot = card.querySelector('.cr-root');
    if (crRoot) {
      crRoot.style.lineHeight = '1.25';
      crRoot.style.gap = '0.22em';
    }
    // Tighten inner flex/gap containers
    card.querySelectorAll('.cr-root > div, .cr-root > *').forEach(child => {
      const cs = getComputedStyle(child);
      if (cs.display === 'flex' || cs.display === 'grid') {
        child.style.gap = '0.18em';
      }
      if (child.style.marginBottom) child.style.marginBottom = '0.15em';
    });
  },

  /** Show a small status badge on the slide card during async processing. */
  _showOverflowBadge(idx, msg) {
    const card = document.getElementById('p3-slide-card');
    if (!card) return;
    const existing = document.getElementById(`overflow-badge-${idx}`);
    if (existing) { existing.querySelector('span').textContent = msg; return; }
    const badge = document.createElement('div');
    badge.id = `overflow-badge-${idx}`;
    badge.className = 'overflow-badge';
    badge.innerHTML = `<div class="spinner" style="width:12px;height:12px;border-width:1.5px;flex-shrink:0"></div><span>${msg}</span>`;
    card.appendChild(badge);
  },

  _removeOverflowBadge(idx) {
    document.getElementById(`overflow-badge-${idx}`)?.remove();
  },

  /**
   * Case B — medium overflow (15–40%): ask LLM to compress content to fit.
   */
  async _triggerCompress(idx) {
    const slide = this.slides[idx];
    if (!slide) return;
    this._showOverflowBadge(idx, 'Fitting content…');
    const { image_data_url, _provFields, skipImage, imgPriority, image_prompt, ...slideForPrompt } = slide;
    const prompt =
      `You are a presentation editor. This slide has too much content and overflows its layout.\n\n` +
      `CURRENT SLIDE:\n${JSON.stringify(slideForPrompt, null, 2)}\n\n` +
      `TASK: Rewrite this slide to be shorter, sharper, and more scannable.\n` +
      `Rules:\n` +
      `- Keep all fields present but shorten them\n` +
      `- Reduce body array to at most 3–4 items\n` +
      `- Shorten each bullet to one tight line (under 10 words)\n` +
      `- Shorten headline to under 12 words\n` +
      `- Keep title unchanged\n` +
      `- Keep layout value unchanged\n` +
      `- Do NOT truncate mid-sentence\n` +
      `- Do NOT add <<REPLACE:...>> tokens\n\n` +
      `RESPOND WITH VALID JSON ONLY — the complete updated slide object (no "slides" wrapper).`;
    try {
      const data = await App.callChat(prompt);
      const updated = data.slides ? data.slides[0] : data;
      if (updated && typeof updated === 'object' && updated.title) {
        // Preserve visual state fields
        updated.image_data_url = image_data_url;
        updated.skipImage      = skipImage;
        updated.imgPriority    = imgPriority;
        updated.image_prompt   = image_prompt;
        this.slides[idx] = updated;
        App.state.generatedSlides = this.slides;
      }
    } catch { /* keep original */ }
    this._removeOverflowBadge(idx);
    if (idx === this.cur) this.renderSlide(idx);
  },

  /**
   * Case C — large overflow (>40%): ask LLM to split into 2 slides.
   */
  async _triggerSplit(idx) {
    const slide = this.slides[idx];
    if (!slide) return;
    this._showOverflowBadge(idx, 'Splitting slide…');
    const { image_data_url, _provFields, skipImage, imgPriority, image_prompt, ...slideForPrompt } = slide;
    const prompt =
      `You are a presentation editor. This slide has far too much content and must be split into 2 slides.\n\n` +
      `CURRENT SLIDE:\n${JSON.stringify(slideForPrompt, null, 2)}\n\n` +
      `TASK: Split this into exactly 2 slides with logical grouping.\n` +
      `Rules:\n` +
      `- Group related bullets/content into 2 coherent slides\n` +
      `- Each slide must have: title, headline, body (2–4 bullets max), layout\n` +
      `- Slide 1 title should match or closely derive from the original title\n` +
      `- Slide 2 title should clearly indicate it is a continuation\n` +
      `- Keep layout value unchanged for both slides\n` +
      `- Keep stats on whichever slide they are most relevant to\n` +
      `- Maintain narrative continuity between both slides\n` +
      `- Do NOT add <<REPLACE:...>> tokens\n\n` +
      `RESPOND WITH VALID JSON: { "slides": [ {...slide1...}, {...slide2...} ] }`;
    try {
      const data = await App.callChat(prompt);
      if (data.slides && data.slides.length >= 2) {
        const [s1, s2] = data.slides;
        // Preserve visual state on both
        [s1, s2].forEach(s => {
          s.skipImage    = skipImage;
          s.imgPriority  = imgPriority;
          s.image_prompt = s.image_prompt || image_prompt;
        });
        // Replace the original slide with s1 and insert s2 immediately after
        this.slides.splice(idx, 1, s1, s2);
        App.state.generatedSlides = this.slides;
        this._removeOverflowBadge(idx);
        this.renderSlide(this.cur);
        this.renderThumbs();
        this.updateNavState();
        return;
      }
    } catch { /* keep original */ }
    this._removeOverflowBadge(idx);
    if (idx === this.cur) this.renderSlide(idx);
  },

  /**
   * Entry point — called via requestAnimationFrame after innerHTML is set.
   * Uses _overflowProcessed to prevent re-firing after compress/split re-renders.
   */
  async _checkAndHandleOverflow(idx, card) {
    if (this.busy) return;
    if (!this._overflowProcessed) this._overflowProcessed = new Set();
    const ratio = this._measureOverflow(card);
    if (ratio <= 0.02) return; // fits fine

    if (ratio <= 0.15) {
      // Small overflow — CSS tightening only, safe to repeat
      this._applyFitAdjustment(card);
      return;
    }

    // Medium / large — LLM rewrite, only once per slide per session
    if (this._overflowProcessed.has(idx)) return;
    this._overflowProcessed.add(idx);

    if (ratio <= 0.40) {
      await this._triggerCompress(idx);
    } else {
      await this._triggerSplit(idx);
    }
  },

  // ── Render one slide ──────────────────────────────────────────────────────
  renderSlide(idx) {
    const raw = this.slides[idx];
    if (!raw) return;

    // Substitute <<REPLACE:...>> tokens — returns a copy, never mutates App.state
    const slide = this._preprocessSlide(raw);

    const card = document.getElementById('p3-slide-card');
    const isPSBrand = (App.state.brand.designMode || 'ps-brand') === 'ps-brand';
    let html;
    if (isPSBrand) {
      html = CinematicRenderer.renderPS(slide, idx, this.slides.length);
    } else {
      const primaryColor = App.state.brand.primaryColor;
      const accentColor = App.state.brand.accentColor;
      const ff = (App.state.brand.font || '').trim();
      if (ff && window.loadGoogleFontFamily) window.loadGoogleFontFamily(ff);
      html = CinematicRenderer.render(slide, idx, this.slides.length, primaryColor, accentColor);
    }
    const wrapFont = !isPSBrand && (App.state.brand.font || '').trim()
      ? `'${String(App.state.brand.font).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', sans-serif`
      : "'Roboto', sans-serif";
    card.innerHTML = `<div class="sr" style="font-family:${wrapFont}">${html}</div>`;
    document.getElementById('p3-ctr').textContent = `${idx + 1} / ${this.slides.length}`;

    // Mark any provisional fields with dotted underline + info icon
    if (slide._provFields && Object.keys(slide._provFields).length) {
      this._markProvisionalFields(card, slide._provFields);
    }

    // Show image placeholder if slide has an image slot but no image yet
    if (raw.image_prompt && !raw.image_data_url && !raw.skipImage) {
      this._injectImagePlaceholder(card, idx, raw);
    }

    // Check for content overflow after the browser has completed layout
    requestAnimationFrame(() => this._checkAndHandleOverflow(idx, card));
  },

  // ── Thumbnail strip ───────────────────────────────────────────────────────
  renderThumbs() {
    const strip = document.getElementById('p3-thumbs');
    strip.innerHTML = '';
    const isPSBrand = (App.state.brand.designMode || 'ps-brand') === 'ps-brand';
    const primaryColor = isPSBrand ? this.PS_BRAND.primaryColor : App.state.brand.primaryColor;
    const accentColor = isPSBrand ? this.PS_BRAND.accentColor : App.state.brand.accentColor;

    this.slides.forEach((slide, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'p3-thumb' + (i === this.cur ? ' active' : '');
      thumb.onclick = () => {
        this.cur = i;
        App.state.p3Cur = i;
        this.renderSlide(i);
        this.renderThumbs();
        this.updateNavState();
      };

      const inner = document.createElement('div');
      inner.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;';
      if (slide.image_data_url) {
        inner.style.backgroundImage = `url(${slide.image_data_url})`;
        inner.style.backgroundSize = 'cover';
        inner.style.backgroundPosition = 'center';
      } else {
        inner.style.background = primaryColor;
      }
      const lbl = document.createElement('div');
      lbl.className = 'p3-thumb-label';
      lbl.textContent = slide.title || `Slide ${i + 1}`;
      inner.appendChild(lbl);
      thumb.appendChild(inner);
      strip.appendChild(thumb);
    });
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  nav(dir) {
    const next = this.cur + dir;
    if (next < 0 || next >= this.slides.length) return;
    this.cur = next;
    App.state.p3Cur = this.cur;
    this.renderSlide(this.cur);
    this.renderThumbs();
    this.updateNavState();
  },

  updateNavState() {
    document.getElementById('p3-prev').disabled = this.cur <= 0;
    document.getElementById('p3-next').disabled = this.cur >= this.slides.length - 1;
    if (!this.slides.length) document.getElementById('p3-ctr').textContent = '— / —';
  },

  // ── Image hydration ───────────────────────────────────────────────────────
  async hydrateImages() {
    if (!this._imagesFailed) this._imagesFailed = new Set();

    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i];
      if (!slide.image_prompt || slide.image_data_url) continue;
      try {
        const result = await App.generateImage(slide.image_prompt);
        if (result.b64) {
          slide.image_data_url = `data:${result.mime || 'image/png'};base64,${result.b64}`;
          // Re-render current slide (removes loading overlay)
          if (i === this.cur) this.renderSlide(i);
          // Refresh thumb
          const thumb = document.querySelectorAll('.p3-thumb')[i];
          if (thumb) thumb.querySelector('div').style.backgroundImage = `url(${slide.image_data_url})`;
        } else {
          this._imagesFailed.add(i);
          document.getElementById(`img-loading-${i}`)?.remove();
        }
      } catch {
        this._imagesFailed.add(i);
        document.getElementById(`img-loading-${i}`)?.remove();
      }
      await new Promise(r => setTimeout(r, 400));
    }
  },

  // ── AI chat (Phase 3 refinements) ─────────────────────────────────────────
  async sendChat() {
    const inp = document.getElementById('p3-chat-input');
    const text = inp.value.trim();
    if (!text || this.busy) return;
    this._overflowProcessed = new Set(); // chat may rewrite slides — re-enable overflow checks

    inp.value = '';
    inp.style.height = 'auto';
    this.addChatMsg('user', text);
    document.getElementById('p3-chat-send').disabled = true;

    this.busy = true;

    // Consume any attached files
    let fileContext = '';
    if (this._chatFiles && this._chatFiles.length) {
      fileContext = '\n\nATTACHED FILES:\n' +
        this._chatFiles.map(f => `[${f.name}]\n${f.content}`).join('\n\n');
      this._chatFiles = [];
      document.getElementById('p3-chat-files').innerHTML = '';
    }

    const isPSBrand = (App.state.brand.designMode || 'ps-brand') === 'ps-brand';
    // Strip image_data_url (base64) before sending — massively reduces token usage
    const slidesForPrompt = this.slides.map(s => {
      const { image_data_url, ...rest } = s; // eslint-disable-line no-unused-vars
      return rest;
    });
    const prompt =
      `You are refining an existing presentation deck based on user feedback.\n\n` +
      `CURRENT DECK (${this.slides.length} slides):\n${JSON.stringify(slidesForPrompt, null, 2)}\n` +
      fileContext + `\n\n` +
      `BRAND:\n` +
      (isPSBrand
        ? `- Design: Publicis Sapient official brand (red #E2231A, white bg, Lexend Deca headlines, Roboto body)\n`
        : `- Primary: ${App.state.brand.primaryColor}\n- Accent: ${App.state.brand.accentColor}\n`) +
      `- Tone: ${App.state.brand.toneId}\n\n` +
      `USER REQUEST: "${text}"\n\n` +
      `Apply the changes. You may add/remove/reorder slides, update copy, stats, layout, image_prompts, or ui_components.\n` +
      `Always maintain or improve image_prompt and ui_components alignment with updated copy.\n\n` +
      `RETURN ONLY VALID JSON:\n` +
      `{ "slides": [...], "theme": { "tagline": "...", "tone": "...", "artPreset": "..." } }`;

    try {
      const data = await App.callChat(prompt);
      if (data.slides && data.slides.length) {
        // Preserve images and visual-state flags for unchanged slides
        data.slides.forEach((s, i) => {
          const prev = this.slides[i];
          if (prev) {
            if (prev.image_data_url && !s.image_data_url) s.image_data_url = prev.image_data_url;
            if (prev.img_uploaded) s.img_uploaded = prev.img_uploaded;
            if (prev.skipImage !== undefined) s.skipImage = prev.skipImage;
          }
        });
        this.slides = this.classifySlides(data.slides);
        App.state.generatedSlides = this.slides;
        if (this.cur >= this.slides.length) this.cur = Math.max(0, this.slides.length - 1);
        App.state.p3Cur = this.cur;
        this.renderSlide(this.cur);
        this.renderThumbs();
        this.updateNavState();
        this.addChatMsg('ai', `Done — ${this.slides.length} slides updated. Any other changes?`);
      } else {
        this.addChatMsg('ai', "I couldn\u2019t update the deck. Try rephrasing your request.");
      }
    } catch (err) {
      this.addChatMsg('ai', 'Error: ' + err.message);
    } finally {
      this.busy = false;
      document.getElementById('p3-chat-send').disabled = false;
    }
  },

  addChatMsg(role, text) {
    const msgs = document.getElementById('p3-chat-msgs');
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

  // ── PPTX Export ───────────────────────────────────────────────────────────
  async downloadPPTX() {
    if (!this.slides.length) return;
    const btn = document.getElementById('p3-dl');
    btn.disabled = true;
    btn.textContent = '⏳ Exporting…';

    try {
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: 'WIDE169', width: 13.33, height: 7.5 });
      pptx.layout = 'WIDE169';

      const brand = App.state.brand;
      const isPSBrand = (brand.designMode || 'ps-brand') === 'ps-brand';

      const primary = isPSBrand ? '#FFFFFF' : (brand.primaryColor || '#0c0b14');
      const accent = isPSBrand ? '#E2231A' : (brand.accentColor || '#7c6af7');
      const headlineFontFace = isPSBrand ? 'Lexend Deca' : (brand.font || 'Arial');
      const bodyFontFace = isPSBrand ? 'Roboto' : (brand.font || 'Arial');

      // Helper: is dark bg?
      const isDark = (() => {
        const hex = primary.replace('#','');
        const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
        return (0.299*r + 0.587*g + 0.114*b) < 128;
      })();

      const textHex = isPSBrand ? '111111' : (isDark ? 'FFFFFF' : '111111');
      const subHex = isPSBrand ? '444444' : (isDark ? 'AAAACC' : '555577');
      const accentHex = accent.replace('#','');
      const bgHex = primary.replace('#','');

      for (let i = 0; i < this.slides.length; i++) {
        const slide = this.slides[i];
        const s = pptx.addSlide();
        s.background = { color: bgHex };

        // Background image (right half or full for hero)
        if (slide.image_data_url) {
          const isHero = slide.layout === 'hero' || i === 0;
          try {
            if (isHero) {
              s.addImage({ data: slide.image_data_url, x: 0, y: 0, w: 13.33, h: 7.5, sizing: { type: 'cover', w: 13.33, h: 7.5 } });
              // dark overlay
              s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 7.5, h: 7.5, fill: { color: bgHex, transparency: 20 } });
            } else {
              s.addImage({ data: slide.image_data_url, x: 6.5, y: 0, w: 6.83, h: 7.5, sizing: { type: 'cover', w: 6.83, h: 7.5 } });
            }
          } catch { /* image failed */ }
        }

        // Subtitle / chapter label
        if (slide.subtitle) {
          s.addText(slide.subtitle.toUpperCase(), {
            x: 0.5, y: 0.5, w: 8, h: 0.4,
            fontSize: 9, bold: true, color: accentHex, charSpacing: 3, fontFace: bodyFontFace,
          });
        }

        // Title
        if (slide.title) {
          const isHero = slide.layout === 'hero' || i === 0;
          s.addText(slide.title, {
            x: 0.5, y: isHero ? 2.5 : 1.0, w: isHero ? 8.5 : 6, h: isHero ? 2 : 1.5,
            fontSize: isHero ? 36 : 26, bold: true, color: textHex, fontFace: headlineFontFace,
            breakLine: false, wrap: true,
          });
        }

        // Headline
        if (slide.headline) {
          s.addText(slide.headline, {
            x: 0.5, y: slide.layout === 'hero' ? 4.6 : 2.6, w: 6, h: 0.8,
            fontSize: 14, color: subHex, fontFace: bodyFontFace, wrap: true,
          });
        }

        // Body bullets
        if (slide.body && slide.body.length) {
          const bullets = slide.body.map(b => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
          s.addText(bullets, {
            x: 0.5, y: 3.5, w: 5.5, h: 3,
            fontSize: 13, color: subHex, fontFace: bodyFontFace, wrap: true,
          });
        }

        // Stats
        if (slide.stat1_value) {
          s.addText(slide.stat1_value, { x: 8.5, y: 2.0, w: 4, h: 1.4, fontSize: 52, bold: true, color: accentHex, align: 'center', fontFace: headlineFontFace });
          s.addText((slide.stat1_label || '').toUpperCase(), { x: 8.5, y: 3.5, w: 4, h: 0.4, fontSize: 10, color: subHex, align: 'center', charSpacing: 2, fontFace: bodyFontFace });
        }
        if (slide.stat2_value) {
          s.addText(slide.stat2_value, { x: 8.5, y: 4.2, w: 4, h: 1.2, fontSize: 44, bold: true, color: accentHex, align: 'center', fontFace: headlineFontFace });
          s.addText((slide.stat2_label || '').toUpperCase(), { x: 8.5, y: 5.5, w: 4, h: 0.4, fontSize: 10, color: subHex, align: 'center', charSpacing: 2, fontFace: bodyFontFace });
        }

        // CTA
        if (slide.cta) {
          s.addText(slide.cta + '  →', {
            x: 0.5, y: 6.6, w: 3.5, h: 0.55,
            fontSize: 11, bold: true, color: accentHex, fontFace: bodyFontFace,
            shape: pptx.ShapeType.rect,
            fill: { color: accentHex, transparency: 88 },
            border: { type: 'solid', pt: 1, color: accentHex },
            align: 'center', valign: 'middle',
          });
        }

        // Logo
        if (brand.logoDataUrl && i === 0) {
          try {
            s.addImage({ data: brand.logoDataUrl, x: 10.5, y: 0.25, w: 2.3, h: 1.0, sizing: { type: 'contain', w: 2.3, h: 1.0 } });
          } catch { /* logo failed */ }
        }

        // Slide number
        s.addText(`${i+1}`, { x: 12.8, y: 7.1, w: 0.4, h: 0.3, fontSize: 8, color: subHex, align: 'center', fontFace: bodyFontFace });
      }

      const filename = (App.state.deckName || 'deck').replace(/[^a-zA-Z0-9_\-]/g, '_') + '.pptx';
      pptx.writeFile({ fileName: filename });
    } catch (err) {
      alert('PPTX export failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬇ Download <span class="dl-arrow">▾</span>';
    }
  },

  async downloadPDF() {
    if (!this.slides.length) return;
    const btn = document.getElementById('p3-dl');
    btn.disabled = true;
    btn.textContent = '⏳ Exporting…';
    try {
      const isPSBrand = (App.state.brand.designMode || 'ps-brand') === 'ps-brand';
      const win = window.open('', '_blank');
      if (!win) { alert('Please allow pop-ups to download PDF.'); return; }

      const htmlSlides = this.slides.map((slide, i) => {
        const html = isPSBrand
          ? CinematicRenderer.renderPS(slide, i, this.slides.length)
          : CinematicRenderer.render(slide, i, this.slides.length, App.state.brand.primaryColor, App.state.brand.accentColor);
        return `<div class="pdf-slide"><div class="sr" style="width:100%;height:100%;font-family:'Roboto',sans-serif;">${html}</div></div>`;
      }).join('');

      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>${App.state.deckName || 'Deck'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:#000}
          .pdf-slide{width:297mm;height:167mm;page-break-after:always;overflow:hidden;position:relative}
          .sr{width:100%;height:100%;position:relative}
          @page{size:A4 landscape;margin:0}
        </style>
      </head><body>${htmlSlides}<script>window.onload=function(){setTimeout(function(){window.print();window.close()},800)}<\/script></body></html>`);
      win.document.close();
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '⬇ Download <span class="dl-arrow">▾</span>';
    }
  },

  toggleDlMenu(e) {
    e.stopPropagation();
    document.getElementById('p3-dl-wrap').classList.toggle('open');
  },

  closeDlMenu() {
    document.getElementById('p3-dl-wrap')?.classList.remove('open');
  },

  async shareDeck() {
    if (!this.slides.length || this.busy) return;
    const btn = document.getElementById('p3-share');
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = '…';
    try {
      const deckName =
        App.state.deckName ||
        App.state.brand?.clientName ||
        App.state.wireframeSlides?.[0]?.title ||
        App.state.confirmedDeckTypeName ||
        App.state.confirmedDeckType ||
        '';
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: this.slides,
          brand: App.state.brand,
          deckName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create share link.');
      const path = data.path || (data.id ? `/view/${data.id}` : '');
      if (!path) throw new Error('Invalid response from server.');
      const url = `${location.origin}${path}`;
      this.openShareModal(url);
    } catch (e) {
      alert(String(e.message || e));
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  },

  openShareModal(url) {
    const m = document.getElementById('share-modal');
    const inp = document.getElementById('share-url-input');
    if (!m || !inp) return;
    inp.value = url;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    setTimeout(() => inp.select(), 50);
  },

  closeShareModal() {
    const m = document.getElementById('share-modal');
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
  },

  async copyShareLink() {
    const inp = document.getElementById('share-url-input');
    const btn = document.getElementById('share-copy-btn');
    if (!inp || !btn) return;
    const url = inp.value;
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = label;
      }, 2000);
    } catch {
      try {
        inp.select();
        document.execCommand('copy');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = label;
        }, 2000);
      } catch {
        alert('Copy failed — select the link and copy manually.');
      }
    }
  },
};
