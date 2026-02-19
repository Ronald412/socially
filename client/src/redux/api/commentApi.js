import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/comments`,
});

// 💬 Add comment
export const addCommentAPI = (postId, text, token) =>
  api.post(`/comment/${postId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// 💭 Get all comments
export const getPostCommentsAPI = (postId, token) =>
  api.get(`/comment/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✏️ Update comment
export const updateCommentAPI = (commentId, text, token) =>
  api.patch(`/${commentId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// 🗑️ Delete comment
export const deleteCommentAPI = (commentId, token) =>
  api.delete(`/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// 💬 Reply to comment
export const replyToCommentAPI = (commentId, text, token) =>
  api.post(`/reply/${commentId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ❤️ Like or unlike comment
export const toggleCommentAPI = (commentId, token) =>
  api.patch(`/like/${commentId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
