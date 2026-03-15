import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  RefreshCcw,
  LogOut,
  ShieldCheck,
  BarChart3,
  Settings // ✅ Imported Settings icon for Admin Panel
} from "lucide-react";

export default function SidebarAdmin() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Added useLocation to track active links
  const { logout } = useAuth();

  // ✅ Updated Menu: Removed Payments Ledger, Added Admin Panel
  const adminMenu = [
    { name: "Admin Dashboard", icon: BarChart3, path: "/admin" },
    { name: "Admin Panel", icon: Settings, path: "/admin/slots" },
    { name: "User Directory", icon: Users, path: "/admin/users" },
    { name: "Refund Requests", icon: RefreshCcw, path: "/admin/refunds" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen border-r border-amber-100 bg-white p-6 flex flex-col justify-between sticky top-0">
      <div className="overflow-y-auto no-scrollbar">
        
        {/* Header matched to Temple Theme */}
        <div className="flex items-center gap-2 mb-8 text-orange-600">
           <ShieldCheck size={32} />
           <h2 className="font-heading text-3xl font-bold tracking-tight">
             Darshan Pass <span className="text-xl">Admin</span>
           </h2>
        </div>

        <nav className="flex flex-col gap-1">
          {adminMenu.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium group ${
                  isActive 
                    ? "bg-orange-50 text-orange-600 shadow-sm" 
                    : "text-slate-500 hover:bg-orange-50/50 hover:text-orange-600"
                }`}
              >
                <item.icon size={18} className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-amber-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}