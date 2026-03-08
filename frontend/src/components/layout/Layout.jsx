import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarAdmin from "./SidebarAdmin";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion"; // ✅ Added framer-motion import

export default function Layout() {
  const { role } = useAuth(); // ✅ Get role from AuthContext

  return (
    <div className="flex bg-ivory dark:bg-charcoal min-h-screen">
      {/* 🔄 Switch sidebars based on role - This prevents the "flip" back to Visitor */}
      {role === "ADMIN" ? <SidebarAdmin /> : <Sidebar />}

      <div className="flex flex-col flex-1">
        <Navbar />

        {/* 🎬 Animated Main Content Area */}
        <motion.main
          className="p-8 mandala-bg min-h-screen"
          initial={{ opacity: 0, y: 10 }} // Starts invisible and slightly lower
          animate={{ opacity: 1, y: 0 }}  // Fades in and slides up to position
          transition={{ duration: 0.3 }}   // Smooth 0.3s transition
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}