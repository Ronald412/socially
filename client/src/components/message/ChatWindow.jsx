import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { sendMessageThunk } from "../../redux/slices/messageSlice";
import { useAuth } from "@clerk/clerk-react";

import { AiOutlinePaperClip } from "react-icons/ai";
import { IoSend } from "react-icons/io5";

const ChatWindow = ({ selectedUser, messages, socket }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]); // array of { file, type }
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text && media.length === 0) return;

    const token = await getToken();
    const formData = new FormData();
    formData.append("text", text || "");

   
    media.forEach(({ file, type }) => {
      if (type === "image") formData.append("images", file);
      else formData.append("videos", file);
    });

    try {
     
      const resultAction = await dispatch(
        sendMessageThunk({ userId: selectedUser.clerkId, formData, token })
      );

      const newMessage = resultAction.payload;
      console.log("newMessage", newMessage);

      
      if (socket && newMessage) {
        socket.emit("sendMessage", {
          receiverClerkId: selectedUser.clerkId,
          message: newMessage,
        });
      }

      setText("");
      setMedia([]);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="flex flex-col h-full pb-20 lg:pb-0">
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
        <img
          src={selectedUser.profileImage || "/default-avatar.png"}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full object-cover border"
        />
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            {selectedUser.fullName}
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isSender = msg.senderId !== selectedUser._id;
          return (
            <div
              key={msg._id}
              ref={scrollRef}
              className={`flex ${
                isSender ? "justify-end" : "justify-start"
              } group`}
            >
              <div
                className={`relative px-4 py-2 rounded-2xl max-w-[75%] break-words text-sm shadow-sm transition-all duration-200 ${
                  isSender
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {/* message text */}
                {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                {/* media rendering */}
                {msg.media?.map((m, i) =>
                  m.type === "image" ? (
                    <img
                      key={i}
                      src={m.url}
                      alt="media"
                      className="rounded-xl mt-2 border border-gray-200 shadow-sm 
                 hover:scale-[1.02] transition-transform duration-200
                 w-[150px] h-auto sm:w-[220px]"
                    />
                  ) : (
                    <video
                      key={i}
                      src={m.url}
                      controls
                      className="rounded-xl mt-2 border border-gray-200 shadow-sm 
                 w-[150px] h-auto sm:w-[220px]"
                    />
                  )
                )}

                {/* timestamp */}
                <p
                  className={`text-[10px] mt-1 text-right ${
                    isSender ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>

                {/* subtle hover indicator */}
                <span
                  className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] top-[-14px] ${
                    isSender ? "right-2 text-blue-400" : "left-2 text-gray-400"
                  }`}
                >
                  {isSender ? "You" : selectedUser.fullName || "User"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3"
      >
        <label className="cursor-pointer">
          <AiOutlinePaperClip className="w-5 h-5 text-gray-500 hover:text-amber-400" />
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden "
            onChange={(e) =>
              setMedia(
                Array.from(e.target.files).map((file) => ({
                  file,
                  type: file.type.startsWith("image") ? "image" : "video",
                }))
              )
            }
          />
        </label>

        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
        >
          <IoSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
