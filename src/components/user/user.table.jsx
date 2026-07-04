import {
  DeleteOutlined,
  EditOutlined,
  GoogleOutlined,
  MailOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { notification, Popconfirm, Table, Tag, Tooltip } from "antd";
import { useState } from "react";

import UpdateUserModal from "./updateUser.modal";
import ViewUserDetail from "./view.user.detail";
import { deleteUserAPI } from "../../services/api.services";

// ⭐ Import CSS đúng 100%
import "./user.css";

const UserTable = (props) => {
  const { dataUsers, loadUser, current, pageSize, total, setCurrent, setPageSize } = props;

  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);
  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_, record, index) => <>{index + 1 + (current - 1) * pageSize}</>,
    },
    {
      title: "ユーザー",
      dataIndex: "fullName",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {record.avatar ? (
            <img
              src={
                record.avatar?.startsWith("http")
                  ? record.avatar
                  : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${record.avatar}`
              }
              alt={record.fullName}
              className="user-table-avatar"
            />
          ) : (
            <div className="user-table-avatar-placeholder">
              {(record.fullName || "?")[0].toUpperCase()}
            </div>
          )}

          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDataDetail(record);
                setIsDetailOpen(true);
              }}
              style={{ fontWeight: 600 }}
            >
              {record.fullName}
            </a>
            <div style={{ fontSize: 12, color: "#999" }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "権限",
      dataIndex: "role",
      width: 100,
      render: (role) =>
        role === "ADMIN" ? (
          <Tag icon={<CrownOutlined />} color="gold">
            管理者
          </Tag>
        ) : (
          <Tag color="default">一般</Tag>
        ),
    },
    {
      title: "ログイン方法",
      dataIndex: "authProvider",
      width: 120,
      render: (authProvider) =>
        authProvider === "google" ? (
          <Tag icon={<GoogleOutlined />} color="red">
            Google
          </Tag>
        ) : (
          <Tag icon={<MailOutlined />} color="blue">
            メール
          </Tag>
        ),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_, record) => {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        return (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Tooltip title="編集">
              <EditOutlined
                onClick={() => {
                  setDataUpdate(record);
                  setIsModalUpdateOpen(true);
                }}
                style={{ cursor: "pointer", color: "orange", fontSize: 16 }}
              />
            </Tooltip>

            {currentUser?.role === "ADMIN" && (
              <Tooltip title="権限変更">
                <span
                  style={{
                    cursor: "pointer",
                    color: "blue",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setDataUpdate(record);
                    setIsModalUpdateOpen(true);
                  }}
                >
                  権限
                </span>
              </Tooltip>
            )}

            <Popconfirm
              title="ユーザーの削除"
              description="このユーザーを削除してもよろしいですか？"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="はい"
              cancelText="いいえ"
              placement="left"
            >
              <Tooltip title="削除">
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red", fontSize: 16 }}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleDeleteUser = async (id) => {
    const res = await deleteUserAPI(id);
    if (res.data) {
      notification.success({
        message: "ユーザー削除",
        description: "ユーザーの削除に成功しました",
      });
      await loadUser();
    } else {
      notification.error({
        message: "ユーザー削除エラー",
        description: JSON.stringify(res.message),
      });
    }
  };

  const onChange = (pagination) => {
    if (pagination?.current && pagination.current !== current) {
      setCurrent(+pagination.current);
    }
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(+pagination.pageSize);
    }
  };

  return (
    <>
      <Table
        className="user-table-responsive"
        columns={columns}
        dataSource={dataUsers}
        rowKey="_id"
        pagination={{
          current,
          pageSize,
          showSizeChanger: true,
          total,
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} 件 / 全 {total} 件
            </div>
          ),
        }}
        onChange={onChange}
      />

      <UpdateUserModal
        isModalUpdateOpen={isModalUpdateOpen}
        setIsModalUpdateOpen={setIsModalUpdateOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadUser={loadUser}
      />

      <ViewUserDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        loadUser={loadUser}
      />
    </>
  );
};

export default UserTable;
