import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Tag } from "antd";
import "./commentItem.css";

const CommentItem = ({
  comment,
  isOwner,
  isPostAuthor,
  isCurrentUser,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const formatRelativeTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

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
              <span className="comment-user-name">{comment.user || "Anonymous"}</span>
              {isPostAuthor && (
                <Tag color="blue" className="comment-badge">
                  Tác giả bài viết
                </Tag>
              )}
              {isCurrentUser && !isPostAuthor && (
                <Tag color="green" className="comment-badge">
                  Bạn
                </Tag>
              )}
            </div>
            <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
          </div>
        </div>
        {isOwner && (
          <div className="comment-actions">
            <EditOutlined
              className="comment-icon edit-icon"
              onClick={() => onEdit(comment)}
              title="Chỉnh sửa"
            />
            <Popconfirm
              title="Xóa bình luận"
              description="Bạn chắc chắn xóa bình luận này?"
              onConfirm={() => onDelete(comment._id)}
              okText="Có"
              cancelText="Không"
            >
              <DeleteOutlined
                className="comment-icon delete-icon"
                title="Xóa"
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

