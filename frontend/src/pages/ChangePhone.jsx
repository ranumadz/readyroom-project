import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Send,
  Smartphone,
} from "lucide-react";

export default function ChangePhone() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({
    customer_id: "",
    current_phone: "",
    new_phone: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    detectCustomer();
  }, []);

  const detectCustomer = () => {
    try {
      const rawCustomer =
        localStorage.getItem("customer") ||
        localStorage.getItem("customerUser") ||
        localStorage.getItem("user");

      if (!rawCustomer) {
        setCustomer(null);
        setPageLoading(false);
        return;
      }

      const parsedCustomer = JSON.parse(rawCustomer);

      setCustomer(parsedCustomer);
      setForm({
        customer_id: parsedCustomer.id || "",
        current_phone: parsedCustomer.phone || "",
        new_phone: "",
      });
    } catch (err) {
      console.error("DETECT CUSTOMER ERROR:", err);
      setCustomer(null);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        customer_id: form.customer_id,
        new_phone: form.new_phone,
      };

      const res = await api.post("/request-change-phone", payload);

      localStorage.setItem("change_phone_customer_id", String(form.customer_id));
      localStorage.setItem("change_phone_new_phone", form.new_phone);

      setSuccess(
        res.data?.message ||
          "OTP untuk ubah nomor berhasil dikirim ke WhatsApp baru."
      );

      setTimeout(() => {
        navigate("/verify-change-phone-otp");
      }, 1200);
    } catch (err) {
      console.error("REQUEST CHANGE PHONE ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Gagal mengirim OTP untuk ubah nomor WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
            <Sparkles size={16} />
            Ubah Nomor WhatsApp
          </div>

          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
            Ganti Nomor WhatsApp
          </h1>

          <p className="mt-2 text-gray-500">
            Masukkan nomor WhatsApp baru, lalu lanjutkan verifikasi OTP untuk
            menjaga keamanan akun kamu.
          </p>
        </div>

        {pageLoading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-52 rounded bg-gray-200" />
              <div className="h-24 rounded-3xl bg-gray-200" />
              <div className="h-24 rounded-3xl bg-gray-200" />
              <div className="h-12 w-44 rounded-2xl bg-gray-200" />
            </div>
          </div>
        ) : !customer ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldCheck size={28} />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Kamu belum login
            </h2>

            <p className="mb-6 text-gray-500">
              Silakan login dulu untuk mengubah nomor WhatsApp akun kamu.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Login Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-[30px] border border-red-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-3xl font-bold text-white shadow-lg shadow-red-200">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800">
                    {customer.name || "-"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customer ReadyRoom
                  </p>

                  <div className="mt-6 w-full rounded-[24px] border border-gray-100 bg-gray-50 p-4 text-left">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                        <Phone size={18} className="text-red-500" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          Nomor Saat Ini
                        </p>
                        <p className="break-words text-sm font-semibold text-gray-800">
                          {form.current_phone || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                        <Smartphone size={18} className="text-red-500" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          Status
                        </p>
                        <p className="break-words text-sm font-semibold text-gray-800">
                          Menunggu nomor baru untuk diverifikasi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-[30px] border border-red-100 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Input Nomor Baru
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Setelah kamu kirim, sistem akan mengirim OTP ke nomor
                    WhatsApp baru tersebut.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <XCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nomor WhatsApp Saat Ini
                    </label>

                    <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3">
                      <Phone size={18} className="mr-3 text-gray-400" />
                      <input
                        type="text"
                        value={form.current_phone}
                        readOnly
                        className="w-full bg-transparent text-gray-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nomor WhatsApp Baru
                    </label>

                    <div className="flex items-center rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-red-500">
                      <Phone size={18} className="mr-3 text-gray-400" />
                      <input
                        type="text"
                        name="new_phone"
                        value={form.new_phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor WhatsApp baru"
                        className="w-full bg-transparent text-gray-700 outline-none placeholder-gray-400"
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Pastikan nomor WhatsApp baru aktif dan bisa menerima pesan OTP.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                  >
                    <Send size={18} />
                    {loading ? "Mengirim OTP..." : "Kirim OTP ke Nomor Baru"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}