import { useState } from "react";

const TodoNew =(props) =>{
    console.log(">>check props ",props)
    //useState hook (getter/setter)
    // const valueInput="Ren";

    const [valueInput,setValueInput] = useState("Ren")



    const{addNewTodo}=props;
    // addNewTodo("Ren")

    const handleClick=()=>{
        addNewTodo(valueInput);
        setValueInput("");
    }

    const handleOnChange=(name)=>{
        setValueInput(name)

    }
    return (
    <div className='todo-new'>
        <input type="text" 
            onChange={(event)=>{handleOnChange(event.target.value)}}
            value={valueInput}
        />
        <button style={{cursor:"pointer"}}
        onClick={handleClick}
        >Add</button>
        <div>My Text input is = {valueInput} </div>
      </div>
      )
}

export default TodoNew;