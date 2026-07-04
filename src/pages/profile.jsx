import { Avatar, Button, Input, notification, Divider } from "antd";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import {
  handleUpdateFile,
  updateUserAvatarAPI,
  changePasswordAPI,
} from "../services/api.services";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // パスワード変更用の状態
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
          description: "パスワードが変更されました。次回ログインから新しいパスワードをご使用ください",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notification.error({
          message: "変更エラー",
          description: JSON.stringify(res?.message || "エラーが発生しました"),
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
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 20px" }}>
      <h2>プロフィール設定</h2>

      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Avatar
          size={100}
          src={avatarSrc}
          icon={!avatarSrc && <UserOutlined />}
          style={{ cursor: "pointer", border: "2px solid #1677ff" }}
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
        />
        <div style={{ marginTop: 8 }}>
          <Button size="small" onClick={() => fileInputRef.current?.click()}>
            プロフィール画像を変更
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 4 }}>メールアドレス（変更不可）</div>
          <Input value={user?.email} disabled />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>氏名</div>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>電話番号</div>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <Button type="primary" onClick={handleUpdateProfile} loading={loading} block>
        変更を保存
      </Button>

      <Divider />

      {/* パスワード変更 */}
      <h3 style={{ marginBottom: 16 }}>パスワード変更</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 4 }}>現在のパスワード</div>
          <Input.Password
            prefix={<LockOutlined />}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="現在のパスワードを入力してください"
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>新しいパスワード</div>
          <Input.Password
            prefix={<LockOutlined />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="6文字以上"
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>新しいパスワード（確認）</div>
          <Input.Password
            prefix={<LockOutlined />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="新しいパスワードを再入力してください"
          />
        </div>
      </div>

      <Button
        type="primary"
        danger
        onClick={handleChangePassword}
        loading={changingPassword}
        block
      >
        パスワードを変更
      </Button>
    </div>
  );
};

export default ProfilePage;