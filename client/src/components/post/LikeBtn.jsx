import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { toggleLike } from "../../redux/slices/postSlice";
import { useAuth } from "@clerk/clerk-react";

const LikeBtn = ({ postId, likes = [] }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.posts);
  const { currentAuthUser } = useSelector((state) => state.user);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes.length);
  const { getToken } = useAuth();
  
  useEffect(() => {
    if (currentAuthUser) {
      setLiked(likes.includes(currentAuthUser._id));
    }
  }, [likes, currentAuthUser]);

  const handleLike = async () => {
    if (!currentAuthUser) return toast.error("Please log in to like videos.");
    const wasLiked = liked;
    setLiked(!liked);
    setLikesCount((prev) => prev + (liked ? -1 : 1));
    try {
      const token = await getToken();
      await dispatch(toggleLike({ postId, token })).unwrap();
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => prev + (wasLiked ? 1 : -1));
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
        liked
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-400 hover:bg-blue-500"
      }`}
    >
      {liked ? (
        <FaThumbsUp className="text-lg" />
      ) : (
        <FaRegThumbsUp className="text-lg" />
      )}
      <span className="font-medium">{likesCount}</span>
    </motion.button>
  );
};

export default LikeBtn;
