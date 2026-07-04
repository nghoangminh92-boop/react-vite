import { Drawer, Divider, Tag } from "antd";
import {
  IdcardOutlined,
  FileTextOutlined,
  UserOutlined,
  AppstoreOutlined,
  DollarOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  PictureOutlined
} from "@ant-design/icons";

const FoodDetail = (props) => {
  const {
    dataDetail,
    setDataDetail,
    isDetailOpen,
    setIsDetailOpen
  } = props;

  return (
    <Drawer
      width={"40vw"}
      title="🍜 フード詳細"
      onClose={() => {
        setDataDetail(null);
        setIsDetailOpen(false);
      }}
      open={isDetailOpen}
      styles={{
        header: { fontSize: 20, fontWeight: 700 },
      }}
    >
      {dataDetail ? (
        <div style={{ lineHeight: "1.8", fontSize: 15 }}>

          {/* ID */}
          <Divider orientation="left">
            <IdcardOutlined /> 基本情報
          </Divider>
          <p><strong>ID:</strong> {dataDetail._id}</p>

          {/* Title */}
          <p>
            <strong><FileTextOutlined /> タイトル:</strong> {dataDetail.mainText}
          </p>

          {/* Author */}
          <p>
            <strong><UserOutlined /> 作者:</strong> {dataDetail.author}
          </p>

          {/* Category */}
          <p>
            <strong><AppstoreOutlined /> カテゴリー:</strong>{" "}
            <Tag color="blue">{dataDetail.category}</Tag>
          </p>

          <Divider orientation="left">
            <DollarOutlined /> 価格・数量
          </Divider>

          {/* Price */}
          <p>
            <strong>価格:</strong>{" "}
            {new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
            }).format(dataDetail.price)}
          </p>

          {/* Quantity */}
          <p>
            <strong><NumberOutlined /> 数量:</strong> {dataDetail.quantity}
          </p>

          {/* Sold */}
          <p>
            <strong><CheckCircleOutlined /> 販売数:</strong> {dataDetail.sold}
          </p>

          <Divider orientation="left">
            <PictureOutlined /> サムネイル
          </Divider>

          <div
            style={{
              marginTop: "10px",
              height: "140px",
              width: "200px",
              border: "1px solid #ddd",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <img
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${dataDetail.thumbnail}`}
              alt="thumbnail"
            />
          </div>
        </div>
      ) : (
        <p style={{ color: "#999" }}>データがありません</p>
      )}
    </Drawer>
  );
};

export default FoodDetail;
