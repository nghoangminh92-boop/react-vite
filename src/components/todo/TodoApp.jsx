import "./todo.css";
import banner from "../../assets/banner.jpg";
import banner1 from "../../assets/banner1.jpg";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Input, notification } from "antd";
import { LeftOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import PostForm from "../post/post.form";
import PostsFeedList from "../post/PostsFeedList";
import PostDetail from "../post/post.detail";
import FoodDetailDrawer from "../../pages/FoodDetailDrawer";
import { AuthContext } from "../context/auth.context";
import { fetchAllPostAPI, fetchMenuAPI } from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

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

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

const SEARCH_ALIASES = {
  ramen: ["ラーメン", "らーめん"],
  pho: ["フォー", "ふぉー"],
};

const getSearchTerms = (value) => {
  const keyword = normalizeSearchText(value);
  return [keyword, ...(SEARCH_ALIASES[keyword] || [])].filter(Boolean);
};

const readPinnedAnnouncement = () => {
  try {
    const announcements = JSON.parse(localStorage.getItem("food-review-announcements") || "[]");
    if (!Array.isArray(announcements)) return null;

    return (
      announcements.find(
        (item) =>
          item.pinned &&
          (!item.expiresAt || new Date(`${item.expiresAt}T23:59:59`).getTime() >= Date.now())
      ) || null
    );
  } catch {
    return null;
  }
};

const TodoApp = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();   // ⭐ dùng i18n

  const [dataPosts, setDataPosts] = useState([]);
  const [dataMenu, setDataMenu] = useState([]);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState(null);
  const [homeSearch, setHomeSearch] = useState("");
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

  // ⭐ BANNER SLIDESHOW
  const bannerImages = [banner, banner1];
  const [bannerIndex, setBannerIndex] = useState(0);
  const slideshowTimer = useRef(null);

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
    startAutoSlide();
  };

  const goPrev = () => {
    setBannerIndex((prev) =>
      prev === 0 ? bannerImages.length - 1 : prev - 1
    );
    startAutoSlide();
  };

  useEffect(() => {
    loadPost();
    loadMenu();
    setPinnedAnnouncement(readPinnedAnnouncement());

    const handleAnnouncementUpdate = () => {
      setPinnedAnnouncement(readPinnedAnnouncement());
    };

    window.addEventListener("announcement-storage-updated", handleAnnouncementUpdate);
    window.addEventListener("storage", handleAnnouncementUpdate);
    window.addEventListener("focus", handleAnnouncementUpdate);

    return () => {
      window.removeEventListener("announcement-storage-updated", handleAnnouncementUpdate);
      window.removeEventListener("storage", handleAnnouncementUpdate);
      window.removeEventListener("focus", handleAnnouncementUpdate);
    };
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
          message: t("post_load_error"),
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
        message: t("connection_error"),
        description: t("backend_error"),
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

  const searchTerms = getSearchTerms(homeSearch);
  const searchKeyword = searchTerms[0] || "";

  const filteredMenu = dataMenu.filter((dish) => {
    const keyword = searchKeyword;
    if (!keyword) return true;

    return [dish.name, dish.description, dish.category]
      .filter(Boolean)
      .some((value) => {
        const normalizedValue = normalizeSearchText(value);
        return searchTerms.some((term) => normalizedValue.includes(term));
      });
  });

  const filteredPosts = dataPosts.filter((post) => {
    if (!searchKeyword) return true;

    return [post.title, post.content, post.author]
      .filter(Boolean)
      .some((value) => {
        const normalizedValue = normalizeSearchText(value);
        return searchTerms.some((term) => normalizedValue.includes(term));
      });
  });

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

        <button type="button" className="banner-btn left" onClick={goPrev}>
          <LeftOutlined />
        </button>

        <button type="button" className="banner-btn right" onClick={goNext}>
          <RightOutlined />
        </button>

        <div className="banner-text">
          <h1>{t("discover")}</h1>
          <p>{t("banner_sub")}</p>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={homeSearch}
            onChange={(event) => setHomeSearch(event.target.value)}
            placeholder={t("search_home")}
            aria-label={t("search_home")}
            className="home-search"
          />
        </div>
      </div>

      {pinnedAnnouncement && (
        <section className="pinned-announcement" aria-label={pinnedAnnouncement.title}>
          <div className="pinned-announcement-icon">!</div>
          <div>
            <strong>{pinnedAnnouncement.title}</strong>
            <p>{pinnedAnnouncement.content}</p>
          </div>
        </section>
      )}

      {/* FOOD LIST */}
      <div className="food-section">
        <div className="food-section-header">
          <h2 className="section-title">{t("menu")}</h2>

          {filteredMenu.length > 4 && (
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
          {filteredMenu.length > 0 ? (
            filteredMenu.map((dish) => (
              <div
                className="food-card"
                key={dish._id}
                onClick={() => handleFoodClick(dish._id)}
              >
                <img src={dish.image || banner1} alt={dish.name} />
                <h3>{dish.name}</h3>

                {dish.total > 0 ? (
                  <p className="rating">
                    ⭐ {(dish.average || 0).toFixed(1)} ({dish.total}{t("reviews")})
                  </p>
                ) : (
                  <p className="rating">{t("rating_none")}</p>
                )}
              </div>
            ))
          ) : (
            <p className="home-menu-empty">
              {homeSearch.trim() ? t("no_search_results") : t("no_food")}
            </p>
          )}
        </div>
      </div>

      {/* POSTS */}
      <div className="posts-section">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 className="section-title">{t("latest_posts")}</h2>
          {user?.id && <PostForm loadPost={() => loadPost(1)} />}
        </div>

        <PostsFeedList
          posts={filteredPosts}
          onPostClick={handlePostClick}
          loading={loading && dataPosts.length === 0}
          currentUser={user}
          onPostDeleted={() => loadPost(1)}
          refreshKey={ratingRefreshKey}
        />

        {dataPosts.length > 0 && dataPosts.length < total && (
          <div className="load-more-btn">
            <Button type="primary" size="large" onClick={handleLoadMore} loading={loading}>
              {t("see_more")}
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
