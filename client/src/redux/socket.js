// socket.js
import { io } from "socket.io-client";
import { API_BASE_URL } from "./apiUrl";
import { useAuth } from "@clerk/clerk-react";

export const useSocket = () => {
  const { userId } = useAuth(); // Clerk userId

  const socket = io(API_BASE_URL.replace("/api", ""), {
    withCredentials: true,
    transports: ["websocket"],
    query: { userId }, // 👈 Pass Clerk ID to backend
  });

  return socket;
};
