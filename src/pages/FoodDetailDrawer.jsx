import { useEffect, useState } from "react";
import { Drawer, Spin, Rate, Empty } from "antd";
import {
  fetchDishByIdAPI,
  fetchPostsByFoodAPI,
} from "../services/api.services";
import PostsFeedList from "../components/post/PostsFeedList";
import PostDetail from "../components/post/post.detail";

const formatPrice = (price) => {
  if (price == null) return "";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
};

const FoodDetailDrawer = ({ foodId, isOpen, onClose }) => {
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
    console.log("DEBUG res:", res);
    let list = [];
    if (Array.isArray(res?.data)) {
      list = res.data;
    } else if (Array.isArray(res?.data?.result)) {
      list = res.data.result;
    } else if (Array.isArray(res?.data?.data?.result)) {
      list = res.data.data.result;
    } else if (Array.isArray(res?.data?.data)) {
      list = res.data.data;
    }
    console.log("DEBUG list:", list);
    setPosts(list);
  } catch (error) {
    console.log("DEBUG error:", error);
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

  return (
    <>
      <Drawer
        width={"55vw"}
        title="Chi tiết món ăn"
        open={isOpen}
        onClose={handleClose}
      >
        {loadingDish ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : dish ? (
          <>
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
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
              <div>
                <h2 style={{ margin: 0 }}>{dish.name}</h2>
                <p style={{ color: "#666", margin: "8px 0" }}>
                  {dish.description}
                </p>
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
              Bài viết đánh giá món này ({posts.length})
            </h3>

            {loadingPosts ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : posts.length === 0 ? (
              <Empty description="Chưa có bài viết nào đánh giá món này" />
            ) : (
              <PostsFeedList
                posts={posts}
                onPostClick={handlePostClick}
                loading={false}
              />
            )}
          </>
        ) : (
          <p>Không tìm thấy món ăn</p>
        )}
      </Drawer>

      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isPostDetailOpen}
        setIsDetailOpen={setIsPostDetailOpen}
      />
    </>
  );
};

export default FoodDetailDrawer;