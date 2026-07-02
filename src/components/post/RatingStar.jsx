import { useEffect, useState, useContext } from "react";
import { Rate, notification, Spin } from "antd";
import { AuthContext } from "../context/auth.context";
import {
  ratePostAPI,
  fetchPostRatingAPI,
  fetchUserRatingAPI,
} from "../../services/api.services";

const RatingStar = (props) => {
  const { postId } = props;
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [userStar, setUserStar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadRating(postId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadRating = async (id) => {
    setLoading(true);
    const res = await fetchPostRatingAPI(id);
    if (res?.data) {
      setAverage(res.data.average);
      setTotal(res.data.total);
    }

    if (isLoggedIn) {
      const resUser = await fetchUserRatingAPI(id);
      if (resUser?.data) {
        setUserStar(resUser.data.star);
      }
    }
    setLoading(false);
  };

  const handleRate = async (value) => {
    if (!isLoggedIn) {
      notification.warning({
        message: "Chưa đăng nhập",
        description: "Bạn cần đăng nhập để đánh giá bài viết",
      });
      return;
    }
    setSubmitting(true);
    const res = await ratePostAPI(postId, value);
    setSubmitting(false);

    if (res?.data) {
      setAverage(res.data.average);
      setTotal(res.data.total);
      setUserStar(value);
      notification.success({
        message: "Đánh giá",
        description: "Cảm ơn bạn đã đánh giá!",
      });
    } else {
      notification.error({
        message: "Lỗi",
        description: JSON.stringify(res?.message || "Đánh giá thất bại"),
      });
    }
  };

  if (loading) return <Spin size="small" />;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
      <Rate
        value={userStar}
        onChange={handleRate}
        disabled={submitting}
        allowHalf={false}
      />
      <span>
        {average} / 5 ({total} lượt đánh giá)
      </span>
    </div>
  );
};

export default RatingStar;