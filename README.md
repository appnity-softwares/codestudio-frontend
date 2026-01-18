# CodeStudio - React + TypeScript + Vite

A professional social platform for developers to share code snippets, write documentation, and collaborate on projects. Built with React 19, TypeScript, and Vite for optimal performance.

## ✨ Features

- 🏠 **Feed** - Browse and interact with code snippets and documentation
- ✨ **For You** - Personalized recommendations based on your interests  
- 🧭 **Explore** - Discover trending content and popular snippets
- 👥 **Community** - Connect with other developers
- 🏪 **Marketplace** - Browse and share React components
- 💻 **Playground** - Test and experiment with code
- 🌓 **Dark/Light Theme** - Beautiful theme switching with persistence
- 🔐 **Authentication** - Protected routes with session management

## 🛠️ Tech Stack

- **React 19.0.1** - Latest React with improved performance
- **TypeScript** - Full type safety throughout the application
- **Vite 6** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality accessible UI components
- **React Router 7** - Client-side routing
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icon library
- **clsx + tailwind-merge** - Dynamic className management

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
devconnect/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui component library (15+ components)
│   │   └── layout/          # Header, Sidebar, Layout wrappers
│   ├── pages/               # Route pages (Feed, Explore, Community, etc.)
│   ├── context/             # React contexts (Theme, Auth, Toast)
│   ├── hooks/               # Custom hooks (useToast)
│   ├── lib/                 # Utilities (cn function, constants, routes)
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Mock data for demonstration
│   ├── App.tsx              # Router configuration & providers
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles & theme variables
├── public/                  # Static assets
├── index.html              # HTML entry point
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies & scripts
```

## 🎯 Usage

### Demo Authentication

The application uses mock authentication for demonstration purposes:

1. Navigate to `http://localhost:5173`
2. Click **Sign In** (or you'll be redirected automatically)
3. Enter any email and password
4. Click **Sign In** to access the application

### Navigation

- Use the **sidebar** (left) to navigate between pages
- Click the **theme toggle** (sun/moon icon) to switch themes
- Click your **avatar** to access profile, settings, or logout

## 🎨 UI Components

The application includes a complete UI component library:

**Form Components**: Button, Input, Textarea, Label  
**Layout**: Card, Separator, Tabs  
**Feedback**: Toast, Skeleton, Badge, Avatar  
**Interactive**: Dialog, Dropdown Menu, Tooltip  

All components are:
- ✅ Fully typed with TypeScript
- ✅ Accessible (ARIA attributes)
- ✅ Responsive and mobile-friendly
- ✅ Dark mode compatible
- ✅ Customizable with Tailwind

## 📊 Build Performance

```
✓ Built in 566ms
Bundle Size: 194.73 KB (60.92 KB gzipped)
CSS Size: 27.13 KB (5.71 KB gzipped)
```

## 🧪 Development

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

## 🗺️ Routes

- `/` - Redirects to `/feed`
- `/auth/signin` - Sign in page (public)
- `/feed` - Main feed (protected)
- `/foryou` - Personalized feed (protected)
- `/explore` - Discover content (public)
- `/community` - Developer directory (public)
- `/marketplace` - Component marketplace (public)
- `/playground` - Code playground (public)
- `/saved` - Bookmarked items (protected)

## 🎨 Theme

The application features a professional dark/light theme system:

- **Default**: Dark theme
- **Toggle**: Click sun/moon icon in header
- **Persistence**: Preference saved in localStorage
- **System**: Respects OS color scheme preference

## 📝 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Icons: [Lucide](https://lucide.dev/)
- UI Primitives: [Radix UI](https://www.radix-ui.com/)
- Fonts: Google Fonts (Inter, Space Grotesk, Source Code Pro)

---

**Built with ❤️ using React 19 + TypeScript + Vite**
# devconnect
# devconnect
