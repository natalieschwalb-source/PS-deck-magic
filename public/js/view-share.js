// ─── VIEW-ONLY SHARED DECK (/view/:id) ─────────────────────────────────────

(function () {
  const DEFAULT_BRAND = {
    clientName: '',
    designMode: 'ps-brand',
    artPresetId: 'cinematic-dark',
    primaryColor: '#7c6af7',
    accentColor: '#ffffff',
    font: '',
    extraColors: [],
    toneId: 'visionary',
  };

  const ViewShare = {
    slides: [],
    cur: 0,
    _brand: null,
    _isPresenting: false,
    _presentBaseW: 0,
    _presentBaseH: 0,
    _hotkeysBound: false,

    async init() {
      const seg = location.pathname.split('/').filter(Boolean);
      const id = seg[seg.length - 1] || '';
      const badge = document.getElementById('view-badge');
      const card = document.getElementById('p3-slide-card');

      try {
        if (window.loadGoogleFontsManifest) await window.loadGoogleFontsManifest();

        const res = await fetch('/api/share/' + encodeURIComponent(id));
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Could not load this deck.');
        }
        const data = await res.json();
        this.slides = Array.isArray(data.slides) ? data.slides : [];
        if (!this.slides.length) throw new Error('This deck has no slides.');

        this._brand = { ...DEFAULT_BRAND, ...(data.brand && typeof data.brand === 'object' ? data.brand : {}) };
        window.App = { state: { brand: this._brand } };
        if (window.loadGoogleFontFamily && this._brand.font) window.loadGoogleFontFamily(this._brand.font);

        const name = (data.deckName || '').trim();
        badge.textContent = name ? `${name} · ${this.slides.length} slides` : `Shared deck · ${this.slides.length} slides`;

        document.getElementById('view-present').addEventListener('click', () => this.togglePresentation());
        document.getElementById('p3-prev').addEventListener('click', () => this.nav(-1));
        document.getElementById('p3-next').addEventListener('click', () => this.nav(1));

        this.cur = 0;
        this.renderSlide(0);
        this.renderThumbs();
        this.updateNavState();
      } catch (e) {
        badge.textContent = 'Error';
        card.innerHTML = `<div class="view-err"><strong>Unable to load deck</strong><br>${String(e.message || e)}</div>`;
        document.getElementById('view-present').disabled = true;
      }
    },

    renderSlide(idx) {
      const slide = this.slides[idx];
      const card = document.getElementById('p3-slide-card');
      if (!slide || !card) return;

      const brand = this._brand;
      const isPSBrand = (brand.designMode || 'ps-brand') === 'ps-brand';
      let html;
      if (isPSBrand) {
        html = CinematicRenderer.renderPS(slide, idx, this.slides.length);
      } else {
        const ff = (brand.font || '').trim();
        if (ff && window.loadGoogleFontFamily) window.loadGoogleFontFamily(ff);
        html = CinematicRenderer.render(
          slide,
          idx,
          this.slides.length,
          brand.primaryColor || DEFAULT_BRAND.primaryColor,
          brand.accentColor || DEFAULT_BRAND.accentColor
        );
      }
      const wrapFont =
        !isPSBrand && (brand.font || '').trim()
          ? `'${String(brand.font).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', sans-serif`
          : "'Roboto', sans-serif";
      card.innerHTML = `<div class="sr" style="font-family:${wrapFont}">${html}</div>`;
      document.getElementById('p3-ctr').textContent = `${idx + 1} / ${this.slides.length}`;
    },

    renderThumbs() {
      const strip = document.getElementById('p3-thumbs');
      strip.innerHTML = '';
      const brand = this._brand;
      const isPSBrand = (brand.designMode || 'ps-brand') === 'ps-brand';
      const primaryColor = isPSBrand ? '#E2231A' : brand.primaryColor || DEFAULT_BRAND.primaryColor;

      this.slides.forEach((slide, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'p3-thumb' + (i === this.cur ? ' active' : '');
        thumb.onclick = () => {
          this.cur = i;
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

    nav(dir) {
      const next = this.cur + dir;
      if (next < 0 || next >= this.slides.length) return;
      this.cur = next;
      this.renderSlide(this.cur);
      this.renderThumbs();
      this.updateNavState();
    },

    updateNavState() {
      document.getElementById('p3-prev').disabled = this.cur <= 0;
      document.getElementById('p3-next').disabled = this.cur >= this.slides.length - 1;
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
        } else if (e.key === 'Escape' && document.fullscreenElement) {
          e.preventDefault();
          document.exitFullscreen?.();
        }
      });
      document.addEventListener('fullscreenchange', () => {
        const area = document.getElementById('p3-preview-area');
        const inFs = document.fullscreenElement === area;
        this._isPresenting = inFs;
        if (inFs) this.enterPresentationMode();
        else this.exitPresentationMode();
        const btn = document.getElementById('view-present');
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

    _onPresentResize: () => ViewShare.applyPresentationScale(),

    applyPresentationScale() {
      if (!ViewShare._isPresenting) return;
      const area = document.getElementById('p3-preview-area');
      const card = document.getElementById('p3-slide-card');
      if (!area || !card) return;
      const bw = ViewShare._presentBaseW || 720;
      const bh = ViewShare._presentBaseH || 405;
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
  };

  document.addEventListener('DOMContentLoaded', () => ViewShare.init());
})();
