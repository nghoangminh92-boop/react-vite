import { Avatar, Button, Input, notification } from "antd";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { handleUpdateFile, updateUserAvatarAPI } from "../services/api.services";
import { UserOutlined } from "@ant-design/icons";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
    </div>
  );
};

export default ProfilePage;
