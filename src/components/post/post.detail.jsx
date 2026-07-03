import {
  Button,
  Modal,
  Empty,
  Input,
  Spin,
  Popconfirm,
  notification,
  Rate,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth.context";
import {
  createCommentAPI,
  deleteCommentAPI,
  deletePostAPI,
  fetchCommentsByPostAPI,
  fetchPostByIdAPI,
  fetchDishByIdAPI,
  fetchPostRatingAPI,
  fetchUserRatingAPI,
  ratePostAPI,
} from "../../services/api.services";
import UpdateCommentModal from "./updateComment.modal";
import UpdatePostModal from "./updatePost.modal";
import "./postDetail.css";
const { TextArea } = Input;

const normalizeListData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.result)) return res.data.result;
  return [];
};

const PostDetail = (props) => {
  const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen, onRatingChanged } = props;
  const { user } = useContext(AuthContext);

  const [foodRating, setFoodRating] = useState(null);
  const [userStar, setUserStar] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const [postDetail, setPostDetail] = useState(null);
  const [foodInfo, setFoodInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [dataUpdateComment, setDataUpdateComment] = useState(null);
  const [isModalUpdateCommentOpen, setIsModalUpdateCommentOpen] = useState(false);

  const [dataUpdatePost, setDataUpdatePost] = useState(null);
  const [isModalUpdatePostOpen, setIsModalUpdatePostOpen] = useState(false);

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
      if (res.data.foodId) {
        loadFoodInfo(res.data.foodId);
      }
    } else {
      setPostDetail(dataDetail);
    }
    setLoadingPost(false);
    await loadComments(postId);
  };

  const loadFoodInfo = async (foodId) => {
    const res = await fetchDishByIdAPI(foodId);
    if (res?.data) {
      setFoodInfo(res.data);
    } else {
      setFoodInfo(null);
    }

    const resRating = await fetchPostRatingAPI(foodId);
    if (resRating?.data) {
      setFoodRating(resRating.data);
    } else {
      setFoodRating(null);
    }

    if (user) {
      const resUserRating = await fetchUserRatingAPI(foodId);
      if (resUserRating?.data?.star) {
        setUserStar(resUserRating.data.star);
      } else {
        setUserStar(0);
      }
    } else {
      setUserStar(0);
    }
  };

  const handleRateFood = async (value) => {
    if (!user) {
      notification.warning({
        message: "ログインが必要",
        description: "料理を評価するにはログインしてください",
      });
      return;
    }
    if (!postDetail?.foodId) return;

    setSubmittingRating(true);
    try {
      const res = await ratePostAPI(postDetail.foodId, value);
      if (res?.data || (res?.statusCode && res.statusCode < 400)) {
        setUserStar(value);
        notification.success({ message: "評価しました" });
        await loadFoodInfo(postDetail.foodId);
        onRatingChanged?.(postDetail.foodId);
      } else {
        notification.error({
          message: "評価エラー",
          description: JSON.stringify(res?.message || "エラーが発生しました"),
        });
      }
    } catch (error) {
      notification.error({
        message: "評価エラー",
        description: "エラーが発生しました。もう一度お試しください",
      });
    } finally {
      setSubmittingRating(false);
    }
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
        message: "内容が必要です",
        description: "コメント内容を入力してください",
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
        message: "コメント",
        description: "コメントを追加しました",
      });
      setCommentContent("");
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: "コメント追加エラー",
        description: JSON.stringify(res.message),
      });
    }
  };

  const handleDeleteComment = async (id) => {
    const res = await deleteCommentAPI(id);
    if (res.data) {
      notification.success({
        message: "コメントを削除",
        description: "コメントを削除しました",
      });
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: "コメント削除エラー",
        description: JSON.stringify(res.message),
      });
    }
  };

  const canDeletePost = () => {
    if (!user || !postDetail) return false;
    const uid = user._id || user.id;
    return user.role === "ADMIN" || postDetail.userId === uid;
  };

  const handleDeletePost = async () => {
    const res = await deletePostAPI(postDetail._id);
    if (res?.data) {
      notification.success({ message: "投稿を削除しました" });
      handleClose();
    } else {
      notification.error({
        message: "投稿削除エラー",
        description: JSON.stringify(res?.message || "エラーが発生しました"),
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("ja-JP");
  };

  const handleClose = () => {
    setDataDetail(null);
    setPostDetail(null);
    setFoodInfo(null);
    setFoodRating(null);
    setUserStar(0);
    setIsDetailOpen(false);
    setComments([]);
    setCommentContent("");
  };

  return (
    <>
      <Modal
        title={null}
        open={isDetailOpen}
        onCancel={handleClose}
        footer={null}
        centered
        width={640}
        style={{ maxWidth: "95vw" }}
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto", padding: "20px 24px" }}
      >
        {loadingPost ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin />
          </div>
        ) : postDetail ? (
          <div className="post-detail-container">
            <div className="post-header">
              {postDetail.avatar ? (
                <img
                  src={
                    postDetail.avatar?.startsWith("http")
                      ? postDetail.avatar
                      : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${postDetail.avatar}`
                  }
                  alt={postDetail.author}
                  className="post-avatar"
                />
              ) : (
                <div className="comment-avatar-fallback" style={{ width: 48, height: 48, fontSize: 18 }}>
                  {(postDetail.author || "A")[0].toUpperCase()}
                </div>
              )}
              <div className="post-author-section">
                <span className="post-author-name">{postDetail.author || "Anonymous"}</span>
              </div>

              {canDeletePost() && (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setDataUpdatePost(postDetail);
                      setIsModalUpdatePostOpen(true);
                    }}
                  >
                    編集
                  </Button>
                  <Popconfirm
                    title="投稿を削除"
                    description="この投稿を削除しますか？"
                    onConfirm={handleDeletePost}
                    okText="削除"
                    cancelText="キャンセル"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      削除
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </div>

            {foodInfo && (
              <div className="food-review-card">
                <div className="food-review-top">
                  <span className="food-review-icon">🍜</span>
                  <div className="food-review-info">
                    <span className="food-review-label">料理を評価</span>
                    <span className="food-review-name">{foodInfo.name}</span>
                  </div>
                  {foodRating && foodRating.total > 0 && (
                    <div className="food-review-avg">
                      <span className="food-review-avg-star">⭐ {foodRating.average}</span>
                      <span className="food-review-avg-count">({foodRating.total}件の評価)</span>
                    </div>
                  )}
                </div>

                <div className="food-review-bottom">
                  <span className="food-review-your-label">あなたの評価</span>
                  <Rate
                    value={userStar}
                    onChange={handleRateFood}
                    disabled={submittingRating}
                    className="food-review-rate"
                  />
                </div>
              </div>
            )}

            <div className="post-datetime">
              🕒<strong>{formatDate(postDetail.createdAt)}</strong>
            </div>
            <br />
            <p className="post-content">{postDetail.content}</p>

            {postDetail.image && (
              <img
                src={
                  postDetail.image?.startsWith("http")
                    ? postDetail.image
                    : `${import.meta.env.VITE_BACKEND_URL}/images/${postDetail.image}`
                }
                alt=""
                className="post-image"
              />
            )}

            <hr className="divider" />

            <div className="comments-section">
              <div className="comments-header">
                コメント
                <span className="comments-count">{comments.length}</span>
              </div>

              <div className="comment-input-section">
                {user?.avatar ? (
                  <img
                    src={
                      user.avatar?.startsWith("http")
                        ? user.avatar
                        : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`
                    }
                    alt=""
                    className="comment-input-avatar"
                  />
                ) : (
                  <div className="comment-avatar-fallback">
                    {(user?.fullName || "A")[0].toUpperCase()}
                  </div>
                )}
                <div className="comment-input-wrapper">
                  <TextArea
                    rows={2}
                    placeholder="コメントを入力..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <Button
                    type="primary"
                    className="comment-button"
                    onClick={handleAddComment}
                    loading={submittingComment}
                  >
                    送信
                  </Button>
                </div>
              </div>

              {loadingComments ? (
                <div className="comments-loading">
                  <Spin />
                </div>
              ) : comments.length === 0 ? (
                <div className="empty-state">
                  <Empty description={<span className="empty-state-text">まだコメントがありません</span>} />
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((item) => (
                    <div className="comment-item" key={item._id}>
                      {item.avatar ? (
                        <img
                          src={
                            item.avatar?.startsWith("http")
                              ? item.avatar
                              : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${item.avatar}`
                          }
                          alt={item.user}
                          className="comment-avatar"
                        />
                      ) : (
                        <div className="comment-avatar-fallback">
                          {(item.user || "A")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="comment-body">
                        <div className="comment-bubble">
                          <div className="comment-author-name">{item.user || "Anonymous"}</div>
                          <div className="comment-text">{item.content}</div>
                        </div>
                        <div className="comment-actions">
                          <span className="comment-time">{formatDate(item.createdAt)}</span>
                          <span
                            className="comment-action-btn"
                            onClick={() => {
                              setDataUpdateComment(item);
                              setIsModalUpdateCommentOpen(true);
                            }}
                          >
                            <EditOutlined /> 編集
                          </span>
                          <Popconfirm
                            title="コメントを削除"
                            description="このコメントを削除しますか？"
                            onConfirm={() => handleDeleteComment(item._id)}
                            okText="はい"
                            cancelText="いいえ"
                          >
                            <span className="comment-action-btn danger">
                              <DeleteOutlined /> 削除
                            </span>
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="no-data">データがありません</p>
        )}
      </Modal>

      <UpdateCommentModal
        isModalUpdateOpen={isModalUpdateCommentOpen}
        setIsModalUpdateOpen={setIsModalUpdateCommentOpen}
        dataUpdate={dataUpdateComment}
        setDataUpdate={setDataUpdateComment}
        loadComments={loadComments}
        postId={postDetail?._id}
      />

      <UpdatePostModal
        isModalUpdateOpen={isModalUpdatePostOpen}
        setIsModalUpdateOpen={setIsModalUpdatePostOpen}
        dataUpdate={dataUpdatePost}
        setDataUpdate={setDataUpdatePost}
        loadPost={async () => {
          await loadPostDetail(postDetail._id);
        }}
      />
    </>
  );
};

export default PostDetail;