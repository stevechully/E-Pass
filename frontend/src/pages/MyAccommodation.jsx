import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { cancelBooking, requestRefund } from "../services/refundService";
import { Bed, Calendar, Clock, Download, Trash2, Home } from "lucide-react";

export default function MyAccommodation() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  async function fetchMyBookings() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/accommodation/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBookings(data.bookings || []);
    } catch {
      alert("Failed to load accommodation bookings");
    } finally {
      setLoading(false);
    }
  }

  const handleCancelAndRefund = async (booking, type) => {
    if (!window.confirm(`Are you sure you want to cancel this ${type.toLowerCase()} and request a refund?`)) return;

    try {
      await cancelBooking(booking.id, type);

      await requestRefund({
        booking_id: booking.id,
        booking_type: type,
        amount: booking.total_amount || booking.amount || 0,
        reason: `User cancelled ${type.toLowerCase()} from dashboard`
      });

      alert(`${type} cancelled and refund requested successfully! ✅`);
      fetchMyBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error processing cancellation.");
    }
  };

  function downloadReceipt(b) {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("GUEST HOUSE RECEIPT", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Guest House: ${b.accommodations.name}`, 20, 50);
    doc.text(`Room Type: ${b.accommodations.accommodation_type}`, 20, 60);
    doc.text(`Check-in: ${new Date(b.check_in_date).toDateString()}`, 20, 70);
    doc.text(`Check-out: ${new Date(b.check_out_date).toDateString()}`, 20, 80);
    doc.text(`Status: ${b.status}`, 20, 90);
    doc.text("RESERVATION CODE:", 20, 110);
    doc.text(b.qr_code || "N/A", 20, 120);
    doc.save(`Accommodation_${b.qr_code}.pdf`);
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="text-slate-800 flex justify-center px-2 sm:px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">My Stays</h1>
          <p className="text-slate-500 font-medium">View your temple guest house bookings and QR passes.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Home className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">You have no upcoming stays.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((b) => {
              const isCancelled = b.status === "CANCELLED";

              return (
                <div key={b.id} className={`bg-white border border-amber-100 rounded-[2rem] p-8 shadow-xl relative overflow-hidden ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                  
                  {/* Status Badge */}
                  <div className="absolute top-6 right-8">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${b.status === "BOOKED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                       {b.status}
                     </span>
                  </div>

                  {/* Info Section */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Bed size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-heading font-bold text-slate-800">
                        {b.accommodations.name}
                      </p>
                      <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                        <Calendar size={16} /> {new Date(b.check_in_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} — {new Date(b.check_out_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                        {b.accommodations.accommodation_type} Room
                      </p>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  {!isCancelled && (
                    <div className="mt-4 p-8 bg-slate-50 rounded-3xl flex flex-col items-center max-w-sm mx-auto border border-slate-100 shadow-inner">
                      {b.qr_code && b.qr_code.startsWith("ACC-") ? (
                        <QRCodeCanvas value={b.qr_code} size={180} level={"H"} includeMargin={true} />
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-400 font-bold">QR Pending Payment</div>
                      )}
                      <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-[0.2em]">{b.qr_code || "PENDING"}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button onClick={() => downloadReceipt(b)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md">
                      <Download size={18} /> Download Receipt
                    </button>

                    {!isCancelled && (
                      <button onClick={() => handleCancelAndRefund(b, "ACCOMMODATION")} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-rose-100">
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