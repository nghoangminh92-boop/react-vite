import { useEffect, useState } from "react";
import { fetchAllFoodAPI } from "../../services/api.services";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table } from "antd";
import FoodDetail from "./food.detail";

const FoodTable = () => {
  const [dataFood, setDataFood] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);


  useEffect(() => {
    loadFood();
  }, [current, pageSize]);

  const loadFood = async () => {
    const res = await fetchAllFoodAPI(current, pageSize);
    if (res.data) {
      setDataFood(res.data.result);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
    }
  };

  const handleDeleteFood = async (id) => {};

  const onChange = (pagination) => {
    if (pagination.current !== current) {
      setCurrent(pagination.current);
    }
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const columns = [
    {
      title: "番号",
      render: (_, __, index) => (
        <>{index + 1 + (current - 1) * pageSize}</>
      ),
    },
    {
      title: "ID",
      dataIndex: "_id",
      render: (_, record) => (
        <a
          href="#"
          onClick={() => {
            setDataDetail(record);
            setIsDetailOpen(true);
          }}
        >
          {record._id}
        </a>
      ),
    },
    {
      title: "タイトル",
      dataIndex: "mainText",
    },
    {
      title: "価格",
      dataIndex: "price",
      render: (text) => {
        if (text)
          return new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "JPY",
          }).format(text);
      },
    },
    {
      title: "数量",
      dataIndex: "quantity",
    },
    {
      title: "カテゴリー",
      dataIndex: "category",
    },
    {
      title: "操作",
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
            title="削除確認"
            description="このデータを削除してもよろしいですか？"
            onConfirm={() => handleDeleteFood(record._id)}
            okText="はい"
            cancelText="いいえ"
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
      <h3>Table Food</h3>
      <Button type="primary">Create Food</Button>
    </div>

    <Table
      columns={columns}
      dataSource={dataFood}
      rowKey={"_id"}
      pagination={{
        current,
        pageSize,
        total,
        showSizeChanger: true,
      }}
      onChange={onChange}
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
