import axios from "axios";
import { API_BASE_URL } from "../../redux/apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/search`,
  withCredentials: true,
});

export const searchApi = async (query) => {
  const response = await api.get(`/search`, { params: { query } });
  return response.data; // only the data is serializable
};


