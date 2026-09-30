# VIGIL — Build & Run Guide

Step-by-step instructions to build, run, and verify every component of VIGIL locally and in deployment.

## Project Components

| Component | Location | What it is |
|---|---|---|
| Analyzer server | `app.py` | Local Python HTTP server — the rules engine + optional Ollama review |
| Chromium extension | `extension/` | Manifest V3 side-panel extension (page / selection / screenshot scanning) |
| Web UI | `web/` | Browser frontend (deployed on Vercel) |
| Serverless API | `api/` | Vercel Python functions backing the web UI (`/api/*`) |
| Offline verification | `scripts/run_offline_fixtures.py` | Deterministic fixture tests, no network or model required |
| Design generation | `scripts/generate-vigil-design.mjs` | Optional UI design regeneration via Stitch SDK |

---

## Prerequisites

- **Python 3.9+** — that's it for the core server. VIGIL's analyzer uses **only the Python standard library**; there is no `pip install` step.
- **Chromium-based browser** (Chrome, Brave, Edge, Chromium) — for the extension.
- **Node.js + npm** — only needed for the optional design script.
- **Vercel CLI** — only needed to run/deploy the web UI + serverless API.
- **A local LLM server** (optional) — Ollama, or any OpenAI-compatible server (LM Studio, llama.cpp, vLLM, Jan, LocalAI). VIGIL works fully without one.

---

## 1. Run the Local Analyzer Server

```bash
git clone https://github.com/adityaUndefined/VIGIL.git
cd VIGIL
python3 app.py
```

Output:

```
VIGIL running at http://127.0.0.1:8000
```

The server is now live with the full rules engine. No internet, no model, no dependencies needed.

**Configuration (environment variables):**

| Variable | Default | Purpose |
|---|---|---|
| `VIGIL_PORT` | `8000` | Server port |
| `VIGIL_HOST` | `127.0.0.1` | Bind address |
| `VIGIL_LLM_BASE_URL` | _(unset)_ | Any OpenAI-compatible local server (see below) |
| `VIGIL_LLM_MODEL` | _(unset)_ | Model id your server exposes |
| `VIGIL_LLM_PROVIDER` | `openai` | `openai` or `ollama` (only used with `VIGIL_LLM_BASE_URL`) |
| `VIGIL_LLM_API_KEY` | _(unset)_ | Optional bearer key; most local servers need none |
| `VIGIL_OLLAMA_URL` | `http://127.0.0.1:11434` | Native Ollama endpoint (used when `VIGIL_LLM_BASE_URL` is unset) |
| `VIGIL_OLLAMA_MODEL` | `qwen3.5:2b` | Native Ollama model |

Example — run on a different port:

```bash
VIGIL_PORT=9000 python3 app.py
```

> ⚠️ The extension's `host_permissions` is pinned to `http://127.0.0.1:8000/*`. If you change the port, update `extension/manifest.json` to match.

---

## 2. Load the Chromium Extension

The companion extension (**VIGIL Security**, Manifest V3) adds a full side panel to the browser: current-page scanning, selected-text scanning, screenshot analysis via VIGIL Vision (local OCR — the image never leaves the device), scan history, and settings. It is a pure client: every verdict comes from the analyzer, no detection logic is duplicated, and no secrets are stored in the extension.

### 2.1 Install and load

1. Start the analyzer first (step 1) — the extension talks to `http://127.0.0.1:8000`.
2. Open `chrome://extensions` in your Chromium browser.
3. Enable **Developer mode** (toggle, top-right).
4. Click **Load unpacked** and select the `extension/` directory of this repo.
5. Pin **VIGIL Security** to the toolbar and click the icon — the VIGIL side panel opens next to the page.

### 2.2 Configure the API URL

The server address defaults to `http://127.0.0.1:8000` (defined in `extension/config/config.js`). To point the extension somewhere else — e.g. a deployed VIGIL instance — open the side panel → **⚙ Settings** → **VIGIL server address**, enter the URL, **Save**, then **Test Connection**. The setting syncs via `chrome.storage.sync`; no restart is needed. The backend URL is the only configuration the extension carries: there are no API keys client-side by design. Any LLM credentials stay on the backend (`VIGIL_LLM_*` / `VIGIL_OLLAMA_*`, see § 5).

