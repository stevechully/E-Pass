import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { cancelBooking, requestRefund } from '../services/refundService'; // ✅ Imported Refund Service

const API = import.meta.env.VITE_API_URL;

export default function MyVazhipadu() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/vazhipadu/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ ADDED: Cancel + Automatic Refund Request Logic
  const handleCancelAndRefund = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this Pooja and request a refund?")) return;

    try {
      // 1. Mark the pooja as CANCELLED in the DB
      await cancelBooking(booking.id, 'POOJA');

      // 2. Create the refund request in the master refund table
      await requestRefund({
        booking_id: booking.id,
        booking_type: 'POOJA',
        amount: booking.total_amount || 0,
        reason: "User cancelled Vazhipadu from dashboard"
      });

      alert("Pooja cancelled and refund requested successfully! ✅");
      fetchBookings(); // Refresh the list to update status
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error processing cancellation.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">My Vazhipadu Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {booking.vazhipadu_services?.puja_name}
                </h2>

                <p className="text-gray-400 mt-2">
                  Date: {booking.booking_date}
                </p>

                <p className="mt-2">
                  Status:{" "}
                  <span className={booking.status === 'CANCELLED' ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                    {booking.status}
                  </span>
                </p>

                <p className="mt-2">
                  Total Paid: ₹{booking.total_amount}
                </p>
              </div>

              {booking.qr_code && (
                <div className="mt-4 bg-white p-4 rounded-lg w-fit">
                  <QRCodeCanvas value={booking.qr_code} size={120} />
                </div>
              )}

              {/* ✅ ADDED: Action Button */}
              {booking.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleCancelAndRefund(booking)}
                  className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20"
                >
                  Cancel & Request Refund
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}