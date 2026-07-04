import { Empty, Spin, Popconfirm, notification } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { deletePostAPI } from "../../services/api.services";
import RatingDisplay from "./RatingDisplay";
import UpdatePostModal from "./updatePost.modal";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const PostsFeedList = ({
  posts,
  onPostClick,
  loading,
  currentUser,
  onPostDeleted,
  refreshKey
}) => {
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const canDelete = (post) => {
    if (!currentUser) return false;
    const uid = currentUser._id || currentUser.id;
    return currentUser.role === "ADMIN" || post.userId === uid;
  };

  const canEdit = (post) => {
    if (!currentUser) return false;
    const uid = currentUser._id || currentUser.id;
    return currentUser.role === "ADMIN" || post.userId === uid;
  };

  const handleDelete = async (id) => {
    const res = await deletePostAPI(id);
    if (res?.data) {
      notification.success({
        message: t("delete_post_success")
      });
      onPostDeleted?.();
    } else {
      notification.error({
        message: t("delete_post_error"),
        description: JSON.stringify(res?.message || t("error_occurred"))
      });
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <Empty description={t("no_posts")} />;
  }

  return (
    <div className="posts-feed-list">
      {posts.map((post) => (
        <div
          key={post._id}
          className="post-feed-card"
          onClick={() => onPostClick(post)}
        >
          {/* EDIT + DELETE BUTTONS */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              display: "flex",
              gap: 8,
              zIndex: 2
            }}
          >
            {canEdit(post) && (
              <div
                className="post-card-delete-btn"
                style={{ color: "#faad14", position: "static" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDataUpdate(post);
                  setIsModalUpdateOpen(true);
                }}
              >
                <EditOutlined />
              </div>
            )}

            {canDelete(post) && (
              <Popconfirm
                title={t("delete_post")}
                description={t("delete_post_confirm")}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(post._id);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText={t("delete")}
                cancelText={t("cancel")}
              >
                <div
                  className="post-card-delete-btn"
                  style={{ position: "static" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteOutlined />
                </div>
              </Popconfirm>
            )}
          </div>

          {/* IMAGE */}
          {post.image && (
            <img
              src={
                post.image?.startsWith("http")
                  ? post.image
                  : `${import.meta.env.VITE_BACKEND_URL}/images/${post.image}`
              }
              alt={post.title}
              className="post-card-image"
            />
          )}

          {/* CONTENT */}
          <div className="post-card-content">
            <h3 className="post-card-title">{post.title}</h3>
            <p className="post-card-excerpt">{truncateText(post.content)}</p>

            <div className="post-card-footer">
              <div className="post-card-author-info">
                {post.avatar && (
                  <img
                    src={
                      post.avatar?.startsWith("http")
                        ? post.avatar
                        : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${post.avatar}`
                    }
                    alt={post.author}
                    className="post-card-avatar"
                  />
                )}
                <span className="post-card-author">
                  {post.author || t("anonymous")}
                </span>
              </div>

              <span className="post-card-date">{formatDate(post.createdAt)}</span>
            </div>

            <RatingDisplay postId={post.foodId} refreshKey={refreshKey} />
          </div>
        </div>
      ))}

      <UpdatePostModal
        isModalUpdateOpen={isModalUpdateOpen}
        setIsModalUpdateOpen={setIsModalUpdateOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadPost={onPostDeleted}
      />
    </div>
  );
};

export default PostsFeedList;
