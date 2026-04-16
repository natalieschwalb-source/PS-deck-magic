# PS-Deck-Magic

Agency deck builder with:
- Split-panel UI (form + AI chat left, slide preview right)
- Server-side AI (no browser CORS issues)
- Client-side PPTX export (PptxGenJS)

## AI providers

**Recommended: Google Gemini** (default when `GEMINI_API_KEY` is set)

- **Deck text (JSON)** — `GEMINI_MODEL` (default `gemini-2.5-flash`; `gemini-2.0-flash` is not available to new users)
- **Slide images** — **Nano Banana** (native Gemini image models), default `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`  
  Or switch to **Imagen**: set `GEMINI_IMAGE_BACKEND=imagen` and tune `GEMINI_IMAGEN_MODEL`
- **Optional video** — **Veo** via `POST /api/video` (slow, paid). Enable with `GEMINI_ENABLE_VEO=1`; generated MP4s are served from `/clips/`

**Legacy: OpenAI** — set `OPENAI_API_KEY` and `AI_PROVIDER=openai` if you prefer Chat Completions + DALL·E-style images.

## Setup

```bash
cd PS-Deck-Magic-v2
cp .env.example .env
```

Edit `.env`:

- Add **`GEMINI_API_KEY`** from [Google AI Studio](https://aistudio.google.com/apikey) (or your Google AI API key source).

Optional:

- `GEMINI_IMAGE_BACKEND=imagen` for Imagen instead of Nano Banana
- `GEMINI_ENABLE_VEO=1` to enable the **Veo clips** button in the UI

## Run

```bash
cd PS-Deck-Magic-v2
npm install
npm run dev
```

Open `http://localhost:5180` unless you changed `PORT` in `.env` (not a `file://` HTML path).

## Share with colleagues (temporary public URL)

Use a **tunnel** so others can load your machine while `npm run dev` is running. Keep your laptop on and the terminal open for the session.

1. **Terminal A — app**

   ```bash
   npm run dev
   ```

2. **Terminal B — tunnel** (pick one)

   | Tool | Command |
   |------|---------|
   | **localtunnel** (no extra install) | `npm run tunnel` |
   | **ngrok** ([download](https://ngrok.com/download)) | `ngrok http 5180` |
   | **Cloudflare Tunnel** ([install `cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)) | `cloudflared tunnel --url http://localhost:5180` |

   If your `.env` sets a different `PORT`, use that port in the tunnel command and change the `tunnel` script in `package.json` to match.

3. Copy the **https://…** URL the tool prints and send it to testers. (localtunnel’s default domain may show a one-time “Click to continue” page for first-time visitors.)

**Security:** Anyone with the link can use your app and **consume your API quota** (Gemini/OpenAI). Treat the URL like a password; rotate API keys if a link leaks. For longer-lived or stricter access, deploy to a host and add authentication.

### View-only deck links (Phase 3)

In **Step 3**, use **Share** to save the current deck on the server and get a **read-only** URL (`/view/<id>`) for stakeholders. Snapshots live under `data/shares/` (gitignored). Restarting the server does not remove them unless you delete those files.

**PPTX vs preview:** Download uses a screenshot of each in-app slide (`html2canvas`) so PowerPoint matches the browser layout (fonts, blend modes, positioning). If capture fails, the app falls back to a simpler vector layout.

## Security

- Never commit real API keys. Keep them only in `.env` (gitignored).
