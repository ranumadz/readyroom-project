import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import {
  Phone,
  BedDouble,
  BadgeInfo,
  CreditCard,
  Hotel,
  Clock3,
  X,
  RefreshCw,
} from "lucide-react";

export default function BookingCalendar() {
  const today = new Date();
  const FOLDER_SEEN_STORAGE_KEY = "readyroom_calendar_seen_hotels";
  const AUTO_REFRESH_INTERVAL = 60000;

  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const canAccessAllHotels =
    adminUser?.role === "boss" ||
    adminUser?.role === "super_admin" ||
    adminUser?.role === "pengawas";

  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const filtersRef = useRef(filters);
  const autoFetchReadyRef = useRef(false);

  const [userAccessHotels, setUserAccessHotels] = useState([]);
  const [loadingUserAccessHotels, setLoadingUserAccessHotels] = useState(false);
  const [folderBadgeBookings, setFolderBadgeBookings] = useState([]);
  const [folderSeenMap, setFolderSeenMap] = useState(() => {
    try {
      const raw = localStorage.getItem(FOLDER_SEEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const assignedHotelIds = useMemo(() => {
    if (canAccessAllHotels) return [];

    const sourceHotels =
      Array.isArray(userAccessHotels) && userAccessHotels.length > 0
        ? userAccessHotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

    return sourceHotels
      .map((hotel) => String(hotel?.id))
      .filter(Boolean);
  }, [adminUser, canAccessAllHotels, userAccessHotels]);

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50";

  const calendarScrollStyle = `
    .calendar-scroll-area::-webkit-scrollbar {
      width: 14px;
      height: 14px;
    }

    .calendar-scroll-area::-webkit-scrollbar-track {
      background: #eef2f7;
      border-radius: 999px;
    }

    .calendar-scroll-area::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #94a3b8, #64748b);
      border-radius: 999px;
      border: 3px solid #eef2f7;
    }

    .calendar-scroll-area::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #64748b, #475569);
    }
  `;

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

  const getBookingFreshTimestamp = (booking) => {
    return (
      booking?.created_at ||
      booking?.updated_at ||
      booking?.check_in ||
      booking?.check_out ||
      null
    );
  };

  const isBadgeRelevantBooking = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || "").toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(status)) return false;
    if (paymentStatus === "refunded") return false;

    return true;
  };

  const persistFolderSeenMap = (nextMap) => {
    setFolderSeenMap(nextMap);
    localStorage.setItem(FOLDER_SEEN_STORAGE_KEY, JSON.stringify(nextMap));
  };

  const markHotelFolderAsSeen = (
    hotelId,
    bookingsSource = folderBadgeBookings
  ) => {
    if (!hotelId) return;

    const relatedBookings = (Array.isArray(bookingsSource) ? bookingsSource : [])
      .filter(
        (booking) =>
          String(booking.hotel_id ?? booking.hotel?.id ?? "") === String(hotelId)
      )
      .filter((booking) => isBadgeRelevantBooking(booking));

    const latestTimestamp = relatedBookings
      .map((booking) => getBookingFreshTimestamp(booking))
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    if (!latestTimestamp) return;

    const nextMap = {
      ...folderSeenMap,
      [String(hotelId)]: latestTimestamp,
    };

    persistFolderSeenMap(nextMap);
  };

  const fetchFolderBadgeData = async (customFilters = filtersRef.current) => {
    try {
      const response = await api.get("/admin/bookings/calendar", {
        params: {
          hotel_id: customFilters.hotel_id || undefined,
          month: customFilters.month,
          year: customFilters.year,
          admin_user_id: adminUser?.id || undefined,
        },
      });

      setFolderBadgeBookings(
        Array.isArray(response.data?.bookings) ? response.data.bookings : []
      );
    } catch (error) {
      console.error("GAGAL AMBIL BADGE FOLDER CALENDAR:", error);
    }
  };

  const fetchUserAccessHotels = async () => {
    if (!adminUser?.id || canAccessAllHotels) {
      setUserAccessHotels(
        Array.isArray(adminUser?.hotels) ? adminUser.hotels : []
      );
      return;
    }

    try {
      setLoadingUserAccessHotels(true);

      const response = await api.get("/admin/users/admin");

      const usersData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      const currentUser = usersData.find(
        (user) => String(user.id) === String(adminUser.id)
      );

      setUserAccessHotels(
        Array.isArray(currentUser?.hotels) ? currentUser.hotels : []
      );
    } catch (error) {
      console.error("GAGAL AMBIL HOTEL AKSES USER:", error);
      setUserAccessHotels(
        Array.isArray(adminUser?.hotels) ? adminUser.hotels : []
      );
    } finally {
      setLoadingUserAccessHotels(false);
    }
  };

  const fetchCalendar = async (
    customFilters = filtersRef.current,
    showLoading = true
  ) => {
    try {
      if (showLoading) setLoading(true);

      const response = await api.get("/admin/bookings/calendar", {
        params: {
          hotel_id: customFilters.hotel_id || undefined,
          month: customFilters.month,
          year: customFilters.year,
          status:
            customFilters.status && customFilters.status !== "all"
              ? customFilters.status
              : undefined,
          admin_user_id: adminUser?.id || undefined,
        },
      });

      setCalendarData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("GAGAL AMBIL DATA CALENDAR:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(filtersRef.current, true);
    fetchUserAccessHotels();
    fetchFolderBadgeData(filtersRef.current);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCalendar(filtersRef.current, false);
      fetchFolderBadgeData(filtersRef.current);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [adminUser?.id]);

  useEffect(() => {
    if (!autoFetchReadyRef.current) {
      autoFetchReadyRef.current = true;
      return;
    }

    fetchCalendar(filters, true);
    fetchFolderBadgeData(filters);
  }, [filters.hotel_id, filters.month, filters.year]);

  useEffect(() => {
    if (filters.hotel_id) {
      markHotelFolderAsSeen(filters.hotel_id, folderBadgeBookings);
    }
  }, [filters.hotel_id, folderBadgeBookings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualRefresh = () => {
    fetchCalendar(filters, true);
    fetchFolderBadgeData(filters);
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

  const isTodayColumn = (day) => {
    return (
      Number(filters.year) === currentDate.getFullYear() &&
      Number(filters.month) === currentDate.getMonth() + 1 &&
      Number(day) === currentDate.getDate()
    );
  };

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
    const hotel = (calendarData.hotels || []).find(
      (item) => item.id === hotelId
    );
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

  const selectedBookingRelated = useMemo(() => {
    if (!selectedBooking) return [];
    return getRelatedBookingsSameDay(selectedBooking);
  }, [selectedBooking, calendarData.bookings]);

  const hasSelectedFolder = canAccessAllHotels ? true : !!filters.hotel_id;

  const accessibleHotels = useMemo(() => {
    const sourceHotels = Array.isArray(calendarData.hotels)
      ? calendarData.hotels
      : [];

    if (canAccessAllHotels) {
      return sourceHotels;
    }

    if (assignedHotelIds.length > 0) {
      return sourceHotels.filter((hotel) =>
        assignedHotelIds.includes(String(hotel.id))
      );
    }

    return [];
  }, [calendarData.hotels, assignedHotelIds, canAccessAllHotels]);

  const visibleRoomUnits = useMemo(() => {
    const units = Array.isArray(calendarData.room_units)
      ? calendarData.room_units
      : [];

    if (canAccessAllHotels) {
      return units;
    }

    if (assignedHotelIds.length > 0) {
      return units.filter((unit) =>
        assignedHotelIds.includes(
          String(unit.hotel_id ?? unit.room?.hotel_id ?? unit.hotel?.id ?? "")
        )
      );
    }

    return [];
  }, [calendarData.room_units, assignedHotelIds, canAccessAllHotels]);

  const MAX_VISIBLE_CALENDAR_ROWS = 10;
  const CALENDAR_HEADER_HEIGHT = 78;
  const CALENDAR_ROW_HEIGHT = 72;
  const CALENDAR_SCROLLBAR_SPACE = 18;

  const calendarDisplayRows = useMemo(() => {
    const realRows = Array.isArray(visibleRoomUnits) ? visibleRoomUnits : [];

    return realRows.map((unit) => ({
      ...unit,
      isPlaceholder: false,
    }));
  }, [visibleRoomUnits]);

  const calendarVisibleRowCount = Math.min(
    Math.max(calendarDisplayRows.length, 1),
    MAX_VISIBLE_CALENDAR_ROWS
  );

  const calendarMaxHeight =
    CALENDAR_HEADER_HEIGHT +
    calendarVisibleRowCount * CALENDAR_ROW_HEIGHT +
    CALENDAR_SCROLLBAR_SPACE;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

        <div className="min-w-0 p-4 md:p-6">
          <style>{calendarScrollStyle}</style>

          <div className="mb-3 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:p-4">
            <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Filter Kalender
                </h3>
                <p className="text-xs text-gray-500">
                  Pilih cabang, tahun, dan bulan. Kalender otomatis mengikuti filter.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 shadow-sm">
                <RefreshCw size={14} className="text-red-500" />
                <div>
                  <p className="text-[10px] text-gray-500">Terakhir Diperbarui</p>
                  <p className="text-[11px] font-semibold text-gray-700">
                    {formatLastUpdated(lastUpdated)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Cabang
                </label>
                <select
                  name="hotel_id"
                  value={filters.hotel_id}
                  onChange={handleFilterChange}
                  className={inputClass}
                >
                  {canAccessAllHotels && <option value="">Semua Cabang</option>}
                  {!canAccessAllHotels && <option value="">Pilih Cabang</option>}

                  {accessibleHotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Tahun
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className={inputClass}
                >
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Bulan
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className={inputClass}
                >
                  {monthNames.map((monthName, index) => (
                    <option key={index + 1} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4">
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  <Legend color="bg-amber-600" label="Disetujui" />
                  <Legend color="bg-green-500" label="Check-in" />
                  <Legend color="bg-orange-500" label="Pembersihan" />
                  <Legend color="bg-slate-500" label="Selesai" />

                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    title="Refresh manual"
                  >
                    <RefreshCw size={13} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!hasSelectedFolder && (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Hotel size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">
                    Pilih cabang dulu
                  </h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Pilih cabang dari dropdown Filter Kalender untuk membuka isi
                    kalender sesuai akses user ini.
                  </p>
                  {loadingUserAccessHotels && (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      Sedang memuat akses cabang user...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasSelectedFolder && (
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              {!loading && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-[55] w-6 bg-gradient-to-r from-white via-white/90 to-transparent" />
                  <div className="pointer-events-none absolute left-0 right-0 top-0 z-[55] h-6 bg-gradient-to-b from-white via-white/90 to-transparent" />
                </>
              )}

              {loading ? (
                <div className="p-6">
                  <p className="text-gray-500">Memuat data kalender...</p>
                </div>
              ) : (
                <div
                  className="calendar-scroll-area overflow-auto overscroll-contain"
                  style={{ maxHeight: `${calendarMaxHeight}px` }}
                >
                  <div
                    className="grid min-w-max"
                    style={{
                      gridTemplateColumns: `170px repeat(${calendarDays.length}, minmax(92px, 1fr))`,
                    }}
                  >
                    <div className="sticky left-0 top-0 z-[80] flex min-w-[170px] max-w-[170px] items-center border-r border-b border-red-400 bg-gradient-to-r from-red-700 via-red-600 to-rose-500 px-3 py-3 text-sm font-semibold text-white shadow-[10px_0_24px_rgba(15,23,42,0.16),0_10px_24px_rgba(15,23,42,0.12)]">
                      Kamar / Unit
                    </div>

                    {calendarDays.map((day) => {
                      const todayColumn = isTodayColumn(day);

                      return (
                        <div
                          key={day}
                          className={`sticky top-0 z-[70] border-b border-l px-2 py-2.5 text-center shadow-[0_10px_22px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
                            todayColumn
                              ? "border-red-500 bg-gradient-to-b from-red-600 to-rose-500 text-white"
                              : "border-gray-200 bg-white/95"
                          }`}
                        >
                          <p
                            className={`text-[13px] font-bold ${
                              todayColumn ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {day}
                          </p>
                          <p
                            className={`text-[10px] ${
                              todayColumn ? "text-red-100" : "text-gray-400"
                            }`}
                          >
                            {monthNames[Number(filters.month) - 1].slice(0, 3)}
                          </p>

                          {todayColumn && (
                            <span className="mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white ring-1 ring-white/25">
                              Hari ini
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {calendarDisplayRows?.map((unit) => {
                      const unitBookings = getVisibleBookingsForUnit(unit.id);

                      return (
                        <div key={unit.id} className="contents">
                          <div className="sticky left-0 z-[60] min-w-[170px] max-w-[170px] border-r border-b border-gray-200 bg-white/95 px-3 py-3 shadow-[10px_0_22px_rgba(15,23,42,0.10)] backdrop-blur-sm">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-gray-800">
                                Room {unit.room_number}
                              </p>
                              <p className="truncate text-[11px] font-medium text-gray-500">
                                {unit.room_name || "-"}
                              </p>
                            </div>
                          </div>

                          <div
                            className="relative border-b border-gray-200 bg-white"
                            style={{
                              gridColumn: `span ${calendarDays.length}`,
                              minHeight: `${CALENDAR_ROW_HEIGHT}px`,
                            }}
                          >
                            <div
                              className="grid h-full"
                              style={{
                                gridTemplateColumns: `repeat(${calendarDays.length}, minmax(92px, 1fr))`,
                              }}
                            >
                              {calendarDays.map((day) => {
                                const todayColumn = isTodayColumn(day);

                                return (
                                  <div
                                    key={`${unit.id}-${day}`}
                                    className={`border-l ${
                                      todayColumn
                                        ? "border-red-200 bg-red-50/70"
                                        : "border-gray-200 bg-white"
                                    }`}
                                  />
                                );
                              })}
                            </div>

                            {unitBookings.map((booking) => {
                              const blockStyle = getBookingBlockStyle(booking);
                              const slotCount = getBookingSlotCount(booking);
                              const relatedBookings =
                                getRelatedBookingsSameDay(booking);

                              return (
                                <button
                                  key={booking.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedBooking({
                                      ...booking,
                                      related_bookings_same_day:
                                        relatedBookings,
                                    })
                                  }
                                  className={`absolute top-2.5 h-[52px] overflow-hidden rounded-[13px] border px-2.5 py-1 text-left shadow-[0_10px_18px_rgba(15,23,42,0.15)] transition-all duration-200 hover:z-50 hover:scale-[1.03] hover:shadow-[0_14px_24px_rgba(15,23,42,0.20)] ${getBlockColor(
                                    booking
                                  )}`}
                                  style={blockStyle}
                                  title={`${booking.guest_name || "-"} | ${
                                    booking.guest_phone || "-"
                                  } | ${booking.booking_code}`}
                                >
                                  <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-white/30" />

                                  {slotCount > 0 && (
                                    <div className="absolute right-1.5 top-1.5 z-10">
                                      <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-gray-900 shadow-sm">
                                        +{slotCount}
                                      </span>
                                    </div>
                                  )}

                                  <p className="truncate pr-8 text-[11px] font-bold">
                                    {booking.guest_name || booking.booking_code}
                                  </p>
                                  <p className="truncate text-[10px] opacity-95">
                                    {booking.guest_phone || "-"}
                                  </p>
                                  <p className="truncate text-[9px] opacity-90">
                                    {formatTimeRange(booking)}
                                  </p>
                                  <p className="truncate text-[9px] opacity-75">
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
          )}
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          relatedBookings={selectedBookingRelated}
          onClose={() => setSelectedBooking(null)}
          onSelectBooking={setSelectedBooking}
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
    <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function BookingDetailModal({
  booking,
  relatedBookings = [],
  onClose,
  onSelectBooking,
  formatDateTime,
  formatTimeRange,
  getHotelName,
  getStatusBadgeClass,
  getPaymentBadgeClass,
}) {
  const getBookingTypeText = (bookingType) => {
    if (bookingType === "overnight") return "Full Day";
    if (bookingType === "transit") return "Transit";
    return bookingType || "-";
  };

  const roomLabel = booking.room?.type || booking.room?.name || "Kamar";
  const unitNumber = booking.room_unit?.room_number || booking.room_number || "-";
  const roomUnitText = unitNumber === "-" ? roomLabel : `${roomLabel} / ${unitNumber}`;
  const totalPriceText = booking.total_price
    ? `Rp ${Number(booking.total_price).toLocaleString("id-ID")}`
    : "-";

  const handlePickRelatedBooking = (item) => {
    if (!onSelectBooking) return;

    onSelectBooking({
      ...item,
      related_bookings_same_day: relatedBookings,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[26px] bg-white shadow-[0_20px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-red-600">
              Detail Booking
            </p>
            <h3 className="mt-1 truncate text-2xl font-black text-gray-900">
              {booking.booking_code || "-"}
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-500">
              Klik booking lain di bawah untuk melihat detailnya di sini.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-86px)] overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${getStatusBadgeClass(
                booking.status
              )}`}
            >
              Status: {booking.status || "-"}
            </span>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${getPaymentBadgeClass(
                booking.payment_status
              )}`}
            >
              Pembayaran: {booking.payment_status || "-"}
            </span>

            {booking.booking_type && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                Tipe: {getBookingTypeText(booking.booking_type)}
              </span>
            )}

            {booking.duration_hours && (
              <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700">
                Durasi: {booking.duration_hours} jam
              </span>
            )}
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-gray-50/70 p-3">
            <div className="space-y-2">
              <InfoCard
                icon={<BadgeInfo size={17} className="text-red-500" />}
                label="Nama Tamu"
                value={booking.guest_name || "-"}
              />

              <InfoCard
                icon={<Phone size={17} className="text-red-500" />}
                label="Nomor HP"
                value={booking.guest_phone || "-"}
              />

              <InfoCard
                icon={<Hotel size={17} className="text-red-500" />}
                label="Hotel"
                value={booking.hotel?.name || getHotelName(booking.hotel_id) || "-"}
              />

              <InfoCard
                icon={<BedDouble size={17} className="text-red-500" />}
                label="Kamar / Unit"
                value={roomUnitText}
              />

              <InfoCard
                icon={<Clock3 size={17} className="text-red-500" />}
                label="Check In"
                value={formatDateTime(booking.check_in)}
              />

              <InfoCard
                icon={<Clock3 size={17} className="text-red-500" />}
                label="Check Out"
                value={formatDateTime(booking.check_out)}
              />

              <InfoCard
                icon={<Clock3 size={17} className="text-red-500" />}
                label="Jam Booking"
                value={formatTimeRange(booking)}
              />

              <InfoCard
                icon={<CreditCard size={17} className="text-red-500" />}
                label="Total Harga"
                value={totalPriceText}
              />
            </div>
          </div>

          {booking.admin_note && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-900">Catatan Admin</p>
              <p className="mt-1 text-sm text-amber-800">{booking.admin_note}</p>
            </div>
          )}

          {relatedBookings.length > 1 && (
            <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4">
              <h4 className="text-sm font-black text-gray-900">
                Booking Lain di Hari yang Sama
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Klik salah satu booking untuk menampilkan detailnya di atas.
              </p>

              <div className="mt-3 space-y-2">
                {relatedBookings.map((item) => {
                  const active = String(item.id) === String(booking.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePickRelatedBooking(item)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-red-200 hover:bg-red-50/70 ${
                        active
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-gray-900">
                            {item.guest_name || item.booking_code}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-gray-500">
                            {item.guest_phone || "-"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            {formatTimeRange(item)}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {item.booking_code}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black text-gray-900">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
