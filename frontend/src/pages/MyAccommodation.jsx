import { useEffect, useState } from "react";
import jsPDF from "jspdf"; //

export default function MyAccommodation() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  async function fetchMyBookings() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/accommodation/my",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      setBookings(data.bookings);
    }
  }

  // ✅ New PDF Receipt Function
  function downloadReceipt(booking) {
    const doc = new jsPDF(); //

    doc.setFontSize(18); //
    doc.text("Accommodation Receipt", 20, 20); //

    doc.setFontSize(12); //

    doc.text(`Booking ID: ${booking.id}`, 20, 40); //
    doc.text(`Guest: ${booking.accommodations.name}`, 20, 50); //
    doc.text(`Type: ${booking.accommodations.accommodation_type}`, 20, 60); //

    doc.text(
      `Stay: ${booking.check_in_date} to ${booking.check_out_date}`, //
      20,
      70
    );

    doc.text(`Status: ${booking.status}`, 20, 80); //
    doc.text(`QR Code: ${booking.qr_code}`, 20, 90); //

    doc.text(
      `Price per day: ₹${booking.accommodations.price_per_day}`, //
      20,
      100
    );

    doc.text("Thank you for choosing our service!", 20, 130); //

    doc.save(`Accommodation_${booking.id}.pdf`); //
  }

  async function cancelBooking(id) {
    const token = localStorage.getItem("token");

    if (!window.confirm("Cancel this booking?")) return;

    const res = await fetch(
      `http://localhost:5000/api/accommodation/cancel/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Cancelled ✅");
      fetchMyBookings();
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">
        My Accommodation Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-400">No bookings yet.</p>
      )}

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-slate-800 p-5 rounded border border-slate-700 shadow-lg"
          >
            <h2 className="text-xl font-bold text-emerald-400">
              {b.accommodations.name}
            </h2>

            <p className="text-slate-300">Type: {b.accommodations.accommodation_type}</p>

            <p className="text-slate-300">
              Stay: {b.check_in_date} → {b.check_out_date}
            </p>

            <p className="mt-1">
              Status: <span className={b.status === "BOOKED" ? "text-green-400" : "text-red-400"}>{b.status}</span>
            </p>

            <p className="text-blue-400 font-mono mt-1">
              QR: {b.qr_code}
            </p>

            {/* ✅ Actions Section */}
            <div className="flex gap-2 mt-4">
              {b.status === "BOOKED" && (
                <>
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-sm font-bold"
                  >
                    Cancel Booking
                  </button>

                  <button
                    onClick={() => downloadReceipt(b)} //
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors text-sm font-bold"
                  >
                    Download Receipt
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}