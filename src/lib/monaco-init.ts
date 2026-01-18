import { loader } from "@monaco-editor/react";

let configured = false;

export const configureMonaco = async () => {
    if (configured) return;
    configured = true;

    const monaco = await loader.init();

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ["node_modules/@types"],
        jsx: monaco.languages.typescript.JsxEmit.React,
        esModuleInterop: true,
        allowJs: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });

    // Load React Types for IntelliSense
    const loadTypes = async () => {
        try {
            const [reactTypes, reactDomTypes] = await Promise.all([
                fetch('https://unpkg.com/@types/react@18.2.0/index.d.ts').then(r => r.text()),
                fetch('https://unpkg.com/@types/react-dom@18.2.0/index.d.ts').then(r => r.text())
            ]);

            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                reactTypes,
                'file:///node_modules/@types/react/index.d.ts'
            );
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                reactDomTypes,
                'file:///node_modules/@types/react-dom/index.d.ts'
            );

            // Log success to console (invisible to user but useful)
            // console.debug("Monaco: React types loaded");
        } catch (e) {
            console.error("Monaco: Failed to load types", e);
        }
    };

    loadTypes();
};
