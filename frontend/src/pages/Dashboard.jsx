import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import MetricCard from "../components/ui/MetricCard"; 
import { 
  Ticket, ArrowRight, Calendar, CheckCircle, XCircle, 
  IndianRupee, RefreshCcw, Leaf, Shield
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/overview", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
        setIsAdmin(json.is_admin); 
      }
    } catch (err) { console.error("Fetch error:", err); }
  };

  if (!stats) return <div className="p-8 text-warmgray font-heading text-center">Loading Temple Portal...</div>;

  const chartData = [
    { name: "Active", value: stats.active_bookings || 0 },
    { name: "Cancelled", value: stats.cancelled_bookings || 0 }
  ];
  
  // Spiritual Palette: Forest Green for Active, Saffron/Red for Cancelled
  const COLORS = ["#10b981", "#f97316"]; 

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading text-warmgray font-bold">Sri Krishnaswami Temple</h1>
          <p className="text-warmgray/60 mt-1">Welcome back! Here is your spiritual schedule today.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate("/my-epass")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2">
            <span>My E-Pass</span> <Ticket size={18} />
          </button>
          <button onClick={() => navigate("/my-vazhipadu")} className="bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2">
            <span>My Bookings</span> <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <MetricCard title="Total Bookings" value={stats.total_bookings} icon={<Calendar size={22} />} color="gold" />
        <MetricCard title="Active" value={stats.active_bookings} icon={<CheckCircle size={22} />} color="forest" />
        <MetricCard title="Cancelled" value={stats.cancelled_bookings} icon={<XCircle size={22} />} color="coral" />
        <MetricCard title="Total Paid" value={`₹${(stats.total_paid || 0).toLocaleString()}`} icon={<IndianRupee size={22} />} color="saffron" />
        <MetricCard title="Refunded" value={`₹${(stats.total_refunded || 0).toLocaleString()}`} icon={<RefreshCcw size={22} />} color="warmgray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-charcoal rounded-2xl shadow-sm p-8 border border-gold/10">
          <h2 className="font-heading text-2xl mb-8 text-warmgray font-bold">Booking Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8} stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS COLUMN */}
        <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-charcoal p-6 rounded-2xl border border-gold/10 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-warmgray/60">Eco Fee Status</p>
                  <p className="text-2xl font-heading text-warmgray font-bold">{stats.ecoFeePaid ? "Verified" : "Pending"}</p>
               </div>
               <Leaf className="text-emerald-600" size={32} />
            </div>

            {/* UPCOMING VISIT: Redesigned for Ivory Theme */}
            <div className="bg-charcoal p-8 rounded-2xl shadow-xl text-ivory flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calendar size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/10 p-2 rounded-lg"><Calendar size={20} /></div>
                      <h2 className="font-heading text-xl font-bold">Upcoming Visit</h2>
                  </div>
                  {stats.upcomingVisit ? (
                      <div>
                        <p className="text-4xl font-heading font-bold text-saffron">{new Date(stats.upcomingVisit).toDateString()}</p>
                        <p className="text-ivory/50 mt-2 text-sm uppercase tracking-widest font-bold">Confirmed Schedule</p>
                      </div>
                  ) : <p className="text-ivory/40 italic">No poojas scheduled.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}