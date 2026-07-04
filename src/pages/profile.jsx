import { Avatar, Button, Input, notification, Divider, Collapse } from "antd";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import {
  handleUpdateFile,
  updateUserAvatarAPI,
  changePasswordAPI,
} from "../services/api.services";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // パスワード変更用
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
            message: "画像アップロードエラー",
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
          message: "更新成功",
          description: "プロフィール情報が更新されました",
        });
        setSelectedFile(null);
        setPreview(null);
      } else {
        notification.error({
          message: "更新エラー",
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: "エラー",
        description: "プロフィールを更新できませんでした",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      notification.warning({
        message: "入力エラー",
        description: "現在のパスワードを入力してください",
      });
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      notification.warning({
        message: "パスワードが無効です",
        description: "新しいパスワードは6文字以上で入力してください",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      notification.warning({
        message: "一致しません",
        description: "確認用パスワードが新しいパスワードと一致しません",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePasswordAPI(oldPassword, newPassword);
      if (res?.data) {
        notification.success({
          message: "変更成功",
          description: "パスワードが変更されました",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notification.error({
          message: "変更エラー",
          description: JSON.stringify(res?.message),
        });
      }
    } catch (error) {
      notification.error({
        message: "エラー",
        description: "パスワードを変更できませんでした",
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
      <h2 style={{ fontWeight: 700, marginBottom: 20 }}>プロフィール設定</h2>

      <Collapse
        accordion
        bordered={false}
        style={{
          background: "transparent",
        }}
      >
        {/* Avatar Section */}
        <Panel
          header="プロフィール画像"
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
              画像を変更
            </Button>
          </div>
        </Panel>

        {/* Basic Info */}
        <Panel
          header="基本情報"
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
                メールアドレス（変更不可）
              </label>
              <Input value={user?.email} disabled style={{ height: 42, borderRadius: 8 }} />
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                氏名
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                電話番号
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
              保存する
            </Button>
          </div>
        </Panel>

        {/* Password Change */}
        <Panel
          header="パスワード変更"
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
                現在のパスワード
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="現在のパスワードを入力してください"
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                新しいパスワード
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6文字以上"
                style={{ height: 42, borderRadius: 8 }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                新しいパスワード（確認）
              </label>
              <Input.Password
                prefix={<LockOutlined />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="新しいパスワードを再入力してください"
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
              パスワードを変更
            </Button>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ProfilePage;
