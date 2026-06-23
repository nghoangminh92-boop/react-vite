import { Button, Input, Modal, notification } from "antd";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { createPostAPI, handleUpdateFile } from "../../services/api.services";

const { TextArea } = Input;

const PostForm = (props) => {
  const { loadPost } = props;
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        message: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề bài viết",
      });
      return;
    }

    if (!content.trim()) {
      notification.warning({
        message: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung bài viết",
      });
      return;
    }

    let imageName = "";

    try {
      if (selectedFile) {
        const resUpload = await handleUpdateFile(selectedFile, "post");
        if (resUpload.data) {
          imageName = resUpload.data.fileUploaded;
        } else {
          notification.error({
            message: "Error upload file",
            description: JSON.stringify(resUpload.message),
          });
          return;
        }
      }

      const res = await createPostAPI(
        title,
        content,
        imageName,
        user?.fullName || "Anonymous",
        user?.id,
        user?.avatar || ""
      );

      if (res.data) {
        notification.success({
          message: "Create post",
          description: "Tạo bài viết thành công",
        });
        resetAndCloseModal();
        await loadPost();
      } else {
        notification.error({
          message: "Error create post",
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi tạo bài viết",
        description: "Bạn cần đăng nhập và có token hợp lệ để tạo bài viết.",
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setContent("");
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="post-form">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Danh sách bài viết</h3>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          Tạo bài viết
        </Button>
      </div>

      <Modal
        title="Tạo bài viết mới"
        open={isModalOpen}
        onOk={handleSubmitBtn}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        okText="TẠO"
        cancelText="HỦY"
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <span>Tiêu đề</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <span>Nội dung</span>
            <TextArea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <span>Ảnh bài viết</span>
            <div style={{ marginTop: "10px" }}>
              <label
                htmlFor="btnUploadPost"
                style={{
                  padding: "8px 16px",
                  background: "#1677ff",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Chọn ảnh
              </label>
              <input
                type="file"
                hidden
                id="btnUploadPost"
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
