import { createContext, useContext, useEffect, useState } from "react";

const THEMES = {
  dark: {
    "--color-primary": "#687d45", "--color-primary-dark": "#162018", "--color-accent": "#9caf70",
    "--color-ink": "#0b100d", "--color-text": "#edf2e8", "--color-text-secondary": "#b4c0ae",
    "--color-text-muted": "#82907c", "--color-border": "#304331", "--color-bg-card": "#18231b",
    "--color-bg-page": "#0d120e", "--sakura-petal-a": "#a9c27a", "--sakura-petal-b": "#718d4b",
    "--sakura-glow": "rgba(156, 175, 112, 0.2)", "--accent-a": "#b7ca8b", "--accent-b": "#718d4b",
    "--accent-glow": "rgba(156, 175, 112, 0.2)", "--text-on-dark": "#f4f7ee", "--text-on-light": "#101710",
    "--shadow-sm": "0 2px 10px rgba(0, 0, 0, 0.25)", "--shadow-md": "0 12px 30px rgba(0, 0, 0, 0.35)",
  },
  light: {
    "--color-primary": "#536c38", "--color-primary-dark": "#263522", "--color-accent": "#718d4b",
    "--color-ink": "#f3f6ef", "--color-text": "#1b281c", "--color-text-secondary": "#53624f",
    "--color-text-muted": "#71806c", "--color-border": "#d5dfcd",
    "--color-bg-card": "#ffffff",
    "--color-bg-page": "#f2f6ef", "--sakura-petal-a": "#718d4b", "--sakura-petal-b": "#536c38",
    "--sakura-glow": "rgba(83, 108, 56, 0.16)", "--accent-a": "#8da967", "--accent-b": "#536c38",
    "--accent-glow": "rgba(83, 108, 56, 0.16)", "--text-on-dark": "#f4f7ee", "--text-on-light": "#1b281c",
    "--shadow-sm": "0 2px 10px rgba(28, 54, 29, 0.08)", "--shadow-md": "0 12px 30px rgba(28, 54, 29, 0.14)",
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