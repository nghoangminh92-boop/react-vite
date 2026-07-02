import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import DishModal from "./DishModal";

const DishTable = () => {
  const [dataDish, setDataDish] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const res = await fetchAllDishAPI();
      // Phòng trường hợp API trả về không phải mảng (VD: { data: {...} } hoặc lỗi)
      if (res?.data && Array.isArray(res.data)) {
        setDataDish(res.data);
      } else if (Array.isArray(res)) {
        setDataDish(res);
      } else {
        console.warn("API trả về không đúng định dạng mảng:", res);
        setDataDish([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách món ăn:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách món ăn",
      });
      setDataDish([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (id) => {
    const res = await deleteDishAPI(id);
    if (res?.data) {
      notification.success({ message: "Xóa món ăn thành công" });
      await loadDishes();
    } else {
      notification.error({
        message: "Lỗi",
        description: JSON.stringify(res?.message || "Xóa thất bại"),
      });
    }
  };

  const columns = [
    {
      title: "番号",
      key: "stt",
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <Image
            src={image}
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          "—"
        ),
    },
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "—",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "20px" }}>
          <EditOutlined
            onClick={() => {
              setDataUpdate(record);
              setIsModalOpen(true);
            }}
            style={{ cursor: "pointer", color: "orange" }}
          />
          <Popconfirm
            title="Xóa món ăn"
            description="Bạn chắc chắn muốn xóa món ăn này?"
            onConfirm={() => handleDeleteDish(record._id)}
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
        <h3>Quản lý món ăn</h3>
        <Button
          type="primary"
          onClick={() => {
            setDataUpdate(null);
            setIsModalOpen(true);
          }}
        >
          Thêm món ăn
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataDish}
        rowKey={"_id"}
        loading={loading}
        pagination={false}
      />

      <DishModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadDishes={loadDishes}
      />
    </>
  );
};

export default DishTable;