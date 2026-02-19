import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { currentAuthUser } = useSelector((state) => state.user);
  
  if (!currentAuthUser) {
    return <Navigate to="/" replace />;
  }

  // Otherwise → allow access
  return children;
}
