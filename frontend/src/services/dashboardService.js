import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};