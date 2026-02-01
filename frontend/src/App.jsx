import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Payments from "./pages/Payments";
import EpassBooking from "./pages/EpassBooking";
import MyEpass from "./pages/MyEpass";
import MyFoodBookings from "./pages/MyFoodBookings";
import FoodBooking from "./pages/FoodBooking"; 
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AccommodationBooking from "./pages/AccommodationBooking";
import MyAccommodation from "./pages/MyAccommodation";
import PaymentPage from "./pages/PaymentPage"; 
import AdminRefunds from "./pages/AdminRefunds";

export default function App() {
  return (
    <Routes>
      {/* 🔓 Public Route */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/booking/:module/:id" element={<BookingDetails />} />
        <Route path="/payments" element={<Payments />} />
        
        <Route path="/epass" element={<EpassBooking />} />
        <Route path="/my-epass" element={<MyEpass />} />
        
        <Route path="/food" element={<FoodBooking />} />
        <Route path="/my-food" element={<MyFoodBookings />} />
        
        <Route path="/accommodation" element={<AccommodationBooking />} />
        <Route path="/my-accommodation" element={<MyAccommodation />} />
        
        {/* ⭐ Payment Route */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* 🛡️ Admin Routes */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        {/* ✅ Fixed: Moved Refund Route INSIDE protected block */}
        <Route path="/admin/refunds" element={<AdminRefunds />} />
      </Route>

      {/* 🚩 Catch-all (MUST BE LAST) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}