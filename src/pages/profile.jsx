import { Avatar, Button, Form, Input, notification, Upload } from "antd";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { handleUpdateFile, updateUserAPI, updateUserAvatarAPI } from "../services/api.services";
import { UserOutlined } from "@ant-design/icons";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
          notification.error({ message: "Lỗi upload ảnh", description: JSON.stringify(resUpload.message) });
          setLoading(false);
          return;
        }
      }

      const res = await updateUserAvatarAPI(avatarUrl, user?.id, fullName, phone);
      if (res.data) {
        setUser({ ...user, fullName, phone, avatar: avatarUrl });
        notification.success({ message: "Cập nhật thành công", description: "Thông tin profile đã được cập nhật" });
        setSelectedFile(null);
        setPreview(null);
      } else {
        notification.error({ message: "Lỗi cập nhật", description: JSON.stringify(res.message) });
      }
    } catch (error) {
      notification.error({ message: "Lỗi", description: "Không thể cập nhật profile" });
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = preview ||
    (user?.avatar?.startsWith('http') ? user.avatar :
      user?.avatar ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}` : null);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 20px" }}>
      <h2>Cài đặt Profile</h2>

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
            Đổi ảnh đại diện
          </Button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 4 }}>Email (không thể thay đổi)</div>
          <Input value={user?.email} disabled />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Họ tên</div>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Số điện thoại</div>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <Button type="primary" onClick={handleUpdateProfile} loading={loading} block>
        Lưu thay đổi
      </Button>
    </div>
  );
};

export default ProfilePage;