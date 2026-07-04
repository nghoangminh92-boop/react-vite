import { Button, Drawer, notification } from "antd";
import { useState } from "react";
import { handleUpdateFile, updateUserAvatarAPI } from "../../services/api.services";
import "./viewUserDetail.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const ViewUserDetail = (props) => {
  const {
    isDetailOpen,
    setIsDetailOpen,
    dataDetail,
    setDataDetail,
    loadUser,
  } = props;

  const { t } = useTranslation(); // ⭐ dùng i18n

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
        message: t("upload_error"),
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
        message: t("update_avatar"),
        description: t("update_success"),
      });

      setIsDetailOpen(false);
      setSelectedFile(null);
      setPreview(null);
      await loadUser();
    } else {
      notification.error({
        message: t("update_error"),
        description: JSON.stringify(resUpdateAvatar.message),
      });
    }
  };

  return (
    <Drawer
      title={t("user_detail")}
      width={"40vw"}
      onClose={() => {
        setDataDetail(null);
        setIsDetailOpen(false);
      }}
      open={isDetailOpen}
    >
      {dataDetail ? (
        <>
          <p><strong>{t("user_id")}:</strong> {dataDetail._id}</p>
          <p><strong>{t("full_name")}:</strong> {dataDetail.fullName}</p>
          <p><strong>{t("email")}:</strong> {dataDetail.email}</p>
          <p><strong>{t("phone")}:</strong> {dataDetail.phone}</p>

          <p><strong>{t("avatar")}:</strong></p>

          <div className="avatar-box">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail.avatar}`}
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="avatar-img"
            />
          </div>

          <div className="upload-row">
            <label htmlFor="btnUpload" className="upload-btn">
              {t("upload_avatar")}
            </label>
            <input
              type="file"
              hidden
              id="btnUpload"
              onChange={handleOnChangeFile}
            />
          </div>

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
                {t("save")}
              </Button>
            </>
          )}
        </>
      ) : (
        <p>{t("no_data")}</p>
      )}
    </Drawer>
  );
};

export default ViewUserDetail;
