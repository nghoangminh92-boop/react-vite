import { Drawer } from "antd";

const ViewUserDetail=(props)=>{
      const {
    isDetailOpen,
    setIsDetailOpen,
    dataDetail,
    setDataDetail,
    loadUser
  } = props;

  return (
    <Drawer title="Chi tiết user"
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