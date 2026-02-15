import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Globe, Wallet, Receipt } from "lucide-react"; // Install lucide-react

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
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
        setPayments([]); 
      }
    } catch (error) {
      console.error("Failed to load payments", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper for Payment Icons
  const getMethodIcon = (method) => {
    switch (method) {
      case "UPI": return <Smartphone size={16} />;
      case "NETBANKING": return <Globe size={16} />;
      case "WALLET": return <Wallet size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  if (loading) return <div className="p-8 text-white">Loading history...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <Receipt className="text-emerald-400 w-8 h-8" />
        <h1 className="text-3xl font-bold">Payments History</h1>
      </div>

      {payments.length === 0 && (
        <div className="text-center py-20 bg-slate-800 rounded-2xl border border-slate-700 border-dashed">
          <p className="text-gray-400 text-lg">No payments found yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              
              {/* Left Side: Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">
                    {p.module}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-3xl font-bold mt-2">₹{p.amount}</p>
                
                {/* ✅ Payment Method Display */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  {getMethodIcon(p.payment_method)}
                  <span>Paid via {p.payment_method || "CARD"}</span>
                </div>
              </div>

              {/* Right Side: Status */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    p.payment_status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {p.payment_status}
                </span>
                <p className="text-[10px] text-gray-600 font-mono">
                  ID: {p.id.split('-')[0]}...
                </p>
              </div>
            </div>

            {/* 🔁 Refund Section */}
            {p.refunds && p.refunds.length > 0 && (
              <div className="mt-5 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">Refund Status</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    p.refunds[0].refund_status === "SUCCESS" || p.refunds[0].refund_status === "COMPLETED"
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {p.refunds[0].refund_status}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Refund Amount</span>
                  <span className="font-mono font-bold text-white">₹{p.refunds[0].amount}</span>
                </div>

                {p.refunds[0].refund_status === "PENDING" && (
                  <p className="text-yellow-500/80 text-xs mt-3 flex items-center gap-1.5">
                    <span className="animate-pulse">⏳</span> Processing... allows 5-7 business days.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}