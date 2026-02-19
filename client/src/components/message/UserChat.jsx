import React from "react";

const UserChat = ({ users, onSelect, selectedUser }) => {
  
  return (
    <div className="flex flex-col h-full ">
      <h2 className="text-lg font-semibold px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100">
        Messages
      </h2>

      <div className="flex-1 overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() =>  onSelect(user)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedUser?._id === user._id
                  ? "bg-gray-100 dark:bg-gray-700"
                  : ""
              }`}
            >
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100">
                  {user.fullName}
                </h3>
               
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserChat;
