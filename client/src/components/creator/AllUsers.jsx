import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllUser } from "../../redux/slices/userSlice";
import FollowBtn from "./FollowBtn";
import { FaArrowLeft } from "react-icons/fa";
const AllUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error } = useSelector((state) => state.user);
  console.log(" users", users);
  useEffect(() => {
    dispatch(fetchAllUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto  p-6 pb-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
        Featured Users
      </h1>
      {/* Go Back Button */}
      <div className="w-full md:w-auto py-4 md:mb-0 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition px-2 py-1"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:scale-[1.03] border border-transparent hover:border-blue-500/30 relative overflow-hidden group"
          >
            {/* background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 flex flex-col items-center text-center p-4">
              {/* Profile Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-gray-200 ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-300">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl font-semibold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors duration-300">
                {user.fullName}
              </h2>

              {/* Follow Button */}
              <div
                className="flex justify-center w-full mt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <FollowBtn
                  userId={user?._id}
                  className="flex-1 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700  rounded-full transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
