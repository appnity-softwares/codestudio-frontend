import { transform } from "sucrase";

export function transpileReact(code: string): string {
    try {
        const result = transform(code, {
            transforms: ["typescript", "jsx"],
            production: false,
        });
        return result.code;
    } catch (err: any) {
        throw new Error(`Transpilation Error: ${err.message}`);
    }
}

export function generatePreviewHtml(transpiledCode: string): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { margin: 0; font-family: sans-serif; }
                    #root { min-height: 100vh; }
                </style>
            </head>
            <body>
                <div id="root"></div>
                <script>
                    const { useState, useEffect, useRef } = React;
                    
                    // Capture console logs
                    (function() {
                        const originalLog = console.log;
                        const originalError = console.error;
                        
                        function post(type, args) {
                            window.parent.postMessage({
                                type: 'console-' + type,
                                content: args.map(arg => 
                                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                ).join(' '),
                                time: new Date().toLocaleTimeString()
                            }, '*');
                        }
                        
                        console.log = (...args) => { post('log', args); originalLog.apply(console, args); };
                        console.error = (...args) => { post('error', args); originalError.apply(console, args); };
                    })();

                    try {
                        ${transpiledCode}
                        
                        // Check if there's a default export or if we should try to render App or the last component
                        if (typeof App !== 'undefined') {
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            root.render(React.createElement(App));
                        } else {
                            // Try to find any rendered component or just run the code
                        }
                    } catch (err) {
                        console.error('Runtime Error:', err.message);
                    }
                </script>
            </body>
        </html>
    `;
}
