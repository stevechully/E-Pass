import { useEffect, useState } from "react";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const token = localStorage.getItem("token");
  
    const res = await fetch(
      "http://localhost:5000/api/dashboard/payments",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const data = await res.json();
  
    if (data.success && Array.isArray(data.data)) {
      setPayments(data.data);
    } else {
      setPayments([]); // fallback
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Payments History</h1>

      {payments.length === 0 && (
        <p className="text-gray-400">No payments found</p>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide font-semibold">
                  {p.module} Booking
                </p>
                <p className="text-2xl font-bold mt-1">₹{p.amount}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  p.payment_status === "SUCCESS"
                    ? "bg-green-900/50 text-green-400 border border-green-700"
                    : "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
                }`}
              >
                {p.payment_status}
              </span>
            </div>

            {/* 🔁 Refund Section */}
            {p.refunds && p.refunds.length > 0 && (
              <div className="mt-4 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-blue-300">REFUND INITIATED</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    p.refunds[0].refund_status === "SUCCESS" || p.refunds[0].refund_status === "COMPLETED"
                      ? "bg-green-500 text-white" 
                      : "bg-yellow-500 text-black"
                  }`}>
                    {p.refunds[0].refund_status}
                  </span>
                </div>
                
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-300">Amount to be returned:</span>
                  <span className="font-mono font-bold">₹{p.refunds[0].amount}</span>
                </div>

                {p.refunds[0].refund_status === "PENDING" && (
                  <p className="text-yellow-400 text-xs mt-2 italic flex items-center gap-1">
                    <span>⏳</span> Refund is being processed. Please allow 5-7 business days.
                  </p>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4 font-mono">
              Transaction ID: {p.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}