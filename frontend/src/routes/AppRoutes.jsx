import { Routes, Route } from "react-router-dom";
import AddHotel from "../admin/pages/AddHotel";
import AddRoom from "../admin/pages/AddRoom";
import RoomsList from "../admin/pages/RoomsList";
import Facilities from "../admin/pages/Facilities";
import HotelsList from "../admin/pages/HotelsList";
import RoomUnits from "../admin/pages/RoomUnits";
import BookingList from "../admin/pages/BookingList";
import ManualBooking from "../admin/pages/ManualBooking";
import BookingCalendar from "../admin/pages/BookingCalendar";
import Reports from "../admin/pages/Reports";
import UsersPage from "../admin/pages/Users";
import MasterContent from "../admin/pages/MasterContent";
import InternalBroadcasts from "../admin/pages/InternalBroadcasts";

import Home from "../pages/Home";
import Hotels from "../pages/Hotels";
import HotelDetail from "../pages/HotelDetail";
import HotelRooms from "../pages/HotelRooms";
import Rooms from "../pages/Rooms";
import RoomDetail from "../pages/RoomDetail";
import MyBookings from "../pages/MyBookings";
import Profile from "../pages/Profile";
import ChangePhone from "../pages/ChangePhone";
import VerifyChangePhoneOtp from "../pages/VerifyChangePhoneOtp";
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
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetail />} />
      <Route path="/hotels/:id/rooms" element={<HotelRooms />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetail />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-phone" element={<ChangePhone />} />
      <Route
        path="/verify-change-phone-otp"
        element={<VerifyChangePhoneOtp />}
      />
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

      <Route
        path="/admin/bookings/calendar"
        element={
          <AdminProtectedRoute>
            <BookingCalendar />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <Reports />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <UsersPage />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/master-content"
        element={
          <AdminProtectedRoute>
            <MasterContent />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/internal-broadcasts"
        element={
          <AdminProtectedRoute>
            <InternalBroadcasts />
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
}