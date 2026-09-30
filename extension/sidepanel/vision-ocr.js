/**
 * VIGIL Vision — local OCR pipeline (ported from web/vision.js).
 *
 * PRIVACY: the screenshot never leaves the device. OCR (Tesseract.js WASM),
 * QR decoding (jsQR), and preprocessing run entirely in this extension page.
 * Only extracted text + region coordinates + QR payloads are sent to the
 * VIGIL backend for rule analysis — exactly like the web app.
 *
 * MV3 note: Tesseract.js is configured with workerBlobURL: false so the worker
 * is created directly from the vendored script URL (extension origin, allowed
 * by the MV3 CSP) instead of a blob: URL. WASM instantiation is enabled by the
 * manifest's 'wasm-unsafe-eval' CSP directive.
 */

(() => {
  const DEFAULTS = self.VIGIL_DEFAULTS;
  const MAX_DIMENSION = 5000;
  const MAX_OCR_PIXELS = 4_000_000;
  const LOW_CONFIDENCE_THRESHOLD = 70;

  let worker = null;
  let workerReady = false;
  let workerCreation = null;

  async function ensureWorker() {
    if (worker && workerReady) return worker;
    if (workerCreation) return workerCreation;
    if (typeof Tesseract === "undefined") {
      throw new Error("The local OCR engine is not available in this build.");
    }
    workerCreation = (async () => {
      worker = await Tesseract.createWorker("eng", 1, {
        workerPath: "../vendor/tesseract/worker.min.js",
        corePath: "../vendor/tesseract-core",
        langPath: "../vendor/langdata",
        workerBlobURL: false,
        logger: () => {},
        errorHandler: () => {},
      });
      await worker.setParameters({
        tessedit_pageseg_mode: "3",
        preserve_interword_spaces: "1",
      });
      workerReady = true;
      return worker;
    })();
    try {
      return await workerCreation;
    } catch (error) {
      workerCreation = null;
      throw error;
    }
  }

  async function resetWorker() {
    workerReady = false;
    workerCreation = null;
    try {
      if (worker) await worker.terminate();
    } catch {
      /* ignore */
    }
    worker = null;
  }

  // ------------------------------------------------------------------
  // Preprocessing (same adaptive rescale as the web app)
  // ------------------------------------------------------------------
  function prepareCanvas(source, width, height) {
    const longEdge = Math.max(width, height);
    let scale = 1;
    if (longEdge < 900) scale = Math.min(2, 900 / longEdge);
    if (width * scale * height * scale > MAX_OCR_PIXELS) {
      scale = Math.sqrt(MAX_OCR_PIXELS / (width * height));
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return { canvas, ctx, scale: canvas.width / width };
  }

  function toGrayscaleContrast(ctx, width, height) {
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const histogram = new Uint32Array(256);
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      data[i] = data[i + 1] = data[i + 2] = gray;
      histogram[gray | 0] += 1;
    }
    const total = width * height;
    const lowCut = total * 0.02;
    const highCut = total * 0.98;
    let cumulative = 0;
    let low = 0;
    let high = 255;
    for (let v = 0; v < 256; v += 1) {
      cumulative += histogram[v];
      if (cumulative <= lowCut) low = v;
      if (cumulative <= highCut) high = v;
    }
    const range = Math.max(1, high - low);
    for (let i = 0; i < data.length; i += 4) {
      let v = ((data[i] - low) / range) * 255;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
  }

  // ------------------------------------------------------------------
  // Recognition + region grouping (same heuristics as the web app)
  // ------------------------------------------------------------------
  async function recognizeCanvas(canvas, onProgress) {
    const activeWorker = await ensureWorker();
    const result = await activeWorker.recognize(canvas, {}, { text: true, blocks: true }, onProgress);
    return wordsFromResult(result.data);
  }

  function wordsFromResult(data) {
    const words = [];
    const pushWord = (word) => {
      if (!word || typeof word.text !== "string") return;
      const text = word.text.trim();
      if (!text) return;
      const bbox = word.bbox || {};
      words.push({
        text,
        confidence: typeof word.confidence === "number" ? word.confidence : 0,
        bbox: {
          x: Math.round(bbox.x0 ?? 0),
          y: Math.round(bbox.y0 ?? 0),
          width: Math.round((bbox.x1 ?? 0) - (bbox.x0 ?? 0)),
          height: Math.round((bbox.y1 ?? 0) - (bbox.y0 ?? 0)),
        },
      });
    };
    if (Array.isArray(data.blocks)) {
      for (const block of data.blocks) {
        for (const paragraph of block.paragraphs || []) {
          for (const line of paragraph.lines || []) {
            for (const word of line.words || []) pushWord(word);
          }
        }
      }
    } else if (Array.isArray(data.words)) {
      for (const word of data.words) pushWord(word);
    }
    return words;
  }

  function groupWordsIntoLines(words, scale) {
    const usable = words.filter((word) => word.text.length > 0);
    usable.sort((a, b) => (a.bbox.y - b.bbox.y) || (a.bbox.x - b.bbox.x));
    const lines = [];
    for (const word of usable) {
      let placed = false;
      // Check the last few open lines, not just the last one: tall letters
      // make later words sort above their line's reference.
      for (let i = lines.length - 1; i >= 0 && i >= lines.length - 4; i -= 1) {
        const line = lines[i];
        const members = line.words;
        const verticalCenterMatch = members.some((member) => {
          const center = member.bbox.y + member.bbox.height / 2;
          const wordCenter = word.bbox.y + word.bbox.height / 2;
          return Math.abs(center - wordCenter) <= Math.max(member.bbox.height, word.bbox.height) * 0.45;
        });
        if (verticalCenterMatch) {
          members.push(word);
          placed = true;
          break;
        }
      }
      if (!placed) lines.push({ words: [word] });
    }
    const regions = [];
    for (const line of lines) {
      line.words.sort((a, b) => a.bbox.x - b.bbox.x);
      const text = line.words.map((word) => word.text).join(" ").trim();
      if (!text) continue;
      const confidences = line.words.map((word) => word.confidence).filter((c) => c > 0);
      const confidence = confidences.length
        ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
        : 0;
      const x1 = Math.min(...line.words.map((word) => word.bbox.x));
      const y1 = Math.min(...line.words.map((word) => word.bbox.y));
      const x2 = Math.max(...line.words.map((word) => word.bbox.x + word.bbox.width));
      const y2 = Math.max(...line.words.map((word) => word.bbox.y + word.bbox.height));
      regions.push({
        text,
        confidence: Math.round(confidence * 10) / 10,
        bbox: {
          x: Math.round(x1 / scale),
          y: Math.round(y1 / scale),
          width: Math.round((x2 - x1) / scale),
          height: Math.round((y2 - y1) / scale),
        },
      });
    }
    // Drop obvious noise: very low confidence single characters.
    return regions.filter((region) => !(region.text.length < 3 && region.confidence < 25));
  }

  async function runOCR(ctx, width, height, scale, onProgress) {
    let words = await recognizeCanvas(ctx.canvas, onProgress);
    let regions = groupWordsIntoLines(words, scale);
    let degraded = false;

    const quality = (list) => (list.length
      ? list.reduce((sum, region) => sum + region.confidence, 0) / list.length
      : 0);

    // Adaptive second pass: grayscale + contrast stretch, keep the better one.
    if (quality(regions) < 70) {
      const fallback = document.createElement("canvas");
      fallback.width = width;
      fallback.height = height;
      const fallbackCtx = fallback.getContext("2d", { willReadFrequently: true });
      fallbackCtx.drawImage(ctx.canvas, 0, 0);
      toGrayscaleContrast(fallbackCtx, width, height);
      const fallbackWords = await recognizeCanvas(fallback, onProgress);
      const fallbackRegions = groupWordsIntoLines(fallbackWords, scale);
      if (fallbackRegions.length > regions.length || quality(fallbackRegions) > quality(regions) + 4) {
        regions = fallbackRegions;
      }
      if (quality(regions) < LOW_CONFIDENCE_THRESHOLD) degraded = true;
    }

    const meanConfidence = regions.length ? quality(regions) : 0;
    const lowConfidence = regions.length > 0 && (
      meanConfidence < LOW_CONFIDENCE_THRESHOLD
      || regions.filter((region) => region.confidence < LOW_CONFIDENCE_THRESHOLD).length >= Math.max(2, regions.length * 0.25)
    );
    return { regions, meanConfidence, lowConfidence, degraded };
  }

  // ------------------------------------------------------------------
  // QR detection (jsQR, local; destinations are never opened)
  // ------------------------------------------------------------------
  function scanForQRCodes(ctx, width, height, scale) {
    const codes = [];
    if (typeof jsQR !== "function") return codes;
    const attempts = [
      { w: width, h: height, canvas: ctx.canvas },
      { w: Math.round(width * 0.5), h: Math.round(height * 0.5) },
      { w: Math.round(width * 1.5), h: Math.round(height * 1.5) },
    ];
    for (const attempt of attempts) {
      if (attempt.w < 40 || attempt.h < 40 || attempt.w > 6000 || attempt.h > 6000) continue;
      try {
        let source = attempt.canvas;
        let sx = 1;
        if (attempt.w !== width || attempt.h !== height) {
          const temp = document.createElement("canvas");
          temp.width = attempt.w;
          temp.height = attempt.h;
          const tctx = temp.getContext("2d", { willReadFrequently: true });
          tctx.drawImage(ctx.canvas, 0, 0, attempt.w, attempt.h);
          source = temp;
          sx = attempt.w / width;
        }
        const imageData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, attempt.w, attempt.h);
        const found = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
        if (found && found.data) {
          const points = [found.location.topLeftCorner, found.location.topRightCorner, found.location.bottomLeftCorner, found.location.bottomRightCorner];
          const xs = points.map((p) => p.x);
          const ys = points.map((p) => p.y);
          const x1 = Math.min(...xs);
          const y1 = Math.min(...ys);
          codes.push({
            data: found.data,
            bbox: {
              x: Math.round(x1 / (scale * sx)),
              y: Math.round(y1 / (scale * sx)),
              width: Math.round((Math.max(...xs) - x1) / (scale * sx)),
              height: Math.round((Math.max(...ys) - y1) / (scale * sx)),
            },
          });
        }
      } catch {
        /* a failed decode attempt is non-fatal */
      }
      if (codes.length) break;
    }
    return codes;
  }

  // ------------------------------------------------------------------
  // Visual structure detection (measured geometry, no guessing)
  // ------------------------------------------------------------------
  function detectVisualStructures(ctx, width, height) {
    const rectangles = [];
    const fields = { passwordFields: 0, otpLikeFields: 0 };
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const luminance = (x, y) => {
      const index = (y * width + x) * 4;
      return (data[index] * 299 + data[index + 1] * 587 + data[index + 2] * 114) / 1000;
    };
    const minRunWidth = Math.max(48, Math.round(width * 0.08));
    const maxRunWidth = Math.round(width * 0.9);

    for (let y = 8; y < height - 8; y += 2) {
      let x = 4;
      while (x < width - 4) {
        if (luminance(x, y) < 130) {
          const runStart = x;
          while (x < width - 4 && luminance(x, y) < 160) x += 1;
          const runWidth = x - runStart;
          if (runWidth >= minRunWidth && runWidth <= maxRunWidth
            && luminance(runStart - 3, y) > 165 && luminance(x + 3, y) > 165) {
            const runHeight = measureBoxHeight(luminance, runStart, runWidth, y, width, height);
            if (runHeight >= 16 && runHeight <= 90) {
              const rect = { x: runStart, y: y - Math.round(runHeight / 2), width: runWidth, height: runHeight };
              classifyBox(rect, rectangles, fields, luminance, width, height);
            }
          }
        } else {
          x += 1;
        }
      }
    }

    function measureBoxHeight(lum, runStart, runWidth, y, w, h) {
      const midX = runStart + Math.round(runWidth / 2);
      let top = y;
      while (top > 2 && lum(midX, top - 1) < 160) top -= 1;
      let bottom = y;
      while (bottom < h - 3 && lum(midX, bottom + 1) < 160) bottom += 1;
      return bottom - top;
    }

    function classifyBox(rect, out, fieldCounts, lum, w, h) {
      const existing = out.find((candidate) => Math.abs(candidate.x - rect.x) < 8
        && Math.abs(candidate.y - rect.y) < 10
        && Math.abs(candidate.width - rect.width) < 12);
      if (existing) return;

      const inset = Math.max(4, Math.round(rect.height * 0.22));
      const left = rect.x + inset;
      const right = rect.x + rect.width - inset;
      const top = rect.y + inset;
      const bottom = rect.y + rect.height - inset;
      if (right - left < 12 || bottom - top < 8) return;

      let transitions = 0;
      let lightPixels = 0;
      let samples = 0;
      let previousLight = null;
      const midY = Math.round((top + bottom) / 2);
      for (let x = left; x < right; x += 1) {
        const light = lum(x, midY) > 135;
        if (previousLight === null) previousLight = light;
        else if (light !== previousLight) {
          transitions += 1;
          previousLight = light;
        }
        if (light) lightPixels += 1;
        samples += 1;
      }
      const lightRatio = samples ? lightPixels / samples : 0;

      // Password dot-mask: frequent alternation, moderate light coverage.
      if (transitions >= 10 && lightRatio > 0.25 && lightRatio < 0.75 && rect.width > rect.height * 1.8) {
        fieldCounts.passwordFields += 1;
        if (fieldCounts.passwordFields <= 3) out.push({ ...rect, label: "password" });
        return;
      }
      // OTP/PIN cell: small, near-square, mostly light interior.
      const aspect = rect.width / rect.height;
      if (aspect > 0.45 && aspect < 2.2 && rect.width < Math.round(w * 0.22) && lightRatio > 0.55 && rect.height < 80) {
        fieldCounts.otpLikeFields += 1;
        if (fieldCounts.otpLikeFields <= 6) out.push({ ...rect, label: "otp" });
      }
    }

    return { rectangles, fields };
  }

  // ------------------------------------------------------------------
  // Full local pass over an image source (canvas-drawable)
  // ------------------------------------------------------------------
  async function analyzeImageSource(source, width, height, hooks) {
    const onProgress = hooks && typeof hooks.onProgress === "function" ? hooks.onProgress : null;
    const { canvas, ctx, scale } = prepareCanvas(source, width, height);
    if (onProgress) onProgress("ocr");

    const ocr = await runOCR(ctx, canvas.width, canvas.height, scale, onProgress);
    if (onProgress) onProgress("qr");
    const qrCodes = scanForQRCodes(ctx, canvas.width, canvas.height, scale);
    if (onProgress) onProgress("visual");
    const visual = detectVisualStructures(ctx, canvas.width, canvas.height);

    return {
      payload: {
        image: { width, height },
        ocr,
        qr: qrCodes,
        visual: { rectangles: visual.rectangles, fields: visual.fields },
      },
      canvas,
      scale,
    };
  }

  self.VigilOcr = {
    analyzeImageSource,
    resetWorker,
    ensureWorker,
  };
})();
