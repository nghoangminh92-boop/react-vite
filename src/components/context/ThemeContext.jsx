import { createContext, useContext, useEffect, useState } from "react";

const THEMES = {
  dark: {
    "--color-primary": "#3a3a3a",
    "--color-primary-dark": "#1c1c1c",
    "--color-accent": "#8a8a8a",
    "--color-ink": "#141414",
    "--color-text": "#f2f2f2",
    "--color-text-secondary": "#b8b4ac",
    "--color-text-muted": "#8a8680",
    "--color-border": "#2c2c2c",
    "--color-bg-card": "#1c1c1c",
    "--color-bg-page": "#0d0d0d",
    "--sakura-petal-a": "#f3c6d3",
    "--sakura-petal-b": "#e79cb2",
    "--sakura-glow": "rgba(243, 198, 211, 0.16)",
    "--sakura-sky-1": "#201a1e",
    "--sakura-sky-2": "#141414",
    "--sakura-sky-3": "#0d0d0d",
    "--text-on-dark": "#f2f2f2",
    "--text-on-light": "#1c1c1c",
    "--shadow-sm": "0 2px 10px rgba(0, 0, 0, 0.25)",
    "--shadow-md": "0 10px 28px rgba(0, 0, 0, 0.4)",
  },
  light: {
    "--color-primary": "#6e6e6e",
    "--color-primary-dark": "#3a3a3a",
    "--color-accent": "#a3a3a3",
    "--color-ink": "#f5f5f4",
    "--color-text": "#1f1f1f",
    "--color-text-secondary": "#6e6e6e",
    "--color-text-muted": "#a3a3a3",
    "--color-border": "#e4e4e4",
    "--color-bg-card": "#ffffff",
    "--color-bg-page": "#f5f5f4",
    "--sakura-petal-a": "#e2789a",
    "--sakura-petal-b": "#c95d81",
    "--sakura-glow": "rgba(226, 120, 154, 0.14)",
    "--sakura-sky-1": "#fdf2f5",
    "--sakura-sky-2": "#f7e4ea",
    "--sakura-sky-3": "#f5f5f4",
    "--text-on-dark": "#f2f2f2",
    "--text-on-light": "#1c1c1c",
    "--shadow-sm": "0 2px 10px rgba(0, 0, 0, 0.06)",
    "--shadow-md": "0 10px 28px rgba(0, 0, 0, 0.14)",
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