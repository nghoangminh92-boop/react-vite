import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeOutlined,
  AuditOutlined,
  UsergroupAddOutlined,
  LoginOutlined,
  AliwangwangOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu, message } from 'antd';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/auth.context';
import { logoutAPI } from '../../services/api.services';

const Header = () => {
  const [current, setCurrent] = useState('');
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onClick = (e) => {
    if (e.key === 'profile') {
      navigate('/profile');
      return;
    }
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    const res = await logoutAPI();
    if (res.data) {
      localStorage.removeItem("access_token");
      setUser({
        email: "", phone: "", fullName: "", role: "", avatar: "", id: ""
      });
      message.success("Logout success");
    }
  };

  const items = [
    {
      label: <Link to="/">Home</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(user.role === 'ADMIN' ? [{
      label: <Link to="/users">Users</Link>,
      key: 'users',
      icon: <UsergroupAddOutlined />,
    }] : []),
    {
      label: <Link to="/foods">Foods</Link>,
      key: 'foods',
      icon: <AuditOutlined />,
    },
    ...(user.role === 'ADMIN' ? [{
      label: <Link to="/posts">Posts</Link>,
      key: 'posts',
      icon: <FileTextOutlined />,
    }] : []),
    ...(!user.id ? [{
      label: <Link to="/login">Đăng nhập</Link>,
      key: 'login',
      icon: <LoginOutlined />,
    }] : []),
    ...(user.id ? [{
      label: `Welcome ${user.fullName}`,
      key: 'setting',
      icon: <AliwangwangOutlined />,
      children: [
        {
          label: <span onClick={() => navigate('/profile')}>Cài đặt Profile</span>,
          key: 'profile',
          icon: <UserOutlined />,
        },
        {
          label: <span onClick={() => handleLogout()}>Đăng xuất</span>,
          key: 'logout',
        },
      ],
    }] : []),
  ];

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;