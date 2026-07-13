import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ProfilePage from './pages/profile.jsx';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import BookPage from './pages/book.jsx';
import PostPage from './pages/post.jsx';
import './styles/global.css';
import TodoApp from './components/todo/TodoApp.jsx';
import ErrorPage from './pages/error.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import PrivateRoute from './pages/private.route.jsx';
import MenuPage from './pages/menu.jsx';
import DishPage from './pages/dish.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ContactPage from './pages/contact.jsx';
import "./i18n";

import { GoogleOAuthProvider } from '@react-oauth/google';

import { LanguageProvider } from "./components/context/language.context.jsx";
import { ThemeProvider } from "./components/context/ThemeContext.jsx"; // ⭐ sáng/tối

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement:<ErrorPage/>,
    children:[
      { index:true, element:<TodoApp/> },
      { path:"/users", element:<UserPage/> },
      {
        path:"/dishes",
        element:(
          <PrivateRoute>
            <DishPage/>
          </PrivateRoute>
        )
      },
      {
        path:"/posts",
        element:(
          <PrivateRoute>
            <PostPage/>
          </PrivateRoute>
        )
      },
      { path:"/menu", element:<MenuPage/> },
      { path:"/contact", element:<ContactPage/> },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        )
      },
    ]
  },
  { path:"/login", element:<LoginPage/> },
  { path:"/register", element:<RegisterPage/> },
  { path:"/forgot-password", element:<ForgotPasswordPage/> }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ThemeProvider>
      <AuthWrapper>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </AuthWrapper>
    </ThemeProvider>
  </GoogleOAuthProvider>
) 