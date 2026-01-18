import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

// MVP STABILIZATION: Unregister any existing service workers to prevent Socket.IO conflicts
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
            console.warn("Unregistering Service Worker to fix Socket.IO conflict:", registration);
            registration.unregister();
        }
    });
}
