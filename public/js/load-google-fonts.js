// ─── Google Fonts manifest + lazy CSS loading ───────────────────────────────
// Dropdown options come from /google-fonts.json (large list). We only inject
// fonts.googleapis.com CSS for families the user actually selects (not all 1000+).

(function () {
  const FALLBACK_FAMILIES = [
    'DM Sans',
    'Roboto',
    'Inter',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Lato',
    'Merriweather',
    'Source Sans 3',
    'Nunito Sans',
    'Lexend Deca',
  ];

  /** @type {string[]} */
  window.PS_GOOGLE_FONT_FAMILIES = FALLBACK_FAMILIES.slice();

  const loaded = new Set();

  /**
   * Inject one Google Fonts stylesheet for a family (weights used in deck UI / PPTX).
   * @param {string} name - Family name, e.g. "Fira Sans"
   */
  window.loadGoogleFontFamily = function loadGoogleFontFamily(name) {
    if (!name || typeof name !== 'string') return;
    const t = name.trim();
    if (!t || loaded.has(t)) return;
    loaded.add(t);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=' +
      encodeURIComponent(t) +
      ':wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  };

  /**
   * Fetch /google-fonts.json and populate PS_GOOGLE_FONT_FAMILIES for dropdowns.
   */
  window.loadGoogleFontsManifest = async function loadGoogleFontsManifest() {
    try {
      const res = await fetch('/google-fonts.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('empty list');
      window.PS_GOOGLE_FONT_FAMILIES = data.filter((x) => typeof x === 'string' && x.trim());
    } catch (e) {
      console.warn('[fonts] Could not load google-fonts.json; using fallback list.', e);
    }
  };
})();
