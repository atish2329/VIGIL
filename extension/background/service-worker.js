/**
 * VIGIL service worker (Manifest V3).
 *
 * Responsibilities: context menus, side panel behavior, screenshot capture
 * coordination, active-tab lookup, scan history, message routing.
 *
 * No analysis logic lives here — all detection runs on the VIGIL backend, and
 * OCR runs in the side panel page. The worker stays lean so it can be killed
 * and restarted by the browser at any time without losing anything: all state
 * is in chrome.storage (session for handoffs, local for history).
 */

// Classic service worker: pull in the shared non-secret defaults first.
importScripts("../config/config.js");

const HISTORY_KEY = "vigilHistory";
const PENDING_SELECTION_KEY = "vigilPendingSelection";
const PENDING_SELECTION_MAX_AGE_MS = 15000;

// ---------------------------------------------------------------------------
// Lifecycle: context menus + side panel behavior (re-asserted on every start)
// ---------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  buildContextMenus();
});

buildSidePanelBehavior();
buildContextMenus();

function buildSidePanelBehavior() {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("VIGIL: side panel behavior failed", error));
  }
}

function buildContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "vigil-scan-selection",
      title: "Scan with VIGIL",
      contexts: ["selection"],
    });
  });
}

// ---------------------------------------------------------------------------
// Context menu → side panel handoff
//
// The selected text is stored in chrome.storage.session (never persisted to
// disk, cleared with the browser session) and the side panel is opened. The
// panel picks the request up when it boots; if the panel is already open, the
// direct message below reaches it immediately.
// ---------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "vigil-scan-selection") return;
  const text = (info.selectionText || "").trim();
  if (!text || !tab) return;

  const request = { text: text.slice(0, self.VIGIL_DEFAULTS.MAX_SELECTION_CHARS), at: Date.now() };
  chrome.storage.session.set({ [PENDING_SELECTION_KEY]: request }).catch(() => {});

  (async () => {
    // If a panel is already open for this window, nudge it directly.
    try {
      if (chrome.runtime.getContexts) {
        const views = await chrome.runtime.getContexts({ contextTypes: ["SIDE_PANEL"] });
        const panel = views.find((view) => view.tab && view.tab.windowId === tab.windowId);
        if (panel) {
          chrome.runtime.sendMessage({ type: "vigil:scanSelection", text: request.text }).catch(() => {});
          return;
        }
      }
    } catch {
      // Fall through to opening the panel.
    }
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      // The panel may already be open (Chrome can refuse to reopen); the
      // session handoff above still covers that case via visibilitychange.
      console.error("VIGIL: could not open side panel", error);
    }
  })();
});

// ---------------------------------------------------------------------------
// Message router (all handlers return true only when responding async)
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string" || !message.type.startsWith("vigil:")) {
    return false;
  }

  switch (message.type) {
    case "vigil:getActiveTab": {
      (async () => {
        try {
          const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
          sendResponse({ ok: true, tab: tab ? { id: tab.id, url: tab.url, title: tab.title } : null });
        } catch (error) {
          sendResponse({ ok: false, error: String((error && error.message) || error) });
        }
      })();
      return true;
    }

    case "vigil:capture": {
      // activeTab covers this: the user opened the panel / clicked the action,
      // which grants capture rights for the active tab. Only the visible tab
      // of the focused window is captured, only on explicit user action.
      (async () => {
        try {
          const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
          if (!tab || !tab.id) {
            sendResponse({ ok: false, error: "VIGIL couldn't find a page to capture." });
            return;
          }
          if (/^(chrome|edge|about|chrome-extension|devtools|view-source):/i.test(tab.url || "")) {
            sendResponse({ ok: false, error: "VIGIL couldn't analyze this page. Browser pages can't be captured." });
            return;
          }
          chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
            const lastError = chrome.runtime.lastError;
            if (lastError || !dataUrl) {
              sendResponse({ ok: false, error: "VIGIL couldn't capture this page. " + (lastError ? lastError.message || "" : "") });
              return;
            }
            sendResponse({ ok: true, dataUrl });
          });
        } catch (error) {
          sendResponse({ ok: false, error: String((error && error.message) || error) });
        }
      })();
      return true;
    }

    case "vigil:history:add": {
      addHistoryEntry(message.entry)
        .then((history) => sendResponse({ ok: true, history }))
        .catch((error) => sendResponse({ ok: false, error: String((error && error.message) || error) }));
      return true;
    }

    case "vigil:history:get": {
      chrome.storage.local.get({ [HISTORY_KEY]: [] }, (data) => {
        sendResponse({ ok: true, history: data[HISTORY_KEY] || [] });
      });
      return true;
    }

    case "vigil:history:clear": {
      chrome.storage.local.set({ [HISTORY_KEY]: [] }, () => sendResponse({ ok: true, history: [] }));
      return true;
    }

    default:
      return false;
  }
});

// ---------------------------------------------------------------------------
// Scan history (metadata only: time, label, decision, score, scan kind).
// Never stores page content, selections, or OCR text.
// ---------------------------------------------------------------------------
async function addHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return [];
  // Respect the user's "Keep scan history" setting.
  try {
    const prefs = await chrome.storage.sync.get({ keepHistory: true });
    if (prefs.keepHistory === false) return [];
  } catch {
    /* storage unavailable — default to recording */
  }
  const trimmed = {
    at: Date.now(),
    label: String(entry.label || "").slice(0, 120),
    kind: String(entry.kind || "text").slice(0, 20),
    headline: String(entry.headline || "").slice(0, 20),
    tone: String(entry.tone || "safe").slice(0, 10),
    score: Number.isFinite(entry.score) ? Math.round(entry.score) : null,
  };
  const data = await chrome.storage.local.get({ [HISTORY_KEY]: [] });
  const history = [trimmed, ...(data[HISTORY_KEY] || [])].slice(0, self.VIGIL_DEFAULTS.HISTORY_LIMIT);
  await chrome.storage.local.set({ [HISTORY_KEY]: history });
  return history;
}
