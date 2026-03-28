import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  CalendarDays,
  BedDouble,
  Building2,
  CreditCard,
  Clock3,
  ReceiptText,
  CircleDollarSign,
  ShieldCheck,
  RefreshCw,
  SearchX,
} from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    detectCustomer();
  }, []);

  useEffect(() => {
    if (customer?.id) {
      fetchMyBookings(customer.id);
    }
  }, [customer]);

  const detectCustomer = () => {
    try {
      const rawCustomer =
        localStorage.getItem("customer") ||
        localStorage.getItem("customerUser") ||
        localStorage.getItem("user");

      if (!rawCustomer) {
        setCustomer(null);
        setLoading(false);
        return;
      }

      const parsedCustomer = JSON.parse(rawCustomer);
      setCustomer(parsedCustomer);
    } catch (err) {
      console.error("DETECT CUSTOMER ERROR:", err);
      setCustomer(null);
      setLoading(false);
    }
  };

  const fetchMyBookings = async (userId) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/my-bookings?user_id=${userId}`);

      const bookingData = Array.isArray(res.data?.data) ? res.data.data : [];
      setBookings(bookingData);
    } catch (err) {
      console.error("GET MY BOOKINGS ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Gagal mengambil riwayat booking."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "checked_in":
        return "bg-green-50 text-green-700 border-green-200";
      case "checked_out":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "cleaning":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "unpaid":
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.check_in) - new Date(a.check_in));
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 mb-4">
            <ReceiptText size={16} />
            Riwayat Booking
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Booking Saya
          </h1>

          <p className="text-gray-500 mt-2">
            Lihat status booking, kode booking, dan detail reservasi kamu di ReadyRoom.
          </p>
        </div>

        {!customer && !loading && (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldCheck size={28} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Kamu belum login
            </h2>

            <p className="text-gray-500 mb-6">
              Silakan login dulu untuk melihat riwayat booking kamu.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              Login Sekarang
            </button>
          </div>
        )}

        {customer && (
          <>
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <h2 className="text-lg font-bold text-gray-800">
                  {customer.name || "-"}
                </h2>
                <p className="text-sm text-gray-500">{customer.email || customer.phone || "-"}</p>
              </div>

              <button
                onClick={() => fetchMyBookings(customer.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw size={17} />
                Refresh Riwayat
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="h-6 w-48 rounded bg-gray-200 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-20 rounded bg-gray-200" />
                      <div className="h-20 rounded bg-gray-200" />
                      <div className="h-20 rounded bg-gray-200" />
                      <div className="h-20 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
                <p className="font-semibold text-red-700">Gagal memuat riwayat booking</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            ) : sortedBookings.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <SearchX size={28} />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Belum ada booking
                </h2>

                <p className="text-gray-500 mb-6">
                  Kamu belum punya riwayat booking. Yuk mulai cari kamar favoritmu.
                </p>

                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
                >
                  Jelajahi Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {sortedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-white px-6 py-5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <p className="text-sm text-red-600 font-semibold mb-1">
                            Kode Booking
                          </p>
                          <h3 className="text-2xl font-bold text-gray-800">
                            {booking.booking_code || "-"}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            Status: {booking.status || "-"}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentClass(
                              booking.payment_status
                            )}`}
                          >
                            Payment: {booking.payment_status || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      <InfoCard
                        icon={<Building2 size={18} className="text-red-500" />}
                        label="Hotel"
                        value={booking.hotel?.name || "-"}
                      />

                      <InfoCard
                        icon={<BedDouble size={18} className="text-red-500" />}
                        label="Kamar"
                        value={booking.room?.name || "-"}
                      />

                      <InfoCard
                        icon={<Clock3 size={18} className="text-red-500" />}
                        label="Tipe Booking"
                        value={
                          booking.booking_type === "transit"
                            ? `Transit ${booking.duration_hours || "-"} Jam`
                            : "Overnight"
                        }
                      />

                      <InfoCard
                        icon={<CalendarDays size={18} className="text-red-500" />}
                        label="Check In"
                        value={formatDateTime(booking.check_in)}
                      />

                      <InfoCard
                        icon={<CalendarDays size={18} className="text-red-500" />}
                        label="Check Out"
                        value={formatDateTime(booking.check_out)}
                      />

                      <InfoCard
                        icon={<CircleDollarSign size={18} className="text-red-500" />}
                        label="Total Harga"
                        value={formatRupiah(booking.total_price)}
                      />

                      <InfoCard
                        icon={<CreditCard size={18} className="text-red-500" />}
                        label="Room Unit"
                        value={booking.room_unit?.room_number || "Belum di-assign admin"}
                      />

                      <InfoCard
                        icon={<ShieldCheck size={18} className="text-red-500" />}
                        label="Admin Note"
                        value={booking.admin_note || "-"}
                      />

                      <InfoCard
                        icon={<ReceiptText size={18} className="text-red-500" />}
                        label="Alasan Penolakan"
                        value={booking.rejection_reason_customer || "-"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-800 break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}