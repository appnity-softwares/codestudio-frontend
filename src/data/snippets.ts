// DevStudio X - Professional Code Snippets Library
export interface CodeSnippet {
  id: string;
  name: string;
  description: string;
  category: 'hooks' | 'components' | 'patterns' | 'animations' | 'utils' | 'api';
  language: 'typescript' | 'javascript';
  code: string;
  tags: string[];
}

export const codeSnippets: CodeSnippet[] = [
  // React Hooks
  {
    id: 'use-local-storage',
    name: 'useLocalStorage Hook',
    description: 'Persist state in localStorage with React hooks',
    category: 'hooks',
    language: 'typescript',
    code: `import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
    tags: ['react', 'hooks', 'localStorage', 'persistence']
  },
  {
    id: 'use-debounce',
    name: 'useDebounce Hook',
    description: 'Debounce any value with customizable delay',
    category: 'hooks',
    language: 'typescript',
    code: `import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    tags: ['react', 'hooks', 'debounce', 'performance']
  },
  {
    id: 'use-fetch',
    name: 'useFetch Hook',
    description: 'Data fetching hook with loading and error states',
    category: 'hooks',
    language: 'typescript',
    code: `import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
      }
    };

    fetchData();
  }, [url]);

  return state;
}`,
    tags: ['react', 'hooks', 'fetch', 'data']
  },

  // UI Components
  {
    id: 'glass-card',
    name: 'Glassmorphic Card',
    description: 'Premium glass-effect card component',
    category: 'components',
    language: 'typescript',
    code: `const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={\`p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl \${className}\`}>
      {children}
    </div>
  );
};`,
    tags: ['react', 'ui', 'glassmorphism', 'card']
  },
  {
    id: 'gradient-button',
    name: 'Gradient Button',
    description: 'Animated gradient button with hover effects',
    category: 'components',
    language: 'typescript',
    code: `const GradientButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="relative px-8 py-3 rounded-xl font-bold text-white overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-transform group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};`,
    tags: ['react', 'button', 'gradient', 'animation']
  },

  // Design Patterns
  {
    id: 'context-provider',
    name: 'Context Provider Pattern',
    description: 'Typed Context API pattern with provider and hook',
    category: 'patterns',
    language: 'typescript',
    code: `import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}`,
    tags: ['react', 'context', 'typescript', 'pattern']
  },

  // Animations
  {
    id: 'fade-in',
    name: 'Fade In Animation',
    description: 'Framer Motion fade-in component',
    category: 'animations',
    language: 'typescript',
    code: `import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};`,
    tags: ['animation', 'framer-motion', 'fade', 'ui']
  },

  // Utilities
  {
    id: 'format-date',
    name: 'Format Date Utility',
    description: 'Elegant date formatting function',
    category: 'utils',
    language: 'typescript',
    code: `function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  if (days > 0) return \`\${days}d ago\`;
  if (hours > 0) return \`\${hours}h ago\`;
  if (minutes > 0) return \`\${minutes}m ago\`;
  return 'Just now';
}`,
    tags: ['date', 'format', 'utility', 'time']
  },
  {
    id: 'cn-helper',
    name: 'Class Name Helper',
    description: 'Merge Tailwind classes with conditional logic',
    category: 'utils',
    language: 'typescript',
    code: `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
// cn('px-4 py-2', isActive && 'bg-blue-500', className)`,
    tags: ['tailwind', 'css', 'utility', 'class']
  },

  // API Integration
  {
    id: 'api-client',
    name: 'API Client with Interceptors',
    description: 'Axios client with auth and error handling',
    category: 'api',
    language: 'typescript',
    code: `import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;`,
    tags: ['api', 'axios', 'auth', 'interceptor']
  }
];

export function searchSnippets(query: string): CodeSnippet[] {
  const lowerQuery = query.toLowerCase();
  return codeSnippets.filter(snippet =>
    snippet.name.toLowerCase().includes(lowerQuery) ||
    snippet.description.toLowerCase().includes(lowerQuery) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getSnippetsByCategory(category: CodeSnippet['category']): CodeSnippet[] {
  return codeSnippets.filter(snippet => snippet.category === category);
}
