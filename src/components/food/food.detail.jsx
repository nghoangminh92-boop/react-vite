import { Drawer } from "antd";

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
      title="Chi tiết Food"
      onClose={() => {
        setDataDetail(null);
        setIsDetailOpen(false);
      }}
      open={isDetailOpen}
    >
      {dataDetail ? (
        <>
          <p>ID: {dataDetail._id}</p>
          <br />

          <p>Tiêu đề: {dataDetail.mainText}</p>
          <br />

          <p>Tác giả: {dataDetail.author}</p>
          <br />

          <p>Thể loại: {dataDetail.category}</p>
          <br />

          <p>
            Giá tiền:{" "}
            {new Intl.NumberFormat("ja-JP", {
              style: "currency",
              currency: "JPY",
            }).format(dataDetail.price)}
          </p>
          <br />

          <p>Số lượng: {dataDetail.quantity}</p>
          <br />

          <p>Đã bán: {dataDetail.sold}</p>
          <br />

          <p>Thumbnail:</p>
          <div
            style={{
              marginTop: "10px",
              height: "100px",
              width: "150px",
              border: "1px solid #ccc",
            }}
          >
            <img
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
              }}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${dataDetail.thumbnail}`}
              alt=""
            />
          </div>
        </>
      ) : (
        <p>Không có dữ liệu</p>
      )}
    </Drawer>
  );
};

export default FoodDetail;
