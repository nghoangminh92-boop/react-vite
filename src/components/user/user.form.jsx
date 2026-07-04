import { Button, Form, Input, notification, Modal, Select } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useState } from 'react';
import { createUserAPI } from "../../services/api.services";

const UserForm = (props) => {
  const { loadUser } = props;
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleSubmitBtn = async (values) => {
    setLoading(true);
    try {
      const res = await createUserAPI(
        values.fullName,
        values.email,
        values.password,
        values.phone,
        values.role   // ⭐ gửi role lên backend
      );

      if (res.data) {
        notification.success({
          message: "Tạo user thành công",
          description: `Đã tạo tài khoản cho ${values.fullName}`,
        });
        resetAndCloseModal();
        await loadUser();
      } else {
        notification.error({
          message: "Error create user",
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: "Error create user",
        description: error?.response?.data?.message || "Có lỗi xảy ra",
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
        ユーザー追加
      </Button>

      <Modal
        title="新規ユーザー作成"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        okText="作成"
        cancelText="キャンセル"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitBtn}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="氏名"
            name="fullName"
            rules={[{ required: true, message: "氏名を入力してください" }]}
          >
            <Input placeholder="山田太郎" />
          </Form.Item>

          <Form.Item
            label="メールアドレス"
            name="email"
            rules={[
              { required: true, message: "メールアドレスを入力してください" },
              { type: "email", message: "メールアドレスの形式が正しくありません" },
            ]}
          >
            <Input placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item
            label="パスワード"
            name="password"
            rules={[
              { required: true, message: "パスワードを入力してください" },
              { min: 6, message: "6文字以上で入力してください" },
            ]}
          >
            <Input.Password placeholder="6文字以上" />
          </Form.Item>

          <Form.Item
            label="電話番号"
            name="phone"
            rules={[{ required: true, message: "電話番号を入力してください" }]}
          >
            <Input placeholder="09012345678" />
          </Form.Item>

          {/* ⭐ Chỉ ADMIN mới được chọn role */}
          {currentUser?.role === "ADMIN" && (
            <Form.Item
              label="権限 (Role)"
              name="role"
              initialValue="USER"
              rules={[{ required: true, message: "権限を選択してください" }]}
            >
              <Select
                options={[
                  { value: "USER", label: "一般 (USER)" },
                  { value: "ADMIN", label: "管理者 (ADMIN)" },
                  { value: "STAFF", label: "スタッフ (STAFF)" },
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
