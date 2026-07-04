import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Divider, message, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginUserAPI } from "../services/api.services";
import { useContext, useState } from "react";
import { AuthContext } from "../components/context/auth.context";
import { GoogleLogin } from '@react-oauth/google';
import { googleLoginAPI } from "../services/api.services";

// ⭐ i18n
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/language/LanguageSwitcher";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { t, i18n } = useTranslation(); // ⭐ dùng i18n

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
    <Row justify="center" style={{ margin: "30px", position: "relative" }}>
      {/* ⭐ NÚT ĐỔI NGÔN NGỮ - góc trên phải */}
      <div style={{ position: "absolute", top: 0, right: 20 }}>
        <LanguageSwitcher />
      </div>

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
            {t("login")}
          </legend>

          {/* LOGO */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <img
              src="https://image.jimcdn.com/app/cms/image/transf/dimension=320x10000:format=jpg/path/sdebecf2bdf0cca64/image/icfa5182b8564128f/version/1752621256/image.jpg"
              alt="Logo"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "none",
                border: "none",
              }}
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

            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 12 }}>
              <Link to={"/forgot-password"} style={{ fontSize: 13 }}>
                {t("forgot_password")}
              </Link>
            </div>

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
                  {t("login")}
                </Button>

                <Link to={"/"} style={{ fontWeight: 500 }}>
                  {t("back_to_home")} <ArrowRightOutlined />
                </Link>
              </div>
            </Form.Item>

            <Divider>
              <div style={{ textAlign: "center" }}>
                {t("no_account")}{" "}
                <Link to={"/register"}>{t("register_here")}</Link>
              </div>
            </Divider>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <GoogleLogin
                key={i18n.language}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                locale={i18n.language === "vi" ? "vi" : i18n.language === "ja" ? "ja" : "en"}
              />
            </div>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
};

export default LoginPage;