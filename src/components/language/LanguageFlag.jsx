import { useContext } from "react";
import { LanguageContext } from "../context/language.context";

const LanguageFlag = () => {
  const { lang } = useContext(LanguageContext);

  const flags = {
    ja: "🇯🇵",
    vi: "🇻🇳",
    en: "🇺🇸",
  };

  return (
    <span style={{ fontSize: 22 }}>
      {flags[lang] || "🌐"}
    </span>
  );
};

export default LanguageFlag;
