import { Button, Form, Input, notification, Card, Typography, Row, Col, Divider } from 'antd';
import { registerUserAPI } from '../services/api.services';
import { Link, useNavigate } from 'react-router-dom';

// ⭐ i18n
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/language/LanguageSwitcher";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ⭐ dùng i18n

  const onFinish = async (values) => {
    const res = await registerUserAPI(
      values.fullName,
      values.email,
      values.password,
      values.phone
    );

    if (res.data) {
      notification.success({
        message: t("register_title"),
        description: t("register_success"),
      });
      navigate("/login");
    } else {
      notification.error({
        message: t("register_error"),
        description: JSON.stringify(res.message),
      });
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
        padding: 20,
        position: "relative",
      }}
    >
      {/* ⭐ NÚT ĐỔI NGÔN NGỮ - góc trên phải */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <LanguageSwitcher />
      </div>

      <Card
        style={{
          width: 520,
          padding: "40px 35px",
          borderRadius: 14,
          boxShadow: "0 12px 35px rgba(0,0,0,0.10)",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="https://image.jimcdn.com/app/cms/image/transf/dimension=320x10000:format=jpg/path/sdebecf2bdf0cca64/image/icfa5182b8564128f/version/1752621256/image.jpg"
              alt="Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        <Title level={3} style={{ textAlign: "center", marginBottom: 5 }}>
          {t("register_title")}
        </Title>

        <Text
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: 30,
            color: "#666",
          }}
        >
          {t("register_subtitle")}
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ width: "100%" }}
          labelCol={{ style: { fontWeight: 600, marginBottom: 6 } }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "360px" }}>
              <Row justify="center">
                <Col span={24}>
                  <Form.Item
                    label={t("full_name")}
                    name="fullName"
                    rules={[{ required: true, message: t("full_name_required") }]}
                  >
                    <Input placeholder={t("full_name_placeholder")} />
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="center">
                <Col span={24}>
                  <Form.Item
                    label={t("email")}
                    name="email"
                    rules={[
                      { required: true, message: t("email_required") },
                      { type: "email", message: t("email_invalid") },
                    ]}
                  >
                    <Input placeholder="example@gmail.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="center">
                <Col span={24}>
                  <Form.Item
                    label={t("password")}
                    name="password"
                    rules={[
                      {
                        required: true,
                        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
                        message: t("password_rule"),
                      },
                    ]}
                  >
                    <Input.Password placeholder={t("password_placeholder")} />
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="center">
                <Col span={24}>
                  <Form.Item
                    label={t("phone")}
                    name="phone"
                    rules={[
                      {
                        pattern: /^[0-9]{9,11}$/,
                        message: t("phone_rule"),
                      },
                    ]}
                  >
                    <Input placeholder="090xxxxxxx" />
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="center">
                <Col span={24}>
                  <div>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      style={{
                        height: 48,
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #4b7bec, #3867d6)",
                        boxShadow: "0 4px 12px rgba(56,103,214,0.3)",
                      }}
                    >
                      {t("register_button")}
                    </Button>
                  </div>

                  <Divider>
                    <div>
                      {t("already_have_account")}{" "}
                      <Link to={"/login"}>{t("login_here")}</Link>
                    </div>
                  </Divider>
                </Col>
              </Row>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;