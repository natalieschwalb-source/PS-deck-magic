// ─── CINEMATIC SLIDE RENDERER v4 ─────────────────────────────────────────────
// Dynamic component builder — renders AI-specified ui_components per slide.
// Component library: 15 types, all built in pure HTML/CSS, brand-driven.

window.CinematicRenderer = {

    render(slide, idx, total, primary, accent) {
      if (!slide) return '';
      const dark = this.isDark(primary);
      const tx   = dark ? '#ffffff' : '#111111';
      const sub  = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
      const styleId = window.App?.state?.brand?.artPresetId || 'cinematic-dark';
      const styleProfile = this.getStyleProfile(styleId);
      const layout = slide.render_layout || this.chooseLayout(slide, idx, total);
      const ctx  = { slide, idx, total, primary, accent, dark, tx, sub, styleId, styleProfile, layout };
      return `
        ${this.cssAnimations()}
        ${this.styleFrameCSS(ctx)}
        ${this.layerBg(ctx, layout)}
        ${this.layerOverlay(ctx, layout)}
        ${this.layerMotion(ctx)}
        ${this.layerContent(ctx, layout)}
        ${this.layerUIComponents(ctx)}
        ${this.layerMeta(ctx)}`;
    },
  
    chooseLayout(slide, idx, total) {
      if (idx === 0 || slide.layout === 'hero') return 'hero';
      if (idx === total - 1) return 'hero';
      if (slide.stat1_value && slide.stat2_value) return 'stats';
      if (slide.layout === 'split') return 'split';
      return 'split';
    },

    getStyleProfile(styleId) {
      const map = {
        'cinematic-dark': {
          headingFont: 'Lexend Deca', bodyFont: 'DM Sans', componentRadius: 14, spacing: 'airy',
          titleCurve: {
            heroMin: 1.52, heroVw: 3.55, heroMax: 3.08,
            statsEm: 1.36, splitEm: 1.46,
            lhHero: 1.04, lhStats: 1.12, lhSplit: 1.06,
            heroHeadlineEm: 0.88, statsHeadlineEm: 0.74, splitHeadlineEm: 0.75,
            heroSubEm: 0.68, statsSubEm: 0.62, splitSubEm: 0.6
          }
        },
        'clean-executive': {
          headingFont: 'Inter', bodyFont: 'Source Sans 3', componentRadius: 8, spacing: 'compact',
          titleCurve: {
            heroMin: 1.32, heroVw: 2.75, heroMax: 2.38,
            statsEm: 1.12, splitEm: 1.2,
            lhHero: 0.98, lhStats: 1.08, lhSplit: 1.0,
            heroHeadlineEm: 0.82, statsHeadlineEm: 0.7, splitHeadlineEm: 0.71,
            heroSubEm: 0.62, statsSubEm: 0.58, splitSubEm: 0.56
          }
        },
        'bold-editorial': {
          headingFont: 'Montserrat', bodyFont: 'Roboto', componentRadius: 4, spacing: 'compact',
          titleCurve: {
            heroMin: 1.92, heroVw: 4.35, heroMax: 3.72,
            statsEm: 1.72, splitEm: 1.88,
            lhHero: 0.92, lhStats: 1.05, lhSplit: 0.98,
            heroHeadlineEm: 0.95, statsHeadlineEm: 0.78, splitHeadlineEm: 0.8,
            heroSubEm: 0.72, statsSubEm: 0.62, splitSubEm: 0.58
          }
        },
        'warm-human': {
          headingFont: 'Merriweather', bodyFont: 'Lato', componentRadius: 16, spacing: 'airy',
          titleCurve: {
            heroMin: 1.48, heroVw: 3.22, heroMax: 2.82,
            statsEm: 1.28, splitEm: 1.38,
            lhHero: 1.1, lhStats: 1.15, lhSplit: 1.12,
            heroHeadlineEm: 0.86, statsHeadlineEm: 0.74, splitHeadlineEm: 0.76,
            heroSubEm: 0.66, statsSubEm: 0.6, splitSubEm: 0.58
          }
        },
        'data-forward': {
          headingFont: 'Inter', bodyFont: 'Inter', componentRadius: 6, spacing: 'compact',
          titleCurve: {
            heroMin: 1.26, heroVw: 2.52, heroMax: 2.04,
            statsEm: 1.08, splitEm: 1.14,
            lhHero: 1.02, lhStats: 1.1, lhSplit: 1.04,
            heroHeadlineEm: 0.8, statsHeadlineEm: 0.7, splitHeadlineEm: 0.71,
            heroSubEm: 0.6, statsSubEm: 0.58, splitSubEm: 0.56
          }
        },
        'agency-bold': {
          headingFont: 'Poppins', bodyFont: 'DM Sans', componentRadius: 12, spacing: 'standard',
          titleCurve: {
            heroMin: 1.7, heroVw: 3.85, heroMax: 3.22,
            statsEm: 1.52, splitEm: 1.64,
            lhHero: 1.0, lhStats: 1.1, lhSplit: 1.06,
            heroHeadlineEm: 0.9, statsHeadlineEm: 0.74, splitHeadlineEm: 0.76,
            heroSubEm: 0.7, statsSubEm: 0.62, splitSubEm: 0.6
          }
        }
      };
      return map[styleId] || map['cinematic-dark'];
    },

    /** Per-preset title scale: hero clamp, split/stats em sizes, line-heights, headline/subtitle em. */
    getTitleCurve(ctx) {
      const t = ctx.styleProfile?.titleCurve || {};
      const d = {
        heroMin: 1.6, heroVw: 3.4, heroMax: 3.0,
        statsEm: 1.4, splitEm: 1.5,
        lhHero: 1.04, lhStats: 1.12, lhSplit: 1.06,
        heroHeadlineEm: 0.88, statsHeadlineEm: 0.74, splitHeadlineEm: 0.75,
        heroSubEm: 0.68, statsSubEm: 0.62, splitSubEm: 0.6
      };
      return {
        heroMin: t.heroMin ?? d.heroMin,
        heroVw: t.heroVw ?? d.heroVw,
        heroMax: t.heroMax ?? d.heroMax,
        statsEm: t.statsEm ?? d.statsEm,
        splitEm: t.splitEm ?? d.splitEm,
        lhHero: t.lhHero ?? d.lhHero,
        lhStats: t.lhStats ?? d.lhStats,
        lhSplit: t.lhSplit ?? d.lhSplit,
        heroHeadlineEm: t.heroHeadlineEm ?? d.heroHeadlineEm,
        statsHeadlineEm: t.statsHeadlineEm ?? d.statsHeadlineEm,
        splitHeadlineEm: t.splitHeadlineEm ?? d.splitHeadlineEm,
        heroSubEm: t.heroSubEm ?? d.heroSubEm,
        statsSubEm: t.statsSubEm ?? d.statsSubEm,
        splitSubEm: t.splitSubEm ?? d.splitSubEm
      };
    },

    getSpacingScale(ctx) {
      const mode = ctx.styleProfile?.spacing || 'standard';
      if (mode === 'compact') return { padX: 0.9, padY: 0.9, gap: 0.9, bodyW: 1.08 };
      if (mode === 'airy') return { padX: 1.12, padY: 1.1, gap: 1.12, bodyW: 0.92 };
      return { padX: 1.0, padY: 1.0, gap: 1.0, bodyW: 1.0 };
    },

    /** Normalize for comparing KPI strings across main grid vs floating UI. */
    normalizeStatCompare(s) {
      return String(s ?? '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    },

    /** True when two KPI-ish strings refer to the same figure (substring or same leading number). */
    statStringsOverlap(a, b) {
      const na = this.normalizeStatCompare(a);
      const nb = this.normalizeStatCompare(b);
      if (!na || !nb) return false;
      if (na === nb) return true;
      if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return true;
      const da = na.match(/\d+(?:\.\d+)?/);
      const db = nb.match(/\d+(?:\.\d+)?/);
      if (da && db && da[0] === db[0]) return true;
      return false;
    },

    /** Floating KPI widgets that repeat numbers/labels already shown in the stats layout grid. */
    uiComponentDuplicatesKpis(comp, slide, layout) {
      if (layout !== 'stats') return false;
      const d = comp.data || {};
      let hay = [];
      if (comp.type === 'stat-badge' || comp.type === 'metric-grid') {
        hay = [...(d.values || []), ...(d.labels || [])];
      } else if (comp.type === 'pill-badge') {
        const items = Array.isArray(d.items) && d.items.length ? d.items : [d.name || comp.label || ''].filter(Boolean);
        hay = items;
      } else {
        return false;
      }
      const slideBits = [slide.stat1_value, slide.stat2_value, slide.stat1_label, slide.stat2_label].filter(Boolean);
      if (!slideBits.length || !hay.length) return false;
      for (const bit of slideBits) {
        for (const h of hay) {
          if (this.statStringsOverlap(bit, h)) return true;
        }
      }
      return false;
    },

    styleFrameCSS(ctx) {
      let h = ctx.styleProfile.headingFont;
      let b = ctx.styleProfile.bodyFont;
      const brand = window.App?.state?.brand;
      if (brand && brand.designMode === 'custom' && brand.font && String(brand.font).trim()) {
        const esc = String(brand.font).trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        h = esc;
        b = esc;
      }
      return `<style>
        .cr-root, .cr-root * { font-family: '${b}', sans-serif !important; }
        .cr-root .cr-h, .cr-root .cr-h * { font-family: '${h}', sans-serif !important; }
      </style>`;
    },
  
    // ── CSS ──────────────────────────────────────────────────────────────────────
    cssAnimations() {
      return `<style>
        @keyframes cr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes cr-float-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes cr-float-tilt{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-6px) rotate(-1.5deg)}}
        @keyframes cr-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cr-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes cr-scale-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes cr-slide-r{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes cr-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes cr-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes cr-progress{from{width:0}to{width:var(--pw,60%)}}
        @keyframes cr-bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes cr-bar-grow{from{height:0}to{height:var(--bh,60%)}}
      </style>`;
    },
  
    // ── BACKGROUND ───────────────────────────────────────────────────────────────
    layerBg(ctx, layout) {
      const { slide, primary } = ctx;
      if (slide.video_url) {
        return `<video src="${this.e(slide.video_url)}" autoplay muted loop playsinline
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"></video>`;
      }
      if (slide.image_data_url) {
        if (layout === 'hero') {
          return `<img src="${slide.image_data_url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" />`;
        }
        return `<img src="${slide.image_data_url}" style="position:absolute;right:0;top:0;width:58%;height:100%;object-fit:cover;z-index:0;" />`;
      }
      return `<div style="position:absolute;inset:0;background:${primary};z-index:0;"></div>`;
    },
  
    // ── OVERLAY ──────────────────────────────────────────────────────────────────
    layerOverlay(ctx, layout) {
      const { primary, styleId, accent } = ctx;
      if (styleId === 'clean-executive') {
        return `<div style="position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,${primary}f0 0%,${primary}d9 42%,transparent 78%);"></div>`;
      }
      if (styleId === 'bold-editorial') {
        return `<div style="position:absolute;inset:0;z-index:1;background:
          linear-gradient(135deg,${primary}ee 0%,${primary}bb 35%,transparent 75%),
          repeating-linear-gradient(-18deg, transparent 0 36px, ${this.rgba(accent,0.12)} 36px 42px);"></div>`;
      }
      if (styleId === 'warm-human') {
        return `<div style="position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 15% 20%, ${this.rgba(accent,0.15)}, transparent 42%),linear-gradient(110deg,${primary}ef 20%,${primary}a3 62%,transparent 100%);"></div>`;
      }
      if (styleId === 'data-forward') {
        return `<div style="position:absolute;inset:0;z-index:1;background:
          linear-gradient(90deg,${primary}fb 34%,${primary}d0 54%,transparent 80%),
          linear-gradient(0deg, ${this.rgba(accent,0.08)} 1px, transparent 1px),
          linear-gradient(90deg, ${this.rgba(accent,0.06)} 1px, transparent 1px);
          background-size:auto, 22px 22px, 22px 22px;"></div>`;
      }
      if (layout === 'hero') {
        return `<div style="position:absolute;inset:0;z-index:1;background:linear-gradient(120deg,${primary}f2 35%,${primary}99 58%,${primary}33 100%);"></div>`;
      }
      return `<div style="position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,${primary}ff 40%,${primary}dd 55%,${primary}66 75%,transparent 100%);"></div>`;
    },
  
    // ── AMBIENT MOTION ───────────────────────────────────────────────────────────
    layerMotion(ctx) {
      const { accent, slide, styleId } = ctx;
      if (slide.video_url) return '';
      if (styleId === 'clean-executive') {
        return `
        <div style="position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;">
          <div style="position:absolute;inset:6% 4% auto auto;width:32%;height:1px;background:${this.rgba(accent,0.18)};"></div>
          <div style="position:absolute;inset:auto auto 9% 5%;width:24%;height:1px;background:${this.rgba(accent,0.18)};"></div>
        </div>`;
      }
      if (styleId === 'data-forward') {
        return `
        <div style="position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;">
          <div style="position:absolute;right:6%;top:14%;width:2px;height:24%;background:${this.rgba(accent,0.25)};animation:cr-pulse 2.4s ease-in-out infinite;"></div>
          <div style="position:absolute;right:8.5%;top:20%;width:2px;height:18%;background:${this.rgba(accent,0.20)};animation:cr-pulse 2.1s ease-in-out infinite;"></div>
          <div style="position:absolute;right:11%;top:26%;width:2px;height:12%;background:${this.rgba(accent,0.16)};animation:cr-pulse 1.9s ease-in-out infinite;"></div>
        </div>`;
      }
      return `
        <div style="position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;">
          <div style="position:absolute;width:45%;aspect-ratio:1;border-radius:50%;background:${this.rgba(accent,0.05)};right:-12%;top:-22%;animation:cr-float 10s ease-in-out infinite;"></div>
          <div style="position:absolute;width:28%;aspect-ratio:1;border-radius:50%;background:${this.rgba(accent,0.03)};left:32%;bottom:-14%;animation:cr-float-b 7s ease-in-out infinite;"></div>
        </div>`;
    },
  
    // ── SLIDE COPY (left panel) ───────────────────────────────────────────────────
    layerContent(ctx, layout) {
      const { slide, tx, sub, accent, dark } = ctx;
      const cardBg  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
      const cardBrd = this.rgba(accent, 0.2);
      const sc = this.getSpacingScale(ctx);
      const tc = this.getTitleCurve(ctx);
      const E = (s) => this.e(String(s ?? ''));
  
      if (layout === 'hero') {
        const lhHero = Math.max(1.12, tc.lhHero);
        return `
          <div class="cr-root" style="position:absolute;inset:0;z-index:5;padding:${7 * sc.padY}% ${8 * sc.padX}%;display:flex;flex-direction:column;justify-content:flex-end;gap:${0.45 * sc.gap}em;min-height:0;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" data-field="subtitle" data-label="Subtitle" spellcheck="true" style="font-size:${tc.heroSubEm}em;font-weight:700;color:${accent};letter-spacing:3px;text-transform:uppercase;font-family:sans-serif;animation:cr-fade-up 0.5s ease both;outline:none;flex-shrink:0;">${E(slide.subtitle)}</div>` : ''}
            <div class="cr-h slide-editable" contenteditable="true" data-field="title" data-label="Title" spellcheck="true" style="font-size:clamp(${tc.heroMin}em,${tc.heroVw}vw,${tc.heroMax}em);font-weight:900;color:${tx};line-height:${lhHero};max-width:${66 * sc.bodyW}%;font-family:sans-serif;animation:cr-fade-up 0.5s 0.1s ease both;outline:none;flex-shrink:0;overflow-wrap:anywhere;word-break:break-word;">${E(slide.title)}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" data-field="headline" data-label="Headline" spellcheck="true" style="font-size:${tc.heroHeadlineEm}em;color:${sub};line-height:${1.65 * sc.gap};max-width:${52 * sc.bodyW}%;margin-bottom:${slide.cta ? (1.4 * sc.gap) + 'em' : '0'};font-family:sans-serif;animation:cr-fade-up 0.5s 0.2s ease both;outline:none;flex-shrink:0;">${E(slide.headline)}</div>` : ''}
            ${(slide.body || []).length ? `<div style="max-width:${58 * sc.bodyW}%;margin-bottom:${0.9 * sc.gap}em;display:flex;flex-direction:column;gap:${0.42 * sc.gap}em;flex-shrink:0;">
              ${(slide.body || []).map((b,i)=>`<div class="slide-editable" contenteditable="true" data-field="body-${i}" data-label="Body text" spellcheck="true" style="font-size:0.62em;color:${sub};line-height:${1.55 * sc.gap};font-family:sans-serif;animation:cr-fade-up 0.5s ${0.25 + i * 0.08}s ease both;outline:none;">• ${E(b)}</div>`).join('')}
            </div>` : ''}
            ${slide.cta ? `<div class="slide-editable" contenteditable="true" data-field="cta" data-label="CTA" spellcheck="true" style="display:inline-flex;align-items:center;padding:0.55em 1.3em;background:${accent};color:${this.isDark(accent)?'#fff':'#000'};border-radius:6px;font-size:0.78em;font-weight:700;font-family:sans-serif;animation:cr-fade-up 0.5s 0.3s ease both;width:fit-content;outline:none;">${E(slide.cta)} →</div>` : ''}
          </div>`;
      }
  
      if (layout === 'stats') {
        const kpiValueEm = Math.max(1.95, +(tc.statsEm * 1.78).toFixed(2));
        const lhStats = Math.max(1.14, tc.lhStats);
        return `
          <div class="cr-root" style="position:absolute;inset:0;z-index:5;padding:${5 * sc.padY}% ${6 * sc.padX}% ${4 * sc.padY}% ${6 * sc.padX}%;display:flex;flex-direction:column;gap:${2.2 * sc.gap}%;min-height:0;box-sizing:border-box;">
            <div style="flex-shrink:0;max-width:${92 * sc.bodyW}%;padding-right:2%;box-sizing:border-box;">
              ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" data-field="subtitle" data-label="Subtitle" spellcheck="true" style="font-size:${tc.statsSubEm}em;font-weight:700;color:${accent};letter-spacing:2.5px;text-transform:uppercase;margin-bottom:0.4em;font-family:sans-serif;outline:none;">${E(slide.subtitle)}</div>` : ''}
              <div class="cr-h slide-editable" contenteditable="true" data-field="title" data-label="Title" spellcheck="true" style="font-size:${tc.statsEm}em;font-weight:800;color:${tx};font-family:sans-serif;line-height:${lhStats};outline:none;overflow-wrap:anywhere;word-break:break-word;">${E(slide.title)}</div>
              <div class="slide-editable" contenteditable="true" data-field="headline" data-label="Headline" spellcheck="true" style="font-size:${tc.statsHeadlineEm}em;color:${sub};margin-top:0.35em;max-width:${56 * sc.bodyW}%;font-family:sans-serif;line-height:${1.55 * sc.gap};outline:none;">${E(slide.headline)}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:${3 * sc.gap}%;width:${52 * sc.bodyW}%;margin:0;flex-shrink:0;">
              ${slide.stat1_value ? `<div style="background:${cardBg};border:1px solid ${cardBrd};border-radius:10px;padding:6% 8%;animation:cr-scale-in 0.6s 0.2s ease both;">
                <div class="slide-editable" contenteditable="true" data-field="stat1_value" data-label="Stat 1 value" spellcheck="true" style="font-size:${kpiValueEm}em;font-weight:900;color:${accent};line-height:1;font-family:sans-serif;outline:none;">${E(slide.stat1_value)}</div>
                <div class="slide-editable" contenteditable="true" data-field="stat1_label" data-label="Stat 1 label" spellcheck="true" style="font-size:0.58em;color:${sub};margin-top:0.4em;text-transform:uppercase;letter-spacing:0.8px;font-family:sans-serif;outline:none;">${E(slide.stat1_label)}</div>
              </div>` : ''}
              ${slide.stat2_value ? `<div style="background:${cardBg};border:1px solid ${cardBrd};border-radius:10px;padding:6% 8%;animation:cr-scale-in 0.6s 0.35s ease both;">
                <div class="slide-editable" contenteditable="true" data-field="stat2_value" data-label="Stat 2 value" spellcheck="true" style="font-size:${kpiValueEm}em;font-weight:900;color:${accent};line-height:1;font-family:sans-serif;outline:none;">${E(slide.stat2_value)}</div>
                <div class="slide-editable" contenteditable="true" data-field="stat2_label" data-label="Stat 2 label" spellcheck="true" style="font-size:0.58em;color:${sub};margin-top:0.4em;text-transform:uppercase;letter-spacing:0.8px;font-family:sans-serif;outline:none;">${E(slide.stat2_label)}</div>
              </div>` : ''}
            </div>
            <div style="display:grid;grid-template-columns:repeat(${Math.min(3, Math.max(1, (slide.body||[]).length))},1fr);gap:${2.2 * sc.gap}%;max-width:${56 * sc.bodyW}%;margin-top:auto;flex-shrink:0;">
              ${(slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" data-field="body-${i}" data-label="Body text" spellcheck="true" style="font-size:0.58em;color:${sub};line-height:1.55;font-family:sans-serif;animation:cr-fade-up 0.5s ${0.4+i*0.08}s ease both;outline:none;"><div style="width:14px;height:2px;background:${accent};margin-bottom:6px;border-radius:1px;"></div>${E(b)}</div>`).join('')}
            </div>
          </div>`;
      }
  
      // split layout
      const lhSplit = Math.max(1.1, tc.lhSplit);
      return `
        <div class="cr-root" style="position:absolute;top:0;left:0;width:43%;height:100%;z-index:5;padding:${6 * sc.padY}% ${5 * sc.padX}%;display:flex;flex-direction:column;justify-content:center;gap:${0.45 * sc.gap}em;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;min-height:0;">
          ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" data-field="subtitle" data-label="Subtitle" spellcheck="true" style="font-size:${tc.splitSubEm}em;font-weight:700;color:${accent};letter-spacing:2.5px;text-transform:uppercase;font-family:sans-serif;animation:cr-slide-r 0.5s ease both;outline:none;flex-shrink:0;">${E(slide.subtitle)}</div>` : ''}
          <div class="cr-h slide-editable" contenteditable="true" data-field="title" data-label="Title" spellcheck="true" style="font-size:${tc.splitEm}em;font-weight:900;color:${tx};line-height:${lhSplit};font-family:sans-serif;animation:cr-slide-r 0.5s 0.1s ease both;outline:none;flex-shrink:0;overflow-wrap:anywhere;word-break:break-word;">${E(slide.title)}</div>
          <div class="slide-editable" contenteditable="true" data-field="headline" data-label="Headline" spellcheck="true" style="font-size:${tc.splitHeadlineEm}em;color:${sub};line-height:${1.65 * sc.gap};margin-bottom:${slide.cta ? (1.2 * sc.gap) + 'em' : '0'};font-family:sans-serif;animation:cr-slide-r 0.5s 0.2s ease both;outline:none;flex-shrink:0;">${E(slide.headline)}</div>
          ${(slide.body || []).length ? `<div style="display:flex;flex-direction:column;gap:${0.38 * sc.gap}em;margin-bottom:${slide.cta ? (0.8 * sc.gap) + 'em' : '0'};flex-shrink:0;">
            ${(slide.body || []).map((b,i)=>`<div class="slide-editable" contenteditable="true" data-field="body-${i}" data-label="Body text" spellcheck="true" style="font-size:0.62em;color:${sub};line-height:${1.55 * sc.gap};font-family:sans-serif;animation:cr-slide-r 0.5s ${0.22 + i * 0.08}s ease both;outline:none;">• ${E(b)}</div>`).join('')}
          </div>` : ''}
          ${slide.cta ? `<div class="slide-editable" contenteditable="true" data-field="cta" data-label="CTA" spellcheck="true" style="display:inline-flex;align-items:center;padding:0.45em 1em;background:${accent};color:${this.isDark(accent)?'#fff':'#000'};border-radius:5px;font-size:0.7em;font-weight:700;font-family:sans-serif;width:fit-content;animation:cr-fade-up 0.5s 0.3s ease both;outline:none;">${E(slide.cta)}</div>` : ''}
        </div>`;
    },
  
    // ── UI COMPONENT LAYER ────────────────────────────────────────────────────────
    layerUIComponents(ctx) {
      const { slide, layout } = ctx;
      const components = slide.ui_components;
      if (!components || !components.length) return this.fallbackComponent(ctx);

      const filtered = components.filter((c) => !this.uiComponentDuplicatesKpis(c, slide, layout));
      if (!filtered.length) return layout === 'stats' ? '' : this.fallbackComponent(ctx);

      return filtered.map((comp, i) => {
        const pos = this.resolvePosition(comp.position, i);
        const anim = this.resolveAnimation(comp.animation || 'float', i);
        const html = this.buildComponent(comp, ctx);
        if (!html) return '';
        return `<div style="position:absolute;${pos}z-index:${8+i};${anim}">${html}</div>`;
      }).join('');
    },
  
    resolvePosition(pos, i) {
      const map = {
        'top-right':    'top:8%;right:3%;max-width:30%;',
        'top-left':     'top:8%;left:47%;max-width:30%;',
        'center-right': 'top:50%;right:3%;transform:translateY(-50%);max-width:34%;',
        'center-left':  'top:50%;left:45%;transform:translateY(-50%);max-width:34%;',
        'bottom-right': 'bottom:10%;right:3%;max-width:30%;',
        'bottom-left':  'bottom:10%;left:47%;max-width:30%;',
        'full-right':   'top:50%;right:2%;transform:translateY(-50%);width:50%;',
      };
      const fallbacks = ['center-right','top-right','bottom-right','top-left'];
      return map[pos] || map[fallbacks[i % fallbacks.length]];
    },
  
    resolveAnimation(anim, i) {
      const delay = `${i * 0.15}s`;
      const map = {
        'float':    `animation:cr-float ${5+i}s ${delay} ease-in-out infinite;`,
        'pulse':    `animation:cr-pulse 2s ${delay} ease-in-out infinite;`,
        'slide-in': `animation:cr-fade-up 0.6s ${delay} ease both;`,
        'none':     '',
      };
      return map[anim] || map['float'];
    },
  
    // ── COMPONENT BUILDER ─────────────────────────────────────────────────────────
    buildComponent(comp, ctx) {
      const { accent, primary, dark, tx, sub, styleProfile } = ctx;
      const glass   = dark ? 'rgba(8,6,18,0.78)' : 'rgba(255,255,255,0.84)';
      const gText   = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';
      const gSub    = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.42)';
      const border  = this.rgba(accent, 0.28);
      const d       = comp.data || {};
      const items   = d.items   || [];
      const values  = d.values  || [];
      const labels  = d.labels  || [];
  
      const glassWrap = (content, extra='') =>
        `<div class="cr-root" style="background:${glass};border:1px solid ${border};border-radius:${styleProfile.componentRadius}px;padding:12px 14px;backdrop-filter:blur(14px);${extra}">${content}</div>`;
  
      const header = (label, badge) => `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          ${label ? `<div style="font-size:0.58em;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:1px;font-family:sans-serif;">${label}</div>` : ''}
          ${badge ? `<div style="font-size:0.46em;padding:2px 7px;background:${this.rgba(accent,0.15)};border:1px solid ${this.rgba(accent,0.3)};border-radius:10px;color:${accent};font-family:sans-serif;">${badge}</div>` : ''}
        </div>`;
  
      switch (comp.type) {
  
        // ── PROFILE CARD ──────────────────────────────────────────────────────────
        case 'profile-card':
          return glassWrap(`
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${accent},${this.shiftColor(accent,-30)});display:flex;align-items:center;justify-content:center;font-size:0.85em;font-weight:700;color:#fff;font-family:sans-serif;flex-shrink:0;">${(d.name||'?')[0].toUpperCase()}</div>
              <div>
                <div style="font-size:0.62em;font-weight:700;color:${gText};font-family:sans-serif;">${d.name||''}</div>
                ${d.subtitle ? `<div style="font-size:0.5em;color:${accent};font-family:sans-serif;margin-top:1px;">${d.subtitle}</div>` : ''}
              </div>
            </div>
            ${items.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${items.map(t=>`<div style="padding:2px 8px;background:${this.rgba(accent,0.12)};border:1px solid ${this.rgba(accent,0.28)};border-radius:10px;font-size:0.46em;color:${accent};font-family:sans-serif;">${t}</div>`).join('')}</div>` : ''}
            ${d.note ? `<div style="font-size:0.5em;color:${gSub};font-family:sans-serif;border-top:1px solid ${this.rgba(accent,0.12)};padding-top:7px;">${d.note}</div>` : ''}
            ${d.progress !== undefined ? `<div style="margin-top:7px;"><div style="height:2px;background:${this.rgba(accent,0.15)};border-radius:1px;"><div style="height:100%;width:${d.progress}%;background:${accent};border-radius:1px;transition:width 1s;"></div></div></div>` : ''}`);
  
        // ── STAT BADGE ────────────────────────────────────────────────────────────
        case 'stat-badge':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            ${values.slice(0,3).map((v,i)=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid ${this.rgba(accent,0.1)};">
              <div style="font-size:1.4em;font-weight:900;color:${accent};font-family:sans-serif;line-height:1;">${v}</div>
              <div style="font-size:0.5em;color:${gSub};font-family:sans-serif;text-align:right;max-width:50%;">${labels[i]||''}</div>
            </div>`).join('')}`);
  
        // ── METRIC GRID ───────────────────────────────────────────────────────────
        case 'metric-grid':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              ${values.slice(0,4).map((v,i)=>`
              <div style="background:${this.rgba(accent,0.07)};border-radius:8px;padding:7px 9px;">
                <div style="font-size:1.2em;font-weight:800;color:${accent};line-height:1;font-family:sans-serif;">${v}</div>
                <div style="font-size:0.46em;color:${gSub};margin-top:3px;font-family:sans-serif;">${labels[i]||''}</div>
              </div>`).join('')}
            </div>
            ${d.note ? `<div style="font-size:0.46em;color:${gSub};margin-top:8px;font-family:sans-serif;">${d.note}</div>` : ''}`);
  
        // ── CHART BAR ─────────────────────────────────────────────────────────────
        case 'chart-bar':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            <div style="display:flex;align-items:flex-end;gap:5px;height:70px;padding-bottom:4px;">
              ${values.slice(0,6).map((v,i)=>{
                const pct = Math.min(100, parseFloat(v)||50);
                return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
                  <div style="font-size:0.4em;color:${accent};font-family:sans-serif;font-weight:700;">${v}</div>
                  <div style="width:100%;background:${this.rgba(accent,0.12)};border-radius:3px 3px 0 0;display:flex;align-items:flex-end;">
                    <div style="width:100%;height:${pct*0.6}px;background:${i===values.length-1?accent:this.rgba(accent,0.4)};border-radius:3px 3px 0 0;min-height:4px;"></div>
                  </div>
                  <div style="font-size:0.38em;color:${gSub};font-family:sans-serif;text-align:center;white-space:nowrap;overflow:hidden;max-width:100%;text-overflow:ellipsis;">${labels[i]||''}</div>
                </div>`;
              }).join('')}
            </div>`);
  
        // ── TIMELINE ──────────────────────────────────────────────────────────────
        case 'timeline':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            ${items.slice(0,5).map((item,i)=>`
            <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:${i<items.length-1?'8px':'0'};">
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="width:12px;height:12px;border-radius:50%;background:${i<=1?accent:this.rgba(accent,0.25)};border:2px solid ${i===1?'#fff':this.rgba(accent,0.4)};flex-shrink:0;${i===1?`box-shadow:0 0 0 3px ${this.rgba(accent,0.25)};`:''}"></div>
                ${i<items.length-1?`<div style="width:1px;height:14px;background:${i<1?accent:this.rgba(accent,0.2)};margin:2px 0;"></div>`:''}
              </div>
              <div>
                <div style="font-size:0.55em;font-weight:${i===1?'700':'500'};color:${i===1?accent:gText};font-family:sans-serif;">${item}</div>
                ${labels[i] ? `<div style="font-size:0.46em;color:${gSub};font-family:sans-serif;margin-top:1px;">${labels[i]}</div>` : ''}
              </div>
            </div>`).join('')}`);
  
        // ── CAROUSEL ──────────────────────────────────────────────────────────────
        case 'carousel':
          return glassWrap(`
            ${header(comp.label, d.badge||'AI-curated')}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px;">
              ${items.slice(0,6).map((item,i)=>`
              <div style="aspect-ratio:2/3;background:${this.rgba(accent, 0.08+(i%3)*0.05)};border-radius:6px;display:flex;flex-direction:column;justify-content:flex-end;padding:5px;position:relative;overflow:hidden;">
                <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.6));"></div>
                <div style="font-size:0.42em;color:#fff;font-family:sans-serif;font-weight:600;position:relative;z-index:1;line-height:1.2;">${item}</div>
              </div>`).join('')}
            </div>
            ${values.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">${values.map(v=>`<div style="padding:2px 7px;background:${this.rgba(accent,0.12)};border:1px solid ${this.rgba(accent,0.25)};border-radius:10px;font-size:0.42em;color:${accent};font-family:sans-serif;">${v}</div>`).join('')}</div>` : ''}`);
  
        // ── CONTROL PANEL ─────────────────────────────────────────────────────────
        case 'control-panel':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            ${items.slice(0,3).map((item,i)=>{
              const pct = parseFloat(values[i])||50;
              return `<div style="margin-bottom:9px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <div style="font-size:0.52em;color:${gText};font-family:sans-serif;">${item}</div>
                  <div style="font-size:0.5em;color:${accent};font-weight:700;font-family:sans-serif;">${values[i]||''}</div>
                </div>
                <div style="height:3px;background:${this.rgba(accent,0.12)};border-radius:2px;position:relative;">
                  <div style="width:${pct}%;height:100%;background:${accent};border-radius:2px;"></div>
                  <div style="position:absolute;top:-4px;left:${pct}%;width:10px;height:10px;border-radius:50%;background:${accent};transform:translateX(-50%);border:2px solid ${dark?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.6)'};"></div>
                </div>
              </div>`;
            }).join('')}
            ${labels.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(labels.length,3)},1fr);gap:4px;margin-top:4px;">${labels.map((l,i)=>`<div style="padding:4px;background:${i===0?accent:this.rgba(accent,0.1)};border-radius:6px;text-align:center;font-size:0.46em;color:${i===0?(this.isDark(accent)?'#fff':'#000'):accent};font-family:sans-serif;">${l}</div>`).join('')}</div>` : ''}`);
  
        // ── SYNC DIAGRAM ──────────────────────────────────────────────────────────
        case 'sync-diagram':
          return glassWrap(`
            ${header(comp.label, d.badge||'Live sync')}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              ${items.slice(0,3).map((item,i)=>`
                <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;">
                  <div style="width:28px;height:28px;border-radius:8px;background:${this.rgba(accent,0.15)};border:1px solid ${this.rgba(accent,0.3)};display:flex;align-items:center;justify-content:center;font-size:0.75em;">${values[i]||'📱'}</div>
                  <div style="font-size:0.46em;color:${gText};font-family:sans-serif;text-align:center;">${item}</div>
                  ${labels[i] ? `<div style="font-size:0.4em;color:${accent};font-family:sans-serif;text-align:center;">${labels[i]}</div>` : ''}
                </div>
                ${i<items.length-1&&i<2?`<div style="flex:0.2;position:relative;"><div style="height:1px;background:linear-gradient(90deg,${this.rgba(accent,0.3)},${accent},${this.rgba(accent,0.3)});"></div><div style="position:absolute;top:-4px;left:50%;width:8px;height:8px;border-radius:50%;background:${accent};transform:translateX(-50%);animation:cr-pulse 1.5s infinite;"></div></div>`:''}
              `).join('')}
            </div>
            ${d.note ? `<div style="font-size:0.48em;color:${gSub};font-family:sans-serif;padding-top:7px;border-top:1px solid ${this.rgba(accent,0.12)};">${d.note}</div>` : ''}`);
  
        // ── TOAST NOTIFICATION ────────────────────────────────────────────────────
        case 'toast-notification':
          return glassWrap(`
            <div style="display:flex;align-items:center;gap:9px;">
              <div style="width:30px;height:30px;border-radius:8px;background:${this.rgba(accent,0.18)};display:flex;align-items:center;justify-content:center;font-size:0.9em;flex-shrink:0;">${d.badge||'✦'}</div>
              <div>
                <div style="font-size:0.56em;font-weight:700;color:${gText};font-family:sans-serif;">${d.name||comp.label||''}</div>
                ${d.subtitle ? `<div style="font-size:0.48em;color:${accent};font-family:sans-serif;margin-top:1px;">${d.subtitle}</div>` : ''}
              </div>
            </div>
            ${d.note ? `<div style="font-size:0.48em;color:${gSub};font-family:sans-serif;margin-top:7px;padding-top:7px;border-top:1px solid ${this.rgba(accent,0.1)};">${d.note}</div>` : ''}`, 'min-width:180px;');
  
        // ── ANNOTATION CALLOUT ────────────────────────────────────────────────────
        case 'annotation-callout':
          return `
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${items.slice(0,3).map((item,i)=>`
              <div style="background:${glass};border:1px solid ${border};border-radius:8px;padding:7px 10px;backdrop-filter:blur(12px);display:flex;align-items:flex-start;gap:7px;">
                <div style="width:16px;height:16px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                  <div style="width:5px;height:5px;border-radius:50%;background:${this.isDark(accent)?'#fff':'#000'};"></div>
                </div>
                <div>
                  ${labels[i] ? `<div style="font-size:0.5em;font-weight:700;color:${accent};font-family:sans-serif;margin-bottom:1px;">${labels[i]}</div>` : ''}
                  <div style="font-size:0.52em;color:${gText};font-family:sans-serif;line-height:1.4;">${item}</div>
                </div>
              </div>`).join('')}
            </div>`;
  
        // ── DEVICE MOCKUP ─────────────────────────────────────────────────────────
        case 'device-mockup':
          return `
            <div style="width:100%;max-width:140px;aspect-ratio:9/19;background:${dark?'#0d0d1f':'#f0f0f8'};border-radius:22px;border:5px solid ${this.rgba(accent,0.35)};overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.45);margin:0 auto;">
              <div style="background:${this.rgba(accent,0.15)};padding:8px 10px 6px;border-bottom:1px solid ${this.rgba(accent,0.15)};">
                <div style="font-size:0.5em;color:${accent};font-weight:600;font-family:sans-serif;">${d.name||''}</div>
                ${d.subtitle ? `<div style="font-size:0.42em;color:${gSub};font-family:sans-serif;">${d.subtitle}</div>` : ''}
              </div>
              <div style="padding:8px;">
                ${items.slice(0,3).map(item=>`
                <div style="background:${this.rgba(accent,0.08)};border-radius:6px;padding:6px 8px;margin-bottom:4px;">
                  <div style="font-size:0.46em;color:${dark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.75)'};font-family:sans-serif;line-height:1.3;">${item}</div>
                </div>`).join('')}
                ${d.progress !== undefined ? `<div style="margin-top:6px;"><div style="height:2px;background:${this.rgba(accent,0.15)};border-radius:1px;"><div style="width:${d.progress}%;height:100%;background:${accent};border-radius:1px;"></div></div></div>` : ''}
              </div>
            </div>`;
  
        // ── PILL BADGE ────────────────────────────────────────────────────────────
        case 'pill-badge':
          return `
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${(d.items||[d.name||comp.label||'']).slice(0,3).map((item,i)=>`
              <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:${i===0?this.rgba(accent,0.18):'rgba(0,0,0,0.3)'};border:1px solid ${i===0?this.rgba(accent,0.45):this.rgba(accent,0.15)};border-radius:20px;backdrop-filter:blur(8px);">
                ${i===0?`<div style="width:6px;height:6px;border-radius:50%;background:${accent};animation:cr-pulse 1.5s infinite;"></div>`:''}
                <div style="font-size:0.52em;font-weight:600;color:${i===0?accent:gSub};font-family:sans-serif;white-space:nowrap;">${item}</div>
              </div>`).join('')}
            </div>`;
  
        // ── FEATURE LIST ──────────────────────────────────────────────────────────
        case 'feature-list':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            ${items.slice(0,5).map((item,i)=>`
            <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid ${this.rgba(accent,0.08)};">
              <div style="width:18px;height:18px;border-radius:5px;background:${this.rgba(accent,0.15)};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.65em;">${values[i]||'✦'}</div>
              <div>
                <div style="font-size:0.54em;font-weight:600;color:${gText};font-family:sans-serif;">${item}</div>
                ${labels[i] ? `<div style="font-size:0.46em;color:${gSub};font-family:sans-serif;margin-top:1px;">${labels[i]}</div>` : ''}
              </div>
            </div>`).join('')}`);
  
        // ── QUOTE CARD ────────────────────────────────────────────────────────────
        case 'quote-card':
          return glassWrap(`
            <div style="font-size:1.8em;color:${accent};line-height:0.5;margin-bottom:5px;font-family:sans-serif;opacity:0.7;">"</div>
            <div style="font-size:0.6em;color:${gText};font-family:sans-serif;font-style:italic;line-height:1.5;margin-bottom:8px;">${d.name||items[0]||''}</div>
            ${d.subtitle ? `<div style="font-size:0.5em;color:${accent};font-weight:600;font-family:sans-serif;">— ${d.subtitle}</div>` : ''}`);
  
        // ── FORM CARD ─────────────────────────────────────────────────────────────
        case 'form-card':
          return glassWrap(`
            ${header(comp.label, d.badge)}
            ${items.slice(0,3).map(item=>`
            <div style="background:${this.rgba(accent,0.06)};border:1px solid ${this.rgba(accent,0.15)};border-radius:7px;padding:7px 10px;margin-bottom:5px;">
              <div style="font-size:0.5em;color:${gSub};font-family:sans-serif;margin-bottom:2px;">${item}</div>
              <div style="height:1px;background:${this.rgba(accent,0.15)};"></div>
            </div>`).join('')}
            ${d.cta ? `<div style="margin-top:8px;padding:7px;background:${accent};border-radius:7px;text-align:center;font-size:0.54em;font-weight:700;color:${this.isDark(accent)?'#fff':'#000'};font-family:sans-serif;cursor:pointer;">${d.cta} →</div>` : ''}`);
  
        default:
          return '';
      }
    },
  
    // ── FALLBACK: show stat or nothing (skip when stats layout already renders KPIs in layerContent) ──
    fallbackComponent(ctx) {
      const { slide, accent, primary, dark, sub, layout } = ctx;
      if (layout === 'stats') return '';
      if (!slide.stat1_value) return '';
      const glass  = dark ? 'rgba(8,6,18,0.78)' : 'rgba(255,255,255,0.84)';
      const border = this.rgba(accent, 0.28);
      const gText  = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';
      return `
        <div style="position:absolute;right:4%;top:15%;z-index:8;animation:cr-float 5s ease-in-out infinite;">
          <div style="background:${glass};border:1px solid ${border};border-radius:14px;padding:12px 16px;backdrop-filter:blur(14px);">
            <div style="font-size:2em;font-weight:900;color:${accent};line-height:1;font-family:sans-serif;">${slide.stat1_value}</div>
            <div style="font-size:0.52em;color:${sub};margin-top:4px;text-transform:uppercase;letter-spacing:0.8px;font-family:sans-serif;">${slide.stat1_label||''}</div>
          </div>
        </div>`;
    },
  
    layerMeta(ctx) {
      const { slide, idx, total, accent, sub } = ctx;
      return `
        ${slide.chapter ? `<div style="position:absolute;top:4%;left:4%;font-size:0.58em;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:2px;font-family:sans-serif;z-index:10;">${slide.chapter}</div>` : ''}
        <div style="position:absolute;bottom:3.5%;right:3%;font-size:0.56em;color:${sub};font-family:monospace;z-index:10;opacity:0.55;">${idx+1} / ${total}</div>`;
    },

    // ── PS LOGO SVG (all paths forced white for use on red bg) ───────────────
    PS_LOGO_WHITE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 286.05 155.39" style="width:100%;height:100%;"><style>.ps-w{fill:#ffffff}</style><path class="ps-w" d="M221.01,48.63c-3.03,2.38-6.88,3.81-11.07,3.81-9.71,0-17.61-7.65-17.61-17.05s7.9-17.05,17.61-17.05c4.19,0,8.04,1.43,11.07,3.81l3.74-3.74c-3.99-3.31-9.16-5.32-14.81-5.32-12.62,0-22.86,9.98-22.86,22.3s10.23,22.3,22.86,22.3c5.65,0,10.82-2,14.81-5.32l-3.74-3.74Z"/><path class="ps-w" d="M153.49,88.35c1.85,0,3.36-1.51,3.36-3.36s-1.51-3.36-3.36-3.36-3.36,1.51-3.36,3.36,1.51,3.36,3.36,3.36Z"/><rect class="ps-w" x="150.87" y="94.72" width="5.24" height="44.6"/><path class="ps-w" d="M43.11,35.26c0-12.23-9.67-22.18-21.56-22.18-6.37,0-12.25,2.77-16.31,7.64v-7.64s-5.24,0-5.24,0v60.67s5.24,0,5.24,0v-23.85c4.1,4.93,9.98,7.72,16.31,7.72,11.89,0,21.56-10.03,21.56-22.36ZM21.56,52.37c-8.8,0-15.96-7.21-16.31-16.42v-.7c0-9.34,7.32-16.94,16.31-16.94,8.99,0,16.31,7.6,16.31,16.94,0,9.44-7.32,17.11-16.31,17.11Z"/><path class="ps-w" d="M62.73,139.26c6.34,0,12.21-2.8,16.31-7.72v7.78s5.24,0,5.24,0v-44.59s-5.24,0-5.24,0v7.64c-4.06-4.87-9.94-7.64-16.31-7.64-11.89,0-21.56,9.95-21.56,22.18s9.67,22.36,21.56,22.36ZM46.41,116.9c0-9.34,7.32-16.94,16.31-16.94s16.31,7.6,16.31,16.94v.7c-.35,9.21-7.52,16.42-16.31,16.42s-16.31-7.68-16.31-17.11Z"/><path class="ps-w" d="M141.19,116.9c0-12.23-9.67-22.18-21.56-22.18-6.37,0-12.25,2.77-16.31,7.64v-7.64s-5.24,0-5.24,0v60.67s5.24,0,5.24,0v-23.85c4.1,4.93,9.98,7.72,16.31,7.72,11.89,0,21.56-10.03,21.56-22.36ZM119.63,134.01c-8.8,0-15.96-7.21-16.31-16.42v-.7c0-9.34,7.32-16.94,16.31-16.94,8.99,0,16.31,7.6,16.31,16.94,0,9.44-7.32,17.11-16.31,17.11Z"/><path class="ps-w" d="M82.4,13.09v26.34c0,7.26-5.76,13.02-13.1,13.11-7.25-.09-12.93-5.85-12.93-13.11V13.09h-5.16v26.34c0,10.07,8.11,18.26,18.08,18.26s18.35-8.19,18.35-18.26V13.09h-5.24Z"/><path class="ps-w" d="M119.63,13.08c-6.34,0-12.21,2.8-16.31,7.72V0h-5.24v57.68h5.24v-7.7c4.06,4.87,9.94,7.64,16.31,7.64,11.89,0,21.56-9.95,21.56-22.18s-9.67-22.36-21.56-22.36ZM135.95,35.44c0,9.34-7.32,16.94-16.31,16.94s-16.31-7.6-16.31-16.94v-.7c.35-9.21,7.52-16.42,16.31-16.42s16.31,7.68,16.31,17.11Z"/><path class="ps-w" d="M174.07,6.71c1.85,0,3.36-1.51,3.36-3.36s-1.51-3.36-3.36-3.36-3.36,1.51-3.36,3.36,1.51,3.36,3.36,3.36Z"/><rect class="ps-w" x="171.45" y="13.09" width="5.24" height="44.6"/><path class="ps-w" d="M239.72,6.71c1.85,0,3.36-1.51,3.36-3.36s-1.51-3.36-3.36-3.36-3.36,1.51-3.36,3.36,1.51,3.36,3.36,3.36Z"/><rect class="ps-w" x="237.09" y="13.09" width="5.24" height="44.6"/><path class="ps-w" d="M239.3,94.72c-4.98,0-9.69,2.03-13.1,5.62v-5.62h-5.07v44.6h5.07v-26.41c.17-7.18,6.05-13.03,13.1-13.03s13.02,5.84,13.02,13.02v26.43h5.15v-26.43c0-10.02-8.15-18.17-18.17-18.17Z"/><path class="ps-w" d="M284.59,134.23l-.52.14c-.5.14-1.34.3-2.55.3-2.11,0-3.01-1.34-3.01-4.47v-30.36h6.19v-5.12h-6.19v-14.98h-5.37v14.98h-6.22v5.12h6.22v30.52c0,3.35.6,5.54,1.89,6.87,1.19,1.36,3.02,2.09,5.29,2.09,1.7,0,3.21-.24,4.24-.66l.29-.12-.26-4.3Z"/><path class="ps-w" d="M202.62,126.48c-2.86,4.73-8.09,7.68-13.67,7.68-8.67,0-15.82-6.94-16.46-15.88h35.35c1.45,0,2.58-1.05,2.58-2.4v-.39c-.92-11.81-10.15-20.72-21.47-20.72-11.94,0-21.65,10.03-21.65,22.36s9.71,22.18,21.65,22.18c7.29,0,14-3.75,17.97-10.03l-4.3-2.8ZM188.95,99.93c7.69,0,14.28,5.56,15.86,13.29h-31.99c1.75-7.85,8.31-13.29,16.12-13.29Z"/><path class="ps-w" d="M29.1,117.79s-1.36-1.06-2.83-1.68c-1.47-.62-3.58-1.33-7.95-2.4-.59-.15-1.17-.27-1.71-.41-2.92-.73-5.23-1.72-6.86-2.93-1.62-1.4-2.22-2.55-2.15-4.12.07-1.66,1.07-3.26,2.8-4.53,1.98-1.46,4.85-2.19,8.11-2.05,3.69.16,6.51,2.01,9.54,4.22l.29.21,3.82-3.55c-.46-.44-.55-.51-1.82-1.38-3-2.03-6.68-4.17-11.61-4.39-4.29-.19-8.12.69-11.08,2.55-3.21,2.17-5.24,5.34-5.28,8.68-.03,2.5.49,4.84,2.98,7.24,2.98,2.87,7.62,4.39,11.87,5.21,3.64.7,7.01,2.05,8.7,3.46,2.02,1.86,2.74,3.2,2.74,5.13-.08,1.85-1.29,3.61-3.35,4.86-2.07,1.55-5.03,2.36-8.11,2.22-4.06-.18-8.27-1.95-12.5-5.26l-.29-.23-3.74,3.43.37.32c4.93,4.26,10.29,6.57,15.93,6.89,4.23.18,7.92-.82,11.28-3.08,3.49-2.41,5.41-5.5,5.56-8.94.16-3.66-1.64-7.29-4.69-9.49Z"/><path class="ps-w" d="M281.35,36.16s-1.36-1.06-2.83-1.68c-1.47-.62-3.58-1.33-7.95-2.4-.59-.15-1.17-.27-1.71-.41-2.92-.73-5.23-1.72-6.86-2.93-1.62-1.4-2.22-2.55-2.15-4.12.07-1.66,1.07-3.26,2.8-4.53,1.98-1.46,4.85-2.19,8.11-2.05,3.69.16,6.51,2.01,9.54,4.22l.29.21,3.82-3.55c-.46-.44-.55-.51-1.82-1.38-3-2.03-6.68-4.17-11.61-4.39-4.29-.19-8.12.69-11.08,2.55-3.21,2.17-5.24,5.34-5.28,8.68-.03,2.5.49,4.84,2.98,7.24,2.98,2.87,7.62,4.39,11.87,5.21,3.64.7,7.01,2.05,8.7,3.46,2.02,1.86,2.74,3.2,2.74,5.13-.08,1.85-1.29,3.61-3.35,4.86-2.07,1.55-5.03,2.36-8.11,2.22-4.06-.18-8.27-1.95-12.5-5.26l-.29-.23-3.74,3.43.37.32c4.93,4.26,10.29,6.57,15.93,6.89,4.23.18,7.92-.82,11.28-3.08,3.49-2.41,5.41-5.5,5.56-8.94.16-3.66-1.64-7.29-4.69-9.49Z"/><rect class="ps-w" x="150.87" y="0" width="5.24" height="57.68"/></svg>`,

    // ── PUBLICIS SAPIENT BRAND RENDERER ──────────────────────────────────────────
    renderPS(slide, idx, total) {
      const RED   = '#E2231A';
      const WHITE = '#FFFFFF';
      const BLACK = '#111111';
      const GREY  = '#555555';
      const HF    = "'Lexend Deca', sans-serif";
      const BF    = "'Roboto', sans-serif";

      // Escape HTML then convert **bold** markdown to <strong>
      const e = s => String(s||'')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>');

      // Footer shared by all slides
      const footer = (lightText) => {
        const fg = lightText ? 'rgba(255,255,255,0.7)' : '#999999';
        return `
          <div style="position:absolute;bottom:0;left:0;right:0;height:9%;z-index:10;display:flex;align-items:center;padding:0 5%;">
            <div style="flex:1;font-size:0.52em;color:${fg};font-family:${BF};letter-spacing:0.03em;">© Publicis Sapient</div>
            <div style="flex:1;text-align:center;font-size:0.52em;color:${fg};font-family:${BF};letter-spacing:0.04em;">XX.2026</div>
            ${idx > 0 ? `<div style="flex:1;text-align:right;font-size:0.52em;color:${fg};font-family:${BF};font-weight:600;">${idx+1}</div>` : '<div style="flex:1;"></div>'}
          </div>`;
      };

      // Thin red accent bar for white-background slides
      const redBar = `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${RED};z-index:10;"></div>`;

      const layout     = slide.layout || 'split';
      const layoutType = slide.layoutType || '';

      // ── Derive semantic flags from layoutType (preferred) with fallbacks ────
      const isTitleHero       = layoutType === 'title-hero'        || idx === 0;
      const isSectionDivider  = layoutType === 'section-divider'   || slide.type === 'divider';
      const isClosing         = layoutType === 'closing-commitment' || (idx === total - 1 && idx > 0);
      const isStatImpact      = layoutType === 'stat-impact'        || layout === 'stats'
                                || (slide.stat1_value && slide.stat2_value);
      const isHeadlineOnly    = layoutType === 'headline-only';
      const isArchDiagram     = layoutType === 'architecture-diagram';
      const isNarrative       = layoutType === 'one-column-narrative' || layoutType === 'agenda-list';

      // ── SECTION DIVIDER — red bg, centered section name, no bullets ──────────
      if (isSectionDivider && !isTitleHero) {
        const sectionNum = slide.stat1_value && /^\d+$/.test(String(slide.stat1_value).trim())
          ? `<div style="position:absolute;bottom:10%;right:5%;z-index:5;font-size:6em;font-weight:900;color:rgba(255,255,255,0.12);font-family:${HF};line-height:1;user-select:none;">${e(slide.stat1_value)}</div>`
          : '';
        return `
          <div style="position:absolute;inset:0;background:${RED};"></div>
          <div style="position:absolute;top:0;left:0;right:0;height:4px;background:rgba(0,0,0,0.15);z-index:10;"></div>
          <div style="position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;justify-content:center;padding:8% 10%;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.6em;font-weight:600;color:rgba(255,255,255,0.65);font-family:${BF};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:0.7em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:2.8em;font-weight:800;color:${WHITE};font-family:${HF};line-height:1.06;max-width:70%;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.82em;color:rgba(255,255,255,0.75);font-family:${BF};line-height:1.5;margin-top:0.6em;max-width:60%;">${e(slide.headline)}</div>` : ''}
          </div>
          ${sectionNum}
          ${footer(true)}`;
      }

      // ── HEADLINE ONLY — large centered headline on red ────────────────────────
      if (isHeadlineOnly) {
        return `
          <div style="position:absolute;inset:0;background:${RED};"></div>
          <div style="position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;justify-content:center;padding:8% 10%;">
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:3em;font-weight:800;color:${WHITE};font-family:${HF};line-height:1.04;max-width:75%;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.92em;color:rgba(255,255,255,0.72);font-family:${BF};line-height:1.5;margin-top:0.7em;max-width:65%;">${e(slide.headline)}</div>` : ''}
          </div>
          ${footer(true)}`;
      }

      // ── CLOSING COMMITMENT — white bg, red accent, prominent CTA ─────────────
      if (isClosing) {
        return `
          <div style="position:absolute;inset:0;background:${WHITE};"></div>
          ${redBar}
          <div style="position:absolute;top:0;left:0;bottom:0;width:5px;background:${RED};z-index:10;"></div>
          <div style="position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;justify-content:center;padding:8% 10%;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.58em;font-weight:700;color:${RED};font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.6em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:2.2em;font-weight:800;color:${RED};font-family:${HF};line-height:1.06;max-width:72%;margin-bottom:0.5em;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.78em;color:${BLACK};font-family:${BF};line-height:1.6;max-width:58%;margin-bottom:1em;">${e(slide.headline)}</div>` : ''}
            ${(slide.body||[]).length ? `<div style="display:flex;flex-direction:column;gap:0.3em;max-width:55%;margin-bottom:1.2em;">
              ${(slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.66em;color:${GREY};font-family:${BF};line-height:1.5;padding:0.25em 0;border-top:1px solid rgba(0,0,0,0.07);">${e(b)}</div>`).join('')}
            </div>` : ''}
            ${slide.cta ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="cta" data-label="CTA button" style="display:inline-block;background:${RED};color:${WHITE};padding:0.5em 1.4em;border-radius:4px;font-size:0.72em;font-weight:700;font-family:${BF};letter-spacing:0.02em;">${e(slide.cta)} →</div>` : ''}
          </div>
          ${footer(false)}`;
      }

      // ── TITLE HERO / COVER (red bg) ───────────────────────────────────────────
      if (isTitleHero) {
        const logoLine = `
          <div style="position:absolute;top:5%;left:4%;z-index:10;width:11%;max-width:120px;">
            ${CinematicRenderer.PS_LOGO_WHITE}
          </div>`;
        return `
          <div style="position:absolute;inset:0;background:${RED};"></div>
          ${logoLine}
          <div style="position:absolute;top:38%;left:5%;right:5%;z-index:5;max-width:70%;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.62em;font-weight:600;color:rgba(255,255,255,0.7);font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.6em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:3.2em;font-weight:800;color:${WHITE};font-family:${HF};line-height:1.05;margin-bottom:0.4em;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.9em;color:rgba(255,255,255,0.8);font-family:${BF};line-height:1.5;margin-top:0.5em;max-width:80%;">${e(slide.headline)}</div>` : ''}
          </div>
          ${footer(true)}`;
      }

      // ── STAT IMPACT (white bg, large numbers right-side) ─────────────────────
      if (isStatImpact) {
        const hasStatValues = !!(slide.stat1_value || slide.stat2_value);
        const textRight = hasStatValues ? '48%' : '5%';
        return `
          <div style="position:absolute;inset:0;background:${WHITE};"></div>
          ${redBar}
          <div style="position:absolute;top:6%;left:5%;right:${textRight};z-index:5;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.58em;font-weight:700;color:${RED};font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:1.9em;font-weight:800;color:${RED};font-family:${HF};line-height:1.05;margin-bottom:0.4em;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.75em;color:${BLACK};font-family:${BF};line-height:1.55;margin-bottom:1em;">${e(slide.headline)}</div>` : ''}
            ${(slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.7em;color:${GREY};font-family:${BF};line-height:1.5;margin-bottom:0.4em;">${e(b)}</div>`).join('')}
          </div>
          ${slide.stat1_value ? `
            <div style="position:absolute;top:${slide.stat2_value?'10%':'25%'};right:5%;z-index:5;text-align:right;">
              <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="stat1_value" data-label="Stat 1 value" style="font-size:3.5em;font-weight:800;color:${RED};font-family:${HF};line-height:1;">${e(slide.stat1_value)}</div>
              <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="stat1_label" data-label="Stat 1 label" style="font-size:0.58em;color:${GREY};font-family:${BF};letter-spacing:0.08em;text-transform:uppercase;margin-top:0.2em;">${e(slide.stat1_label||'')}</div>
            </div>` : ''}
          ${slide.stat2_value ? `
            <div style="position:absolute;top:40%;right:5%;z-index:5;text-align:right;">
              <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="stat2_value" data-label="Stat 2 value" style="font-size:3.5em;font-weight:800;color:${RED};font-family:${HF};line-height:1;">${e(slide.stat2_value)}</div>
              <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="stat2_label" data-label="Stat 2 label" style="font-size:0.58em;color:${GREY};font-family:${BF};letter-spacing:0.08em;text-transform:uppercase;margin-top:0.2em;">${e(slide.stat2_label||'')}</div>
            </div>` : ''}
          ${slide.cta ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="cta" data-label="CTA button" style="position:absolute;bottom:12%;left:5%;z-index:5;background:${RED};color:${WHITE};padding:0.4em 1.1em;border-radius:4px;font-size:0.68em;font-weight:700;font-family:${BF};">${e(slide.cta)} →</div>` : ''}
          ${footer(false)}`;
      }

      // ── ONE-COLUMN NARRATIVE / AGENDA — full-width text, no image zone ────────
      if (isNarrative) {
        return `
          <div style="position:absolute;inset:0;background:${WHITE};"></div>
          ${redBar}
          <div style="position:absolute;top:6%;left:5%;right:5%;z-index:5;display:flex;flex-direction:column;height:82%;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.55em;font-weight:700;color:${RED};font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:1.85em;font-weight:800;color:${RED};font-family:${HF};line-height:1.06;margin-bottom:0.4em;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.78em;color:${BLACK};font-family:${BF};line-height:1.6;margin-bottom:0.8em;max-width:72%;">${e(slide.headline)}</div>` : ''}
            ${(slide.body||[]).length ? `<div style="flex:1;overflow:hidden;columns:${(slide.body||[]).length > 4 ? 2 : 1};column-gap:6%;">
              ${(slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.68em;color:${GREY};font-family:${BF};line-height:1.55;padding:0.3em 0;border-top:1px solid rgba(0,0,0,0.07);break-inside:avoid;">${e(b)}</div>`).join('')}
            </div>` : ''}
            ${slide.cta ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="cta" data-label="CTA button" style="margin-top:auto;display:inline-block;background:${RED};color:${WHITE};padding:0.4em 1.1em;border-radius:4px;font-size:0.65em;font-weight:700;font-family:${BF};">${e(slide.cta)} →</div>` : ''}
          </div>
          ${footer(false)}`;
      }

      // ── ARCHITECTURE DIAGRAM — narrow left text (40%), wide right zone (56%) ──
      if (isArchDiagram) {
        const hasImage = slide.hasImage !== false && slide.image_data_url;
        const diagramPanel = hasImage
          ? `<img src="${slide.image_data_url}" style="position:absolute;right:0;top:0;width:56%;height:100%;object-fit:cover;border-radius:16px 0 0 16px;" />`
          : '';
        const textRight = diagramPanel ? '58%' : '5%';
        return `
          <div style="position:absolute;inset:0;background:${WHITE};"></div>
          ${redBar}
          ${diagramPanel}
          <div style="position:absolute;top:6%;left:4%;right:${textRight};z-index:5;display:flex;flex-direction:column;height:82%;">
            ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.52em;font-weight:700;color:${RED};font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4em;">${e(slide.subtitle)}</div>` : ''}
            <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:1.45em;font-weight:800;color:${RED};font-family:${HF};line-height:1.08;margin-bottom:0.4em;">${e(slide.title||'')}</div>
            ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.68em;color:${BLACK};font-family:${BF};line-height:1.55;margin-bottom:0.7em;">${e(slide.headline)}</div>` : ''}
            ${(slide.body||[]).length ? `<div style="flex:1;overflow:hidden;">
              ${(slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.62em;color:${GREY};font-family:'Roboto Mono',monospace;line-height:1.5;margin-bottom:0.35em;">${e(b)}</div>`).join('')}
            </div>` : ''}
          </div>
          ${footer(false)}`;
      }

      // ── SPLIT layout (white bg, left text + right content) ───────────────────
      // Used for: two-column-content, solution-hero, pillar-detail, case-study-psi,
      //           image-headline, chart-insight, and all unmatched content slides.
      const hasImage = slide.hasImage !== false && slide.image_data_url;
      const hasBullets = slide.body && slide.body.length;
      const hasStats = slide.stat1_value;

      // Build right-side panel content (priority: image > card grid > stats)
      let rightPanel = '';
      if (hasImage) {
        rightPanel = `<img src="${slide.image_data_url}" style="position:absolute;right:0;top:0;width:46%;height:100%;object-fit:cover;border-radius:16px 0 0 16px;" />`;
      } else if (slide.body && slide.body.length >= 4 && !hasStats) {
        // 2-column body as red cards (capabilities style)
        const cards = slide.body.slice(0, 6);
        rightPanel = `
          <div style="position:absolute;right:4%;top:16%;width:46%;z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:2%;height:72%;">
            ${cards.map(card => {
              const parts = card.split(':');
              const cardTitle = parts[0]||'';
              const cardBody  = parts.slice(1).join(':').trim()||card;
              return `<div style="background:${RED};border-radius:14px;padding:6% 7%;display:flex;flex-direction:column;justify-content:space-between;">
                <div style="font-size:0.62em;font-weight:700;color:${WHITE};font-family:${HF};line-height:1.2;margin-bottom:auto;">${e(cardTitle||card)}</div>
                ${parts.length>1?`<div style="font-size:0.52em;color:rgba(255,255,255,0.85);font-family:${BF};line-height:1.4;margin-top:8%;">${e(cardBody)}</div>`:''}
              </div>`;
            }).join('')}
          </div>`;
      } else if (hasStats) {
        rightPanel = `
          <div style="position:absolute;right:5%;top:20%;z-index:5;text-align:right;">
            <div style="font-size:0.55em;color:${BLACK};font-family:${BF};font-weight:600;margin-bottom:0.3em;">The impact</div>
            <div style="font-size:3.2em;font-weight:800;color:${RED};font-family:${HF};line-height:1;">${e(slide.stat1_value)}</div>
            <div style="font-size:0.55em;color:${GREY};font-family:${BF};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1.4em;">${e(slide.stat1_label||'')}</div>
            ${slide.stat2_value ? `
              <div style="font-size:3em;font-weight:800;color:${RED};font-family:${HF};line-height:1;">${e(slide.stat2_value)}</div>
              <div style="font-size:0.55em;color:${GREY};font-family:${BF};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1.4em;">${e(slide.stat2_label||'')}</div>` : ''}
            ${slide.stat3_value ? `
              <div style="font-size:2.2em;font-weight:800;color:${RED};font-family:${HF};line-height:1;">${e(slide.stat3_value)}</div>
              <div style="font-size:0.55em;color:${GREY};font-family:${BF};letter-spacing:0.06em;text-transform:uppercase;">${e(slide.stat3_label||'')}</div>` : ''}
          </div>`;
      }

      // Hard stop: text column ends at 48% when a right panel exists —
      // never let body text run beneath the visual zone.
      const textRight = rightPanel ? '48%' : '5%';

      return `
        <div style="position:absolute;inset:0;background:${WHITE};"></div>
        ${redBar}
        ${rightPanel}
        <div style="position:absolute;top:6%;left:5%;right:${textRight};z-index:5;display:flex;flex-direction:column;height:82%;">
          ${slide.subtitle ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="subtitle" data-label="Subtitle" style="font-size:0.55em;font-weight:700;color:${RED};font-family:${BF};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5em;">${e(slide.subtitle)}</div>` : ''}
          <div class="slide-editable" contenteditable="true" spellcheck="true" data-field="title" data-label="Title" style="font-size:${hasBullets&&hasBullets>=2?'1.55em':'1.85em'};font-weight:800;color:${RED};font-family:${HF};line-height:1.06;margin-bottom:0.4em;">${e(slide.title||'')}</div>
          ${slide.headline ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="headline" data-label="Headline" style="font-size:0.72em;color:${BLACK};font-family:${BF};line-height:1.55;margin-bottom:0.8em;">${e(slide.headline)}</div>` : ''}
          ${hasBullets ? `<div style="flex:1;overflow:hidden;">
            ${layout === 'bullets' || hasBullets <= 3
              ? (slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.68em;color:${GREY};font-family:${BF};line-height:1.55;padding:0.3em 0;border-top:1px solid rgba(0,0,0,0.07);">${e(b)}</div>`).join('')
              : (slide.body||[]).map((b,i)=>`<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="body-${i}" data-label="Body text" style="font-size:0.68em;color:${GREY};font-family:${BF};line-height:1.5;margin-bottom:0.4em;">${e(b)}</div>`).join('')
            }
          </div>` : ''}
          ${slide.cta ? `<div class="slide-editable" contenteditable="true" spellcheck="true" data-field="cta" data-label="CTA button" style="margin-top:auto;display:inline-block;background:${RED};color:${WHITE};padding:0.4em 1.1em;border-radius:4px;font-size:0.65em;font-weight:700;font-family:${BF};">${e(slide.cta)} →</div>` : ''}
        </div>
        ${footer(false)}`;
    },

    // ── UTILS ────────────────────────────────────────────────────────────────────
    isDark(hex) {
      hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
      return(0.299*parseInt(hex.slice(0,2),16)+0.587*parseInt(hex.slice(2,4),16)+0.114*parseInt(hex.slice(4,6),16))<128;
    },
    shiftColor(hex,amt) {
      hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
      return '#'+[0,2,4].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+amt)).toString(16).padStart(2,'0')).join('');
    },
    rgba(hex,a) {
      hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
      return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${a})`;
    },
    e(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>'); }
  };