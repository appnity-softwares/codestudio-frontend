import { snippetsAPI } from './api';

export type ExecutionResult = {
    output: string;
    error?: string;
    logs?: string[];
};

// Supported languages that can be executed via backend
const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript', 'node', 'cpp', 'java', 'go', 'rust', 'c'];

// Built-in library restrictions warning
const LIBRARY_WARNING = `
Note: Only built-in/standard libraries are supported.
External packages (pip, npm, etc.) are not available.
`;

/**
 * Execute code via backend Piston API
 * All languages are routed through the backend for security and consistency
 */
export const executeCode = async (language: string, code: string): Promise<ExecutionResult> => {
    const lang = language.toLowerCase();

    // Check if language is supported
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        return {
            output: "",
            error: `Execution not supported for ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
        };
    }

    // Map language aliases
    const languageMap: Record<string, string> = {
        'node': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'c++': 'cpp',
    };
    const normalizedLang = languageMap[lang] || lang;

    const logs: string[] = [];
    logs.push(`[CodeStudio] Executing ${normalizedLang}...`);
    logs.push(LIBRARY_WARNING.trim());

    try {
        const result = await snippetsAPI.execute({ language: normalizedLang, code: code });

        const output = result.run?.stdout || '';
        const stderr = result.run?.stderr || '';
        const exitCode = result.run?.code ?? 0;
        const signal = result.run?.signal || ''; // e.g., SIGKILL

        // 1. Handle Resource Limits (SIGKILL often means OOM or Timeout)
        if (signal === 'SIGKILL') {
            return {
                output: output,
                error: "Execution terminated: Resource limit exceeded (Time or Memory). Check for infinite loops or heavy memory usage.",
                logs
            };
        }

        // 2. Handle Runtime/Compilation Errors
        if (stderr && exitCode !== 0) {
            let userFriendlyError = stderr;

            // Python: Check for missing libraries
            if (normalizedLang === 'python') {
                if (stderr.includes("ModuleNotFoundError") || stderr.includes("ImportError")) {
                    userFriendlyError = `Dependency Error:\nThis environment supports standard Python libraries only.\nExternal packages (like pandas, numpy, requests) are not available in the sandbox yet.\n\nOriginal Error:\n${stderr}`;
                }
            }

            // Generic fallback for clarity if the error is extremely short
            if (userFriendlyError.length < 5) {
                userFriendlyError = "Execution failed with non-zero exit code. See output for details.";
            }

            return {
                output: output,
                error: userFriendlyError,
                logs
            };
        }

        if (stderr) {
            // Warning but successful execution
            logs.push(`[Warning] ${stderr}`);
        }

        logs.push(`[Exit Code: ${exitCode}]${signal ? ` [Signal: ${signal}]` : ''}`);

        return {
            output: output || '(No output)',
            logs
        };
    } catch (err: any) {
        let errorMsg = "Execution failed. Please check your code and try again.";

        // 3. Handle Network/Infrastructure Errors explicitly
        if (err.message) {
            if (err.message.includes("Network error") || err.message.includes("Failed to fetch")) {
                errorMsg = "Connection to execution engine failed. The sandbox might be busy or unreachable. Please try again.";
            } else if (err.message.includes("429")) {
                errorMsg = "Rate limit exceeded. Please wait a moment before running again.";
            } else {
                errorMsg = err.message;
            }
        }

        return {
            output: "",
            error: errorMsg,
            logs
        };
    }
};

/**
 * Execute JavaScript in browser sandbox (for React live preview only)
 * This is kept for live preview components, not general code execution
 */
export const executeJSLocal = async (code: string): Promise<ExecutionResult> => {
    try {
        let output = "";
        const originalLog = console.log;
        console.log = (...args) => {
            output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ") + "\n";
        };

        // Use Function constructor for slightly safer execution than eval
        const fn = new Function(code);
        fn();

        console.log = originalLog;
        return { output: output.trim() };
    } catch (err: any) {
        return { output: "", error: err.message };
    }
};

// Legacy exports for backward compatibility
export const executePython = async (code: string) => executeCode('python', code);
export const executeJS = async (code: string) => executeJSLocal(code);
