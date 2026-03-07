import { Routes, Route, Navigate } from "react-router-dom";

// Standard Auth & Core Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Payments from "./pages/Payments";
import PaymentPage from "./pages/PaymentPage"; 

// Module Pages
import EpassBooking from "./pages/EpassBooking";
import MyEpass from "./pages/MyEpass";
import MyFoodBookings from "./pages/MyFoodBookings";
import FoodBooking from "./pages/FoodBooking"; 
import AccommodationBooking from "./pages/AccommodationBooking";
import MyAccommodation from "./pages/MyAccommodation";

// ✅ VAZHIPADU RESTRUCTURED IMPORTS
import VazhipaduHome from "./pages/VazhipaduHome";       // Landing with 2 Cards
import DailyPoojaList from "./pages/DailyPoojaList";     // Filtered Regular List
import SpecialPoojaList from "./pages/SpecialPoojaList"; // Filtered Special List
import VazhipaduBooking from "./pages/VazhipaduBooking"; // The Booking Engine
import MyVazhipadu from "./pages/MyVazhipadu";
import VazhipaduSuccess from "./pages/VazhipaduSuccess";
import PoojaCalendar from "./pages/PoojaCalendar";

// Admin Pages
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminRefunds from "./pages/AdminRefunds";

import EpassSuccess from './pages/EpassSuccess';

export default function App() {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/booking/:module/:id" element={<BookingDetails />} />
        <Route path="/payments" element={<Payments />} />

        {/* E-Pass & Food */}
        <Route path="/epass" element={<EpassBooking />} />
        <Route path="/my-epass" element={<MyEpass />} />
        <Route path="/food" element={<FoodBooking />} />
        <Route path="/my-food" element={<MyFoodBookings />} />
        <Route path="/epass/success/:id" element={<EpassSuccess />} />

        {/* Accommodation */}
        <Route path="/accommodation" element={<AccommodationBooking />} />
        <Route path="/my-accommodation" element={<MyAccommodation />} />

        {/* 🔥 🔥 VAZHIPADU ARCHITECTURE (RESTRUCTURED) 🔥 🔥 */}
        {/* 1. The Hub */}
        <Route path="/vazhipadu" element={<VazhipaduHome />} /> 
        
        {/* 2. The Categorized Lists */}
        <Route path="/vazhipadu/daily" element={<DailyPoojaList />} />
        <Route path="/vazhipadu/special" element={<SpecialPoojaList />} />
        
        {/* 3. The Functional Engine (used by both lists) */}
        <Route path="/vazhipadu/book/:id" element={<VazhipaduBooking />} />
        
        {/* 4. Post-Booking & Info */}
        <Route path="/vazhipadu/success/:id" element={<VazhipaduSuccess />} />
        <Route path="/my-vazhipadu" element={<MyVazhipadu />} />
        <Route path="/calendar" element={<PoojaCalendar />} />

        {/* ⭐ Payment Route */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* 🛡️ Admin Routes */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin/refunds" element={<AdminRefunds />} />
      </Route>

      {/* 🚩 Catch-all (MUST BE LAST) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}