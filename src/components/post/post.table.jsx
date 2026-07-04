import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { notification, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { deletePostAPI } from "../../services/api.services";
import PostDetail from "./post.detail";
import UpdatePostModal from "./updatePost.modal";
import RatingDisplay from "./RatingDisplay";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const PostTable = (props) => {
  const {
    dataPosts,
    loadPost,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;

  const { t } = useTranslation(); // ⭐ dùng i18n

  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

  useEffect(() => {
    if (dataDetail?._id && dataPosts.length) {
      const updated = dataPosts.find((p) => p._id === dataDetail._id);
      if (updated) {
        setDataDetail(updated);
      }
    }
  }, [dataPosts]);

  const handleDeletePost = async (id) => {
    const res = await deletePostAPI(id);

    if (res.data) {
      notification.success({
        message: t("delete_post"),
        description: t("delete_post_success"),
      });

      if (dataDetail?._id === id) {
        setDataDetail(null);
        setIsDetailOpen(false);
      }

      await loadPost();
    } else {
      notification.error({
        message: t("delete_post_error"),
        description: JSON.stringify(res.message),
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  const onChange = (pagination) => {
    if (pagination.current && pagination.current !== current) {
      setCurrent(+pagination.current);
    }
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(+pagination.pageSize);
    }
  };

  const columns = [
    {
      title: t("index"),
      render: (_, __, index) => <>{index + 1 + (current - 1) * pageSize}</>,
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
        >
          {record._id}
        </a>
      ),
    },
    {
      title: t("title"),
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: t("image"),
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
              borderRadius: 4,
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: t("rating"),
      key: "rating",
      render: (_, record) =>
        record.foodId ? <RatingDisplay postId={record.foodId} /> : "-",
    },
    {
      title: t("author"),
      dataIndex: "author",
    },
    {
      title: t("created_at"),
      dataIndex: "createdAt",
      render: (text) => formatDate(text),
    },
    {
      title: t("actions"),
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
            title={t("delete_post")}
            description={t("delete_post_confirm")}
            onConfirm={() => handleDeletePost(record._id)}
            okText={t("yes")}
            cancelText={t("no")}
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
      <Table
        columns={columns}
        dataSource={dataPosts}
        rowKey={(record) => record._id?.toString?.() || record._id}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (totalCount, range) => (
            <div>
              {range[0]}-{range[1]} {t("on")} {totalCount} {t("posts")}
            </div>
          ),
        }}
        onChange={onChange}
      />

      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
      />

      <UpdatePostModal
        isModalUpdateOpen={isModalUpdateOpen}
        setIsModalUpdateOpen={setIsModalUpdateOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadPost={loadPost}
      />
    </>
  );
};

export default PostTable;
