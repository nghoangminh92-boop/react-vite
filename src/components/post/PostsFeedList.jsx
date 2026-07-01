import { Empty, Spin } from "antd";

const PostsFeedList = ({ posts, onPostClick, loading }) => {
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading && posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <Empty description="Chưa có bài viết nào" />;
  }

  return (
    <div className="posts-feed-list">
      {posts.map((post) => (
        <div
          key={post._id}
          className="post-feed-card"
          onClick={() => onPostClick(post)}
        >
          {post.image && (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/${post.image}`}
              alt={post.title}
              className="post-card-image"
            />
          )}
          <div className="post-card-content">
            <h3 className="post-card-title">{post.title}</h3>
            <p className="post-card-excerpt">{truncateText(post.content)}</p>
            <div className="post-card-footer">
              <div className="post-card-author-info">
                {post.avatar && (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${post.avatar}`}
                    alt={post.author}
                    className="post-card-avatar"
                  />
                )}
                <span className="post-card-author">{post.author || "Anonymous"}</span>
              </div>
              <span className="post-card-date">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsFeedList;
