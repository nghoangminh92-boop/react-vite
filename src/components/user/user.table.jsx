import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {notification, Popconfirm, Table} from 'antd';
import { useState } from "react";
import UpdateUserModal from './updateUser.modal';
import ViewUserDetail from './view.user.detail';
import { deleteUserAPI } from '../../services/api.services';


const UserTable = (props)=>{
  const {dataUsers,loadUser,current,pageSize,total,setCurrent,setPageSize}=props;
  
  const[isModalUpdateOpen,setIsModalUpdateOpen] = useState(false);
  
  const[dataUpdate, setDataUpdate]=useState(null)

  const [dataDetail, setDataDetail]=useState(null);
  const [isDetailOpen, setIsDetailOpen]=useState(false);
  
  const columns = [
    {
      title:"STT",
        render: (_, record,index) => {
      return (
        <>{(index + 1) +(current-1)*pageSize}</>
      )
    }
    },
  {
    title: 'Id',
    dataIndex: '_id',
    render: (_, record) => {
      return (
        <a href='#'
        onClick={()=>{
          setDataDetail(record);
          setIsDetailOpen(true);
        }}
        >{record._id}</a>
      )
    }
  },
  {
    title: 'Full name',
    dataIndex: 'fullName',
    
  },
  {
    title: 'Email',
    dataIndex: 'email',
    
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <div style={{display:"flex", gap:"20px"}}>
        <EditOutlined 
          onClick={()=> {
            setDataUpdate(record);
            setIsModalUpdateOpen(true);
          }}
        style={{cursor:"pointer",color:"orange"}} />

        {/* hàm xóa */}
        <Popconfirm
          title="xóa người dùng"
          description="Bạn chắc chắn xóa user này?"
          onConfirm={()=>handleDeleteUser(record._id)}
          okText="Yes"
          cancelText="No"
          placement="left"
          >

          <DeleteOutlined style={{cursor:"pointer",color:"red"}} />
        </Popconfirm>
        
        </div>
      ),
    },
   ];

   const handleDeleteUser= async(id)=>{
    const res = await deleteUserAPI(id);
    if(res.data){
      notification.success({
        message:"Delete user",
        description:"Xóa user thành công"
      })
      await loadUser();
    }else {
      notification.error({
        message:"Error delete user",
        description:JSON.stringify(res.message)
      })
    }
   }
const onChange = (pagination, filters, sorter, extra) => {  
  
  // neeus thay doi trang : current 
  if(pagination && pagination.current){
    if(pagination.current !== current){
        setCurrent(+pagination.current);//"5" => 5
    }
  }
  // neeus thay doi trang : page
  if(pagination && pagination.pageSize){
    if(pagination.pageSize !== pageSize){
        setPageSize(+pagination.pageSize);//"5" => 5
    }
  }
};

return (
  <>
  <Table columns={columns} 
    dataSource={dataUsers} 
    rowKey={"_id"}
    pagination={
        {
        current: current,
        pageSize: pageSize,
        showSizeChanger: true, //page
        total: total,
        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
        } 
      }
      onChange={onChange}

          />
  <UpdateUserModal
  isModalUpdateOpen={isModalUpdateOpen}
  setIsModalUpdateOpen={setIsModalUpdateOpen}
  dataUpdate={dataUpdate}
  setDataUpdate={setDataUpdate}
  loadUser={loadUser}
  />
  
  <ViewUserDetail
  dataDetail={dataDetail}
  setDataDetail={setDataDetail}
  isDetailOpen={isDetailOpen}
  setIsDetailOpen={setIsDetailOpen}
  loadUser={loadUser}
  />
  </>
  )
}

export default UserTable;