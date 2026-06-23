import { useContext } from "react";
import { AuthContext } from "../components/context/auth.context";
import { Link, Navigate } from "react-router-dom";
import { Button, Result } from "antd";

//cần đăng nhập
const PrivateRoute=(props)=>{
    const { user } = useContext(AuthContext);
    
    if(user && user.id){
        return (
            <>
            {props.children}
            </>
        )
    }
    // return <Navigate to="/login" replace />;
    return (
          <Result
    status="403"
    title="Unauthorized!"
    subTitle="Bạn cần đăng nhập để truy cập trang Posts."
    extra={<Button type="primary"><Link to="/login"> <span>Đăng nhập</span></Link></Button>}
  />  
    )
}

export default PrivateRoute;