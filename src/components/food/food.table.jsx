import { useEffect, useState } from "react";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
  DollarOutlined,
  PictureOutlined
} from "@ant-design/icons";
import { Button, notification, Popconfirm, Table, Tag, Tooltip } from "antd";
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
        message: "削除完了",
        description: "フードの削除に成功しました",
      });
      await loadFood();
    } else {
      notification.error({
        message: "削除エラー",
        description: JSON.stringify(res.message),
      });
    }
  };

  const formatPrice = (price) => {
    if (price == null) return "";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const columns = [
    {
      title: "No.",
      width: 70,
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: "ID",
      dataIndex: "_id",
      render: (_, record) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setDataDetail(record);
            setIsDetailOpen(true);
          }}
          style={{ fontWeight: 600 }}
        >
          {record._id}
        </a>
      ),
    },
    {
      title: "名前",
      dataIndex: "name",
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
      ellipsis: true,
    },
    {
      title: "画像",
      dataIndex: "image",
      render: (image) =>
        image ? (
          <img
            src={
              image?.startsWith("http")
                ? image
                : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`
            }
            alt=""
            style={{
              width: 60,
              height: 40,
              objectFit: "cover",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <Tag color="default">なし</Tag>
        ),
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
                setIsModalUpdateOpen(true);
              }}
              style={{
                cursor: "pointer",
                color: "orange",
                fontSize: 18,
              }}
            />
          </Tooltip>

          <Popconfirm
            title="フード削除"
            description="このフードを削除してもよろしいですか？"
            onConfirm={() => handleDeleteFood(record._id)}
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
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>🍜 フード一覧</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalCreateOpen(true)}
        >
          新規追加
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={dataFood}
        rowKey={"_id"}
        loading={loading}
        bordered
        style={{ background: "#fff", borderRadius: 8 }}
      />

      {/* Detail Drawer */}
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
