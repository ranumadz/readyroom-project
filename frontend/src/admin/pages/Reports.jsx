import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import {
  FileText,
  Filter,
  RotateCcw,
  Printer,
  Building2,
  CalendarDays,
  Wallet,
  ClipboardList,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    hotel_id: "",
    status: "",
    booking_type: "",
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [bookingRes, hotelRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/hotels"),
      ]);

      const bookingData = Array.isArray(bookingRes.data?.data)
        ? bookingRes.data.data
        : Array.isArray(bookingRes.data)
        ? bookingRes.data
        : [];

      const hotelData = Array.isArray(hotelRes.data?.data)
        ? hotelRes.data.data
        : Array.isArray(hotelRes.data)
        ? hotelRes.data
        : [];

      setBookings(bookingData);
      setHotels(hotelData);
    } catch (error) {
      console.error("GAGAL AMBIL DATA REPORT:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      hotel_id: "",
      status: "",
      booking_type: "",
    });
  };

  const isWithinDateRange = (booking) => {
    const checkIn = booking.check_in ? new Date(booking.check_in) : null;
    if (!checkIn) return false;

    if (filters.start_date) {
      const start = new Date(filters.start_date);
      start.setHours(0, 0, 0, 0);
      if (checkIn < start) return false;
    }

    if (filters.end_date) {
      const end = new Date(filters.end_date);
      end.setHours(23, 59, 59, 999);
      if (checkIn > end) return false;
    }

    return true;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchDate = isWithinDateRange(booking);

      const matchHotel =
        !filters.hotel_id ||
        String(booking.hotel_id || booking.hotel?.id) === String(filters.hotel_id);

      const matchStatus =
        !filters.status || String(booking.status) === String(filters.status);

      const matchType =
        !filters.booking_type ||
        String(booking.booking_type) === String(filters.booking_type);

      return matchDate && matchHotel && matchStatus && matchType;
    });
  }, [bookings, filters]);

  const summary = useMemo(() => {
    const totalBooking = filteredBookings.length;
    const totalPaid = filteredBookings.filter(
      (item) => item.payment_status === "paid"
    ).length;
    const totalCheckIn = filteredBookings.filter(
      (item) => item.status === "checked_in"
    ).length;
    const totalCancelled = filteredBookings.filter(
      (item) => item.status === "cancelled"
    ).length;

    const totalPendapatan = filteredBookings
      .filter((item) => item.payment_status === "paid")
      .reduce((sum, item) => sum + Number(item.total_price || 0), 0);

    const totalRefund = filteredBookings.reduce(
      (sum, item) => sum + Number(item.refund_amount || 0),
      0
    );

    return {
      totalBooking,
      totalPaid,
      totalCheckIn,
      totalCancelled,
      totalPendapatan,
      totalRefund,
    };
  }, [filteredBookings]);

  const getHotelName = (hotelId) => {
    if (!hotelId) return "Semua Hotel";
    const hotel = hotels.find((item) => String(item.id) === String(hotelId));
    return hotel?.name || "Hotel Tidak Ditemukan";
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      dateStyle: "medium",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "checked_in":
        return "bg-green-100 text-green-700";
      case "checked_out":
        return "bg-slate-100 text-slate-700";
      case "cleaning":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredBookings
      .map((booking, index) => {
        const guestName = booking.user?.name || booking.guest_name || "Tamu";
        const hotelName = booking.hotel?.name || "-";
        const roomName = booking.room?.name || booking.room?.type || "-";

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${booking.booking_code || "-"}</td>
            <td>${guestName}</td>
            <td>${booking.guest_phone || "-"}</td>
            <td>${hotelName}</td>
            <td>${roomName}</td>
            <td>${booking.booking_type || "-"}</td>
            <td>${formatDateTime(booking.check_in)}</td>
            <td>${formatDateTime(booking.check_out)}</td>
            <td>${booking.status || "-"}</td>
            <td>${booking.payment_status || "-"}</td>
            <td>${formatRupiah(booking.total_price || 0)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Laporan Booking ReadyRoom</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 28px;
              color: #1f2937;
            }
            .header {
              margin-bottom: 24px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin: 0 0 6px 0;
            }
            .subtitle {
              color: #6b7280;
              margin: 0;
              font-size: 14px;
            }
            .meta {
              margin-top: 16px;
              font-size: 13px;
              color: #374151;
              line-height: 1.7;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin: 24px 0;
            }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 14px;
              background: #f9fafb;
            }
            .card-title {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 20px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 18px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f3f4f6;
              font-weight: bold;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="title">Laporan Booking ReadyRoom</p>
            <p class="subtitle">Laporan booking hotel berdasarkan filter yang dipilih</p>

            <div class="meta">
              <div><strong>Hotel / Cabang:</strong> ${getHotelName(filters.hotel_id)}</div>
              <div><strong>Tanggal Awal:</strong> ${filters.start_date ? formatDateOnly(filters.start_date) : "Semua"}</div>
              <div><strong>Tanggal Akhir:</strong> ${filters.end_date ? formatDateOnly(filters.end_date) : "Semua"}</div>
              <div><strong>Status Booking:</strong> ${filters.status || "Semua"}</div>
              <div><strong>Jenis Booking:</strong> ${filters.booking_type || "Semua"}</div>
              <div><strong>Dicetak Pada:</strong> ${new Date().toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <div class="card-title">Total Booking</div>
              <div class="card-value">${summary.totalBooking}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Paid</div>
              <div class="card-value">${summary.totalPaid}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Check In</div>
              <div class="card-value">${summary.totalCheckIn}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Cancelled</div>
              <div class="card-value">${summary.totalCancelled}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Pendapatan</div>
              <div class="card-value">${formatRupiah(summary.totalPendapatan)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Refund</div>
              <div class="card-value">${formatRupiah(summary.totalRefund)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Booking</th>
                <th>Nama Tamu</th>
                <th>No HP</th>
                <th>Hotel</th>
                <th>Kamar</th>
                <th>Jenis</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Pembayaran</th>
                <th>Total Harga</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="12">Tidak ada data laporan</td></tr>`}
            </tbody>
          </table>

          <div class="footer">
            Laporan ini dibuat dari sistem ReadyRoom.
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">
              Laporan Booking
            </h1>
            <p className="text-gray-500 mt-1">
              Lihat ringkasan laporan booking, filter data, lalu print atau simpan ke PDF.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Filter size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Filter Laporan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Awal
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel / Cabang
                </label>
                <select
                  value={filters.hotel_id}
                  onChange={(e) =>
                    handleFilterChange("hotel_id", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="">Semua Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Booking
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Booking
                </label>
                <select
                  value={filters.booking_type}
                  onChange={(e) =>
                    handleFilterChange("booking_type", e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="">Semua Jenis</option>
                  <option value="transit">Transit</option>
                  <option value="overnight">Overnight</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                type="button"
                onClick={fetchReportData}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
              >
                <RefreshCw size={18} />
                Tampilkan Laporan
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                <RotateCcw size={18} />
                Reset
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
              >
                <Printer size={18} />
                Print / Simpan PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <SummaryCard
              icon={<ClipboardList size={18} />}
              title="Total Booking"
              value={loading ? "..." : summary.totalBooking}
            />
            <SummaryCard
              icon={<CheckCircle2 size={18} />}
              title="Total Paid"
              value={loading ? "..." : summary.totalPaid}
            />
            <SummaryCard
              icon={<CalendarDays size={18} />}
              title="Total Check In"
              value={loading ? "..." : summary.totalCheckIn}
            />
            <SummaryCard
              icon={<XCircle size={18} />}
              title="Total Cancelled"
              value={loading ? "..." : summary.totalCancelled}
            />
            <SummaryCard
              icon={<Wallet size={18} />}
              title="Total Pendapatan"
              value={loading ? "..." : formatRupiah(summary.totalPendapatan)}
            />
            <SummaryCard
              icon={<Wallet size={18} />}
              title="Total Refund"
              value={loading ? "..." : formatRupiah(summary.totalRefund)}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">
                  Detail Laporan Booking
                </h2>
              </div>

              <div className="text-sm text-gray-500">
                Total data tampil: {filteredBookings.length}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data laporan...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Tidak ada data laporan
                </h3>
                <p className="text-gray-500 mt-2">
                  Coba ubah filter tanggal, hotel, status, atau jenis booking.
                </p>
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="px-4">Kode</th>
                      <th className="px-4">Tamu</th>
                      <th className="px-4">Hotel</th>
                      <th className="px-4">Kamar</th>
                      <th className="px-4">Jenis</th>
                      <th className="px-4">Check In</th>
                      <th className="px-4">Check Out</th>
                      <th className="px-4">Status</th>
                      <th className="px-4">Pembayaran</th>
                      <th className="px-4">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="bg-gray-50 border border-gray-100 rounded-2xl"
                      >
                        <td className="px-4 py-4 font-semibold text-gray-800">
                          {booking.booking_code || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800">
                            {booking.user?.name || booking.guest_name || "Tamu"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.guest_phone || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-2 text-gray-700">
                            <Building2 size={14} className="text-red-500" />
                            {booking.hotel?.name || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {booking.room?.name || booking.room?.type || "-"}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {booking.booking_type || "-"}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {formatDateTime(booking.check_in)}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {formatDateTime(booking.check_out)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {booking.status || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentClass(
                              booking.payment_status
                            )}`}
                          >
                            {booking.payment_status || "unpaid"}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-800">
                          {formatRupiah(booking.total_price || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>

      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}