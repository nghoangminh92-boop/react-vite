import { Input, Modal, notification } from "antd";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth.context";
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
    onUpdateSuccess,
  } = props;

  const { user } = useContext(AuthContext);

  const [id, setId] = useState("");
  const [content, setContent] = useState("");
  const [commentUser, setCommentUser] = useState("");

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate._id);
      setContent(dataUpdate.content || "");
      setCommentUser(dataUpdate.user || "");
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

    const res = await updateCommentAPI(id, content, user.fullName, user?.id, user?.avatar || "", postId);

    if (res.data) {
      notification.success({
        message: "Cập nhật bình luận",
        description: "Cập nhật bình luận thành công",
      });
      const updatedComment = {
        _id: id,
        content: content,
        user: user.fullName,
        userId: user?.id,
        avatar: user?.avatar || "",
        postId: postId,
      };
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedComment);
      }
      resetAndCloseModal();
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
    setCommentUser("");
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
          <Input value={commentUser} disabled />
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
