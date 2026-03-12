import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/admin/login", form);

      localStorage.setItem("adminUser", JSON.stringify(response.data.user));

      toast.success("Login admin berhasil");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-cover scale-105"
        style={{
          backgroundImage: "url('/bg_depan.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Glow Effects */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 blur-3xl rounded-full" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-400/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <img
              src="/readyroom.png"
              alt="ReadyRoom"
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
              Admin Panel
            </h1>
            <p className="text-gray-200 text-sm mt-2">
              Masuk ke dashboard ReadyRoom
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Admin
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@readyroom.com"
                className="w-full bg-white/90 text-gray-800 placeholder-gray-500 border border-white/30 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className="w-full bg-white/90 text-gray-800 placeholder-gray-500 border border-white/30 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition duration-300 shadow-lg shadow-red-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-200 mt-6">
            ReadyRoom Admin Access
          </p>
        </div>
      </div>
    </div>
  );
}