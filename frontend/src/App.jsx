import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Added Toaster

// Standard Auth & Core Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Payments from "./pages/Payments";
import PaymentPage from "./pages/PaymentPage"; 

// Layout Component
import Layout from "./components/layout/Layout";

// Module Pages (User)
import EpassBooking from "./pages/EpassBooking";
import MyEpass from "./pages/MyEpass";
import EpassSuccess from './pages/EpassSuccess';

import MyFoodBookings from "./pages/MyFoodBookings";
import FoodBooking from "./pages/FoodBooking"; 
import FoodSuccess from "./pages/FoodSuccess"; 

import AccommodationBooking from "./pages/AccommodationBooking";
import MyAccommodation from "./pages/MyAccommodation";
import AccommodationSuccess from "./pages/AccommodationSuccess";

// Vazhipadu (User)
import VazhipaduHome from "./pages/VazhipaduHome"; 
import DailyPoojaList from "./pages/DailyPoojaList"; 
import SpecialPoojaList from "./pages/SpecialPoojaList"; 
import VazhipaduBooking from "./pages/VazhipaduBooking"; 
import MyVazhipadu from "./pages/MyVazhipadu";
import VazhipaduSuccess from "./pages/VazhipaduSuccess";
import PoojaCalendar from "./pages/PoojaCalendar";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard"; 
import AdminPanel from "./pages/AdminPanel";         
import AdminUsers from "./pages/AdminUsers";         
import AdminRefunds from "./pages/AdminRefunds";     

export default function App() {
  return (
    <>
      {/* ✅ Global Toaster Provider */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontWeight: '600',
          },
        }}
      />
      
      <Routes>
        {/* 🔓 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}> 
            
            {/* --- USER PORTAL --- */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/booking/:module/:id" element={<BookingDetails />} />
            <Route path="/payments" element={<Payments />} />

            {/* E-Pass, Food, & Accommodation */}
            <Route path="/epass" element={<EpassBooking />} />
            <Route path="/my-epass" element={<MyEpass />} />
            <Route path="/epass/success/:id" element={<EpassSuccess />} />
            
            <Route path="/food" element={<FoodBooking />} />
            <Route path="/my-food" element={<MyFoodBookings />} />
            <Route path="/food/success/:id" element={<FoodSuccess />} /> 
            
            <Route path="/accommodation" element={<AccommodationBooking />} />
            <Route path="/my-accommodation" element={<MyAccommodation />} />
            <Route path="/accommodation/success/:id" element={<AccommodationSuccess />} />

            {/* Vazhipadu / Pooja */}
            <Route path="/vazhipadu" element={<VazhipaduHome />} /> 
            <Route path="/vazhipadu/daily" element={<DailyPoojaList />} />
            <Route path="/vazhipadu/special" element={<SpecialPoojaList />} />
            <Route path="/vazhipadu/book/:id" element={<VazhipaduBooking />} />
            <Route path="/vazhipadu/success/:id" element={<VazhipaduSuccess />} /> 
            <Route path="/my-vazhipadu" element={<MyVazhipadu />} />
            <Route path="/calendar" element={<PoojaCalendar />} />
            <Route path="/payment" element={<PaymentPage />} />

            {/* --- ADMIN PANEL --- */}
            <Route path="/admin" element={<AdminDashboard />} /> 
            <Route path="/admin/users" element={<AdminUsers />} /> 
            <Route path="/admin/refunds" element={<AdminRefunds />} />
            <Route path="/admin/slots" element={<AdminPanel />} />

          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}