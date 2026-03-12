import { Routes, Route } from "react-router-dom";
import AddHotel from "../admin/pages/AddHotel";

import Home from "../pages/Home";
import Login from "../pages/Login";
import AdminLogin from "../admin/pages/Login";
import Dashboard from "../admin/pages/Dashboard";
import AdminProtectedRoute from "../admin/components/AdminProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

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
    </Routes>
  );
}