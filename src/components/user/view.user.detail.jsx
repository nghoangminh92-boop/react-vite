import { Button, Drawer, notification } from "antd";
import { useState } from "react";
import { handleUpdateFile, updateUserAvatarAPI } from "../../services/api.services";
import "./viewUserDetail.css";

const ViewUserDetail = (props) => {
  const {
    isDetailOpen,
    setIsDetailOpen,
    dataDetail,
    setDataDetail,
    loadUser,
  } = props;

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleOnChangeFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateUserAvatar = async () => {
    const resUpload = await handleUpdateFile(selectedFile, "avatar");

    if (!resUpload.data) {
      notification.error({
        message: "Error upload file",
        description: JSON.stringify(resUpload.message),
      });
      return;
    }

    const newAvatar = resUpload.data.fileUploaded;

    const resUpdateAvatar = await updateUserAvatarAPI(
      newAvatar,
      dataDetail._id,
      dataDetail.fullName,
      dataDetail.phone
    );

    if (resUpdateAvatar.data) {
      notification.success({
        message: "Update User avatar",
        description: "Cập nhật thành công",
      });

      setIsDetailOpen(false);
      setSelectedFile(null);
      setPreview(null);
      await loadUser();
    } else {
      notification.error({
        message: "Error update file",
        description: JSON.stringify(resUpdateAvatar.message),
      });
    }
  };

  return (
    <Drawer
      title="Chi tiết user"
      width={"40vw"}
      onClose={() => {
        setDataDetail(null);
        setIsDetailOpen(false);
      }}
      open={isDetailOpen}
    >
      {dataDetail ? (
        <>
          <p><strong>ID:</strong> {dataDetail._id}</p>
          <p><strong>Full name:</strong> {dataDetail.fullName}</p>
          <p><strong>Email:</strong> {dataDetail.email}</p>
          <p><strong>Phone:</strong> {dataDetail.phone}</p>

          <p><strong>Avatar:</strong></p>

          {/* Avatar hiển thị */}
          <div className="avatar-box">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail.avatar}`}
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="avatar-img"
            />
          </div>

          {/* Upload button */}
          <div className="upload-row">
            <label htmlFor="btnUpload" className="upload-btn">
              Upload Avatar
            </label>
            <input
              type="file"
              hidden
              id="btnUpload"
              onChange={handleOnChangeFile}
            />
          </div>

          {/* Preview */}
          {preview && (
            <>
              <div className="avatar-box">
                <img
                  src={preview}
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  className="avatar-img"
                />
              </div>

              <Button
                type="primary"
                className="save-btn"
                onClick={handleUpdateUserAvatar}
              >
                Save
              </Button>
            </>
          )}
        </>
      ) : (
        <p>Không có dữ liệu</p>
      )}
    </Drawer>
  );
};

export default ViewUserDetail;
