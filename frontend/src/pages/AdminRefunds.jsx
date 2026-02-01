import { useEffect, useState } from "react";

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/refunds", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRefunds(data.data || []); // Ensure fallback to array
      }
    } catch (err) {
      console.error("Error fetching refunds:", err);
    }
  }

  async function completeRefund(id) {
    // 🔍 DEBUG LOG 1: Verify click
    console.log("👉 CLICKED COMPLETE REFUND FOR ID:", id);

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/refunds/${id}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await res.json();
      
      // 🔍 DEBUG LOG 2: Check server response
      console.log("👉 SERVER RESPONSE:", data);

      if (data.success) {
        alert("Refund processed successfully ✅");
        fetchRefunds(); // Refresh list
      } else {
        alert("Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      alert("Network error connecting to server");
    }
  }

  return (
    <div className="p-8 text-white min-h-screen bg-slate-900">
      <h1 className="text-3xl mb-6 font-bold">Pending Refunds</h1>

      {refunds.length === 0 && <p className="text-gray-400">No pending refunds found.</p>}

      <div className="grid gap-4">
        {refunds.map(r => (
          <div key={r.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm uppercase">Module</p>
                <p className="font-bold text-lg text-blue-400">{r.module}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm uppercase">Amount</p>
                <p className="font-bold text-xl text-green-400">₹{r.amount}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Status: <span className="text-yellow-400 font-semibold">{r.refund_status}</span>
            </p>

            <button
              onClick={() => completeRefund(r.id)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md active:scale-95"
            >
              Mark as Completed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}