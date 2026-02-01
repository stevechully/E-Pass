import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/dashboard/overview",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const json = await res.json();
      
      if (json.success) {
        setStats(json.data);
        // ✅ Sync admin status from local storage
        setIsAdmin(localStorage.getItem("isAdmin") === "true"); 
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  if (!stats) return <MainLayout><div className="p-8 text-gray-500">Loading your dashboard...</div></MainLayout>;

  return (
    <MainLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "Admin Access Granted 🛡️" : "Welcome back! Here is what's happening today."}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/my-epass")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>My E-Pass</span>
            <span className="text-lg">🎫</span>
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View My Bookings</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Bookings" value={stats.total_bookings} color="bg-blue-600" icon="📅" />
        <Card title="Active Bookings" value={stats.active_bookings} color="bg-green-600" icon="✅" />
        <Card title="Cancelled" value={stats.cancelled_bookings} color="bg-red-600" icon="❌" />
        <Card title="Total Paid" value={`₹${stats.total_paid?.toLocaleString()}`} color="bg-purple-600" icon="💰" />
        <Card title="Refunded" value={`₹${stats.total_refunded?.toLocaleString()}`} color="bg-orange-500" icon="🔄" />
        <Card title="Eco Fee Status" value={stats.ecoFeePaid ? "Verified" : "Pending"} color="bg-emerald-600" icon="🌿" />
      </div>

      {/* ✅ UPDATED ADMIN CONTROLS SECTION */}
      {isAdmin && (
        <div className="mt-10 p-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SLOT MANAGEMENT */}
            <button 
              onClick={() => navigate("/admin")}
              className="bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl border border-slate-700 transition flex flex-col items-start gap-2 group"
            >
              <span className="font-bold text-lg group-hover:text-green-400 transition-colors">Slot Management</span>
              <span className="text-sm text-gray-400">
                Create & manage entry + food slots
              </span>
            </button>

            {/* USER DIRECTORY */}
            <button 
              onClick={() => navigate("/admin-users")}
              className="bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl border border-slate-700 transition flex flex-col items-start gap-2 group"
            >
              <span className="font-bold text-lg group-hover:text-green-400 transition-colors">User Directory</span>
              <span className="text-sm text-gray-400">
                View registered users
              </span>
            </button>

            {/* ✅ NEW: REFUND REQUESTS (Styled to match) */}
            <button 
              onClick={() => navigate("/admin/refunds")}
              className="bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl border border-slate-700 transition flex flex-col items-start gap-2 group"
            >
              <span className="font-bold text-lg group-hover:text-green-400 transition-colors">💸 Refund Requests</span>
              <span className="text-sm text-gray-400">
                View & process pending refunds
              </span>
            </button>

          </div>
        </div>
      )}

      {/* UPCOMING VISIT SECTION */}
      <div className="mt-10 bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-lg text-2xl">📍</div>
            <h2 className="text-xl font-bold">Upcoming Visit Details</h2>
          </div>

          {stats.upcomingVisit ? (
            <div>
              <p className="text-3xl font-bold text-blue-400">
                {new Date(stats.upcomingVisit).toDateString()}
              </p>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">Confirmed Schedule</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">No visits scheduled at the moment.</p>
          )}
        </div>

        <button
          onClick={() => navigate("/bookings")}
          className="w-full md:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-all"
        >
          Manage Schedule
        </button>
      </div>
    </MainLayout>
  );
}

/**
 * PREMIUM CARD COMPONENT
 */
function Card({ title, value, color, icon = "📊" }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 
                    rounded-2xl shadow-md p-6 
                    hover:shadow-2xl hover:-translate-y-2 
                    transition duration-300 border border-gray-100 group">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white text-2xl mb-5 shadow-lg group-hover:scale-110 transition duration-300`}>
        {icon}
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-tight">{title}</h3>
      <p className="text-4xl font-black text-gray-900 mt-2">{value ?? 0}</p>
    </div>
  );
}