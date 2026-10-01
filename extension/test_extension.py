#!/usr/bin/env python3
"""VIGIL extension verification suite.

Verifies, in order:

1.  Structure & manifest — MV3 keys, referenced files exist, minimal
    permissions, CSP, icons.
2.  Static privacy checks — the extension never reads input values, never
    monitors keystrokes, never uses dynamic HTML injection for backend data,
    and contains no secrets.
3.  Live API contract — starts the real analyzer (app.py) and exercises every
    endpoint the extension calls, asserting the exact response fields the
    extension consumes.
4.  End-to-end Vision — renders the same fixture texts as the web app's Vision
    QA suite into PNGs, runs REAL Tesseract OCR on them (the same engine the
    browser uses), builds the extension's vision payload, and sends it to
    /api/vision/analyze. No fabricated results anywhere.

Usage: python3 extension/test_extension.py [--port 8123]
Requires: Pillow (fixtures). System `tesseract` binary if available
(apt-get install tesseract-ocr) — without it, tests 1–3 still run.
"""

import argparse
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

PASS, FAIL = "PASS", "FAIL"
results = []


def check(name, ok, note=""):
    results.append((name, bool(ok)))
    print(f"  [{PASS if ok else FAIL}] {name}" + (f" — {note}" if note else ""))
    return ok


def walk_extension_js():
    """Yield (path, source) for every first-party extension JS file."""
    for dirpath, dirnames, filenames in os.walk(HERE):
        dirnames[:] = [d for d in dirnames if d not in ("vendor", "__pycache__")]
        for name in sorted(filenames):
            if name.endswith(".js"):
                path = os.path.join(dirpath, name)
                yield path, open(path, errors="replace").read()


