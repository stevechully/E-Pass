import { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize role from localStorage to persist on refresh
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  const login = (token, userRole, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole); // Store role (ADMIN/USER)
    setRole(userRole);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin"); // Clean up old keys
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Named export for the hook to fix Vite errors
export const useAuth = () => useContext(AuthContext);