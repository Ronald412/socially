import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getPostComments, addComment } from "../../redux/slices/commentSlice";
import CommentItem from "./CommentItem";
import { FaPaperPlane } from "react-icons/fa";

const CommentsSection = ({ postId, onClose }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { comments, loading, error } = useSelector((state) => state.comments);
  console.log("comment from CommentsSection",comments)
  const [text, setText] = useState("");

  // 🧠 Fetch comments
  useEffect(() => {
    const fetch = async () => {
      if (!postId) return;
      const token = await getToken();
      dispatch(getPostComments({ postId, token }));
    };
    fetch();
  }, [postId, dispatch, getToken]);

  // 💬 Add comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = await getToken();
    dispatch(addComment({ postId, text, token }));
    setText("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-neutral-900 w-[90%] max-w-lg max-h-[85vh] rounded-2xl shadow-lg overflow-hidden flex flex-col border border-neutral-700">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-700">
          <h3 className="text-white font-semibold text-sm">Comments</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose size={22} />
          </button>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading && <p className="text-gray-400">Loading comments...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>

        {/* Add Comment Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-neutral-700 p-3 flex items-center gap-3"
        >
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="w-9 h-9 rounded-full object-cover border border-gray-700"
            />
          )}

          <div className="flex-1 flex items-center bg-gray-800/80 rounded-full border border-gray-700 px-4 py-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className={`ml-2 p-2 rounded-full transition ${
                text.trim()
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsSection;
