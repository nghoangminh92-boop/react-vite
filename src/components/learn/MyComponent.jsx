

import './style.css';
const MyComponent =()=>{
  // const hoidanit="Ren";
  const hoidanit=[1,2,3];  
  return (
    <>
    <div >{JSON.stringify(hoidanit)} & hoidanit update</div>
    <div className="child"
    style={{borderRadius:"10px"}}>child</div>
    </>
  );
}



export default MyComponent;