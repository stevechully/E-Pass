import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react"; // Install this: npm install qrcode.react

const API = import.meta.env.VITE_API_URL;

export default function VazhipaduSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/vazhipadu/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Find this specific booking from the list
        const found = res.data.bookings.find(b => b.id === id);
        setBooking(found);
      } catch (err) {
        console.error("Error fetching success details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Receipt...</div>;

  if (!booking) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
      <h2 className="text-2xl font-bold text-red-400">Booking Not Found</h2>
      <Link to="/dashboard" className="mt-4 text-green-500 underline">Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-400 mb-8">Please present this QR code at the temple counter.</p>

        {/* QR CODE SECTION */}
        <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-inner">
          <QRCodeSVG value={booking.qr_code || booking.id} size={200} />
        </div>

        <div className="text-left space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between">
            <span className="text-gray-400">Service:</span>
            <span className="font-bold">{booking.vazhipadu_services?.puja_name || "Vazhipadu"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span className="font-bold">{booking.booking_date}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-4">
            <span className="text-gray-400">Total Paid:</span>
            <span className="font-bold text-green-400 text-lg">₹{booking.total_amount}</span>
          </div>
        </div>

        <Link 
          to="/dashboard" 
          className="mt-8 block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}