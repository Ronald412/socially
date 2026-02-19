import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllUser } from "../../redux/slices/userSlice";
import FollowBtn from "../creator/FollowBtn";

const RecomUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchAllUser());
  }, [dispatch]);

  if (loading)
    return <p className="text-gray-500 text-sm px-4">Loading suggestions...</p>;
  if (error) return <p className="text-red-500 text-sm px-4">{error}</p>;
  if (!users?.length) return null;

  return (
    <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-3  h-fit">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Suggested for you
      </h2>

      <div className="flex flex-col gap-3 ">
        {users.slice(0, 8).map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            className="flex border border-gray-500 items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.profileImage || "https://via.placeholder.com/150"}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </h3>
              </div>
            </div>
            <FollowBtn userId={user?._id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecomUsers;
