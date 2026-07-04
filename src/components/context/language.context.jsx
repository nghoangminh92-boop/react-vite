import { createContext, useState, useEffect } from "react";
import i18n from "../../i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const savedLang = localStorage.getItem("app_lang") || "ja";
  const [lang, setLang] = useState(savedLang);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
