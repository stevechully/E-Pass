import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
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

// ✅ ADD THESE IMPORTS
import VazhipaduList from "./pages/VazhipaduList";
import VazhipaduBooking from "./pages/VazhipaduBooking";
import MyVazhipadu from "./pages/MyVazhipadu";
import VazhipaduSuccess from "./pages/VazhipaduSuccess";

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

        <Route path="/epass" element={<EpassBooking />} />
        <Route path="/my-epass" element={<MyEpass />} />

        <Route path="/food" element={<FoodBooking />} />
        <Route path="/my-food" element={<MyFoodBookings />} />

        <Route path="/accommodation" element={<AccommodationBooking />} />
        <Route path="/my-accommodation" element={<MyAccommodation />} />

        <Route path="/vazhipadu/success/:id" element={<VazhipaduSuccess />} />

        {/* ⭐ Payment Route */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* 🔥 Vazhipadu Routes (NOW PROTECTED) */}
        <Route path="/vazhipadu" element={<VazhipaduList />} />
        <Route path="/vazhipadu/:id" element={<VazhipaduBooking />} />
        <Route path="/my-vazhipadu" element={<MyVazhipadu />} />

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