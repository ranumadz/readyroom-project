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
  Ticket,
  Eye,
  Download,
  Phone,
  CheckCircle2,
  X,
} from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

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
    return [...bookings].sort(
      (a, b) => new Date(b.check_in) - new Date(a.check_in)
    );
  }, [bookings]);

  const getBookingTypeText = (booking) => {
    return booking.booking_type === "transit"
      ? `Transit ${booking.duration_hours || "-"} Jam`
      : "Full Day";
  };

  const getCustomerInfoMessage = (booking) => {
    const waAdmin = booking?.hotel?.wa_admin || "-";

    return {
      title: "Informasi untuk Tamu",
      lines: [
        "Harap datang sesuai waktu booking yang telah dipilih.",
        "Jika dalam 30 menit setelah waktu check-in tidak ada konfirmasi atau kehadiran, booking dapat dibatalkan oleh pihak hotel.",
        "Jika mengalami kendala atau keterlambatan, silakan hubungi admin cabang melalui kontak resmi hotel.",
      ],
      contact: waAdmin,
    };
  };

  const buildReceiptHtml = (booking) => {
    const info = getCustomerInfoMessage(booking);

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Receipt Booking ${booking.booking_code || "-"}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, Helvetica, sans-serif;
            background: #f8fafc;
            color: #0f172a;
          }
          .sheet {
            max-width: 880px;
            margin: 0 auto;
          }
          .ticket {
            position: relative;
            overflow: hidden;
            background: #ffffff;
            border: 1px solid #fecaca;
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          }
          .watermark {
            position: absolute;
            right: -10px;
            top: 30px;
            font-size: 120px;
            font-weight: 800;
            color: rgba(239, 68, 68, 0.06);
            letter-spacing: 6px;
            user-select: none;
            pointer-events: none;
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #fff;
            padding: 28px 32px;
          }
          .header small {
            display: block;
            opacity: .9;
            margin-bottom: 10px;
            font-size: 14px;
            letter-spacing: .5px;
          }
          .header h1 {
            margin: 0;
            font-size: 34px;
            line-height: 1.1;
          }
          .header p {
            margin: 10px 0 0;
            opacity: .95;
          }
          .body {
            padding: 28px 32px 18px;
          }
          .badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .badge {
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 700;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .card {
            border: 1px solid #f1f5f9;
            background: #f8fafc;
            border-radius: 20px;
            padding: 16px 18px;
          }
          .card .label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .card .value {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            word-break: break-word;
          }
          .divider {
            position: relative;
            margin: 24px 0;
            border-top: 2px dashed #fecaca;
          }
          .divider::before,
          .divider::after {
            content: "";
            position: absolute;
            top: -13px;
            width: 24px;
            height: 24px;
            background: #f8fafc;
            border: 1px solid #fecaca;
            border-radius: 999px;
          }
          .divider::before { left: -44px; }
          .divider::after { right: -44px; }
          .info-box {
            border: 1px solid #fde68a;
            background: #fffbeb;
            border-radius: 22px;
            padding: 18px 20px;
          }
          .info-box h3 {
            margin: 0 0 10px;
            font-size: 18px;
            color: #a16207;
          }
          .info-box p {
            margin: 6px 0;
            line-height: 1.6;
            color: #92400e;
            font-size: 14px;
          }
          .footer-note {
            margin-top: 22px;
            text-align: center;
            color: #64748b;
            font-size: 13px;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .sheet {
              max-width: 100%;
            }
            .ticket {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="ticket">
            <div class="watermark">RR</div>

            <div class="header">
              <small>READYROOM BOOKING RECEIPT</small>
              <h1>${booking.booking_code || "-"}</h1>
              <p>Tunjukkan receipt ini saat dibutuhkan untuk konfirmasi booking.</p>
            </div>

            <div class="body">
              <div class="badges">
                <span class="badge">Status: ${booking.status || "-"}</span>
                <span class="badge">Payment: ${booking.payment_status || "-"}</span>
                <span class="badge">Booking: ${getBookingTypeText(booking)}</span>
              </div>

              <div class="grid">
                <div class="card">
                  <div class="label">Nama Tamu</div>
                  <div class="value">${customer?.name || "-"}</div>
                </div>
                <div class="card">
                  <div class="label">Hotel</div>
                  <div class="value">${booking.hotel?.name || "-"}</div>
                </div>
                <div class="card">
                  <div class="label">Kamar</div>
                  <div class="value">${booking.room?.name || "-"}</div>
                </div>
                <div class="card">
                  <div class="label">Room Unit</div>
                  <div class="value">${booking.room_unit?.room_number || "Belum di-assign admin"}</div>
                </div>
                <div class="card">
                  <div class="label">Check In</div>
                  <div class="value">${formatDateTime(booking.check_in)}</div>
                </div>
                <div class="card">
                  <div class="label">Check Out</div>
                  <div class="value">${formatDateTime(booking.check_out)}</div>
                </div>
                <div class="card">
                  <div class="label">Total Harga</div>
                  <div class="value">${formatRupiah(booking.total_price)}</div>
                </div>
                <div class="card">
                  <div class="label">Admin Note</div>
                  <div class="value">${booking.admin_note || "-"}</div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="info-box">
                <h3>${info.title}</h3>
                ${info.lines.map((line) => `<p>${line}</p>`).join("")}
                <p><strong>Kontak Admin Cabang:</strong> ${info.contact}</p>
              </div>

              <p class="footer-note">
                ReadyRoom • Simpan receipt ini untuk referensi booking kamu.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadReceipt = (booking) => {
    const receiptWindow = window.open("", "_blank", "width=960,height=900");

    if (!receiptWindow) return;

    receiptWindow.document.open();
    receiptWindow.document.write(buildReceiptHtml(booking));
    receiptWindow.document.close();

    setTimeout(() => {
      receiptWindow.focus();
      receiptWindow.print();
    }, 400);
  };

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
            Lihat status booking, kode booking, detail reservasi, dan unduh receipt booking kamu di ReadyRoom.
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
                <p className="text-sm text-gray-500">
                  {customer.email || customer.phone || "-"}
                </p>
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
                <p className="font-semibold text-red-700">
                  Gagal memuat riwayat booking
                </p>
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
              <div className="space-y-6">
                {sortedBookings.map((booking) => {
                  const info = getCustomerInfoMessage(booking);

                  return (
                    <div
                      key={booking.id}
                      className="relative overflow-hidden rounded-[30px] border border-red-100 bg-white shadow-sm"
                    >
                      <div className="pointer-events-none absolute -right-6 top-8 text-[110px] font-extrabold tracking-[0.18em] text-red-100/70">
                        RR
                      </div>

                      <div className="absolute left-0 top-[110px] hidden h-[2px] w-full border-t-2 border-dashed border-red-100 md:block" />
                      <div className="absolute -left-4 top-[98px] hidden h-8 w-8 rounded-full bg-gray-100 md:block" />
                      <div className="absolute -right-4 top-[98px] hidden h-8 w-8 rounded-full bg-gray-100 md:block" />

                      <div className="border-b border-red-100 bg-gradient-to-r from-red-50 via-rose-50 to-white px-6 py-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-red-600 border border-red-100 mb-3">
                              <Ticket size={14} />
                              Ticket Booking ReadyRoom
                            </div>

                            <p className="text-sm text-red-600 font-semibold mb-1">
                              Kode Booking
                            </p>
                            <h3 className="text-2xl font-extrabold tracking-wide text-gray-800">
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

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                            value={getBookingTypeText(booking)}
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
                            icon={
                              <CircleDollarSign size={18} className="text-red-500" />
                            }
                            label="Total Harga"
                            value={formatRupiah(booking.total_price)}
                          />

                          <InfoCard
                            icon={<CreditCard size={18} className="text-red-500" />}
                            label="Room Unit"
                            value={
                              booking.room_unit?.room_number || "Belum di-assign admin"
                            }
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

                        <div className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 border border-amber-100 shrink-0">
                              <CheckCircle2 size={20} />
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-base font-bold text-amber-800">
                                {info.title}
                              </h4>

                              <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-amber-800">
                                {info.lines.map((line, index) => (
                                  <p key={`${booking.id}-info-${index}`}>{line}</p>
                                ))}
                              </div>

                              <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-blue-700 border border-amber-200">
                                <Phone size={15} className="text-blue-600" />
                                Kontak Admin Cabang: {info.contact}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Eye size={17} />
                            Lihat Receipt
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(booking)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                          >
                            <Download size={17} />
                            Unduh Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />

      {selectedBooking && (
        <ReceiptModal
          booking={selectedBooking}
          customer={customer}
          onClose={() => setSelectedBooking(null)}
          formatDateTime={formatDateTime}
          formatRupiah={formatRupiah}
          getBookingTypeText={getBookingTypeText}
          getCustomerInfoMessage={getCustomerInfoMessage}
          onDownload={handleDownloadReceipt}
        />
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
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

function ReceiptModal({
  booking,
  customer,
  onClose,
  formatDateTime,
  formatRupiah,
  getBookingTypeText,
  getCustomerInfoMessage,
  onDownload,
}) {
  const info = getCustomerInfoMessage(booking);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 top-8 text-[130px] font-extrabold tracking-[0.18em] text-red-100/70">
          RR
        </div>

        <div className="border-b border-red-100 bg-gradient-to-r from-red-500 to-rose-500 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/85 mb-2">
                READYROOM BOOKING RECEIPT
              </p>
              <h2 className="text-3xl font-extrabold tracking-wide">
                {booking.booking_code || "-"}
              </h2>
              <p className="mt-2 text-white/90 text-sm">
                Simpan receipt ini untuk referensi booking kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/20 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
              {getBookingTypeText(booking)}
            </span>
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
              Status: {booking.status || "-"}
            </span>
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
              Payment: {booking.payment_status || "-"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={<ShieldCheck size={18} className="text-red-500" />}
              label="Nama Customer"
              value={customer?.name || "-"}
            />

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
              icon={<CreditCard size={18} className="text-red-500" />}
              label="Room Unit"
              value={booking.room_unit?.room_number || "Belum di-assign admin"}
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
              icon={<ReceiptText size={18} className="text-red-500" />}
              label="Admin Note"
              value={booking.admin_note || "-"}
            />
          </div>

          <div className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-5">
            <h4 className="text-base font-bold text-amber-800">{info.title}</h4>

            <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-amber-800">
              {info.lines.map((line, index) => (
                <p key={`${booking.id}-modal-info-${index}`}>{line}</p>
              ))}
            </div>

            <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-blue-700 border border-amber-200">
              <Phone size={15} className="text-blue-600" />
              Kontak Admin Cabang: {info.contact}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onDownload(booking)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              <Download size={17} />
              Unduh / Print Receipt
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Tutup 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}