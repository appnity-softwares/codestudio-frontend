import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "@/context/ThemeContext";
import { useSelector } from "react-redux";
import { STORE_ITEMS } from "@/lib/constants";

// STRICT BOILERPLATES (IO Centered)
export const BOILERPLATES: Record<string, string> = {
    python: `import sys

def solve():
    # Read from stdin: sys.stdin.readline()
    # Write to stdout: print()
    pass

if __name__ == "__main__":
    solve()`,

    javascript: `// Read from stdin, Write to stdout
const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8');
    // Your code here
    console.log("Hello Output");
}

solve();`,

    go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    // scanner.Scan() -> scanner.Text()
    fmt.Println("Hello Output")
}`,

    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    // Optimize IO
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Your code here
    return 0;
}`,

    java: `import java.util.Scanner;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // int n = scanner.nextInt();
        System.out.println("Hello Output");
    }
}`
};

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string | undefined) => void;
    onPaste?: (pastedText: string) => void;
    readOnly?: boolean;
}

export function CodeEditor({
    code,
    language,
    onChange,
    onPaste,
    readOnly = false
}: CodeEditorProps) {
    const { resolvedTheme } = useTheme(); // 'dark' or 'light'
    const equippedThemeId = useSelector((state: any) => state.user.equippedTheme);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const handleBeforeMount = (monaco: any) => {
        // Register custom themes if they are in STORE_ITEMS
        try {
            STORE_ITEMS.filter(i => i.type === 'THEME').forEach(theme => {
                const safeThemeId = theme.id.replace(/[^a-zA-Z0-9]/g, '');
                monaco.editor.defineTheme(safeThemeId, {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                        'editor.background': theme.color,
                    }
                });
            });
        } catch (e) {
            console.error("Failed to register themes:", e);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Apply theme after mount to ensure it's registered
        if (equippedThemeId) {
            const theme = STORE_ITEMS.find(i => i.id === equippedThemeId);
            if (theme && equippedThemeId === theme.id) {
                const safeThemeId = theme.id.replace(/[^a-zA-Z0-9]/g, '');
                monaco.editor.setTheme(safeThemeId);
            }
        }

        // Anti-Cheat: Paste Detection
        editor.onDidPaste((e) => {
            if (onPaste) {
                const model = editor.getModel();
                if (model) {
                    const pastedText = model.getValueInRange(e.range);
                    onPaste(pastedText);
                }
            }
        });
    };

    // React to theme changes
    useEffect(() => {
        if (monacoRef.current) {
            let currentTheme = equippedThemeId || (resolvedTheme === "dark" ? "vs-dark" : "vs");
            // Sanitize custom themes (those starting with 'theme_')
            if (currentTheme.startsWith('theme_')) {
                currentTheme = currentTheme.replace(/[^a-zA-Z0-9]/g, '');
            }
            monacoRef.current.editor.setTheme(currentTheme);
        }
    }, [equippedThemeId, resolvedTheme]);

    // Auto-update layout when container resizes
    useEffect(() => {
        // Use a parent or window resize
        const handleResize = () => editorRef.current?.layout();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Map language to Monaco-supported language ID
    const getMonacoLanguage = (lang: string): string => {
        const langMap: Record<string, string> = {
            'cpp': 'cpp',
            'c++': 'cpp',
            'react': 'javascript',
            'markdown': 'markdown',
            'mermaid': 'markdown',
        };
        return langMap[lang.toLowerCase()] || lang.toLowerCase();
    };

    return (
        <Editor
            key={`${resolvedTheme}-${equippedThemeId}`}
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            theme={equippedThemeId || (resolvedTheme === "dark" ? "vs-dark" : "vs")}
            onChange={onChange}
            onMount={handleEditorDidMount}
            beforeMount={handleBeforeMount}
            options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                },
                readOnly: readOnly,
                fontLigatures: true,
                tabSize: 4,
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
            }}
        />
    );
}
