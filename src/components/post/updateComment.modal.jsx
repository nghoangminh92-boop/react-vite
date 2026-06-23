import { Input, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { updateCommentAPI } from "../../services/api.services";

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
        message: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung bình luận",
      });
      return;
    }

    const res = await updateCommentAPI(id, content, user);

    if (res.data) {
      notification.success({
        message: "Cập nhật bình luận",
        description: "Cập nhật bình luận thành công",
      });
      resetAndCloseModal();
      await loadComments(postId);
    } else {
      notification.error({
        message: "Error update comment",
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
      title="Cập nhật bình luận"
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText="LƯU"
      cancelText="HỦY"
      width={500}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <span>Người bình luận</span>
          <Input value={user} disabled />
        </div>

        <div>
          <span>Nội dung</span>
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
