import { useEffect, useState } from "react";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, notification, Popconfirm, Table } from "antd";
import FoodDetail from "./food.detail";

const FoodTable = () => {
  const [dataFood, setDataFood] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

  useEffect(() => {
    loadFood();
  }, []);

  const loadFood = async () => {
    setLoading(true);
    const res = await fetchAllDishAPI();
    if (res?.data) {
      setDataFood(res.data);
    }
    setLoading(false);
  };

  const handleDeleteFood = async (id) => {
    const res = await deleteDishAPI(id);
    if (res.data) {
      notification.success({
        message: "Xóa món ăn",
        description: "Xóa món ăn thành công",
      });
      await loadFood();
    } else {
      notification.error({
        message: "Lỗi xóa món ăn",
        description: JSON.stringify(res.message),
      });
    }
  };

  const formatPrice = (price) => {
    if (price == null) return "";
    return price.toLocaleString("vi-VN") + " đ";
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: "ID",
      dataIndex: "_id",
      render: (_, record) => (
        
          <a href="#"
          onClick={(e) => {
            e.preventDefault();
            setDataDetail(record);
            setIsDetailOpen(true);
          }}
        >
          {record._id}
        </a>
      ),
    },
    {
      title: "Tên món",
      dataIndex: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (text) => formatPrice(text),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (image) =>
        image ? (
          <img
            src={image?.startsWith("http") ? image : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`}
            alt=""
            style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "20px" }}>
          <EditOutlined
            onClick={() => {
              setDataUpdate(record);
              setIsModalUpdateOpen(true);
            }}
            style={{ cursor: "pointer", color: "orange" }}
          />

          <Popconfirm
            title="Xóa món ăn"
            description="Bạn chắc chắn xóa món ăn này?"
            onConfirm={() => handleDeleteFood(record._id)}
            okText="Có"
            cancelText="Không"
            placement="left"
          >
            <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h3>Danh sách món ăn</h3>
        <Button type="primary" onClick={() => setIsModalCreateOpen(true)}>
          Thêm món ăn
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataFood}
        rowKey={"_id"}
        loading={loading}
      />

      <FoodDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
      />
    </>
  );
};

export default FoodTable;