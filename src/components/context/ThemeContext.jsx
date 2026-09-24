import { createContext, useContext, useEffect, useState } from "react";

const THEMES = {
  dark: {
    "--color-primary": "#122018",
    "--color-primary-dark": "#08110d",
    "--color-accent": "#39d98a",
    "--color-ink": "#0a0f0d",
    "--color-text": "#ecfff5",
    "--color-text-secondary": "#b5d7c3",
    "--color-text-muted": "#7b9689",
    "--color-border": "#1e3a2e",
    "--color-bg-card": "#0f1915",
    "--color-bg-page": "#060b09",
    "--sakura-petal-a": "#7ef0b8",
    "--sakura-petal-b": "#2ad382",
    "--sakura-glow": "rgba(46, 204, 113, 0.18)",
    "--sakura-sky-1": "#0f1916",
    "--sakura-sky-2": "#0a120f",
    "--sakura-sky-3": "#050907",
    "--text-on-dark": "#ecfff5",
    "--text-on-light": "#05120d",
    "--shadow-sm": "0 2px 14px rgba(9, 20, 15, 0.45)",
    "--shadow-md": "0 18px 44px rgba(4, 12, 9, 0.62)",
  },
  light: {
    "--color-primary": "#18332a",
    "--color-primary-dark": "#0f211b",
    "--color-accent": "#1ea96a",
    "--color-ink": "#f4fff9",
    "--color-text": "#0d1713",
    "--color-text-secondary": "#4a685f",
    "--color-text-muted": "#72897e",
    "--color-border": "#d7ece2",
    "--color-bg-card": "#ffffff",
    "--color-bg-page": "#eefaf3",
    "--sakura-petal-a": "#43d392",
    "--sakura-petal-b": "#1d9d5b",
    "--sakura-glow": "rgba(29, 157, 91, 0.14)",
    "--sakura-sky-1": "#ecfaf2",
    "--sakura-sky-2": "#e3f8ee",
    "--sakura-sky-3": "#f5faf7",
    "--text-on-dark": "#ecfff5",
    "--text-on-light": "#05120d",
    "--shadow-sm": "0 2px 12px rgba(12, 32, 24, 0.08)",
    "--shadow-md": "0 18px 40px rgba(12, 32, 24, 0.14)",
  },
};

const THEME_KEYS = Object.keys(THEMES);

const getSafeTheme = () => {
  if (typeof window === "undefined") return "dark";

  try {
    const savedTheme = localStorage.getItem("theme");
    return THEME_KEYS.includes(savedTheme) ? savedTheme : "dark";
  } catch {
    return "dark";
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getSafeTheme);

  useEffect(() => {
    const vars = THEMES[theme] ?? THEMES.dark;
    const root = document.documentElement;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage issues in restricted browsers or private mode
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);