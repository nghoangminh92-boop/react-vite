import { Button, Drawer } from "antd";

const ViewUserDetail=(props)=>{
      const {
    isDetailOpen,
    setIsDetailOpen,
    dataDetail,
    setDataDetail,
  } = props;

  return (
    <Drawer title="Chi tiết user"
    width={"40vw"}
    onClose={()=>{
        setDataDetail(null);
        setIsDetailOpen(false);
    }}
    open={isDetailOpen}
    >
    {dataDetail? <>
        <p>Id:{dataDetail._id}</p>
        <br />
        <p>Full name:{dataDetail.fullName}</p>
        <br />
        <p>Email:{dataDetail.email}</p>
        <br />
        <p>Phone:{dataDetail.phone}</p>
        <br />
        <p>Avatar:</p>
        
        <div
  style={{
    width: 220,
    height: 220,
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #00eaff",
    boxShadow: "0 0 20px #00eaff",
    transition: "0.3s",
  }}
  className="avatar-pro"
>
  <img
    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail?.avatar}`}
    onError={(e) => {
      e.target.src = "/default-avatar.png";
    }}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "0.3s",
    }}
  />
</div>

<div style={{ margin: "20px 20px", display: "flex" }}>
  <label htmlFor="btnUpload"
    style={{
      padding: "10px 20px",
      background: "#00eaff",
      color: "#000",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      boxShadow: "0 0 10px #00eaff",
    }}>Upload Avatar</label>
  <input type="file" hidden id="btnUpload"/>
</div>
{/* <Button type='primary'>Upload Avatar</Button> */}



        </>
        :
        <>
            <p>Không có dữ liệu</p>
        </>
    }
    </Drawer>
  )
}

export default ViewUserDetail;