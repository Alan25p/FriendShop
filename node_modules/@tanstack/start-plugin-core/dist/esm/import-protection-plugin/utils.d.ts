export type Pattern = string | RegExp;
export declare function dedupePatterns(patterns: Array<Pattern>): Array<Pattern>;
export declare function stripViteQuery(id: string): string;
export declare function normalizeFilePath(id: string): string;
/** Clear the memoization cache (call from buildStart to bound growth). */
export declare function clearNormalizeFilePathCache(): void;
export declare function escapeRegExp(s: string): string;
/** Get a value from a Map, creating it with `factory` if absent. */
export declare function getOrCreate<TKey, TValue>(map: Map<TKey, TValue>, key: TKey, factory: () => TValue): TValue;
/** Make a path relative to `root`, keeping non-rooted paths as-is. */
export declare function relativizePath(p: string, root: string): string;
export declare function extractImportSources(code: string): Array<string>;
