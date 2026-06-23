// import './todo.css';
// import TodoData from './TodoData';
// import TodoNew from './TodoNew';
// import reactLogo from '../../assets/react.svg';
// import { useState } from 'react';

// const TodoApp=()=>{
//     const [todoList,setTodoList]=useState([
//     // {id:1,name:"Learning React"},
//     // {id:2,name:"Watching Youtube"}
  
//   ])

//   const addNewTodo=(name)=>{
//     const newTodo={
//       id:randomIntFromInterval(1,100000),
//       name:name
//     }

//     setTodoList([...todoList,newTodo])
    
// }
//   const randomIntFromInterval=(min, max)=> { // min and max included 
//   return Math.floor(Math.random() * (max - min + 1) + min);
//   }
  
//   const deleteTodo = (id)=>{
//     const newTodo=todoList.filter(item => item.id !== id)
//     setTodoList(newTodo);
//   }
//   return (
//         <div className="todo-container">
//       <div className="todo-title"> Todo List</div>
//       <TodoNew
//       addNewTodo={addNewTodo}/>
      
//       {/* /* toán từ điều kiện */ }
//       {/* {todoList.length  > 0 &&
//       <TodoData
//       todoList={todoList}/>
//         }


//       {todoList.length === 0 && 
//       <div className="todo-image" >
//         <img src={reactLogo} className="logo"/>
//       </div>
//       } */}
      

//       {todoList.length >0 ?
//                           <TodoData
//                           todoList={todoList}
//                           deleteTodo={deleteTodo}
//                           /> :
//                           <div className="todo-image" >
//                             <img src={reactLogo} className="logo"/>
//                           </div>
//         }

//     </div>
//   )
// }
// export default TodoApp;
import "./todo.css";
import banner from "../../assets/banner.jpg";
import ramen1 from "../../assets/ramen1.jpg";
import ramen2 from "../../assets/ramen2.jpg";
import ramen3 from "../../assets/ramen3.jpg";
import { useContext, useEffect, useState } from "react";
import { Button, notification } from "antd";
import PostForm from "../post/post.form";
import PostsFeedList from "../post/PostsFeedList";
import PostDetail from "../post/post.detail";
import { AuthContext } from "../context/auth.context";
import { fetchAllPostAPI } from "../../services/api.services";

const parsePostListResponse = (res, current, pageSize) => {
  if (!res?.data) {
    return { posts: [], total: 0, current, pageSize };
  }

  if (res.data.result && Array.isArray(res.data.result)) {
    return {
      posts: res.data.result,
      total: +res.data.meta?.total || res.data.result.length,
      current: +res.data.meta?.current || current,
      pageSize: +res.data.meta?.pageSize || pageSize,
    };
  }

  if (Array.isArray(res.data)) {
    const start = (current - 1) * pageSize;
    return {
      posts: res.data.slice(start, start + pageSize),
      total: res.data.length,
      current,
      pageSize,
    };
  }

  return { posts: [], total: 0, current, pageSize };
};

const TodoApp = () => {
  const { user } = useContext(AuthContext);
  const [dataPosts, setDataPosts] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPost = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchAllPostAPI(page, pageSize);

      if (res?.statusCode && res.statusCode >= 400) {
        notification.error({
          message: "Lỗi tải bài viết",
          description: JSON.stringify(res.message),
        });
        if (page === 1) setDataPosts([]);
        setLoading(false);
        return;
      }

      const { posts: newPosts, total: totalCount } = parsePostListResponse(
        res,
        page,
        pageSize
      );

      // Append new posts if loading more, replace if first page
      if (page === 1) {
        setDataPosts(newPosts);
        setCurrent(1);
      } else {
        setDataPosts((prev) => [...prev, ...newPosts]);
        setCurrent(page);
      }

      setTotal(totalCount);
    } catch (error) {
      notification.error({
        message: "Lỗi kết nối",
        description: "Không thể kết nối backend. Hãy kiểm tra server đang chạy tại port 8080.",
      });
      if (page === 1) setDataPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadPost(current + 1);
  };

  const handlePostClick = (post) => {
    setDataDetail(post);
    setIsDetailOpen(true);
  };

  return (
    <div className="home-container">

      {/* HEADER */}
      <div className="home-header">
        <div className="logo">🍜 Food Review</div>
        <div className="nav">
          <span>Menu</span>
          <span>Community</span>
        </div>
      </div>

      {/* BANNER */}
      <div className="home-banner">
        <img src={banner} alt="banner" />
        <div className="banner-text">
          <h1>Discover the Best of Food</h1>
          <p>日本のラーメンを楽しもう</p>
        </div>
      </div>

      {/* FOOD LIST */}
      <div className="food-section">
        <h2 className="section-title">おすすめメニュー</h2>

        <div className="food-list">

          <div className="food-card">
            <img src={ramen1} alt="ramen" />
            <h3>無塩ラーメン</h3>
            <p className="price">980円</p>
          </div>

          <div className="food-card">
            <img src={ramen2} alt="ramen" />
            <h3>極辛ラーメン</h3>
            <p className="price">1030円</p>
          </div>

          <div className="food-card">
            <img src={ramen3} alt="ramen" />
            <h3>チャーシューラーメン</h3>
            <p className="price">1480円</p>
          </div>

        </div>
      </div>

      {/* POSTS FEED SECTION */}
      <div className="posts-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="section-title">Bài viết mới nhất</h2>
          {user?.id && <PostForm loadPost={() => loadPost(1)} />}
        </div>

        <PostsFeedList
          posts={dataPosts}
          onPostClick={handlePostClick}
          loading={loading && dataPosts.length === 0}
        />

        {dataPosts.length > 0 && dataPosts.length < total && (
          <div className="load-more-btn">
            <Button type="primary" size="large" onClick={handleLoadMore} loading={loading}>
              Xem thêm bài viết
            </Button>
          </div>
        )}
      </div>

      {/* POST DETAIL MODAL */}
      <PostDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
      />

    </div>
  );
};

export default TodoApp;
