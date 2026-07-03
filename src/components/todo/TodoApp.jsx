import "./todo.css";
import banner from "../../assets/banner.jpg";
import ramen1 from "../../assets/ramen1.jpg";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, notification } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import PostForm from "../post/post.form";
import PostsFeedList from "../post/PostsFeedList";
import PostDetail from "../post/post.detail";
import FoodDetailDrawer from "../../pages/FoodDetailDrawer";
import { AuthContext } from "../context/auth.context";
import { fetchAllPostAPI, fetchMenuAPI } from "../../services/api.services";

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

  return { posts: [], total: 0, current, pageSize };
};

const TodoApp = () => {
  const { user } = useContext(AuthContext);
  const [dataPosts, setDataPosts] = useState([]);
  const [dataMenu, setDataMenu] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [isFoodDrawerOpen, setIsFoodDrawerOpen] = useState(false);

  const [ratingRefreshKey, setRatingRefreshKey] = useState(0);

  const foodListRef = useRef(null);

  useEffect(() => {
    loadPost();
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMenu = async () => {
    try {
      const res = await fetchMenuAPI();
      if (Array.isArray(res?.data)) {
        setDataMenu(res.data);
      } else {
        setDataMenu([]);
      }
    } catch (error) {
      console.error("メニューの読み込みエラー:", error);
      setDataMenu([]);
    }
  };

  const loadPost = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchAllPostAPI(page, pageSize);

      if (res?.statusCode && res.statusCode >= 400) {
        notification.error({
          message: "投稿の読み込みエラー",
          description: JSON.stringify(res.message),
        });
        if (page === 1) setDataPosts([]);
        setLoading(false);
        return;
      }

      const { posts: newPosts, total: totalCount } = parsePostListResponse(
        res,
        page,
        pageSize
      );

      if (page === 1) {
        setDataPosts(newPosts);
        setCurrent(1);
      } else {
        setDataPosts((prev) => [...prev, ...newPosts]);
        setCurrent(page);
      }

      setTotal(totalCount);
    } catch (error) {
      notification.error({
        message: "接続エラー",
        description: "バックエンドに接続できません。サーバーを確認してください。",
      });
      if (page === 1) setDataPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadPost(current + 1);
  };

  const handlePostClick = (post) => {
    setDataDetail(post);
    setIsDetailOpen(true);
  };

  const handleFoodClick = (foodId) => {
    setSelectedFoodId(foodId);
    setIsFoodDrawerOpen(true);
  };

  const handleRatingChanged = () => {
    setRatingRefreshKey((k) => k + 1);
    loadMenu();
  };

  const scrollFoodList = (direction) => {
    if (!foodListRef.current) return;
    const scrollAmount = 240;
    foodListRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="home-container">

      {/* BANNER */}
      <div className="home-banner">
        <img src={banner} alt="banner" />
        <div className="banner-text">
          <h1>Discover the Best of Food</h1>
          <p>日本のラーメンを楽しもう</p>
        </div>
      </div>

      {/* FOOD LIST */}
      <div className="food-section">
        <div className="food-section-header">
          <h2 className="section-title">おすすめメニュー</h2>
          {dataMenu.length > 4 && (
            <div className="food-scroll-controls">
              <button
                className="food-scroll-btn"
                onClick={() => scrollFoodList("left")}
                aria-label="左にスクロール"
              >
                <LeftOutlined />
              </button>
              <button
                className="food-scroll-btn"
                onClick={() => scrollFoodList("right")}
                aria-label="右にスクロール"
              >
                <RightOutlined />
              </button>
            </div>
          )}
        </div>

        <div className="food-list" ref={foodListRef}>
          {dataMenu.length > 0 ? (
            dataMenu.map((dish) => (
              <div
                className="food-card"
                key={dish._id}
                onClick={() => handleFoodClick(dish._id)}
              >
                <img src={dish.image || ramen1} alt={dish.name} />
                <h3>{dish.name}</h3>
                {dish.total > 0 ? (
                  <p className="rating">
                    ⭐ {(dish.average || 0).toFixed(1)} ({dish.total}件の評価)
                  </p>
                ) : (
                  <p className="rating">まだ評価がありません</p>
                )}
              </div>
            ))
          ) : (
            <p>料理がありません</p>
          )}
        </div>
      </div>

      {/* POSTS FEED SECTION */}
      <div className="posts-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="section-title">最新の投稿</h2>
          {user?.id && <PostForm loadPost={() => loadPost(1)} />}
        </div>

        <PostsFeedList
          posts={dataPosts}
          onPostClick={handlePostClick}
          loading={loading && dataPosts.length === 0}
          currentUser={user}
          onPostDeleted={() => loadPost(1)}
          refreshKey={ratingRefreshKey}
        />

        {dataPosts.length > 0 && dataPosts.length < total && (
          <div className="load-more-btn">
            <Button type="primary" size="large" onClick={handleLoadMore} loading={loading}>
              もっと見る
            </Button>
          </div>
        )}
      </div>

      {/* POST DETAIL MODAL */}
      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        onRatingChanged={handleRatingChanged}
      />

      {/* FOOD DETAIL DRAWER */}
      <FoodDetailDrawer
        foodId={selectedFoodId}
        isOpen={isFoodDrawerOpen}
        onClose={() => setIsFoodDrawerOpen(false)}
        currentUser={user}
        onRatingChanged={handleRatingChanged}
        refreshKey={ratingRefreshKey}
      />
    </div>
  );
};

export default TodoApp;