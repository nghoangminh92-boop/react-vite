import Header from './components/layout/header';
import Footer from './components/layout/footer';
import { Outlet } from 'react-router-dom';
import { getAccountAPI } from './services/api.services';
import { useContext, useEffect } from 'react';
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from "./components/context/language.context.jsx";

const App = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUserInfo();
    } else {
      setIsAppLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    const res = await getAccountAPI();
    if (res.data) {
      setUser(res.data.user);
    }
    setIsAppLoading(false);
  };

  // ⭐ TẠO PARTICLES SAU KHI DOM RENDER
  useEffect(() => {
    const container = document.querySelector(".cyber-bg__particles");
    if (!container) return;

    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "cyber-bg__particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = Math.random() * 100 + "%";
      p.style.animationDuration = 6 + Math.random() * 6 + "s";
      container.appendChild(p);
    }
  }, []);

  return (
    <LanguageProvider>

      {/* ⭐ BACKGROUND XÁM ĐEN */}
      <div className="cyber-bg">
        <div className="cyber-bg__mesh"></div>
        <div className="cyber-bg__blob cyber-bg__blob--a"></div>
        <div className="cyber-bg__blob cyber-bg__blob--b"></div>
        <div className="cyber-bg__blob cyber-bg__blob--c"></div>
        <div className="cyber-bg__particles"></div>
        <div className="cyber-bg__noise"></div>
      </div>

      {isAppLoading && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}>
          <Spin />
        </div>
      )}

      <Header />
      <Outlet />
      <Footer />
      <Analytics />

    </LanguageProvider>
  );
};

export default App;
