import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

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
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-lg font-semibold">
                {booking.vazhipadu_services?.puja_name}
              </h2>

              <p className="text-gray-400 mt-2">
                Date: {booking.booking_date}
              </p>

              <p className="mt-2">
                Status:{" "}
                <span className="text-emerald-400 font-semibold">
                  {booking.status}
                </span>
              </p>

              <p className="mt-2">
                Total Paid: ₹{booking.total_amount}
              </p>

              {booking.qr_code && (
                <div className="mt-4 bg-white p-4 rounded-lg w-fit">
                  <QRCodeCanvas value={booking.qr_code} size={120} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}