# ---------------------------------------------------------------------------
# 1. Structure & manifest
# ---------------------------------------------------------------------------
def static_checks():
    print("\n== 1. Structure & manifest ==")
    with open(os.path.join(HERE, "manifest.json")) as fh:
        manifest = json.load(fh)

    check("manifest is valid JSON", True)
    check("manifest_version is 3", manifest.get("manifest_version") == 3)
    check("name is VIGIL Security", manifest.get("name") == "VIGIL Security")
    check(
        "description matches spec",
        manifest.get("description") == "AI-powered protection against phishing, scams and suspicious websites.",
    )
    check("side_panel.default_path set", manifest.get("side_panel", {}).get("default_path") == "sidepanel/sidepanel.html")
    check(
        "service worker registered",
        manifest.get("background", {}).get("service_worker") == "background/service-worker.js",
    )
    perms = set(manifest.get("permissions", []))
    check(
        "permissions minimal",
        perms == {"storage", "tabs", "activeTab", "scripting", "contextMenus", "sidePanel"},
        str(sorted(perms)),
    )
    # Regression: without the "tabs" permission Chrome strips url/title from
    # chrome.tabs.query() results on regular websites, so the side panel sees
    # "No active page" and Scan This Page stays disabled.
    check(
        "tabs permission present (url/title visibility for getActiveTab)",
        "tabs" in perms,
    )
    check(
        "no broad host permissions",
        set(manifest.get("host_permissions", [])) <= {"http://127.0.0.1:8000/*", "http://localhost:8000/*"},
        str(manifest.get("host_permissions")),
    )
    csp = manifest.get("content_security_policy", {}).get("extension_pages", "")
    check("CSP allows WASM for local OCR", "wasm-unsafe-eval" in csp and "'self'" in csp, csp)
    check("CSP does not allow remote scripts", "http://" not in csp and "unsafe-eval' alone" not in csp)

    def ref_ok(ref):
        return ref.startswith("assets/icons/icon") and os.path.isfile(os.path.join(HERE, ref))

    icon_refs = list(manifest.get("icons", {}).values()) + list(
        manifest.get("action", {}).get("default_icon", {}).values()
    )
    check("all icon files exist", all(ref_ok(ref) for ref in icon_refs), str(sorted(set(icon_refs))))

    referenced = [
        manifest["side_panel"]["default_path"],
        manifest["background"]["service_worker"],
    ]
    panel_html = open(os.path.join(HERE, referenced[0])).read()
    for src in re.findall(r'<script src="([^"]+)"', panel_html):
        referenced.append(os.path.normpath(os.path.join("sidepanel", src)))
    for css in re.findall(r'<link rel="stylesheet" href="([^"]+)"', panel_html):
        referenced.append(os.path.normpath(os.path.join("sidepanel", css)))
    missing = [ref for ref in referenced if not os.path.isfile(os.path.join(HERE, ref))]
    check("every referenced file exists", not missing, f"missing: {missing}" if missing else f"{len(referenced)} refs")

    # Load order matters: services/api.js reads self.VIGIL_DEFAULTS at eval
    # time, so config.js must come first; sidepanel.js (which consumes the
    # other globals) must come last.
    script_order = [os.path.normpath(os.path.join("sidepanel", src)).replace(os.sep, "/") for src in re.findall(r'<script src="([^"]+)"', panel_html)]
    order_ok = (
        bool(script_order)
        and script_order[0].endswith("config/config.js")
        and any(p.endswith("services/api.js") for p in script_order[1:])
        and script_order[-1].endswith("sidepanel/sidepanel.js")
    )
    check("panel script load order (config → api → … → sidepanel)", order_ok, " → ".join(script_order))

    panel_js = open(os.path.join(HERE, "sidepanel/sidepanel.js")).read()
    if re.search(r"\bconst API\s*=\s*self\.VigilApi\b", panel_js):
        check(
            "panel captures VigilApi after api.js is loaded",
            script_order.index(next(p for p in script_order if p.endswith("services/api.js")))
            < script_order.index(next(p for p in script_order if p.endswith("sidepanel/sidepanel.js"))),
            "api.js precedes sidepanel.js",
        )

    worker = open(os.path.join(HERE, "background/service-worker.js")).read()
    check("context menu 'Scan with VIGIL' registered", '"Scan with VIGIL"' in worker and "vigil-scan-selection" in worker)
    panel_js_src = open(os.path.join(HERE, "sidepanel/sidepanel.js")).read()
    check(
        "panel distinguishes bridge-down from no active tab",
        "workerReachable" in panel_js_src and "background worker" in panel_js_src,
    )
    check(
        "panel live-follows tab switches (onActivated/onUpdated)",
        "chrome.tabs.onActivated" in panel_js_src and "chrome.tabs.onUpdated" in panel_js_src,
    )
    check(
        "panel scopes tab query to its own window",
        "currentWindow: true" in panel_js_src or "currentWindow:true" in panel_js_src,
    )
    check(
        "restricted pages explain why scanning is blocked",
        "cannot scan this Chrome page" in panel_js_src,
    )
    check(
        "empty selection shows actionable message",
        "No text selected. Select suspicious text on the page and try again." in panel_js_src,
    )
    check(
        "history clear confirms before wiping",
        "Sure?" in panel_js_src,
    )
    check("side panel opens on action click", "openPanelOnActionClick: true" in worker)
    check("capture uses captureVisibleTab (activeTab)", "captureVisibleTab" in worker)

    # Regression: every API.<member> used in extension JS must be exported by
    # self.VigilApi in services/api.js (guards against undefined-member crashes
    # like the missing `settings` export).
    api_source = open(os.path.join(HERE, "services/api.js")).read()
    export_match = re.search(r"self\.VigilApi\s*=\s*\{(.*?)\};", api_source, re.S)
    check("VigilApi export object found in services/api.js", export_match is not None)
    exported = set(re.findall(r"([A-Za-z_$][\w$]*)\s*[:,]", export_match.group(1))) if export_match else set()
    for relpath, content in walk_extension_js():
        rel = os.path.relpath(relpath, HERE)
        for used in sorted(set(re.findall(r"\bAPI\.([A-Za-z_$][\w$]*)\b", content))):
            check(
                f"API.{used} exported by VigilApi ({rel})",
                used in exported,
                "exported" if used in exported else "MISSING from self.VigilApi",
            )

    # Vendor assets present for local OCR
    for vendor_file in (
        "vendor/tesseract/tesseract.min.js",
        "vendor/tesseract/worker.min.js",
        "vendor/tesseract-core/tesseract-core-simd-lstm.wasm.js",
        "vendor/tesseract-core/tesseract-core-lstm.wasm.js",
        "vendor/langdata/eng.traineddata.gz",
        "vendor/jsQR.js",
    ):
        check(f"vendored: {vendor_file}", os.path.isfile(os.path.join(HERE, vendor_file)))


