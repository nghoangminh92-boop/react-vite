import PostForm from "../components/post/post.form";
import PostTable from "../components/post/post.table";
import { fetchAllPostAPI } from "../services/api.services";
import { notification, Spin } from "antd";
import { useEffect, useState } from "react";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const parsePostListResponse = (res, current, pageSize) => {
  if (!res?.data) {
    return { posts: [], total: 0, current, pageSize };
  }

  if (res.data.result && Array.isArray(res.data.result)) {
    return {
      posts: res.data.result,
      total: +res.data.meta?.total || res.data.result.length,
      current: +res.data.meta?.current || current,
      pageSize: +res.data.meta?.pageSize || pageSize,
    };
  }

  if (Array.isArray(res.data)) {
    const start = (current - 1) * pageSize;
    return {
      posts: res.data.slice(start, start + pageSize),
      total: res.data.length,
      current,
      pageSize,
    };
  }

  if (typeof res.data === "object") {
    const posts = Object.keys(res.data)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => +a - +b)
      .map((key) => res.data[key]);

    return {
      posts,
      total: posts.length,
      current,
      pageSize,
    };
  }

  return { posts: [], total: 0, current, pageSize };
};

const PostPage = () => {
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [dataPosts, setDataPosts] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPost();
  }, [current, pageSize]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await fetchAllPostAPI(current, pageSize);

      if (res?.statusCode && res.statusCode >= 400) {
        notification.error({
          message: t("post_load_error"),
          description: JSON.stringify(res.message),
        });
        setDataPosts([]);
        setTotal(0);
        return;
      }

      const {
        posts,
        total: totalCount,
        current: newCurrent,
        pageSize: newPageSize,
      } = parsePostListResponse(res, current, pageSize);

      setDataPosts(posts);
      setTotal(totalCount);
      setCurrent(newCurrent);
      setPageSize(newPageSize);
    } catch (error) {
      notification.error({
        message: t("connection_error"),
        description: t("backend_not_running"),
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
            <p style={{ marginTop: 10 }}>{t("loading_posts")}</p>
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
