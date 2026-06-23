import UserForm from "../components/user/user.form";
import UserTable from "../components/user/user.table";
import { fetchAllUserAPI } from '../services/api.services';

import { useEffect, useState } from "react";

const UserPage =()=>{
    // lift-up-state
     const [dataUsers,setDataUsers]=useState([]);
     const[current,setCurrent]=useState(1);
     const[pageSize,setPageSize]=useState(10);
     const[total,setTotal]=useState(0);

    //  emtty array=> run once
    //not empty => next value !== prev value
   useEffect(() => {
    loadUser();
  }, [current]);//[]+ condition



    const loadUser=async()=>{
          const res=await fetchAllUserAPI(current,pageSize);
          if(res.data){
            setDataUsers(res.data.result);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
          }
          
        }
    return (
        
            <div style={{padding:"20px"}}>
                <UserForm loadUser={loadUser}/>
                <UserTable 
                dataUsers={dataUsers}
                loadUser={loadUser}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                /> 
            </div>
        
    )
}
export default UserPage;