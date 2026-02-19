import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Sidebar from "../components/home/Sidebar";

export default function AppMainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#111827] text-gray-100 overflow-hidden">
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* When signed in, show main content */}
        <SignedIn>
          <main
            className={`flex-1 transition-all duration-300 ${
              isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-20"
            } pt-16 lg:pt-0`}
          >
            <Outlet />
          </main>
        </SignedIn>

        {/* When signed out, redirect to login */}
        <SignedOut>
          <Navigate to="/login" replace />
        </SignedOut>
      </div>
    </div>
  );
}
