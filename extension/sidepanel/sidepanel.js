/**
 * VIGIL side panel controller.
 *
 * All results come from the VIGIL backend (via services/api.js); nothing is
 * detected locally. The panel owns the scans: it coordinates the content
 * script, runs local OCR for Vision, calls the backend, renders results,
 * and records history metadata.
 */

(() => {
  "use strict";

  const BASE = self.VIGIL_DEFAULTS;
  const API = self.VigilApi;
  const FORMAT = self.VigilFormat;

  const $ = (id) => document.getElementById(id);

  const views = {
    home: $("view-home"),
    loading: $("view-loading"),
    result: $("view-result"),
    error: $("view-error"),
    settings: $("view-settings"),
  };

  const els = {
    conn: $("conn"),
    connDot: $("conn-dot"),
    connText: $("conn-text"),
    pageTitle: $("page-title"),
    pageUrl: $("page-url"),
    btnScanPage: $("btn-scan-page"),
    btnScanSelection: $("btn-scan-selection"),
    btnCapture: $("btn-capture"),
    steps: Array.from(document.querySelectorAll("#steps li")),
    visionPreview: $("vision-preview"),
    btnCancel: $("btn-cancel"),
    resultCard: $("result-card"),
    resultLabel: $("result-label"),
    verdictBadge: $("verdict-badge"),
    scoreRing: $("score-ring"),
    scoreValue: $("score-value"),
    scoreNum: $("score-num"),
    scoreWord: $("score-word"),
    confidenceLine: $("confidence-line"),
    evidenceList: $("evidence-list"),
    whyText: $("why-text"),
    recommendedActions: $("recommended-actions"),
    modelNote: $("model-note"),
    btnBack: $("btn-back"),
    btnAgain: $("btn-again"),
    errorTitle: $("error-title"),
    errorMessage: $("error-message"),
    btnRetry: $("btn-retry"),
    btnErrorBack: $("btn-error-back"),
    historyList: $("history-list"),
    historyEmpty: $("history-empty"),
    btnHistoryClear: $("btn-history-clear"),
    btnSettings: $("btn-settings"),
    optPageScan: $("opt-page-scan"),
    optKeepHistory: $("opt-keep-history"),
    optApiBase: $("opt-api-base"),
    statusBackend: $("status-backend"),
    statusModel: $("status-model"),
    btnSettingsSave: $("btn-settings-save"),
    btnSettingsTest: $("btn-settings-test"),
    btnSettingsBack: $("btn-settings-back"),
  };

  let activeTab = null;
  let lastRun = null; // for Try Again
  let scanCount = 0;
  let generation = 0; // invalidates stale async completions
  let clearArmTimer = null; // two-step history clear

  // ------------------------------------------------------------------
  // View switching
  // ------------------------------------------------------------------
  function showView(name) {
    for (const [key, el] of Object.entries(views)) {
      el.classList.toggle("hidden", key !== name);
    }
  }

  function setConn(state, text) {
    els.connDot.className = "conn-dot" + (state ? ` ${state}` : "");
    els.connText.textContent = text;
  }

  async function refreshConnection() {
    try {
      await API.health();
      setConn("ok", "Operational");
    } catch {
      setConn("bad", "Offline");
    }
  }

  // ------------------------------------------------------------------
  // Progress steps
  // ------------------------------------------------------------------
  const STEP_ORDER = ["capture", "extract", "urls", "correlate", "score", "report"];

  function resetSteps() {
    for (const li of els.steps) li.className = "";
  }

  function setStep(step, state, note) {
    const li = els.steps.find((item) => item.dataset.step === step);
    if (!li) return;
    li.classList.remove("running", "done");
    if (state) li.classList.add(state);
    if (note !== undefined) {
      const base = li.dataset.label || li.textContent.replace(/\s*·.*$/, "");
      li.dataset.label = base;
      li.textContent = note ? `${base} · ${note}` : base;
    }
  }

  function completeStepsThrough(step) {
    const index = STEP_ORDER.indexOf(step);
    if (index < 0) return;
    for (let i = 0; i < index; i += 1) setStep(STEP_ORDER[i], "done");
  }

  // ------------------------------------------------------------------
  // History
  // ------------------------------------------------------------------
  async function loadHistory() {
    const response = await sendMessage({ type: "vigil:history:get" });
    const history = (response && response.ok) ? response.history : [];
    renderHistory(history);
  }

  function renderHistory(history) {
    els.historyList.replaceChildren();
    els.historyEmpty.classList.toggle("hidden", history.length > 0);
    for (const entry of history.slice(0, 8)) {
      const li = document.createElement("li");
      li.className = "history-item";

      const label = document.createElement("span");
      label.className = "h-label";
      label.textContent = entry.label || "Scan";
      label.title = entry.label || "";

      const meta = document.createElement("span");
      meta.className = "h-meta";
      meta.textContent = formatTime(entry.at);

      const badge = document.createElement("span");
      badge.className = `h-badge ${entry.tone || "safe"}`;
      badge.textContent = entry.score != null ? `${entry.headline || ""} ${entry.score}/100` : (entry.headline || "Scan");
      li.append(label, meta, badge);
      els.historyList.append(li);
    }
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function sendMessage(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          void chrome.runtime.lastError; // observed; avoids unchecked lastError warnings
          resolve(response || null);
        });
        setTimeout(() => resolve(null), 5000);
      } catch {
        resolve(null);
      }
      return undefined;
    });
  }

  // ------------------------------------------------------------------
  // Result rendering (backend data only — nothing fabricated)
  // ------------------------------------------------------------------
  function showResult(model, meta) {
    els.resultLabel.textContent = meta.label || "SECURITY ANALYSIS";
    els.verdictBadge.textContent = model.headline;
    els.verdictBadge.className = `verdict-badge ${model.tone}`;

    const pct = Math.max(0, Math.min(100, model.score));
    els.scoreRing.style.setProperty("--pct", String(pct));
    els.scoreRing.style.setProperty("--tone", toneColor(model.tone));
    els.scoreValue.textContent = String(model.score);
    els.scoreNum.textContent = `${model.score} / 100`;
    els.scoreWord.textContent = model.headlineWord + " risk";

    const showScoreNote = meta.kind !== "text"; // Vision ships a measured score
    els.confidenceLine.textContent = showScoreNote
      ? "Score combines measured visual and text evidence."
      : "";

    els.evidenceList.replaceChildren();
    if (model.evidence.length === 0) {
      const empty = document.createElement("li");
      empty.className = "evidence-item";
      const title = document.createElement("div");
      title.className = "ev-title";
      title.textContent = "✓ No significant threats detected.";
      const detail = document.createElement("p");
      detail.className = "ev-reason";
      detail.textContent = "No major phishing indicators found in the scanned content.";
      empty.append(title, detail);
      els.evidenceList.append(empty);
    } else {
      for (const item of model.evidence) {
        const li = document.createElement("li");
        li.className = "evidence-item";
        const title = document.createElement("div");
        title.className = "ev-title";
        title.textContent = item.title;
        const detail = document.createElement("p");
        detail.className = "ev-detail";
        detail.textContent = item.detail || "";
        const reason = document.createElement("p");
        reason.className = "ev-reason";
        reason.textContent = item.reason && item.reason !== item.detail ? item.reason : "";
        li.append(title, detail, reason);
        els.evidenceList.append(li);
        // Order: title, detail, reason — append in that order.
      }
    }

    els.whyText.textContent = model.explanation || "No significant threats detected.";
    els.recommendedActions.replaceChildren();
    for (const action of model.recommendedActions) {
      const li = document.createElement("li");
      li.textContent = action;
      els.recommendedActions.append(li);
    }

    renderModelNote(model.localModel);
    lastRun = { model, meta };
    showView("result");
  }

  function renderModelNote(model) {
    if (!els.modelNote) return;
    els.modelNote.replaceChildren();
    if (!model || !model.status) {
      els.modelNote.classList.add("hidden");
      return;
    }
    els.modelNote.classList.remove("hidden");
    const provider = model.provider === "openai" ? "OpenAI-compatible" : "Ollama";
    let text;
    if (model.status === "connected") {
      text = `Reviewed with local model ${model.name || ""} (${provider}). Its output was verified against the source content before display.`;
    } else if (model.status === "pending") {
      text = "Optional local-model review in progress — the rules verdict is already shown and will not change.";
    } else {
      text = "Reviewed by VIGIL's deterministic rules. Optional local-model review is offline; the verdict stands on the rules evidence.";
    }
    els.modelNote.textContent = text;
  }

  function toneColor(tone) {
    if (tone === "high") return "var(--high)";
    if (tone === "warn") return "var(--warn)";
    if (tone === "safe") return "var(--safe)";
    return "var(--primary)";
  }

  // ------------------------------------------------------------------
  // Errors
  // ------------------------------------------------------------------
  function showError(message, retryRun) {
    els.errorTitle.textContent = "VIGIL couldn't complete this scan";
    els.errorMessage.textContent = message || "Something went wrong.";
    lastRun = retryRun || lastRun;
    showView("error");
  }

  const FRIENDLY_TIMEOUT = "Analysis timed out. Try again.";

  function friendlyError(error) {
    if (error && error.kind) {
      switch (error.kind) {
        case "backend_offline": return "VIGIL analysis service is currently unavailable. Start the analyzer and try again.";
        case "timeout": return FRIENDLY_TIMEOUT;
        case "auth": return "VIGIL authentication is required.";
        case "invalid": return error.message || "VIGIL couldn't analyze this content.";
        case "server": return error.message || "VIGIL analysis service is currently unavailable.";
        default: return error.message || "Unable to connect to VIGIL.";
      }
    }
    return (error && error.message) || "Unable to connect to VIGIL.";
  }

  // ------------------------------------------------------------------
  // Scans
  // ------------------------------------------------------------------
  async function runScan(run) {
    lastRun = run;
    generation += 1;
    const thisGeneration = generation;
    resetSteps();
    showView("loading");

    try {
      await run(thisGeneration);
    } catch (error) {
      if (thisGeneration === generation) {
        showError(friendlyError(error), run);
      }
    }
  }

  function cancelScan() {
    generation += 1;
    showView("home");
  }

  function isScannableUrl(url) {
    return Boolean(url) && !/^(chrome|edge|about|chrome-extension|devtools|view-source|file):/i.test(url);
  }

  // True when the extension's background worker answered the last
  // vigil:getActiveTab message. A null response means the bridge is down
  // (stale panel outliving an extension reload, worker crash) — distinct
  // from "no active tab".
  let workerLastResponse = false;

  function workerReachable() {
    return Boolean(workerLastResponse);
  }

  async function getActiveTab() {
    // The panel is an extension page and "tabs" is granted, so it can query
    // tabs directly — scoped to THIS window (the one the panel is docked to)
    // rather than the last-focused one. Direct query also re-runs cheaply on
    // every tab switch, so the panel live-follows the user.
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      workerLastResponse = true;
      if (!tab) return null;
      return { id: tab.id, url: tab.url, title: tab.title };
    } catch {
      // Extension context invalidated (the extension was reloaded while this
      // panel stayed open) — fall back to the service-worker bridge.
    }
    const response = await sendMessage({ type: "vigil:getActiveTab" });
    workerLastResponse = Boolean(response);
    if (!response || !response.ok || !response.tab) return null;
    return response.tab;
  }

  async function updateActiveTabDisplay() {
    const tab = await getActiveTab();
    activeTab = tab;
    if (tab && tab.url) {
      const scannable = isScannableUrl(tab.url);
      els.pageTitle.textContent = tab.title || hostLabel(tab.url) || "Current page";
      els.pageUrl.textContent = scannable
        ? tab.url
        : "VIGIL cannot scan this Chrome page. Open a normal webpage and try again.";
      els.btnScanPage.disabled = !scannable;
      els.btnCapture.disabled = !isScannableUrl(tab.url);
      refreshSelectionButton();
      return;
    }
    if (!workerReachable()) {
      // The panel's message bridge to the background worker is dead (typical
      // after the extension was reloaded while this panel stayed open).
      // Reopening the panel re-binds it to the current extension instance.
      els.pageTitle.textContent = "VIGIL can't reach its background worker";
      els.pageUrl.textContent = "Close and reopen this panel; if that doesn't help, reload the extension in chrome://extensions (↻).";
      els.btnScanPage.disabled = true;
      els.btnCapture.disabled = true;
      refreshSelectionButton();
      return;
    }
    els.pageTitle.textContent = "No active page";
    els.pageUrl.textContent = "Open a webpage to scan it with VIGIL.";
    els.btnScanPage.disabled = true;
    els.btnCapture.disabled = true;
    refreshSelectionButton();
  }

  async function extractPageData(tabId) {
    // Inject the extractor, then request data over the message bridge:
    // executeScript({files}) does not return the file's value, so the content
    // script exposes its API and answers "vigil:extractPage" messages.
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content/extraction.js"] });
    const response = await sendMessageToTab(tabId, { type: "vigil:extractPage" });
    if (!response || !response.ok || !response.data) {
      throw new Error("VIGIL couldn't analyze this page. Its content could not be read.");
    }
    return response.data;
  }

  function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
      try {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          void chrome.runtime.lastError; // observed; avoids unchecked warnings
          resolve(response || null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  async function extractSelection(tabId) {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content/extraction.js"] });
      const response = await sendMessageToTab(tabId, { type: "vigil:getSelection" });
      return (response && response.ok) ? response.text || "" : "";
    } catch {
      return "";
    }
  }

  async function addHistory(model, label, kind) {
    const response = await sendMessage({
      type: "vigil:history:add",
      entry: { label, kind, headline: model.headlineWord, tone: model.tone, score: model.score },
    });
    if (response && response.ok) renderHistory(response.history);
  }

  // ------------------------------------------------------------------
  // Scan 1: current page
  // ------------------------------------------------------------------
  async function scanPage(thisGeneration) {
    const tab = await getActiveTab();
    if (!tab || !isScannableUrl(tab.url)) {
      throw new Error("VIGIL couldn't analyze this page. Browser and special pages can't be scanned.");
    }
    const settings = await API.settings.get();
    if (settings.pageScanEnabled === false) {
      throw new Error("Page scanning is disabled in VIGIL settings.");
    }
    activeTab = tab;
    setStep("capture", "running");
    setStep("capture", "done", tab.url.replace(/^https?:\/\//, "").slice(0, 42));
    setStep("extract", "running");

    const page = await extractPageData(tab.id);
    if (thisGeneration !== generation) return;
    setStep("extract", "done", summarizePage(page));
    setStep("urls", "running");

    // Structural page envelope: text + url + html via the existing /analyze
    // endpoint (same one the backend ships for page review).
    const html = page.html || "";
    const contentParts = [
      "Page URL: " + page.url,
      "Page title: " + page.title,
      page.text,
      page.links.length ? "Links: " + page.links.slice(0, 25).map((l) => l.href).join(" ") : "",
    ];
    const truncatedNote = html.length >= BASE.MAX_PAGE_HTML_CHARS
      ? " [VIGIL: page is very large; only the first part was analyzed.]"
      : "";

    const result = await API.analyzePage({
      url: page.url,
      html: html + truncatedNote,
      content: contentParts.join("\n") + truncatedNote,
    });
    if (thisGeneration !== generation) return;
    setStep("urls", "done", `${page.links.length} link${page.links.length === 1 ? "" : "s"}`);
    setStep("correlate", "done");
    setStep("score", "done");
    setStep("report", "done");

    const model = FORMAT.toViewModel(result, { kind: "page", label: "PAGE ANALYSIS" });
    showResult(model, { kind: "page", label: "PAGE ANALYSIS" });
    await addHistory(model, hostLabel(page.url), "page");
  }

  function summarizePage(page) {
    if (!page.text) return "no readable text";
    const words = page.text.split(/\s+/).length;
    return `${words.toLocaleString()} words · ${page.forms.length} form${page.forms.length === 1 ? "" : "s"}`;
  }

  function hostLabel(url) {
    try {
      return new URL(url).hostname || url;
    } catch {
      return url.slice(0, 40) || "Scan";
    }
  }

  // ------------------------------------------------------------------
  // Scan 2: selected text
  // ------------------------------------------------------------------
  async function scanSelection(textOverride) {
    return runScan(async (thisGeneration) => {
      const tab = await getActiveTab();
      let text = textOverride || "";
      if (!text && tab && tab.id) {
        text = await extractSelection(tab.id);
      }
      text = (text || "").trim();
      if (!text) {
        throw new Error("No text selected. Select suspicious text on the page and try again.");
      }
      if (thisGeneration !== generation) return;
      setStep("capture", "done", "selection");
      setStep("extract", "running");
      setStep("extract", "done", `${text.length.toLocaleString()} chars`);
      setStep("urls", "running");

      const result = await API.analyzeContent(text);
      if (thisGeneration !== generation) return;
      setStep("urls", "done");
      setStep("correlate", "done");
      setStep("score", "done");
      setStep("report", "done");

      const model = FORMAT.toViewModel(result, { kind: "text", label: "SELECTED MESSAGE" });
      showResult(model, { kind: "text", label: "SELECTED MESSAGE" });
      await addHistory(model, previewLabel(text), "text");
    });
  }

  function previewLabel(text) {
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > 42 ? clean.slice(0, 42) + "…" : clean;
  }

  // ------------------------------------------------------------------
  // Scan 3: capture & scan (VIGIL Vision)
  // ------------------------------------------------------------------
  async function scanVision() {
    return runScan(async (thisGeneration) => {
      setStep("capture", "running");
      els.visionPreview.classList.add("hidden");

      const capture = await sendMessage({ type: "vigil:capture" });
      if (!capture || !capture.ok) {
        throw new Error((capture && capture.error) || "VIGIL couldn't capture this page.");
      }
      if (thisGeneration !== generation) return;
      setStep("capture", "done", "screenshot");

      // Draw the PNG into a canvas for local OCR (image never leaves device).
      const image = await dataUrlToImage(capture.dataUrl);
      els.visionPreview.width = image.naturalWidth;
      els.visionPreview.height = image.naturalHeight;
      const previewCtx = els.visionPreview.getContext("2d");
      previewCtx.drawImage(image, 0, 0);
      els.visionPreview.classList.remove("hidden");

      setStep("extract", "running", "local OCR");
      const { payload } = await self.VigilOcr.analyzeImageSource(image, image.naturalWidth, image.naturalHeight, {
        onProgress: (stage) => {
          if (stage === "qr") setStep("extract", "running", "QR check");
          if (stage === "visual") setStep("extract", "running", "structure check");
        },
      });
      if (thisGeneration !== generation) return;
      setStep("extract", "done", `${payload.ocr.regions.length} regions · ${Math.round(payload.ocr.meanConfidence)}% conf.`);
      setStep("urls", "running", "local analysis");

      const result = await API.analyzeVision(payload);
      if (thisGeneration !== generation) return;
      setStep("urls", "done");
      setStep("correlate", "done");
      setStep("score", "done");
      setStep("report", "done");

      const model = FORMAT.toViewModel(result, { kind: "vision", label: "SCREENSHOT ANALYSIS" });
      showResult(model, { kind: "vision", label: "SCREENSHOT ANALYSIS" });
      await addHistory(model, "Screenshot scan", "vision");
    });
  }

  function dataUrlToImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("The screenshot could not be processed."));
      image.src = dataUrl;
    });
  }

  // ------------------------------------------------------------------
  // Settings
  // ------------------------------------------------------------------
  async function openSettings() {
    const config = await API.settings.get();
    els.optPageScan.checked = config.pageScanEnabled !== false;
    els.optKeepHistory.checked = config.keepHistory !== false;
    els.optApiBase.value = config.apiBaseUrl || BASE.API_BASE_URL;
    showView("settings");
    refreshBackendStatus();
  }

  async function refreshBackendStatus() {
    els.statusBackend.textContent = "checking…";
    els.statusModel.textContent = "…";
    try {
      const root = await API.baseUrl();
      await API.health();
      els.statusBackend.textContent = `Operational · ${root}`;
      try {
        const model = await API.modelStatus();
        els.statusModel.textContent = model.status === "ready"
          ? `Ready · ${model.name || ""}`
          : model.status === "model_missing" ? `Model missing · ${model.name || ""}` : "Offline (rules only)";
      } catch {
        els.statusModel.textContent = "Offline (rules only)";
      }
    } catch {
      els.statusBackend.textContent = "Unreachable";
      els.statusModel.textContent = "—";
    }
  }

  async function saveSettings() {
    const apiBase = els.optApiBase.value.trim().replace(/\/+$/, "");
    await API.settings.set({
      apiBaseUrl: apiBase,
      pageScanEnabled: els.optPageScan.checked,
      keepHistory: els.optKeepHistory.checked,
    });
    await refreshConnection();
    showView("home");
  }

  // ------------------------------------------------------------------
  // Wire-up
  // ------------------------------------------------------------------
  function wire() {
    els.btnScanPage.addEventListener("click", () => runScan(scanPage));
    els.btnCapture.addEventListener("click", () => runScan(scanVision));
    els.btnScanSelection.addEventListener("click", () => scanSelection());
    els.btnCancel.addEventListener("click", cancelScan);
    els.btnBack.addEventListener("click", () => showView("home"));
    els.btnAgain.addEventListener("click", () => {
      if (lastRun) runScan(lastRun);
      else showView("home");
    });
    els.btnRetry.addEventListener("click", () => {
      if (lastRun) runScan(lastRun);
      else showView("home");
    });
    els.btnErrorBack.addEventListener("click", () => showView("home"));
    els.btnHistoryClear.addEventListener("click", async () => {
      // Two-step confirm: the first click arms the button, the second (within
      // a few seconds) actually clears. No dialog dependency, no accidental
      // history wipes.
      if (clearArmTimer) {
        clearTimeout(clearArmTimer);
        clearArmTimer = null;
        els.btnHistoryClear.textContent = "Clear";
        await sendMessage({ type: "vigil:history:clear" });
        renderHistory([]);
        return;
      }
      els.btnHistoryClear.textContent = "Sure?";
      clearArmTimer = setTimeout(() => {
        clearArmTimer = null;
        els.btnHistoryClear.textContent = "Clear";
      }, 3500);
    });
    els.btnSettings.addEventListener("click", openSettings);
    els.btnSettingsSave.addEventListener("click", saveSettings);
    els.btnSettingsTest.addEventListener("click", refreshBackendStatus);
    els.btnSettingsBack.addEventListener("click", () => showView("home"));

    // Selection requests from the service worker (context menu / button).
    chrome.runtime.onMessage.addListener((message) => {
      if (message && message.type === "vigil:scanSelection" && message.text) {
        scanSelection(message.text);
      }
    });

    // Boot handoff: a context-menu click stored a selection request before
    // this panel existed. Pick it up on first visibility.
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const data = await chrome.storage.session.get({ vigilPendingSelection: null });
        const pending = data && data.vigilPendingSelection;
        if (pending && pending.text && Date.now() - pending.at < BASE.MODEL_POLL_MAX_MS) {
          await chrome.storage.session.remove("vigilPendingSelection");
          scanSelection(pending.text);
        }
      } catch {
        /* storage.session unavailable — ignore */
      }
    });
  }

  async function boot() {
    wire();
    const settings = await API.settings.get();
    renderHistory([]);
    await loadHistory();
    await refreshConnection();
    await updateActiveTabDisplay();
    // Context-menu boot handoff (panel just opened for a selection scan).
    try {
      const data = await chrome.storage.session.get({ vigilPendingSelection: null });
      const pending = data && data.vigilPendingSelection;
      if (pending && pending.text && Date.now() - pending.at < BASE.MODEL_POLL_MAX_MS) {
        await chrome.storage.session.remove("vigilPendingSelection");
        scanSelection(pending.text);
      }
    } catch {
      /* ignore */
    }
  }

  async function refreshSelectionButton() {
    try {
      const tab = await getActiveTab();
      if (!tab || !tab.id || !isScannableUrl(tab.url)) {
        els.btnScanSelection.disabled = true;
        return;
      }
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content/extraction.js"] });
      const response = await sendMessageToTab(tab.id, { type: "vigil:getSelection" });
      const hasSelection = Boolean(response && response.ok && (response.text || "").trim());
      els.btnScanSelection.disabled = !hasSelection;
    } catch {
      // Restricted pages and prerendered tabs can't be probed; keep the button
      // enabled so the context menu remains the documented path.
      els.btnScanSelection.disabled = false;
    }
  }

  // Re-check the active tab when the panel becomes visible again.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateActiveTabDisplay();
      refreshConnection();
    }
  });

  // Live-follow tab switches and navigations while the panel is open. Both
  // events are received by the panel page directly ("tabs" permission); the
  // refresh is debounced so bursts (e.g. SPA navigations) coalesce.
  let tabRefreshTimer = null;
  function scheduleTabRefresh() {
    if (tabRefreshTimer) return;
    tabRefreshTimer = setTimeout(() => {
      tabRefreshTimer = null;
      if (document.visibilityState === "visible") updateActiveTabDisplay();
    }, 120);
  }
  if (chrome.tabs && chrome.tabs.onActivated && chrome.tabs.onUpdated) {
    chrome.tabs.onActivated.addListener(scheduleTabRefresh);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab && tab.active && (changeInfo.url || changeInfo.title || changeInfo.status === "complete")) {
        scheduleTabRefresh();
      }
    });
  }

  boot().catch((error) => console.error("VIGIL panel boot failed", error));

  // The service worker can still be starting when the panel first opens
  // (cold start after install/reload); if the first tab lookup failed, retry
  // once shortly after so the user doesn't see a false "No active page".
  setTimeout(() => {
    if (document.visibilityState === "visible" && !workerReachable()) {
      updateActiveTabDisplay();
    }
  }, 1500);
})();
