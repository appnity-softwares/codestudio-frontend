import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

interface ThemeProviderState {
    theme: Theme
    resolvedTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    resolvedTheme: "dark",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "codestudio-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        const applyTheme = (t: "light" | "dark") => {
            root.classList.remove("light", "dark")
            root.classList.add(t)
            setResolvedTheme(t)
        }

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
            applyTheme(mediaQuery.matches ? "dark" : "light")

            const listener = (e: MediaQueryListEvent) => {
                applyTheme(e.matches ? "dark" : "light")
            }

            mediaQuery.addEventListener("change", listener)
            return () => mediaQuery.removeEventListener("change", listener)
        }

        applyTheme(theme as "light" | "dark")
    }, [theme])

    const value = {
        theme,
        resolvedTheme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
