import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  withCredentials: true,
});

export const CurrentAuthUser = (token) =>
  api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchAllUserAPI = () => api.get("/all");

// 👇 Toggle follow/unfollow a user
export const toggleFollowAPI = (userId, token) =>
  api.put(`/${userId}/follow`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
