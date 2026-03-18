import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Ticket, Utensils, Bed, Flame,
  TicketCheck, Coffee, Home, Folder, Calendar, CreditCard, LogOut,
  Users, Undo2, Settings, ShieldCheck
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  // 👤 USER LINKS
  const userLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    
    // ACTION SECTION
    { name: "Book E-Pass", path: "/epass", icon: Ticket },
    { name: "Food Booking", path: "/food", icon: Utensils },
    { name: "Accommodation", path: "/accommodation", icon: Bed },
    { name: "Vazhipadu", path: "/vazhipadu", icon: Flame },
    
    // HISTORY SECTION
    { name: "My E-Pass", path: "/my-epass", icon: TicketCheck },
    { name: "My Food", path: "/my-food", icon: Coffee },
    { name: "My Stays", path: "/my-accommodation", icon: Home },
    { name: "My Vazhipadu", path: "/my-vazhipadu", icon: Folder },
    
    // UTILITIES
    { name: "Pooja Calendar", path: "/calendar", icon: Calendar },
    { name: "Payments", path: "/payments", icon: CreditCard }
  ];

  // 🛡️ ADMIN LINKS
  const adminLinks = [
    { name: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Admin Panel", path: "/admin/slots", icon: Settings },
    { name: "User Directory", path: "/admin/users", icon: Users },
    { name: "Refund Requests", path: "/admin/refunds", icon: Undo2 },
    // Notice Payments Ledger is not here!
  ];

  // Dynamically select the menu based on the user's role
  const menu = user?.role === "ADMIN" ? adminLinks : userLinks;

  return (
    <div className="w-64 h-screen border-r border-amber-100 bg-white dark:bg-charcoal p-6 flex flex-col justify-between sticky top-0">
      <div className="overflow-y-auto no-scrollbar">
        
        {/* Dynamic Header Logo */}
        <div className="flex items-center gap-2 mb-8 text-orange-600">
           {user?.role === "ADMIN" ? <ShieldCheck size={32} /> : <Flame size={32} />}
           <h2 className="font-heading text-3xl font-bold tracking-tight">
             DarshanPass {user?.role === "ADMIN" && <span className="text-xl">Admin</span>}
           </h2>
        </div>

        <nav className="flex flex-col gap-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Render separators for specific sections in the User menu
            const isHistorySection = item.name === "My E-Pass";
            const isUtilitySection = item.name === "Pooja Calendar";
            
            return (
              <div key={item.name}>
                {(isHistorySection || isUtilitySection) && user?.role !== "ADMIN" && (
                  <div className="my-4 border-t border-slate-50 dark:border-slate-800"></div>
                )}
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium group ${
                    isActive 
                      ? "bg-orange-50 text-orange-600 shadow-sm" 
                      : "text-slate-500 hover:bg-orange-50/50 hover:text-orange-600"
                  }`}
                >
                  <Icon size={18} className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`} />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-amber-50">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 p-3 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}