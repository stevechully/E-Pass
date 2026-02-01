// Centralized API configuration
export const API_BASE_URL = "http://localhost:5000/api";

/**
 * Utility to generate authorization headers
 * @returns {Object} Headers object containing the Bearer token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

/**
 * Optional: Wrapper for fetch to handle common errors
 */
export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};