import { Button, Input, Modal, notification, Select, Rate } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  createPostAPI,
  handleUpdateFile,
  fetchAllDishAPI,
  ratePostAPI,
} from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const PostForm = (props) => {
  const { loadPost } = props;
  const { user } = useContext(AuthContext);
  const { t } = useTranslation(); // ⭐ dùng i18n

  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dishOptions, setDishOptions] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [star, setStar] = useState(0);

  useEffect(() => {
    if (isModalOpen) {
      loadDishOptions();
    }
  }, [isModalOpen]);

  const loadDishOptions = async () => {
    try {
      const res = await fetchAllDishAPI();
      const list = Array.isArray(res?.data) ? res.data : [];
      setDishOptions(
        list.map((dish) => ({ label: dish.name, value: dish._id }))
      );
    } catch (error) {
      notification.error({
        message: t("load_dish_error"),
        description: t("load_dish_error_desc"),
      });
      setDishOptions([]);
    }
  };

  const handleOnChangeFile = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmitBtn = async () => {
    if (!selectedFoodId) {
      notification.warning({
        message: t("dish_required"),
        description: t("select_dish"),
      });
      return;
    }
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
    if (!star) {
      notification.warning({
        message: t("rating_required"),
        description: t("give_star"),
      });
      return;
    }

    let imageName = "";

    try {
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

      const res = await createPostAPI(
        title,
        content,
        imageName,
        user?.fullName || t("anonymous"),
        selectedFoodId
      );

      if (res.data) {
        try {
          await ratePostAPI(selectedFoodId, star);
        } catch (rateError) {
          notification.warning({
            message: t("post_created"),
            description: t("rating_failed"),
          });
          resetAndCloseModal();
          await loadPost();
          return;
        }

        notification.success({
          message: t("post_created"),
          description: t("post_and_rating_sent"),
        });
        resetAndCloseModal();
        await loadPost();
      } else {
        notification.error({
          message: t("post_create_error"),
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("post_create_error"),
        description: t("token_required"),
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setContent("");
    setSelectedFile(null);
    setPreview(null);
    setSelectedFoodId(null);
    setStar(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="post-form">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ marginRight: "10px" }}>{t("post_list")}</h3>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          {t("create_post")}
        </Button>
      </div>

      <Modal
        title={t("new_post")}
        open={isModalOpen}
        onOk={handleSubmitBtn}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        okText={t("create")}
        cancelText={t("cancel")}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <span>{t("choose_dish")}</span>
            <Select
              style={{ width: "100%", marginTop: "5px" }}
              placeholder={t("select_dish")}
              options={dishOptions}
              value={selectedFoodId}
              onChange={(value) => setSelectedFoodId(value)}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div>
            <span>{t("star_rating")}</span>
            <div style={{ marginTop: "5px" }}>
              <Rate value={star} onChange={(value) => setStar(value)} />
            </div>
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
            <span>{t("post_image")}</span>
            <div style={{ marginTop: "10px" }}>
              <Button onClick={() => fileInputRef.current?.click()}>
                {t("choose_image")}
              </Button>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleOnChangeFile}
              />
            </div>

            {preview && (
              <img
                src={preview}
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
    </div>
  );
};

export default PostForm;
