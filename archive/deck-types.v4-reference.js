// ─── ARCHIVAL REFERENCE ONLY ─────────────────────────────────────────────────
// This file is NOT used by the application.
// It is kept as a historical reference for the V5 deck-type configurations
// that existed before the 3-phase flow (phase1.js, phase2.js, phase3.js) replaced them.
// Do not import, load, or modify this file.
// ─────────────────────────────────────────────────────────────────────────────

// ─── DECK TYPE FORM CONFIGURATIONS ──────────────────────────────────────────
window.DECK_TYPES = {
    executive: {
      name: 'Executive Summary', icon: '⚡', desc: '1-page C-suite overview',
      slideCount: { min: 3, default: 4, max: 8 },
      aiIntent: 'Be ruthlessly concise. Lead with impact. Every word earns its place. Write like a McKinsey partner presenting to a board — impact first, so what second, ask third. If a source document is provided, extract only the signal, discard the noise.',
      sections: [
        { id: 'situation', label: 'The situation',                slides: 1, expandTo: 2 },
        { id: 'results',   label: 'What we achieved',             slides: 1, expandTo: 3 },
        { id: 'next',      label: 'What it means & what\'s next', slides: 1, expandTo: 2 }
      ],
      fields: [
        { id: 'ex-name',     label: 'Campaign / project name',                   type: 'input',    required: true,  placeholder: 'e.g. Q4 Brand Awareness Campaign' },
        { id: 'ex-obj',      label: 'What was the objective?',                    type: 'textarea', required: true,  placeholder: 'e.g. Drive 10k qualified leads within 90 days...' },
        { id: 'ex-results',  label: 'Top 3 results / outcomes',                   type: 'textarea', required: true,  placeholder: 'e.g. 42% above target, £180K pipeline, 2.3x ROAS...' },
        { id: 'ex-metrics',  label: 'Key metrics',                                type: 'textarea', required: true,  placeholder: 'e.g. CTR 4.2% vs 1.8% benchmark, 42K impressions...' },
        { id: 'ex-decision', label: 'What decision does this deck need to drive?', type: 'textarea', required: true,  placeholder: 'e.g. Approve budget increase for Q1 campaign...' },
        { id: 'ex-audience', label: 'Audience seniority',                          type: 'select',   required: false, options: ['', 'CEO', 'CMO', 'CFO', 'Board', 'CTO', 'VP / Director', 'Mixed leadership'] },
        { id: 'ex-period',   label: 'Time period covered',                         type: 'input',    required: false, placeholder: 'e.g. Q3 2024, Jan–Mar 2025' },
        { id: 'ex-source',   label: 'Upload source document to summarise',         type: 'file',     required: false, accept: '.pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls', hint: 'AI reads the document and auto-populates the exec summary' }
      ]
    },
  
    microstory: {
      name: '3-Slide Micro-Story', icon: '📖', desc: 'Problem → Solution → Result',
      slideCount: { min: 3, default: 5, max: 9 },
      aiIntent: 'Three acts. Each slide a gut punch. Problem must feel real and urgent. Solution must feel inevitable. Result must feel earned. No bullet points — this is narrative, not a list.',
      sections: [
        { id: 'problem',  label: 'The problem',  slides: 1, expandTo: 2 },
        { id: 'approach', label: 'The approach', slides: 1, expandTo: 2 },
        { id: 'impact',   label: 'The impact',   slides: 1, expandTo: 2 }
      ],
      fields: [
        { id: 'ms-problem',  label: 'What was the problem or tension?',              type: 'textarea', required: true,  placeholder: 'e.g. Our client\'s awareness had plateaued despite increased spend...' },
        { id: 'ms-solution', label: 'What was your solution or approach?',           type: 'textarea', required: true,  placeholder: 'e.g. We shifted from broad reach to precision audience targeting...' },
        { id: 'ms-result',   label: 'What changed as a result?',                     type: 'textarea', required: true,  placeholder: 'e.g. 3.2x ROAS, 42% above lead target, brand recall up 18pts...' },
        { id: 'ms-hero',     label: 'Hero metric (the one number that says it all)', type: 'input',    required: true,  placeholder: 'e.g. 3.2x ROAS' },
        { id: 'ms-audience', label: 'Who is this story for?',                        type: 'input',    required: false, placeholder: 'e.g. New business prospects, internal leadership...' },
        { id: 'ms-emotion',  label: 'Emotional angle',                               type: 'select',   required: false, options: ['', 'Inspiring', 'Reassuring', 'Urgent', 'Surprising', 'Empowering'] },
        { id: 'ms-files',    label: 'Upload supporting files for context',            type: 'file',     required: false, accept: '.pdf,.pptx,.docx,.xlsx,.jpg,.jpeg,.png', hint: 'Each file gets a description so AI knows how to use it', multiple: true }
      ]
    },
  
    visual: {
      name: 'Visual Journey', icon: '🎨', desc: 'Cinematic narrative deck',
      slideCount: { min: 5, default: 9, max: 16 },
      aiIntent: 'Think film trailer, not PowerPoint. Every slide is a scene. Write copy that evokes feeling, not information. UI floats as atmosphere. Lifestyle imagery and cinematic backgrounds carry the emotion. Words amplify, never explain.',
      sections: [
        { id: 'before',    label: 'The world before',     slides: 1, expandTo: 1 },
        { id: 'meet',      label: 'Meet the protagonist', slides: 1, expandTo: 1 },
        { id: 'change',    label: 'The moment of change', slides: 2, expandTo: 3 },
        { id: 'new-world', label: 'The new world',        slides: 2, expandTo: 3 },
        { id: 'invite',    label: 'The invitation',       slides: 1, expandTo: 1 }
      ],
      fields: [
        { id: 'vj-name',        label: 'Campaign / concept name',                          type: 'input',    required: true,  placeholder: 'e.g. Emirates Infotainment Revolution' },
        { id: 'vj-idea',        label: 'What is the central idea or concept?',              type: 'textarea', required: true,  placeholder: 'e.g. A personalised infotainment system that knows each passenger...' },
        { id: 'vj-protagonist', label: 'Who is the protagonist? (person, brand, product)',  type: 'input',    required: true,  placeholder: 'e.g. Layla, a frequent Emirates business traveller' },
        { id: 'vj-journey',     label: 'Describe the journey or transformation',            type: 'textarea', required: true,  placeholder: 'e.g. From a generic IFE experience to a personalised cinematic one...' },
        { id: 'vj-emotions',    label: 'Key emotional moments to hit',                      type: 'textarea', required: false, placeholder: 'e.g. Surprise at first personalisation, delight at seamless handoff...' },
        { id: 'vj-product',     label: 'Describe the product / solution being showcased',   type: 'textarea', required: false, placeholder: 'e.g. AI-powered IFE with cross-device sync, ambient lighting...' },
        { id: 'vj-ui',          label: 'UI elements to feature (screens, flows, features)', type: 'textarea', required: false, placeholder: 'e.g. Profile card, content carousel, ambient mode toggle...' },
        { id: 'vj-audience',    label: 'Target audience',                                   type: 'input',    required: false, placeholder: 'e.g. Emirates CMO and leadership team' },
        { id: 'vj-metrics',     label: 'Supporting metrics',                                type: 'textarea', required: false, placeholder: 'e.g. 50M+ annual passengers, 6,500+ content titles...' },
        { id: 'vj-ui-files',    label: 'Upload product UI screenshots / mockups',           type: 'file',     required: false, accept: '.png,.jpg,.jpeg,.webp', multiple: true },
        { id: 'vj-lifestyle',   label: 'Upload lifestyle / campaign imagery',               type: 'file',     required: false, accept: '.png,.jpg,.jpeg,.webp', multiple: true },
        { id: 'vj-ref',         label: 'Upload reference video mood or moodboard',          type: 'file',     required: false, accept: '.mp4,.mov,.pdf,.png,.jpg', multiple: true }
      ]
    },
  
    rolebased: {
      name: 'Role-Based Summary', icon: '👤', desc: 'Tailored by stakeholder',
      slideCount: { min: 3, default: 4, max: 8 },
      aiIntent: 'Speak their language, not yours. A CFO wants ROI and risk reduction. A CMO wants brand and growth. A CTO wants scalability. Tailor every word to what keeps this specific person up at night.',
      sections: [
        { id: 'for-role',  label: 'What this means for [Role]', slides: 1, expandTo: 2 },
        { id: 'numbers',   label: 'The numbers that matter',    slides: 1, expandTo: 3 },
        { id: 'recommend', label: 'What we recommend',          slides: 1, expandTo: 2 }
      ],
      fields: [
        { id: 'rb-role',    label: 'Who is this for?',                            type: 'select',   required: true,  options: ['', 'CMO', 'CFO', 'CEO', 'CTO', 'HR Director', 'Board', 'VP Marketing', 'VP Sales', 'Other'] },
        { id: 'rb-cares',   label: 'What does this person care most about?',       type: 'textarea', required: true,  placeholder: 'e.g. Brand growth, lead quality, marketing efficiency...' },
        { id: 'rb-fears',   label: 'What is their biggest fear or blocker?',       type: 'textarea', required: true,  placeholder: 'e.g. Budget scrutiny, proving ROI to the board...' },
        { id: 'rb-what',    label: 'What are you presenting to them?',             type: 'textarea', required: true,  placeholder: 'e.g. Q3 campaign performance and Q4 recommendation...' },
        { id: 'rb-believe', label: 'The one thing you need them to believe',       type: 'textarea', required: true,  placeholder: 'e.g. That performance media is now our highest-ROI channel...' },
        { id: 'rb-metrics', label: 'Key metrics relevant to their role',           type: 'textarea', required: false, placeholder: 'e.g. ROAS 3.2x, CPL down 28%, pipeline £180K...' },
        { id: 'rb-action',  label: 'What action do you want them to take?',        type: 'input',    required: false, placeholder: 'e.g. Approve Q4 budget uplift of £50K' },
        { id: 'rb-files',   label: 'Upload supporting documents',                  type: 'file',     required: false, accept: '.pdf,.pptx,.docx,.xlsx', multiple: true }
      ]
    },
  
    selldeck: {
      name: 'Internal Sell Deck', icon: '🏆', desc: 'Internal champion kit',
      slideCount: { min: 5, default: 7, max: 12 },
      aiIntent: 'Internal persuasion. Pre-empt every objection. Build logical and emotional cases in equal measure. The champion using this deck needs to feel confident enough to walk into any room and win alone.',
      sections: [
        { id: 'opportunity', label: 'The opportunity we\'re missing', slides: 1, expandTo: 2 },
        { id: 'why-now',     label: 'Why now',                        slides: 1, expandTo: 2 },
        { id: 'proven',      label: 'What we\'ve proven',             slides: 1, expandTo: 2 },
        { id: 'biz-case',    label: 'The business case',              slides: 1, expandTo: 3 },
        { id: 'ask',         label: 'What we need from you',          slides: 1, expandTo: 1 }
      ],
      fields: [
        { id: 'sd-what',       label: 'What are you selling internally?',               type: 'textarea', required: true,  placeholder: 'e.g. A new always-on performance media strategy...' },
        { id: 'sd-who',        label: 'Who needs to be convinced?',                     type: 'input',    required: true,  placeholder: 'e.g. CFO and CMO sign-off required' },
        { id: 'sd-objections', label: 'What objections will they raise?',               type: 'textarea', required: true,  placeholder: 'e.g. Too expensive, unproven, distracts from brand...' },
        { id: 'sd-roi',        label: 'What\'s the business case / ROI?',               type: 'textarea', required: true,  placeholder: 'e.g. Projected 2.8x ROAS, £200K pipeline in 6 months...' },
        { id: 'sd-urgency',    label: 'Why now? What\'s the urgency?',                  type: 'textarea', required: true,  placeholder: 'e.g. Competitor just launched, Q4 window closing fast...' },
        { id: 'sd-proven',     label: 'What have you already done / proven?',           type: 'textarea', required: false, placeholder: 'e.g. Pilot ran for 6 weeks, CTR 3x above benchmark...' },
        { id: 'sd-ask',        label: 'What\'s the ask? (budget, headcount, approval)', type: 'input',    required: false, placeholder: 'e.g. £80K budget approval + 1 dedicated resource' },
        { id: 'sd-market',     label: 'Competitive / market context',                   type: 'textarea', required: false, placeholder: 'e.g. 3 of our top 5 competitors already doing this...' },
        { id: 'sd-files',      label: 'Upload supporting documents',                    type: 'file',     required: false, accept: '.pdf,.pptx,.docx,.xlsx', multiple: true }
      ]
    },
  
    rfp: {
      name: 'RFP / Pitch Response', icon: '📋', desc: 'Bid & proposal response',
      slideCount: { min: 10, default: 20, max: 40 },
      aiIntent: 'Win the room before you enter it. Show you understand their world better than they expected. Every slide says "we get you" before "here\'s what we do." The approach chapter is the heart — make each sub-section feel like a proprietary methodology. Confidence without arrogance.',
      sections: [
        { id: 'ch1-open',     label: 'Chapter 1 · Opening',         slides: 2, expandTo: 3 },
        { id: 'ch2-approach', label: 'Chapter 2 · Our approach',    slides: 4, expandTo: 20, dynamic: true },
        { id: 'ch3-proof',    label: 'Chapter 3 · Proof',           slides: 2, expandTo: 6 },
        { id: 'ch4-team',     label: 'Chapter 4 · Team & delivery', slides: 2, expandTo: 4 },
        { id: 'ch5-close',    label: 'Chapter 5 · The close',       slides: 1, expandTo: 1 }
      ],
      fields: [
        { id: 'rfp-client',      label: 'Client / prospect name',                           type: 'input',        required: true,  placeholder: 'e.g. Emirates, HSBC, Nike MENA' },
        { id: 'rfp-brief',       label: 'What are they asking for?',                         type: 'textarea',     required: true,  placeholder: 'e.g. A full-service performance and brand agency to manage...' },
        { id: 'rfp-solution',    label: 'What is your proposed solution?',                   type: 'textarea',     required: true,  placeholder: 'e.g. An integrated always-on model combining brand and performance...' },
        { id: 'rfp-why-us',      label: 'Why are you uniquely positioned to win?',           type: 'textarea',     required: true,  placeholder: 'e.g. 12 years in the region, deep category expertise, proprietary tech...' },
        { id: 'rfp-creds',       label: 'Relevant case studies or credentials',              type: 'textarea',     required: true,  placeholder: 'e.g. Grew X brand by 3x in 18 months, managed £50M in media spend...' },
        { id: 'rfp-framework',   label: 'Your approach framework name',                      type: 'input',        required: false, placeholder: 'e.g. SPEED model, ORBIT framework, The 4C Method' },
        { id: 'rfp-subsections', label: 'Approach sub-sections (each becomes its own chapter with multiple slides)', type: 'dynamic-list', required: false, hint: 'Add each pillar of your approach', placeholder: 'e.g. Technology approach', defaultItems: ['Technology approach', 'Creative approach', 'Media approach', 'Experience approach'] },
        { id: 'rfp-budget',      label: 'Budget / investment range',                         type: 'input',        required: false, placeholder: 'e.g. £500K–£800K annually' },
        { id: 'rfp-timeline',    label: 'Proposed timeline / phases',                        type: 'textarea',     required: false, placeholder: 'e.g. Phase 1: Discovery (4 wks), Phase 2: Launch (8 wks)...' },
        { id: 'rfp-team',        label: 'Team / key people',                                 type: 'textarea',     required: false, placeholder: 'e.g. Jane Smith (Strategy Director), Ahmed Al Hassan (Creative Lead)...' },
        { id: 'rfp-doc',         label: 'Upload RFP document',                               type: 'file',         required: false, accept: '.pdf,.docx,.doc', hint: 'AI reads and responds directly to the brief' },
        { id: 'rfp-files',       label: 'Upload supporting documents',                       type: 'file',         required: false, accept: '.pdf,.pptx,.docx,.xlsx,.png,.jpg', multiple: true }
      ]
    }
  };
  
  // ─── TONE OF VOICE ───────────────────────────────────────────────────────────
  window.TONE_OPTIONS = [
    { id: 'warm',      label: 'Warm & human',            promptGuide: 'Use warm, human language. Lead with empathy before data. Avoid jargon. Write as a trusted partner, not a vendor. Short sentences. Conversational but credible.' },
    { id: 'data',      label: 'Data-driven & precise',   promptGuide: 'Every claim must be specific and quantified. Lead with numbers. Avoid vague superlatives. Use precise percentages, ratios, and timeframes.' },
    { id: 'visionary', label: 'Visionary & cinematic',   promptGuide: 'Write copy that evokes feeling before logic. Use vivid imagery in words. Think manifesto, not memo. Each headline should feel quotable.' },
    { id: 'executive', label: 'Confident & executive',   promptGuide: 'Write for someone who reads 200 emails a day. One idea per sentence. Lead with implication, not explanation. No preamble. No hedging.' },
    { id: 'punchy',    label: 'Conversational & punchy',  promptGuide: 'Write like a sharp human. Short sentences. Active voice. Cut every word that doesn\'t earn its place. Never use filler openers.' }
  ];
  
  // ─── ART DIRECTION PRESETS ───────────────────────────────────────────────────
  window.ART_PRESETS = [
    { id: 'cinematic-dark',  label: 'Cinematic dark',    bestFor: ['visual','selldeck'],      palette: ['#0a0a1a','#1a1a2e','#c9a84c','#ffffff'], promptStyle: 'cinematic, dark background, high contrast, dramatic lighting, editorial photography, premium feel' },
    { id: 'clean-executive', label: 'Clean executive',   bestFor: ['executive','rolebased'],  palette: ['#ffffff','#f4f4f4','#111111','#2563eb'], promptStyle: 'clean, minimal, white background, professional, sharp, corporate photography' },
    { id: 'bold-editorial',  label: 'Bold editorial',    bestFor: ['microstory','rfp'],       palette: ['#111111','#ff3b00','#f5f0e8','#ffffff'], promptStyle: 'bold, high contrast, editorial, magazine style, strong composition, vivid colors' },
    { id: 'warm-human',      label: 'Warm & human',      bestFor: ['rolebased','microstory'], palette: ['#f5ede0','#c4956a','#2d2d2d','#e8ddd0'], promptStyle: 'warm, earthy tones, lifestyle photography, natural light, human-centered, authentic' },
    { id: 'data-forward',    label: 'Data forward',      bestFor: ['executive','rfp'],        palette: ['#0f172a','#0ea5e9','#f8fafc','#22d3ee'], promptStyle: 'data visualization aesthetic, clean, technical, teal and blue tones, structured' },
    { id: 'agency-bold',     label: 'Agency bold',       bestFor: ['selldeck','rfp'],         palette: ['#1a0a2e','#7c3aed','#f0abfc','#ffffff'], promptStyle: 'bold, vibrant, creative agency aesthetic, high energy, asymmetric composition' }
  ];
  
  // ─── DYNAMIC FORM RENDERER ───────────────────────────────────────────────────
  window.DeckForms = {
    currentType: null,
    fileDescriptions: {},
    _files: {},
  
    render(typeId) {
      this.currentType = typeId;
      this.fileDescriptions = {};
      this._files = {};
      const config = window.DECK_TYPES[typeId];
      if (!config) return;
      const container = document.getElementById('dynamic-fields');
      if (!container) return;
      container.innerHTML = '';
      config.fields.forEach(field => container.appendChild(this.renderField(field)));
    },
  
    renderField(field) {
      const wrap = document.createElement('div');
      wrap.className = 'field';
      wrap.dataset.fieldId = field.id;
      const label = document.createElement('label');
      label.innerHTML = field.label + (field.required ? ' <span style="color:var(--accent);font-size:10px;">*</span>' : '');
      wrap.appendChild(label);
      if (field.hint) {
        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:10px;color:var(--text3);margin-bottom:5px;line-height:1.4;';
        hint.textContent = field.hint;
        wrap.appendChild(hint);
      }
      const builders = {
        input:          () => this.makeInput(field),
        textarea:       () => this.makeTextarea(field),
        select:         () => this.makeSelect(field),
        file:           () => this.makeFileUpload(field),
        'dynamic-list': () => this.makeDynamicList(field)
      };
      const builder = builders[field.type];
      if (builder) wrap.appendChild(builder());
      return wrap;
    },
  
    makeInput(f) {
      const el = document.createElement('input');
      el.type = 'text'; el.id = f.id; el.placeholder = f.placeholder || '';
      return el;
    },
  
    makeTextarea(f) {
      const el = document.createElement('textarea');
      el.id = f.id; el.placeholder = f.placeholder || ''; el.rows = 3;
      return el;
    },
  
    makeSelect(f) {
      const el = document.createElement('select');
      el.id = f.id;
      (f.options || []).forEach(o => {
        const op = document.createElement('option');
        op.value = o; op.textContent = o || '— Select —';
        el.appendChild(op);
      });
      return el;
    },
  
    makeFileUpload(field) {
      const wrap = document.createElement('div');
      const zone = document.createElement('div');
      zone.className = 'upload-zone';
      zone.style.cssText = 'border:1.5px dashed var(--border2);border-radius:8px;padding:12px;text-align:center;cursor:pointer;font-size:11px;color:var(--text3);margin-bottom:6px;transition:all 0.15s;';
      zone.innerHTML = '<strong style="color:var(--accent2)">📎 Click to upload</strong>';
      zone.onmouseenter = () => zone.style.borderColor = 'var(--accent)';
      zone.onmouseleave = () => zone.style.borderColor = 'var(--border2)';
      const inp = document.createElement('input');
      inp.type = 'file'; inp.id = field.id; inp.style.display = 'none';
      inp.accept = field.accept || '';
      if (field.multiple) inp.multiple = true;
      zone.onclick = () => inp.click();
      const chipList = document.createElement('div');
      chipList.id = field.id + '-chips';
      chipList.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
      inp.onchange = () => {
        Array.from(inp.files).forEach(f => this.addFileChip(field.id, f, chipList));
        inp.value = '';
      };
      wrap.appendChild(zone);
      wrap.appendChild(inp);
      wrap.appendChild(chipList);
      return wrap;
    },
  
    addFileChip(fieldId, file, chipList) {
      if (!this.fileDescriptions[fieldId]) this.fileDescriptions[fieldId] = {};
      if (this.fileDescriptions[fieldId][file.name]) return;
      if (!this._files[fieldId]) this._files[fieldId] = [];
      this._files[fieldId].push(file);
      this.fileDescriptions[fieldId][file.name] = '';
      const chip = document.createElement('div');
      chip.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:8px 10px;';
      chip.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <span style="font-size:14px;">${this.fileIcon(file.name)}</span>
          <span style="font-size:11px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</span>
          <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0;line-height:1;" onclick="DeckForms.removeFile('${fieldId}','${file.name.replace(/'/g,"\\'")}',this)">×</button>
        </div>
        <input type="text" placeholder="Describe this file (e.g. Q3 campaign results)"
          style="width:100%;background:var(--bg4);border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:11px;color:var(--text);font-family:inherit;outline:none;box-sizing:border-box;"
          onchange="DeckForms.setFileDesc('${fieldId}','${file.name.replace(/'/g,"\\'")}',this.value)" />`;
      chipList.appendChild(chip);
    },
  
    removeFile(fieldId, fileName, btn) {
      btn.closest('div[style]')?.remove();
      if (this.fileDescriptions[fieldId]) delete this.fileDescriptions[fieldId][fileName];
      if (this._files[fieldId]) this._files[fieldId] = this._files[fieldId].filter(f => f.name !== fileName);
    },
  
    setFileDesc(fieldId, fileName, desc) {
      if (!this.fileDescriptions[fieldId]) this.fileDescriptions[fieldId] = {};
      this.fileDescriptions[fieldId][fileName] = desc;
    },
  
    makeDynamicList(field) {
      const wrap = document.createElement('div');
      const items = document.createElement('div');
      items.id = field.id + '-items';
      items.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-bottom:8px;';
      (field.defaultItems || []).forEach(text => this.addListItem(field.id, items, text));
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = '+ Add sub-section';
      addBtn.style.cssText = 'background:transparent;border:1px dashed var(--border2);border-radius:6px;padding:6px 12px;font-size:11px;color:var(--accent2);cursor:pointer;font-family:inherit;width:100%;transition:all 0.15s;';
      addBtn.onclick = () => this.addListItem(field.id, items, '');
      wrap.appendChild(items);
      wrap.appendChild(addBtn);
      return wrap;
    },
  
    addListItem(fieldId, container, value) {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:6px;';
      item.innerHTML = `
        <span style="color:var(--text3);cursor:grab;font-size:14px;flex-shrink:0;">⠿</span>
        <input type="text" class="dli-input" value="${value}" placeholder="e.g. Technology approach"
          style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:12px;color:var(--text);font-family:inherit;outline:none;" />
        <button type="button" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0;" onclick="this.closest('div').remove()">×</button>`;
      container.appendChild(item);
    },
  
    fileIcon(name) {
      const ext = name.split('.').pop().toLowerCase();
      return { pdf:'📄',png:'🖼',jpg:'🖼',jpeg:'🖼',webp:'🖼',xlsx:'📊',xls:'📊',csv:'📊',docx:'📝',doc:'📝',pptx:'📑',ppt:'📑',mp4:'🎬',mov:'🎬' }[ext] || '📎';
    },
  
    collect() {
      const typeId = this.currentType;
      const config = window.DECK_TYPES[typeId];
      if (!config) return {};
      const values = { type: typeId, typeName: config.name };
      config.fields.forEach(field => {
        if (field.type === 'dynamic-list') {
          values[field.id] = Array.from(document.querySelectorAll(`#${field.id}-items .dli-input`)).map(i => i.value.trim()).filter(Boolean);
        } else if (field.type === 'file') {
          const descs = this.fileDescriptions[field.id] || {};
          values[field.id] = (this._files[field.id] || []).map(f => ({ name: f.name, description: descs[f.name] || '' }));
        } else {
          const el = document.getElementById(field.id);
          values[field.id] = el ? el.value.trim() : '';
        }
      });
      return values;
    },
  
    buildPrompt(formValues, brandValues, toneId, artPresetId, slideCountPref) {
      const config   = window.DECK_TYPES[formValues.type];
      const tone     = window.TONE_OPTIONS.find(t => t.id === toneId) || window.TONE_OPTIONS[0];
      const art      = window.ART_PRESETS.find(a => a.id === artPresetId);
      const rfpSubs  = formValues['rfp-subsections'] || [];
      const framework = formValues['rfp-framework'] || '';
  
      const sectionGuide = config.sections.map(s => {
        if (s.dynamic && rfpSubs.length) {
          return `${s.label}:\n  - Overview slide (framework diagram)\n  ${rfpSubs.map(sub => `- "${sub}": 1 intro + 2-3 detail slides`).join('\n  ')}`;
        }
        return `${s.label}: ${s.slides}-${s.expandTo} slides`;
      }).join('\n');
  
      const countGuide = {
        concise:       'Keep to the lower end of each range. Be ruthlessly concise.',
        standard:      'Use standard slide counts. Balance depth with clarity.',
        comprehensive: 'Use the upper end. Provide full depth and supporting detail.'
      }[slideCountPref] || 'Use standard slide counts.';
  
      const allFiles = [];
      Object.entries(formValues).forEach(([, val]) => {
        if (Array.isArray(val) && val.length && val[0]?.name) {
          val.forEach(f => allFiles.push(`- ${f.name}${f.description ? ': ' + f.description : ''}`));
        }
      });
  
      const contentLines = [];
      config.fields.forEach(field => {
        if (field.type === 'file' || field.type === 'dynamic-list') return;
        const val = formValues[field.id];
        if (val) contentLines.push(`${field.label}: ${val}`);
      });
  
      return `You are an expert agency presentation strategist AND visual director. Create a complete ${config.name} deck.
  
  DECK TYPE: ${config.name}
  AI INTENT: ${config.aiIntent}
  TONE: ${tone.label} — ${tone.promptGuide}
  ART DIRECTION: ${art ? art.label : 'Professional'} — ${art ? art.promptStyle : 'clean, professional'}
  
  BRAND:
  - Client: ${brandValues.clientName || 'Not specified'}
  - Primary color: ${brandValues.primaryColor || '#1a1a2e'}
  - Accent color: ${brandValues.accentColor || '#ffffff'}
  - Extra colors: ${(brandValues.extraColors || []).map(c => c.hex + (c.label ? ' (' + c.label + ')' : '')).join(', ') || 'None'}
  - Font: ${brandValues.font || 'Not specified'}
  
  SLIDE COUNT: ${countGuide}
  
  SECTIONS:
  ${sectionGuide}
  
  CONTENT:
  ${contentLines.join('\n') || 'No content provided.'}
  ${rfpSubs.length ? `\nAPPROACH SUB-SECTIONS: ${rfpSubs.join(', ')}${framework ? '\nFRAMEWORK: ' + framework : ''}` : ''}
  ${allFiles.length ? '\nUPLOADED FILES:\n' + allFiles.join('\n') : ''}
  
  Return ONLY valid JSON, no markdown fences, no preamble:
  {
    "slides": [{
      "title": "slide title",
      "subtitle": "tagline or section label (optional)",
      "chapter": "chapter name for RFP (optional)",
      "headline": "one punchy sentence in the specified tone",
      "body": ["bullet 1","bullet 2","bullet 3"],
      "stat1_label": "label", "stat1_value": "value",
      "stat2_label": "label", "stat2_value": "value",
      "cta": "call to action (optional)",
      "layout": "hero|stats|bullets|split",
      "image_prompt": "2-4 sentences: specific subject, setting, mood, visual metaphor for THIS slide. No text, no logos.",
      "image_style": "photoreal|3d|illustration|abstract|minimal",
      "video_prompt": "optional: 1-3 sentences for a 5-8s cinematic loop",
      "ui_components": [
        {
          "type": "profile-card|stat-badge|metric-grid|chart-bar|timeline|carousel|control-panel|sync-diagram|toast-notification|annotation-callout|device-mockup|pill-badge|feature-list|quote-card|form-card",
          "position": "top-right|center-right|bottom-right|top-left|center-left|bottom-left|full-right",
          "animation": "float|pulse|slide-in|none",
          "label": "short component title (optional)",
          "data": {
            "items": ["list of labels, steps, titles, or content — use REAL content from this slide"],
            "values": ["numbers, percentages, or emoji icons matching items"],
            "labels": ["sublabels or descriptions matching items"],
            "name": "primary name or title",
            "subtitle": "secondary detail line",
            "badge": "small badge text e.g. Live, AI-powered",
            "progress": 65,
            "note": "small caption or annotation",
            "cta": "button label"
          }
        }
      ]
    }],
    "theme": { "tagline": "memorable deck tagline", "tone": "${toneId}", "artPreset": "${artPresetId || 'cinematic-dark'}" }
  }
  
  LAYOUT RULES: hero=title/intro, stats=results (always fill stat1+stat2), split=narrative, bullets=actions.

  MEDIA RULES: Each image_prompt must illustrate THAT slide specifically. No generic stock scenes. Style: ${art ? art.promptStyle : 'professional, cinematic'}.

  UI COMPONENT RULES:
  - Every slide MUST have 1-3 ui_components specific to this deck content and use case.
  - Populate data.items, data.values, data.labels with REAL content from the slide.
  - Hero slides: pill-badge or device-mockup. Results: metric-grid or chart-bar. Process: timeline or sync-diagram. Features: carousel or feature-list. Closing: form-card or quote-card.
  - Always position components on the RIGHT side (top-right, center-right, bottom-right, full-right).
  - Vary component types — never repeat the same type on consecutive slides.`;
  }
};
