import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSavePost } from "../../redux/slices/postSlice";
import { motion } from "framer-motion";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
function SaveBtn({ postId }) {
     const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { currentAuthUser, loading: userLoading } = useSelector(
    (state) => state.user
  );



  const [isSaved, setIsSaved] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (currentAuthUser?.savedPosts && postId) {
      const saved = currentAuthUser.savedPosts.some(
        (post) => post._id.toString() === postId.toString()
      );
      setIsSaved(saved);
    }
  }, [currentAuthUser, postId]);

  const handleSaved = async () => {
  
    if (!currentAuthUser) return toast.error("Please log in to save videos!");
    if (!postId) return toast.error("Invalid video ID");

    // Optimistic update
    const wasSaved = isSaved;
    setIsSaved(!isSaved);
    setLocalLoading(true);

    try {
          const token = await getToken();
      await dispatch(toggleSavePost({ postId, token })).unwrap();
    } catch (error) {
      // Revert on failure
      setIsSaved(wasSaved);
      toast.error(error?.message || "Failed to toggle bookmark.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleSaved}
      disabled={!postId || localLoading || userLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        isSaved ? "text-amber-400" : "text-white/80 hover:text-amber-400"
      } ${localLoading || userLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isSaved ? "Remove from saved videos" : "Save video"}
    >
      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium text-white/90">
        {isSaved ? "Saved" : "Save"}
      </span>
    </motion.button>
  );
}

export default SaveBtn;
