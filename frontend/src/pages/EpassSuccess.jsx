import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import QRCode from "react-qr-code"; // Make sure to npm install react-qr-code

export default function EpassSuccess() {
  const { id } = useParams();
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
        // Find the specific booking that matches the ID in the URL
        const currentBooking = data.bookings.find(b => b.id === id);
        setBooking(currentBooking);
      }
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white p-8 text-center mt-20">Loading your pass...</div>;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 text-center mt-20">
        <h2 className="text-2xl font-bold text-red-500">Booking not found!</h2>
        <Link to="/epass" className="text-blue-400 underline mt-4 block">Go back to booking</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full text-center shadow-xl">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-gray-400 mb-6">Payment of ₹20 Eco Fee successful.</p>

        {/* QR Code Section */}
        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
          {booking.qr_code ? (
             <QRCode value={booking.qr_code} size={200} />
          ) : (
             <div className="h-48 w-48 bg-gray-200 flex items-center justify-center text-gray-800 font-bold">
               No QR Generated
             </div>
          )}
        </div>

        <div className="text-left bg-slate-900 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-400">Pass ID</p>
          <p className="font-mono text-lg mb-3">{booking.qr_code}</p>

          <p className="text-sm text-gray-400">Visit Date</p>
          <p className="text-lg mb-3 font-semibold">
            {new Date(booking.visit_date).toLocaleDateString("en-IN", {
              weekday: "long", year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>

          <p className="text-sm text-gray-400">Time Slot</p>
          <p className="text-lg font-semibold">
            {booking.entry_slots?.start_time} - {booking.entry_slots?.end_time}
          </p>
        </div>

        <Link 
          to="/dashboard" // Or wherever you want to send them next
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg w-full block transition-colors"
        >
          View My Dashboard
        </Link>
      </div>
    </div>
  );
}