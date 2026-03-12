import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Tag } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // sementara simulasi login
    navigate("/");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      {/* Intro Section */}
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
            <span className="text-sm">Welcome Back to ReadyRoom</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Stay smarter,
            <br />
            book faster,
            <br />
            travel better.
          </h1>

          <p className="mt-5 text-gray-200 text-lg leading-relaxed">
            Masuk untuk menikmati pengalaman booking hotel yang cepat, nyaman,
            dan fleksibel di berbagai kota favoritmu.
          </p>

          <div className="grid gap-4 mt-8">
            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <ShieldCheck className="mt-1 text-red-300" size={20} />
              <div>
                <h3 className="font-semibold">Trusted Booking</h3>
                <p className="text-sm text-gray-200">
                  Reservasi aman dengan hotel partner terpercaya.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
              <Tag className="mt-1 text-red-300" size={20} />
              <div>
                <h3 className="font-semibold">Promo & Deals</h3>
                <p className="text-sm text-gray-200">
                  Dapatkan penawaran menarik untuk staycation dan perjalanan bisnis.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-sm text-red-200 mb-1">What’s New</p>
            <h3 className="text-lg font-semibold">Promo minggu ini: diskon hingga 20%</h3>
            <p className="text-sm text-gray-200 mt-1">
              Berlaku untuk beberapa hotel pilihan di Jakarta, Bandung, dan Bali.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
            <div className="text-center mb-8">
              <img
                src="/readyroom.png"
                alt="ReadyRoom"
                className="w-14 h-14 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-800">Selamat Datang</h2>
              <p className="text-gray-500 mt-2">
                Masuk untuk lanjut booking dan cek reservasimu
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 bg-gray-50">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <input
                    type="email"
                    placeholder="Masukkan email"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 bg-gray-50">
                  <Lock size={18} className="text-gray-400 mr-3" />
                  <input
                    type="password"
                    placeholder="Masukkan password"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                Masuk Sekarang
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="w-full border border-gray-300 text-gray-700 py-3.5 rounded-2xl font-medium hover:bg-gray-50 transition"
              >
                Masuk dengan Google
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum punya akun?{" "}
              <Link to="/register" className="text-red-600 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}