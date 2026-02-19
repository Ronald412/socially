import React from "react";
import RecomUsers from "./RecomUsers";
import PostLists from "../post/PostLists";

function Home() {
  return (
    <div  className="flex flex-col md:flex-row justify-center md:justify-between max-w-[1200px] mx-auto px-2 sm:px-4 md:pl-24 mt-6 md:mt-8 gap-6 md:gap-10">
      {/* MAIN FEED (Posts) */}
      <div className="w-full md:w-[65%] lg:w-[60%]">
        <PostLists />
      </div>

      {/* SIDEBAR (Recommended Users) — visible from md and up */}
      <div className="hidden md:block w-[280px] lg:w-[300px] shrink-0 mr-20">
        <RecomUsers />
      </div>
    </div>
  );
}

export default Home;