# ---------------------------------------------------------------------------
# 2. Static privacy checks
# ---------------------------------------------------------------------------
def privacy_checks():
    print("\n== 2. Static privacy checks ==")
    first_party = []
    for dirpath, _dirnames, filenames in os.walk(HERE):
        # Vendored OCR engine (tesseract.js, jsQR) is pinned third-party code;
        # privacy claims apply to the extension's own code.
        if "vendor" in os.path.normpath(dirpath).split(os.sep):
            continue
        for name in filenames:
            if name.endswith((".js", ".html", ".css", ".json")) and name != "test_extension.py":
                first_party.append(os.path.join(dirpath, name))
    blob = "\n".join(open(path, errors="replace").read() for path in first_party)

    extraction = open(os.path.join(HERE, "content/extraction.js")).read()
    value_reads = re.findall(r"(?:input|textarea|select|field|\bi|\bel|\belement)\w*\.value\b", extraction)
    check("no form-field value reads in content script", not value_reads, str(value_reads[:4]))
    check("no keystroke listeners anywhere", "keydown" not in blob and "keyup" not in blob and "keypress" not in blob and "oninput" not in blob)
    check("no innerHTML with backend data", "innerHTML" not in blob)
    check("no eval / Function constructor in first-party code", "eval(" not in blob and "new Function" not in blob)
    check("no document.write", "document.write" not in blob)

    secrets = re.findall(r"(?:sk-[A-Za-z0-9]{16,}|AIza[A-Za-z0-9_\-]{20,}|Bearer\s+[A-Za-z0-9_\-]{20,})", blob)
    check("no API keys / tokens in code", not secrets, str(secrets[:3]))
    check("no hardcoded API key config fields", "API_KEY" not in blob and "apiKey" not in blob)

    worker = open(os.path.join(HERE, "background/service-worker.js")).read()
    check("history stores metadata only", "headline" in worker and "label" in worker and "content" not in json.dumps("x") and "page.content" not in worker)


# ---------------------------------------------------------------------------
# 3. Live API contract (real analyzer)
# ---------------------------------------------------------------------------
class QuietHandler(ThreadingHTTPServer):
    allow_reuse_address = True


