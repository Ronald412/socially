// socket.js
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../redux/apiUrl";

export const initSocket = (userId) => {
  if (!userId) return null;

  const socket = io(API_BASE_URL.replace("/api", ""), {
    withCredentials: true,
    transports: ["websocket"],
    query: { userId },
  });

  return socket;
};
