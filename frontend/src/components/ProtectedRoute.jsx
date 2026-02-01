import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // If there is no token, bounce the user to the login page immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the token exists, render whatever child route the user is trying to access
  return <Outlet />;
}