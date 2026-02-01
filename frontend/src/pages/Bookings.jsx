import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Step 1: Import useNavigate

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate(); // ✅ Step 2: Initialize navigate

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/dashboard/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error("Fetch bookings failed:", err);
    }
  }

  async function cancelBooking(id, module) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module,
          booking_id: id,
          reason_code: "USER_CANCELLED",
        }),
      });

      if (res.ok) {
        fetchBookings(); // refresh the list
      }
    } catch (err) {
      console.error("Cancellation failed:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-400 mt-1">Manage your e-passes, food, and stays.</p>
        </div>
        
        {/* Navigation back to Dashboard */}
        <button 
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-20 bg-slate-800 rounded-2xl border border-dashed border-slate-700">
          <p className="text-gray-400">No bookings found in your history.</p>
        </div>
      )}

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg"
          >
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold tracking-wide uppercase text-blue-400">
                  {b.module}
                </p>
                <span className="text-gray-600">|</span>
                <p className="text-gray-400 text-sm">ID: {b.id.slice(0, 8)}...</p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${b.status === "CANCELLED" ? "bg-red-500" : "bg-green-500"}`}></span>
                <p className="text-sm font-medium">
                  Status:{" "}
                  <span className={b.status === "CANCELLED" ? "text-red-400" : "text-green-400"}>
                    {b.status}
                  </span>
                </p>
              </div>

              <p className="text-gray-500 text-xs mt-3">
                Reserved on: {new Date(b.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {b.status !== "CANCELLED" && (
                <button
                  onClick={() => cancelBooking(b.id, b.module)}
                  className="flex-1 md:flex-none border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white px-5 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
              )}

              {/* ✅ Details Button: Now links to the dynamic detail page */}
              <button 
                onClick={() => navigate(`/booking/${b.module}/${b.id}`)}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all text-sm font-semibold shadow-md shadow-blue-900/20"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}