### 2.3 Using the extension

- **Scan This Page** — extracts page structure (text, visible links, form shapes) and returns the verdict with evidence. Never reads form values.
- **Right-click selected text → "Scan with VIGIL"** — analyzes the highlighted message through the same engine as the Message tab.
- **Capture & Scan** — captures the visible tab and runs the VIGIL Vision pipeline locally (Tesseract.js OCR + jsQR, bundled in `extension/vendor/`), then sends only extracted text/coordinates to the analyzer. First Vision scan warms the local OCR engine (a few seconds).
- **Settings** — enable/disable page scanning, clear or disable history (metadata only: time, label, verdict, score), backend + local-model status.

> Permissions: `storage`, `activeTab`, `scripting`, `contextMenus`, `sidePanel` — the minimum set. Nothing is sent to the backend until you trigger a scan, and page content is never stored. If you change the analyzer port, also update `host_permissions` in `extension/manifest.json`.

### 2.4 Verifying the extension build

```bash
npm run test:extension
```

This validates the manifest, referenced files, permission surface, CSP, and icons; runs static privacy checks (no form-value reads, no keystroke listeners, no secrets, no dynamic HTML injection); starts the real analyzer and exercises every endpoint the extension calls with the exact payload shapes; and, if a system `tesseract` binary is available, runs the full Vision path end-to-end — renders fixture screenshots, OCRs them, sends the region payload to `/api/vision/analyze`, and checks the verdicts.

To rebuild the distributable `vigil-extension.zip` (extension contents at the archive root so the extracted folder can be loaded directly via **Load unpacked**; excludes `test_extension.py` and bytecode caches):

```bash
npm run build:extension
```

The build script fails if `manifest.json` is not at the zip root — nesting the contents under `extension/` makes Chrome reject the load with "Manifest file is missing or unreadable."

---

## 3. Run the Web UI

The web frontend (`web/`) calls relative `/api/*` endpoints, which are served by the Python functions in `api/`. Two ways to run it:

### Option A — Deployed (zero setup)

The live demo is already up: **https://vigil-jet-three.vercel.app**

### Option B — Local via Vercel dev

```bash
npm i -g vercel
vercel dev
```

This serves `web/index.html` at `/` and routes `/api/analyze`, `/api/check-action`, `/api/guard`, `/api/model`, and `/api/analysis/<id>` to the serverless functions in `api/`, which import the same `app.py` engine. `/api/guard` and `/api/model` return synchronously with a rules-only verdict (no local-model polling on Vercel), and background analysis jobs live only in the running analyzer's memory — `/api/analysis/<id>` polling works against `python3 app.py`, not a fresh serverless instance.

> Security note: the local server binds to `127.0.0.1` by default. Setting `VIGIL_HOST=0.0.0.0` exposes the unauthenticated analyze/guard APIs to your network — do this only inside an isolated environment (the managed preview does exactly this).

---

## 4. Verify the Build (Offline Fixtures)

One command, no Ollama, no network:

```bash
python3 scripts/run_offline_fixtures.py
```

This exercises the deterministic path end-to-end:

- Message/action fixtures through `analyze_content()` and `check_action()`
- Hidden-instruction variants (suppressed / invisible HTML text)
- Model-explanation citation validation (`validate_model_explanation()`)
- Async verdict behavior (`check_api_verdict_is_async()`)

All checks passing = the rules engine is healthy.

---

## 5. Optional — Connect Your Own Local LLM

The rules verdict is deterministic and always available. A local LLM adds an optional plain-language review layer. **The decision is never made by the model** — it may only add evidence-backed warnings, and its output is verified against the source content before it is shown.

Two ways to connect a model:

### Option A — Any OpenAI-compatible local server (recommended)

Works with **LM Studio, llama.cpp server (`llama-server`), vLLM, Jan, LocalAI, Ollama's OpenAI endpoint**, and anything else speaking the OpenAI chat-completions protocol.

First, start one of these servers so it serves a model:

