import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  notification,
  Image,
  Tooltip,
  Tag,
  Input,
  Divider
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PictureOutlined,
  DollarOutlined,
  FileTextOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import DishModal from "./DishModal";

const DishTable = () => {
  const [dataDish, setDataDish] = useState([]);
  const [filteredDish, setFilteredDish] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const res = await fetchAllDishAPI();

      let list = [];
      if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res)) list = res;
      else list = [];

      setDataDish(list);
      setFilteredDish(list);
    } catch (error) {
      notification.error({
        message: "エラー",
        description: "料理リストを読み込めませんでした",
      });
      setDataDish([]);
      setFilteredDish([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (id) => {
    const res = await deleteDishAPI(id);
    if (res?.data) {
      notification.success({
        message: "削除成功",
        description: "料理の削除に成功しました",
      });
      await loadDishes();
    } else {
      notification.error({
        message: "削除エラー",
        description: JSON.stringify(res?.message || "削除に失敗しました"),
      });
    }
  };

  const formatPrice = (price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  // 🔍 Tìm kiếm giống UserTable
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      setFilteredDish(dataDish);
      return;
    }

    const filtered = dataDish.filter((dish) =>
      dish.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredDish(filtered);
  };

  const columns = [
    {
      title: "番号",
      key: "stt",
      width: 70,
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: "画像",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <Image
            src={
              image.startsWith("http")
                ? image
                : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`
            }
            width={60}
            height={60}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <Tag color="default">なし</Tag>
        ),
    },
    {
      title: "料理名",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 500 }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          {name}
        </span>
      ),
    },
    {
      title: "価格",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>
          <DollarOutlined style={{ marginRight: 6 }} />
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "説明",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "16px" }}>
          <Tooltip title="編集">
            <EditOutlined
              onClick={() => {
                setDataUpdate(record);
                setIsModalOpen(true);
              }}
              style={{
                cursor: "pointer",
                color: "orange",
                fontSize: 18,
              }}
            />
          </Tooltip>

          <Popconfirm
            title="料理削除"
            description="この料理を削除してもよろしいですか？"
            onConfirm={() => handleDeleteDish(record._id)}
            okText="はい"
            cancelText="いいえ"
            placement="left"
          >
            <Tooltip title="削除">
              <DeleteOutlined
                style={{
                  cursor: "pointer",
                  color: "red",
                  fontSize: 18,
                }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginTop: "10px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>🍽️ 料理管理</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setDataUpdate(null);
            setIsModalOpen(true);
          }}
        >
          新規追加
        </Button>
      </div>

      {/* Search bar giống User */}
      <Input
        prefix={<SearchOutlined />}
        placeholder="料理名で検索..."
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        style={{
          marginBottom: 16,
          width: 260,
          borderRadius: 6,
        }}
      />

      <Divider />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredDish}
        rowKey={"_id"}
        loading={loading}
        bordered
        pagination={false}
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 10,
        }}
      />

      {/* Modal */}
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
