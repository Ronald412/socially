import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/messages`,
  withCredentials: true,
});

// 🧠 Get users for sidebar
export const getChatUsersAPI = (token) =>
  api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// 💬 Get messages between logged-in user and another user
export const getMessagesAPI = (userId, token) =>
  api.get(`/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });



export const sendMessageAPI = (userId, formData, token) =>
  api.post(`/${userId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      
    },
  });
