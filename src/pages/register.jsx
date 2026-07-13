import "./register.css";
import { Button, Form, Input, notification, Card, Typography, Row, Col, Divider } from 'antd';
import { registerUserAPI } from '../services/api.services';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

// ⭐ i18n
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/language/LanguageSwitcher";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sakuraContainerRef = useRef(null);

  // ⭐ SAKURA BACKGROUND
  useEffect(() => {
    const container = sakuraContainerRef.current;
    if (!container || container.childElementCount > 0) return;

    for (let i = 0; i < 35; i++) {
      const petal = document.createElement("div");
      petal.className = "sakura-bg__petal";
      petal.style.left = Math.random() * 100 + "%";
      petal.style.top = "-10px";
      petal.style.animationDuration = 9 + Math.random() * 8 + "s";
      petal.style.animationDelay = -(Math.random() * 12) + "s";
      container.appendChild(petal);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

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
    <>
      <div className="sakura-bg">
        <div className="sakura-bg__mesh"></div>
        <div className="sakura-bg__petals" ref={sakuraContainerRef}></div>
        <div className="sakura-bg__noise"></div>
      </div>

      <div className="register-page-wrapper">
        <div className="register-lang-switcher">
          <LanguageSwitcher />
        </div>

        <Card className="register-card">
          <div className="register-logo-wrap">
            <div className="register-logo-circle">
              <img
                src="https://image.jimcdn.com/app/cms/image/transf/dimension=320x10000:format=jpg/path/sdebecf2bdf0cca64/image/icfa5182b8564128f/version/1752621256/image.jpg"
                alt="Logo"
              />
            </div>
          </div>

          <Title level={3} className="register-title">
            {t("register_title")}
          </Title>

          <Text className="register-subtitle">
            {t("register_subtitle")}
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="register-form-inner"
            labelCol={{ style: { fontWeight: 600, marginBottom: 6 } }}
          >
            <div className="register-field-col">
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    className="register-submit-btn"
                  >
                    {t("register_button")}
                  </Button>

                  <Divider>
                    <div className="register-divider-text">
                      {t("already_have_account")}{" "}
                      <Link to={"/login"}>{t("login_here")}</Link>
                    </div>
                  </Divider>
                </Col>
              </Row>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;