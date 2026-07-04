import { ArrowRightOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordAPI } from "../services/api.services";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.warning({
        message: "パスワードが一致しません",
        description: "確認用パスワードが新しいパスワードと一致しません",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordAPI(
        values.email,
        values.phone,
        values.newPassword
      );
      if (res?.data) {
        notification.success({
          message: "パスワードをリセットしました",
          description: "新しいパスワードでログインしてください",
        });
        navigate("/login");
      } else {
        notification.error({
          message: "エラー",
          description: JSON.stringify(res?.message || "エラーが発生しました"),
        });
      }
    } catch (error) {
      notification.error({
        message: "ネットワークエラー",
        description: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <Row justify="center" style={{ margin: "30px" }}>
      <Col span={24}>
        <fieldset
          style={{
            padding: "20px",
            margin: "5px auto",
            border: "1px solid #ccc",
            borderRadius: "6px",
            maxWidth: "420px",
            background: "#fff",
          }}
        >
          <legend style={{ padding: "0 10px", fontWeight: 600 }}>
            パスワードをお忘れの方
          </legend>

          <p style={{ color: "#888", marginBottom: 20, fontSize: 13 }}>
            登録済みのメールアドレスと電話番号を入力して、新しいパスワードを設定してください。
          </p>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="メールアドレス"
              name="email"
              rules={[
                { required: true, message: "メールアドレスは必須です" },
                { type: "email", message: "メールアドレスが正しくありません" },
              ]}
            >
              <Input placeholder="example@gmail.com" />
            </Form.Item>

            <Form.Item
              label="登録済みの電話番号"
              name="phone"
              rules={[{ required: true, message: "電話番号は必須です" }]}
            >
              <Input placeholder="09012345678" />
            </Form.Item>

            <Form.Item
              label="新しいパスワード"
              name="newPassword"
              rules={[
                { required: true, message: "新しいパスワードは必須です" },
                { min: 6, message: "6文字以上で入力してください" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="6文字以上"
              />
            </Form.Item>

            <Form.Item
              label="新しいパスワード（確認）"
              name="confirmPassword"
              rules={[{ required: true, message: "確認用パスワードは必須です" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="再入力してください"
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  icon={<ArrowRightOutlined />}
                >
                  パスワードをリセット
                </Button>

                <Link to={"/login"} style={{ fontWeight: 500 }}>
                  ログインに戻る
                </Link>
              </div>
            </Form.Item>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;