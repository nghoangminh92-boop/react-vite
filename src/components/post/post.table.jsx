import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { notification, Popconfirm, Table } from "antd";
import { useContext, useEffect, useState } from "react";
import { deletePostAPI } from "../../services/api.services";
import { AuthContext } from "../context/auth.context";
import PostDetail from "./post.detail";
import UpdatePostModal from "./updatePost.modal";

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

  const { user } = useContext(AuthContext);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataPosts]);

  const handleDeletePost = async (id) => {
    const res = await deletePostAPI(id);
    if (res.data) {
      notification.success({
        message: "Delete post",
        description: "Xóa bài viết thành công",
      });
      if (dataDetail?._id === id) {
        setDataDetail(null);
        setIsDetailOpen(false);
      }
      await loadPost();
    } else {
      notification.error({
        message: "Error delete post",
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
      title: "STT",
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
      title: "Tiêu đề",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (image) =>
        image ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/images/post/${image}`}
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
      title: "Tác giả",
      dataIndex: "author",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (text) => formatDate(text),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const isOwner = record.userId === user?.id;
        return (
          <div style={{ display: "flex", gap: "20px" }}>
            {isOwner && (
              <>
                <EditOutlined
                  onClick={() => {
                    setDataUpdate(record);
                    setIsModalUpdateOpen(true);
                  }}
                  style={{ cursor: "pointer", color: "orange" }}
                  title="Chỉnh sửa"
                />

                <Popconfirm
                  title="Xóa bài viết"
                  description="Bạn chắc chắn xóa bài viết này?"
                  onConfirm={() => handleDeletePost(record._id)}
                  okText="Có"
                  cancelText="Không"
                  placement="left"
                >
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    title="Xóa"
                  />
                </Popconfirm>
              </>
            )}
            {!isOwner && (
              <span style={{ color: "#ccc", fontSize: "12px" }}>Không có quyền</span>
            )}
          </div>
        );
      },
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
              {range[0]}-{range[1]} trên {totalCount} bài viết
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
