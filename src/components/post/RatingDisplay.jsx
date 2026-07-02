import { useEffect, useState } from "react";
import { Rate } from "antd";
import { fetchPostRatingAPI } from "../../services/api.services";

const RatingDisplay = ({ postId }) => {
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (postId) {
      loadRating(postId);
    }
  }, [postId]);

  const loadRating = async (id) => {
    const res = await fetchPostRatingAPI(id);
    if (res?.data) {
      setAverage(res.data.average);
      setTotal(res.data.total);
    }
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Rate disabled allowHalf value={average} style={{ fontSize: 14 }} />
      <span style={{ fontSize: 13, color: "#888" }}>
        {average > 0 ? `${average} (${total})` : "Chưa có đánh giá"}
      </span>
    </div>
  );
};

export default RatingDisplay;