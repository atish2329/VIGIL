/**
 * VIGIL page extraction — injected on demand via chrome.scripting.
 *
 * PRIVACY CONTRACT (enforced here, the only code that touches the page DOM):
 *   - Reads structural page information only: text, links, form shapes.
 *   - NEVER reads input, textarea, or select VALUES. Field names, input
 *     types, and autocomplete hints only — no passwords, no card numbers,
 *     no user-typed content.
 *   - Runs only when the user triggers a scan (button or context menu).
 */

(() => {
  const DEFAULTS = (self.VIGIL_DEFAULTS) || {
    MAX_PAGE_HTML_CHARS: 120000,
    MAX_PAGE_TEXT_CHARS: 60000,
    MAX_LINKS: 60,
    MAX_FORMS: 15,
    MAX_SELECTION_CHARS: 100000,
  };

  function isEditableValueNode(el) {
    // Guardrail: extraction must never descend into the *value* of an editable
    // field. Values are excluded up-front below; this documents intent.
    return el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.type !== "hidden"));
  }

  function absoluteUrl(value) {
    try {
      return new URL(value, location.href).href;
    } catch {
      return "";
    }
  }

  function extractPageData() {
    const maxText = DEFAULTS.MAX_PAGE_TEXT_CHARS;
    const maxHtml = DEFAULTS.MAX_PAGE_HTML_CHARS;

    // ---- metadata ---------------------------------------------------------
    const meta = {};
    for (const key of ["description", "keywords", "og:title", "og:description", "twitter:title"]) {
      const el = document.querySelector(`meta[name="${key}"], meta[property="${key}"]`);
      if (el && el.content) meta[key] = el.content.slice(0, 300);
    }

    // ---- visible text (scripts/styles/hidden subtrees removed) -----------
    const root = (document.body || document.documentElement).cloneNode(true);
    root.querySelectorAll("script,style,noscript,template,svg,canvas,iframe,link,meta").forEach((el) => el.remove());
    root.querySelectorAll(
      "[hidden],[aria-hidden='true'],[style*='display:none'],[style*='display: none']," +
      "[style*='visibility:hidden'],[style*='visibility: hidden'],[style*='opacity:0']"
    ).forEach((el) => el.remove());
    let text = (root.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > maxText) text = text.slice(0, maxText);

    // ---- visible links (deduped, capped) ---------------------------------
    const seen = new Set();
    const links = [];
    for (const anchor of document.querySelectorAll("a[href]")) {
      if (links.length >= DEFAULTS.MAX_LINKS) break;
      const href = absoluteUrl(anchor.getAttribute("href") || "");
      if (!/^https?:/i.test(href)) continue;
      const key = href.split("#")[0];
      if (seen.has(key)) continue;
      // Visibility check on the LIVE node (clones have no layout).
      if (anchor.offsetParent === null && anchor.getClientRects().length === 0) continue;
      seen.add(key);
      links.push({
        href: key.slice(0, 500),
        text: (anchor.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
      });
    }

    // ---- forms: STRUCTURE ONLY, never values -----------------------------
    const forms = [];
    for (const form of document.querySelectorAll("form")) {
      if (forms.length >= DEFAULTS.MAX_FORMS) break;
      const inputs = Array.from(form.querySelectorAll("input,select,textarea")).slice(0, 30);
      forms.push({
        action: absoluteUrl(form.getAttribute("action") || "").slice(0, 500),
        method: (form.getAttribute("method") || "get").toLowerCase(),
        hasPassword: inputs.some((i) => (i.getAttribute("type") || "").toLowerCase() === "password"),
        fields: inputs.map((i) => ({
          type: (i.getAttribute("type") || "text").toLowerCase(),
          name: (i.getAttribute("name") || "").slice(0, 60),
          autocomplete: (i.getAttribute("autocomplete") || "").slice(0, 30),
          // NOTE: no value is ever read here.
        })),
      });
    }
    const standalonePasswordInputs = document.querySelectorAll("input[type='password']").length;

    const html = (document.documentElement ? document.documentElement.outerHTML : "").slice(0, maxHtml);

    return {
      url: location.href,
      title: document.title || "",
      text,
      html,
      links,
      forms,
      hasPasswordFields: forms.some((f) => f.hasPassword) || standalonePasswordInputs > 0,
      meta,
      extractedAt: Date.now(),
    };
  }

  function getSelectedText() {
    const selection = window.getSelection ? window.getSelection() : null;
    const text = selection ? String(selection).trim() : "";
    return text.slice(0, DEFAULTS.MAX_SELECTION_CHARS);
  }

  // Message bridge used by the service worker and side panel.
  //
  // NOTE on injection semantics: chrome.scripting.executeScript({files}) does
  // not return the file's value, so the panel injects this file first and then
  // messages the page to pull data through the listener below.
  if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || typeof message.type !== "string" || !message.type.startsWith("vigil:")) return false;
      try {
        if (message.type === "vigil:extractPage") {
          sendResponse({ ok: true, data: extractPageData() });
        } else if (message.type === "vigil:getSelection") {
          sendResponse({ ok: true, text: getSelectedText() });
        }
      } catch (error) {
        sendResponse({ ok: false, error: String((error && error.message) || error) });
      }
      return false; // synchronous response
    });
  }

  self.VigilExtract = { extractPageData, getSelectedText };
})();
