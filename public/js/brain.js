// ─── GENERATION BRAIN — resolveGenerationBrain() ─────────────────────────────
//
// Single source of truth for deck generation strategy.
// Called once in Phase 1 (proceedToWireframe) and stored in App.state.brain.
// Phase 2 and Phase 3 read it directly — they never re-derive it.
//
// Input:  brief object (from Phase1.buildBrief()) + App.state.uploadedDocs
// Output: brain object stored in App.state.brain
// ─────────────────────────────────────────────────────────────────────────────

window.GenerationBrain = {

  // ── Single-deck module definitions ─────────────────────────────────────────
  DECK_TYPE_MODULES: {
    'executive-summary': {
      sections: ['context', 'problem', 'solution', 'ask'],
      layoutBias: 'text-stat',
      storyStrategy: 'decision-first',
      slideRange: { thin: [3,5], medium: [5,7], rich: [6,8] },
    },
    'vision-narrative': {
      sections: ['opening', 'context', 'vision', 'ambition', 'next-steps'],
      layoutBias: 'image-heavy',
      storyStrategy: 'aspiration-first',
      slideRange: { thin: [10,14], medium: [14,18], rich: [16,22] },
    },
    'product-ux': {
      sections: ['overview', 'user-journey', 'product-deep-dive', 'evidence', 'roadmap'],
      layoutBias: 'split-image',
      storyStrategy: 'experience-led',
      slideRange: { thin: [12,16], medium: [16,22], rich: [20,30] },
    },
    'tech-architecture': {
      sections: ['problem', 'architecture', 'capability', 'integration', 'governance', 'next-steps'],
      layoutBias: 'diagram-data',
      storyStrategy: 'credibility-first',
      slideRange: { thin: [8,12], medium: [12,18], rich: [15,25] },
    },
    'delivery-roadmap': {
      sections: ['summary', 'phases', 'milestones', 'workstreams', 'risks'],
      layoutBias: 'timeline-data',
      storyStrategy: 'now-near-next',
      slideRange: { thin: [6,9], medium: [9,12], rich: [10,15] },
    },
    'commercial-roi': {
      sections: ['investment', 'value', 'roi-model', 'ask'],
      layoutBias: 'stat-heavy',
      storyStrategy: 'numbers-first',
      slideRange: { thin: [4,6], medium: [6,8], rich: [7,10] },
    },
    'governance-model': {
      sections: ['context', 'operating-model', 'roles', 'decision-rights', 'change-path'],
      layoutBias: 'diagram-data',
      storyStrategy: 'structure-first',
      slideRange: { thin: [6,9], medium: [9,12], rich: [10,15] },
    },
    'change-adoption': {
      sections: ['why-change', 'journey', 'enablement', 'measurement'],
      layoutBias: 'human-image',
      storyStrategy: 'empathy-first',
      slideRange: { thin: [4,6], medium: [6,8], rich: [7,10] },
    },
    'industry-lens': {
      sections: ['market-context', 'trends', 'ps-position', 'opportunity'],
      layoutBias: 'stat-image',
      storyStrategy: 'context-first',
      slideRange: { thin: [3,5], medium: [5,7], rich: [6,8] },
    },
    'custom': {
      sections: ['opening', 'context', 'solution', 'evidence', 'next-steps'],
      layoutBias: 'balanced',
      storyStrategy: 'brief-driven',
      slideRange: { thin: [5,8], medium: [8,14], rich: [12,22] },
    },
  },

  // ── Proposal bundle definitions ─────────────────────────────────────────────
  //
  // role values:
  //   'structural'  — context, problem, vision; frames the situation
  //   'synthesis'   — solution, delivery; GENERATED content tailored to client problem
  //   'retrieval'   — why-company, team; RETRIEVED from knowledge base
  //   'commercial'  — ROI, investment, value case
  //   'proof'       — case studies, evidence, appendix
  //   'closing'     — summary + next steps; must appear before appendix
  //
  PROPOSAL_BUNDLES: {
    'lean': {
      modules: ['executive-summary', 'solution', 'commercial-roi'],
      sections: [
        { sectionId: 'exec-framing', role: 'structural',  title: 'The Opportunity',      purpose: 'Frame the client problem and strategic context — specific to this client, this moment',                                                               targetSlides: 3 },
        { sectionId: 'our-solution', role: 'synthesis',   title: 'Our Approach',          purpose: 'SYNTHESIS — construct a tailored solution for this client\'s problem: what we build, how it works, key components. Do NOT reuse company brochure content.', targetSlides: 4 },
        { sectionId: 'why-company',  role: 'retrieval',   title: 'Why Publicis Sapient',  purpose: 'RETRIEVAL — use knowledge base: relevant capabilities, platforms, accelerators, differentiators, and credentials',                                    targetSlides: 2 },
        { sectionId: 'commercial',   role: 'commercial',  title: 'Commercial Model',      purpose: 'Investment, value exchange, and ROI summary',                                                                                                          targetSlides: 2 },
        { sectionId: 'closing',      role: 'closing',     title: 'Summary & Next Steps',  purpose: 'Restate the central argument, state the ask, define concrete next steps with owners and timing',                                                       targetSlides: 1 },
      ],
      storyStrategy: 'fast-pitch',
      slideRange: { thin: [12,16], medium: [16,20], rich: [18,24] },
    },
    'standard': {
      modules: ['executive-summary', 'problem', 'vision', 'solution', 'delivery', 'commercial-roi'],
      sections: [
        { sectionId: 'exec-summary', role: 'structural',  title: 'Executive Summary',     purpose: 'Decision-ready overview for C-suite — thesis of why, what, and ask',                                                                                  targetSlides: 3 },
        { sectionId: 'problem',      role: 'structural',  title: 'The Challenge',          purpose: 'Diagnose the client\'s current state — specific pain points, root causes, and cost of inaction',                                                      targetSlides: 3 },
        { sectionId: 'vision',       role: 'structural',  title: 'Future State',           purpose: 'The destination — what the client\'s world looks like when this succeeds',                                                                            targetSlides: 3 },
        { sectionId: 'solution',     role: 'synthesis',   title: 'Our Solution',           purpose: 'SYNTHESIS — construct the tailored solution: solution overview slide, components/architecture slide, then supporting detail. Do NOT reuse company brochure content.', targetSlides: 5 },
        { sectionId: 'why-company',  role: 'retrieval',   title: 'Why Publicis Sapient',   purpose: 'RETRIEVAL — use knowledge base: relevant PS capabilities, platforms, accelerators, differentiators, and credentials',                                 targetSlides: 3 },
        { sectionId: 'delivery',     role: 'synthesis',   title: 'Delivery Approach',      purpose: 'SYNTHESIS — tailored delivery model: phases, milestones, team structure, and key decisions relevant to this engagement',                              targetSlides: 3 },
        { sectionId: 'commercial',   role: 'commercial',  title: 'Commercial Proposal',    purpose: 'Investment model, ROI, and value case',                                                                                                               targetSlides: 3 },
        { sectionId: 'closing',      role: 'closing',     title: 'Summary & Next Steps',   purpose: 'Reinforce the central argument, state the decision ask, define next steps with owners and dates',                                                     targetSlides: 2 },
        { sectionId: 'appendix',     role: 'proof',       title: 'Appendix',               purpose: 'Supporting evidence — case studies, team credentials, technical depth',                                                                               targetSlides: 3 },
      ],
      storyStrategy: 'full-narrative',
      slideRange: { thin: [22,28], medium: [28,36], rich: [34,44] },
    },
    'full-fat': {
      modules: ['executive-summary', 'problem', 'market-context', 'vision', 'solution', 'platform', 'delivery', 'governance', 'commercial-roi', 'risk', 'appendix'],
      sections: [
        { sectionId: 'exec-summary', role: 'structural',  title: 'Executive Summary',          purpose: 'Top-line thesis and decision ask',                                                                                                                targetSlides: 3 },
        { sectionId: 'market',       role: 'structural',  title: 'Market & Industry Context',   purpose: 'Industry trends, competitive dynamics, and urgency',                                                                                             targetSlides: 3 },
        { sectionId: 'problem',      role: 'structural',  title: 'Client Challenge',             purpose: 'Detailed diagnosis of current state problems — specific, evidence-backed',                                                                      targetSlides: 4 },
        { sectionId: 'vision',       role: 'structural',  title: 'Future Vision',                purpose: 'Strategic future state and aspiration',                                                                                                         targetSlides: 3 },
        { sectionId: 'solution',     role: 'synthesis',   title: 'Our Solution',                 purpose: 'SYNTHESIS — must include: (1) Solution Overview slide, (2) Solution Components/Architecture slide, then supporting detail slides. Content is tailored to this client\'s problem. Do NOT reuse company brochure content here.', targetSlides: 5 },
        { sectionId: 'why-company',  role: 'retrieval',   title: 'Why Publicis Sapient',         purpose: 'RETRIEVAL — use knowledge base: PS capabilities, PACE platform, AI/data expertise, accelerators, differentiators, and credentials relevant to this client', targetSlides: 4 },
        { sectionId: 'platform',     role: 'synthesis',   title: 'Platform & Technology',        purpose: 'SYNTHESIS — technical architecture, AI approach, and platform strategy tailored to this client\'s context and constraints',                     targetSlides: 4 },
        { sectionId: 'delivery',     role: 'synthesis',   title: 'Delivery Model',               purpose: 'SYNTHESIS — phased delivery plan, workstreams, and milestones specific to this engagement',                                                     targetSlides: 4 },
        { sectionId: 'governance',   role: 'synthesis',   title: 'Governance & Operating Model', purpose: 'SYNTHESIS — how decisions, roles, and change management are structured for this programme',                                                     targetSlides: 3 },
        { sectionId: 'commercial',   role: 'commercial',  title: 'Commercial Proposal',          purpose: 'Investment, ROI case, and commercial terms',                                                                                                    targetSlides: 4 },
        { sectionId: 'risk',         role: 'synthesis',   title: 'Risk & Mitigation',            purpose: 'Key programme risks and mitigation approach — relevant to this engagement',                                                                     targetSlides: 2 },
        { sectionId: 'team',         role: 'retrieval',   title: 'Our Team',                     purpose: 'RETRIEVAL — key team members relevant to this engagement; factual descriptions only, no CTA or promotional language',                           targetSlides: 2 },
        { sectionId: 'closing',      role: 'closing',     title: 'Summary & Next Steps',         purpose: 'Reinforce why this matters, restate the decision ask, define next steps with owners and dates',                                                 targetSlides: 2 },
        { sectionId: 'appendix',     role: 'proof',       title: 'Appendix',                     purpose: 'Case studies, technical depth, supporting data',                                                                                                targetSlides: 4 },
      ],
      storyStrategy: 'comprehensive',
      slideRange: { thin: [38,46], medium: [46,58], rich: [55,72] },
    },
  },

  // ── Story strategy modifiers by deck type + industry ───────────────────────
  STORY_MODIFIERS: {
    'executive-summary+financial-services': 'Regulatory and compliance framing first. Decision-speed matters. Use cost/risk reduction as primary hooks.',
    'executive-summary+retail':             'Customer experience and profitability lens. Show omnichannel and supply chain connection early.',
    'executive-summary+health':             'Patient outcomes and operational efficiency. Compliance and data governance are table stakes.',
    'executive-summary+public-sector':      'Value for money, modernisation mandate, citizen outcomes. Avoid commercial-feel language.',
    'standard+retail':                      'Omnichannel transformation narrative. Connect supply chain, commerce, and loyalty. Personalisation at scale.',
    'standard+financial-services':          'Regulatory modernisation, digital-first banking, AI in compliance and risk. Trust and resilience.',
    'standard+health':                      'Clinical workflow automation, patient-facing digital, data interoperability. Safety-first.',
    'standard+tmt':                         'Platform modernisation, subscriber experience, AI-native product development. Speed to market.',
    'standard+public-sector':               'Systems of record modernisation, citizen services transformation, procurement narrative.',
    'full-fat+public-sector':               'Full transformation case: legacy systems, digital public services, governance, workforce enablement.',
    'full-fat+financial-services':          'End-to-end transformation: core banking, AI risk models, cloud migration, regulatory change.',
    'tech-architecture+public-sector':      'Systems thinking, integration architecture, data sovereignty, modernisation of legacy platforms.',
    'tech-architecture+financial-services': 'Cloud, AI risk infrastructure, API banking, real-time data. Regulatory compliance by design.',
    'vision-narrative+retail':              'Emotional story of unified commerce. One customer view. The future store and digital shelf.',
    'commercial-roi+any':                   'Every claim must link to a financial outcome. Investment → value → return. Numbers drive the narrative.',
  },

  // ── Layout bias rules ───────────────────────────────────────────────────────
  LAYOUT_BIAS_RULES: {
    'text-stat':    'Favour text + stats layouts. Minimise image slots. Hero slides for opens/closes only.',
    'image-heavy':  'Favour hero and image-right layouts. Use visuals to carry the narrative. Data slides get stats layout.',
    'split-image':  'Mix of image-right and bullets layouts. Show experience and evidence in equal measure.',
    'diagram-data': 'Favour bullets and stats layouts. Reserve image slots for architecture/concept visuals only.',
    'timeline-data':'Stats and bullets dominant. Hero for chapter markers. No decorative images.',
    'stat-heavy':   'Every non-hero slide should carry at least one KPI. Stats layout preferred. Charts over photography.',
    'human-image':  'Warm human imagery. Hero and split layouts. Avoid pure data slides unless proving adoption.',
    'stat-image':   'Alternate between stats and image-right. Context slides get images; proof slides get stats.',
    'balanced':     'Equal mix of layouts — let the content lead. No strong visual bias.',
  },

  // ── Tone layout strategies ──────────────────────────────────────────────────
  // Derived from toneId. Controls slide type preferences, density, and emphasis.
  // Stored as brain.layoutStrategy (object) + brain.layoutStrategyBlock (prompt string).
  LAYOUT_STRATEGIES: {
    'data': {
      preferredSlideTypes: ['stats', 'comparison', 'kpi'],
      avoidedSlideTypes:   ['concept-only', 'image-only'],
      visualDensity:       'low',
      textDensity:         'high',
      emphasis:            ['metrics', 'benchmarks', 'proof-points'],
    },
    'visionary': {
      preferredSlideTypes: ['concept', 'hero', 'big-idea'],
      avoidedSlideTypes:   ['dense-bullets', 'kpi-grid'],
      visualDensity:       'high',
      textDensity:         'low',
      emphasis:            ['future-state', 'transformation', 'big-picture'],
    },
    'executive': {
      preferredSlideTypes: ['summary', 'structured', 'decision'],
      avoidedSlideTypes:   ['image-heavy', 'decorative'],
      visualDensity:       'low',
      textDensity:         'medium',
      emphasis:            ['decisions', 'outcomes', 'recommendations'],
    },
    'punchy': {
      preferredSlideTypes: ['headline', 'minimal', 'single-idea'],
      avoidedSlideTypes:   ['long-bullets', 'multi-column'],
      visualDensity:       'medium',
      textDensity:         'low',
      emphasis:            ['single-message', 'impact', 'brevity'],
    },
    'warm': {
      preferredSlideTypes: ['journey', 'explanatory', 'human-story'],
      avoidedSlideTypes:   ['pure-data', 'dense-technical'],
      visualDensity:       'medium',
      textDensity:         'medium',
      emphasis:            ['human-impact', 'journey', 'connection'],
    },
  },

  // ── Knowledge files always loaded ──────────────────────────────────────────
  PS_KNOWLEDGE_FILES: [
    'ps/ps_core.md',
    'ps/ps_power_of_one.md',
    'ps/ps_ai.md',
  ],

  // ── Section priority weights ────────────────────────────────────────────────
  // Used by allocateSections() to weight how many detail slides each section gets.
  // Higher = deserves more depth. Default for unlisted sections = 2.
  SECTION_PRIORITY_WEIGHTS: {
    // High (3)
    solution: 3, 'our-solution': 3, 'our-approach': 3,
    problem: 3, architecture: 3, 'product-deep-dive': 3, 'roi-model': 3,
    // Medium-high (2–2.5)
    delivery: 2.5, commercial: 2.5, platform: 2.5,
    'user-journey': 2.5, phases: 2.5, milestones: 2.5,
    investment: 2.5, value: 2.5, journey: 2.5,
    // Medium (2)
    'exec-summary': 2, 'exec-framing': 2, vision: 2,
    'why-company': 2, closing: 2, enablement: 2,
    'why-change': 2, workstreams: 2,
    // Medium-low (1.5)
    context: 1.5, opening: 1.5, overview: 1.5, summary: 1.5,
    governance: 1.5, integration: 1.5, capability: 1.5, ambition: 1.5,
    risk: 1.5, risks: 1.5, evidence: 1.5, opportunity: 1.5,
    'next-steps': 1.5, ask: 1.5, 'change-path': 1.5, measurement: 1.5,
    'decision-rights': 1.5, roles: 1.5, 'operating-model': 1.5,
    // Low (1)
    market: 1, 'market-context': 1, appendix: 1,
    team: 1, 'ps-position': 1, trends: 1,
  },

  // ── Deck-type weight multipliers ────────────────────────────────────────────
  // Applied when buildMode === 'single-deck'. _all applies globally to every section.
  DECK_TYPE_WEIGHT_MODIFIERS: {
    'executive-summary': { _all: 0.7,  problem: 1.4,  solution: 1.2 },
    'vision-narrative':  { vision: 1.8, ambition: 1.6, opening: 1.4, commercial: 0.5, solution: 0.7 },
    'product-ux':        { 'product-deep-dive': 1.8, 'user-journey': 1.6, solution: 1.3, evidence: 1.3 },
    'tech-architecture': { architecture: 1.8, solution: 1.4, integration: 1.5, capability: 1.3 },
    'delivery-roadmap':  { phases: 1.8, milestones: 1.6, workstreams: 1.4, context: 0.6, summary: 0.8 },
    'commercial-roi':    { 'roi-model': 1.8, investment: 1.5, value: 1.5, solution: 0.7 },
    'change-adoption':   { journey: 1.8, enablement: 1.5, 'why-change': 1.5, measurement: 1.3 },
  },

  // ── Proposal-size caps (max detail slides per section) ─────────────────────
  PROPOSAL_SIZE_SECTION_CAPS: {
    lean:       { 'why-company': 2, team: 1, appendix: 2, governance: 1, market: 1, risk: 1 },
    standard:   { 'why-company': 3, team: 2, appendix: 3 },
    'full-fat': { 'why-company': 4, team: 2, appendix: 4 },
  },

  // ── Main resolver ───────────────────────────────────────────────────────────
  /**
   * Build the generation brain from the Phase 1 brief.
   * Returns the brain object AND stores it in App.state.brain.
   * Does NOT make any API calls — pure synchronous computation.
   */
  resolve(brief, uploadedDocs) {
    const {
      buildMode       = 'single-deck',
      deckTypeId      = 'custom',
      proposalSizeId  = 'standard',
      toneId          = 'visionary',
      industryKey     = null,
      richnessBand    = 'medium',
      richnessScore   = 5,
    } = brief || {};

    const docs = Array.isArray(uploadedDocs) ? uploadedDocs : [];
    const docRichness = docs.filter(d => d.text && d.text.length > 500).length;

    // ── 1. Decide active module config ───────────────────────────────────────
    let moduleDef, selectedModules, sections, storyStrategy, slideRange, layoutBias;

    if (buildMode === 'single-deck') {
      moduleDef       = this.DECK_TYPE_MODULES[deckTypeId] || this.DECK_TYPE_MODULES['custom'];
      selectedModules = [deckTypeId];
      storyStrategy   = moduleDef.storyStrategy;
      slideRange      = moduleDef.slideRange[richnessBand] || moduleDef.slideRange['medium'];
      layoutBias      = moduleDef.layoutBias;

      // Build sections from module section names
      sections = moduleDef.sections.map((sId) => ({
        sectionId:    sId,
        role:         this._sectionRole(sId),
        title:        this._sectionTitle(sId, deckTypeId),
        purpose:      this._sectionPurpose(sId, deckTypeId),
        moduleSource: deckTypeId,
        targetSlides: Math.max(2, Math.round((slideRange[0] + slideRange[1]) / 2 / moduleDef.sections.length)),
        needsDivider: true,
      }));
    } else {
      // full-proposal
      const bundle    = this.PROPOSAL_BUNDLES[proposalSizeId] || this.PROPOSAL_BUNDLES['standard'];
      selectedModules = bundle.modules;
      storyStrategy   = bundle.storyStrategy;
      slideRange      = bundle.slideRange[richnessBand] || bundle.slideRange['medium'];
      layoutBias      = 'balanced';
      sections        = bundle.sections.map((s, i) => ({
        ...s,
        moduleSource: selectedModules[Math.min(i, selectedModules.length - 1)] || 'proposal',
        needsDivider: true,
      }));
    }

    // ── 2. Apply story strategy modifier ────────────────────────────────────
    const modifierKey = `${buildMode === 'single-deck' ? deckTypeId : proposalSizeId}+${industryKey || 'none'}`;
    const storyModifier =
      this.STORY_MODIFIERS[modifierKey] ||
      this.STORY_MODIFIERS[`${buildMode === 'single-deck' ? deckTypeId : proposalSizeId}+any`] ||
      '';

    // ── 3. Calculate target slide count ─────────────────────────────────────
    const [minSlides, maxSlides] = slideRange;
    let targetSlides;
    if (richnessBand === 'thin')   targetSlides = minSlides;
    else if (richnessBand === 'rich') targetSlides = Math.round(minSlides + 0.7 * (maxSlides - minSlides));
    else                           targetSlides = Math.round((minSlides + maxSlides) / 2);
    // Bonus for uploaded documents
    targetSlides = Math.min(maxSlides, targetSlides + Math.min(docRichness, 2));

    // ── Budget: 1 title + 1 divider per section + detail slides = total ──────
    // Reserve mandatory structural slots first; remainder goes to detail content.
    const TITLE_SLOTS = 1;
    let detailBudget = targetSlides - TITLE_SLOTS - sections.length;

    // If too compressed: drop last section(s) until every section can have ≥1 detail slide
    while (detailBudget < sections.length && sections.length > 1) {
      sections = sections.slice(0, -1);
      detailBudget = targetSlides - TITLE_SLOTS - sections.length;
    }
    detailBudget = Math.max(sections.length, detailBudget); // guarantee ≥1 detail per section

    // Re-distribute detailBudget across sections proportionally
    const rawSectionTotal = sections.reduce((sum, s) => sum + s.targetSlides, 0);
    sections = sections.map(sec => ({
      ...sec,
      targetSlides: Math.max(1, Math.round((sec.targetSlides / rawSectionTotal) * detailBudget)),
    }));

    // Snap targetSlides to actual budget (rounding may drift by 1-2)
    targetSlides = TITLE_SLOTS + sections.reduce((sum, s) => sum + 1 + s.targetSlides, 0);

    // ── 4. Proof strategy ────────────────────────────────────────────────────
    let proofStrategy = 'use brief evidence';
    if (richnessScore >= 8) proofStrategy = 'rich brief — use named data points and specific claims from context';
    else if (richnessScore >= 4) proofStrategy = 'medium brief — blend brief evidence with industry proof points from knowledge base';
    else proofStrategy = 'thin brief — use industry proof points from knowledge base; embed <<REPLACE:...>> for missing client specifics';

    // ── 5. Risk flags ────────────────────────────────────────────────────────
    const riskFlags = [];
    if (!brief?.clientName) riskFlags.push('no-client-name');
    if (!brief?.audience)   riskFlags.push('no-audience');
    if (!brief?.objective)  riskFlags.push('no-objective');
    if (richnessScore < 3)  riskFlags.push('thin-brief-low-confidence');
    if (docs.length > 0 && docRichness === 0) riskFlags.push('docs-attached-but-no-text-extracted');

    // ── 6. Knowledge files ───────────────────────────────────────────────────
    const knowledgeFiles = [...this.PS_KNOWLEDGE_FILES];
    if (industryKey) knowledgeFiles.push(`industry/${industryKey}.md`);

    // ── 7. Assemble and store brain ──────────────────────────────────────────
    const brain = {
      buildMode,
      deckTypeId:     buildMode === 'single-deck' ? deckTypeId : null,
      proposalSizeId: buildMode === 'full-proposal' ? proposalSizeId : null,
      toneId,
      industryKey:    industryKey || null,
      richnessBand,
      richnessScore,
      selectedModules,
      knowledgeFiles,
      targetSlides,
      dividerCount:   sections.length,
      storyStrategy:  storyModifier ? `${storyStrategy} — ${storyModifier}` : storyStrategy,
      proofStrategy,
      layoutBias,
      layoutBiasGuide:     this.LAYOUT_BIAS_RULES[layoutBias] || '',
      layoutStrategy:      this.getLayoutStrategy(toneId),
      layoutStrategyBlock: this._layoutStrategyBlock(toneId),
      riskFlags,
      sections,
      // Used by enforceStructure to synthesize a title slide if the LLM omits it
      _deckTitle:     brief?.clientName ? `${brief.clientName}` : 'Presentation',
      _deckHeadline:  brief?.objective  || '',
    };

    App.state.brain = brain;
    App.state.layoutStrategy = brain.layoutStrategy;
    return brain;
  },

  /**
   * Return the layout strategy object for a given toneId.
   * Falls back to 'executive' strategy if the toneId is not recognised.
   */
  getLayoutStrategy(toneId) {
    return this.LAYOUT_STRATEGIES[toneId] || this.LAYOUT_STRATEGIES['executive'];
  },

  /**
   * Serialise the layout strategy for a given toneId into an actionable
   * prompt block string, ready for injection into the generation prompt.
   */
  _layoutStrategyBlock(toneId) {
    const BLOCKS = {
      'data':
        `LAYOUT STRATEGY — DATA-DRIVEN:\n` +
        `- Use stats layout (stat1 + stat2 filled) for every proof, value, and ROI slide\n` +
        `- Include 4–5 bullets per content slide where content supports it\n` +
        `- Every content slide headline must contain a quantified claim or measurable target\n` +
        `- Prefer split layout for solution slides — evidence alongside description\n` +
        `- Avoid hero-only or concept-only slides except for the title and section dividers`,

      'visionary':
        `LAYOUT STRATEGY — VISIONARY:\n` +
        `- Keep bullet count low — 2–3 per slide maximum\n` +
        `- Use hero and split layouts that give headlines room to breathe\n` +
        `- Use stats layout only for the most essential proof points — not as a default\n` +
        `- Solution and vision slides should feel conceptual and spacious, not dense\n` +
        `- Divider slides must carry a bold standalone headline — not just the section title`,

      'executive':
        `LAYOUT STRATEGY — EXECUTIVE:\n` +
        `- Prefer bullets and structured summary layouts\n` +
        `- Max 3–4 bullets per slide — remove all supporting detail that does not change the decision\n` +
        `- Stats layout is appropriate for commercial, ROI, and proof sections\n` +
        `- Avoid decorative or image-only slides outside of title and dividers\n` +
        `- Every slide must be readable and actionable in under 10 seconds`,

      'punchy':
        `LAYOUT STRATEGY — PUNCHY:\n` +
        `- 2–3 bullets per slide maximum — each one line only\n` +
        `- Headlines carry the entire message — bullets are supporting evidence only\n` +
        `- Use hero layout for any slide where one idea can stand alone\n` +
        `- Stats layout for any proof or value slide — numbers only, no explanatory copy\n` +
        `- If a slide can be merged into another without losing signal, merge it`,

      'warm':
        `LAYOUT STRATEGY — WARM & HUMAN:\n` +
        `- Use split layout frequently to pair ideas with human context\n` +
        `- Keep bullets moderate — 3–4 per slide, each written as a complete readable thought\n` +
        `- Journey and change-path slides should use split or bullets layout with human-focused framing\n` +
        `- Avoid pure stats slides except in commercial sections — prefer text that explains the number\n` +
        `- Divider slides should feel welcoming and orienting, not assertive`,
    };
    return BLOCKS[toneId] || BLOCKS['executive'];
  },

  // ── Helpers ─────────────────────────────────────────────────────────────────
  _sectionTitle(sectionId, deckTypeId) {
    const map = {
      'context':        'Context',
      'problem':        'The Challenge',
      'solution':       'Our Solution',
      'ask':            'The Ask',
      'opening':        'Opening',
      'vision':         'Future Vision',
      'ambition':       'The Ambition',
      'next-steps':     'Next Steps',
      'overview':       'Overview',
      'user-journey':   'User Journey',
      'product-deep-dive': 'Product Deep Dive',
      'evidence':       'Evidence & Proof',
      'roadmap':        'Roadmap',
      'architecture':   'Architecture',
      'capability':     'Capability',
      'integration':    'Integration',
      'governance':     'Governance',
      'summary':        'Summary',
      'phases':         'Phases',
      'milestones':     'Milestones',
      'workstreams':    'Workstreams',
      'risks':          'Risks',
      'investment':     'Investment',
      'value':          'Value',
      'roi-model':      'ROI Model',
      'operating-model':'Operating Model',
      'roles':          'Roles & Responsibilities',
      'decision-rights':'Decision Rights',
      'change-path':    'Path to Change',
      'why-change':     'Why Change Now',
      'journey':        'The Change Journey',
      'enablement':     'Enablement',
      'measurement':    'Measuring Success',
      'market-context': 'Market Context',
      'market':         'Market & Industry Context',
      'trends':         'Trends & Signals',
      'ps-position':    'PS Position',
      'opportunity':    'The Opportunity',
      'why-company':    'Why Publicis Sapient',
      'closing':        'Summary & Next Steps',
      'team':           'Our Team',
      'proof-cases':    'Proof & Case Studies',
      'exec-framing':   'The Opportunity',
      'our-solution':   'Our Approach',
    };
    return map[sectionId] || sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  _sectionPurpose(sectionId, deckTypeId) {
    const map = {
      'context':        'Set the scene — what is happening in the client\'s world that makes this relevant now',
      'problem':        'Diagnose the core challenge — specific, evidence-backed, felt by the audience',
      'solution':       'SYNTHESIS — construct a tailored solution for this client\'s specific problem: solution overview, components/architecture, and how it solves the problem. Do NOT reuse company brochure content.',
      'ask':            'State what we need — decision, next step, investment, or sign-off',
      'opening':        'Establish tone and strategic framing for the rest of the deck',
      'vision':         'Paint a compelling picture of the future state — aspiration before architecture',
      'ambition':       'Articulate the scale and boldness of the transformation opportunity',
      'next-steps':     'Concrete, time-bound actions the audience can take immediately',
      'overview':       'Frame the scope and structure of what follows',
      'user-journey':   'Show the human experience from the user\'s perspective',
      'product-deep-dive': 'Go deep on product, features, and functional detail',
      'evidence':       'Ground claims in proof — case studies, data, outcomes',
      'roadmap':        'Show the path — what happens when, in what order',
      'architecture':   'Explain how the technical components fit together',
      'capability':     'Demonstrate PS\'s relevant technical and domain expertise',
      'integration':    'Show how this solution connects to existing systems',
      'governance':     'Define how decisions, accountability, and change are managed',
      'summary':        'Crisp high-level view of what follows',
      'phases':         'Break the programme into logical delivery phases',
      'milestones':     'Define the key moments that mark progress',
      'workstreams':    'Show the parallel threads of activity',
      'risks':          'Surface key risks and show PS mitigation approach',
      'investment':     'Set out the commercial ask with clarity',
      'value':          'Describe the value the client will receive',
      'roi-model':      'Quantify the return on investment',
      'operating-model':'Describe how the new model will run day-to-day',
      'roles':          'Clarify who does what in the new structure',
      'decision-rights':'Establish who owns which decisions',
      'change-path':    'Show how to get from current to future state',
      'why-change':     'Make the case for change — urgency, cost of inaction',
      'journey':        'Describe the adoption journey from the human perspective',
      'enablement':     'Show the support, training, and tools people will have',
      'measurement':    'Define how success will be tracked and demonstrated',
      'market-context': 'Anchor the conversation in relevant industry dynamics',
      'market':         'Anchor in industry dynamics and trends that create urgency for the client',
      'trends':         'Highlight signals and trends that create urgency',
      'ps-position':    'Show how PS is uniquely positioned for this opportunity',
      'opportunity':    'Crystallise the specific opportunity being addressed',
      'why-company':    'RETRIEVAL — draw from knowledge base: relevant capabilities, platforms, accelerators, differentiators, and credentials. This is where company content belongs.',
      'closing':        'Closing sequence — restate the central argument, state the decision ask clearly, define 2–3 concrete next steps with owners and timing',
      'team':           'RETRIEVAL — introduce key team members relevant to this engagement. Factual descriptions only. No CTA, no promotional language. One overview slide if no bio data exists.',
      'proof-cases':    'RETRIEVAL — case studies and outcome evidence directly relevant to the client\'s challenge',
      'exec-framing':   'Frame the client problem and strategic context — specific to this client, this moment',
      'our-solution':   'SYNTHESIS — construct the tailored solution for this client\'s problem: what we build, how it works, key components. Do NOT reuse company brochure content.',
    };
    return map[sectionId] || `Deliver the ${sectionId} section of this deck`;
  },

  /**
   * Return the generation role for a section ID.
   * Used to annotate sections in toPromptBlock so the LLM knows what mode to use.
   */
  _sectionRole(sectionId) {
    const roleMap = {
      'solution':       'synthesis',
      'our-solution':   'synthesis',
      'platform':       'synthesis',
      'delivery':       'synthesis',
      'governance':     'synthesis',
      'risk':           'synthesis',
      'risks':          'synthesis',
      'architecture':   'synthesis',
      'roadmap':        'synthesis',
      'why-company':    'retrieval',
      'capability':     'retrieval',
      'ps-position':    'retrieval',
      'team':           'retrieval',
      'evidence':       'proof',
      'appendix':       'proof',
      'proof-cases':    'proof',
      'commercial':     'commercial',
      'investment':     'commercial',
      'roi-model':      'commercial',
      'value':          'commercial',
      'closing':        'closing',
      'next-steps':     'closing',
      'ask':            'closing',
    };
    return roleMap[sectionId] || 'structural';
  },

  /**
   * Build a formatted string representation of the brain for prompt injection.
   * Used by Phase 2 and Phase 3.
   */
  toPromptBlock(brain) {
    const detailCount = brain.sections.reduce((sum, s) => sum + s.targetSlides, 0);

    // Build an explicit numbered slot list the LLM must fill in order
    const ROLE_LABEL = {
      synthesis:  'SYNTHESIS',
      retrieval:  'RETRIEVAL',
      commercial: 'COMMERCIAL',
      proof:      'PROOF',
      closing:    'CLOSING',
      structural: 'STRUCTURAL',
    };

    const slots = [];
    let slotNum = 1;
    slots.push(`  ${slotNum++}. [TITLE SLIDE — MANDATORY] type=title, layout=hero — Deck title and opening hook`);
    for (const section of brain.sections) {
      const roleTag = ROLE_LABEL[section.role] || 'STRUCTURAL';
      const depthHint = section.priority === 'high' ? ', DEEP CONTENT' : section.priority === 'low' ? ', KEEP CONCISE' : '';
      slots.push(`  ${slotNum++}. [SECTION DIVIDER — MANDATORY, ${roleTag}${depthHint}] type=divider, layout=hero — Section: "${section.title}"`);
      for (let d = 0; d < section.targetSlides; d++) {
        let hint;

        if (section.promotedConcepts && d < section.promotedConcepts.length) {
          // Named concept slot — give the LLM a precise slide blueprint
          const pc = section.promotedConcepts[d];
          const synthNote = pc.noFurtherExpansion
            ? ' [SYNTHESIS SLIDE — show relationships and flows; do NOT re-list or re-expand the components already covered in pillar slides]'
            : '';
          hint = `"${section.title}" — ${pc.slotLabel}: ${pc.hint || pc.title} [layout: ${pc.visualType || 'split'}]${synthNote}`;
        } else if (section.role === 'synthesis' && d === 0) {
          hint = `"${section.title}" — SOLUTION OVERVIEW slide (high-level concept, not company capabilities)`;
        } else if (section.role === 'synthesis' && d === 1) {
          hint = `"${section.title}" — COMPONENTS/ARCHITECTURE slide (key building blocks tailored to this client)`;
        } else {
          hint = `"${section.title}" detail slide ${d + 1} of ${section.targetSlides}`;
        }

        slots.push(`  ${slotNum++}. [CONTENT, ${roleTag}] type=content — ${hint}`);
      }
    }

    return (
      `GENERATION STRATEGY:\n` +
      `- Story strategy: ${brain.storyStrategy}\n` +
      `- Proof strategy: ${brain.proofStrategy}\n` +
      `- Layout bias: ${brain.layoutBias} — ${brain.layoutBiasGuide}\n` +
      (brain.riskFlags.length ? `- Risk flags: ${brain.riskFlags.join(', ')} — adapt copy accordingly\n` : '') +
      (brain.layoutStrategyBlock ? `\n${brain.layoutStrategyBlock}\n` : '') +
      `\nMANDATORY SLIDE STRUCTURE — ${brain.targetSlides} slides total:\n` +
      `Budget breakdown: 1 title + ${brain.dividerCount} section dividers + ${detailCount} content = ${brain.targetSlides} slides\n` +
      `\nREQUIRED SLIDE ORDER (follow exactly):\n` +
      slots.join('\n') + '\n' +
      `\nSTRUCTURE RULES — NON-NEGOTIABLE:\n` +
      `- Slide 1 MUST be type=title. Do not skip it or replace it with a content slide.\n` +
      `- Every [SECTION DIVIDER] slot MUST appear. Do not omit or merge any section divider.\n` +
      `- type field: set to "title" for the deck title slide, "divider" for every section chapter slide, "content" for all other slides\n` +
      `- Divider slides: type="divider", layout="hero", title=section name, subtitle=section name, headline=what this section argues, body=[]\n` +
      `- Title slide: type="title", layout="hero", title=deck title, headline=opening hook or tagline, body=[]\n` +
      `- Return exactly ${brain.targetSlides} slides in the order listed above\n` +
      `\nSYNTHESIS vs RETRIEVAL RULES:\n` +
      `- [SYNTHESIS] sections (Our Solution, Delivery, Platform, etc.): generate TAILORED content specific to THIS client\'s problem and context.\n` +
      `  - Every SYNTHESIS section MUST include: (1) a Solution Overview slide — high-level concept of what is being built/done, (2) a Components/Architecture slide — key layers, modules, or workstreams tailored to the client.\n` +
      `  - Do NOT place company capability descriptions, product names, or platform marketing here.\n` +
      `  - Content must answer: What are we building? How does it work? What are the key parts? How does it solve the problem?\n` +
      `- [RETRIEVAL] sections (Why Publicis Sapient, Our Team): draw from the KNOWLEDGE BASE.\n` +
      `  - Use capabilities, platforms, accelerators, differentiators, and credentials from the knowledge block.\n` +
      `  - This is the ONLY place where company capability content belongs.\n` +
      `- [CLOSING] sections: end with the deck\'s central argument restated as a conviction statement, the specific decision ask, and 2–3 concrete next steps with timing.\n` +
      `  - The deck MUST NOT end on Team, Case Studies, or Appendix.\n` +
      `  - If appendix exists, Closing must appear before it.\n` +
      `- Team slides (role=retrieval): factual descriptions only — who the person is and why they are relevant to this engagement. No CTA, no "let\'s talk" language. If no bio data exists in the brief, write one team overview slide maximum.\n` +
      `- Placeholder rule: NEVER output <<REPLACE:...>> or [INPUT REQUIRED] in any slide. If a specific fact is missing, use directional language: "significant reduction", "double-digit efficiency gain", "substantial cost avoidance", "up to X% based on comparable programmes".\n` +
      (brain._expandedConceptRegistry?.length ? (
        `\nCONCEPT EXPANSION REGISTRY — NON-NEGOTIABLE:\n` +
        `The following concepts have already been given their own standalone slides. Do NOT re-expand, re-list, or repeat them as new standalone concepts in any other section:\n` +
        brain._expandedConceptRegistry
          .filter(r => !r.label.startsWith('component in'))
          .map(r => `- "${r.label.replace(/^(PILLAR|COMPONENT) — /, '')}" → covered in ${r.sectionId} (${r.label})`)
          .join('\n') +
        (brain._expandedConceptRegistry.some(r => r.label.startsWith('component in'))
          ? `\n- Solution components (covered in the Architecture slide): ` +
            brain._expandedConceptRegistry
              .filter(r => r.label.startsWith('component in'))
              .map(r => r.norm.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))
              .join(', ')
          : '') +
        `\nArchitecture / integration slides: show RELATIONSHIPS and FLOWS between concepts — do NOT re-introduce component-level content already covered by pillar or component slides.\n`
      ) : '')
    );
  },

  /**
   * Format a solution concept object into a readable prompt block.
   * Injected into Phase 2 and Phase 3 prompts to anchor "Our Solution" slides.
   */
  buildSolutionConceptBlock(sc, proposalSizeId) {
    if (!sc) return '';
    const lines = [
      `OUR SOLUTION — PRE-DESIGNED CONCEPT`,
      `Use this as the foundation for all "Our Solution" section slides. Do NOT substitute PS capability language.`,
      ``,
      `Solution Name: ${sc.solutionName}`,
      `Core Idea: ${sc.coreIdea}`,
    ];

    if (sc.pillars && sc.pillars.length) {
      lines.push(``, `Pillars (use for pillar / overview slides):`);
      sc.pillars.forEach((p, i) => {
        lines.push(`  ${i + 1}. ${p.name} — ${p.description}${p.value ? ` [Value: ${p.value}]` : ''}`);
      });
    }

    if (sc.components && sc.components.length) {
      lines.push(``, `Components (use for architecture / components slide):`);
      sc.components.forEach((c, i) => {
        lines.push(`  ${i + 1}. ${c.name} — ${c.description}`);
      });
    }

    if (sc.valueNarrative) lines.push(``, `Value Narrative (use for value slide if present): ${sc.valueNarrative}`);
    if (sc.differentiation) lines.push(``, `Differentiation: ${sc.differentiation}`);

    lines.push(
      ``,
      `SLIDE MAPPING RULES FOR "OUR SOLUTION" SECTION:`,
      `- Slide 1 (Solution Overview): title = "${sc.solutionName}", headline draws from coreIdea`,
      `- Slide 2 (Pillars): one bullet per pillar name + description`,
      `- Slide 3 (Components/Architecture): one bullet per component name + description`,
      (proposalSizeId === 'full-fat' && sc.valueNarrative)
        ? `- Slide 4 (Value): headline draws from valueNarrative`
        : `- Further slides: use pillars and components for supporting detail`,
    );

    return lines.join('\n');
  },

  /**
   * Generate a structured solution concept before wireframe creation.
   * Calls the LLM with a focused consulting-design prompt grounded in the client problem.
   * PS knowledge files are NOT injected here — this is pure synthesis.
   * Result is stored in App.state.solutionConcept.
   *
   * @param {Object} brief        - App.state.brief
   * @param {Array}  uploadedDocs - App.state.uploadedDocs
   * @returns {Object|null}       - Solution concept or null on failure
   */
  async generateSolutionConcept(brief, uploadedDocs) {
    const {
      clientName     = 'the client',
      objective      = '',
      audience       = '',
      industryKey    = '',
      proposalSizeId = 'standard',
    } = brief || {};

    const docs = Array.isArray(uploadedDocs) ? uploadedDocs : [];
    const docText = docs
      .filter(d => d.text && d.text.length > 100)
      .map(d => `[${d.filename}]\n${d.text.slice(0, 3000)}`)
      .join('\n\n');

    const sizeInstructions = {
      'lean':     `LEAN — generate: 1 solutionName, 1 coreIdea, 2 pillars, 2–3 components. Keep tight. Omit valueNarrative and differentiation.`,
      'standard': `STANDARD — generate: 1 solutionName, 1 coreIdea, 3 pillars with description + value, 3–4 components, 1 valueNarrative.`,
      'full-fat': `FULL-FAT — generate: 1 solutionName, 1 coreIdea, 3–4 pillars with description + value, 4–5 components, 1 valueNarrative, 1 differentiation statement.`,
    };
    const depthGuide = sizeInstructions[proposalSizeId] || sizeInstructions['standard'];

    const prompt =
      `You are a senior management consultant designing a tailored solution for a client.\n\n` +
      `CLIENT CONTEXT:\n` +
      `- Client: ${clientName}\n` +
      `- Objective: ${objective || 'Not specified'}\n` +
      `- Audience: ${audience || 'Executive leadership'}\n` +
      `- Industry: ${industryKey || 'Not specified'}\n` +
      (docText ? `\nUPLOADED DOCUMENTS (use insights from these):\n${docText}\n` : '') +
      `\nTASK:\n` +
      `Design a tailored solution for this client. Do not describe your company's capabilities.\n` +
      `Describe the platform, system, or transformation being proposed for THIS client.\n` +
      `The solution must be grounded in the client's specific problem and industry context.\n` +
      `It must feel like a real consulting solution: a clear concept, logical structure, believable components, and clear value creation.\n\n` +
      `DEPTH: ${depthGuide}\n\n` +
      `RULES:\n` +
      `- Do NOT copy or reuse consulting firm marketing language\n` +
      `- Do NOT mention Publicis Sapient, PACE, or any firm-specific product names\n` +
      `- Each pillar must address a distinct dimension of the client's transformation\n` +
      `- Each component must be a concrete deliverable or system element\n` +
      `- valueNarrative describes the business outcome for the client, not the seller\n` +
      `- Use the client name and industry to make the concept feel specific and earned\n\n` +
      `RETURN ONLY VALID JSON (no markdown fences, no explanation outside the JSON):\n` +
      `{\n` +
      `  "solutionName": "A short compelling name for this solution (4–7 words)",\n` +
      `  "coreIdea": "1–2 sentences: what is being built and why it solves the problem",\n` +
      `  "pillars": [\n` +
      `    { "name": "Pillar name", "description": "What this pillar does", "value": "Business value it creates" }\n` +
      `  ],\n` +
      `  "components": [\n` +
      `    { "name": "Component name", "description": "What this component is and does" }\n` +
      `  ],\n` +
      `  "valueNarrative": "1–2 sentences on the overall outcome and transformation for the client",\n` +
      `  "differentiation": "1 sentence on what makes this approach distinctively right for this client"\n` +
      `}`;

    try {
      const result = await App.callGenerate(prompt);
      if (!result || !result.solutionName || !result.coreIdea) {
        console.warn('[GenerationBrain] generateSolutionConcept: incomplete result', result);
        return null;
      }
      App.state.solutionConcept = result;
      return result;
    } catch (err) {
      console.warn('[GenerationBrain] generateSolutionConcept failed:', err.message);
      return null;
    }
  },

  /**
   * Refine section slide allocation using priority weights, deck-type modifiers,
   * proposal-size caps, and solution concept presence.
   *
   * Mutates brain.sections[].targetSlides and brain.targetSlides in-place.
   * Stores the full plan in App.state.sectionPlan.
   *
   * Called from phase2.js AFTER generateSolutionConcept() so the solution
   * concept depth can inform how much space "Our Solution" section receives.
   *
   * @param {Object}      brain           - App.state.brain (mutated in-place)
   * @param {Object|null} solutionConcept - App.state.solutionConcept (may be null)
   * @returns {Object} The mutated brain
   */
  allocateSections(brain, solutionConcept) {
    if (!brain?.sections?.length) return brain;

    const {
      sections,
      buildMode      = 'full-proposal',
      deckTypeId     = null,
      proposalSizeId = 'standard',
    } = brain;

    const isMini = proposalSizeId === 'lean';

    // ── Minimum detail slides guaranteed per section ─────────────────────
    const SECTION_MINS = {
      closing:        isMini ? 1 : 2,
      solution:       isMini ? 1 : 2,
      'our-solution': isMini ? 1 : 2,
      'our-approach': isMini ? 1 : 2,
      delivery:       isMini ? 1 : 2,
    };

    // ── Fetch lookup tables ───────────────────────────────────────────────
    const deckMods = (buildMode === 'single-deck' && deckTypeId)
      ? (this.DECK_TYPE_WEIGHT_MODIFIERS[deckTypeId] || {})
      : {};
    const caps = this.PROPOSAL_SIZE_SECTION_CAPS[proposalSizeId] || {};

    // ── Compute effective weight for each section ─────────────────────────
    const weights = sections.map(sec => {
      let w = this.SECTION_PRIORITY_WEIGHTS[sec.sectionId] ?? 2;

      // Global deck-type compress/expand
      if (deckMods._all) w *= deckMods._all;

      // Section-specific deck-type modifier
      if (deckMods[sec.sectionId] !== undefined) w *= deckMods[sec.sectionId];

      // Boost "Our Solution" when a solution concept has been designed
      if (['solution', 'our-solution', 'our-approach'].includes(sec.sectionId) && solutionConcept) {
        const boosts = { lean: 1.2, standard: 1.5, 'full-fat': 1.8 };
        w *= boosts[proposalSizeId] ?? 1.3;
      }

      return Math.max(0.5, w);
    });

    // ── Slot budget ───────────────────────────────────────────────────────
    const TITLE_SLOTS  = 1;
    const dividerSlots = sections.length;
    let   detailBudget = brain.targetSlides - TITLE_SLOTS - dividerSlots;
    detailBudget       = Math.max(sections.length, detailBudget);

    // ── Reserve minimums, distribute remainder by weight ──────────────────
    const mins          = sections.map(sec => SECTION_MINS[sec.sectionId] ?? 1);
    const reservedTotal = mins.reduce((a, b) => a + b, 0);
    const flexBudget    = Math.max(0, detailBudget - reservedTotal);
    const totalWeight   = weights.reduce((a, b) => a + b, 0);

    const allocated = sections.map((sec, i) => {
      const share  = totalWeight > 0 ? Math.round((weights[i] / totalWeight) * flexBudget) : 0;
      let   slides = mins[i] + share;

      // Apply proposal-size cap
      const cap = caps[sec.sectionId];
      if (cap !== undefined) slides = Math.min(slides, cap);

      // Absolute ceiling (solution/delivery can go higher in full-fat)
      const absCeil = (
        ['solution', 'our-solution', 'delivery', 'platform'].includes(sec.sectionId)
        && proposalSizeId === 'full-fat'
      ) ? 8 : 6;

      return Math.min(slides, absCeil);
    });

    // ── Snap to exact budget ──────────────────────────────────────────────
    let actual       = allocated.reduce((a, b) => a + b, 0);
    // Sort section indices: lowest weight first
    const byWeightAsc = sections.map((_, i) => i).sort((a, b) => weights[a] - weights[b]);

    // Trim excess from lowest-weight sections
    let ti = 0;
    while (actual > detailBudget && ti < byWeightAsc.length) {
      const i = byWeightAsc[ti++];
      if (allocated[i] > mins[i]) { allocated[i]--; actual--; }
    }
    // Fill shortfall into highest-weight sections
    let ai = byWeightAsc.length - 1;
    while (actual < detailBudget && ai >= 0) {
      const i     = byWeightAsc[ai--];
      const cap   = caps[sections[i].sectionId] ?? 8;
      const ceil  = (
        ['solution', 'our-solution', 'delivery', 'platform'].includes(sections[i].sectionId)
        && proposalSizeId === 'full-fat'
      ) ? 8 : 6;
      if (allocated[i] < Math.min(cap, ceil)) { allocated[i]++; actual++; }
    }

    // ── Assign priority labels ────────────────────────────────────────────
    const getPriority = w => w >= 2.5 ? 'high' : w >= 1.5 ? 'medium' : 'low';

    // ── Rebuild sections with allocation metadata ─────────────────────────
    const updatedSections = sections.map((sec, i) => ({
      ...sec,
      targetSlides:    allocated[i],
      allocatedSlides: allocated[i],
      minSlides:       mins[i],
      maxSlides:       caps[sec.sectionId] ?? 8,
      priority:        getPriority(weights[i]),
      canCompress:     weights[i] < 1.5,
    }));

    const newTarget = TITLE_SLOTS + updatedSections.reduce((sum, s) => sum + 1 + s.targetSlides, 0);

    // ── Mutate brain & store section plan ─────────────────────────────────
    brain.sections     = updatedSections;
    brain.targetSlides = newTarget;
    brain.dividerCount = updatedSections.length;

    App.state.sectionPlan = {
      titleSlides: TITLE_SLOTS,
      totalSlides: newTarget,
      sections:    updatedSections,
      allocationBasis: {
        buildMode,
        deckTypeId:         deckTypeId ?? null,
        proposalSizeId:     proposalSizeId ?? null,
        hasSolutionConcept: !!solutionConcept,
      },
    };

    return brain;
  },

  // ── Concept deduplication helpers ─────────────────────────────────────────

  /**
   * Normalize a concept name to a canonical word-set for similarity comparison.
   * Lowercases, strips punctuation, removes stopwords, sorts remaining words.
   */
  _normalizeConcept(name) {
    const STOP = new Set(['a','an','the','and','or','of','for','to','in','at','by','our','your','its','this','that','with','via','the','&']);
    return (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP.has(w))
      .sort()
      .join(' ');
  },

  /**
   * Returns true when two normalized concept names share ≥50% word overlap
   * relative to the shorter of the two. Used to detect near-duplicate concepts.
   */
  _isSimilarConcept(normA, normB) {
    if (!normA || !normB) return false;
    const a = new Set(normA.split(' ').filter(Boolean));
    const b = new Set(normB.split(' ').filter(Boolean));
    if (a.size === 0 || b.size === 0) return false;
    const overlap = [...a].filter(w => b.has(w)).length;
    return overlap / Math.min(a.size, b.size) >= 0.5;
  },

  /**
   * Concept Hierarchy + Expansion Control layer.
   *
   * Replaces the earlier mechanical "promote everything" approach with
   * intent-aware, deduplicated, depth-capped expansion.
   *
   * Rules:
   * - Only the solution section gets explicit slide-by-slide blueprinting.
   * - Other synthesis sections do NOT get generic extra slots (was causing
   *   mechanical duplication); they rely on slot-level hints in toPromptBlock.
   * - Pillars become individual slides (standard/full-fat, ≥2 pillars).
   * - Components ALWAYS stay as ONE architecture synthesis slide regardless of
   *   count — architecture slides show relationships, not component lists.
   * - Value narrative becomes one dedicated slide (standard/full-fat).
   * - Expansion is capped per proposal size via MAX_PROMOTED.
   * - A concept registry tracks every concept given its own slide, and is
   *   embedded in the prompt so the LLM knows not to re-expand them.
   * - Retrieval, proof, and closing sections are never touched.
   *
   * Mutates brain.sections and brain.targetSlides in-place.
   * Updates App.state.sectionPlan and sets brain._expandedConceptRegistry.
   *
   * @param {Object}      brain           - App.state.brain (mutated in-place)
   * @param {Object|null} solutionConcept - App.state.solutionConcept (may be null)
   * @returns {Object} The mutated brain
   */
  promoteSlideConcepts(brain, solutionConcept) {
    if (!brain?.sections?.length) return brain;

    const { proposalSizeId = 'standard' } = brain;
    const isLean = proposalSizeId === 'lean';

    // Max number of non-overview concept slots we will promote (per section)
    const MAX_PROMOTED = { lean: 1, standard: 3, 'full-fat': 5 };
    const maxPromoted  = MAX_PROMOTED[proposalSizeId] ?? 3;

    // Registry: concepts already assigned a standalone slide.
    // Embedded in the prompt to prevent the LLM re-expanding them elsewhere.
    const registry = [];

    // Sections whose slides must never be auto-promoted
    const NO_EXPAND_ROLES = new Set(['retrieval', 'proof', 'closing']);

    const TRIMMABLE = ['appendix', 'team', 'market', 'market-context', 'trends', 'ps-position'];
    let totalAdded = 0;

    brain.sections = brain.sections.map(sec => {

      // Retrieval (Why PS, Team), proof (Appendix), and closing never expand
      if (NO_EXPAND_ROLES.has(sec.role)) return sec;

      // ── Solution section: explicit concept hierarchy blueprint ───────────
      if (['solution', 'our-solution', 'our-approach'].includes(sec.sectionId) && solutionConcept) {
        const pillars    = solutionConcept.pillars    || [];
        const components = solutionConcept.components || [];
        const conceptSlots = [];
        let promotedCount = 0;

        // ── Slot 1: Solution Overview (always — top-level concept) ─────────
        conceptSlots.push({
          slotLabel:   'OVERVIEW',
          slideIntent: 'solution_overview',
          title:       solutionConcept.solutionName,
          hint:        solutionConcept.coreIdea,
          visualType:  'hero',
        });

        // ── Pillar slides: top-level concepts → each becomes a slide ───────
        // Pillars are top-level; do NOT expand if lean or fewer than 2 pillars.
        // Dedup: skip any pillar whose concept name is already in the registry.
        if (!isLean && pillars.length >= 2) {
          for (const p of pillars) {
            if (promotedCount >= maxPromoted) break;
            const norm = this._normalizeConcept(p.name);
            const duplicate = registry.some(r => this._isSimilarConcept(r.norm, norm));
            if (!duplicate) {
              conceptSlots.push({
                slotLabel:   `PILLAR — ${p.name}`,
                slideIntent: 'solution_pillar',
                title:       p.name,
                hint:        `${p.description}${p.value ? ` → Value: ${p.value}` : ''}`,
                visualType:  'split',
              });
              registry.push({ norm, label: `PILLAR — ${p.name}`, sectionId: sec.sectionId });
              promotedCount++;
            }
          }
        }

        // ── Architecture slide: ONE synthesis slide — always summary ────────
        // NEVER expand components individually here.
        // Architecture slides explain relationships and flows, not enumerations.
        // All components are registered so the LLM knows not to re-expand them.
        if (components.length >= 2 && promotedCount < maxPromoted) {
          conceptSlots.push({
            slotLabel:          'ARCHITECTURE & COMPONENTS',
            slideIntent:        'architecture',
            title:              'Solution Architecture',
            hint:               components.map(c => `${c.name}: ${c.description}`).join(' | '),
            visualType:         'bullets',
            noFurtherExpansion: true,  // architecture = synthesis; must not spawn child slides
          });
          // Register every component as covered — prevents LLM re-expanding in other sections
          components.forEach(c => registry.push({
            norm:      this._normalizeConcept(c.name),
            label:     `component in Architecture slide`,
            sectionId: sec.sectionId,
          }));
          promotedCount++;
        }

        // ── Value narrative: one stats/outcome slide ────────────────────────
        // value = summary language; must NOT be expanded further.
        if (!isLean && solutionConcept.valueNarrative && promotedCount < maxPromoted) {
          conceptSlots.push({
            slotLabel:          'VALUE & OUTCOMES',
            slideIntent:        'value',
            title:              'Value Creation',
            hint:               solutionConcept.valueNarrative,
            visualType:         'stats',
            noFurtherExpansion: true,
          });
        }

        // ── Apply stop-expanding rule ───────────────────────────────────────
        // If conceptSlots would exceed the section's current targetSlides by
        // more than 2, cap the expansion to avoid pacing collapse.
        const hardCap   = sec.targetSlides + 2;
        const capped    = conceptSlots.slice(0, hardCap);
        const expanded  = Math.max(sec.targetSlides, capped.length);

        if (expanded > sec.targetSlides) totalAdded += (expanded - sec.targetSlides);

        return {
          ...sec,
          targetSlides:        expanded,
          allocatedSlides:     expanded,
          promotedConcepts:    capped,
          hasConceptPromotion: true,
        };
      }

      // ── All other sections: no mechanical expansion ──────────────────────
      // The previous version blindly added 1–2 extra slots to every high-priority
      // synthesis section. That caused generic duplication. We now rely entirely
      // on precise slot-level hints in toPromptBlock() to guide the LLM toward
      // concept-level depth within the slide count already allocated.
      return sec;
    });

    // ── Rebalance: trim compressible sections to offset expansion ──────────
    if (totalAdded > 0) {
      let toTrim = totalAdded;
      brain.sections = brain.sections.map(sec => {
        if (toTrim <= 0) return sec;
        if (TRIMMABLE.includes(sec.sectionId) && sec.targetSlides > 1) {
          const trimAmt = Math.min(toTrim, sec.targetSlides - 1);
          toTrim -= trimAmt;
          return { ...sec, targetSlides: sec.targetSlides - trimAmt, allocatedSlides: sec.targetSlides - trimAmt };
        }
        return sec;
      });
    }

    // ── Recompute totals ────────────────────────────────────────────────────
    const TITLE_SLOTS  = 1;
    brain.targetSlides = TITLE_SLOTS + brain.sections.reduce((sum, s) => sum + 1 + s.targetSlides, 0);
    brain.dividerCount = brain.sections.length;

    // ── Store registry on brain for toPromptBlock() to embed in the prompt ─
    brain._expandedConceptRegistry = registry;

    // ── Update sectionPlan ─────────────────────────────────────────────────
    const allPromotions = brain.sections
      .filter(s => s.hasConceptPromotion)
      .map(s => ({
        sectionId:        s.sectionId,
        sectionTitle:     s.title,
        promotedConcepts: s.promotedConcepts || null,
        finalSlides:      s.targetSlides,
      }));

    if (App.state.sectionPlan) {
      App.state.sectionPlan.promotions              = allPromotions;
      App.state.sectionPlan.expandedConceptRegistry = registry;
      App.state.sectionPlan.totalSlides             = brain.targetSlides;
      App.state.sectionPlan.sections                = brain.sections;
    }

    return brain;
  },

  /**
   * Post-generation structural enforcement.
   * Ensures the slide array always has a title slide at position 0 and a
   * section divider slide at the start of every section.
   * Called after LLM returns slides in both Phase 2 and Phase 3.
   *
   * @param {Array} slides   - Raw slides array from LLM
   * @param {Object} brain   - App.state.brain
   * @returns {Array}        - Corrected slides array with re-numbered IDs
   */
  enforceStructure(slides, brain) {
    if (!slides?.length || !brain?.sections?.length) return slides || [];

    // ── Classify helpers ────────────────────────────────────────────────────
    const sectionTitles = brain.sections.map(s => s.title.toLowerCase());

    const _matchesSection = (text) => {
      const t = (text || '').toLowerCase();
      return sectionTitles.some(st => {
        // Require substantial word overlap to avoid false matches on short words
        const words = st.split(/\s+/).filter(w => w.length > 3);
        if (!words.length) return t === st;
        const hits = words.filter(w => t.includes(w));
        return hits.length >= Math.ceil(words.length * 0.6);
      });
    };

    const _isTitle = (s, idx) => {
      if (s.type === 'title') return true;
      if (s.type === 'divider' || s.type === 'content') return false;
      // Fallback: first slide, hero layout, no body, doesn't match a section name
      return (
        idx === 0 &&
        s.layout === 'hero' &&
        (!s.body || !s.body.length) &&
        !_matchesSection(s.subtitle || s.title)
      );
    };

    const _isDivider = (s) => {
      if (s.type === 'divider') return true;
      if (s.type === 'title' || s.type === 'content') return false;
      // Fallback: hero layout, no body, title/subtitle matches a section name
      return (
        s.layout === 'hero' &&
        (!s.body || !s.body.length) &&
        _matchesSection(s.subtitle || s.title)
      );
    };

    // ── Split slides into groups separated by dividers ──────────────────────
    // groups: [{divider: slide|null, content: slide[]}]
    let groups     = [];
    let titleSlide = null;
    let currentDiv = null;
    let currentCnt = [];

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      if (!titleSlide && _isTitle(s, i)) {
        titleSlide = s;
      } else if (_isDivider(s)) {
        groups.push({ divider: currentDiv, content: currentCnt });
        currentDiv = s;
        currentCnt = [];
      } else {
        currentCnt.push(s);
      }
    }
    groups.push({ divider: currentDiv, content: currentCnt });

    // Remove empty leading group (slides before the first divider, no divider header)
    if (groups.length > 1 && !groups[0].divider && !groups[0].content.length) {
      groups.shift();
    }

    // ── Build corrected result ──────────────────────────────────────────────
    const result = [];

    // 1. Title slide — always first
    if (titleSlide) {
      result.push({ ...titleSlide, type: 'title' });
    } else {
      result.push({
        id: 'auto-title',
        type: 'title',
        layout: 'hero',
        title: brain._deckTitle || 'Presentation',
        subtitle: '',
        headline: brain._deckHeadline || '',
        body: [],
        hasImage: true,
        image_description: 'Bold, modern hero composition — confident and professional',
        image_type: 'abstract',
      });
    }

    // 2. Sections: mandatory divider + content
    for (let i = 0; i < brain.sections.length; i++) {
      const section = brain.sections[i];
      const group   = groups[i] || { divider: null, content: [] };

      // Divider — use LLM version if present, otherwise synthesize
      const divSlide = group.divider
        ? { ...group.divider, type: 'divider', layout: 'hero' }
        : {
            id: `auto-divider-${section.sectionId}`,
            type: 'divider',
            layout: 'hero',
            title: section.title,
            subtitle: section.title,
            headline: section.purpose,
            body: [],
            hasImage: false,
            image_description: '',
            image_type: 'abstract',
          };
      result.push(divSlide);

      // Content slides
      if (group.content.length) {
        group.content.forEach(s => result.push({ ...s, type: s.type || 'content' }));
      } else {
        // Guarantee at least one content slide per section
        result.push({
          id: `auto-content-${section.sectionId}`,
          type: 'content',
          layout: 'bullets',
          title: `${section.title} — Key Points`,
          subtitle: section.title,
          headline: section.purpose,
          body: ['<<REPLACE: key point 1>>', '<<REPLACE: key point 2>>', '<<REPLACE: key point 3>>'],
          hasImage: false,
          image_description: '',
        });
      }
    }

    // 3. Any extra groups beyond brain.sections (LLM produced more sections than planned)
    for (let i = brain.sections.length; i < groups.length; i++) {
      const g = groups[i];
      if (g.divider) result.push(g.divider);
      g.content.forEach(s => result.push(s));
    }

    // Re-number IDs sequentially
    return result.map((s, i) => ({ ...s, id: String(i + 1) }));
  },
};
