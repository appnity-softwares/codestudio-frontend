// Virtual File System Manager for DevStudio X
export interface VirtualFile {
    path: string;
    name: string;
    content: string;
    language: string;
    isDirectory?: boolean;
}

export interface FileTree {
    [key: string]: VirtualFile | FileTree;
}

class FileSystemManager {
    private files: Map<string, VirtualFile> = new Map();
    private activeFile: string = '/App.tsx';

    constructor() {
        // Initialize with default files
        this.createFile('/App.tsx', `import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to DevStudio X
        </h1>
        <p className="text-slate-400">
          Start building something amazing!
        </p>
      </div>
    </div>
  );
};

export default App;`, 'typescript');

        this.createFile('/styles.css', `/* DevStudio X Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}`, 'css');
    }

    createFile(path: string, content: string = '', language: string = 'typescript'): VirtualFile {
        const name = path.split('/').pop() || 'untitled';
        const file: VirtualFile = {
            path,
            name,
            content,
            language: this.inferLanguage(name, language)
        };
        this.files.set(path, file);
        return file;
    }

    getFile(path: string): VirtualFile | undefined {
        return this.files.get(path);
    }

    updateFile(path: string, content: string): boolean {
        const file = this.files.get(path);
        if (file) {
            file.content = content;
            return true;
        }
        return false;
    }

    deleteFile(path: string): boolean {
        if (path === '/App.tsx') return false; // Prevent deleting main file
        return this.files.delete(path);
    }

    renameFile(oldPath: string, newPath: string): boolean {
        const file = this.files.get(oldPath);
        if (file) {
            this.files.delete(oldPath);
            file.path = newPath;
            file.name = newPath.split('/').pop() || 'untitled';
            this.files.set(newPath, file);
            if (this.activeFile === oldPath) {
                this.activeFile = newPath;
            }
            return true;
        }
        return false;
    }

    getAllFiles(): VirtualFile[] {
        return Array.from(this.files.values());
    }

    getFileTree(): FileTree {
        const tree: FileTree = {};
        this.files.forEach((file) => {
            const parts = file.path.split('/').filter(Boolean);
            let current: any = tree;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = file;
                } else {
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
            });
        });
        return tree;
    }

    setActiveFile(path: string) {
        if (this.files.has(path)) {
            this.activeFile = path;
        }
    }

    getActiveFile(): string {
        return this.activeFile;
    }

    private inferLanguage(filename: string, fallback: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'json': 'json',
            'md': 'markdown'
        };
        return languageMap[ext || ''] || fallback;
    }

    // Export all files as a single bundled code
    exportProject(): string {
        let output = '';
        this.files.forEach((file) => {
            output += `// File: ${file.path}\n`;
            output += file.content;
            output += '\n\n';
        });
        return output;
    }

    // Import detection for cross-file support
    resolveImports(filePath: string): Map<string, string> {
        const file = this.getFile(filePath);
        const imports = new Map<string, string>();

        if (!file) return imports;

        const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
        let match;

        while ((match = importRegex.exec(file.content)) !== null) {
            const importPath = match[1];
            // Resolve relative imports
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
                const resolved = this.resolveRelativePath(filePath, importPath);
                const importedFile = this.getFile(resolved);
                if (importedFile) {
                    imports.set(importPath, importedFile.content);
                }
            }
        }

        return imports;
    }

    private resolveRelativePath(fromPath: string, importPath: string): string {
        const fromParts = fromPath.split('/').filter(Boolean);
        fromParts.pop(); // Remove filename

        const importParts = importPath.split('/').filter(Boolean);

        importParts.forEach(part => {
            if (part === '..') {
                fromParts.pop();
            } else if (part !== '.') {
                fromParts.push(part);
            }
        });

        let resolved = '/' + fromParts.join('/');

        // Add common extensions if not present
        if (!resolved.includes('.')) {
            const extensions = ['.tsx', '.ts', '.jsx', '.js'];
            for (const ext of extensions) {
                if (this.files.has(resolved + ext)) {
                    return resolved + ext;
                }
            }
        }

        return resolved;
    }
}

export const fileManager = new FileSystemManager();
export default FileSystemManager;
