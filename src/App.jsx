import Header from './components/layout/header';
import Footer from './components/layout/footer';
import { Outlet } from 'react-router-dom';
import { getAccountAPI } from './services/api.services';
import { useContext, useEffect } from 'react';
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';
import { Analytics } from '@vercel/analytics/react';

// ⭐ SỬA ĐÚNG ĐƯỜNG DẪN NÀY
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

  return (
    <LanguageProvider>
      {isAppLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
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
