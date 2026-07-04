import { Avatar, Button, Input, notification, Divider, Collapse } from "antd";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import {
  handleUpdateFile,
  updateUserAvatarAPI,
  changePasswordAPI,
} from "../services/api.services";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { Panel } = Collapse;

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleFileChange = (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatar || "";

      if (selectedFile) {
        const resUpload = await handleUpdateFile(selectedFile, "avatar");
        if (resUpload.data) {
          avatarUrl = resUpload.data.url;
        } else {
          notification.error({
            message: t("avatar_upload_error"),
            description: JSON.stringify(resUpload.message),
          });
          setLoading(false);
          return;
        }
      }

      const res = await updateUserAvatarAPI(avatarUrl, user?.id, fullName, phone);
      if (res.data) {
        setUser({ ...user, fullName, phone, avatar: avatarUrl });
        notification.success({
          message: t("update_success"),
          description: t("profile_updated"),
        });
        setSelectedFile(null);
        setPreview(null);
      } else {
        notification.error({
          message: t("update_error"),
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("profile_update_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      notification.warning({
        message: t("input_error"),
        description: t("enter_current_password"),
      });
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      notification.warning({
        message: t("invalid_password"),
        description: t("password_min_length"),
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      notification.warning({
        message: t("not_match"),
        description: t("password_not_match"),
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePasswordAPI(oldPassword, newPassword);
      if (res?.data) {
        notification.success({
          message: t("change_success"),
          description: t("password_changed"),
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notification.error({
          message: t("change_error"),
          description: JSON.stringify(res?.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("error"),
        description: t("password_change_failed"),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const avatarSrc =
    preview ||
    (user?.avatar?.startsWith("http")
      ? user.avatar
      : user?.avatar
      ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
      : null);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{t("profile_settings")}</h2>

      <Collapse accordion bordered={false} style={{ background: "transparent" }}>
        {/* Avatar Section */}
        <Panel
          header={t("profile_image")}
          key="1"
          style={{
            background: "#fff",
            borderRadius: 12,
            marginBottom: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Avatar
              size={110}
              src={avatarSrc}
              icon={!avatarSrc && <UserOutlined />}
              style={{
                cursor: "pointer",
                border: "3px solid #1677ff",
                marginBottom: 12,
              }}
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button size="small" onClick={() => fileInputRef.current?.click()}>
              {t("change_image")}
            </Button>
          </div>
        </Panel>

        {/* Basic Info */}
        <Panel
          header={t("basic_info")}
          key="2"
          style={{
            background: "#fff",
            borderRadius: 12,
            marginBottom: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                {t("email_readonly")}
              </label>
              <Input value={user?.email} disabled style={{ height: 42, borderRadius: 8 }} />
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                {t("full_name")}
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                {t("phone")}
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <Button
              type="primary"
              onClick={handleUpdateProfile}
              loading={loading}
              block
              style={{
                height: 45,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {t("save")}
            </Button>
          </div>
        </Panel>

        {/* Password Change */}
        <Panel
          header={t("change_password")}
          key="3"
          style={{
            background: "#fff",
            borderRadius: 12,
            marginBottom: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                {t("current_password")}
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t("enter_current_password")}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                {t("new_password")}
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("password_min_length")}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                {t("confirm_new_password")}
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("password_confirm_placeholder")}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <Button
              type="primary"
              danger
              onClick={handleChangePassword}
              loading={changingPassword}
              block
              style={{
                marginTop: 10,
                height: 45,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {t("change_password")}
            </Button>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ProfilePage;
