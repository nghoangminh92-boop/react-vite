import { Button, Drawer, message, notification } from "antd";
import { useState } from "react";
import { handleUpdateFile, updateUserAvatarAPI } from "../../services/api.services";

const ViewUserDetail=(props)=>{
      const {
    isDetailOpen,
    setIsDetailOpen,
    dataDetail,
    setDataDetail,
    loadUser
  } = props;

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);


  const handleOnChangFile=(event)=>{
    if (!event.target.files || event.target.files.length === 0) {
       setSelectedFile(null);
       setPreview(null)
      return;
        }
        // I've kept this example simple by using the first image instead of multiple
        const file =event.target.files[0];
        if(file){
          setSelectedFile(file);
          setPreview(URL.createObjectURL(file));
        }
        
    }

  const handleUpdateUserAvatar = async()=>{
    // step 1 upload file
    const resUpload=await handleUpdateFile(selectedFile,"avatar");
    if(resUpload.data){
      // success
      const newAvatar=resUpload.data.fileUploaded;
      // step 2: update user
      const resUpdateAvatar= await updateUserAvatarAPI(newAvatar,dataDetail._id,dataDetail.fullName,dataDetail.phone)
      if(resUpload.data){
        setIsDetailOpen(false);
        setSelectedFile(null);
        setPreview(null)
        await loadUser();

        notification.success({
        message:"Update User avatar",
        description:"Cập nhật thành công"
        })

      }else {
        notification.error({
        message:"Error update file",
        description:JSON.stringify(resUpdateAvatar.message)
        })
      }
    }else{
      // failed
      notification.error({
        message:"Error upload file",
        description:JSON.stringify(resUpload.message)
        }
      )
    }
  }
  console.log(">>>>check file ",preview);
  
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
    objectFit:"contain"
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
  <input 
        type="file" hidden id="btnUpload"
        // onChange={handleOnChangFile}
        onChange={(event)=>handleOnChangFile(event)}
  />
</div>

{preview &&
     <>   
        <div
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid #00eaff",
              boxShadow: "0 0 20px #00eaff",
              transition: "0.3s",
              objectFit:"contain"
  }}
>
              <img
              
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "0.3s",
                }}
                  src={preview}
                  />
</div>
                <Button type='primary' style={{
      padding: "10px 20px",
      background: "#00eaff",
      color: "#000",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      boxShadow: "0 0 10px #00eaff",
    }}
    onClick={()=>handleUpdateUserAvatar()}
    >Save</Button>
</>
  }

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