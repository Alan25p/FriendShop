import { CompileStartFrameworkOptions } from '../types.js';
import { GenerateFunctionIdFnOptional } from './types.js';
import { PluginOption } from 'vite';
export declare const SERVER_FN_LOOKUP = "server-fn-module-lookup";
export interface StartCompilerPluginOptions {
    framework: CompileStartFrameworkOptions;
    environments: Array<{
        name: string;
        type: 'client' | 'server';
    }>;
    /**
     * Custom function ID generator (optional).
     */
    generateFunctionId?: GenerateFunctionIdFnOptional;
    /**
     * The Vite environment name for the server function provider.
     */
    providerEnvName: string;
}
export declare function startCompilerPlugin(opts: StartCompilerPluginOptions): PluginOption;
