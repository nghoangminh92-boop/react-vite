import { Input, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { updateCommentAPI } from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const UpdateCommentModal = (props) => {
  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadComments,
    postId,
  } = props;

  const { t } = useTranslation(); // ⭐ dùng i18n

  const [id, setId] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate._id);
      setContent(dataUpdate.content || "");
      setUser(dataUpdate.user || "");
    }
  }, [dataUpdate]);

  const handleSubmitBtn = async () => {
    if (!content.trim()) {
      notification.warning({
        message: t("missing_comment_content"),
        description: t("enter_comment_content"),
      });
      return;
    }

    const res = await updateCommentAPI(id, content, user);

    if (res.data) {
      notification.success({
        message: t("update_comment"),
        description: t("update_comment_success"),
      });
      resetAndCloseModal();
      await loadComments(postId);
    } else {
      notification.error({
        message: t("update_comment_error"),
        description: JSON.stringify(res.message),
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalUpdateOpen(false);
    setDataUpdate(null);
    setId("");
    setContent("");
    setUser("");
  };

  return (
    <Modal
      title={t("update_comment")}
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText={t("save")}
      cancelText={t("cancel")}
      width={500}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <span>{t("comment_user")}</span>
          <Input value={user} disabled />
        </div>

        <div>
          <span>{t("comment_content")}</span>
          <TextArea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UpdateCommentModal;
