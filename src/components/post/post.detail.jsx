import {
  Button,
  Drawer,
  Empty,
  Input,
  Spin,
  notification,
} from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  createCommentAPI,
  deleteCommentAPI,
  fetchCommentsByPostAPI,
  fetchPostByIdAPI,
} from "../../services/api.services";
import UpdateCommentModal from "./updateComment.modal";
import CommentItem from "./CommentItem";
import "./postDetail.css";

const { TextArea } = Input;

const normalizeListData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.result)) return res.data.result;
  return [];
};

const normalizeComment = (comment) => {
  if (!comment) return comment;

  let userName = comment.user;
  if (!userName && typeof comment.user === 'object' && comment.user?.fullName) {
    userName = comment.user.fullName;
  } else if (!userName && typeof comment.user === 'object' && comment.user?.name) {
    userName = comment.user.name;
  }

  return {
    ...comment,
    user: userName || comment.username || comment.author || comment.fullName || comment.userId || "Anonymous",
  };
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
      console.log("Post detail from backend:", res.data);
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
    const comments = normalizeListData(res).map(normalizeComment);
    console.log("Comments from backend:", comments);
    console.log("Full response:", res);
    setComments(comments);
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    console.log("Current user:", user);
    console.log("User fullName:", user?.fullName);

    if (!user?.id) {
      notification.warning({
        message: "Chưa đăng nhập",
        description: "Bạn cần đăng nhập để bình luận",
      });
      return;
    }

    if (!user?.fullName?.trim()) {
      notification.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng cập nhật tên người dùng trước khi bình luận",
      });
      return;
    }

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
      user.fullName,
      user.id,
      user.avatar || ""
    );
    setSubmittingComment(false);

    if (res.data) {
      notification.success({
        message: "Bình luận",
        description: "Thêm bình luận thành công",
      });
      setCommentContent("");

      const newComment = {
        _id: res.data._id,
        postId: postDetail._id,
        content: commentContent,
        user: user.fullName,
        userId: user.id,
        avatar: user.avatar || "",
        createdAt: new Date().toISOString(),
      };

      setComments([...comments, newComment]);
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

  const handleUpdateCommentSuccess = (updatedComment) => {
    setComments(
      comments.map((c) =>
        c._id === updatedComment._id
          ? {
              ...c,
              ...updatedComment,
              user: updatedComment.user || c.user,
              avatar: updatedComment.avatar || c.avatar,
              userId: updatedComment.userId || c.userId,
            }
          : c
      )
    );
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
          <div className="comments-loading">
            <Spin />
          </div>
        ) : postDetail ? (
          <div className="post-detail-container">
            <div className="post-header">
              {postDetail.avatar && (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${postDetail.avatar}`}
                  alt={postDetail.author}
                  className="post-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div className="post-author-section">
                <span className="post-author-name">
                  {postDetail.author ||
                   (typeof postDetail.user === 'object' ? postDetail.user?.fullName : postDetail.user) ||
                   postDetail.userId ||
                   "Anonymous"}
                </span>
                <span className="post-meta">{formatDate(postDetail.createdAt)}</span>
              </div>
            </div>

            <div style={{ padding: "0 16px" }}>
              <h2 className="post-title">{postDetail.title}</h2>
              <p className="post-content">{postDetail.content}</p>

              {postDetail.image && (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/post/${postDetail.image}`}
                  alt={postDetail.title}
                  className="post-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>

            <hr className="divider" />

            <div style={{ padding: "0 16px" }}>
              <div className="comments-header">
                <span>Bình luận</span>
                <span className="comments-count">{comments.length}</span>
              </div>

              <div className="comment-input-section">
                {user?.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`}
                    alt={user.fullName}
                    className="comment-input-avatar"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="comment-input-avatar"
                    style={{
                      backgroundColor: user?.id ? "#1890ff" : "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {user?.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="comment-input-wrapper">
                  <TextArea
                    rows={3}
                    placeholder={user?.id ? "Viết bình luận..." : "Vui lòng đăng nhập để bình luận"}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    disabled={!user?.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey && user?.id) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    className="comment-button"
                    onClick={handleAddComment}
                    loading={submittingComment}
                    icon={<SendOutlined />}
                    disabled={!user?.id}
                  >
                    Gửi bình luận
                  </Button>
                </div>
              </div>

              {loadingComments ? (
                <div className="comments-loading">
                  <Spin />
                </div>
              ) : comments.length === 0 ? (
                <Empty description="Chưa có bình luận nào" />
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      isOwner={comment.userId === user?.id}
                      isPostAuthor={comment.userId === postDetail?.userId}
                      isCurrentUser={comment.userId === user?.id}
                      onEdit={(item) => {
                        setDataUpdateComment(item);
                        setIsModalUpdateCommentOpen(true);
                      }}
                      onDelete={handleDeleteComment}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-data">Không có dữ liệu</div>
        )}
      </Drawer>

      <UpdateCommentModal
        isModalUpdateOpen={isModalUpdateCommentOpen}
        setIsModalUpdateOpen={setIsModalUpdateCommentOpen}
        dataUpdate={dataUpdateComment}
        setDataUpdate={setDataUpdateComment}
        loadComments={loadComments}
        postId={postDetail?._id}
        onUpdateSuccess={handleUpdateCommentSuccess}
      />
    </>
  );
};

export default PostDetail;
