import { Button, Input, Modal, notification, Select, Rate } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  createPostAPI,
  handleUpdateFile,
  fetchAllDishAPI,
  ratePostAPI,
} from "../../services/api.services";

const { TextArea } = Input;

const PostForm = (props) => {
  const { loadPost } = props;
  const { user } = useContext(AuthContext);
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
      console.error("Lỗi khi tải danh sách món ăn:", error);
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
      notification.warning({ message: "Thiếu món ăn", description: "Vui lòng chọn món ăn muốn đánh giá" });
      return;
    }
    if (!title.trim()) {
      notification.warning({ message: "Thiếu tiêu đề", description: "Vui lòng nhập tiêu đề bài viết" });
      return;
    }
    if (!content.trim()) {
      notification.warning({ message: "Thiếu nội dung", description: "Vui lòng nhập nội dung bài viết" });
      return;
    }
    if (!star) {
      notification.warning({ message: "Thiếu đánh giá", description: "Vui lòng chấm sao cho món ăn" });
      return;
    }

    let imageName = "";

    try {
      if (selectedFile) {
        const resUpload = await handleUpdateFile(selectedFile, "post");
        if (resUpload.data) {
          imageName = resUpload.data.url;
        } else {
          notification.error({ message: "Error upload file", description: JSON.stringify(resUpload.message) });
          return;
        }
      }

      const res = await createPostAPI(
        title,
        content,
        imageName,
        user?.fullName || "Anonymous",
        selectedFoodId
      );

      if (res.data) {
        // Gửi đánh giá kèm theo ngay sau khi tạo bài viết thành công
        try {
          await ratePostAPI(selectedFoodId, star);
        } catch (rateError) {
          notification.warning({
            message: "Tạo bài viết thành công",
            description: "Nhưng gửi đánh giá thất bại, bạn có thể đánh giá lại trong chi tiết bài viết.",
          });
          resetAndCloseModal();
          await loadPost();
          return;
        }

        notification.success({ message: "Tạo bài viết", description: "Tạo bài viết và đánh giá thành công" });
        resetAndCloseModal();
        await loadPost();
      } else {
        notification.error({ message: "Error create post", description: JSON.stringify(res.message) });
      }
    } catch (error) {
      notification.error({ message: "Lỗi tạo bài viết", description: "Bạn cần đăng nhập và có token hợp lệ." });
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
            <span>Món ăn đánh giá</span>
            <Select
              style={{ width: "100%", marginTop: "5px" }}
              placeholder="Chọn món ăn"
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
            <span>Chấm sao đánh giá</span>
            <div style={{ marginTop: "5px" }}>
              <Rate value={star} onChange={(value) => setStar(value)} />
            </div>
          </div>

          <div>
            <span>Tiêu đề</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <span>Nội dung</span>
            <TextArea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div>
            <span>Ảnh bài viết</span>
            <div style={{ marginTop: "10px" }}>
              <Button onClick={() => fileInputRef.current?.click()}>Chọn ảnh</Button>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleOnChangeFile}
              />
            </div>
            {preview && (
              <img src={preview} alt="preview" style={{ marginTop: "10px", maxWidth: "200px", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }} />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostForm;