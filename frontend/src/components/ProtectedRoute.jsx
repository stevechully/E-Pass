import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // STRICT CHECK: Catches null, undefined, and accidental "undefined" strings
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    // Clean up corrupted storage before bouncing
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  // Token is valid, render the requested page
  return <Outlet />;
}