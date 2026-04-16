// ─── VOICE INPUT (Web Speech API) — shared by Phase 1–3 chat ─────────────────

window.VoiceInput = {
  _rec: null,
  _listeningBtn: null,
  _prefix: '',
  _accumulated: '',

  supported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  /**
   * @param {HTMLElement} buttonEl
   * @param {HTMLTextAreaElement} textareaEl
   * @param {{ syncSend?: string, isBusy?: () => boolean }} [opts]
   */
  attach(buttonEl, textareaEl, opts = {}) {
    if (!buttonEl || !textareaEl) return;
    if (!this.supported()) {
      buttonEl.style.display = 'none';
      return;
    }
    buttonEl.type = 'button';
    buttonEl.title = 'Voice input — click to start, click again to stop';
    buttonEl.setAttribute('aria-label', 'Voice input');
    buttonEl.setAttribute('aria-pressed', 'false');
    buttonEl.addEventListener('click', (e) => {
      e.preventDefault();
      if (this._listeningBtn === buttonEl) this.stop();
      else {
        this.stop();
        this._start(buttonEl, textareaEl, opts);
      }
    });
  },

  stop() {
    const rec = this._rec;
    const btn = this._listeningBtn;
    this._rec = null;
    this._listeningBtn = null;
    this._prefix = '';
    this._accumulated = '';
    if (rec) {
      try {
        rec.onend = null;
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    if (btn) {
      btn.classList.remove('voice-listening');
      btn.setAttribute('aria-pressed', 'false');
    }
  },

  _start(buttonEl, ta, opts) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    this._prefix = ta.value;
    this._accumulated = '';
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = (navigator.language || 'en-US').replace('_', '-');

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) this._accumulated += t;
        else interim += t;
      }
      const piece = this._accumulated + interim;
      const gap =
        this._prefix && piece && !/\s$/.test(this._prefix) && /^\S/.test(piece) ? ' ' : '';
      ta.value = this._prefix + gap + piece;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      if (opts.syncSend) {
        const send = document.getElementById(opts.syncSend);
        if (send) {
          const busy = typeof opts.isBusy === 'function' ? opts.isBusy() : false;
          send.disabled = !ta.value.trim() || busy;
        }
      }
    };

    rec.onerror = (ev) => {
      const err = ev.error || '';
      if (err === 'no-speech' || err === 'aborted') return;
      if (err === 'not-allowed') {
        alert('Microphone access was blocked. Allow the microphone for this site in your browser settings.');
      }
      this.stop();
    };

    rec.onend = () => {
      if (this._rec === rec) this.stop();
    };

    this._rec = rec;
    this._listeningBtn = buttonEl;
    buttonEl.classList.add('voice-listening');
    buttonEl.setAttribute('aria-pressed', 'true');
    try {
      rec.start();
    } catch {
      this.stop();
    }
  },
};
