import type { User, Snippet, Doc, Component, Bug } from "@/types"

// Mock Users
export const mockUsers: User[] = [
    {
        id: "1",
        name: "Alex Johnson",
        email: "alex@example.com",
        username: "alexj",
        bio: "Full-stack developer | React & Node.js enthusiast",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        role: "USER",
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        name: "Sarah Chen",
        email: "sarah@example.com",
        username: "sarahc",
        bio: "UI/UX Designer turned Frontend Developer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        role: "USER",
        createdAt: new Date("2024-02-20"),
    },
    {
        id: "3",
        name: "Demo Admin",
        email: "admin@codestudio.com",
        username: "admin",
        bio: "CodeStudio Administrator",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        role: "ADMIN",
        createdAt: new Date("2024-01-01"),
    },
]

// Mock Snippets
export const mockSnippets: Snippet[] = [
    {
        id: "1",
        title: "React Custom Hook for API Calls",
        description: "A reusable custom hook for making API calls with loading and error states",
        code: `import { useState, useEffect } from 'react';

export function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}`,
        language: "typescript",
        authorId: "1",
        author: mockUsers[0],
        tags: ["react", "hooks", "api"],
        upvotes: 42,
        isUpvoted: false,
        isBookmarked: false,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
    },
    {
        id: "2",
        title: "Tailwind CSS Gradient Button",
        description: "Beautiful gradient button with hover effects",
        code: `<button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition duration-200">
  Click Me
</button>`,
        language: "jsx",
        authorId: "2",
        author: mockUsers[1],
        tags: ["tailwind", "css", "button"],
        upvotes: 38,
        isUpvoted: true,
        isBookmarked: true,
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-10"),
    },
    {
        id: "3",
        title: "TypeScript Utility Types",
        description: "Useful TypeScript utility types for better type safety",
        code: `// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;`,
        language: "typescript",
        authorId: "1",
        author: mockUsers[0],
        tags: ["typescript", "types", "utilities"],
        upvotes: 67,
        isUpvoted: false,
        isBookmarked: false,
        createdAt: new Date("2024-02-25"),
        updatedAt: new Date("2024-02-25"),
    },
]

// Mock Docs
export const mockDocs: Doc[] = [
    {
        id: "1",
        title: "Getting Started with React Hooks",
        slug: "getting-started-react-hooks",
        content: `# Getting Started with React Hooks

React Hooks are functions that let you use state and other React features in functional components.

## useState Hook

The useState hook allows you to add state to functional components:

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

The useEffect hook lets you perform side effects in function components...`,
        authorId: "1",
        author: mockUsers[0],
        tags: ["react", "hooks", "tutorial"],
        upvotes: 125,
        isUpvoted: true,
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
    },
]

// Mock Marketplace Components
export const mockComponents: Component[] = [
    {
        id: "1",
        name: "Animated Card Component",
        description: "Beautiful card with hover animations and glassmorphism effect",
        code: "// Component code here...",
        category: "UI",
        authorId: "2",
        author: mockUsers[1],
        price: 0,
        downloads: 234,
        rating: 4.8,
        createdAt: new Date("2024-03-05"),
    },
]

// Mock Bugs
export const mockBugs: Bug[] = [
    {
        id: "1",
        title: "Search feature not working on mobile",
        description: "The global search feature is not responsive on mobile devices",
        status: "OPEN",
        priority: "HIGH",
        authorId: "1",
        author: mockUsers[0],
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
    },
]
