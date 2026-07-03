import {
  Button,
  Drawer,
  Empty,
  Input,
  List,
  Popconfirm,
  Spin,
  notification,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  createCommentAPI,
  deleteCommentAPI,
  fetchCommentsByPostAPI,
  fetchPostByIdAPI,
  fetchDishByIdAPI,
} from "../../services/api.services";
import UpdateCommentModal from "./updateComment.modal";
import RatingStar from "./RatingStar";
const { TextArea } = Input;

const normalizeListData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.result)) return res.data.result;
  return [];
};

const formatPrice = (price) => {
  if (price == null) return "";
  return price.toLocaleString("vi-VN") + " đ";
};

const PostDetail = (props) => {
  const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen } = props;
  const { user } = useContext(AuthContext);

  const [postDetail, setPostDetail] = useState(null);
  const [dishDetail, setDishDetail] = useState(null);
  const [loadingDish, setLoadingDish] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [dataUpdateComment, setDataUpdateComment] = useState(null);
  const [isModalUpdateCommentOpen, setIsModalUpdateCommentOpen] = useState(false);

  useEffect(() => {
    if (dataDetail?._id && isDetailOpen) {
      loadPostDetail(dataDetail._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetail?._id, isDetailOpen]);

  // const loadPostDetail = async (postId) => {
  //   setLoadingPost(true);
  //   const res = await fetchPostByIdAPI(postId);
  //   const detail = res?.data ? res.data : dataDetail;
  //   setPostDetail(detail);
  //   setLoadingPost(false);

  //   if (detail?.foodId) {
  //     await loadDishDetail(detail.foodId);
  //   }
  //   await loadComments(postId);
  // };

  const loadPostDetail = async (postId) => {
  setLoadingPost(true);

  try {
    const res = await fetchPostByIdAPI(postId);
    const detail = res?.data;

    setPostDetail(detail);

    // ⭐ Load món ăn + comment song song
    const promises = [];

    if (detail?.foodId) {
      promises.push(loadDishDetail(detail.foodId));
    }

    promises.push(loadComments(postId));

    await Promise.all(promises);
  } finally {
    setLoadingPost(false);
  }
};


  const loadDishDetail = async (foodId) => {
    setLoadingDish(true);
    try {
      const res = await fetchDishByIdAPI(foodId);
      setDishDetail(res?.data || null);
    } catch (error) {
      setDishDetail(null);
    }
    setLoadingDish(false);
  };

  const loadComments = async (postId) => {
    setLoadingComments(true);
    const res = await fetchCommentsByPostAPI(postId);
    setComments(normalizeListData(res));
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      notification.warning({
        message: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung bình luận",
      });
      return;
    }

    setSubmittingComment(true);
    const res = await createCommentAPI(
      postDetail._id,
      commentContent,
      user?.fullName || "Anonymous"
    );
    setSubmittingComment(false);

    if (res.data) {
      notification.success({
        message: "Bình luận",
        description: "Thêm bình luận thành công",
      });
      setCommentContent("");
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: "Error create comment",
        description: JSON.stringify(res.message),
      });
    }
  };

  const handleDeleteComment = async (id) => {
    const res = await deleteCommentAPI(id);
    if (res.data) {
      notification.success({
        message: "Xóa bình luận",
        description: "Xóa bình luận thành công",
      });
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: "Error delete comment",
        description: JSON.stringify(res.message),
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  const handleClose = () => {
    setDataDetail(null);
    setPostDetail(null);
    setDishDetail(null);
    setIsDetailOpen(false);
    setComments([]);
    setCommentContent("");
  };

  return (
    <>
      <Drawer
        width={"50vw"}
        title="Chi tiết bài viết"
        onClose={handleClose}
        open={isDetailOpen}
      >
        {loadingPost ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin />
          </div>
        ) : postDetail ? (
          <>
            {loadingDish ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="small" />
              </div>
            ) : dishDetail ? (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  marginBottom: 20,
                  background: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: 8,
                }}
              >
                {dishDetail.image && (
                  <img
                    src={
                      dishDetail.image?.startsWith("http")
                        ? dishDetail.image
                        : `${import.meta.env.VITE_BACKEND_URL}/images/${dishDetail.image}`
                    }
                    alt={dishDetail.name}
                    style={{
                      width: 90,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}
                <div>
                  <h4 style={{ margin: 0 }}>{dishDetail.name}</h4>
                  <p style={{ margin: "4px 0", color: "#666" }}>
                    {dishDetail.description}
                  </p>
                  <div style={{ fontWeight: "bold", color: "#d4380d" }}>
                    {formatPrice(dishDetail.price)}
                  </div>
                </div>
              </div>
            ) : null}
{/* 
            <p>
              <strong>ID:</strong> {postDetail._id}
            </p> */}
             <p>
  <strong>Món ăn:</strong> {dishDetail?.name || "Không tìm thấy món ăn"}
</p>
            <p>
              <strong>Tiêu đề:</strong> {postDetail.title}
            </p>
            <p>
              <strong>Tác giả:</strong> {postDetail.author}
            </p>
            <p>
              <strong>Ngày tạo:</strong> {formatDate(postDetail.createdAt)}
            </p>
           

            <p>
              <strong>Nội dung:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{postDetail.content}</p>

            {postDetail.image && (
              <>
                <p>
                  <strong>Ảnh:</strong>
                </p>
                <img
                  src={postDetail.image?.startsWith('http') ? postDetail.image : `${import.meta.env.VITE_BACKEND_URL}/images/${postDetail.image}`}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginBottom: "20px", 
                  }}
                />
              </>
            )}

            <RatingStar postId={postDetail.foodId} />

            <hr />
            <h4>Bình luận ({comments.length})</h4>

            <div style={{ marginBottom: "20px" }}>
              <TextArea
                rows={3}
                placeholder="Viết bình luận..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button
                type="primary"
                style={{ marginTop: "10px" }}
                onClick={handleAddComment}
                loading={submittingComment}
              >
                Gửi bình luận
              </Button>
            </div>

            {loadingComments ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : comments.length === 0 ? (
              <Empty description="Chưa có bình luận nào" />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={comments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <EditOutlined
                        key="edit"
                        onClick={() => {
                          setDataUpdateComment(item);
                          setIsModalUpdateCommentOpen(true);
                        }}
                        style={{ color: "orange", cursor: "pointer" }}
                      />,
                      <Popconfirm
                        key="delete"
                        title="Xóa bình luận"
                        description="Bạn chắc chắn xóa bình luận này?"
                        onConfirm={() => handleDeleteComment(item._id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <DeleteOutlined
                          style={{ color: "red", cursor: "pointer" }}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.avatar ? (
                          <img
                            src={item.avatar?.startsWith('http') ? item.avatar : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${item.avatar}`}
                            alt={item.user}
                            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "#1677ff", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: 16,
                          }}>
                            {(item.user || "A")[0].toUpperCase()}
                          </div>
                        )
                      }
                      title={item.user || "Anonymous"}
                      description={formatDate(item.createdAt)}
                    />
                    <p>{item.content}</p>
                  </List.Item>
                )}
              />
            )}
          </>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Drawer>

      <UpdateCommentModal
        isModalUpdateOpen={isModalUpdateCommentOpen}
        setIsModalUpdateOpen={setIsModalUpdateCommentOpen}
        dataUpdate={dataUpdateComment}
        setDataUpdate={setDataUpdateComment}
        loadComments={loadComments}
        postId={postDetail?._id}
      />
    </>
  );
};

export default PostDetail;