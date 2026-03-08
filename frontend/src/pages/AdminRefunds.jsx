import { useEffect, useState } from "react";
import axios from "axios";
// ❌ REMOVED: import MainLayout from "../layouts/MainLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/refunds/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRefunds(res.data.refunds || []);
      }
    } catch (err) {
      console.error("Failed to fetch refunds", err);
    }
  };

  const processRefund = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/refunds/admin/process`, 
        { refund_id: id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Refund ${action} successfully!`);
      fetchRefunds(); // Refresh list
    } catch (err) {
      alert("Error processing refund");
    }
  };

  // ✅ Returning a clean div instead of MainLayout
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-heading text-slate-800 font-bold mb-6">Pending Refund Requests</h1>

      {refunds.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-slate-500 text-center">
          No pending refunds found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {refunds.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate-500 font-bold mb-2 tracking-wide uppercase">
                  {req.booking_type} Booking
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">₹{req.amount}</h3>
                <p className="text-slate-600 mb-4">Reason: <span className="italic">{req.reason}</span></p>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => processRefund(req.id, "APPROVE")}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl transition border border-emerald-200"
                >
                  Approve
                </button>
                <button 
                  onClick={() => processRefund(req.id, "REJECT")}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3 rounded-xl transition border border-rose-200"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}