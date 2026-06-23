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
} from "../../services/api.services";
import UpdateCommentModal from "./updateComment.modal";

const { TextArea } = Input;

const normalizeListData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.result)) return res.data.result;
  return [];
};

const PostDetail = (props) => {
  const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen } = props;
  const { user } = useContext(AuthContext);

  const [postDetail, setPostDetail] = useState(null);
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

  const loadPostDetail = async (postId) => {
    setLoadingPost(true);
    const res = await fetchPostByIdAPI(postId);
    if (res?.data) {
      setPostDetail(res.data);
    } else {
      setPostDetail(dataDetail);
    }
    setLoadingPost(false);
    await loadComments(postId);
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

    console.log("User object:", user);
    setSubmittingComment(true);
    const res = await createCommentAPI(
      postDetail._id,
      commentContent,
      user?.fullName || "Anonymous",
      user?.id,
      user?.avatar || ""
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
            <p>
              <strong>ID:</strong> {postDetail._id}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              {postDetail.avatar && (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${postDetail.avatar}`}
                  alt={postDetail.author}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
              )}
              <div>
                <p style={{ margin: 0 }}>
                  <strong>Tác giả:</strong> {postDetail.author}
                </p>
                {postDetail.userId && (
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#999" }}>
                    ID: {postDetail.userId}
                  </p>
                )}
              </div>
            </div>
            <p>
              <strong>Tiêu đề:</strong> {postDetail.title}
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
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/post/${postDetail.image}`}
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
                        item.avatar && (
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${item.avatar}`}
                            alt={item.user}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #ddd",
                            }}
                          />
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
