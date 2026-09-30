# VIGIL Security — Browser Extension

Manifest V3 side-panel companion for the VIGIL analyzer: current-page scanning,
selected-text scanning (right-click → "Scan with VIGIL"), and screenshot
analysis via VIGIL Vision (OCR runs locally in the browser — the image never
leaves your device). All verdicts come from the VIGIL backend; the extension
stores no secrets and never reads form values.

## Load into Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select this folder — the one containing `manifest.json`
5. Pin **VIGIL Security** to the toolbar and click it to open the side panel

## Connect to the VIGIL backend

The analyzer must be running somewhere reachable:

```bash
# Local (default): the extension expects http://127.0.0.1:8000
python3 app.py     # from the VIGIL repo root
```

To use a different backend, open the side panel → **⚙ Settings** →
**VIGIL server address**, enter the URL, **Save**, then **Test Connection**.

If the backend is not `http://127.0.0.1:8000`, also add its URL to
`host_permissions` in `manifest.json` and reload the extension
(`chrome://extensions` → ↻ on the VIGIL card).

## Features

- **Scan This Page** — extracts page structure (text, visible links, form
  shapes; never values) and returns an evidence-backed verdict
- **Right-click selection → "Scan with VIGIL"** — analyze any highlighted text
- **Capture & Scan** — screenshot the visible tab; OCR (Tesseract.js WASM) and
  QR decoding (jsQR) run locally; only extracted text/coordinates are sent
- **Scan history** — metadata only (time, label, verdict, score)
- **Settings** — page-scan toggle, history toggle/clear, backend + model status

## Verify the build

From the VIGIL repo root:

```bash
npm run test:extension
```

## Privacy

- Nothing is sent to the backend until you trigger a scan
- Form values, passwords, and card numbers are never read
- Screenshots are processed locally; the image itself is never uploaded
- History stores scan metadata only, on your device
- No API keys or secrets exist in this extension

Requirements: Chrome 116+ / any Chromium browser with side panel support.
