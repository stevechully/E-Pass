import { useEffect, useState } from "react";
import { Users, IndianRupee, Calendar, RefreshCcw, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    } finally {
      setLoading(false);
    }
  }

  // Custom Tooltip for the Recharts BarChart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-orange-600 font-black text-lg flex items-center">
            <IndianRupee size={16} />
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 animate-in fade-in duration-500">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
          <TrendingUp size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-800 tracking-tight">Sri Krishnaswami Temple</h1>
          <p className="text-slate-500 font-medium mt-1">High-level overview of temple operations and revenue.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Users Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
            <h3 className="text-3xl font-heading font-black text-slate-800">{stats.users || "0"}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={28} />
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
            <h3 className="text-3xl font-heading font-black text-slate-800">{stats.bookings || "0"}</h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calendar size={28} />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-heading font-black text-slate-800 flex items-center">
              <IndianRupee size={24} className="text-slate-400 mr-1" />
              {(stats.revenue || 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <IndianRupee size={28} />
          </div>
        </div>

        {/* Refunds Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Refunds</p>
            <h3 className="text-3xl font-heading font-black text-slate-800">{stats.refunds || "0"}</h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <RefreshCcw size={28} />
          </div>
        </div>

      </div>

      {/* Revenue Trends Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-amber-50 shadow-sm">
        <h2 className="font-heading text-xl mb-8 text-slate-800 font-bold flex items-center gap-2">
          Revenue Trends <span className="text-sm font-sans font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest ml-2">Last 7 Days</span>
        </h2>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* Subtle horizontal grid lines */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                dy={15} 
              />
              <YAxis 
                tickFormatter={(value) => `₹${value}`} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff7ed' }} />
              
              {/* Temple Theme Saffron Bars with rounded top corners */}
              <Bar 
                dataKey="revenue" 
                fill="#ea580c" 
                radius={[8, 8, 0, 0]} 
                barSize={48} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}