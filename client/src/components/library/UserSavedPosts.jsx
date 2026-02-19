import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchAllPosts } from "../../redux/slices/postSlice";
import { fetchCurrentAuthUser } from "../../redux/slices/userSlice";
import { useAuth } from "@clerk/clerk-react";

const UserSavedPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts } = useSelector((state) => state.posts);
  const { currentAuthUser } = useSelector((state) => state.user);

  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;

      try {
        const token = await getToken();
        // 1️⃣ Fetch current user again (from backend using Clerk ID)
        await dispatch(fetchCurrentAuthUser(token));
        // 2️⃣ Fetch all posts
        await dispatch(fetchAllPosts(token));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [dispatch, getToken, isLoaded]);

  // Extract just the IDs from user's saved posts
  const savedPostIds = (currentAuthUser?.savedPosts || []).map((p) => p._id);

  // Filter posts that match these IDs
  const savedPosts = posts.filter((post) => savedPostIds.includes(post._id));

  if (!savedPosts.length) {
    return (
      <p className="text-gray-400 text-center mt-10 text-lg">
        You haven’t saved any posts yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {savedPosts.map((post) => {
        const mediaUrl = post.media?.[0]?.url;

        return (
          <motion.div
            key={post._id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(`/post/${post._id}`)}
            className="rounded-xl overflow-hidden bg-[#101826] border border-gray-800 hover:border-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
              {mediaUrl ? (
                mediaUrl.endsWith(".mp4") ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Saved media"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="text-gray-500 text-sm">No media</div>
              )}
            </div>

            <div className="p-3">
              <p className="text-gray-200 text-sm line-clamp-3 whitespace-pre-wrap">
                {post.caption || "No caption provided."}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserSavedPosts;
