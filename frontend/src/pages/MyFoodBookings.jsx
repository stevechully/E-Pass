import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ For visual QR codes
import { jsPDF } from "jspdf"; // ✅ For professional PDF generation

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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      alert("Failed to load food bookings");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to cancel this food booking?")) return;

    const res = await fetch(`http://localhost:5000/api/food/cancel/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (data.success) {
      // ✅ Detailed Alert for better UX
      alert(
        "✅ Booking Cancelled Successfully!\n\n" +
        "💰 Refund Initiated\n" +
        "ℹ️ Please check the 'Payments' page to track your refund status."
      );
      fetchBookings();
    } else {
      alert(data.message || "Cancel failed");
    }
  }

  // ✅ UPGRADED: Professional PDF Generation
  function downloadReceipt(b) {
    const doc = new jsPDF();

    // PDF Styling & Content
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("FOOD BOOKING RECEIPT", 105, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("MEAL DETAILS", 20, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Meal Type: ${b.food_slots.meal_type}`, 20, 50);
    doc.text(`Date: ${new Date(b.food_slots.slot_date).toDateString()}`, 20, 60);
    doc.text(`Time: ${b.food_slots.start_time} - ${b.food_slots.end_time}`, 20, 70);
    doc.text(`Status: ${b.status}`, 20, 80);

    doc.setFont("helvetica", "bold");
    doc.text("RESERVATION CODE:", 20, 100);
    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text(b.qr_code, 20, 110);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("Please show this receipt at the counter to collect your meal.", 105, 140, { align: "center" });

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
            <div
              key={b.id}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div>
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
                    Status:{" "}
                    <span className={b.status === "BOOKED" ? "text-green-400" : "text-red-400"}>
                      {b.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* ✅ VISUAL QR CODE DISPLAY */}
              <div className="mt-6 p-6 bg-white rounded-xl flex flex-col items-center justify-center">
                <QRCodeCanvas 
                  value={b.qr_code} 
                  size={160} 
                  level={"H"} // High error correction
                  includeMargin={false}
                />
                <p className="text-black text-xs font-mono mt-3 font-bold opacity-60">
                  {b.qr_code}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                {b.status === "BOOKED" && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => downloadReceipt(b)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition"
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