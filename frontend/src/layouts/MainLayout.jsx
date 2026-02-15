import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Ticket, 
  Utensils, 
  BedDouble, 
  FolderOpen, 
  Coffee, 
  CreditCard, 
  Shield, 
  Users, 
  LogOut, 
  User,
  Menu
} from "lucide-react";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const logout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  // ✅ Updated navigation links with Lucide Icons
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Book E-Pass", path: "/epass", icon: Ticket },
    { name: "Food Slots", path: "/food", icon: Utensils },
    { name: "Accommodation", path: "/accommodation", icon: BedDouble },
    { name: "My E-Passes", path: "/my-epass", icon: FolderOpen },
    { name: "My Food", path: "/my-food", icon: Coffee },
    { name: "My Stays", path: "/my-accommodation", icon: BedDouble }, // Reusing BedDouble or could use Home
    { name: "Payments", path: "/payments", icon: CreditCard },
  ];

  // Add Admin links
  if (isAdmin) {
    navLinks.push({ name: "Admin Management", path: "/admin", icon: Shield });
    navLinks.push({ name: "User Directory", path: "/admin-users", icon: Users });
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-800 flex flex-col fixed inset-y-0 left-0 border-r border-slate-700 z-20">
        <div className="p-6 border-b border-slate-700 flex items-center gap-2">
          {/* Replaced Text/Dot with a cleaner logo look */}
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Ticket size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">
              E-Pass
            </h2>
            {isAdmin && (
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                Administrator
              </p>
            )}
          </div>
        </div>

        {/* --- DYNAMIC NAVIGATION --- */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const IconComponent = link.icon; // Get the component reference

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <IconComponent 
                    size={20} 
                    className={isActive ? "scale-105" : "opacity-70 group-hover:opacity-100"} 
                />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* --- LOGOUT SECTION --- */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-4 py-3 rounded-xl transition-all font-semibold text-sm group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Navbar */}
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center px-8">
          <h1 className="text-lg font-semibold text-slate-200">
            {isAdmin ? "Admin Portal" : "Visitor Portal"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm text-emerald-400 font-medium">{localStorage.getItem("email")}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}