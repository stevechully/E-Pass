import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast"; // ✅ Added Toast
import { cancelBooking, requestRefund } from "../services/refundService";
import ConfirmModal from "../components/ui/ConfirmModal"; // ✅ Added Modal
import { Calendar, Clock, Utensils, Trash2, Download } from "lucide-react";

export default function MyFoodBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Modal States
  const [confirmBooking, setConfirmBooking] = useState(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/food/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch {
      toast.error("Failed to load food bookings");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Unified Cancellation Logic (Fired by Modal)
  const executeCancellation = async () => {
    if (!confirmBooking) return;
    setProcessingCancel(true);

    const isFree = confirmBooking.food_slots?.meal_type === "FREE";

    try {
      if (isFree) {
        // FREE MEAL -> Direct Cancel
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/food/cancel/${confirmBooking.id}`, {
          method: "POST", // Assumes your food routes follow the same pattern
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Free meal cancelled successfully! ✅");
        } else {
          throw new Error(data.message || "Failed to cancel meal");
        }
      } else {
        // PAID MEAL -> Refund Flow
        await cancelBooking(confirmBooking.id, "FOOD");
        await requestRefund({
          booking_id: confirmBooking.id,
          booking_type: "FOOD",
          amount: confirmBooking.total_amount || confirmBooking.amount || 0,
          reason: "User cancelled food booking from dashboard"
        });
        toast.success("Paid meal cancelled and refund requested! ✅");
      }
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error processing cancellation.");
    } finally {
      setProcessingCancel(false);
      setConfirmBooking(null); // Close modal
    }
  };

  function downloadReceipt(b) {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("FOOD BOOKING RECEIPT", 105, 20, { align: "center" });
    doc.line(20, 25, 190, 25);
    doc.setFontSize(14);
    doc.text("MEAL DETAILS", 20, 40);
    doc.setFontSize(12);
    doc.text(`Meal Type: ${b.food_slots.meal_type}`, 20, 50);
    doc.text(`Date: ${new Date(b.food_slots.slot_date).toDateString()}`, 20, 60);
    doc.text(`Time: ${b.food_slots.start_time} - ${b.food_slots.end_time}`, 20, 70);
    doc.text(`Status: ${b.status}`, 20, 80);
    doc.text("RESERVATION CODE:", 20, 100);
    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text(b.qr_code || "N/A", 20, 110);
    doc.save(`FoodBooking_${b.qr_code}.pdf`);
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
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">My Meal Coupons</h1>
          <p className="text-slate-500 font-medium">View your active dining hall bookings and manage cancellations.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Utensils className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">You have no food bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => {
              const slot = booking.food_slots;
              const isFree = slot.meal_type === "FREE";
              const isCancelled = booking.status === "CANCELLED";

              return (
                <div key={booking.id} className={`bg-white border border-amber-100 rounded-[2rem] p-8 shadow-xl relative overflow-hidden ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                  
                  <div className="absolute top-6 right-8">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${booking.status === "BOOKED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                       {booking.status}
                     </span>
                  </div>

                  <div className="flex items-start gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      <Utensils size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-heading font-bold text-slate-800">
                        {new Date(slot.slot_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                        <Clock size={16} /> {slot.start_time} - {slot.end_time}
                      </p>
                      <p className={`text-xs font-bold uppercase tracking-widest mt-2 px-2.5 py-1 w-max rounded-md ${isFree ? "bg-green-50 text-green-700" : "bg-indigo-50 text-indigo-700"}`}>
                        {isFree ? "FREE MEAL (ANNADANAM)" : "PAID MEAL"}
                      </p>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="mt-4 p-8 bg-slate-50 rounded-3xl flex flex-col items-center max-w-sm mx-auto border border-slate-100 shadow-inner">
                      {booking.qr_code ? (
                        <QRCodeCanvas value={booking.qr_code} size={180} level={"H"} includeMargin={true} />
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-400 font-bold">QR Pending</div>
                      )}
                      <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-[0.2em]">{booking.qr_code || "PENDING"}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button onClick={() => downloadReceipt(booking)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md">
                      <Download size={18} /> Download PDF
                    </button>

                    {!isCancelled && (
                      <button 
                        onClick={() => setConfirmBooking(booking)} // ✅ Trigger Modal Instead of Alert
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-rose-100"
                      >
                        <Trash2 size={18} /> 
                        {isFree ? "Cancel" : "Cancel & Refund"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ The Reusable Confirmation Modal */}
        <ConfirmModal
          isOpen={!!confirmBooking}
          title={confirmBooking?.food_slots?.meal_type === "FREE" ? "Cancel Free Meal?" : "Cancel & Refund Meal?"}
          message={confirmBooking?.food_slots?.meal_type === "FREE"
            ? "Are you sure you want to cancel this free meal booking? This action cannot be undone."
            : "Are you sure you want to cancel this booking? A refund will be initiated."}
          processing={processingCancel}
          onCancel={() => setConfirmBooking(null)}
          onConfirm={executeCancellation}
        />

      </div>
    </div>
  );
}