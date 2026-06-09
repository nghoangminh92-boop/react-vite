
import { Button, Input } from "antd";
import { useState } from 'react';
const UserForm = ()=>{
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const handleClickBtn= ()=>{
        
    }
    return (
        <div className="user-form"> 
         <div >
            <div>
                <span>FullName</span>
                <Input 
                value={fullName}
                onChange={(event)=>{setFullName(event.target.value)}}
                />
            </div>

            <div>
                <span>Email</span>
                <Input
                value={email}
                onChange={(event)=>{setEmail(event.target.value)}}
                />
            </div>

            <div>
                <span>Password</span>
                <Input.Password
                value={password}
                onChange={(event)=>{setPassword(event.target.value)}}
                />
            </div>

            <div>
                <span>Phone number</span>
                <Input
                value={phone}
                onChange={(event)=>{setPhone(event.target.value)}}
                />
            </div>

            <div>
                <Button
                // onClick={() => handleClickBtn}
                onClick={handleClickBtn}
                type='primary'> Creat User </Button>
            </div>
            
         </div>
        </div>
    )
}
export default UserForm;