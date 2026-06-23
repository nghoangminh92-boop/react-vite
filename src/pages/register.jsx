import { Button, Form, Input, notification, Card, Typography, Row, Col,Divider } from 'antd';
import { registerUserAPI } from '../services/api.services';
import {Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const res = await registerUserAPI(
      values.fullName,
      values.email,
      values.password,
      values.phone
    );

    if (res.data) {
      notification.success({
        message: "Register user",
        description: "Đăng kí user thành công",
      });
      navigate("/login");
    } else {
      notification.error({
        message: "Register user error",
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
      }}
    >
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
          Create Account
        </Title>

        <Text
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: 30,
            color: "#666",
          }}
        >
          Join us and start your journey
        </Text>

        <Form form={form}
  layout="vertical"
  onFinish={onFinish}
  style={{ width: "100%" }}
  labelCol={{ style: { fontWeight: 600, marginBottom: 6 } }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
    <div style={{ width: "360px" }}>
          <Row justify="center">
            <Col span={24}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Please input your full name!" }]}
              >
                <Input placeholder="Your full name" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="center">
            <Col span={24}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Email is not valid" },
                ]}
              >
                <Input placeholder="example@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="center">
            <Col span={24}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
                    message:
                      "Password must be 8+ chars, include uppercase, lowercase and a number",
                  },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="center">
            <Col span={24}>
              <Form.Item
                label="Phone number"
                name="phone"
                rules={[
                  {
                    pattern: /^[0-9]{9,11}$/,
                    message: "Phone number must be 9–11 digits",
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
                  Register
                </Button>
              </div>
              <Divider>
                <div> Đã có tài khoản? <Link to={"/login"}>Đăng nhập tại đây</Link> </div>
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
