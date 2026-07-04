import { Button, Form, Input, notification, Modal, Select } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useState } from 'react';
import { createUserAPI } from "../../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";

const UserForm = (props) => {
  const { loadUser } = props;
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation(); // ⭐ dùng i18n

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleSubmitBtn = async (values) => {
    setLoading(true);
    try {
      const res = await createUserAPI(
        values.fullName,
        values.email,
        values.password,
        values.phone,
        values.role
      );

      if (res.data) {
        notification.success({
          message: t("create_user_success"),
          description: t("create_user_desc", { name: values.fullName })
        });
        resetAndCloseModal();
        await loadUser();
      } else {
        notification.error({
          message: t("create_user_error"),
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("create_user_error"),
        description: error?.response?.data?.message || t("error_occurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        type="primary"
        icon={<UserAddOutlined />}
      >
        {t("add_user")}
      </Button>

      <Modal
        title={t("create_new_user")}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        okText={t("create")}
        cancelText={t("cancel")}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitBtn} style={{ marginTop: 20 }}>

          <Form.Item
            label={t("full_name")}
            name="fullName"
            rules={[{ required: true, message: t("enter_full_name") }]}
          >
            <Input placeholder={t("full_name_placeholder")} />
          </Form.Item>

          <Form.Item
            label={t("email")}
            name="email"
            rules={[
              { required: true, message: t("enter_email") },
              { type: "email", message: t("invalid_email") },
            ]}
          >
            <Input placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item
            label={t("password")}
            name="password"
            rules={[
              { required: true, message: t("enter_password") },
              { min: 6, message: t("password_min_length") },
            ]}
          >
            <Input.Password placeholder={t("password_min_length")} />
          </Form.Item>

          <Form.Item
            label={t("phone")}
            name="phone"
            rules={[{ required: true, message: t("enter_phone") }]}
          >
            <Input placeholder="09012345678" />
          </Form.Item>

          {/* ⭐ Chỉ ADMIN mới được chọn role */}
          {currentUser?.role === "ADMIN" && (
            <Form.Item
              label={t("role")}
              name="role"
              initialValue="USER"
              rules={[{ required: true, message: t("select_role") }]}
            >
              <Select
                options={[
                  { value: "USER", label: t("role_user") },
                  { value: "ADMIN", label: t("role_admin") },
                  { value: "STAFF", label: t("role_staff") },
                ]}
              />
            </Form.Item>
          )}

        </Form>
      </Modal>
    </>
  );
};

export default UserForm;
