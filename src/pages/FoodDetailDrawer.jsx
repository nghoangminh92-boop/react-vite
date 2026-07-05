import { useEffect, useState } from "react";
import { Modal, Spin, Empty } from "antd";
import {
  fetchDishByIdAPI,
  fetchPostsByFoodAPI,
} from "../services/api.services";
import PostsFeedList from "../components/post/PostsFeedList";
import PostDetail from "../components/post/post.detail";
import './translateButton.css';

// ⭐ i18n
import { useTranslation } from "react-i18next";

// ⭐ nút dịch
import TranslateButton from "../components/common/TranslateButton";



const formatPrice = (price) => {
  if (price == null) return "";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
};

const FoodDetailDrawer = ({
  foodId,
  isOpen,
  onClose,
  currentUser,
  onRatingChanged,
  refreshKey,
}) => {
  const { t } = useTranslation(); // ⭐ dùng i18n

  const [dish, setDish] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingDish, setLoadingDish] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [dataDetail, setDataDetail] = useState(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  useEffect(() => {
    if (foodId && isOpen) {
      loadDish(foodId);
      loadPosts(foodId);
    }
  }, [foodId, isOpen]);

  const loadDish = async (id) => {
    setLoadingDish(true);
    try {
      const res = await fetchDishByIdAPI(id);
      setDish(res?.data || null);
    } catch (error) {
      setDish(null);
    }
    setLoadingDish(false);
  };

  const loadPosts = async (id) => {
    setLoadingPosts(true);
    try {
      const res = await fetchPostsByFoodAPI(id);
      let list = [];

      if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.result)) list = res.data.result;
      else if (Array.isArray(res?.data?.data?.result)) list = res.data.data.result;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setPosts(list);
    } catch (error) {
      setPosts([]);
    }
    setLoadingPosts(false);
  };

  const handleClose = () => {
    setDish(null);
    setPosts([]);
    onClose();
  };

  const handlePostClick = (post) => {
    setDataDetail(post);
    setIsPostDetailOpen(true);
  };

  const handleLocalRatingChanged = (changedFoodId) => {
    loadDish(changedFoodId);
    loadPosts(changedFoodId);
    onRatingChanged?.(changedFoodId);
  };

  return (
    <>
      <Modal
        title={t("dish_detail")}
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        centered
        width={700}
        style={{ maxWidth: "95vw" }}
        bodyStyle={{ maxHeight: "75vh", overflowY: "auto" }}
      >
        {loadingDish ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : dish ? (
          <>
            <div
              style={{
                display: "flex",
                gap: 20,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              {dish.image && (
                <img
                  src={dish.image}
                  alt={dish.name}
                  style={{
                    width: 160,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ margin: 0 }}>{dish.name}</h2>

                {/* ⭐ MÔ TẢ MÓN ĂN */}
                <p style={{ color: "#666", margin: "8px 0" }}>
                  {dish.description}
                </p>

                {/* ⭐ NÚT DỊCH MÔ TẢ MÓN ĂN */}
                <TranslateButton text={dish.description} />

                <div
                  style={{
                    fontWeight: "bold",
                    color: "#d4380d",
                    fontSize: 18,
                    marginBottom: 8,
                  }}
                >
                  {formatPrice(dish.price)}
                </div>
              </div>
            </div>

            <hr />

            <h3 style={{ margin: "20px 0 12px" }}>
              {t("dish_reviews")} ({posts.length}{t("reviews_count")})
            </h3>

            {loadingPosts ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : posts.length === 0 ? (
              <Empty description={t("no_dish_reviews")} />
            ) : (
              <PostsFeedList
                posts={posts}
                onPostClick={handlePostClick}
                loading={false}
                currentUser={currentUser}
                onPostDeleted={() => loadPosts(foodId)}
                refreshKey={refreshKey}
              />
            )}
          </>
        ) : (
          <p>{t("dish_not_found")}</p>
        )}
      </Modal>

      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isPostDetailOpen}
        setIsDetailOpen={setIsPostDetailOpen}
        onRatingChanged={handleLocalRatingChanged}
      />
    </>
  );
};

export default FoodDetailDrawer;
