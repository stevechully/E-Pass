import { useState } from "react";
import axios from "axios";
import { IndianRupee, Loader2, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code";

const API = import.meta.env.VITE_API_URL;

export default function PaymentModal({
  isOpen, onClose, puja, bookingDate, selectedAddons, ecoFee, totalAmount,
  bookingId, isEpass, moduleName, onSuccess
}) {

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  if (!isOpen) return null;

  const upiString =
    `upi://pay?pa=templeportal@upi&pn=TemplePortal&am=${totalAmount}&cu=INR`;

  const processPayment = async () => {
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

        finalBookingId =
          bookingRes.data.booking_id ||
          bookingRes.data.booking?.id ||
          bookingRes.data.id;
      }

      await axios.post(
        `${API}/payments/confirm`,
        {
          module: moduleName || (isEpass ? "EPASS" : "VAZHIPADU"),
          booking_id: finalBookingId,
          amount: totalAmount,
          payment_method: paymentMethod
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
      <div className="bg-white dark:bg-charcoal p-8 rounded-3xl w-full max-w-md border border-amber-200/50 shadow-2xl">

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-orange-600" size={28} />
          <h2 className="text-3xl font-heading font-bold text-slate-800 dark:text-white">
            Secure Payment
          </h2>
        </div>

        <p className="text-slate-500 text-sm mb-6 border-b pb-4">
          {isEpass
            ? "Confirming your Temple Booking..."
            : `Complete your booking for ${puja?.puja_name}`}
        </p>

        {/* Booking Info */}
        <div className="mb-6 space-y-4">

          <div className="flex justify-between">
            <span className="font-bold">Booking Date</span>
            <span className="font-bold">
              {new Date(bookingDate).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center text-2xl font-black pt-4 border-t">
            <span>Payable</span>
            <span className="text-orange-600 flex items-center gap-1">
              <IndianRupee size={20} /> {totalAmount}
            </span>
          </div>

        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">

          <p className="font-bold mb-3 text-sm">Select Payment Method</p>

          <div className="flex gap-3">

            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`flex-1 border rounded-xl py-3 font-semibold
              ${paymentMethod === "CASH"
                ? "border-orange-500 bg-orange-50"
                : "border-slate-200"}`}
            >
              Cash
            </button>

            <button
              onClick={() => setPaymentMethod("GPAY")}
              className={`flex-1 border rounded-xl py-3 font-semibold
              ${paymentMethod === "GPAY"
                ? "border-orange-500 bg-orange-50"
                : "border-slate-200"}`}
            >
              GPay
            </button>

          </div>

        </div>

        {/* GPay QR Section */}
        {paymentMethod === "GPAY" && (
          <div className="mb-6 text-center">

            <p className="text-sm text-slate-500 mb-3">
              Scan using Google Pay
            </p>

            <div className="bg-white p-4 inline-block rounded-xl border">
              <QRCode value={upiString} size={180} />
            </div>

            <p className="text-xs text-slate-400 mt-3">
              UPI: templeportal@upi
            </p>

            <button
              onClick={processPayment}
              disabled={loading}
              className="w-full mt-5 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : "I have paid"}
            </button>

          </div>
        )}

        {/* Cash Button */}
        {paymentMethod === "CASH" && (
          <button
            onClick={processPayment}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md"
          >
            {loading
              ? <Loader2 className="animate-spin"/>
              : `Pay ₹${totalAmount}`}
          </button>
        )}

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}