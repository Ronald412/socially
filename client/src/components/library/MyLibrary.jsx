import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserFriends,
  FaBookmark,
  FaThumbsUp,
} from "react-icons/fa";
import { FiUserCheck } from "react-icons/fi";
import UserFollowing from "../library/UserFollowing";
import UserFollwers from "../library/UserFollwers";
import UserLikedPosts from "../library/UserLikedPosts";
import UserSavedPosts from "../library/UserSavedPosts";

const MyLibrary = () => {
  const navigate = useNavigate();

  // Default section is "Liked"
  const [activeSection, setActiveSection] = useState("Liked");

  return (
    <div className="min-h-screen bg-[#0f1622] text-gray-100 px-6 pt-6 pb-20">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center">
        {/* Go Back Button */}
        <div className="w-full md:w-auto mb-4 md:mb-0 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition px-2 py-1"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>

        {/* Title */}
        <div className="w-full md:w-auto flex justify-center items-center gap-4">
          <h1 className="text-3xl pb-2 font-bold text-center text-white">
            My Library
          </h1>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveSection("UserFollwers")}
          className={`flex items-center justify-center px-6 py-2 rounded-lg font-medium transition ${
            activeSection === "UserFollwers"
              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FaUserFriends className="md:hidden mr-2" />
          <span className="hidden md:inline">Follwers</span>
        </button>
        <button
          onClick={() => setActiveSection("UserFollowing")}
          className={`flex items-center justify-center px-6 py-2 rounded-lg font-medium transition ${
            activeSection === "UserFollowing"
              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FiUserCheck className="md:hidden mr-2" />
          <span className="hidden md:inline">Following</span>
        </button>

        <button
          onClick={() => setActiveSection("Liked")}
          className={`flex items-center justify-center px-6 py-2 rounded-lg font-medium transition ${
            activeSection === "Liked"
              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FaThumbsUp className="md:hidden mr-2" />
          <span className="hidden md:inline">Liked</span>
        </button>

        <button
          onClick={() => setActiveSection("Saved")}
          className={`flex items-center justify-center px-6 py-2 rounded-lg font-medium transition ${
            activeSection === "Saved"
              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FaBookmark className="md:hidden mr-2" />
          <span className="hidden md:inline">Saved</span>
        </button>
      </div>

      {/* Conditional Sections */}
      {activeSection === "UserFollwers" && (
        <div>
          <UserFollwers />
        </div>
      )}
      {activeSection === "UserFollowing" && (
        <div>
          <UserFollowing />
        </div>
      )}

      {activeSection === "Liked" && (
        <div>
          <UserLikedPosts />
        </div>
      )}

      {activeSection === "Saved" && (
        <div>
          <UserSavedPosts />
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
