const TodoData = (props) =>{
  //props là biến object {}
  // {
  //   name:"Ren",
  //   age:24,
  //   data:{}
  // }
  const {todoList}=props;

  // const name=props.name;
  // const age=props.age;
  // const data=props.data;



  console.log(">>> check props: ",todoList);  
    return (
    <div className='todo-data'>
        {todoList.map((item,index)=> {
          console.log(">>>check map",item,index)
          return (
            <div className={`todo-item`} key={index.id}>
            <div >
              {item.name}
            </div>
           <button>Delete</button>
           </div>)
          
        })}
        
    
      </div>
    )
}

export default TodoData;