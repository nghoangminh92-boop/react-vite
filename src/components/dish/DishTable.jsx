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
  FileTextOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { fetchAllDishAPI, deleteDishAPI } from "../../services/api.services";
import DishModal from "./DishModal";
import "./dish.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const getImageUrl = (image) =>
  image
    ? image.startsWith("http")
      ? image
      : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`
    : null;

const DishTable = () => {
  const { t } = useTranslation();

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

  const handleEdit = (record) => {
    setDataUpdate(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: t("index"),
      key: "stt",
      width: 60,
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: t("image"),
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (image) =>
        image ? (
          <Image
            src={getImageUrl(image)}
            width={56}
            height={56}
            className="dish-thumb"
            style={{ objectFit: "cover" }}
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
        <span className="dish-name-cell">
          <FileTextOutlined /> {name}
        </span>
      ),
    },
    {
      title: t("price"),
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="dish-price-cell">
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
      width: 100,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "16px" }}>
          <Tooltip title={t("edit")}>
            <EditOutlined
              className="dish-action-icon edit"
              onClick={() => handleEdit(record)}
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
              <DeleteOutlined className="dish-action-icon delete" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="dish-page">
      <div className="dish-page-header">
        <h3 className="dish-page-title">
          <span className="title-bar" />
          {t("dish_management")}
        </h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="dish-add-btn"
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
        className="dish-search-input"
        style={{ marginBottom: 16, width: 260 }}
      />

      <Divider />

      {/* DESKTOP TABLE */}
      <div className="dish-table-wrapper">
        <Table
          className="dish-table"
          columns={columns}
          dataSource={filteredDish}
          rowKey={"_id"}
          loading={loading}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </div>

      {/* MOBILE CARD LIST */}
      <div className="dish-card-list">
        {filteredDish.map((dish, index) => (
          <div className="dish-mobile-card" key={dish._id}>
            {dish.image ? (
              <img src={getImageUrl(dish.image)} alt={dish.name} />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  background: "#f0f0f0",
                  flexShrink: 0,
                }}
              />
            )}

            <div className="dish-mobile-card-body">
              <p className="dish-mobile-card-name">{dish.name}</p>
              <p className="dish-mobile-card-price">{formatPrice(dish.price)}</p>
              {dish.description && (
                <p className="dish-mobile-card-desc">{dish.description}</p>
              )}
            </div>

            <div className="dish-mobile-card-actions">
              <Tooltip title={t("edit")}>
                <EditOutlined
                  className="dish-action-icon edit"
                  onClick={() => handleEdit(dish)}
                />
              </Tooltip>

              <Popconfirm
                title={t("delete_dish")}
                description={t("delete_dish_confirm")}
                onConfirm={() => handleDeleteDish(dish._id)}
                okText={t("yes")}
                cancelText={t("no")}
                placement="left"
              >
                <Tooltip title={t("delete")}>
                  <DeleteOutlined className="dish-action-icon delete" />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
        ))}

        {filteredDish.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>
            {t("none")}
          </p>
        )}
      </div>

      <DishModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadDishes={loadDishes}
      />
    </div>
  );
};

export default DishTable;