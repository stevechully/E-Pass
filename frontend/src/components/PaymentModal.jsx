import { useState } from "react";
import axios from "axios";
import { IndianRupee, Loader2, ShieldCheck } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function PaymentModal({
  isOpen, onClose, puja, bookingDate, selectedAddons, ecoFee, totalAmount, bookingId, isEpass, 
  moduleName, // ✅ Added to support different modules like FOOD
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault(); 
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      if (!isEpass && (!puja?.id || !bookingDate)) {
        alert("Selection Error: Please ensure a date is selected.");
        setLoading(false);
        return; 
      }

      let finalBookingId = bookingId;

      if (!isEpass) {
        const bookingRes = await axios.post(`${API}/vazhipadu/create-booking`,
          { puja_id: puja.id, booking_date: bookingDate, selected_addons: selectedAddons, eco_fee: ecoFee, total_amount: totalAmount },
          authHeader
        );
        finalBookingId = bookingRes.data.booking_id || bookingRes.data.booking?.id || bookingRes.data.id;
      }

      // 2️⃣ Confirm Payment via central payments route
      await axios.post(`${API}/payments/confirm`,
        {
          // ✅ Uses the passed moduleName or defaults to EPASS/VAZHIPADU
          module: moduleName || (isEpass ? "EPASS" : "VAZHIPADU"), 
          booking_id: finalBookingId,
          amount: totalAmount,
          payment_method: "CARD" 
        },
        authHeader
      );

      onSuccess(finalBookingId);
    } catch (err) {
      console.error("PAYMENT FLOW ERROR:", err.response?.data || err);
      alert(err.response?.data?.message || "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal p-8 rounded-3xl w-full max-w-md border border-amber-200/50 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-orange-600" size={28} />
          <h2 className="text-3xl font-heading font-bold text-slate-800 dark:text-white tracking-tight">Secure Payment</h2>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 border-b border-slate-100 pb-4 font-medium">
          {isEpass ? "Confirming your Temple Booking..." : `Complete your booking for ${puja?.puja_name}`}
        </p>

        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-bold">Booking Date</span>
            <span className="text-slate-800 font-bold dark:text-white">
              {new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center text-2xl font-black mt-4 pt-6 border-t border-slate-100">
            <span className="text-slate-800 font-heading dark:text-white">Payable</span>
            <span className="text-orange-600 flex items-center gap-1">
              <IndianRupee size={22} /> {totalAmount}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={handlePayment} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md glow-saffron transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center text-lg">
            {loading ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${totalAmount}`}
          </button>
          <button type="button" onClick={onClose} disabled={loading} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}