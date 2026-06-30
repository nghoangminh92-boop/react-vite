import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Divider, message, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginUserAPI } from "../services/api.services";
import { useContext, useState } from "react";
import { AuthContext } from "../components/context/auth.context";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading]= useState(false);
  const navigate = useNavigate();
  const {setUser} = useContext(AuthContext);
  

const onFinish = async (values) => {
  setLoading(true);
  try {
    const res = await loginUserAPI(values.email, values.password);

    if (res.data) {
      message.success("Đăng nhập thành công");
      localStorage.setItem("access_token", res.data.access_token);
      setUser(res.data.user);
      navigate("/");
    } else {
      notification.error({
        message: "Error login",
        description: JSON.stringify(res.message),
      });
    }
  } catch (error) {
    notification.error({
      message: "Network Error",
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
            Đăng nhập
          </legend>

          {/* ⭐ LOGO KHÔNG ĐỔ BÓNG */}
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
                borderRadius: "50%",   // logo tròn
                objectFit: "cover",
                boxShadow: "none",     // ⭐ bỏ đổ bóng
                border: "none",        // ⭐ bỏ khung
              }}
            />
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
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

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password placeholder="Enter password" onKeyDown={(event)=>{
                if(event.key==='enter') form.submit;
              }} />
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
                type="primary" htmlType="submit" icon={<ArrowRightOutlined />}>
                  Login
                </Button>
                
                <Link to={"/"} style={{ fontWeight: 500 }}>
                  Go to homepage <ArrowRightOutlined />
                </Link>
              </div>
            </Form.Item>

            <Divider>
              <div style={{ textAlign: "center" }}>
                Chưa có tài khoản? <Link to={"/register"}>Đăng ký tại đây</Link>
              </div>
            </Divider>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
};

export default LoginPage;
