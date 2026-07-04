import { useContext, useState } from "react";
import { LanguageContext } from "../context/language.context";
import { GlobalOutlined } from "@ant-design/icons";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);

  const handleSelect = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="lang-dropdown">
      <button className="lang-trigger" onClick={() => setOpen(!open)}>
        <GlobalOutlined className="lang-icon" />
      </button>

      {open && (
        <div className="lang-menu">
          <div
            className={`lang-item ${lang === "ja" ? "active" : ""}`}
            onClick={() => handleSelect("ja")}
          >
            🇯🇵 日本語
          </div>

          <div
            className={`lang-item ${lang === "vi" ? "active" : ""}`}
            onClick={() => handleSelect("vi")}
          >
            🇻🇳 Tiếng Việt
          </div>

          <div
            className={`lang-item ${lang === "en" ? "active" : ""}`}
            onClick={() => handleSelect("en")}
          >
            🇺🇸 English
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
