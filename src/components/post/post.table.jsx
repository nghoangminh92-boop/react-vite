import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { notification, Popconfirm, Table, Pagination } from "antd";
import { useEffect, useState } from "react";
import { deletePostAPI } from "../../services/api.services";
import PostDetail from "./post.detail";
import UpdatePostModal from "./updatePost.modal";
import RatingDisplay from "./RatingDisplay";
import "./post-table.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const getImageUrl = (image) =>
  image
    ? image.startsWith("http")
      ? image
      : `${import.meta.env.VITE_BACKEND_URL}/images/${image}`
    : null;

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

  const { t } = useTranslation();

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

  const handleEdit = (record) => {
    setDataUpdate(record);
    setIsModalUpdateOpen(true);
  };

  const handleOpenDetail = (record) => {
    setDataDetail(record);
    setIsDetailOpen(true);
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
        
          <a href="#"
          className="post-id-link"
          onClick={(e) => {
            e.preventDefault();
            handleOpenDetail(record);
          }}
        >
          {record._id?.slice(-8)}
        </a>
      ),
    },
    {
      title: t("title"),
      dataIndex: "title",
      ellipsis: true,
      render: (text, record) => (
        <span className="post-title-link" onClick={() => handleOpenDetail(record)}>
          {text}
        </span>
      ),
    },
    {
      title: t("image"),
      dataIndex: "image",
      render: (image) =>
        image ? (
          <img src={getImageUrl(image)} alt="" className="post-thumb" />
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
            className="post-action-icon edit"
            onClick={() => handleEdit(record)}
          />

          <Popconfirm
            title={t("delete_post")}
            description={t("delete_post_confirm")}
            onConfirm={() => handleDeletePost(record._id)}
            okText={t("yes")}
            cancelText={t("no")}
            placement="left"
          >
            <DeleteOutlined className="post-action-icon delete" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="post-table-page">
      {/* DESKTOP TABLE */}
      <div className="post-table-wrapper">
        <Table
          className="post-table"
          columns={columns}
          dataSource={dataPosts}
          rowKey={(record) => record._id?.toString?.() || record._id}
          scroll={{ x: 900 }}
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
      </div>

      {/* MOBILE CARD LIST */}
      <div className="post-card-list">
        {dataPosts.map((post) => (
          <div className="post-mobile-card" key={post._id}>
            {post.image ? (
              <img src={getImageUrl(post.image)} alt="" />
            ) : (
              <div className="post-mobile-card-noimg" />
            )}

            <div className="post-mobile-card-body">
              <p
                className="post-mobile-card-title"
                onClick={() => handleOpenDetail(post)}
              >
                {post.title}
              </p>

              <div className="post-mobile-card-meta">
                <span>{post.author}</span>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>

              {post.foodId && (
                <div className="post-mobile-card-rating">
                  <RatingDisplay postId={post.foodId} />
                </div>
              )}
            </div>

            <div className="post-mobile-card-actions">
              <EditOutlined
                className="post-action-icon edit"
                onClick={() => handleEdit(post)}
              />

              <Popconfirm
                title={t("delete_post")}
                description={t("delete_post_confirm")}
                onConfirm={() => handleDeletePost(post._id)}
                okText={t("yes")}
                cancelText={t("no")}
                placement="left"
              >
                <DeleteOutlined className="post-action-icon delete" />
              </Popconfirm>
            </div>
          </div>
        ))}

        {dataPosts.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>
            {t("none")}
          </p>
        )}

        {total > pageSize && (
          <div className="post-mobile-pagination">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                setCurrent(page);
                if (size !== pageSize) setPageSize(size);
              }}
              simple
            />
          </div>
        )}
      </div>

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
    </div>
  );
};

export default PostTable;