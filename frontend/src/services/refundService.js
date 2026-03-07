import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const cancelBooking = async (id, type) => {
  let endpoint = '';
  let payload = {};

  if (type === 'POOJA') {
    endpoint = '/refunds/cancel-pooja';
    payload = { booking_id: id };
  } else if (type === 'EPASS') {
    endpoint = '/refunds/cancel-epass';
    payload = { pass_id: id };
  } else if (type === 'FOOD') {
    endpoint = '/refunds/cancel-food';
    payload = { booking_id: id };
  } else if (type === 'ACCOMMODATION') {
    endpoint = '/refunds/cancel-accommodation';
    payload = { booking_id: id };
  }
  
  const res = await axios.post(`${API}${endpoint}`, payload, getAuthHeaders());
  return res.data;
};

export const requestRefund = async (payload) => {
  const res = await axios.post(`${API}/refunds/request`, payload, getAuthHeaders());
  return res.data;
};

export const getAdminPendingRefunds = async () => {
  const res = await axios.get(`${API}/refunds/admin/pending`, getAuthHeaders());
  return res.data;
};

export const processAdminRefund = async (refundId, action) => {
  const res = await axios.post(`${API}/refunds/admin/process`, { refund_id: refundId, action }, getAuthHeaders());
  return res.data;
};