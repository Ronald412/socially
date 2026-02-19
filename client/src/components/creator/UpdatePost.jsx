import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePostThunk, fetchPostById } from "../../redux/slices/postSlice";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FiUpload } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

const UpdatePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { userPosts, currentPost, curPostLoading, loading } = useSelector(
    (state) => state.posts
  );
  console.log("currentPost", currentPost);
  const [mediaType, setMediaType] = useState("image");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState([]);

  const localPost = userPosts.find((p) => p._id === postId);
  const post = localPost || currentPost;

  // Fetch post if not available
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = await getToken();
        if (!localPost) {
          await dispatch(fetchPostById({ postId, token }));
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    };
    fetchPost();
  }, [dispatch, getToken, postId, localPost]);

  // Prefill data
  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setTags(post.tags?.join(", ") || "");
      if (post.media?.length > 0) {
        const type = post.media[0].type === "video" ? "video" : "image";
        setMediaType(type);
        setPreview(post.media.map((m) => m.url));
      }
    }
  }, [post]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const formData = new FormData();

      if (mediaFiles.length > 0) {
        const key = mediaType === "image" ? "images" : "videos";
        mediaFiles.forEach((file) => formData.append(key, file));
      }

      formData.append("caption", caption);
      formData.append("tags", tags);

      await dispatch(updatePostThunk({ postId, formData, token })).unwrap();
      navigate(`/profile/${currentPost.user._id}`);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (curPostLoading || !post) {
    return (
      <div className="text-center text-gray-400 mt-16">
        Loading post details...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto sm:mt-12 bg-gradient-to-b from-[#111827] via-[#1f2937] to-[#111827] 
        text-gray-100 rounded-2xl shadow-2xl border border-gray-800 p-2 pb-20 sm:p-8"
    >
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
        Update Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="relative mt-4">
          <label className="block font-medium mb-2 text-gray-300">
            {mediaType === "image" ? "Change Image(s)" : "Change Video"}
          </label>

          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer 
              bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out"
          >
            <FiUpload className="text-4xl text-yellow-400 mb-2" />
            <span className="text-gray-400 text-sm">
              Click or drag to upload new{" "}
              {mediaType === "image" ? "images" : "video"} (optional)
            </span>
          </label>

          <input
            id="file-input"
            type="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            multiple={mediaType === "image"}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4"
          >
            {mediaType === "image" ? (
              preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-700 hover:scale-[1.03] transition-transform"
                />
              ))
            ) : (
              <video
                controls
                src={preview[0]}
                className="w-full h-44 rounded-lg border border-gray-700"
              />
            )}
          </motion.div>
        )}

        <div>
          <label className="block font-medium mb-2 text-gray-300">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            placeholder="Update caption..."
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-300">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. motivation, startup, ai"
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Post ✨"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UpdatePost;
