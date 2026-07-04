import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Tag } from "antd";
import "./commentItem.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const CommentItem = ({
  comment,
  isOwner,
  isPostAuthor,
  isCurrentUser,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const { t } = useTranslation();

  const formatRelativeTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("just_now");
    if (diffMins < 60) return `${diffMins}${t("minute_suffix")}`;
    if (diffHours < 24) return `${diffHours}${t("hour_suffix")}`;
    if (diffDays < 7) return `${diffDays}${t("day_suffix")}`;

    return formatDate(date);
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-user-info">
          {comment.avatar && (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${comment.avatar}`}
              alt={comment.user}
              className="comment-avatar"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          <div className="comment-meta">
            <div className="comment-user-name-section">
              <span className="comment-user-name">
                {comment.user || t("anonymous")}
              </span>

              {isPostAuthor && (
                <Tag color="blue" className="comment-badge">
                  {t("post_author")}
                </Tag>
              )}

              {isCurrentUser && !isPostAuthor && (
                <Tag color="green" className="comment-badge">
                  {t("you")}
                </Tag>
              )}
            </div>

            <span className="comment-time">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="comment-actions">
            <EditOutlined
              className="comment-icon edit-icon"
              onClick={() => onEdit(comment)}
              title={t("edit_comment")}
            />

            <Popconfirm
              title={t("delete_comment")}
              description={t("delete_comment_confirm")}
              onConfirm={() => onDelete(comment._id)}
              okText={t("yes")}
              cancelText={t("no")}
            >
              <DeleteOutlined
                className="comment-icon delete-icon"
                title={t("delete")}
              />
            </Popconfirm>
          </div>
        )}
      </div>

      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem;
