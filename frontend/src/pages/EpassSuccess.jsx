import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Download } from "lucide-react";

export default function EpassSuccess() {
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
      const res = await fetch("http://localhost:5000/api/epass/my", {
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
    <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-8">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full mb-4"></div>
      <p className="text-slate-500 font-heading font-bold animate-pulse">Syncing your entry pass...</p>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-8">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 text-center max-w-md">
        <h2 className="text-3xl font-heading font-bold text-red-500 mb-4">Pass Missing</h2>
        <p className="text-slate-500 mb-8 font-medium">We couldn't retrieve this specific pass. It may still be generating.</p>
        <button onClick={() => navigate("/epass")} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mandala-bg p-4 sm:p-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-amber-200/50 max-w-md w-full overflow-hidden relative">
        
        {/* Ticket Top Section */}
        <div className="bg-orange-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-1">Darshan Confirmed</h1>
          <p className="text-orange-100 font-medium">Entry E-Pass Generated</p>
          
          {/* Ticket Perforation Left/Right */}
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-ivory rounded-full shadow-inner"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-ivory rounded-full shadow-inner"></div>
        </div>

        {/* QR Section */}
        <div className="p-8 text-center flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-50 shadow-inner mb-6">
            <QRCode value={booking.qr_code || String(id)} size={180} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Scan at Temple Gate</p>

          {/* Ticket Metadata */}
          <div className="w-full space-y-5 text-left border-t border-dashed border-slate-200 pt-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pass ID</p>
                <p className="font-mono text-slate-800 font-bold">{id.slice(0, 8)}...</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gate</p>
                <p className="font-bold text-slate-800">Main Entrance</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <Calendar className="text-orange-600" size={20} />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit Date</p>
                  <p className="font-bold text-slate-800 leading-none">
                    {new Date(booking.visit_date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long" })}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <Clock className="text-orange-600" size={20} />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Slot</p>
                  <p className="font-bold text-slate-800 leading-none">
                    {booking.entry_slots?.start_time} - {booking.entry_slots?.end_time}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 pt-0">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Go to Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}