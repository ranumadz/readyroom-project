import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

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

function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    const getTitle = () => {
      // =========================
      // CUSTOMER SIDE
      // =========================
      if (pathname === "/") {
        return "ReadyRoom | Booking Hotel Transit & Overnight Lebih Mudah";
      }

      if (pathname === "/hotels") {
        return "Hotel ReadyRoom | Cari Hotel Partner Terbaik";
      }

      if (/^\/hotels\/[^/]+$/.test(pathname)) {
        return "Detail Hotel | ReadyRoom";
      }

      if (/^\/hotels\/[^/]+\/rooms$/.test(pathname)) {
        return "Kamar Hotel | ReadyRoom";
      }

      if (pathname === "/rooms") {
        return "Rooms ReadyRoom | Pilih Kamar Sesuai Kebutuhan";
      }

      if (/^\/rooms\/[^/]+$/.test(pathname)) {
        return "Detail Room | ReadyRoom";
      }

      if (pathname === "/my-bookings") {
        return "Riwayat Booking | ReadyRoom";
      }

      if (pathname === "/profile") {
        return "Profil Saya | ReadyRoom";
      }

      if (pathname === "/change-phone") {
        return "Ubah Nomor HP | ReadyRoom";
      }

      if (pathname === "/verify-change-phone-otp") {
        return "Verifikasi Nomor HP | ReadyRoom";
      }

      if (pathname === "/login") {
        return "Login Customer | ReadyRoom";
      }

      if (pathname === "/register") {
        return "Daftar Customer | ReadyRoom";
      }

      if (pathname === "/verify-otp") {
        return "Verifikasi OTP | ReadyRoom";
      }

      // =========================
      // ADMIN / TECHNOLOGY SIDE
      // =========================
      if (pathname === "/admin/login") {
        return "ReadyRoom Technology | Admin Access";
      }

      if (pathname === "/admin/dashboard") {
        return "ReadyRoom Technology | Dashboard";
      }

      if (pathname === "/admin/hotels") {
        return "ReadyRoom Technology | Hotels Management";
      }

      if (pathname === "/admin/hotels/add") {
        return "ReadyRoom Technology | Add Hotel";
      }

      if (pathname === "/admin/rooms") {
        return "ReadyRoom Technology | Rooms Management";
      }

      if (pathname === "/admin/rooms/add") {
        return "ReadyRoom Technology | Add Room";
      }

      if (pathname === "/admin/room-units") {
        return "ReadyRoom Technology | Room Units";
      }

      if (pathname === "/admin/facilities") {
        return "ReadyRoom Technology | Facilities";
      }

      if (pathname === "/admin/bookings") {
        return "ReadyRoom Technology | Booking Operations";
      }

      if (pathname === "/admin/bookings/manual") {
        return "ReadyRoom Technology | Manual Booking";
      }

      if (pathname === "/admin/bookings/calendar") {
        return "ReadyRoom Technology | Booking Calendar";
      }

      if (pathname === "/admin/reports") {
        return "ReadyRoom Technology | Reports";
      }

      if (pathname === "/admin/users") {
        return "ReadyRoom Technology | Users Management";
      }

      if (pathname === "/admin/master-content") {
        return "ReadyRoom Technology | Master Content";
      }

      if (pathname === "/admin/internal-broadcasts") {
        return "ReadyRoom Technology | Internal Broadcasts";
      }

      return "ReadyRoom | Booking Hotel Modern";
    };

    document.title = getTitle();
  }, [location.pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <PageTitleManager />

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
    </>
  );
}