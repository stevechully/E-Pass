import axios from "axios";
const API = import.meta.env.VITE_API_URL;

// ✅ Updated to accept the 'type' parameter for tabs
export const getServices = async (type) => {
  const res = await axios.get(`${API}/vazhipadu/services?type=${type}`);
  return res.data;
};

export const checkAvailability = async (data) => {
  const res = await axios.post(`${API}/vazhipadu/check-availability`, data);
  return res.data;
};

export const getAddons = async () => {
  const res = await axios.get(`${API}/vazhipadu/addons`);
  return res.data;
};