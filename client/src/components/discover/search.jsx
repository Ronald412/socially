import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchResults } from "../../redux/slices/searchSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaUserAlt, FaRegImage } from "react-icons/fa";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, posts, fallback, loading } = useSelector(
    (state) => state.search
  );

  const handleSearch = () => {
    if (!query.trim()) return;
    dispatch(fetchSearchResults(query));
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white p-6 pb-20  flex flex-col items-center">
      {/* Search Input */}
      <div className="flex w-full max-w-xl gap-2 mb-6">
        <div className=" w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users or posts..."
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
          />
         
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600  hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
        >
          <FaSearch className=" text-gray-100" /> 
        </button>
      </div>

      {/* Fallback or Loading States */}
      {loading && (
        <p className="text-gray-400 text-sm animate-pulse mb-4">
          Searching, please wait...
        </p>
      )}
      {fallback && (
        <p className="text-yellow-400 text-sm mb-4">
          No direct match found — showing trending content.
        </p>
      )}

      {/* Results */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Users Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-400">
            <FaUserAlt /> Users
          </h2>

          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">No users found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="bg-gradient-to-br from-[#1a1c20] to-[#23272b] rounded-xl overflow-hidden border border-gray-800 cursor-pointer hover:border-blue-500 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="relative">
                    <img
                      src={
                        user.profileImage ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.fullName}
                      className="w-full h-28 object-cover opacity-90"
                    />
                    <div className="absolute bottom-2 left-3 flex items-center gap-2">
                      <img
                        src={
                          user.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <span className="font-semibold">{user.fullName}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-400">
            <FaRegImage /> Posts
          </h2>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <motion.div
                  key={post._id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/")}
                  className="bg-[#1a1c20] rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500 cursor-pointer transition-all shadow-md hover:shadow-lg group"
                >
                  {post.media &&
                    post.media.length > 0 &&
                    (post.media[0].type === "video" ? (
                      <video
                        src={post.media[0].url}
                        className="w-full h-44 object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={post.media[0].url}
                        alt="post"
                        className="w-full h-44 object-cover"
                      />
                    ))}
                  <div className="p-3">
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {post.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
