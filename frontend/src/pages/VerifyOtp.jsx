import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("otp_phone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });

    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    const targetInput = document.getElementById(`otp-${focusIndex}`);
    if (targetInput) targetInput.focus();
  };

  const otpCode = otp.join("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Nomor WhatsApp tidak ditemukan. Silakan daftar ulang.");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/verify-otp", {
        phone,
        otp_code: otpCode,
      });

      localStorage.removeItem("otp_phone");

      await Swal.fire({
        title: "OTP Berhasil Diverifikasi ",
        text: res.data.message || "Akun kamu sudah aktif.",
        icon: "success",
        confirmButtonText: "Login Sekarang",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });

      navigate("/login");
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err.response?.data || err);

      const message =
        err.response?.data?.message || "Verifikasi OTP gagal";

      setError(message);

      await Swal.fire({
        title: "Verifikasi Gagal",
        text: message,
        icon: "error",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");

    if (!phone) {
      setError("Nomor WhatsApp tidak ditemukan. Silakan daftar ulang.");
      return;
    }

    setResendLoading(true);

    try {
      const res = await api.post("/resend-otp", { phone });

      setOtp(["", "", "", "", "", ""]);

      await Swal.fire({
        title: "OTP Baru Dibuat",
        html: `
          <p>Kode OTP baru kamu:</p>
          <h2 style="letter-spacing:4px; color:#dc2626; margin:10px 0;">
            ${res.data.otp_demo ?? "-"}
          </h2>
          <p style="font-size:13px;color:#666;">
            Ini masih mode demo, belum dikirim ke WhatsApp.
          </p>
        `,
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });

      const firstInput = document.getElementById("otp-0");
      if (firstInput) firstInput.focus();
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal kirim ulang OTP";

      setError(message);

      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setResendLoading(false);
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
            <span className="text-sm">Verify Your ReadyRoom Account</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Verifikasi akun,
            <br />
            aktifkan akses,
            <br />
            mulai booking.
          </h1>

          <p className="mt-5 text-gray-200 text-lg leading-relaxed">
            Masukkan 6 digit kode OTP untuk mengaktifkan akun ReadyRoom kamu.
          </p>
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
              <h2 className="text-3xl font-bold text-gray-800">
                Verifikasi OTP
              </h2>
              <p className="text-gray-500 mt-2">
                Masukkan kode OTP untuk mengaktifkan akunmu
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 break-words">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Kode OTP
                </label>

                <div
                  className="flex justify-center gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-12 h-14 rounded-xl border border-gray-300 bg-gray-50 text-center text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Memverifikasi..." : "Verifikasi Sekarang"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="w-full border border-red-600 text-red-600 py-3.5 rounded-2xl font-semibold hover:bg-red-50 transition disabled:opacity-70"
              >
                {resendLoading ? "Mengirim Ulang..." : "Kirim Ulang OTP"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Sudah terverifikasi?{" "}
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