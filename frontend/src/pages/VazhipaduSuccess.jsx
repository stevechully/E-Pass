import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, Calendar, IndianRupee } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function VazhipaduSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No secure token found.");

        const res = await axios.get(`${API}/vazhipadu/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Find the specific booking. (Checks both string and number formats just in case)
        const found = res.data.bookings.find(b => String(b.id) === String(id));
        setBooking(found);

      } catch (err) {
        console.error("Error fetching success details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // 🌀 Custom Loader
  if (loading) {
    return (
      <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-12 w-12 border-b-4 border-orange-600 rounded-full mb-4"></div>
        <p className="text-slate-500 font-heading font-bold text-lg animate-pulse">Generating your divine receipt...</p>
      </div>
    );
  }

  // ⚠️ Fallback if backend hasn't synced the booking fast enough
  if (!booking) {
    return (
      <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gold/10 text-center max-w-md">
          <h2 className="text-3xl font-heading text-slate-800 font-bold mb-4">Payment Successful!</h2>
          <p className="text-slate-500 mb-8 font-medium">
            Your transaction is complete, but we are waiting for the registry to sync the ticket. You can view it safely in your bookings.
          </p>
          <button
            onClick={() => navigate("/my-vazhipadu")}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // ✅ Success Ticket UI
  return (
    <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-4 sm:p-8 animate-in zoom-in-95 duration-500">
      
      <div className="bg-white dark:bg-charcoal rounded-3xl shadow-2xl border border-amber-200/50 p-8 sm:p-10 max-w-md w-full text-center">
        
        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm">
            <CheckCircle size={40} className="text-orange-600" />
          </div>
        </div>

        <h1 className="text-4xl font-heading text-slate-800 font-bold mb-2">
          Booking Confirmed
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Please present this QR code at the temple counter.
        </p>

        {/* QR Ticket */}
        <div className="bg-white p-6 rounded-2xl inline-block mb-8 border border-slate-100 shadow-sm">
          <QRCodeSVG
            value={booking.qr_code || String(booking.id)}
            size={180}
            level="H" // High error correction for easier scanning
          />
        </div>

        {/* Booking Details */}
        <div className="text-left space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Offering</span>
            <span className="font-black text-slate-800 text-right max-w-[150px] truncate">
              {booking.vazhipadu_services?.puja_name || "Temple Vazhipadu"}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <Calendar size={14} /> Date
            </span>
            <span className="font-black text-slate-800">
              {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <IndianRupee size={14} /> Paid
            </span>
            <span className="text-orange-600 font-black text-xl">
              ₹{booking.total_amount}
            </span>
          </div>

        </div>

        {/* Navigation */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 block w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md glow-saffron transition-all active:scale-95 text-lg"
        >
          Return to Dashboard
        </button>

      </div>
    </div>
  );
}