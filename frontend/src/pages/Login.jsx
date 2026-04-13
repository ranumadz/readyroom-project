import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  X,
  BadgeCheck,
  Hotel,
} from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    let timer;

    if (loginSuccess) {
      timer = setTimeout(() => {
        navigate("/");
      }, 2200);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loginSuccess, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", form);

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("customer", JSON.stringify(res.data.customer));

      localStorage.removeItem("otp_phone");

      setLoginSuccess(true);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message = err.response?.data?.message || "Login gagal";

      if (message === "Akun belum diverifikasi OTP") {
        localStorage.setItem("otp_phone", form.phone);

        setError("Akun kamu belum diverifikasi. Kami arahkan ke halaman OTP.");

        setTimeout(() => {
          navigate("/verify-otp");
        }, 1200);

        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-gray-100 via-white to-red-50">
        <div className="relative hidden overflow-hidden lg:flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: "url('/customer-login.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-950/45" />
          <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-rose-300/10 blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl px-10 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md mb-6">
              <Sparkles size={16} />
              <span className="text-sm font-medium">
                Welcome Back to ReadyRoom
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight xl:text-6xl">
              Stay smarter,
              <br />
              book faster,
              <br />
              travel better.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-200">
              Masuk untuk menikmati pengalaman booking hotel yang cepat, nyaman,
              dan fleksibel di berbagai kota favoritmu bersama ReadyRoom.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <ShieldCheck className="text-red-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Trusted Booking</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-200">
                      Reservasi aman dengan hotel partner terpercaya dan alur
                      booking yang lebih jelas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Tag className="text-red-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Promo & Deals</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-200">
                      Dapatkan penawaran menarik untuk staycation, perjalanan
                      bisnis, dan booking transit yang praktis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="mb-1 text-sm font-medium text-red-200">What’s New</p>
              <h3 className="text-lg font-semibold">
                Promo minggu ini: diskon hingga 20%
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-200">
                Berlaku untuk beberapa hotel pilihan di Jakarta, Bandung, dan
                Bali.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-4 py-10 md:px-6">
          <div className="absolute top-10 left-10 h-44 w-44 rounded-full bg-red-100 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-rose-100 blur-3xl" />

          <div className="relative w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.10)]">
              <div className="relative border-b border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50 px-8 pb-7 pt-8 md:px-10">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-100/70 blur-2xl" />
                <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-rose-100/60 blur-2xl" />

                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] border border-red-100 bg-white shadow-lg shadow-red-100/60">
                    <img
                      src="/readyroom.png"
                      alt="ReadyRoom"
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm">
                    <BadgeCheck size={16} />
                    ReadyRoom Customer Login
                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
                    Selamat Datang
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                    Masuk untuk lanjut booking, cek reservasi, dan nikmati
                    pengalaman hotel yang lebih nyaman.
                  </p>
                </div>
              </div>

              <div className="px-8 py-8 md:px-10">
                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Nomor WhatsApp
                    </label>

                    <div className="group flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 transition focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                      <Phone
                        size={18}
                        className="mr-3 text-gray-400 transition group-focus-within:text-red-500"
                      />
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor WhatsApp"
                        className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
                      >
                        Lupa password?
                      </button>
                    </div>

                    <div className="group flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 transition focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                      <Lock
                        size={18}
                        className="mr-3 text-gray-400 transition group-focus-within:text-red-500"
                      />
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Masukkan password"
                        className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || loginSuccess}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
                  >
                    {loading
                      ? "Memproses..."
                      : loginSuccess
                      ? "Berhasil masuk..."
                      : "Masuk Sekarang"}
                    {!loading && !loginSuccess && <ArrowRight size={18} />}
                  </button>
                </form>

                <div className="mt-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                      <Hotel size={19} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Akses bookingmu lebih cepat
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        Login untuk melihat riwayat booking, status reservasi,
                        dan pengalaman booking yang lebih praktis.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Belum punya akun?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-red-600 hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loginSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-2xl">
            <div className="absolute -left-10 -top-14 h-36 w-36 rounded-full bg-red-100 blur-2xl" />
            <div className="absolute -bottom-14 -right-10 h-36 w-36 rounded-full bg-rose-100 blur-2xl" />

            <div className="relative p-8 text-center">
              <button
                type="button"
                onClick={() => setLoginSuccess(false)}
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={18} />
              </button>

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-200">
                <CheckCircle2 size={38} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <Sparkles size={16} />
                Login Berhasil
              </div>

              <h2 className="text-3xl font-extrabold leading-tight text-gray-800">
                Yeay, kamu berhasil login!
              </h2>

              <p className="mt-3 leading-relaxed text-gray-500">
                Siap jelajahi hotel, promo menarik, dan booking favoritmu di
                ReadyRoom.
              </p>

              <div className="mt-6 rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-4">
                <p className="text-sm font-semibold text-red-600">
                  Mengarahkan kamu ke beranda...
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}