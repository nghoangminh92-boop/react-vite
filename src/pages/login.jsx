import "./login.css";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Divider, message, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginUserAPI } from "../services/api.services";
import { useContext, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { GoogleLogin } from '@react-oauth/google';
import { googleLoginAPI } from "../services/api.services";

import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/language/LanguageSwitcher";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginUserAPI(values.email, values.password);
      if (res.data) {
        message.success(t("login_success"));
        localStorage.setItem("access_token", res.data.access_token);
        setUser(res.data.user);
        navigate("/");
      } else {
        notification.error({
          message: t("login_error"),
          description: JSON.stringify(res.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("network_error"),
        description: error.message,
      });
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await googleLoginAPI(credentialResponse.credential);
      if (res?.data) {
        message.success(t("login_success"));
        localStorage.setItem("access_token", res.data.access_token);
        setUser(res.data.user);
        navigate("/");
      } else {
        notification.error({
          message: t("login_error"),
          description: JSON.stringify(res?.message),
        });
      }
    } catch (error) {
      notification.error({
        message: t("network_error"),
        description: error.message,
      });
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    notification.error({
      message: t("google_login_error"),
      description: t("google_login_error_desc"),
    });
  };

  return (
    <>
      <Row justify="center" className="login-page-wrapper">
        <div className="login-lang-switcher">
          <LanguageSwitcher />
        </div>

        <Col span={24}>
          <div className="login-card">
            <div className="login-title">{t("login")}</div>

            <div className="login-logo-wrap">
              <img
                src="https://image.jimcdn.com/app/cms/image/transf/dimension=320x10000:format=jpg/path/sdebecf2bdf0cca64/image/icfa5182b8564128f/version/1752621256/image.jpg"
                alt="Logo"
              />
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
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

              <Form.Item
                label={t("password")}
                name="password"
                rules={[{ required: true, message: t("password_required") }]}
              >
                <Input.Password
                  placeholder={t("password_placeholder")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") form.submit();
                  }}
                />
              </Form.Item>

              <div className="login-forgot-row">
                <Link to={"/forgot-password"}>{t("forgot_password")}</Link>
              </div>

              <Form.Item>
                <div className="login-actions-row">
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    icon={<ArrowRightOutlined />}
                  >
                    {t("login")}
                  </Button>

                  <Link to={"/"} className="login-back-home">
                    {t("back_to_home")} <ArrowRightOutlined />
                  </Link>
                </div>
              </Form.Item>

              <Divider>
                <div className="login-divider-text">
                  {t("no_account")}{" "}
                  <Link to={"/register"}>{t("register_here")}</Link>
                </div>
              </Divider>

              <div className="login-google-btn-wrap">
                <GoogleLogin
                  key={i18n.language}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  locale={i18n.language === "vi" ? "vi" : i18n.language === "ja" ? "ja" : "en"}
                />
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default LoginPage;