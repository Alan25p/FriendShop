import * as t from "@babel/types";
import { parseAst } from "@tanstack/router-utils";
import { getOrCreate } from "./utils.js";
function isValidExportName(name) {
  if (name === "default" || name.length === 0) return false;
  const first = name.charCodeAt(0);
  if (!(first >= 65 && first <= 90 || first >= 97 && first <= 122 || first === 95 || first === 36))
    return false;
  for (let i = 1; i < name.length; i++) {
    const ch = name.charCodeAt(i);
    if (!(ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57 || ch === 95 || ch === 36))
      return false;
  }
  return true;
}
function collectMockExportNamesBySource(code) {
  const ast = parseAst({ code });
  const namesBySource = /* @__PURE__ */ new Map();
  const add = (source, name) => {
    if (name === "default" || name.length === 0) return;
    getOrCreate(namesBySource, source, () => /* @__PURE__ */ new Set()).add(name);
  };
  for (const node of ast.program.body) {
    if (t.isImportDeclaration(node)) {
      if (node.importKind === "type") continue;
      const source = node.source.value;
      for (const s of node.specifiers) {
        if (!t.isImportSpecifier(s)) continue;
        if (s.importKind === "type") continue;
        const importedName = t.isIdentifier(s.imported) ? s.imported.name : s.imported.value;
        if (importedName === "default") continue;
        add(source, importedName);
      }
    }
    if (t.isExportNamedDeclaration(node) && node.source?.value) {
      if (node.exportKind === "type") continue;
      const source = node.source.value;
      for (const s of node.specifiers) {
        if (!t.isExportSpecifier(s)) continue;
        if (s.exportKind === "type") continue;
        add(source, s.local.name);
      }
    }
  }
  const out = /* @__PURE__ */ new Map();
  for (const [source, set] of namesBySource) {
    out.set(source, Array.from(set).sort());
  }
  return out;
}
export {
  collectMockExportNamesBySource,
  isValidExportName
};
//# sourceMappingURL=rewriteDeniedImports.js.map
