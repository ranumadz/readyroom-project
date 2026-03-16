import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/register", form);

      localStorage.setItem("otp_phone", form.phone);

     await Swal.fire({
  title: "Yeay! Pendaftaran Berhasil 🎉",
  html: `
    <p style="margin-bottom:10px;">
      Akun kamu berhasil dibuat.
    </p>
    <p style="font-size:14px; color:#666;">
      Kode OTP sudah dikirim ke nomor WhatsApp kamu.
    </p>
  `,
  confirmButtonText: "Lanjut Verifikasi",
  confirmButtonColor: "#dc2626",
  background: "#ffffff",
  color: "#1f2937",
});

      navigate("/verify-otp", {
        state: { phone: form.phone },
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data || err);

      const message =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        "Register gagal, cek data yang dimasukkan";

      setError(message);

      await Swal.fire({
        icon: "error",
        title: "Pendaftaran Gagal",
        text: message,
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: "url('/customer-login.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-red-900/40" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-xl px-10 text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 backdrop-blur-md mb-6">
            <Sparkles size={16} />
            <span className="text-sm">Create Your ReadyRoom Account</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Join ReadyRoom,
            <br />
            stay flexible,
            <br />
            travel easier.
          </h1>

          <p className="mt-5 text-gray-200 text-lg leading-relaxed">
            Daftar untuk mulai booking hotel harian maupun transit dengan lebih
            cepat, aman, dan nyaman di kota favoritmu.
          </p>

          <div className="grid gap-4 mt-8">
            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <ShieldCheck className="mt-1 text-red-300" size={20} />
              <div>
                <h3 className="font-semibold">Aman & Praktis</h3>
                <p className="text-sm text-gray-200">
                  Simpan akunmu untuk proses booking yang lebih cepat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <Tag className="mt-1 text-red-300" size={20} />
              <div>
                <h3 className="font-semibold">Transit & Harian</h3>
                <p className="text-sm text-gray-200">
                  Pilih kamar transit 3 jam atau menginap harian sesuai
                  kebutuhanmu.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-sm text-red-200 mb-1">Why Join?</p>
            <h3 className="text-lg font-semibold">
              Booking lebih cepat dan personal
            </h3>
            <p className="text-sm text-gray-200 mt-1">
              Nikmati akses lebih mudah ke reservasi, promo, dan pengalaman
              booking yang lebih rapi.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
            <div className="text-center mb-8">
              <img
                src="/readyroom.png"
                alt="ReadyRoom"
                className="w-14 h-14 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-800">Buat Akun</h2>
              <p className="text-gray-500 mt-2">
                Daftar untuk mulai booking di ReadyRoom
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 break-words">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 bg-gray-50">
                  <User size={18} className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. WhatsApp
                </label>
                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 bg-gray-50">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Masukkan nomor WhatsApp"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 bg-gray-50">
                  <Lock size={18} className="text-gray-400 mr-3" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-red-600 font-semibold hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}