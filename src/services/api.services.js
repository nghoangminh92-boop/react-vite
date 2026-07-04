// import axios from "axios";
import axios from "./axios.customize";

// ================= USER =================

const createUserAPI = (fullName, email, password, phone) => {
  const URL_BACKEND = "/api/v1/user";
  const data = { fullName, email, password, phone };
  return axios.post(URL_BACKEND, data);
};

const updateUserAPI = (_id, fullName, phone, role) => {
  const URL_BACKEND = "/api/v1/user";
  const data = { _id, fullName, phone, role };
  return axios.put(URL_BACKEND, data);
};

// ⭐ API đổi role dành cho ADMIN
const updateRoleAPI = (id, role) => {
  const URL_BACKEND = `/api/v1/auth/role/${id}`;
  return axios.patch(URL_BACKEND, { role });
};

const fetchAllUserAPI = (current, pageSize) => {
  const URL_BACKEND = `/api/v1/user?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const deleteUserAPI = (id) => {
  const URL_BACKEND = `/api/v1/user/${id}`;
  return axios.delete(URL_BACKEND);
};

const handleUpdateFile = (file, folder) => {
  const URL_BACKEND = `/api/v1/file/upload`;

  let config = {
    headers: {
      "upload-type": folder,
      "Content-Type": "multipart/form-data"
    }
  };

  const bodyFormData = new FormData();
  bodyFormData.append("fileImg", file);

  return axios.post(URL_BACKEND, bodyFormData, config);
};

const updateUserAvatarAPI = (avatar, _id, fullName, phone) => {
  const URL_BACKEND = "/api/v1/user";
  const data = { _id, avatar, fullName, phone };
  return axios.put(URL_BACKEND, data);
};

const registerUserAPI = (fullName, email, password, phone) => {
  const URL_BACKEND = "/api/v1/user/register";
  const data = { fullName, email, password, phone };
  return axios.post(URL_BACKEND, data);
};

const loginUserAPI = (email, password) => {
  const URL_BACKEND = "/api/v1/auth/login";
  const data = { username: email, password, delay: 2000 };
  return axios.post(URL_BACKEND, data);
};

const getAccountAPI = () => {
  const URL_BACKEND = "/api/v1/auth/account";
  return axios.get(URL_BACKEND);
};

const logoutAPI = () => {
  const URL_BACKEND = "/api/v1/auth/logout";
  return axios.post(URL_BACKEND);
};

// ================= FOOD =================

const fetchAllFoodAPI = (current, pageSize) => {
  const URL_BACKEND = `/api/v1/book?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

// ================= POST =================

const createPostAPI = (title, content, image, author, foodId) => {
  const URL_BACKEND = `/api/v1/post`;
  const data = { title, content, image, author, foodId };
  return axios.post(URL_BACKEND, data);
};

const fetchAllPostAPI = (current, pageSize) => {
  const URL_BACKEND = `/api/v1/post?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const fetchPostByIdAPI = (id) => {
  const URL_BACKEND = `/api/v1/post/${id}`;
  return axios.get(URL_BACKEND);
};

const updatePostAPI = (_id, title, content, image, author, foodId) => {
  const URL_BACKEND = `/api/v1/post`;
  const data = { _id, title, content, image, author, foodId };
  return axios.put(URL_BACKEND, data);
};

const deletePostAPI = (id) => {
  const URL_BACKEND = `/api/v1/post/${id}`;
  return axios.delete(URL_BACKEND);
};

// ================= COMMENT =================

const createCommentAPI = (postId, content, user) => {
  const URL_BACKEND = "/api/v1/comment";
  const data = { postId, content, user };
  return axios.post(URL_BACKEND, data);
};

const fetchCommentsByPostAPI = (postId) => {
  const URL_BACKEND = `/api/v1/comment/${postId}`;
  return axios.get(URL_BACKEND);
};

const updateCommentAPI = (_id, content, user) => {
  const URL_BACKEND = "/api/v1/comment";
  const data = { _id, content, user };
  return axios.put(URL_BACKEND, data);
};

const deleteCommentAPI = (id) => {
  const URL_BACKEND = `/api/v1/comment/${id}`;
  return axios.delete(URL_BACKEND);
};

// ================= RATING =================

const ratePostAPI = (foodId, star) => {
  const URL_BACKEND = "/api/v1/rating";
  const data = { foodId, star };
  return axios.post(URL_BACKEND, data);
};

const fetchPostRatingAPI = (foodId) => {
  const URL_BACKEND = `/api/v1/rating/${foodId}`;
  return axios.get(URL_BACKEND);
};

const fetchUserRatingAPI = (foodId) => {
  const URL_BACKEND = `/api/v1/rating/${foodId}/user`;
  return axios.get(URL_BACKEND);
};

// ================= FOOD MENU =================

const fetchMenuAPI = () => {
  const URL_BACKEND = `/api/v1/food/menu`;
  return axios.get(URL_BACKEND);
};

const createDishAPI = (name, description, price, image) => {
  const URL_BACKEND = `/api/v1/food`;
  const data = { name, description, price, image };
  return axios.post(URL_BACKEND, data);
};

const fetchAllDishAPI = () => {
  const URL_BACKEND = `/api/v1/food`;
  return axios.get(URL_BACKEND);
};

const fetchDishByIdAPI = (id) => {
  const URL_BACKEND = `/api/v1/food/${id}`;
  return axios.get(URL_BACKEND);
};

const updateDishAPI = (id, name, description, price, image) => {
  const URL_BACKEND = `/api/v1/food/${id}`;
  const data = { name, description, price, image };
  return axios.put(URL_BACKEND, data);
};

const deleteDishAPI = (id) => {
  const URL_BACKEND = `/api/v1/food/${id}`;
  return axios.delete(URL_BACKEND);
};

const fetchPostsByFoodAPI = (foodId) => {
  const URL_BACKEND = `/api/v1/post/food/${foodId}`;
  return axios.get(URL_BACKEND);
};

// ================= AUTH EXTRA =================

const changePasswordAPI = (oldPassword, newPassword) => {
  const URL_BACKEND = "/api/v1/auth/change-password";
  const data = { oldPassword, newPassword };
  return axios.post(URL_BACKEND, data);
};

const forgotPasswordAPI = (email, phone, newPassword) => {
  const URL_BACKEND = "/api/v1/auth/forgot-password";
  const data = { email, phone, newPassword };
  return axios.post(URL_BACKEND, data);
};

const googleLoginAPI = (credential) => {
  const URL_BACKEND = "/api/v1/auth/google-login";
  const data = { credential };
  return axios.post(URL_BACKEND, data);
};

export {
  createUserAPI,
  updateUserAPI,
  fetchAllUserAPI,
  deleteUserAPI,
  handleUpdateFile,
  updateUserAvatarAPI,
  registerUserAPI,
  loginUserAPI,
  getAccountAPI,
  logoutAPI,
  fetchAllFoodAPI,
  createPostAPI,
  fetchAllPostAPI,
  fetchPostByIdAPI,
  fetchPostsByFoodAPI,
  updatePostAPI,
  deletePostAPI,
  createCommentAPI,
  fetchCommentsByPostAPI,
  updateCommentAPI,
  deleteCommentAPI,
  ratePostAPI,
  fetchPostRatingAPI,
  fetchUserRatingAPI,
  fetchMenuAPI,
  createDishAPI,
  fetchAllDishAPI,
  fetchDishByIdAPI,
  updateDishAPI,
  deleteDishAPI,
  changePasswordAPI,
  forgotPasswordAPI,
  googleLoginAPI,
  updateRoleAPI // ⭐ thêm vào export
};
