import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CreditCard, Smartphone, Globe, Wallet } from "lucide-react"; // Make sure to install lucide-react

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CARD"); // Default to Card

  // ⭐ Extract bookingPayload for Accommodation logic
  const { module, booking_id, amount, bookingPayload } = location.state || {};

  if (!module || !booking_id || !amount) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-red-400 mb-4">
            Invalid payment session. Please try booking again.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  async function handlePayment() {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // 1. Process Payment
      const res = await fetch(
        "http://localhost:5000/api/payments/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            module,
            booking_id,
            amount,
            payment_method: paymentMethod, // ✅ Sending selected method
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        
        // 2. Accommodation Specific Confirmation Logic
        if (module === "ACCOMMODATION") {
          try {
            await fetch("http://localhost:5000/api/accommodation/book", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                ...bookingPayload 
              })
            });
          } catch (accErr) {
            console.error("Accommodation booking finalization warning:", accErr);
          }
        }

        alert("Payment successful ✅");
        
        // Redirect to specific pages
        if (module === 'FOOD') navigate("/my-food");
        else if (module === 'EPASS') navigate("/my-epass");
        else if (module === 'ACCOMMODATION') navigate("/my-accommodation");
        else navigate("/bookings");

      } else {
        alert(data.message || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error");
    }

    setLoading(false);
  }

  // Helper to get icon based on selection
  const getMethodIcon = () => {
    switch (paymentMethod) {
      case "UPI": return <Smartphone className="text-blue-400" />;
      case "NETBANKING": return <Globe className="text-purple-400" />;
      case "WALLET": return <Wallet className="text-orange-400" />;
      default: return <CreditCard className="text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6 font-sans">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Payment Confirmation
        </h1>

        {/* SUMMARY CARD */}
        <div className="bg-slate-700/30 rounded-xl p-6 mb-6 space-y-3 border border-slate-600">
          <p className="flex justify-between items-center border-b border-slate-600 pb-2">
            <span className="text-gray-400">Service</span>
            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold tracking-wider">
              {module}
            </span>
          </p>

          <p className="flex justify-between items-center">
            <span className="text-gray-400">Order ID</span>
            <span className="font-mono text-sm text-slate-300">#{booking_id.toString().slice(0, 8)}</span>
          </p>

          <div className="border-t border-slate-600 pt-3 flex justify-between items-center mt-2">
            <span className="text-gray-400">Total Payable</span>
            <b className="text-3xl font-bold text-white">₹{amount}</b>
          </div>
        </div>

        {/* ✅ PAYMENT METHOD SELECTION */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3 text-gray-400 uppercase tracking-wide">
            Select Payment Method
          </label>
          
          <div className="relative">
            <div className="absolute left-4 top-3.5 pointer-events-none">
              {getMethodIcon()}
            </div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 text-white border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium transition-colors cursor-pointer"
            >
              <option value="CARD">Credit / Debit Card</option>
              <option value="UPI">UPI / BHIM</option>
              <option value="NETBANKING">Net Banking</option>
              <option value="WALLET">Wallets (Paytm, PhonePe)</option>
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-4 top-4 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
            loading
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-95"
          }`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <span>Pay Now</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">₹{amount}</span>
            </>
          )}
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="w-full text-center mt-5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
        >
          Cancel Transaction
        </button>
      </div>
    </div>
  );
}