import UserForm from "../components/user/user.form";
import UserTable from "../components/user/user.table";
import { fetchAllUserAPI } from '../services/api.services';
import { TeamOutlined, CrownOutlined, GoogleOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import "./userManagement.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const UserPage = () => {
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [dataUsers, setDataUsers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadUser();
  }, [current]);

  const loadUser = async () => {
    const res = await fetchAllUserAPI(current, pageSize);
    if (res.data) {
      setDataUsers(res.data.result);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return dataUsers;
    const keyword = searchText.toLowerCase();
    return dataUsers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(keyword) ||
        u.email?.toLowerCase().includes(keyword)
    );
  }, [dataUsers, searchText]);

  const adminCount = dataUsers.filter((u) => u.role === "ADMIN").length;
  const staffCount = dataUsers.filter((u) => u.role === "STAFF").length;
  const googleCount = dataUsers.filter((u) => u.authProvider === "google").length;

  return (
    <div className="user-mgmt-container">
      <div className="user-mgmt-header">
        <h2 className="user-mgmt-title">
          <TeamOutlined /> {t("user_management")}
        </h2>
      </div>

      <div className="user-mgmt-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon total">
            <TeamOutlined />
          </div>
          <div>
            <div className="user-stat-value">{total}</div>
            <div className="user-stat-label">{t("total_users")}</div>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon admin">
            <CrownOutlined />
          </div>
          <div>
            <div className="user-stat-value">{adminCount}</div>
            <div className="user-stat-label">{t("admin_users")}</div>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon staff">
            <UserSwitchOutlined />
          </div>
          <div>
            <div className="user-stat-value">{staffCount}</div>
            <div className="user-stat-label">{t("staff_users")}</div>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon google">
            <GoogleOutlined />
          </div>
          <div>
            <div className="user-stat-value">{googleCount}</div>
            <div className="user-stat-label">{t("google_login_users")}</div>
          </div>
        </div>
      </div>

      <div className="user-mgmt-toolbar">
        <Input.Search
          placeholder={t("search_user_placeholder")}
          allowClear
          style={{ maxWidth: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <UserForm loadUser={loadUser} />
      </div>

      <div className="user-mgmt-card">
        <UserTable
          dataUsers={filteredUsers}
          loadUser={loadUser}
          current={current}
          pageSize={pageSize}
          total={total}
          setCurrent={setCurrent}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
};

export default UserPage;