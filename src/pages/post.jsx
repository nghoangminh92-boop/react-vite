import PostForm from "../components/post/post.form";
import PostTable from "../components/post/post.table";
import { fetchAllPostAPI } from "../services/api.services";
import { notification, Spin } from "antd";
import { useEffect, useState } from "react";

const parsePostListResponse = (res, current, pageSize) => {
  if (!res?.data) {
    return { posts: [], total: 0, current, pageSize };
  }

  // Backend trả dạng phân trang: { result: [], meta: {} }
  if (res.data.result && Array.isArray(res.data.result)) {
    return {
      posts: res.data.result,
      total: +res.data.meta?.total || res.data.result.length,
      current: +res.data.meta?.current || current,
      pageSize: +res.data.meta?.pageSize || pageSize,
    };
  }

  // Backend trả dạng mảng trực tiếp: data: []
  if (Array.isArray(res.data)) {
    const start = (current - 1) * pageSize;
    return {
      posts: res.data.slice(start, start + pageSize),
      total: res.data.length,
      current,
      pageSize,
    };
  }

  return { posts: [], total: 0, current, pageSize };
};

const PostPage = () => {
  const [dataPosts, setDataPosts] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await fetchAllPostAPI(current, pageSize);

      if (res?.statusCode && res.statusCode >= 400) {
        notification.error({
          message: "Lỗi tải bài viết",
          description: JSON.stringify(res.message),
        });
        setDataPosts([]);
        setTotal(0);
        return;
      }

      const { posts, total: totalCount, current: newCurrent, pageSize: newPageSize } =
        parsePostListResponse(res, current, pageSize);

      console.log("Posts from backend:", posts);
      setDataPosts(posts);
      setTotal(totalCount);
      setCurrent(newCurrent);
      setPageSize(newPageSize);
    } catch (error) {
      notification.error({
        message: "Lỗi kết nối",
        description: "Không thể kết nối backend. Hãy kiểm tra server đang chạy tại port 8080.",
      });
      setDataPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <PostForm loadPost={loadPost} />
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <PostTable
            dataPosts={dataPosts}
            loadPost={loadPost}
            current={current}
            pageSize={pageSize}
            total={total}
            setCurrent={setCurrent}
            setPageSize={setPageSize}
          />
        )}
      </div>
    </div>
  );
};

export default PostPage;
