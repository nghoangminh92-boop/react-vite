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
import TranslateButton from "./TranslateButton";
import "./postDetail.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

// Map mã ngôn ngữ i18next -> locale dùng cho Date.toLocaleString
const LOCALE_MAP = {
  ja: "ja-JP",
  vi: "vi-VN",
  en: "en-US",
};

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

  const { t, i18n } = useTranslation(); // ⭐ dùng i18n

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
        message: t("login_required"),
        description: t("login_required_to_rate"),
      });
      return;
    }
    if (!postDetail?.foodId) return;

    setSubmittingRating(true);
    try {
      const res = await ratePostAPI(postDetail.foodId, value);
      if (res?.data || (res?.statusCode && res.statusCode < 400)) {
        setUserStar(value);
        notification.success({ message: t("rating_success") });
        await loadFoodInfo(postDetail.foodId);
        onRatingChanged?.(postDetail.foodId);
      } else {
        notification.error({
          message: t("rating_error"),
          description: JSON.stringify(res?.message || t("generic_error")),
        });
      }
    } catch (error) {
      notification.error({
        message: t("rating_error"),
        description: t("generic_error_retry"),
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
        message: t("missing_comment"),
        description: t("enter_comment_content"),
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
        message: t("comment"),
        description: t("comment_added"),
      });
      setCommentContent("");
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: t("comment_add_error"),
        description: JSON.stringify(res.message),
      });
    }
  };

  const handleDeleteComment = async (id) => {
    const res = await deleteCommentAPI(id);
    if (res.data) {
      notification.success({
        message: t("delete_comment"),
        description: t("comment_deleted"),
      });
      await loadComments(postDetail._id);
    } else {
      notification.error({
        message: t("comment_delete_error"),
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
      notification.success({ message: t("post_deleted") });
      handleClose();
    } else {
      notification.error({
        message: t("post_delete_error"),
        description: JSON.stringify(res?.message || t("generic_error")),
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const locale = LOCALE_MAP[i18n.language] || i18n.language || "ja-JP";
    return new Date(date).toLocaleString(locale);
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
                <span className="post-author-name">{postDetail.author || t("anonymous")}</span>
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
                    {t("edit")}
                  </Button>
                  <Popconfirm
                    title={t("delete_post")}
                    description={t("delete_post_confirm")}
                    onConfirm={handleDeletePost}
                    okText={t("delete")}
                    cancelText={t("cancel")}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      {t("delete")}
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
                    <span className="food-review-label">{t("rate_food")}</span>
                    <span className="food-review-name">{foodInfo.name}</span>
                  </div>
                  {foodRating && foodRating.total > 0 && (
                    <div className="food-review-avg">
                      <span className="food-review-avg-star">⭐ {foodRating.average}</span>
                      <span className="food-review-avg-count">
                        {t("rating_count", { count: foodRating.total })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="food-review-bottom">
                  <span className="food-review-your-label">{t("your_rating")}</span>
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

            {/* NỘI DUNG BÀI VIẾT - có nút dịch */}
            <div className="post-content">
              <TranslateButton text={postDetail.content} />
            </div>

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
                {t("comment")}
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
                    placeholder={t("comment_placeholder")}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <Button
                    type="primary"
                    className="comment-button"
                    onClick={handleAddComment}
                    loading={submittingComment}
                  >
                    {t("send")}
                  </Button>
                </div>
              </div>

              {loadingComments ? (
                <div className="comments-loading">
                  <Spin />
                </div>
              ) : comments.length === 0 ? (
                <div className="empty-state">
                  <Empty description={<span className="empty-state-text">{t("no_comments")}</span>} />
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
                          <div className="comment-author-name">{item.user || t("anonymous")}</div>
                          {/* NỘI DUNG BÌNH LUẬN - có nút dịch */}
                          <div className="comment-text">
                            <TranslateButton text={item.content} />
                          </div>
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
                            <EditOutlined /> {t("edit")}
                          </span>
                          <Popconfirm
                            title={t("delete_comment")}
                            description={t("delete_comment_confirm")}
                            onConfirm={() => handleDeleteComment(item._id)}
                            okText={t("yes")}
                            cancelText={t("no")}
                          >
                            <span className="comment-action-btn danger">
                              <DeleteOutlined /> {t("delete")}
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
          <p className="no-data">{t("no_data")}</p>
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