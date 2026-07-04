import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AuditOutlined,
  UsergroupAddOutlined,
  LoginOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Dropdown, message, Avatar } from 'antd';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/auth.context';
import { logoutAPI } from '../../services/api.services';
import './header.css';
import logoMuji from "../../assets/image7.jpg";
import LanguageFlag from "../language/LanguageFlag";

// ⭐ i18n
import { useTranslation } from "react-i18next";

// ⭐ Language Switcher
import LanguageSwitcher from "../language/LanguageSwitcher";

const Header = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const res = await logoutAPI();
    if (res.data) {
      localStorage.removeItem('access_token');
      setUser({ email: '', phone: '', fullName: '', role: '', avatar: '', id: '' });
      message.success(t("logout_success"));
      navigate('/');
    }
  };

  const navLinks = [
    { key: 'home', to: '/', label: t("home"), icon: <HomeOutlined /> },

    ...(user.role === 'ADMIN'
      ? [
          { key: 'dishes', to: '/dishes', label: t("dishes"), icon: <AuditOutlined /> },
          { key: 'posts', to: '/posts', label: t("posts"), icon: <FileTextOutlined /> },
          { key: 'users', to: '/users', label: t("users"), icon: <UsergroupAddOutlined /> },
        ]
      : []),
  ];

  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: t("profile_settings"),
        icon: <UserOutlined />,
        onClick: () => navigate('/profile'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: t("logout"),
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const isActive = (to) => location.pathname === to;

  return (
    <header className="app-header">
      <div className="app-header-inner">

        {/* LOGO */}
        <Link to="/" className="app-logo">
          <img src={logoMuji} alt="logo" className="app-logo-image" />
          <span className="app-logo-text">{t("Food Review")}</span>
        </Link>

        {/* NAV LINKS - desktop */}
        <nav className="app-nav">
          {navLinks.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`app-nav-link ${isActive(item.to) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="app-header-right">

          {/* ⭐ NÚT ĐỔI NGÔN NGỮ */}
          <LanguageSwitcher />

          {user?.id ? (
            <Dropdown menu={userMenuItems} trigger={['click']} placement="bottomRight">
              <div className="app-user-chip">
                {user.avatar ? (
                  <Avatar
                    src={
                      user.avatar?.startsWith('http')
                        ? user.avatar
                        : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
                    }
                    size={34}
                  />
                ) : (
                  <Avatar size={34} className="app-user-avatar-fallback">
                    {(user.fullName || 'A')[0].toUpperCase()}
                  </Avatar>
                )}

                <span className="app-user-name">{user.fullName}</span>
                <DownOutlined className="app-user-caret" />
              </div>
            </Dropdown>
          ) : (
            <Link to="/login" className="app-login-btn">
              <LoginOutlined />
              <span>{t("login")}</span>
            </Link>
          )}

          {/* HAMBURGER - mobile */}
          <button
            className={`app-hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("menu")}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`app-mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`app-mobile-nav-link ${isActive(item.to) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export default Header;
