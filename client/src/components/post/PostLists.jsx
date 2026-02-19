import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPosts } from "../../redux/slices/postSlice";
import PostCard from "./PostCard";
import { useAuth } from "@clerk/clerk-react";
const PostLists = () => {
  const dispatch = useDispatch();
  const { posts, postsLoading, error } = useSelector((state) => state.posts);
console.log("posts",posts)
  const { getToken,isLoaded } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
        if (!isLoaded) return;
      try {
        const token = await getToken(); 
         dispatch(fetchAllPosts(token));
        
      } catch (err) {
        console.error("Failed to get Clerk token", err);
      }
    };
  
    fetchUser();
  }, [dispatch, getToken, isLoaded]);

  if (postsLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error || "Something went wrong!"}
      </div>
    );
  }

  return (
  <div className="w-full max-w-2xl mx-auto sm:mt-6 px-3 sm:px-4 md:px-0 pb-24">
    {posts?.length > 0 ? (
      posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))
    ) : (
      <div className="text-center text-gray-500 mt-10">No posts on this platform yet </div>
    )}
  </div>
);

}

export default PostLists;
