import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast', 'clsx', 'tailwind-merge'],
          framer: ['framer-motion'],
          query: ['@tanstack/react-query'],
          monaco: ['@monaco-editor/react'],
          charts: ['recharts'],
          '3d': ['three', '@react-three/fiber', '@react-three/drei'],
          syntax: ['prism-react-renderer', 'react-live'],
        },
      },
    },
    // Disable source maps in production for security
    sourcemap: false,
    // Minify output
    minify: 'esbuild',
    // Target modern browsers
    target: 'es2020',
  },
  esbuild: {
    // Remove console.log and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
