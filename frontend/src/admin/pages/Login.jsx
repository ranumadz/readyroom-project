import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Mail,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('/bg_depan.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-red-950/45" />

      <div className="absolute -top-10 left-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-rose-300/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/10 blur-3xl" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center px-10">
          <div className="max-w-2xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
              <ShieldCheck size={16} />
              <span className="text-sm font-medium">
                ReadyRoom Management System
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
              Smart control
              <br />
              for modern
              <br />
              hotel operations.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-200">
              Kelola cabang, kamar, booking, laporan, dan user internal dalam
              satu dashboard yang lebih cepat, rapi, dan profesional.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <ShieldCheck className="text-red-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">
                      Secure Admin Access
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-200">
                      Akses dashboard internal ReadyRoom dengan kontrol role yang
                      lebih aman dan terarah.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <LockKeyhole className="text-red-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">
                      Operational Control
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-200">
                      Fokus pada manajemen booking, monitoring cabang, dan
                      workflow operasional hotel yang realistis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="mb-1 text-sm font-medium text-red-200">
                ReadyRoom Panel
              </p>
              <h3 className="text-lg font-semibold">
                Satu tempat untuk operasional hotel
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-200">
                Dipakai untuk kebutuhan admin, receptionist, pengawas, dan
                manajemen internal secara lebih terstruktur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
              <div className="relative border-b border-white/10 bg-white/10 px-8 pb-7 pt-8">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-400/20 blur-2xl" />
                <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/90 shadow-lg shadow-red-500/10">
                    <img
                      src="/readyroom.png"
                      alt="ReadyRoom"
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    <ShieldCheck size={16} />
                    ReadyRoom Admin Access
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Admin Panel
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-gray-200">
                    Silahkan masuk ke dashboard ReadyRoom untuk mengelola sistem
                    internal hotel.
                  </p>
                </div>
              </div>

              <div className="px-8 py-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Email Admin
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/20 bg-white/90 px-4 py-3.5 shadow-md transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-400/20">
                      <Mail
                        size={18}
                        className="mr-3 text-gray-400 transition group-focus-within:text-red-500"
                      />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="admin@readyroom.com"
                        className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Password
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/20 bg-white/90 px-4 py-3.5 shadow-md transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-400/20">
                      <LockKeyhole
                        size={18}
                        className="mr-3 text-gray-400 transition group-focus-within:text-red-500"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Masukkan password"
                        className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="ml-3 text-gray-500 transition hover:text-red-500"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Loading..." : "Masuk ke Dashboard"}
                  </button>
                </form>

                <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-center text-sm text-gray-100">
                    ReadyRoom internal dashboard untuk operasional hotel yang
                    lebih modern dan tertata.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}