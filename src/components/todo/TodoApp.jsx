import "./todo.css";
import banner from "../../assets/banner.jpg";
import banner1 from "../../assets/banner1.jpg";
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
  if (!res?.data) return { posts: [], total: 0, current, pageSize };

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

  // ⭐ BANNER SLIDESHOW FIXED VERSION
const bannerImages = [
  banner,
  banner1,
];

const [bannerIndex, setBannerIndex] = useState(0);
const slideshowTimer = useRef(null);

// ⭐ Auto slideshow + reset khi bấm nút
useEffect(() => {
  startAutoSlide();
  return () => stopAutoSlide();
}, []);

const startAutoSlide = () => {
  stopAutoSlide();
  slideshowTimer.current = setInterval(() => {
    setBannerIndex((prev) => (prev + 1) % bannerImages.length);
  }, 4000);
};

const stopAutoSlide = () => {
  if (slideshowTimer.current) clearInterval(slideshowTimer.current);
};

const goNext = () => {
  setBannerIndex((prev) => (prev + 1) % bannerImages.length);
  startAutoSlide(); // reset timer
};

const goPrev = () => {
  setBannerIndex((prev) =>
    prev === 0 ? bannerImages.length - 1 : prev - 1
  );
  startAutoSlide(); // reset timer
};


  useEffect(() => {
    loadPost();
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await fetchMenuAPI();
      setDataMenu(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setDataMenu([]);
    }
  };

  const loadPost = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchAllPostAPI(page, pageSize);

      if (res?.statusCode >= 400) {
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
    } catch {
      notification.error({
        message: "接続エラー",
        description: "バックエンドに接続できません。",
      });
      if (page === 1) setDataPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => loadPost(current + 1);

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

      {/* ⭐ SLIDESHOW BANNER */}
      <div className="home-banner">
  <img
    src={bannerImages[bannerIndex]}
    alt="banner"
    className="banner-image"
  />

  <button
    type="button"
    className="banner-btn left"
    onClick={goPrev}
  >
    <LeftOutlined />
  </button>

  <button
    type="button"
    className="banner-btn right"
    onClick={goNext}
  >
    <RightOutlined />
  </button>

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
              <button className="food-scroll-btn" onClick={() => scrollFoodList("left")}>
                <LeftOutlined />
              </button>
              <button className="food-scroll-btn" onClick={() => scrollFoodList("right")}>
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
                <img src={dish.image || banner1} alt={dish.name} />
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

      {/* POSTS */}
      <div className="posts-section">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
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

      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        onRatingChanged={handleRatingChanged}
      />

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
