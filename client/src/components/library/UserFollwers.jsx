import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const UserFollwers = () => {
  const { currentAuthUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const followers = currentAuthUser?.followers || [];

  if (!followers.length) {
    return (
      <p className="text-gray-400 text-center mt-10 text-lg">
        You don't have followers  yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {followers.map((user) => (
        <motion.div
          key={user._id}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(`/profile/${user._id}`)}
          className="bg-[#101826] rounded-xl border border-gray-800 hover:border-blue-600 hover:shadow-lg cursor-pointer overflow-hidden text-center p-4 transition-all"
        >
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-400">
                {user.fullName?.charAt(0) || "U"}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-sm font-semibold text-gray-200 truncate">
            {user.fullName}
          </h3>
        </motion.div>
      ))}
    </div>
  );
};

export default UserFollwers;
