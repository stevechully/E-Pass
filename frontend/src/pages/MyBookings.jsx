import { useEffect, useState } from "react";
import { cancelBooking, requestRefund } from '../services/refundService';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  // Handler for the combined Cancel + Refund flow
  const handleCancelAndRefund = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking and request a refund?")) return;

    try {
      // 1. Mark the booking as CANCELLED in the DB
      await cancelBooking(booking.id, booking.type);
      
      // 2. Create a entry in the master refund_requests table
      await requestRefund({
        booking_id: booking.id,
        booking_type: booking.type, // 'POOJA' or 'EPASS'
        amount: booking.total_amount || 20,
        reason: "User requested cancellation via dashboard"
      });
      
      alert("Booking cancelled and refund requested successfully!");
      // Re-fetch bookings to update the UI status
      fetchBookings(); 
    } catch (err) {
      console.error(err);
      alert("Error processing cancellation. Please try again.");
    }
  };

  // ... rest of your component logic (fetchBookings, etc.)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
            <div>
              <p className="font-bold text-white">{booking.type === 'POOJA' ? 'Vazhipadu' : 'E-Pass'}</p>
              <p className="text-sm text-gray-400">{booking.booking_date || booking.visit_date}</p>
              <p className={`text-xs font-bold ${booking.status === 'CANCELLED' ? 'text-red-400' : 'text-green-400'}`}>
                Status: {booking.status}
              </p>
            </div>

            {/* Only show button if booking is still active */}
            {booking.status !== 'CANCELLED' && (
              <button 
                onClick={() => handleCancelAndRefund(booking)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel & Refund
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}