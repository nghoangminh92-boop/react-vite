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
      console.error("料理リストの読み込みエラー:", error);
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
      notification.warning({ message: "料理が未選択", description: "評価する料理を選んでください" });
      return;
    }
    if (!title.trim()) {
      notification.warning({ message: "タイトルが必要", description: "投稿のタイトルを入力してください" });
      return;
    }
    if (!content.trim()) {
      notification.warning({ message: "内容が必要", description: "投稿の内容を入力してください" });
      return;
    }
    if (!star) {
      notification.warning({ message: "評価が必要", description: "料理にスターをつけてください" });
      return;
    }

    let imageName = "";

    try {
      if (selectedFile) {
        const resUpload = await handleUpdateFile(selectedFile, "post");
        if (resUpload.data) {
          imageName = resUpload.data.url;
        } else {
          notification.error({ message: "アップロードエラー", description: JSON.stringify(resUpload.message) });
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
        try {
          await ratePostAPI(selectedFoodId, star);
        } catch (rateError) {
          notification.warning({
            message: "投稿を作成しました",
            description: "ただし評価の送信に失敗しました。投稿詳細から再度評価できます。",
          });
          resetAndCloseModal();
          await loadPost();
          return;
        }

        notification.success({ message: "投稿を作成", description: "投稿と評価を送信しました" });
        resetAndCloseModal();
        await loadPost();
      } else {
        notification.error({ message: "投稿作成エラー", description: JSON.stringify(res.message) });
      }
    } catch (error) {
      notification.error({ message: "投稿作成エラー", description: "ログインして有効なトークンが必要です。" });
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
        <h3 style={{ marginRight: "10px" }}>投稿一覧</h3>
        <Button onClick={() => setIsModalOpen(true)} type="primary">
          投稿を作成
        </Button>
      </div>

      <Modal
        title="新しい投稿を作成"
        open={isModalOpen}
        onOk={handleSubmitBtn}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        okText="作成"
        cancelText="キャンセル"
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <span>評価する料理</span>
            <Select
              style={{ width: "100%", marginTop: "5px" }}
              placeholder="料理を選択"
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
            <span>スター評価</span>
            <div style={{ marginTop: "5px" }}>
              <Rate value={star} onChange={(value) => setStar(value)} />
            </div>
          </div>

          <div>
            <span>タイトル</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <span>内容</span>
            <TextArea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div>
            <span>投稿画像</span>
            <div style={{ marginTop: "10px" }}>
              <Button onClick={() => fileInputRef.current?.click()}>画像を選択</Button>
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