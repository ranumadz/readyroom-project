import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  CalendarDays,
  Phone,
  BedDouble,
  BadgeInfo,
  CreditCard,
  Hotel,
  Clock3,
  X,
  RefreshCw,
  Filter,
  Layers3,
} from "lucide-react";

export default function BookingCalendar() {
  const today = new Date();

  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [calendarData, setCalendarData] = useState({
    filters: {
      hotel_id: "",
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    },
    hotels: [],
    room_units: [],
    bookings: [],
  });

  const [filters, setFilters] = useState({
    hotel_id: "",
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    status: "all",
  });

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const fetchCalendar = async (customFilters = filters, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/bookings/calendar",
        {
          params: {
            hotel_id: customFilters.hotel_id || undefined,
            month: customFilters.month,
            year: customFilters.year,
          },
        }
      );

      setCalendarData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("GAGAL AMBIL DATA CALENDAR:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(filters, true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCalendar(filters, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilter = () => {
    fetchCalendar(filters, true);
  };

  const handleManualRefresh = () => {
    fetchCalendar(filters, true);
  };

  const daysInMonth = useMemo(() => {
    return new Date(Number(filters.year), Number(filters.month), 0).getDate();
  }, [filters.month, filters.year]);

  const calendarDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const monthStart = useMemo(() => {
    return new Date(
      Number(filters.year),
      Number(filters.month) - 1,
      1,
      0,
      0,
      0
    );
  }, [filters.month, filters.year]);

  const monthEnd = useMemo(() => {
    return new Date(
      Number(filters.year),
      Number(filters.month) - 1,
      daysInMonth,
      23,
      59,
      59
    );
  }, [filters.month, filters.year, daysInMonth]);

  const getBlockColor = (booking) => {
    if (booking.status === "checked_in") {
      return "bg-green-500 border-green-600 text-white shadow-green-200";
    }

    if (booking.status === "cleaning") {
      return "bg-orange-500 border-orange-600 text-white shadow-orange-200";
    }

    if (booking.status === "completed") {
      return "bg-slate-500 border-slate-600 text-white shadow-slate-200";
    }

    if (booking.status === "confirmed") {
      return "bg-amber-600 border-amber-700 text-white shadow-amber-200";
    }

    return "bg-gray-400 border-gray-500 text-white shadow-gray-200";
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    if (paymentStatus === "paid") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (paymentStatus === "refunded") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }

    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "checked_in":
        return "bg-green-100 text-green-700 border-green-200";
      case "cleaning":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "confirmed":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const isBookingMatchStatus = (booking) => {
    if (filters.status === "all") return true;
    return booking.status === filters.status;
  };

  const getVisibleBookingsForUnit = (unitId) => {
    return (calendarData.bookings || [])
      .filter((booking) => booking.room_unit_id === unitId)
      .filter((booking) => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        return checkIn <= monthEnd && checkOut >= monthStart;
      })
      .filter((booking) => isBookingMatchStatus(booking))
      .sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
  };

  const getBookingBlockStyle = (booking) => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);

    const visibleStart = checkIn < monthStart ? monthStart : checkIn;
    const visibleEnd = checkOut > monthEnd ? monthEnd : checkOut;

    const startDay = visibleStart.getDate();
    const endDay = visibleEnd.getDate();

    const leftPercent = ((startDay - 1) / daysInMonth) * 100;
    const widthPercent =
      (Math.max(1, endDay - startDay + 1) / daysInMonth) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const formatTimeRange = (booking) => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);

    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(checkIn.getHours())}:${pad(checkIn.getMinutes())} - ${pad(
      checkOut.getHours()
    )}:${pad(checkOut.getMinutes())}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(date.getDate())} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatLastUpdated = (date) => {
    if (!date) return "-";

    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(date.getDate())} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear()} • ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  };

  const getHotelName = (hotelId) => {
    const hotel = (calendarData.hotels || []).find((item) => item.id === hotelId);
    return hotel?.name || "-";
  };

  const isSameCalendarDay = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getRelatedBookingsSameDay = (booking) => {
    if (!booking?.room_unit_id) return [];

    return (calendarData.bookings || [])
      .filter((item) => item.room_unit_id === booking.room_unit_id)
      .filter((item) => isSameCalendarDay(item.check_in, booking.check_in))
      .sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
  };

  const getBookingSlotCount = (booking) => {
    const relatedBookings = getRelatedBookingsSameDay(booking);
    return Math.max(0, relatedBookings.length - 1);
  };

  const totalVisibleBookings = useMemo(() => {
    return (calendarData.bookings || []).filter((booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      const inMonth = checkIn <= monthEnd && checkOut >= monthStart;
      const inStatus = isBookingMatchStatus(booking);

      return inMonth && inStatus;
    }).length;
  }, [calendarData.bookings, monthStart, monthEnd, filters.status]);

  const selectedBookingRelated = useMemo(() => {
    if (!selectedBooking) return [];
    return getRelatedBookingsSameDay(selectedBooking);
  }, [selectedBooking, calendarData.bookings]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-red-600 mb-2">Admin Panel</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Booking Calendar Ready Room
            </h1>
            <p className="text-gray-500 mt-1">
              Visual Booking per kamar fisik.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-3">
              <Legend color="bg-amber-600" label="Approved / Confirmed" />
              <Legend color="bg-green-500" label="Checked In" />
              <Legend color="bg-orange-500" label="Cleaning" />
              <Legend color="bg-slate-500" label="Completed" />
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-2">
              <RefreshCw size={16} className="text-red-500" />
              <div>
                <p className="text-[11px] text-gray-500">Last Updated</p>
                <p className="text-xs font-semibold text-gray-700">
                  {formatLastUpdated(lastUpdated)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white border border-gray-100 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel / Cabang
                </label>
                <select
                  name="hotel_id"
                  value={filters.hotel_id}
                  onChange={handleFilterChange}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-400"
                >
                  <option value="">Semua Hotel</option>
                  {calendarData.hotels?.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-400"
                >
                  {monthNames.map((monthName, index) => (
                    <option key={index + 1} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-400"
                >
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Booking
                </label>
                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-red-400"
                  >
                    <option value="all">Semua Status</option>
                    <option value="confirmed">Approved / Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Tampilkan
                </button>

                <button
                  onClick={handleManualRefresh}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  title="Refresh manual"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <MiniCounter
                label="Room Unit"
                value={calendarData.room_units?.length || 0}
              />
              <MiniCounter
                label="Booking Tampil"
                value={totalVisibleBookings}
              />
              <MiniCounter
                label="Filter Status"
                value={
                  filters.status === "all"
                    ? "Semua"
                    : filters.status === "confirmed"
                    ? "Confirmed"
                    : filters.status === "checked_in"
                    ? "Checked In"
                    : filters.status === "cleaning"
                    ? "Cleaning"
                    : "Completed"
                }
              />
            </div>
          </div>

          <div className="rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p className="text-gray-500">Memuat data calendar...</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <div
                  className="grid min-w-max"
                  style={{
                    gridTemplateColumns: `240px repeat(${calendarDays.length}, minmax(92px, 1fr))`,
                  }}
                >
                  <div className="sticky left-0 z-30 bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold p-4 border-r border-red-400">
                    Room / Unit
                  </div>

                  {calendarDays.map((day) => (
                    <div
                      key={day}
                      className="bg-gray-50 border-b border-l border-gray-200 px-2 py-4 text-center"
                    >
                      <p className="text-sm font-bold text-gray-800">{day}</p>
                      <p className="text-[10px] text-gray-400">
                        {monthNames[Number(filters.month) - 1].slice(0, 3)}
                      </p>
                    </div>
                  ))}

                  {calendarData.room_units?.map((unit) => {
                    const unitBookings = getVisibleBookingsForUnit(unit.id);

                    return (
                      <div key={unit.id} className="contents">
                        <div className="sticky left-0 z-20 bg-white border-r border-b border-gray-200 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                              {unit.room_number}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {unit.room_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                {unit.room_name || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="relative border-b border-gray-200 bg-white"
                          style={{
                            gridColumn: `span ${calendarDays.length}`,
                            minHeight: "104px",
                          }}
                        >
                          <div
                            className="grid h-full"
                            style={{
                              gridTemplateColumns: `repeat(${calendarDays.length}, minmax(92px, 1fr))`,
                            }}
                          >
                            {calendarDays.map((day) => (
                              <div
                                key={`${unit.id}-${day}`}
                                className="border-l border-gray-200 bg-white"
                              />
                            ))}
                          </div>

                          {unitBookings.map((booking) => {
                            const blockStyle = getBookingBlockStyle(booking);
                            const slotCount = getBookingSlotCount(booking);
                            const relatedBookings = getRelatedBookingsSameDay(booking);

                            return (
                              <button
                                key={booking.id}
                                type="button"
                                onClick={() =>
                                  setSelectedBooking({
                                    ...booking,
                                    related_bookings_same_day: relatedBookings,
                                  })
                                }
                                className={`absolute top-4 h-[64px] rounded-2xl border px-3 py-2 overflow-hidden shadow-lg hover:scale-[1.03] hover:z-50 transition-all duration-200 cursor-pointer text-left ${getBlockColor(
                                  booking
                                )}`}
                                style={blockStyle}
                                title={`${booking.guest_name || "-"} | ${
                                  booking.guest_phone || "-"
                                } | ${booking.booking_code}`}
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-2xl" />

                                {slotCount > 0 && (
                                  <div className="absolute top-1.5 right-1.5 z-10">
                                    <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-gray-900 shadow-sm">
                                      +{slotCount}
                                    </span>
                                  </div>
                                )}

                                <p className="text-xs font-bold truncate pr-8">
                                  {booking.guest_name || booking.booking_code}
                                </p>
                                <p className="text-[11px] opacity-95 truncate">
                                  {booking.guest_phone || "-"}
                                </p>
                                <p className="text-[10px] opacity-90 truncate">
                                  {formatTimeRange(booking)}
                                </p>
                                <p className="text-[10px] opacity-75 truncate">
                                  {booking.booking_code}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          relatedBookings={selectedBookingRelated}
          onClose={() => setSelectedBooking(null)}
          formatDateTime={formatDateTime}
          formatTimeRange={formatTimeRange}
          getHotelName={getHotelName}
          getStatusBadgeClass={getStatusBadgeClass}
          getPaymentBadgeClass={getPaymentBadgeClass}
        />
      )}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-gray-100 shadow-sm">
      <div className={`w-3.5 h-3.5 rounded-full ${color}`} />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

function MiniCounter({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 min-w-[140px]">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

function BookingDetailModal({
  booking,
  relatedBookings,
  onClose,
  formatDateTime,
  formatTimeRange,
  getHotelName,
  getStatusBadgeClass,
  getPaymentBadgeClass,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-3xl rounded-[32px] bg-white shadow-2xl border border-white/40 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-500 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                Detail Booking
              </p>
              <h2 className="text-2xl font-bold">{booking.booking_code}</h2>
              <p className="text-sm text-white/85 mt-1">
                Klik block calendar untuk lihat detail operasional booking.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-11 w-11 rounded-2xl bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-7">
          <div className="flex flex-wrap gap-3 mb-6">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusBadgeClass(
                booking.status
              )}`}
            >
              Status: {booking.status || "-"}
            </span>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getPaymentBadgeClass(
                booking.payment_status
              )}`}
            >
              Payment: {booking.payment_status || "-"}
            </span>

            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">
              Tipe: {booking.booking_type || "-"}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Layers3 size={14} />
              Aktivitas kamar hari ini: {relatedBookings?.length || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <InfoCard
              icon={<BadgeInfo size={18} className="text-red-500" />}
              label="Nama Tamu"
              value={booking.guest_name || "-"}
            />
            <InfoCard
              icon={<Phone size={18} className="text-red-500" />}
              label="Nomor HP"
              value={booking.guest_phone || "-"}
            />
            <InfoCard
              icon={<Hotel size={18} className="text-red-500" />}
              label="Hotel / Cabang"
              value={getHotelName(booking.hotel_id)}
            />
            <InfoCard
              icon={<BedDouble size={18} className="text-red-500" />}
              label="Kamar"
              value={`${booking.room_number || "-"} • ${booking.room_name || "-"}`}
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
              icon={<Clock3 size={18} className="text-red-500" />}
              label="Rentang Jam"
              value={formatTimeRange(booking)}
            />
            <InfoCard
              icon={<CreditCard size={18} className="text-red-500" />}
              label="Kode Booking"
              value={booking.booking_code || "-"}
            />
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5 mb-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Ringkasan Operasional
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MiniStat
                title="Status"
                value={booking.status || "-"}
                tone="bg-white text-gray-700"
              />
              <MiniStat
                title="Payment"
                value={booking.payment_status || "-"}
                tone="bg-white text-gray-700"
              />
              <MiniStat
                title="Booking Type"
                value={booking.booking_type || "-"}
                tone="bg-white text-gray-700"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Aktivitas Kamar di Hari yang Sama
            </p>

            {relatedBookings && relatedBookings.length > 0 ? (
              <div className="space-y-3">
                {relatedBookings.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className={`rounded-2xl border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                      item.id === booking.id
                        ? "border-red-200 bg-white shadow-sm"
                        : "border-blue-100 bg-white/80"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.guest_name || item.booking_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.guest_phone || "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatTimeRange(item)}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 px-4 py-5 text-sm text-gray-500">
                Belum ada booking lain di kamar ini pada hari yang sama.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black transition"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
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

function MiniStat({ title, value, tone }) {
  return (
    <div className={`rounded-2xl p-4 border border-gray-100 ${tone}`}>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}