def start_analyzer(port):
    import importlib.util

    # app.py lazily does `from vision_engine import analyze_vision` inside its
    # request handler; make the project root importable so that works when this
    # test lives in extension/.
    if ROOT not in sys.path:
        sys.path.insert(0, ROOT)
    spec = importlib.util.spec_from_file_location("vigil_app", os.path.join(ROOT, "app.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.SERVER_HOST = "127.0.0.1"
    module.SERVER_PORT = port
    server = ThreadingHTTPServer(("127.0.0.1", port), module.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.3)
    return server, module


def post(port, path, payload, timeout=30):
    request = urllib.request.Request(
        f"http://127.0.0.1:{port}{path}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode())


def get(port, path, timeout=10):
    with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=timeout) as response:
        return json.loads(response.read().decode())


def api_checks(port):
    print("\n== 3. Live API contract (real analyzer) ==")

    health = get(port, "/api/health")
    check("GET /api/health", health.get("ok") is True and health.get("app") == "VIGIL")

    model = get(port, "/api/model")
    check(
        "GET /api/model shape",
        isinstance(model, dict) and "status" in model and "model" in model and "provider" in model,
        str({k: model.get(k) for k in ("status", "provider")}),
    )

    phishing = "URGENT: Your account will be suspended. Verify your password now at https://secure-sbi-login.example/verify"
    result = post(port, "/api/analyze", {"content": phishing})
    check(
        "POST /api/analyze phishing → DENY + evidence[]",
        result.get("decision") == "DENY" and isinstance(result.get("evidence"), list),
        f"decision={result.get('decision')}, evidence={len(result.get('evidence', []))}",
    )
    ids = {item.get("id") for item in result.get("evidence", [])}
    # Text-mode evidence id for credential/OTP/ password requests is
    # `sensitive_request`; vision mode reports `credential_request`. Both map
    # to the same panel indicator.
    check(
        "evidence includes a credential/sensitive request signal",
        bool({"sensitive_request", "credential_request"} & ids),
        str(sorted(ids)),
    )
    check(
        "analysis has explanation + local_model + analysis_id (panel fields)",
        result.get("explanation") is not None and "local_model" in result and "analysis_id" in result,
    )
    if result.get("analysis_id"):
        job = get(port, f"/api/analysis/{result['analysis_id']}")
        check("GET /api/analysis/<id> polls", job.get("status") in {"pending", "complete"}, job.get("status"))

    safe = "Hi Mira, the project review is at 3 PM in Room 204. Please bring the latest slides."
    safe_result = post(port, "/api/analyze", {"content": safe})
    check("POST /api/analyze benign → ALLOW", safe_result.get("decision") == "ALLOW", safe_result.get("decision"))

    page = post(
        port,
        "/analyze",
        {
            "url": "https://example-secure-login.example/verify",
            "content": "Page URL: https://example-secure-login.example/verify\nSign in to your account. Password: ••••••••\nAct immediately or your account will be suspended.",
            "html": "<html><body><form><input type='text' name='user'><input type='password' name='pw'></form><p>Your account will be suspended. Act immediately.</p></body></html>",
        },
    )
    check(
        "POST /analyze page envelope (url+content+html) works",
        page.get("decision") in {"DENY", "WARN"},
        f"decision={page.get('decision')}",
    )

    vision = post(
        port,
        "/api/vision/analyze",
        {
            "image": {"width": 500, "height": 300},
            "ocr": {
                "regions": [
                    {"text": "URGENT", "confidence": 96, "bbox": {"x": 20, "y": 30, "width": 90, "height": 30}},
                    {"text": "Your account will be blocked today. Verify your password", "confidence": 93, "bbox": {"x": 20, "y": 80, "width": 430, "height": 26}},
                    {"text": "https://sbi-kyc-alert.example/verify", "confidence": 95, "bbox": {"x": 20, "y": 130, "width": 330, "height": 24}},
                ],
                "meanConfidence": 94.6,
                "lowConfidence": False,
                "degraded": False,
            },
            "qr": [],
            "visual": {"rectangles": [], "fields": {"passwordFields": 0, "otpLikeFields": 0}},
        },
    )
    check(
        "POST /api/vision/analyze JSON envelope (extension format) works",
        vision.get("decision") in {"DENY", "WARN"} and isinstance(vision.get("risk"), dict),
        f"decision={vision.get('decision')}, score={vision.get('risk', {}).get('score')}",
    )
    check(
        "vision response has indicators + explanation + recommendedActions (panel fields)",
        all(field in vision for field in ("indicators", "explanation", "recommendedActions", "ocr")),
    )


# ---------------------------------------------------------------------------
# 4. End-to-end Vision with REAL OCR (system tesseract binary)
# ---------------------------------------------------------------------------
def png_size(path):
    with open(path, "rb") as fh:
        fh.read(16)
        width, height = struct.unpack(">II", fh.read(8))
    return width, height


def render_fixture(text, path, width=900, height=360, dark_on_light=True, font_size=30):
    from PIL import Image, ImageDraw, ImageFont

    bg = (245, 247, 250) if dark_on_light else (17, 20, 28)
    fg = (15, 23, 42) if dark_on_light else (240, 243, 248)
    image = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(image)
    font = None
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        if os.path.isfile(candidate):
            font = ImageFont.truetype(candidate, font_size)
            break
    if font is None:
        font = ImageFont.load_default()

    # Word-wrap like a real message screenshot so nothing is drawn off-canvas.
    words = text.split(" ")
    rows = []
    current = ""
    for word in words:
        candidate_text = (current + " " + word).strip()
        if draw.textlength(candidate_text, font=font) > width * 0.82 and current:
            rows.append(current)
            current = word
        else:
            current = candidate_text
    if current:
        rows.append(current)

    y = 56
    for row in rows[:6]:
        draw.text((36, y), row, fill=fg, font=font)
        y += int(font_size * 1.55)
    image.save(path, "PNG")


def system_tesseract_regions(png_path):
    """Run the real Tesseract binary → word boxes in TSV form, grouped to lines."""
    tsv = subprocess.run(
        ["tesseract", png_path, "stdout", "-l", "eng", "--psm", "3", "tsv"],
        capture_output=True, text=True, timeout=120,
    ).stdout
    words = []
    for line in tsv.splitlines()[1:]:
        parts = line.split("\t")
        if len(parts) < 12 or parts[11].strip() == "-1":
            continue
        try:
            left, top, width, height, conf = (int(parts[6]), int(parts[7]), int(parts[8]), int(parts[9]), float(parts[10]))
        except ValueError:
            continue
        text = parts[11].strip()
        if not text:
            continue
        words.append({"text": text, "confidence": conf, "bbox": {"x": left, "y": top, "width": width, "height": height}})
    # Group words into lines by vertical-center proximity with a gap check
    # (single text row renders ~2-4 OCR lines; centers within 0.6×height and
    # a horizontal gap under 3×height belong together).
    ordered = sorted(words, key=lambda w: (w["bbox"]["y"], w["bbox"]["x"]))
    lines = []
    for word in ordered:
        center = word["bbox"]["y"] + word["bbox"]["height"] / 2
        placed = False
        for line in reversed(lines[-6:]):
            right_edge = max(m["bbox"]["x"] + m["bbox"]["width"] for m in line)
            gap = word["bbox"]["x"] - right_edge
            vertical_ok = any(
                abs((m["bbox"]["y"] + m["bbox"]["height"] / 2) - center)
                <= max(m["bbox"]["height"], word["bbox"]["height"]) * 0.6
                for m in line
            )
            if vertical_ok and gap <= max(60, word["bbox"]["height"] * 3):
                line.append(word)
                placed = True
                break
        if not placed:
            lines.append([word])
    regions = []
    for line in lines:
        line.sort(key=lambda w: w["bbox"]["x"])
        text = " ".join(w["text"] for w in line).strip()
        if not text:
            continue
        confs = [w["confidence"] for w in line if w["confidence"] > 0]
        x1 = min(w["bbox"]["x"] for w in line)
        y1 = min(w["bbox"]["y"] for w in line)
        x2 = max(w["bbox"]["x"] + w["bbox"]["width"] for w in line)
        y2 = max(w["bbox"]["y"] + w["bbox"]["height"] for w in line)
        regions.append({
            "text": text,
            "confidence": round(sum(confs) / len(confs), 1) if confs else 0,
            "bbox": {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1},
        })
    return regions


def ocr_agreement_checks(port):
    print("\n== 4. End-to-end Vision (rendered fixtures + REAL OCR) ==")
    tesseract = shutil.which("tesseract")
    if not tesseract:
        print("  [SKIP] system tesseract not available — install tesseract-ocr for full OCR E2E")
        return

    try:
        import PIL  # noqa: F401
    except ImportError:
        print("  [SKIP] Pillow not available for fixture rendering")
        return

    fixtures = [
        # (name, file stem, text, expect_suspicious)
        ("phishing bank SMS", "phishing-bank", "URGENT Your SBI account will be blocked today. Complete KYC immediately with your password at https://sbi-kyc-alert.example/verify", True),
        ("legit bank SMS", "legit-bank", "SBI: Your account XX4412 was credited with Rs 5000.00 today. Balance: Rs 24561.00", False),
    ]
    tmp = tempfile.mkdtemp(prefix="vigil-vision-")
    try:
        for name, stem, text, expect_suspicious in fixtures:
            png = os.path.join(tmp, stem + ".png")
            render_fixture(text, png)
            width, height = png_size(png)

            regions = system_tesseract_regions(png)
            ocr_text = " ".join(region["text"] for region in regions)
            check(
                f"OCR recovered fixture text ({name})",
                len(regions) >= 2 and any(token.lower() in ocr_text.lower() for token in text.split()[:4]),
                f"{len(regions)} regions, mean conf "
                f"{round(sum(r['confidence'] for r in regions) / max(1, len(regions)))}%",
            )

            mean_conf = round(sum(r["confidence"] for r in regions) / max(1, len(regions)), 1)
            payload = {
                "image": {"width": width, "height": height},
                "ocr": {"regions": regions, "meanConfidence": mean_conf, "lowConfidence": mean_conf < 60, "degraded": False},
                "qr": [],
                "visual": {"rectangles": [], "fields": {"passwordFields": 0, "otpLikeFields": 0}},
            }
            result = post(port, "/api/vision/analyze", payload)
            decision = result.get("decision")
            ok = (decision in {"DENY", "WARN"}) if expect_suspicious else (decision == "ALLOW")
            check(
                f"vision verdict {'flags' if expect_suspicious else 'clears'} ({name})",
                ok,
                f"decision={decision}, score={result.get('risk', {}).get('score')}, regions={len(regions)}",
            )
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8123)
    args = parser.parse_args()

    static_checks()
    privacy_checks()

    server, _module = start_analyzer(args.port)
    try:
        api_checks(args.port)
        ocr_agreement_checks(args.port)
    finally:
        server.shutdown()

    passed = sum(1 for _name, ok in results if ok)
    failed = len(results) - passed
    print(f"\n{'=' * 60}")
    print(f"Extension suite: {passed}/{len(results)} checks passed" + (f" — {failed} FAILED" if failed else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
