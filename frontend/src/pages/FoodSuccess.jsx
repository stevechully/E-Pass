import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { CheckCircle, Calendar, Clock, Utensils, ArrowRight } from "lucide-react";

export default function FoodSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  async function fetchBookingDetails() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/food/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const currentBooking = data.bookings.find(b => String(b.id) === String(id));
        setBooking(currentBooking);
      }
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full mb-4"></div>
      <p className="text-slate-500 font-heading font-bold animate-pulse">Generating your meal coupon...</p>
    </div>
  );

  if (!booking) return (
    <div className="flex flex-col items-center justify-center p-8 animate-in fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 text-center max-w-md w-full">
        <h2 className="text-3xl font-heading font-bold text-red-500 mb-4">Coupon Missing</h2>
        <p className="text-slate-500 mb-8 font-medium">We couldn't retrieve this coupon. It may still be syncing.</p>
        <button onClick={() => navigate("/my-food")} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold">View My Food</button>
      </div>
    </div>
  );

  const slot = booking.food_slots;

  return (
    <div className="p-4 sm:p-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-amber-200/50 max-w-md w-full overflow-hidden relative">
        
        {/* Ticket Top Section */}
        <div className="bg-emerald-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-1">Meal Confirmed</h1>
          <p className="text-emerald-100 font-medium">Temple Dining Hall Coupon</p>
          
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-ivory rounded-full shadow-inner"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-ivory rounded-full shadow-inner"></div>
        </div>

        {/* QR Section */}
        <div className="p-8 text-center flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-50 shadow-inner mb-6">
            <QRCode value={booking.qr_code || String(id)} size={180} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Scan at Dining Hall</p>

          {/* Ticket Metadata */}
          <div className="w-full space-y-5 text-left border-t border-dashed border-slate-200 pt-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Coupon ID</p>
                <p className="font-mono text-slate-800 font-bold">{booking.qr_code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <p className="font-bold text-emerald-600">{slot.meal_type === "FREE" ? "Annadanam" : "Paid Meal"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <Calendar className="text-orange-600" size={20} />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                  <p className="font-bold text-slate-800 leading-none">
                    {new Date(slot.slot_date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long" })}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <Clock className="text-orange-600" size={20} />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Slot</p>
                  <p className="font-bold text-slate-800 leading-none">
                    {slot.start_time} - {slot.end_time}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 pt-0">
          <button 
            onClick={() => navigate("/my-food")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            View All My Food Bookings <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}