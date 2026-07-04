"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Simple external store so React can read the browser-resolved theme
// hydration-safely (via useSyncExternalStore) without calling setState inside
// an effect. The initial `dark` class is applied by the inline script in
// app/layout.tsx before hydration; this store keeps React state and the DOM in
// sync on toggle.
let listeners: Array<() => void> = [];
let currentTheme: Theme | null = null;

function resolveTheme(): Theme {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSnapshot(): Theme {
  if (currentTheme === null) currentTheme = resolveTheme();
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function setTheme(theme: Theme) {
  currentTheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  for (const listener of listeners) listener();
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
