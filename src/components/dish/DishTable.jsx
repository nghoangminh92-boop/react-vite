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
  Divider,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PictureOutlined,
  DollarOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import DishModal from "./DishModal";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const DishTable = () => {
  const { t } = useTranslation(); // ⭐ dùng i18n

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
        message: t("error"),
        description: t("load_dish_error"),
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
        message: t("delete_success"),
        description: t("delete_dish_success"),
      });
      await loadDishes();
    } else {
      notification.error({
        message: t("delete_error"),
        description: JSON.stringify(res?.message || t("delete_failed")),
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
      title: t("index"),
      key: "stt",
      width: 70,
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: t("image"),
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
          <Tag color="default">{t("none")}</Tag>
        ),
    },
    {
      title: t("dish_name"),
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 500 }}>
          <FileTextOutlined style={{ marginRight: 6 }} /> {name}
        </span>
      ),
    },
    {
      title: t("price"),
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span>
          <DollarOutlined style={{ marginRight: 6 }} /> {formatPrice(price)}
        </span>
      ),
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: t("actions"),
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "16px" }}>
          <Tooltip title={t("edit")}>
            <EditOutlined
              onClick={() => {
                setDataUpdate(record);
                setIsModalOpen(true);
              }}
              style={{ cursor: "pointer", color: "orange", fontSize: 18 }}
            />
          </Tooltip>

          <Popconfirm
            title={t("delete_dish")}
            description={t("delete_dish_confirm")}
            onConfirm={() => handleDeleteDish(record._id)}
            okText={t("yes")}
            cancelText={t("no")}
            placement="left"
          >
            <Tooltip title={t("delete")}>
              <DeleteOutlined
                style={{ cursor: "pointer", color: "red", fontSize: 18 }}
              />
            </Tooltip>
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
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>🍽️ {t("dish_management")}</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setDataUpdate(null);
            setIsModalOpen(true);
          }}
        >
          {t("add_new")}
        </Button>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder={t("search_dish")}
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 16, width: 260, borderRadius: 6 }}
      />

      <Divider />

      <Table
        columns={columns}
        dataSource={filteredDish}
        rowKey={"_id"}
        loading={loading}
        bordered
        pagination={false}
        style={{ background: "#fff", borderRadius: 8, padding: 10 }}
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
