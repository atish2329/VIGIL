/**
 * VIGIL API layer — the ONLY place the extension talks to the network.
 *
 * All endpoints, payloads, and response shapes come from the existing VIGIL
 * backend (app.py). The backend is the single source of truth: no detection
 * logic is duplicated or re-implemented here.
 *
 * Endpoints used (verified against app.py / vision_engine.py):
 *   GET  /api/health          → {ok, app}
 *   GET  /api/model           → local model status
 *   POST /api/analyze         {content} → full analysis result (rules + optional local model)
 *   GET  /api/analysis/<id>   → {status: "pending"} | {status: "complete", result}
 *   POST /api/vision/analyze  → Vision JSON envelope (see analyzeVision)
 *
 * The backend sends `Access-Control-Allow-Origin: *` and answers OPTIONS
 * preflights (Handler._json / do_OPTIONS in app.py), so extension pages can
 * call it directly. CORS credentials are never needed: the backend has no auth
 * by design (it is a local analyzer), so no cookies or tokens are sent.
 */

(() => {
  const BASE = self.VIGIL_DEFAULTS;

  /** Error classes map 1:1 to the user-facing error states. */
  class VigilApiError extends Error {
    constructor(kind, message) {
      super(message);
      this.name = "VigilApiError";
      this.kind = kind; // "backend_offline" | "timeout" | "auth" | "invalid" | "server" | "network"
    }
  }

  function settings() {
    return self.VigilSettings ? self.VigilSettings.get() : Promise.resolve({});
  }

  async function baseUrl() {
    const config = await settings();
    let url = (config && config.apiBaseUrl) || BASE.API_BASE_URL;
    url = String(url).trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(url)) {
      throw new VigilApiError("invalid", "The VIGIL server address must start with http:// or https://.");
    }
    return url;
  }

  /** fetch with timeout + normalized errors. */
  async function request(path, options, timeoutMs) {
    const root = await baseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(root + path, { ...options, signal: controller.signal });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new VigilApiError("timeout", "Analysis timed out. Try again.");
      }
      throw new VigilApiError("backend_offline", "Unable to connect to VIGIL. Make sure the analyzer is running.");
    } finally {
      clearTimeout(timer);
    }
    if (response.status === 401 || response.status === 403) {
      throw new VigilApiError("auth", "VIGIL authentication is required.");
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) throw new VigilApiError("server", "VIGIL returned an invalid response.");
      data = {};
    }
    if (!response.ok) {
      const detail = data && typeof data.error === "string" ? data.error : "";
      throw new VigilApiError(response.status >= 500 ? "server" : "invalid", detail || "VIGIL could not complete this analysis.");
    }
    return data;
  }

  // ------------------------------------------------------------------
  // Settings storage (chrome.storage.sync, no secrets).
  // ------------------------------------------------------------------
  const settingsApi = {
    get() {
      return chrome.storage.sync.get({ apiBaseUrl: BASE.API_BASE_URL, pageScanEnabled: true, keepHistory: true });
    },
    async set(patch) {
      await chrome.storage.sync.set(patch);
      return this.get();
    },
  };
  self.VigilSettings = settingsApi;

  // ------------------------------------------------------------------
  // Health / status
  // ------------------------------------------------------------------
  async function health() {
    return request("/api/health", { method: "GET", cache: "no-store" }, BASE.STATUS_TIMEOUT_MS);
  }

  async function modelStatus() {
    return request("/api/model", { method: "GET", cache: "no-store" }, BASE.STATUS_TIMEOUT_MS);
  }

  // ------------------------------------------------------------------
  // Content / message / URL analysis — POST /api/analyze
  // The backend extracts URLs and hidden-instruction markers itself from the
  // content text; URL analysis is the same endpoint, not a separate one.
  // ------------------------------------------------------------------
  async function analyzeContent(content) {
    if (typeof content !== "string" || !content.trim()) {
      throw new VigilApiError("invalid", "There is no content to analyze.");
    }
    return request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, BASE.MAX_SELECTION_CHARS) }),
    }, BASE.REQUEST_TIMEOUT_MS);
  }

  // ------------------------------------------------------------------
  // Page analysis — POST /analyze (page envelope: content + url + html).
  // Reuses the existing page-review endpoint that ships with the backend.
  // ------------------------------------------------------------------
  async function analyzePage(pageData) {
    const body = {
      content: String(pageData.content || ""),
      url: String(pageData.url || ""),
      html: String(pageData.html || ""),
    };
    if (!body.content.trim() && !body.url.trim() && !body.html.trim()) {
      throw new VigilApiError("invalid", "VIGIL couldn't analyze this page. No readable content was found.");
    }
    return request("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, BASE.REQUEST_TIMEOUT_MS);
  }

  // ------------------------------------------------------------------
  // Local-model review polling — GET /api/analysis/<id>
  // The rules verdict arrives with the first response; the optional local
  // model review lands asynchronously and never changes the decision.
  // ------------------------------------------------------------------
  async function pollModelReview(analysisId, onProgress) {
    const deadline = Date.now() + BASE.MODEL_POLL_MAX_MS;
    while (Date.now() < deadline) {
      if (onProgress) onProgress();
      await new Promise((resolve) => setTimeout(resolve, BASE.MODEL_POLL_INTERVAL_MS));
      let job;
      try {
        job = await request(`/api/analysis/${encodeURIComponent(analysisId)}`, { method: "GET", cache: "no-store" }, BASE.REQUEST_TIMEOUT_MS);
      } catch {
        return null; // polling is best-effort; the rules verdict is already shown
      }
      if (job.status === "complete") return job.result;
    }
    return null;
  }

  // ------------------------------------------------------------------
  // VIGIL Vision — POST /api/vision/analyze
  // Mirrors web/vision.js: the image itself never leaves the device. OCR runs
  // locally (WASM); only extracted text + region coordinates are sent:
  //   {
  //     image:  {width, height},
  //     ocr:    {regions: [{text, confidence, bbox:{x,y,width,height}}],
  //              meanConfidence, lowConfidence, degraded},
  //     qr:     [{data, bbox}]                (optional, decoded locally),
  //     visual: {rectangles: [{x,y,width,height,label}],
  //              fields: {passwordFields, otpLikeFields}}   (optional)
  //   }
  // ------------------------------------------------------------------
  async function analyzeVision(payload) {
    return request("/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, BASE.VISION_TIMEOUT_MS);
  }

  self.VigilApi = {
    VigilApiError,
    health,
    modelStatus,
    settings: settingsApi,
    analyzeContent,
    analyzePage,
    analyzeVision,
    pollModelReview,
    baseUrl,
  };
})();
