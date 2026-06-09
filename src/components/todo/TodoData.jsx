const TodoData = (props) =>{

  const {todoList, deleteTodo}=props;

  // const name=props.name;
  // const age=props.age;
  // const data=props.data;

  const handleClick =(id)=>{
    deleteTodo(id)
  }

    return (
    <div className='todo-data'>
        {todoList.map((item,index)=> {
          return (
            <div className={`todo-item`} key={item.id}>
            <div >{item.name}</div>
           <button 
           onClick={()=> handleClick(item.id)}
           
           style={{cursor:"pointer"}}>Delete</button>
           </div>
          )
          
        })}
        
    
      </div>
    )
}

export default TodoData;