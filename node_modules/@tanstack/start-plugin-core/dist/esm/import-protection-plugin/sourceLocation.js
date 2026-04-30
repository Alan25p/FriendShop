import { SourceMapConsumer } from "source-map";
import * as path from "pathe";
import { normalizeFilePath, getOrCreate, escapeRegExp } from "./utils.js";
function buildLineIndex(code) {
  const offsets = [0];
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  return { offsets };
}
function upperBound(values, x) {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (values[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function indexToLineColWithIndex(lineIndex, idx) {
  const offsets = lineIndex.offsets;
  const ub = upperBound(offsets, idx);
  const lineIdx = Math.max(0, ub - 1);
  const line = lineIdx + 1;
  const lineStart = offsets[lineIdx] ?? 0;
  return { line, column0: Math.max(0, idx - lineStart) };
}
function pickOriginalCodeFromSourcesContent(map, importerFile, root) {
  if (!map?.sourcesContent || map.sources.length === 0) {
    return void 0;
  }
  const file = normalizeFilePath(importerFile);
  const sourceRoot = map.sourceRoot;
  const fileSeg = file.split("/").filter(Boolean);
  const resolveBase = sourceRoot ? path.resolve(root, sourceRoot) : root;
  let bestIdx = -1;
  let bestScore = -1;
  for (let i = 0; i < map.sources.length; i++) {
    const content = map.sourcesContent[i];
    if (typeof content !== "string") continue;
    const src = map.sources[i] ?? "";
    const normalizedSrc = normalizeFilePath(src);
    if (normalizedSrc === file) {
      return content;
    }
    let resolved;
    if (!src) {
      resolved = "";
    } else if (path.isAbsolute(src)) {
      resolved = normalizeFilePath(src);
    } else {
      resolved = normalizeFilePath(path.resolve(resolveBase, src));
    }
    if (resolved === file) {
      return content;
    }
    const normalizedSrcSeg = normalizedSrc.split("/").filter(Boolean);
    const resolvedSeg = resolved !== normalizedSrc ? resolved.split("/").filter(Boolean) : normalizedSrcSeg;
    const score = Math.max(
      segmentSuffixScore(normalizedSrcSeg, fileSeg),
      segmentSuffixScore(resolvedSeg, fileSeg)
    );
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  if (bestIdx !== -1 && bestScore >= 1) {
    return map.sourcesContent[bestIdx] ?? void 0;
  }
  return map.sourcesContent[0] ?? void 0;
}
function segmentSuffixScore(aSeg, bSeg) {
  let score = 0;
  for (let i = aSeg.length - 1, j = bSeg.length - 1; i >= 0 && j >= 0; i--, j--) {
    if (aSeg[i] !== bSeg[j]) break;
    score++;
  }
  return score;
}
async function mapGeneratedToOriginal(map, generated, fallbackFile) {
  const fallback = {
    file: fallbackFile,
    line: generated.line,
    column: generated.column0 + 1
  };
  if (!map) {
    return fallback;
  }
  const consumer = await getSourceMapConsumer(map);
  if (!consumer) return fallback;
  try {
    const orig = consumer.originalPositionFor({
      line: generated.line,
      column: generated.column0
    });
    if (orig.line != null && orig.column != null) {
      return {
        file: orig.source ? normalizeFilePath(orig.source) : fallbackFile,
        line: orig.line,
        column: orig.column + 1
      };
    }
  } catch {
  }
  return fallback;
}
const consumerCache = /* @__PURE__ */ new WeakMap();
function toRawSourceMap(map) {
  return {
    ...map,
    file: map.file ?? "",
    version: Number(map.version),
    sourcesContent: map.sourcesContent?.map((s) => s ?? "") ?? []
  };
}
async function getSourceMapConsumer(map) {
  const cached = consumerCache.get(map);
  if (cached) return cached;
  const promise = (async () => {
    try {
      return await new SourceMapConsumer(toRawSourceMap(map));
    } catch {
      return null;
    }
  })();
  consumerCache.set(map, promise);
  return promise;
}
class ImportLocCache {
  cache = /* @__PURE__ */ new Map();
  reverseIndex = /* @__PURE__ */ new Map();
  has(key) {
    return this.cache.has(key);
  }
  get(key) {
    return this.cache.get(key);
  }
  set(key, value) {
    this.cache.set(key, value);
    const file = key.slice(0, key.indexOf("::"));
    getOrCreate(this.reverseIndex, file, () => /* @__PURE__ */ new Set()).add(key);
  }
  clear() {
    this.cache.clear();
    this.reverseIndex.clear();
  }
  /** Remove all cache entries where the importer matches `file`. */
  deleteByFile(file) {
    const keys = this.reverseIndex.get(file);
    if (keys) {
      for (const key of keys) {
        this.cache.delete(key);
      }
      this.reverseIndex.delete(file);
    }
  }
}
const importPatternCache = /* @__PURE__ */ new Map();
function clearImportPatternCache() {
  importPatternCache.clear();
}
function findFirstImportSpecifierIndex(code, source) {
  let patterns = importPatternCache.get(source);
  if (!patterns) {
    const escaped = escapeRegExp(source);
    patterns = [
      new RegExp(`\\bimport\\s+(['"])${escaped}\\1`),
      new RegExp(`\\bfrom\\s+(['"])${escaped}\\1`),
      new RegExp(`\\bimport\\s*\\(\\s*(['"])${escaped}\\1\\s*\\)`)
    ];
    importPatternCache.set(source, patterns);
  }
  let best = -1;
  for (const re of patterns) {
    const m = re.exec(code);
    if (!m) continue;
    const idx = m.index + m[0].indexOf(source);
    if (idx === -1) continue;
    if (best === -1 || idx < best) best = idx;
  }
  return best;
}
async function findImportStatementLocationFromTransformed(provider, importerId, source, importLocCache) {
  const importerFile = normalizeFilePath(importerId);
  const cacheKey = `${importerFile}::${source}`;
  if (importLocCache.has(cacheKey)) {
    return importLocCache.get(cacheKey) ?? void 0;
  }
  try {
    const res = provider.getTransformResult(importerId);
    if (!res) {
      importLocCache.set(cacheKey, null);
      return void 0;
    }
    const { code, map } = res;
    const lineIndex = res.lineIndex ?? buildLineIndex(code);
    const idx = findFirstImportSpecifierIndex(code, source);
    if (idx === -1) {
      importLocCache.set(cacheKey, null);
      return void 0;
    }
    const generated = indexToLineColWithIndex(lineIndex, idx);
    const loc = await mapGeneratedToOriginal(map, generated, importerFile);
    importLocCache.set(cacheKey, loc);
    return loc;
  } catch {
    importLocCache.set(cacheKey, null);
    return void 0;
  }
}
async function findPostCompileUsageLocation(provider, importerId, source, findPostCompileUsagePos) {
  try {
    const importerFile = normalizeFilePath(importerId);
    const res = provider.getTransformResult(importerId);
    if (!res) return void 0;
    const { code, map } = res;
    if (!res.lineIndex) {
      res.lineIndex = buildLineIndex(code);
    }
    const pos = findPostCompileUsagePos(code, source);
    if (!pos) return void 0;
    return await mapGeneratedToOriginal(map, pos, importerFile);
  } catch {
    return void 0;
  }
}
async function addTraceImportLocations(provider, trace, importLocCache) {
  for (const step of trace) {
    if (!step.specifier) continue;
    if (step.line != null && step.column != null) continue;
    const loc = await findImportStatementLocationFromTransformed(
      provider,
      step.file,
      step.specifier,
      importLocCache
    );
    if (!loc) continue;
    step.line = loc.line;
    step.column = loc.column;
  }
}
function buildCodeSnippet(provider, moduleId, loc, contextLines = 2) {
  try {
    const importerFile = normalizeFilePath(moduleId);
    const res = provider.getTransformResult(moduleId);
    if (!res) return void 0;
    const { code: transformedCode, originalCode } = res;
    const sourceCode = originalCode ?? transformedCode;
    const targetLine = loc.line;
    const targetCol = loc.column;
    if (targetLine < 1) return void 0;
    const wantStart = Math.max(1, targetLine - contextLines);
    const wantEnd = targetLine + contextLines;
    let lineNum = 1;
    let pos = 0;
    while (lineNum < wantStart && pos < sourceCode.length) {
      const ch = sourceCode.charCodeAt(pos);
      if (ch === 10) {
        lineNum++;
      } else if (ch === 13) {
        lineNum++;
        if (pos + 1 < sourceCode.length && sourceCode.charCodeAt(pos + 1) === 10)
          pos++;
      }
      pos++;
    }
    if (lineNum < wantStart) return void 0;
    const lines = [];
    let curLine = wantStart;
    while (curLine <= wantEnd && pos <= sourceCode.length) {
      let eol = pos;
      while (eol < sourceCode.length) {
        const ch = sourceCode.charCodeAt(eol);
        if (ch === 10 || ch === 13) break;
        eol++;
      }
      lines.push(sourceCode.slice(pos, eol));
      curLine++;
      if (eol < sourceCode.length) {
        if (sourceCode.charCodeAt(eol) === 13 && eol + 1 < sourceCode.length && sourceCode.charCodeAt(eol + 1) === 10) {
          pos = eol + 2;
        } else {
          pos = eol + 1;
        }
      } else {
        pos = eol + 1;
      }
    }
    if (targetLine > wantStart + lines.length - 1) return void 0;
    const actualEnd = wantStart + lines.length - 1;
    const gutterWidth = String(actualEnd).length;
    const sourceFile = loc.file ?? importerFile;
    const snippetLines = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = wantStart + i;
      const lineContent = lines[i];
      const lineNumStr = String(ln).padStart(gutterWidth, " ");
      const marker = ln === targetLine ? ">" : " ";
      snippetLines.push(`  ${marker} ${lineNumStr} | ${lineContent}`);
      if (ln === targetLine && targetCol > 0) {
        const padding = " ".repeat(targetCol - 1);
        snippetLines.push(`    ${" ".repeat(gutterWidth)} | ${padding}^`);
      }
    }
    return {
      lines: snippetLines,
      highlightLine: targetLine,
      location: `${sourceFile}:${targetLine}:${targetCol}`
    };
  } catch {
    return void 0;
  }
}
export {
  ImportLocCache,
  addTraceImportLocations,
  buildCodeSnippet,
  buildLineIndex,
  clearImportPatternCache,
  findImportStatementLocationFromTransformed,
  findPostCompileUsageLocation,
  pickOriginalCodeFromSourcesContent
};
//# sourceMappingURL=sourceLocation.js.map
