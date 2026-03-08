import { useEffect, useState } from "react";
import { Users, Mail, CalendarDays, Search, User, ShieldCheck } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search input
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center p-20 animate-in fade-in duration-500">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-black text-slate-800 tracking-tight">User Directory</h1>
            <p className="text-slate-500 font-medium mt-1">Manage registered devotees and administrators.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <Search className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-500 font-heading text-lg">No users found matching "{searchTerm}".</p>
        </div>
      )}

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUsers.map(u => {
          const isAdmin = u.email === "admin@test.com"; // Matches your Login.jsx logic

          return (
            <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
              
              {/* Decorative Admin Border */}
              {isAdmin && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>}

              {/* Avatar */}
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {isAdmin ? <ShieldCheck size={24} /> : <User size={24} />}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-heading font-bold text-slate-800 truncate text-lg">
                    {u.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  <CalendarDays size={14} />
                  Joined {new Date(u.created_at).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Role Badge */}
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest absolute top-4 right-4 ${
                isAdmin 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {isAdmin ? "Admin" : "User"}
              </span>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}