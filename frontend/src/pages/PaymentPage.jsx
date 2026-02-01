import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // ⭐ Updated: Extract bookingPayload for Accommodation logic
  const { module, booking_id, amount, bookingPayload } = location.state || {};

  if (!module || !booking_id || !amount) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="bg-slate-800 p-6 rounded-xl">
          <p className="text-red-400">
            Invalid payment session. Please try booking again.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-blue-600 px-4 py-2 rounded"
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
      // 1. Process Payment (Existing Logic)
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
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        
        // 2. ⭐ NEW: Accommodation Specific Confirmation Logic
        if (module === "ACCOMMODATION") {
          try {
            await fetch("http://localhost:5000/api/accommodation/book", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                ...bookingPayload // Sends room details if needed by backend
              })
            });
          } catch (accErr) {
            console.error("Accommodation booking finalization warning:", accErr);
            // We don't block success alert here because payment succeeded
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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Payment Confirmation
        </h1>

        {/* SUMMARY CARD */}
        <div className="bg-slate-700/50 rounded-xl p-6 mb-6 space-y-3 border border-slate-600">
          <p className="flex justify-between">
            <span className="text-gray-400">Service:</span>
            <b className="text-blue-400">{module}</b>
          </p>

          <p className="flex justify-between">
            <span className="text-gray-400">Order ID:</span>
            <b className="font-mono text-sm">{booking_id.toString().slice(0, 8)}...</b>
          </p>

          <div className="border-t border-slate-600 pt-3 flex justify-between items-center mt-2">
            <span className="text-gray-400">Total Amount:</span>
            <b className="text-2xl text-green-400">₹{amount}</b>
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500 shadow-green-900/20 active:scale-95"
          }`}
        >
          {loading ? "Processing Payment..." : "Confirm & Pay"}
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="w-full text-center mt-4 text-gray-500 hover:text-white text-sm"
        >
          Cancel Transaction
        </button>
      </div>
    </div>
  );
}