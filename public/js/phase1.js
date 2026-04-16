// ─── PHASE 1: BRIEF PANEL ──────────────────────────────────────────────────────

window.Phase1 = {

  _fileObjects: new Map(), // filename → File object kept for retry

  // ── Built-in Publicis Sapient product knowledge ──────────────────────────
  PS_KNOWLEDGE: `
PUBLICIS SAPIENT AI PLATFORMS — BUILT-IN KNOWLEDGE:

## Sapient Bodhi (Enterprise AI Agent Platform)
Bodhi is Publicis Sapient's enterprise agentic AI platform that operationalises AI agents at scale. It features a shared enterprise context layer that governs how agents reason and act across complex systems.

Key capabilities:
- Pre-built, industry-aligned agents and configurable workflows
- Agent UI and low-code development kit
- Enterprise knowledge graph powering shared intelligence
- Cloud- and model-agnostic (no vendor lock-in)
- Deep Research (ranked #3 on Hugging Face DeepResearch Bench Leaderboard)
- Specialised agents: Ask, Conversational AI, Translate, Insights, Curate, Vision, Optimise, Forecast, Detect, Recommend

Core differentiators:
- Addresses AI pilot stall problem with enterprise governance and orchestration
- Manages agent interactions with data, systems, and each other for consistency and traceability
- Validated on advanced multi-step reasoning tasks

Proven outcomes:
- Healthcare pharma: 75% faster content production, up to 45% cost reduction
- CPG leader: 700+ assets created in 2 months, 60% asset reuse across brands
- Content supply chain: 2× asset production efficiency, 60% asset reuse rate

Best for use cases: AI-driven content supply chains, enterprise operations automation, decision support, cross-functional process orchestration, regulated industry environments.

## Sapient Slingshot (Software Modernisation & Delivery Platform)
Slingshot is Publicis Sapient's enterprise AI platform that automates and accelerates the entire software development lifecycle. It replaces fragmented tools and manual handoffs with a single, continuous system.

Key capabilities:
- Breaks down legacy systems while preserving critical business logic
- Generates production-ready code automatically
- Supports legacy modernisation AND net-new development simultaneously
- Carries enterprise context across discovery, design, build, test, and deployment
- 13+ specialised agents: CI/CD Deployment, Database Migration, PR Intelligence, Code Discovery, API Lifecycle, MISRA Compliance, VBA-to-Python, PL/SQL-to-Java Microservices, and more

Core differentiators:
- Reads existing code to extract rules, dependencies, and specifications before anything is rebuilt
- Operates at system level (not just individual developer copilot)
- Emphasises accuracy, traceability, and governance for large, tightly-coupled systems

Proven outcomes:
- 75% faster modernisation timelines
- 50% reduction in modernisation costs
- 3× faster than traditional approaches
- 40% higher productivity
- 99% code-to-spec accuracy
- Healthcare provider: 3× faster migration of 10,000+ COBOL/Synon mainframe screens, 30% cost reduction
- RWE (energy): revived a 24-year-old undocumented application in two days, ~40% time savings, ~35% efficiency gains
`,

  // ── Canonical deck type labels (shown in dropdown) ───────────────────────
  DECK_TYPE_NAMES: {
    'executive-summary': 'Executive Summary',
    'vision-narrative':  'Vision & Creative Narrative',
    'product-ux':        'Product & UX Deep Dive',
    'tech-architecture': 'Technical Architecture & AI Capability',
    'delivery-roadmap':  'Delivery Roadmap & Timeline',
    'commercial-roi':    'Commercial Model & ROI Case',
    'governance-model':  'Governance & Operating Model',
    'change-adoption':   'Change & Adoption Strategy',
    'industry-lens':     'Industry-Specific Lens',
    'custom':            'Custom',
  },

  // ── Slide range + intent per deck type ───────────────────────────────────
  DECK_TYPE_CONFIG: {
    'executive-summary': { min: 3,  max: 7,  recommended: 5,  useCase: 'C-suite overview, impact-first',                  narrativeIntent: 'Ruthlessly concise — one argument, one ask' },
    'vision-narrative':  { min: 10, max: 20, recommended: 14, useCase: 'Strategy direction, creative ambition',            narrativeIntent: 'Cinematic, manifesto energy, emotionally resonant' },
    'product-ux':        { min: 15, max: 30, recommended: 20, useCase: 'Product detail, UX flows, user journeys',          narrativeIntent: 'Show the experience — journey-led, detail-rich' },
    'tech-architecture': { min: 10, max: 25, recommended: 15, useCase: 'Technical depth, platform design, AI capability',  narrativeIntent: 'Precise, structured, credibility-first' },
    'delivery-roadmap':  { min: 8,  max: 15, recommended: 10, useCase: 'Phasing, milestones, workstreams',                 narrativeIntent: 'Time-based narrative — now, near, next' },
    'commercial-roi':    { min: 5,  max: 10, recommended: 7,  useCase: 'Business case, cost/benefit, ROI',                 narrativeIntent: 'Numbers-led — investment, return, confidence' },
    'governance-model':  { min: 8,  max: 15, recommended: 10, useCase: 'Operating model, roles, decision rights',          narrativeIntent: 'Structural clarity — who does what and how' },
    'change-adoption':   { min: 5,  max: 10, recommended: 7,  useCase: 'Adoption path, behaviour change, enablement',      narrativeIntent: 'Human-centered — the journey of people, not tech' },
    'industry-lens':     { min: 3,  max: 8,  recommended: 5,  useCase: 'Sector-specific context, market framing',          narrativeIntent: 'Context-setting — why this matters in this industry' },
    'custom':            { min: 3,  max: 30, recommended: 10, useCase: 'Custom scope',                                     narrativeIntent: 'Shaped by brief and bundle context' },
  },

  // ── Markdown file per deck type (loaded server-side via /api/deck-type-prompt/:id) ──
  DECK_TYPE_MARKDOWN_MAP: {
    'executive-summary': 'prompts/deck-types/executive-summary.md',
    'vision-narrative':  'prompts/deck-types/vision-narrative.md',
    'product-ux':        'prompts/deck-types/product-ux.md',
    'tech-architecture': 'prompts/deck-types/tech-architecture.md',
    'delivery-roadmap':  'prompts/deck-types/delivery-roadmap.md',
    'commercial-roi':    'prompts/deck-types/commercial-roi.md',
    'governance-model':  'prompts/deck-types/governance-model.md',
    'change-adoption':   'prompts/deck-types/change-adoption.md',
    'industry-lens':     'prompts/deck-types/industry-lens.md',
    'custom':            null,
  },

  // ── Human-friendly title examples (NOT dropdown labels — for AI inspiration only) ──
  DECK_TYPE_TITLE_EXAMPLES: {
    'executive-summary': ['What this means for your business', 'The opportunity in a nutshell', 'Why this matters now'],
    'vision-narrative':  ['The future we can build together', 'A new kind of experience', 'What this could become'],
    'product-ux':        ['How the experience should work', 'From journey to interaction', 'What users need at each step'],
    'tech-architecture': ['How the platform fits together', 'The architecture behind the ambition', 'What makes this scalable'],
    'delivery-roadmap':  ['How we get there', 'What happens now, near, and next', 'A phased path to delivery'],
    'commercial-roi':    ['Why the investment works', 'The numbers behind the case', 'How value will be realized'],
    'governance-model':  ['How this operates at scale', 'The model behind sustainable delivery', 'How decisions, roles, and change are managed'],
    'change-adoption':   ['How adoption actually happens', 'The path from rollout to behaviour change', 'What it takes to embed this internally'],
    'industry-lens':     ['Why this matters in your industry', 'What makes this different in [industry]', 'The sector-specific case for change'],
    'custom':            ['A story shaped around your brief', 'The right structure for this challenge', 'A narrative built from your context'],
  },

  // ── Proposal size options (controls bundle depth, separate from deck type) ─
  PROPOSAL_SIZES: [
    { id: 'lean',     label: 'Fast pitch',               description: 'Lean — essentials only' },
    { id: 'standard', label: 'Standard proposal',        description: 'Balanced depth and breadth' },
    { id: 'full-fat', label: 'Full transformation case', description: 'Maximum depth, all sections' },
  ],

  // ── Slide count defaults per proposal size (used when buildMode = full-proposal) ─
  PROPOSAL_SIZE_SLIDE_RANGES: {
    'lean':     { min: 8,  max: 20, default: 12 },
    'standard': { min: 15, max: 35, default: 22 },
    'full-fat': { min: 25, max: 60, default: 35 },
  },

  // ── Init ────────────────────────────────────────────────────────────────
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const fileInp    = document.getElementById('p1-file-inp');
    const uploadZone = document.getElementById('p1-upload-zone');

    fileInp.addEventListener('change', () => this.handleFiles(Array.from(fileInp.files)));
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--accent)'; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      this.handleFiles(Array.from(e.dataTransfer.files));
    });
  },

  // ── Build mode toggle ────────────────────────────────────────────────────
  onBuildModeChange(mode, btn) {
    App.state.buildMode = mode;
    document.querySelectorAll('.p1-mode-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');

    const hint = document.getElementById('p1-mode-hint');
    if (hint) hint.textContent = mode === 'single-deck'
      ? 'Use this when you need one focused narrative, like an executive summary or roadmap.'
      : 'Use this when you need a larger pitch or RFP response made up of multiple sections.';

    const deckSection     = document.getElementById('p1-deck-type-section');
    const proposalSection = document.getElementById('p1-proposal-size-section');
    if (deckSection)     deckSection.style.display     = mode === 'single-deck'   ? '' : 'none';
    if (proposalSection) proposalSection.style.display = mode === 'full-proposal' ? '' : 'none';
  },

  // ── Brief richness scoring ───────────────────────────────────────────────
  scoreBriefRichness(client, audience, objective, briefText, uploadedDocs) {
    let score = 0;

    // Presence of core fields
    if (client)    score += 1;
    if (audience)  score += 1;
    if (objective) score += 1;

    // Brief text length bands
    const len = briefText.length;
    if (len >= 300)  score += 1;
    if (len >= 800)  score += 1;
    if (len >= 1500) score += 1;

    // Numeric / statistical references (proof points)
    const numRefs = (briefText.match(/\d[\d,.]*\s*(%|x\b|×|\bk\b|\bm\b|\bb\b|times|percent|hours?|days?|weeks?|months?|years?|billion|million|thousand)?/gi) || []).length;
    if (numRefs >= 2) score += 1;
    if (numRefs >= 5) score += 1;

    // Bullet-like lines (structured thinking)
    const bulletLines = (briefText.match(/^[\s]*[-•*]\s+\S/gm) || []).length;
    if (bulletLines >= 3) score += 1;

    // Uploaded docs with substantial extracted text
    const docsWithText = uploadedDocs.filter(d => d.text && d.text.length > 500);
    if (docsWithText.length >= 1) score += 2;
    if (docsWithText.length >= 2) score += 1;

    // Total extracted text volume
    const totalExtracted = uploadedDocs.reduce((sum, d) => sum + (d.text?.length || 0), 0);
    if (totalExtracted >= 5000)  score += 1;
    if (totalExtracted >= 20000) score += 1;

    const richnessBand = score <= 3 ? 'thin' : score <= 7 ? 'medium' : 'rich';
    return { richnessScore: score, richnessBand };
  },

  // ── Slide count inference ────────────────────────────────────────────────
  inferSlideCount(deckTypeId, richnessBand, uploadedDocs) {
    const cfg = this.DECK_TYPE_CONFIG[deckTypeId] || { min: 3, max: 40 };
    const { min, max } = cfg;

    let base;
    if (richnessBand === 'thin')   base = min;
    else if (richnessBand === 'medium') base = Math.round((min + max) / 2);
    else                                base = Math.round(min + 0.7 * (max - min));

    // Bonus slides for large uploaded documents
    const totalExtracted = uploadedDocs.reduce((sum, d) => sum + (d.text?.length || 0), 0);
    let bonus = 0;
    if (totalExtracted >= 10000) bonus += 1;
    if (totalExtracted >= 40000) bonus += 1;

    return Math.max(min, Math.min(max, base + bonus));
  },

  // ── Read form fields → App.state ────────────────────────────────────────
  buildBrief() {
    const TONE_LABELS = {
      warm:      'Warm & human',
      data:      'Data-driven',
      visionary: 'Visionary',
      executive: 'Executive',
      punchy:    'Punchy',
    };

    const buildMode     = App.state.buildMode || 'single-deck';
    const industryKey   = (document.getElementById('p1-industry')?.value || '').trim() || null;
    App.state.industryKey = industryKey;
    const client        = document.getElementById('p1-client').value.trim();
    const audience      = document.getElementById('p1-audience').value.trim();
    const objective     = document.getElementById('p1-objective').value.trim();
    const deckTypeId    = document.getElementById('p1-deck-type').value;
    const proposalSizeId = document.getElementById('p1-proposal-size')?.value || 'standard';
    const briefText     = document.getElementById('p1-brief').value.trim();
    const toneId        = App.state.brand?.toneId || 'visionary';
    const deckTypeCfg   = this.DECK_TYPE_CONFIG[deckTypeId] || { min: 3, max: 30, recommended: 10, useCase: '', narrativeIntent: '' };

    // Richness is always computed (used for both modes)
    const { richnessScore, richnessBand } = this.scoreBriefRichness(
      client, audience, objective, briefText, App.state.uploadedDocs
    );

    // Slide count inference depends on build mode
    let inferredSlideCount;
    if (buildMode === 'single-deck') {
      inferredSlideCount = this.inferSlideCount(deckTypeId, richnessBand, App.state.uploadedDocs);
    } else {
      const psRange = this.PROPOSAL_SIZE_SLIDE_RANGES[proposalSizeId] || { min: 15, max: 35, default: 22 };
      if (richnessBand === 'thin')        inferredSlideCount = psRange.min;
      else if (richnessBand === 'medium') inferredSlideCount = Math.round((psRange.min + psRange.max) / 2);
      else                                inferredSlideCount = Math.round(psRange.min + 0.7 * (psRange.max - psRange.min));
      inferredSlideCount = Math.max(psRange.min, Math.min(psRange.max, inferredSlideCount));
    }

    const uploadedFilesSummary = App.state.uploadedDocs.length
      ? App.state.uploadedDocs.map(d => d.filename).join(', ')
      : '';

    const missingCriticalInputs = [];
    if (!client)    missingCriticalInputs.push('clientName');
    if (!audience)  missingCriticalInputs.push('audience');
    if (!objective) missingCriticalInputs.push('objective');
    if (!briefText) missingCriticalInputs.push('briefNarrative');

    const isSingleDeck = buildMode === 'single-deck';

    const brief = {
      buildMode,
      clientName:           client,
      audience:             audience,
      objective:            objective,
      // Deck type fields — only meaningful in single-deck mode
      deckTypeId:           isSingleDeck ? deckTypeId    : null,
      deckTypeLabel:        isSingleDeck ? (this.DECK_TYPE_NAMES[deckTypeId] || deckTypeId) : null,
      deckTypeUseCase:      isSingleDeck ? deckTypeCfg.useCase        : null,
      deckTypeIntent:       isSingleDeck ? deckTypeCfg.narrativeIntent : null,
      deckTypeMarkdownFile: isSingleDeck ? (this.DECK_TYPE_MARKDOWN_MAP[deckTypeId] || null) : null,
      // Proposal size — only meaningful in full-proposal mode
      proposalSizeId:       isSingleDeck ? null : proposalSizeId,
      industryKey,
      toneId,
      toneLabel:            TONE_LABELS[toneId] || toneId,
      inferredSlideCount,
      richnessScore,
      richnessBand,
      briefNarrative:       briefText,
      uploadedFilesSummary,
      missingCriticalInputs,
    };

    // Sync flat state fields (Phase 2 reads these directly)
    App.state.brief                 = brief;
    App.state.buildMode             = buildMode;
    App.state.confirmedDeckType     = isSingleDeck ? deckTypeId : null;
    App.state.confirmedDeckTypeName = isSingleDeck ? (this.DECK_TYPE_NAMES[deckTypeId] || deckTypeId) : `Proposal — ${proposalSizeId}`;
    App.state.confirmedSlideCount   = inferredSlideCount;
    App.state.brand                 = App.state.brand || {};
    App.state.brand.toneId          = toneId;

    // Build the text string Phase 2 reads from phase1Context (unchanged interface)
    const parts = [];
    if (client)    parts.push(`Client: ${client}`);
    if (audience)  parts.push(`Audience: ${audience}`);
    if (objective) parts.push(`Objective: ${objective}`);
    parts.push(`Build mode: ${buildMode}`);
    if (isSingleDeck) {
      parts.push(`Deck type: ${brief.deckTypeLabel}`);
      parts.push(`Deck type intent: ${brief.deckTypeIntent}`);
    } else {
      parts.push(`Proposal size: ${proposalSizeId}`);
    }
    parts.push(`Slide count: ${inferredSlideCount} (inferred — richness: ${richnessBand})`);
    parts.push(`Tone: ${brief.toneLabel}`);
    if (briefText) parts.push(`Brief:\n${briefText}`);
    if (missingCriticalInputs.length) {
      parts.push(`Note — brief richness: ${richnessBand} (score ${richnessScore}). Missing inputs: ${missingCriticalInputs.join(', ')}.`);
    }
    for (const doc of App.state.uploadedDocs) {
      if (doc.text) {
        parts.push(`[Attachment: ${doc.filename}]\n${doc.text}`);
      } else if (doc.extractError) {
        parts.push(`[Attachment: ${doc.filename}]\n(Text extraction failed — file was provided but could not be read)`);
      }
    }

    App.state.phase1Context = parts.join('\n\n');
  },

  proceedToWireframe() {
    this.buildBrief();
    if (window.GenerationBrain) {
      GenerationBrain.resolve(App.state.brief, App.state.uploadedDocs);
    }
    App.goToPhase(2, { regenerateWireframe: true });
  },

  onShow() {},

  selectTone(id, btn) {
    App.state.brand = App.state.brand || {};
    App.state.brand.toneId = id;
    document.querySelectorAll('.p1-tone-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
  },

  // ── File handling ───────────────────────────────────────────────────────
  async extractWithAutoRetry(file, onStatus) {
    const MAX_CLIENT_RETRIES = 2;
    const RETRY_DELAY_MS = 2000;
    let lastResult = null;
    for (let attempt = 0; attempt <= MAX_CLIENT_RETRIES; attempt++) {
      if (attempt > 0) {
        onStatus(`Extraction busy — retrying (${attempt}/${MAX_CLIENT_RETRIES})…`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
      try {
        lastResult = await App.extractDoc(file);
        if (lastResult.text && lastResult.chars > 100) return lastResult;
        if (!lastResult.transient && !lastResult.retryable) return lastResult;
      } catch (err) {
        lastResult = { text: '', chars: 0, error: err.message, transient: true, retryable: true };
      }
    }
    return lastResult;
  },

  async handleFiles(files) {
    if (!files.length) return;
    document.getElementById('p1-file-inp').value = '';

    for (const file of files) {
      const alreadyAdded = App.state.uploadedDocs.find(d => d.filename === file.name);
      if (alreadyAdded) continue;

      this._fileObjects.set(file.name, file); // keep for retry
      this.addFileChip(file.name, 'extracting…');

      const result = await this.extractWithAutoRetry(file, (status) => this.updateFileChip(file.name, status));

      if (result.text && result.chars > 100) {
        const kb = (result.chars / 1000).toFixed(1);
        this.updateFileChip(file.name, `✓ ${kb}K chars read`);
        App.state.uploadedDocs.push({ filename: file.name, text: result.text });
      } else if (result.transient || result.retryable) {
        this.updateFileChip(file.name, '⚠ partial extraction — continuing without full document text');
        App.state.uploadedDocs.push({ filename: file.name, text: result.text || '', extractError: result.error });
      } else if (result.error) {
        this.updateFileChip(file.name, '⚠ ' + result.error);
        App.state.uploadedDocs.push({ filename: file.name, text: '', extractError: result.error });
      } else {
        this.updateFileChip(file.name, 'no text found — AI will use filename');
        App.state.uploadedDocs.push({ filename: file.name, text: '' });
      }
    }
  },

  addFileChip(name, status) {
    const chips = document.getElementById('p1-file-chips');
    const chip  = document.createElement('div');
    chip.className = 'chip';
    chip.id = 'chip-' + this.slugify(name);
    chip.innerHTML = `<span>${this.fileIcon(name)}</span> <span>${this.truncate(name, 24)}</span> <span style="color:var(--text3);font-size:9px;margin-left:2px">${status}</span> <button onclick="Phase1.removeFile('${name.replace(/'/g, "\\'")}')">×</button>`;
    chips.appendChild(chip);
  },

  updateFileChip(name, status) {
    const chip = document.getElementById('chip-' + this.slugify(name));
    if (!chip) return;
    const spans = chip.querySelectorAll('span');
    if (spans[2]) spans[2].textContent = status;
  },

  removeFile(name) {
    App.state.uploadedDocs = App.state.uploadedDocs.filter(d => d.filename !== name);
    this._fileObjects.delete(name);
    const chip = document.getElementById('chip-' + this.slugify(name));
    if (chip) chip.remove();
  },

  async retryExtraction(name) {
    const file = this._fileObjects.get(name);
    if (!file) {
      this.updateFileChip(name, '⚠ file lost — please re-attach');
      return;
    }
    // Remove stale entry before re-extracting
    App.state.uploadedDocs = App.state.uploadedDocs.filter(d => d.filename !== name);
    this.updateFileChip(name, 'extracting…');

    const result = await this.extractWithAutoRetry(file, (status) => this.updateFileChip(name, status));

    if (result.text && result.chars > 100) {
      const kb = (result.chars / 1000).toFixed(1);
      this.updateFileChip(name, `✓ ${kb}K chars read`);
      App.state.uploadedDocs.push({ filename: name, text: result.text });
    } else if (result.transient || result.retryable) {
      this.updateFileChip(name, '⚠ partial extraction — continuing without full document text');
      App.state.uploadedDocs.push({ filename: name, text: result.text || '', extractError: result.error });
    } else if (result.error) {
      this.updateFileChip(name, '⚠ ' + result.error);
      App.state.uploadedDocs.push({ filename: name, text: '', extractError: result.error });
    } else {
      this.updateFileChip(name, 'no text found — AI will use filename');
      App.state.uploadedDocs.push({ filename: name, text: '' });
    }
  },

  // ── Utilities ──────────────────────────────────────────────────────────
  escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  },
  slugify(s)    { return s.replace(/[^a-zA-Z0-9]/g, '_'); },
  truncate(s, n){ return s.length > n ? s.slice(0, n - 1) + '…' : s; },
  fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    return { pdf:'📄', png:'🖼', jpg:'🖼', jpeg:'🖼', xlsx:'📊', xls:'📊', csv:'📊', docx:'📝', doc:'📝', pptx:'📑', ppt:'📑', txt:'📄', md:'📄' }[ext] || '📎';
  },
};
