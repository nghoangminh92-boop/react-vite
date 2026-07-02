import { useEffect, useState } from "react";
import { Empty, Spin, Rate, Tag } from "antd";
import { fetchMenuAPI } from "../services/api.services";

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    const res = await fetchMenuAPI();
    if (res?.data) {
      setMenu(res.data);
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    if (price == null) return "";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (menu.length === 0) {
    return <Empty description="Chưa có món ăn nào" style={{ marginTop: 60 }} />;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ marginBottom: 24 }}>Menu quán - Xếp hạng theo đánh giá</h2>

      {menu.map((item, index) => (
        <div
          key={item._id}
          style={{
            display: "flex",
            gap: 16,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #eee",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: "bold",
              minWidth: 32,
              color: index === 0 ? "#faad14" : "#999",
            }}
          >
            #{index + 1}
          </div>

          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{item.name}</h3>

            <p
              style={{
                color: "#666",
                margin: "4px 0",
                lineHeight: "1.4",
              }}
            >
              {item.description?.length > 120
                ? item.description.substring(0, 120) + "..."
                : item.description}
            </p>

            <div style={{ fontWeight: "bold", color: "#d4380d", marginBottom: 4 }}>
              {formatPrice(item.price)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Rate disabled allowHalf value={item.average} style={{ fontSize: 14 }} />
              <span style={{ fontSize: 13, color: "#888" }}>
                {item.average > 0
                  ? `${item.average} (${item.total} đánh giá)`
                  : "Chưa có đánh giá"}
              </span>

              {index < 3 && item.total > 0 && (
                <Tag color={index === 0 ? "gold" : index === 1 ? "silver" : "orange"}>
                  Top {index + 1}
                </Tag>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuPage;
