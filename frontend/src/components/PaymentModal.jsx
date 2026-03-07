import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function PaymentModal({
  isOpen,
  onClose,
  puja,
  bookingDate,
  selectedAddons,
  ecoFee,
  totalAmount,
  bookingId, // Added for E-pass
  isEpass,   // Added flag to trigger the exception
  onSuccess
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const authHeader = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 🔍 DEBUG LOG
      console.log("👉 SENDING TO SECURE BACKEND:", {
        is_epass: isEpass,
        puja_id: puja?.id,
        booking_date: bookingDate,
        selected_addons: selectedAddons,
        eco_fee: ecoFee,
        total_amount: totalAmount,
        existing_booking_id: bookingId
      });

      // ✅ EXCEPTION: Only strictly validate puja.id if it is NOT an e-pass
      if (!isEpass && (!puja?.id || !bookingDate)) {
        alert("Selection Error: Please ensure a date is selected.");
        setLoading(false);
        return; 
      }

      let finalBookingId = bookingId;

      // 1️⃣ Create Booking (ONLY for Vazhipadu, skip for E-Pass)
      if (!isEpass) {
        const bookingRes = await axios.post(
          `${API}/vazhipadu/create-booking`,
          {
            puja_id: puja.id,
            booking_date: bookingDate,
            selected_addons: selectedAddons,
            eco_fee: ecoFee,
            total_amount: totalAmount
          },
          authHeader
        );
        finalBookingId = bookingRes.data.booking_id;
      }

      // 2️⃣ Confirm Payment via central payments route
      await axios.post(
        `${API}/payments/confirm`,
        {
          module: isEpass ? "EPASS" : "VAZHIPADU",
          booking_id: finalBookingId,
          amount: totalAmount,
          payment_method: "CARD" 
        },
        authHeader
      );

      // ✅ Success callback to redirect user
      onSuccess(finalBookingId);

    } catch (err) {
      console.error("PAYMENT FLOW ERROR:", err.response?.data || err);
      alert(err.response?.data?.message || "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-white">Confirm Payment</h2>
        <p className="text-gray-400 text-sm mb-6 border-b border-slate-700 pb-4">
          Complete your booking for {puja?.puja_name}
        </p>

        <div className="mb-6 space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span className="font-medium text-white">{bookingDate}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-slate-700">
            <span className="text-white">Amount Payable:</span>
            <span className="text-green-400">₹{totalAmount}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : `Pay ₹${totalAmount}`}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}