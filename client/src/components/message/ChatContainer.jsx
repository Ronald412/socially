import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchChatUsers,
  fetchMessages,
  addNewMessage,
} from "../../redux/slices/messageSlice";
import { useSocket } from "../../redux/socket";
import UserChat from "./UserChat";
import ChatWindow from "./ChatWindow";
import { HiMenuAlt2 } from "react-icons/hi";
import { useLocation } from "react-router-dom";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { chatUsers, messages } = useSelector((state) => state.messages);

  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);


  const socket = useSocket();
const location = useLocation();
const preselectedUser = location.state?.selectedUser || null;

const [selectedUser, setSelectedUser] = useState(preselectedUser);



  // ✅ Real-time listener
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => dispatch(addNewMessage(message));
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, dispatch]);

  // 🧠 Load all chat users
  useEffect(() => {
    const loadUsers = async () => {
      const token = await getToken();
      dispatch(fetchChatUsers(token));
    };
    loadUsers();
  }, [dispatch, getToken]);

  // 💬 Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    const loadMessages = async () => {
      const token = await getToken();
      dispatch(fetchMessages({ userId: selectedUser.clerkId, token }));
    };
    loadMessages();
  }, [selectedUser, dispatch, getToken]);

  return (
    <div
      className={
        "relative flex h-screen bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300"
      }
    >
      {/* USERS PANEL */}
      <div
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 
        ${isUserPanelOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 w-3/4 sm:w-1/2 md:w-1/3`}
      >
        <UserChat
          users={chatUsers}
          onSelect={(user) => {
            setSelectedUser(user);
            setIsUserPanelOpen(false); // close on mobile after selecting user
          }}
          selectedUser={selectedUser}
        />
      </div>

      {/* CHAT PANEL */}
      <div className="flex-1 md:w-2/3 relative">
        {selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            socket={socket}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Select a user to start chatting 💬
          </div>
        )}

        {/* Mobile “Users” toggle button */}
        <button
          onClick={() => setIsUserPanelOpen(!isUserPanelOpen)}
          className="md:hidden absolute top-3 right-3 z-50 p-2 bg-amber-600 text-white rounded-full shadow-md hover:bg-amber-700 transition-all"
        >
          <HiMenuAlt2 className="w-5 h-5" />
        </button>

        {/* Overlay when user panel is open (for mobile) */}
        {isUserPanelOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsUserPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
