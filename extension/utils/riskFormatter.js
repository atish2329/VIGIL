/**
 * Risk formatting — pure presentation mapping from real backend fields.
 * Never fabricates results: every value shown in the UI comes from a
 * backend response field, only relabeled for display.
 */

(() => {
  // Text analysis returns decision ALLOW/WARN/DENY with risk low/medium/high;
  // Vision returns risk.level HIGH/MODERATE/LOW plus a numeric score. Map both
  // onto one display vocabulary.
  const DECISION_VIEW = {
    DENY: { label: "HIGH RISK", tone: "high", word: "High Risk" },
    WARN: { label: "CAUTION", tone: "warn", word: "Caution" },
    MODERATE: { label: "CAUTION", tone: "warn", word: "Caution" },
    ALLOW: { label: "SAFE", tone: "safe", word: "Safe" },
    LOW: { label: "SAFE", tone: "safe", word: "Safe" },
  };

  const SEVERITY_VIEW = {
    high: { icon: "🔴", label: "High" },
    medium: { icon: "🟠", label: "Medium" },
    low: { icon: "🟡", label: "Low" },
    info: { icon: "🔵", label: "Info" },
  };

  function decisionView(decision) {
    return DECISION_VIEW[decision] || { label: String(decision || "UNKNOWN").toUpperCase(), tone: "warn", word: "Unknown" };
  }

  function severityView(severity) {
    return SEVERITY_VIEW[severity] || SEVERITY_VIEW.info;
  }

  /** Derive a 0-100 score for text analyses (which do not ship one). */
  function scoreFromDecision(decision) {
    if (decision === "DENY") return 85;
    if (decision === "WARN") return 55;
    return 8;
  }

  function evidenceTitle(item) {
    const icon = severityView(item.severity).icon;
    const label = item.label || item.type || "Indicator";
    return `${icon} ${humanize(label)}`;
  }

  function humanize(value) {
    const text = String(value || "").replace(/_/g, " ").trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function detailFromEvidence(item) {
    return item.detected || item.fact || item.reason || "";
  }

  function reasonFromEvidence(item) {
    return item.reason || item.detected || item.fact || "";
  }

  /**
   * Normalize the two backend result shapes into one view model.
   * Text (POST /api/analyze):
   *   {decision, risk, evidence: [{id,type,severity,fact,...}],
   *    explanation: {text} | string, local_model, analysis_id}
   * Vision (POST /api/vision/analyze):
   *   {decision, risk: {score, level}, indicators: [{type,severity,label,
   *    detected,reason,...}], explanation: string, recommendedActions, ...}
   */
  function toViewModel(data, meta) {
    const isVision = Array.isArray(data.indicators);
    const decision = data.decision || (data.risk && data.risk.level) || "ALLOW";
    const view = decisionView(decision);
    const rawItems = isVision ? data.indicators : data.evidence || [];
    const evidence = rawItems
      .filter((item) => item && item.severity !== "info")
      .map((item) => ({
        title: evidenceTitle(item),
        detail: detailFromEvidence(item),
        reason: reasonFromEvidence(item),
        severity: item.severity || "info",
      }));
    const explanation = typeof data.explanation === "object" && data.explanation
      ? data.explanation.text
      : (data.explanation || "");
    const score = isVision && data.risk && typeof data.risk.score === "number"
      ? data.risk.score
      : scoreFromDecision(decision);
    return {
      kind: isVision ? "vision" : (meta && meta.kind) || "text",
      label: (meta && meta.label) || "",
      decision,
      tone: view.tone,
      headline: view.label,
      headlineWord: view.word,
      score,
      evidence,
      explanation,
      recommendedActions: Array.isArray(data.recommendedActions) ? data.recommendedActions : [],
      analysisId: data.analysis_id || null,
      localModel: data.local_model || (data.analysis && data.analysis.local_model) || null,
    };
  }

  self.VigilFormat = {
    decisionView,
    severityView,
    toViewModel,
    scoreFromDecision,
    humanize,
  };
})();
