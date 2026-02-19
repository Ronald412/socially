import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../redux/slices/postSlice";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FiUpload, FiImage, FiVideo } from "react-icons/fi";

const CreatePosts = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { loading } = useSelector((state) => state.posts);

  const [mediaType, setMediaType] = useState("image");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mediaFiles.length === 0) {
      alert("Please select at least one media file.");
      return;
    }

    const formData = new FormData();
    if (mediaType === "image") {
      mediaFiles.forEach((file) => formData.append("images", file));
    } else {
      mediaFiles.forEach((file) => formData.append("videos", file));
    }

    formData.append("caption", caption);
    formData.append("tags", tags);

    const token = await getToken();
    dispatch(createPost({ formData, token }));
  };

  const clearPreview = () => {
    setPreview([]);
    setMediaFiles([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto  sm:mt-12 bg-gradient-to-b from-[#111827] via-[#1f2937] to-[#111827] 
        text-gray-100 rounded-2xl shadow-2xl border border-gray-800 pb-20 p-6 sm:p-8 relative overflow-hidden"
    >
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
        Create Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Media Type Switch */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMediaType("image");
              clearPreview();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              mediaType === "image"
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FiImage className="text-lg" /> Image
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType("video");
              clearPreview();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              mediaType === "video"
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FiVideo className="text-lg" /> Video
          </button>
        </div>

        {/* File Picker */}
        <div className="relative mt-4">
          <label className="block font-medium mb-2 text-gray-300">
            {mediaType === "image" ? "Select Image(s)" : "Select a Video"}
          </label>

          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer 
              bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out"
          >
            <FiUpload className="text-4xl text-blue-400 mb-2" />
            <span className="text-gray-400 text-sm">
              Click or drag to upload {mediaType === "image" ? "images" : "video"}
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

        {/* Preview */}
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

        {/* Caption */}
        <div>
          <label className="block font-medium mb-2 text-gray-300">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            placeholder="Write something creative..."
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          ></textarea>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium mb-2 text-gray-300">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. motivation, startup, ai"
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Create Post 🚀"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreatePosts;
