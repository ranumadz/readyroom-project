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
  BadgeCheck,
  Hotel,
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

  const normalizePhone = (phone) => {
    let cleaned = String(phone || "").replace(/\D/g, "").trim();

    if (!cleaned) return "";

    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const goToVerifyOtp = async (phone, message) => {
    const normalizedPhone = normalizePhone(phone);

    localStorage.setItem("otp_phone", normalizedPhone);

    await Swal.fire({
      title: "Lanjut Verifikasi OTP",
      html: `
        <p style="margin-bottom:10px;">
          ${message || "Nomor ini siap lanjut ke verifikasi OTP."}
        </p>
        <p style="font-size:14px; color:#666;">
          Silakan lanjut ke halaman verifikasi OTP WhatsApp.
        </p>
      `,
      confirmButtonText: "Lanjut Verifikasi",
      confirmButtonColor: "#dc2626",
      background: "#ffffff",
      color: "#1f2937",
    });

    navigate("/verify-otp", {
      state: { phone: normalizedPhone },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedPhone = normalizePhone(form.phone);

    if (!normalizedPhone) {
      setLoading(false);
      setError("Nomor WhatsApp wajib diisi");

      await Swal.fire({
        icon: "warning",
        title: "Nomor tidak valid",
        text: "Masukkan nomor WhatsApp yang valid.",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    const payload = {
      ...form,
      phone: normalizedPhone,
    };

    try {
      const res = await api.post("/register", payload);

      localStorage.setItem("otp_phone", normalizedPhone);

      await Swal.fire({
        title: "Yeay! Pendaftaran Berhasil 🎉",
        html: `
          <p style="margin-bottom:10px;">
            ${res.data?.message || "Akun kamu berhasil dibuat."}
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
        state: { phone: normalizedPhone },
      });
    } catch (err) {
      console.error("REGISTER ERROR FULL:", err);
      console.error("REGISTER ERROR RESPONSE:", err.response?.data);

      const backendMessage = err.response?.data?.message;
      const backendErrors = err.response?.data?.errors;

      let message = "Register gagal, cek data yang dimasukkan";

      if (backendMessage) {
        message = backendMessage;
      }

      if (backendErrors) {
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey && backendErrors[firstErrorKey]?.length) {
          message = backendErrors[firstErrorKey][0];
        }
      }

      setError(message);

      const lowerMessage = String(message).toLowerCase();

      if (
        lowerMessage.includes("lanjut verifikasi otp") ||
        lowerMessage.includes("belum diverifikasi") ||
        lowerMessage.includes("belum terverifikasi")
      ) {
        await goToVerifyOtp(normalizedPhone, message);
        return;
      }

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

  const handleContinueVerification = async () => {
    const rawPhone = form.phone?.trim() || localStorage.getItem("otp_phone");
    const normalizedPhone = normalizePhone(rawPhone);

    if (!normalizedPhone) {
      await Swal.fire({
        icon: "warning",
        title: "Nomor WhatsApp belum diisi",
        text: "Masukkan nomor WhatsApp yang sudah pernah didaftarkan tapi belum diverifikasi.",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    localStorage.setItem("otp_phone", normalizedPhone);

    navigate("/verify-otp", {
      state: { phone: normalizedPhone },
    });
  };

  return (
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
              Create Your ReadyRoom Account
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight xl:text-6xl">
            Join ReadyRoom,
            <br />
            stay flexible,
            <br />
            travel easier.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-200">
            Daftar untuk mulai booking hotel harian maupun transit dengan lebih
            cepat, aman, dan nyaman di kota favoritmu.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="text-red-300" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Aman & Praktis</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-200">
                    Simpan akunmu untuk proses booking yang lebih cepat dan
                    pengalaman yang lebih rapi.
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
                  <h3 className="text-base font-semibold">Transit & Harian</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-200">
                    Pilih kamar transit 3 jam atau menginap harian sesuai
                    kebutuhanmu dengan alur yang lebih nyaman.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <p className="mb-1 text-sm font-medium text-red-200">Why Join?</p>
            <h3 className="text-lg font-semibold">
              Booking lebih cepat dan personal
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-200">
              Nikmati akses lebih mudah ke reservasi, promo, dan pengalaman
              booking yang lebih terorganisir.
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
                  ReadyRoom Customer Register
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
                  Buat Akun
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                  Daftar untuk mulai booking di ReadyRoom dan lanjut ke verifikasi
                  OTP WhatsApp.
                </p>
              </div>
            </div>

            <div className="px-8 py-8 md:px-10">
              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 break-words">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="group flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 transition focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                    <User
                      size={18}
                      className="mr-3 text-gray-400 transition group-focus-within:text-red-500"
                    />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    No. WhatsApp
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
                      placeholder="Contoh: 0812xxxx atau 62812xxxx"
                      className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
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
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
                >
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <button
                type="button"
                onClick={handleContinueVerification}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3.5 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Lanjut Verifikasi OTP
              </button>

              <div className="mt-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                    <Hotel size={19} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Lanjut verifikasi OTP
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Kalau nomor kamu sudah pernah daftar tapi belum aktif,
                      masukkan nomor lalu tekan tombol lanjut verifikasi OTP.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-red-600 hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}