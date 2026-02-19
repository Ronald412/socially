import React from "react";
import { Routes, Route } from "react-router-dom";
import AppAuthLayout from "./AppAuthLayout";
import AppMainLayout from "./AppMainLayout";
import ProtectedRoute from "./ProtectedRoute";

// import Home from "../pages/Home";
import Signup from "../components/register/Signup";
import Login from "../components/register/Login";
import CreatePosts from "../components/creator/CreatePosts";
import ProfilePage from "../components/creator/ProfilePage";
import AllUsers from "../components/creator/AllUsers";
import MyLibrary from "../components/library/MyLibrary";
import SearchBar from "../components/discover/search";
import ChatContainer from "../components/message/ChatContainer";
import UpdatePost from "../components/creator/UpdatePost";
import Home from "../components/home/Home";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AppAuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* MAIN APP ROUTES */}
      <Route element={<AppMainLayout />}>
        {/* Public routes */}

        <Route path="/" element={<Home />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/all-users" element={<AllUsers />} />
        <Route path="/library" element={<MyLibrary />} />
        <Route path="/search" element={<SearchBar />} />
        <Route path="/update/:postId" element={<UpdatePost />} />

        {/* Creator protected routes */}
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatContainer />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
