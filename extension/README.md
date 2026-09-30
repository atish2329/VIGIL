# VIGIL Security — Browser Extension

Manifest V3 side-panel companion for the VIGIL analyzer: current-page scanning,
selected-text scanning (right-click → "Scan with VIGIL"), and screenshot
analysis via VIGIL Vision (OCR runs locally in the browser — the image never
leaves your device). All verdicts come from the VIGIL backend; the extension
stores no secrets and never reads form values.

## Load into Chrome

### From a zip download

1. Download and extract `vigil-extension.zip`
2. Open the extracted folder — `manifest.json` sits **at the top level** of the
   archive next to `background/`, `sidepanel/`, `vendor/`, and `assets/` (it is
   not nested under an `extension/` folder). If your extractor wraps everything
   in an extra folder, go one level deeper until you see `manifest.json`
3. Open `chrome://extensions`
4. Enable **Developer mode** (toggle, top-right)
5. Click **Load unpacked** and select that folder — the one directly containing
   `manifest.json`
6. Pin **VIGIL Security** to the toolbar and click it to open the side panel

> The zip is built so the manifest is at the archive root. Selecting a folder
> without `manifest.json` directly inside it makes Chrome fail with
> "Manifest file is missing or unreadable — Could not load manifest."

### From the repository

1. Clone the VIGIL repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (toggle, top-right)
4. Click **Load unpacked**
5. Select the `extension/` folder — the one containing `manifest.json`
6. Pin **VIGIL Security** to the toolbar and click it to open the side panel

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

To rebuild the distributable zip (manifest at the archive root, test files
excluded):

```bash
npm run build:extension
```

## Privacy

- Nothing is sent to the backend until you trigger a scan
- Form values, passwords, and card numbers are never read
- Screenshots are processed locally; the image itself is never uploaded
- History stores scan metadata only, on your device
- No API keys or secrets exist in this extension

Requirements: Chrome 116+ / any Chromium browser with side panel support.
