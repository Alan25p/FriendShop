import { PluginOption } from 'vite';
import { CompileStartFrameworkOptions, GetConfigFn } from '../types.js';
export { RESOLVED_MOCK_MODULE_ID } from './virtualModules.js';
export { rewriteDeniedImports } from './rewriteDeniedImports.js';
export { dedupePatterns, extractImportSources } from './utils.js';
export type { Pattern } from './utils.js';
export interface ImportProtectionPluginOptions {
    getConfig: GetConfigFn;
    framework: CompileStartFrameworkOptions;
    environments: Array<{
        name: string;
        type: 'client' | 'server';
    }>;
    providerEnvName: string;
}
export declare function importProtectionPlugin(opts: ImportProtectionPluginOptions): PluginOption;
