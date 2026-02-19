import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchAllPosts } from "../../redux/slices/postSlice"; 
import { useAuth } from "@clerk/clerk-react";
const UserLikedPosts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken,isLoaded } = useAuth();
  const { posts } = useSelector((state) => state.posts);
  const { currentAuthUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
        if (!isLoaded) return;
      try {
        const token = await getToken(); 
         dispatch(fetchAllPosts(token));
        
      } catch (err) {
        console.error("Failed to get Clerk token", err);
      }
    };
  
    fetchUser();
  }, [dispatch, getToken, isLoaded]);

  const likedPosts = posts.filter((post) =>
    post.likes.includes(currentAuthUser?._id)
  );

  if (!likedPosts.length) {
    return (
      <p className="text-gray-400 text-center mt-10 text-lg">
        You haven’t liked any posts yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {likedPosts.map((post) => {
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
                    alt="Liked media"
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

export default UserLikedPosts;
