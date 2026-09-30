/**
 * VIGIL extension configuration.
 *
 * No secrets belong in this file or anywhere else in the extension. Any
 * credentials (LLM keys, etc.) live on the VIGIL backend, never in the client.
 *
 * The backend URL can be overridden at runtime in the side panel settings
 * (stored in chrome.storage.sync); this file only supplies defaults.
 */
const VIGIL_DEFAULTS = Object.freeze({
  // Default analyzer location for development (python3 app.py).
  API_BASE_URL: "http://127.0.0.1:8000",

  // Network guards.
  REQUEST_TIMEOUT_MS: 20000,
  VISION_TIMEOUT_MS: 60000,
  STATUS_TIMEOUT_MS: 4000,

  // Page extraction caps (structural scan only — values are never read).
  MAX_PAGE_HTML_CHARS: 120000,
  MAX_PAGE_TEXT_CHARS: 60000,
  MAX_LINKS: 60,
  MAX_FORMS: 15,
  MAX_SELECTION_CHARS: 100000,

  // Scan history (metadata only: time, label, decision, score).
  HISTORY_LIMIT: 25,

  // Background model review polling (server returns rules verdict instantly).
  MODEL_POLL_INTERVAL_MS: 400,
  MODEL_POLL_MAX_MS: 60000,
});

self.VIGIL_DEFAULTS = VIGIL_DEFAULTS;
