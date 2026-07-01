import { Input, Modal, notification } from "antd";
import { useEffect, useState } from "react";
import { handleUpdateFile, updatePostAPI } from "../../services/api.services";

const { TextArea } = Input;

const UpdatePostModal = (props) => {
  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadPost,
  } = props;

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

    let imageName = image;

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

    const res = await updatePostAPI(id, title, content, imageName, author);

    if (res.data) {
      notification.success({
        message: "Update post",
        description: "Cập nhật bài viết thành công",
      });
      resetAndCloseModal();
      await loadPost();
    } else {
      notification.error({
        message: "Error update post",
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
      title="Cập nhật bài viết"
      open={isModalUpdateOpen}
      onOk={handleSubmitBtn}
      onCancel={resetAndCloseModal}
      maskClosable={false}
      okText="LƯU"
      cancelText="HỦY"
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <span>Id</span>
          <Input value={id} disabled />
        </div>

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
          <span>Tác giả</span>
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>

        <div>
          <span>Ảnh bài viết</span>
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
              Chọn ảnh mới
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
                `${import.meta.env.VITE_BACKEND_URL}/images/images/${image}`
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
