import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const adminUserRaw = localStorage.getItem("adminUser");

  if (!adminUserRaw) {
    return <Navigate to="/admin/login" replace />;
  }

  let adminUser = null;

  try {
    adminUser = JSON.parse(adminUserRaw);
  } catch (error) {
    localStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace />;
  }

  const role = adminUser?.role;

  const bookingRoles = ["admin", "receptionist", "pengawas"];
  const dashboardRoles = ["boss", "super_admin", "it"];

  const pathname = location.pathname;

  // Kalau role booking mencoba masuk dashboard
  if (pathname === "/admin/dashboard" && bookingRoles.includes(role)) {
    return <Navigate to="/admin/bookings" replace />;
  }

  // Kalau role dashboard mencoba masuk halaman operasional booking utama,
  // ini tetap boleh kalau memang lu mau boss/super_admin/it bisa lihat booking.
  // Jadi di sini sengaja tidak diblok.

  return children;
}