```bash
# LM Studio: install from https://lmstudio.ai, download a model in the app,
# then start "Local Server" (Developer tab). Default: http://127.0.0.1:1234/v1

# llama.cpp server (serves a GGUF model you downloaded):
llama-server -m models/qwen2.5-7b-instruct-q4_k_m.gguf --port 8080
# -> http://127.0.0.1:8080/v1

# vLLM (GPU, serves any Hugging Face model):
vllm serve Qwen/Qwen2.5-7B-Instruct --port 8001
# -> http://127.0.0.1:8001/v1

# Ollama's OpenAI endpoint (already running Ollama? you already have it):
# -> http://127.0.0.1:11434/v1
```

Then point VIGIL at it:

```bash
# Example: LM Studio's local server
VIGIL_LLM_BASE_URL=http://127.0.0.1:1234/v1 \
VIGIL_LLM_MODEL=qwen2.5-7b-instruct \
python3 app.py

# Example: llama.cpp server
VIGIL_LLM_BASE_URL=http://127.0.0.1:8080/v1 \
VIGIL_LLM_MODEL=qwen2.5-7b-instruct-q4_k_m.gguf \
python3 app.py

# If your server needs a key (rare for local use):
VIGIL_LLM_API_KEY=sk-local-... python3 app.py
```

> Tip: `VIGIL_LLM_MODEL` must match the model id your server exposes — LM Studio shows it in the server tab, llama.cpp uses the file name you passed, vLLM uses the repo id. `GET {BASE_URL}/models` lists them.

### Option B — Native Ollama (default, zero config)

```bash
# Install Ollama (https://ollama.com), then serve a model:
ollama pull qwen3.5:2b          # downloads the model
ollama serve                    # serves it at http://127.0.0.1:11434
python3 app.py                  # VIGIL auto-detects it
```

Use a different model:

```bash
VIGIL_OLLAMA_MODEL=llama3.2:3b python3 app.py
```

Point the Ollama variables at any host running Ollama (e.g. `VIGIL_OLLAMA_URL=http://192.168.1.20:11434`).

### Behavior and safety

- The topbar status shows what is connected, e.g. `LOCAL MODEL READY · qwen2.5-7b-instruct · OPENAI-COMPATIBLE`.
- If the model is slow, unavailable, or its explanation fails citation validation, VIGIL **falls back to the deterministic explanation** — the demo never breaks.
- Verify your wiring without a model: `npm run test:llm` (19 protocol/config checks, no network).
- See the whole journey live: `npm run demo:llm` (mock local servers + real VIGIL instances; no install).

> Privacy note: content is sent only to the endpoint **you** configured, on your machine or network. Nothing is sent to any cloud service.

---

## 6. Optional — Regenerate UI Design (Stitch)

Only needed when iterating on visual design:

```bash
npm install
npm run design:stitch
```

---

## 7. Deploy to Vercel

The repo ships with `vercel.json` (rewrites `/` → `web/` and `/api/*` → the Python functions):

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard — no build settings required.

---

## Quick Reference

```bash
# Full local stack in 3 commands
python3 app.py                              # 1. analyzer server (terminal 1)
python3 scripts/run_offline_fixtures.py     # 2. verify (terminal 2)
# 3. load extension/ via chrome://extensions
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Extension says it can't reach VIGIL | Is `python3 app.py` running? Check the server address under ⚙ Settings in the side panel; if you changed the port, update `host_permissions` in `extension/manifest.json`. |
| Extension OCR fails to start | Reload the extension on `chrome://extensions`. The WASM OCR engine is bundled in `extension/vendor/`; no network or system packages are needed. |
| `Address already in use` | Another process holds the port — use `VIGIL_PORT=<other> python3 app.py`. |
| Model review shows `offline` | Expected without a local LLM — rules-only fallback is automatic. Connect one via `VIGIL_LLM_BASE_URL`/`VIGIL_LLM_MODEL` (OpenAI-compatible) or `VIGIL_OLLAMA_URL`/`VIGIL_OLLAMA_MODEL` (Ollama) — see § 5. |
| Web UI 404s on `/api/*` locally | Serve via `vercel dev`, not a static file server — the functions live in `api/`. |
