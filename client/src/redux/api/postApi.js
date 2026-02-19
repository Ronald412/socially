import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/posts`,
  withCredentials: true,
});

export const createPost = (formData, token) =>
  api.post("/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Clerk JWT
    },
  });

export const fetchAllPost = (token) =>
  api.get("/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const getPostById = (postId, token) =>
  api.get(`/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
export const getUserPostsAPI = (userId) => api.get(`/${userId}/posts`);

export const fetchCurrentPost = (token) =>
  api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ❤️ Like / Unlike Video
export const toggleLike = (postId, token) =>
  api.post(
    `/like/${postId}`,
    {}, // empty body since it's a toggle
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// 🔖 Save / Unsave Post
export const toggleSave = (postId, token) =>
  api.put(`/save/${postId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// 👁️ Increment View Count
export const incrementView = (postId, token) =>
  api.post(`/view/${postId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// 📝 Update Post
export const updatePost = (postId, formData, token) =>
  api.put(`/update/${postId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ❌ Delete Post
export const deletePost = (postId, token) =>
  api.delete(`/delete/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
