import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { cancelBooking, requestRefund } from '../services/refundService';
import { Flame, Calendar, IndianRupee, Trash2, Download, UserRound } from "lucide-react"; // ✅ Added UserRound Icon

const API = import.meta.env.VITE_API_URL;

export default function MyVazhipadu() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/vazhipadu/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAndRefund = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this Pooja and request a refund?")) return;

    try {
      await cancelBooking(booking.id, 'POOJA');

      await requestRefund({
        booking_id: booking.id,
        booking_type: 'POOJA',
        amount: booking.total_amount || 0,
        reason: "User cancelled Vazhipadu from dashboard"
      });

      alert("Pooja cancelled and refund requested successfully! ✅");
      fetchBookings(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error processing cancellation.");
    }
  };

  function downloadReceipt(booking) {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("OFFICIAL VAZHIPADU RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Pooja: ${booking.vazhipadu_services?.puja_name}`, 20, 40);
    doc.text(`Date: ${new Date(booking.booking_date).toDateString()}`, 20, 50);
    
    // ✅ Added Devotee Details to PDF
    doc.text(`Devotee: ${booking.devotee_name}`, 20, 65);
    doc.text(`Nakshathram: ${booking.nakshathram}`, 20, 75);

    doc.text(`Total Paid: Rs. ${booking.total_amount}`, 20, 95);
    doc.text(`Status: ${booking.status}`, 20, 105);
    
    doc.text("RESERVATION CODE:", 20, 125);
    doc.setFont("courier", "bold");
    doc.text(booking.qr_code || "N/A", 20, 135);
    doc.save(`Vazhipadu_${booking.qr_code || booking.id}.pdf`);
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="text-slate-800 flex justify-center px-2 sm:px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">My Vazhipadu</h1>
          <p className="text-slate-500 font-medium">View your booked Poojas, download receipts, and manage offerings.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Flame className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">You have no Pooja bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => {
              const isCancelled = booking.status === "CANCELLED";

              return (
                <div key={booking.id} className={`bg-white border border-amber-100 rounded-[2rem] p-8 shadow-xl relative overflow-hidden ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                  
                  {/* Status Badge */}
                  <div className="absolute top-6 right-8">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${booking.status === "BOOKED" || booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                       {booking.status}
                     </span>
                  </div>

                  {/* Info Section */}
                  <div className="flex items-start gap-4 mb-6 mt-2">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <Flame size={28} />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold text-slate-800">
                        {booking.vazhipadu_services?.puja_name}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                        <p className="text-slate-500 font-bold flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" /> 
                          {new Date(booking.booking_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md w-max">
                          <IndianRupee size={14} /> {booking.total_amount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ NEW: Devotee Details Display */}
                  <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <UserRound size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Devotee Details</p>
                      <p className="text-sm font-black text-slate-700">
                        {booking.devotee_name} <span className="text-slate-300 mx-2">|</span> <span className="text-saffron">{booking.nakshathram}</span>
                      </p>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  {!isCancelled && (
                    <div className="mt-4 p-8 bg-slate-50 rounded-3xl flex flex-col items-center max-w-sm mx-auto border border-slate-100 shadow-inner">
                      {booking.qr_code ? (
                        <QRCodeCanvas 
                          // ✅ Updated QR Payload to include Name and Nakshathram
                          value={`${booking.qr_code}|${booking.devotee_name}|${booking.nakshathram}`} 
                          size={180} 
                          level={"H"} 
                          includeMargin={true} 
                        />
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-400 font-bold">QR Pending</div>
                      )}
                      <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-[0.2em]">{booking.qr_code || "PENDING"}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button onClick={() => downloadReceipt(booking)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md">
                      <Download size={18} /> Download Receipt
                    </button>

                    {!isCancelled && (
                      <button onClick={() => handleCancelAndRefund(booking)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-rose-100">
                        <Trash2 size={18} /> Cancel & Refund
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}