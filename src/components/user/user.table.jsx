import {
  DeleteOutlined,
  EditOutlined,
  GoogleOutlined,
  MailOutlined,
  CrownOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { notification, Popconfirm, Table, Tag, Tooltip } from "antd";
import { useState } from "react";

import UpdateUserModal from "./updateUser.modal";
import ViewUserDetail from "./view.user.detail";
import { deleteUserAPI } from "../../services/api.services";

import "./user.css";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const UserTable = (props) => {
  const { dataUsers, loadUser, current, pageSize, total, setCurrent, setPageSize } = props;

  const { t } = useTranslation();

  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);
  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const columns = [
    {
      title: t("stt"),
      width: 60,
      render: (_, record, index) => <>{index + 1 + (current - 1) * pageSize}</>,
    },
    {
      title: t("user"),
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
            
             <a href="#"
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
      title: t("role"),
      dataIndex: "role",
      width: 100,
      render: (role) => {
        if (role === "ADMIN") {
          return (
            <Tag icon={<CrownOutlined />} color="gold">
              {t("role_admin")}
            </Tag>
          );
        }
        if (role === "STAFF") {
          return (
            <Tag className="role-tag-staff" icon={<UserSwitchOutlined />}>
              {t("role_staff")}
            </Tag>
          );
        }
        return <Tag color="default">{t("role_user")}</Tag>;
      },
    },
    {
      title: t("login_method"),
      dataIndex: "authProvider",
      width: 120,
      render: (authProvider) =>
        authProvider === "google" ? (
          <Tag icon={<GoogleOutlined />} color="red">
            Google
          </Tag>
        ) : (
          <Tag icon={<MailOutlined />} color="blue">
            {t("login_email")}
          </Tag>
        ),
    },
    {
      title: t("actions"),
      key: "action",
      width: 160,
      render: (_, record) => {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        return (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Tooltip title={t("edit")}>
              <EditOutlined
                onClick={() => {
                  setDataUpdate(record);
                  setIsModalUpdateOpen(true);
                }}
                style={{ cursor: "pointer", color: "orange", fontSize: 16 }}
              />
            </Tooltip>

            {currentUser?.role === "ADMIN" && (
              <Tooltip title={t("change_role")}>
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
                  {t("role")}
                </span>
              </Tooltip>
            )}

            <Popconfirm
              title={t("delete_user")}
              description={t("delete_user_confirm")}
              onConfirm={() => handleDeleteUser(record._id)}
              okText={t("yes")}
              cancelText={t("no")}
              placement="left"
            >
              <Tooltip title={t("delete")}>
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
        message: t("delete_user"),
        description: t("delete_user_success"),
      });
      await loadUser();
    } else {
      notification.error({
        message: t("delete_user_error"),
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
              {range[0]}-{range[1]} {t("items")} / {t("total")} {total}
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