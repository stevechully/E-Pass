import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// 🔴 TEMPORARY DEBUG LOG: Let's see what Vite is actually reading!
// You can delete this console.log once you confirm it's working properly.
console.log("👉 CURRENT API URL:", API);

export const getAllPujas = async () => {
  const res = await axios.get(`${API}/vazhipadu/services`);
  return res.data;
};

// ✅ NEW: Fetch Add-ons
export const getAddons = async () => {
  const res = await axios.get(`${API}/vazhipadu/addons`);
  return res.data;
};

export const checkAvailability = async (data) => {
  const res = await axios.post(`${API}/vazhipadu/check-availability`, data);
  return res.data;
};

export const createBooking = async (data) => {
  const res = await axios.post(`${API}/vazhipadu/create-booking`, data);
  return res.data;
};