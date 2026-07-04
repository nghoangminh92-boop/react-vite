import { Input, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { handleUpdateFile, updatePostAPI } from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const UpdatePostModal = (props) => {
  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadPost,
  } = props;

  const { t } = useTranslation(); // ⭐ dùng i18n

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate._id);
      setTitle(dataUpdate.title);
      setContent(dataUpdate.content);
      setImage(dataUpdate.image || "");
      setAuthor(dataUpdate.author || "");
    }
  }, [dataUpdate]);

  const handleOnChangeFile = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitBtn = async () => {
    if (!title.trim()) {
      notification.warning({
        message: t("missing_title"),
        description: t("enter_title"),
      });
      return;
    }

    if (!content.trim()) {
      notification.warning({
        message: t("missing_content"),
        description: t("enter_content"),
      });
      return;
    }

    let imageName = image;

    if (selectedFile) {
      const resUpload = await handleUpdateFile(selectedFile, "post");
      if (resUpload.data) {
        imageName = resUpload.data.url;
      } else {
        notification.error({
          message: t("upload_error"),
          description: JSON.stringify(resUpload.message),
        });
        return;
      }
    }

    const res = await updatePostAPI(id, title, content, imageName, author);

    if (res.data) {
      notification.success({
        message: t("update_post"),
        description: t("update_post_success"),
      });
      resetAndCloseModal();
      await loadPost();
    } else {
      notification.error({
        message: t("update_post_error"),
        description: JSON.stringify(res.message),
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalUpdateOpen(false);
    setDataUpdate(null);
    setId("");
    setTitle("");
    setContent("");
    setImage("");
    setAuthor("");
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Modal
      title={t("update_post")}
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText={t("save")}
      cancelText={t("cancel")}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <span>{t("id")}</span>
          <Input value={id} disabled />
        </div>

        <div>
          <span>{t("title")}</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <span>{t("content")}</span>
          <TextArea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <span>{t("author")}</span>
          <Input value={author} disabled />
        </div>

        <div>
          <span>{t("post_image")}</span>
          <div style={{ marginTop: "10px" }}>
            <label
              htmlFor="btnUploadPostUpdate"
              style={{
                padding: "8px 16px",
                background: "#1677ff",
                color: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {t("choose_new_image")}
            </label>
            <input
              type="file"
              hidden
              id="btnUploadPostUpdate"
              accept="image/*"
              onChange={handleOnChangeFile}
            />
          </div>

          {(preview || image) && (
            <img
              src={
                preview ||
                (image?.startsWith("http")
                  ? image
                  : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`)
              }
              alt="preview"
              style={{
                marginTop: "10px",
                maxWidth: "200px",
                maxHeight: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePostModal;
