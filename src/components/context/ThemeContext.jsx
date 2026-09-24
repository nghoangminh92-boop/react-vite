import { createContext, useContext, useEffect, useState } from "react";

const THEMES = {
  dark: {
    "--color-primary": "#1e3d33",
    "--color-primary-dark": "#102b24",
    "--color-accent": "#d9b66b",
    "--color-ink": "#1d2e27",
    "--color-text": "#1f2a24",
    "--color-text-secondary": "#5b6d66",
    "--color-text-muted": "#7b8a82",
    "--color-border": "#d8d0c3",
    "--color-bg-card": "#f6f1e8",
    "--color-bg-page": "#efe7dc",
    "--sakura-petal-a": "#e4b778",
    "--sakura-petal-b": "#af7f3e",
    "--sakura-glow": "rgba(217, 182, 107, 0.18)",
    "--sakura-sky-1": "#efe5d5",
    "--sakura-sky-2": "#f7f2ea",
    "--sakura-sky-3": "#fbf8f4",
    "--text-on-dark": "#f5f8f4",
    "--text-on-light": "#173028",
    "--shadow-sm": "0 2px 10px rgba(16, 43, 36, 0.12)",
    "--shadow-md": "0 12px 28px rgba(16, 43, 36, 0.15)",
  },
  light: {
    "--color-primary": "#1e3d33",
    "--color-primary-dark": "#102b24",
    "--color-accent": "#d9b66b",
    "--color-ink": "#1d2e27",
    "--color-text": "#1f2a24",
    "--color-text-secondary": "#5b6d66",
    "--color-text-muted": "#7b8a82",
    "--color-border": "#d8d0c3",
    "--color-bg-card": "#f6f1e8",
    "--color-bg-page": "#efe7dc",
    "--sakura-petal-a": "#e4b778",
    "--sakura-petal-b": "#af7f3e",
    "--sakura-glow": "rgba(217, 182, 107, 0.18)",
    "--sakura-sky-1": "#efe5d5",
    "--sakura-sky-2": "#f7f2ea",
    "--sakura-sky-3": "#fbf8f4",
    "--text-on-dark": "#f5f8f4",
    "--text-on-light": "#173028",
    "--shadow-sm": "0 2px 10px rgba(16, 43, 36, 0.12)",
    "--shadow-md": "0 12px 28px rgba(16, 43, 36, 0.15)",
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    const vars = THEMES[theme];
    const root = document.documentElement;

    // ⭐ Set trực tiếp từng biến CSS lên inline style — luôn thắng mọi file CSS khác
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
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