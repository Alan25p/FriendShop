import { normalizePath } from "vite";
function dedupePatterns(patterns) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const p of patterns) {
    const key = typeof p === "string" ? `s:${p}` : `r:${p.toString()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
function stripViteQuery(id) {
  const q = id.indexOf("?");
  const h = id.indexOf("#");
  if (q === -1 && h === -1) return id;
  if (q === -1) return id.slice(0, h);
  if (h === -1) return id.slice(0, q);
  return id.slice(0, Math.min(q, h));
}
const normalizeFilePathCache = /* @__PURE__ */ new Map();
function normalizeFilePath(id) {
  let result = normalizeFilePathCache.get(id);
  if (result === void 0) {
    result = normalizePath(stripViteQuery(id));
    normalizeFilePathCache.set(id, result);
  }
  return result;
}
function clearNormalizeFilePathCache() {
  normalizeFilePathCache.clear();
}
const importSourceRe = /\bfrom\s+(?:"([^"]+)"|'([^']+)')|import\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getOrCreate(map, key, factory) {
  let value = map.get(key);
  if (value === void 0) {
    value = factory();
    map.set(key, value);
  }
  return value;
}
function relativizePath(p, root) {
  if (!p.startsWith(root)) return p;
  const ch = p.charCodeAt(root.length);
  if (ch !== 47 && !Number.isNaN(ch)) return p;
  return ch === 47 ? p.slice(root.length + 1) : p.slice(root.length);
}
function extractImportSources(code) {
  const sources = [];
  let m;
  importSourceRe.lastIndex = 0;
  while ((m = importSourceRe.exec(code)) !== null) {
    const src = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (src) sources.push(src);
  }
  return sources;
}
export {
  clearNormalizeFilePathCache,
  dedupePatterns,
  escapeRegExp,
  extractImportSources,
  getOrCreate,
  normalizeFilePath,
  relativizePath,
  stripViteQuery
};
//# sourceMappingURL=utils.js.map
