import React, { useEffect, useRef, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { FaRegCommentDots } from "react-icons/fa6";
import { incrementPostView } from "../../redux/slices/postSlice";
import LikeBtn from "./LikeBtn";
import SaveBtn from "./SaveBtn";
import { useNavigate } from "react-router-dom";

import CommentsSection from "../comment/CommentsSection";
import FollowBtn from "../creator/FollowBtn";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { user, media, caption, tags, likes, views,commentsCount, createdAt, _id } = post;

  const { comments } = useSelector((state) => state.comments);
    // console.log("comments on  PostCard",comments)
  const [showComments, setShowComments] = useState(false);
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const postRef = useRef(null);

  // 📈 Increment view count once when 70% of post is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          try {
            const token = await getToken();
            dispatch(incrementPostView({ postId: _id, token }));
            observer.disconnect();
          } catch (err) {
            console.error("Error incrementing view:", err);
          }
        }
      },
      { threshold: 0.7 }
    );

    if (postRef.current) observer.observe(postRef.current);
    return () => observer.disconnect();
  }, [dispatch, getToken, _id]);

  return (
    <div
      ref={postRef}
       className="w-full md:w-[400px] lg:w-[450px] bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#0f2027] rounded-2xl shadow-sm mb-8 border border-gray-200 dark:border-neutral-700 overflow-hidden"
    >
      {/* 🧑‍💼 Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-700">
        {/* 👇 Left: user image + name (clickable) */}
        <div
          onClick={() => navigate(`/profile/${user?._id}`)}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={user?.profileImage }
            alt={user?.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {user?.fullName || "Unknown User"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* 👇 Right: Follow button */}
       
         <FollowBtn
            userId={user?._id}
            className="sm:w-40 bg-blue-600 hover:bg-blue-700"
          />
      </div>


      {/* 🎬 Media */}
      <div className="w-full bg-black flex justify-center">
        {media[0]?.type === "video" ? (
          <video
            controls
            className="w-full object-cover aspect-square"
            src={media[0]?.url}
          />
        ) : (
          <img
            src={media[0]?.url}
            alt="Post media"
            className="w-full object-cover aspect-square"
          />
        )}
      </div>

      {/* ❤️ Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <LikeBtn postId={_id} likes={likes} />
          <SaveBtn postId={_id} />
         

          <>
            <button
              onClick={() => setShowComments(true)}
              className=" flex items-center gap-2  text-blue-500 hover:text-blue-400"
            >
            <FaRegCommentDots/> {commentsCount} 
            </button>

            {showComments && (
              <CommentsSection
                postId={post._id}
                onClose={() => setShowComments(false)}
              />
            )}
          </>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {views} {views === 1 ? "view" : "views"}
        </span>
      </div>

      {/* 📝 Caption */}
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          <span className="font-semibold">{user?.fullName}</span> {caption}
        </p>

        {tags?.length > 0 && (
          <div className="text-xs text-blue-500 mt-2 space-x-1">
            {tags.map((tag, idx) => (
              <span key={idx}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
