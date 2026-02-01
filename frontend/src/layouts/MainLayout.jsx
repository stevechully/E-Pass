import { Link, useNavigate, useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); // To highlight the active page
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const logout = () => {
    localStorage.clear(); // Clears token, email, and isAdmin
    navigate("/login");
  };

  // ✅ Updated navigation links with Accommodation included
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Book E-Pass", path: "/epass", icon: "🎫" },
    { name: "Food Slots", path: "/food", icon: "🍱" },
    { name: "Accommodation", path: "/accommodation", icon: "🏨" }, // 🆕 Added
    { name: "My E-Passes", path: "/my-epass", icon: "📂" },
    { name: "My Food", path: "/my-food", icon: "🍴" },
    { name: "My Stays", path: "/my-accommodation", icon: "🛌" }, // 🆕 Added
    { name: "Payments", path: "/payments", icon: "💰" },
  ];

  // Add Admin links if applicable
  if (isAdmin) {
    navLinks.push({ name: "Admin Management", path: "/admin", icon: "🛡️" });
    navLinks.push({ name: "User Directory", path: "/admin-users", icon: "👥" });
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-800 flex flex-col fixed inset-y-0 left-0 border-r border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-black tracking-tighter text-emerald-500">
            E-Pass<span className="text-white">.</span>
          </h2>
          {isAdmin && (
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Administrator
            </p>
          )}
        </div>

        {/* --- DYNAMIC NAVIGATION --- */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
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
                <span className={isActive ? "scale-110" : "opacity-60 group-hover:opacity-100"}>
                  {link.icon}
                </span>
                <span className="text-sm font-semibold">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* --- LOGOUT SECTION --- */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold text-sm"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Navbar */}
        <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center px-8">
          <h1 className="text-lg font-bold text-slate-200">
            {isAdmin ? "Admin Portal" : "Visitor Portal"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-xs text-emerald-400 font-mono">{localStorage.getItem("email")}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs">
              👤
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