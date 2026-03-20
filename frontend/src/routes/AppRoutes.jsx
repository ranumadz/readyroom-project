import { Routes, Route } from "react-router-dom";
import AddHotel from "../admin/pages/AddHotel";
import AddRoom from "../admin/pages/AddRoom";
import RoomsList from "../admin/pages/RoomsList";
import Facilities from "../admin/pages/Facilities";
import HotelsList from "../admin/pages/HotelsList";
import RoomUnits from "../admin/pages/RoomUnits";
import BookingList from "../admin/pages/BookingList";
import ManualBooking from "../admin/pages/ManualBooking";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLogin from "../admin/pages/Login";
import Dashboard from "../admin/pages/Dashboard";
import AdminProtectedRoute from "../admin/components/AdminProtectedRoute";
import VerifyOtp from "../pages/VerifyOtp";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />


      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/hotels" element={<HotelsList />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/hotels/add"
        element={
          <AdminProtectedRoute>
            <AddHotel />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms/add"
        element={
          <AdminProtectedRoute>
            <AddRoom />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <AdminProtectedRoute>
            <RoomsList />
          </AdminProtectedRoute>
        }
      />
      
      <Route
  path="/admin/room-units"
  element={
    <AdminProtectedRoute>
      <RoomUnits />
    </AdminProtectedRoute>
  }
/>
      <Route
         path="/admin/facilities"
         element={
          <AdminProtectedRoute>
            <Facilities />
          </AdminProtectedRoute>
       }
      />
      <Route
  path="/admin/bookings"
  element={
    <AdminProtectedRoute>
      <BookingList />
    </AdminProtectedRoute>
  }
/>
<Route
  path="/admin/bookings/manual"
  element={
    <AdminProtectedRoute>
      <ManualBooking />
    </AdminProtectedRoute>
  }
/>
    </Routes>
  );
}