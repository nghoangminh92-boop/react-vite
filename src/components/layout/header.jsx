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
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/auth.context';
import { logoutAPI } from '../../services/api.services';
import './header.css';

const Header = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const res = await logoutAPI();
    if (res.data) {
      localStorage.removeItem('access_token');
      setUser({
        email: '', phone: '', fullName: '', role: '', avatar: '', id: '',
      });
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  const navLinks = [
    { key: 'home', to: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
    ...(user.role === 'ADMIN'
      ? [
          { key: 'dishes', to: '/dishes', label: 'Món ăn', icon: <AuditOutlined /> },
          { key: 'posts', to: '/posts', label: 'Bài viết', icon: <FileTextOutlined /> },
          { key: 'users', to: '/users', label: 'Người dùng', icon: <UsergroupAddOutlined /> },
        ]
      : []),
  ];

  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: 'Cài đặt Profile',
        icon: <UserOutlined />,
        onClick: () => navigate('/profile'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: 'Đăng xuất',
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
          <span className="app-logo-icon">🍜</span>
          <span className="app-logo-text">Food Review</span>
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
          {user?.id ? (
            <Dropdown menu={userMenuItems} trigger={['click']} placement="bottomRight">
              <div className="app-user-chip">
                {user.avatar ? (
                  <Avatar src={user.avatar?.startsWith('http') ? user.avatar : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`} size={34} />
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
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* HAMBURGER - mobile */}
          <button
            className={`app-hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
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