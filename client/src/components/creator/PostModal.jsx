import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import CommentsSection from "../comment/CommentsSection";

const PostModal = ({ post, onClose }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
        <div className="bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-300 hover:text-white"
          >
            <IoClose size={24} />
          </button>

          {/* Post content */}
          <div className="flex flex-col md:flex-row">
            <div className="flex-1">
              {post.media[0].type === "video" ? (
                <video
                  src={post.media[0].url}
                  controls
                  className="w-full h-auto object-cover"
                />
              ) : (
                <img
                  src={post.media[0].url}
                  alt="post"
                  className="w-full h-auto object-cover"
                />
              )}
            </div>

            <div className="w-full md:w-[400px] p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {post.user.fullName}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{post.caption}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  className="text-blue-500 font-semibold"
                  onClick={() => setShowComments(true)}
                >
                  View Comments ({post.commentsCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👉 Comments Modal OUTSIDE */}
      {showComments && (
        <CommentsSection
          postId={post._id}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
};

export default PostModal;
