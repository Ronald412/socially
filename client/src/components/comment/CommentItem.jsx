import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  deleteComment,
  updateComment,
  toggleComment,
  replyToComment,
} from "../../redux/slices/commentSlice";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  FaHeart,
  FaEdit,
  FaTrash,
  FaReply,
  FaPaperPlane,
} from "react-icons/fa";
import { motion } from "framer-motion";
import moment from "moment";

const CommentItem = ({ comment }) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
// console.log("comment from CommentItem",comment)
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  // ✅ Update comment
  const handleUpdate = async () => {
    if (!editText.trim()) return;
    const token = await getToken();
    dispatch(updateComment({ commentId: comment._id, text: editText, token }));
    setIsEditing(false);
  };

  // ✅ Delete comment
  const handleDelete = async () => {
    const token = await getToken();
    dispatch(deleteComment({ commentId: comment._id, token }));
  };

  // ✅ Like / Unlike comment
  const handleLike = async () => {
    const token = await getToken();
    dispatch(toggleComment({ commentId: comment._id, token }));
    

  };

  // ✅ Reply to comment
  const handleReply = async () => {
    if (!replyText.trim()) return;
    const token = await getToken();
    dispatch(
      replyToComment({ commentId: comment._id, text: replyText, token })
    );
    setReplyText("");
  };

  return (
    <motion.div
      className="border-b border-gray-800 py-4 flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <img
        src={user?.imageUrl}
        className="w-10 h-10 rounded-full object-cover border border-gray-700"
      />

      <div className="flex-1">
        {/* User Info */}
        <div className="flex justify-between">
          <div>
            <h4 className="text-white font-semibold">
              {comment.user?.fullName}
            </h4>
            <p className="text-gray-400 text-xs">
              {moment(comment.createdAt).fromNow()}
            </p>
          </div>

          <div className="flex gap-3 text-sm">
            {isEditing ? (
              <button
                onClick={handleUpdate}
                className="text-blue-400 hover:text-blue-300"
              >
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-400"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comment Text */}
        <div className="mt-2">
          {isEditing ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-gray-900 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-200 mt-1">{comment.text}</p>
          )}
        </div>

        {/* Like / Reply */}
        <div className="flex items-center gap-5 mt-3 text-gray-400 text-sm">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:text-red-400"
          >
            <FaHeart /> {comment.likesCount || 0}
          </button>

          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 hover:text-blue-400"
          >
            <FaReply /> Reply
          </button>
        </div>

        {/* Replies */}
        {showReplies && (
          <div className="mt-4 ml-10 space-y-3 border-l border-gray-800 pl-4">
            {comment.replies?.map((reply, i) => (
              <div key={i} className="flex gap-2 items-start">
                <img
                  src={reply.user?.profileImage}
                  alt={reply.user?.fullName}
                  className="w-7 h-7 rounded-full border border-gray-700"
                />
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">
                      {reply.user?.fullName}
                    </span>{" "}
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(reply.createdAt).fromNow()}
                  </p>
                  <p className="font-semibold text-white">{reply.text}</p>
                </div>
              </div>
            ))}

            {user && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReply();
                }}
                className="flex items-center gap-2 mt-2"
              >
                <img
                  src={user.imageUrl}
                  alt={user.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-700"
                />
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-full text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;
