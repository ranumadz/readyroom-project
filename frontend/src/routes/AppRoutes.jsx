import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import AddHotel from "../admin/pages/AddHotel";
import AddRoom from "../admin/pages/AddRoom";
import RoomsList from "../admin/pages/RoomsList";
import Facilities from "../admin/pages/Facilities";
import HotelsList from "../admin/pages/HotelsList";
import RoomUnits from "../admin/pages/RoomUnits";
import BookingList from "../admin/pages/BookingList";
import ManualBooking from "../admin/pages/ManualBooking";
import BookingCalendar from "../admin/pages/BookingCalendar";
import BookingAvailability from "../admin/pages/BookingAvailability";
import Reports from "../admin/pages/Reports";
import UsersPage from "../admin/pages/Users";
import MasterContent from "../admin/pages/MasterContent";
import InternalBroadcasts from "../admin/pages/InternalBroadcasts";
import PartnerRegister from "../admin/pages/PartnerRegister";
import PartnerApplications from "../admin/pages/PartnerApplications";
import Housekeeping from "../admin/pages/Housekeeping";
import AnalisaKinerjaKaryawan from "../admin/pages/AnalisaKinerjaKaryawan";

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
        return "ReadyRoom | Booking Hotel Transit & Fullday Lebih Mudah";
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

      if (pathname === "/partner/register") {
        return "Daftar Partner Hotel | ReadyRoom";
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

      if (pathname === "/admin/booking-availability") {
        return "ReadyRoom Technology | Booking Availability";
      }

      if (pathname === "/admin/housekeeping") {
        return "ReadyRoom Technology | Housekeeping";
      }

      if (pathname === "/admin/analisa-kinerja-karyawan") {
        return "ReadyRoom Technology | Analisa Kinerja Karyawan";
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

function ReadyRoomSplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#08111f] text-white">
      <style>
        {`
          @keyframes readyroomSplashBar {
            0% {
              transform: translateX(-110%);
            }
            45% {
              transform: translateX(-8%);
            }
            100% {
              transform: translateX(110%);
            }
          }

          @keyframes readyroomSplashFloat {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-7px) scale(1.015);
            }
          }

          @keyframes readyroomSplashGlow {
            0%, 100% {
              opacity: 0.28;
              transform: scale(1);
            }
            50% {
              opacity: 0.48;
              transform: scale(1.08);
            }
          }

          @keyframes readyroomSplashFadeIn {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-red-500/35 blur-3xl md:h-72 md:w-72" />
      <div className="pointer-events-none absolute -left-20 bottom-[-90px] h-56 w-56 rounded-full bg-red-400/25 blur-3xl md:h-80 md:w-80" />
      <div className="pointer-events-none absolute right-[-46px] top-[-52px] h-32 w-32 rounded-full bg-red-500/35 md:h-52 md:w-52" />
      <div className="pointer-events-none absolute bottom-[-45px] left-[-38px] h-36 w-36 rounded-full bg-red-500/25 md:h-56 md:w-56" />

      <div
        className="relative mx-auto flex w-full max-w-[360px] flex-col items-center px-6 text-center"
        style={{ animation: "readyroomSplashFadeIn 0.55s ease-out both" }}
      >
        <div
          className="absolute inset-x-10 top-8 h-28 rounded-full bg-red-500/20 blur-3xl"
          style={{ animation: "readyroomSplashGlow 2.2s ease-in-out infinite" }}
        />

        <div
          className="relative flex flex-col items-center"
          style={{ animation: "readyroomSplashFloat 2.8s ease-in-out infinite" }}
        >
          <div className="relative flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-white shadow-[0_24px_70px_rgba(239,68,68,0.24)] md:h-[86px] md:w-[86px] md:rounded-[28px]">
            <div className="absolute inset-0 rounded-[24px] border border-white/70 md:rounded-[28px]" />

            <img
              src="/logo.png"
              alt="ReadyRoom"
              className="h-12 w-12 object-contain md:h-14 md:w-14"
              draggable={false}
            />
          </div>

          <h1 className="mt-5 text-[27px] font-black tracking-tight text-white md:text-[34px]">
            ReadyRoom
          </h1>

          <p className="mt-2 max-w-[280px] text-[11px] font-medium leading-relaxed text-white/78 md:text-sm">
            Booking Transit & Full Day lebih cepat
          </p>
        </div>

        <div className="mt-6 w-[145px] overflow-hidden rounded-full bg-white/12 p-[2px] md:mt-7 md:w-[170px]">
          <div className="relative h-[4px] overflow-hidden rounded-full bg-white/12">
            <div
              className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-gradient-to-r from-red-500 via-white to-red-400"
              style={{ animation: "readyroomSplashBar 1.45s ease-in-out infinite" }}
            />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38 md:text-[11px]">
          Menyiapkan pengalaman terbaik
        </p>
      </div>
    </div>
  );
}

function SplashGate({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      if (window.location.pathname.startsWith("/admin")) return false;

      return sessionStorage.getItem("readyroom_customer_splash_seen") !== "1";
    } catch (error) {
      console.error("READYROOM SPLASH INIT ERROR:", error);
      return false;
    }
  });

  useEffect(() => {
    if (isAdminPage) {
      setShowSplash(false);
      return undefined;
    }

    try {
      const alreadySeen =
        sessionStorage.getItem("readyroom_customer_splash_seen") === "1";

      if (alreadySeen) {
        setShowSplash(false);
        return undefined;
      }

      setShowSplash(true);

      const timer = window.setTimeout(() => {
        sessionStorage.setItem("readyroom_customer_splash_seen", "1");
        setShowSplash(false);
      }, 1850);

      return () => window.clearTimeout(timer);
    } catch (error) {
      console.error("READYROOM SPLASH ERROR:", error);
      setShowSplash(false);
      return undefined;
    }
  }, [isAdminPage]);

  return (
    <>
      {children}
      {showSplash && <ReadyRoomSplashScreen />}
    </>
  );
}

export default function AppRoutes() {
  return (
    <>
      <PageTitleManager />

      <SplashGate>
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

          {/* Partner registration sample */}
          <Route path="/partner/register" element={<PartnerRegister />} />

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
            path="/admin/partner-applications"
            element={
              <AdminProtectedRoute>
                <PartnerApplications />
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
            path="/admin/booking-availability"
            element={
              <AdminProtectedRoute>
                <BookingAvailability />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/housekeeping"
            element={
              <AdminProtectedRoute>
                <Housekeeping />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/analisa-kinerja-karyawan"
            element={
              <AdminProtectedRoute>
                <AnalisaKinerjaKaryawan />
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
      </SplashGate>
    </>
  );
}