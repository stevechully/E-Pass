import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { cancelBooking, requestRefund } from "../services/refundService";

export default function MyFoodBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert("Failed to load food bookings");
    } finally {
      setLoading(false);
    }
  }

  // 🔁 Unified Cancel + Refund Flow
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
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error processing cancellation.");
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
    doc.text(b.qr_code, 20, 110);

    doc.save(`FoodBooking_${b.qr_code}.pdf`);
  }

  if (loading) return <p className="p-8 text-white">Loading bookings...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Food Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">No food bookings yet</p>
      ) : (
        <div className="grid gap-6 max-w-2xl">
          {bookings.map(b => (
            <div key={b.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">

              <p className="text-green-400 font-bold uppercase tracking-wider">
                {b.food_slots.meal_type}
              </p>

              <p className="text-xl font-semibold mt-1">
                {new Date(b.food_slots.slot_date).toDateString()}
              </p>

              <p className="text-gray-300">
                {b.food_slots.start_time} - {b.food_slots.end_time}
              </p>

              <p className="mt-2 text-sm">
                Status: <span className={b.status === "BOOKED" ? "text-green-400" : "text-red-400"}>
                  {b.status}
                </span>
              </p>

              <div className="mt-6 p-6 bg-white rounded-xl flex flex-col items-center">
                <QRCodeCanvas value={b.qr_code} size={160} level={"H"} />
                <p className="text-black text-xs font-mono mt-3 font-bold opacity-60">
                  {b.qr_code}
                </p>
              </div>

              <div className="flex gap-4 mt-6">

                {b.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCancelAndRefund(b, "FOOD")}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-lg font-bold transition"
                  >
                    Cancel & Request Refund
                  </button>
                )}

                <button
                  onClick={() => downloadReceipt(b)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-bold transition"
                >
                  Download PDF
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}