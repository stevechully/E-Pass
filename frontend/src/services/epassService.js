import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const createEpassBooking = async (payload) => {
  const res = await axios.post(`${API}/epass/create-booking`, payload);
  return res.data;
};

export const confirmEpassPayment = async (bookingId) => {
  const res = await axios.post(`${API}/epass/confirm-payment`, { booking_id: bookingId });
  return res.data;
};