import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import {
  Phone,
  BedDouble,
  ClipboardList,
  BadgeInfo,
  CreditCard,
  Hotel,
  Clock3,
  X,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";

export default function BookingCalendar() {
  const today = new Date();
  const FOLDER_SEEN_STORAGE_KEY = "readyroom_calendar_seen_hotels";
  const AUTO_REFRESH_INTERVAL = 15000;

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
  const calendarScrollRef = useRef(null);
  const fullscreenAreaRef = useRef(null);
  const dragScrollStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const [isCalendarDragging, setIsCalendarDragging] = useState(false);
  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState(false);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      setIsCalendarFullscreen(fullscreenElement === fullscreenAreaRef.current);
    };

    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;

      const hasNativeFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!hasNativeFullscreen && isCalendarFullscreen) {
        setIsCalendarFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isCalendarFullscreen]);

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

    .calendar-drag-scroll {
      cursor: grab;
      user-select: none;
    }

    .calendar-drag-scroll.is-dragging {
      cursor: grabbing;
    }

    .calendar-drag-scroll.is-dragging * {
      cursor: grabbing !important;
    }

    .booking-calendar-fullscreen-shell:fullscreen {
      background: #f3f4f6;
    }

    .booking-calendar-fullscreen-shell:-webkit-full-screen {
      background: #f3f4f6;
    }

    @keyframes rr-calendar-danger-blink {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.78), 0 18px 28px rgba(127, 29, 29, 0.32);
        filter: brightness(1);
      }
      50% {
        box-shadow: 0 0 0 7px rgba(220, 38, 38, 0.08), 0 18px 36px rgba(127, 29, 29, 0.46);
        filter: brightness(1.12);
      }
    }

    .rr-calendar-danger-pulse {
      animation: rr-calendar-danger-blink 0.95s ease-in-out infinite;
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

  const handleToggleCalendarFullscreen = async () => {
    const target = fullscreenAreaRef.current;

    if (!target) return;

    const nativeFullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    try {
      if (nativeFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        } else {
          setIsCalendarFullscreen(false);
        }

        return;
      }

      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      } else if (target.mozRequestFullScreen) {
        await target.mozRequestFullScreen();
      } else if (target.msRequestFullscreen) {
        await target.msRequestFullscreen();
      } else {
        setIsCalendarFullscreen(true);
      }
    } catch (error) {
      console.error("GAGAL TOGGLE FULLSCREEN BOOKING CALENDAR:", error);
      setIsCalendarFullscreen((prev) => !prev);
    }
  };

  const isInteractiveCalendarTarget = (target) => {
    if (!target) return false;

    return Boolean(
      target.closest(
        'button, a, input, textarea, select, option, [role="button"], [data-no-drag="true"]'
      )
    );
  };

  const handleCalendarDragStart = (event) => {
    if (event.button !== 0) return;
    if (!calendarScrollRef.current) return;
    if (isInteractiveCalendarTarget(event.target)) return;

    dragScrollStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: calendarScrollRef.current.scrollLeft,
      scrollTop: calendarScrollRef.current.scrollTop,
    };

    setIsCalendarDragging(true);
    event.preventDefault();
  };

  const handleCalendarDragMove = (event) => {
    const dragState = dragScrollStateRef.current;

    if (!dragState.isDragging || !calendarScrollRef.current) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    calendarScrollRef.current.scrollLeft = dragState.scrollLeft - deltaX;
    calendarScrollRef.current.scrollTop = dragState.scrollTop - deltaY;

    event.preventDefault();
  };

  const handleCalendarDragEnd = () => {
    if (!dragScrollStateRef.current.isDragging) return;

    dragScrollStateRef.current = {
      isDragging: false,
      startX: 0,
      startY: 0,
      scrollLeft: 0,
      scrollTop: 0,
    };

    setIsCalendarDragging(false);
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

  const toSafeDate = (value) => {
    if (!value) return null;

    const normalized = String(value).includes("T")
      ? String(value)
      : String(value).replace(" ", "T");

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getOperationalMetaFromNote = (note) => {
    const raw = String(note || "");
    const match = raw.match(
      /\[RR_OPS\s+actual_check_in="([^"]*)"\s+expected_check_out="([^"]*)"\]/i
    );

    return {
      actualCheckIn: match?.[1] || null,
      expectedCheckOut: match?.[2] || null,
    };
  };

  const getOperationalMeta = (booking) => {
    const noteMeta = getOperationalMetaFromNote(booking?.payment_note);

    return {
      actualCheckIn:
        booking?.actual_check_in ||
        booking?.check_in_actual ||
        booking?.actual_checkin_at ||
        booking?.actual_checked_in_at ||
        booking?.checked_in_at ||
        booking?.checkin_at ||
        booking?.paid_at ||
        booking?.payment?.paid_at ||
        booking?.transaction?.paid_at ||
        noteMeta.actualCheckIn ||
        null,
      expectedCheckOut:
        booking?.expected_check_out ||
        booking?.expected_checkout ||
        booking?.target_check_out ||
        booking?.target_checkout ||
        booking?.checkout_target ||
        booking?.operational_check_out ||
        booking?.actual_check_out_target ||
        booking?.payment?.expected_check_out ||
        booking?.transaction?.expected_check_out ||
        noteMeta.expectedCheckOut ||
        null,
    };
  };

  const getCalendarCheckInTime = (booking) => {
    const meta = getOperationalMeta(booking);
    return meta.actualCheckIn || booking?.check_in || null;
  };

  const getCalendarCheckOutTime = (booking) => {
    const meta = getOperationalMeta(booking);

    return (
      booking?.actual_check_out ||
      booking?.check_out_actual ||
      booking?.actual_checkout_at ||
      booking?.checked_out_at ||
      booking?.checkout_at ||
      meta.expectedCheckOut ||
      booking?.check_out ||
      null
    );
  };

  const isBookingCheckoutDanger = (booking) => {
    const status = String(booking?.status || "").toLowerCase();

    if (status !== "checked_in") return false;

    const targetCheckOut = toSafeDate(getCalendarCheckOutTime(booking));
    if (!targetCheckOut) return false;

    return currentDate.getTime() > targetCheckOut.getTime();
  };

  const getBlockColor = (booking) => {
    if (isBookingCheckoutDanger(booking)) {
      return "bg-red-700 border-red-900 text-white shadow-red-300 ring-2 ring-red-300";
    }

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
        const checkIn = toSafeDate(getCalendarCheckInTime(booking));
        const checkOut = toSafeDate(getCalendarCheckOutTime(booking));

        if (!checkIn || !checkOut) return false;

        return checkIn <= monthEnd && checkOut >= monthStart;
      })
      .filter((booking) => isBookingMatchStatus(booking))
      .sort((a, b) => {
        const dateA = toSafeDate(getCalendarCheckInTime(a));
        const dateB = toSafeDate(getCalendarCheckInTime(b));

        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
  };

  const getBookingBlockStyle = (booking) => {
    const checkIn = toSafeDate(getCalendarCheckInTime(booking));
    const checkOut = toSafeDate(getCalendarCheckOutTime(booking));

    if (!checkIn || !checkOut) {
      return {
        left: "0%",
        width: `${(1 / daysInMonth) * 100}%`,
      };
    }

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
    const checkIn = toSafeDate(getCalendarCheckInTime(booking));
    const checkOut = toSafeDate(getCalendarCheckOutTime(booking));
    const pad = (num) => String(num).padStart(2, "0");

    if (!checkIn || !checkOut) return "-";

    return `${pad(checkIn.getHours())}:${pad(checkIn.getMinutes())} - ${pad(
      checkOut.getHours()
    )}:${pad(checkOut.getMinutes())}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = toSafeDate(dateString);
    if (!date) return "-";

    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(date.getDate())} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatLastUpdated = (date) => {
    if (!date) return "menunggu data";

    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  const getHotelName = (hotelId) => {
    const hotel = (calendarData.hotels || []).find(
      (item) => item.id === hotelId
    );
    return hotel?.name || "-";
  };

  const normalizeRoomTypeLabel = (value) => {
    const text = String(value || "").trim();

    if (!text) return "-";

    const cleaned = text.replace(/\s+room$/i, "").trim();

    return cleaned || text;
  };

  const getCalendarUnitTypeLabel = (unit) => {
    return normalizeRoomTypeLabel(
      unit?.room_type ||
        unit?.type ||
        unit?.room?.type ||
        unit?.room_name ||
        unit?.room?.name
    );
  };

  const isSameCalendarDay = (dateA, dateB) => {
    const a = toSafeDate(dateA);
    const b = toSafeDate(dateB);

    if (!a || !b) return false;

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getRelatedBookingsSameDay = (booking) => {
    if (!booking?.room_unit_id) return [];

    const selectedCheckIn = getCalendarCheckInTime(booking);

    return (calendarData.bookings || [])
      .filter((item) => item.room_unit_id === booking.room_unit_id)
      .filter((item) => isSameCalendarDay(getCalendarCheckInTime(item), selectedCheckIn))
      .sort((a, b) => {
        const dateA = toSafeDate(getCalendarCheckInTime(a));
        const dateB = toSafeDate(getCalendarCheckInTime(b));

        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
  };

  const getBookingSlotCount = (booking) => {
    const relatedBookings = getRelatedBookingsSameDay(booking);
    return Math.max(0, relatedBookings.length - 1);
  };

  const selectedBookingRelated = useMemo(() => {
    if (!selectedBooking) return [];
    return getRelatedBookingsSameDay(selectedBooking);
  }, [selectedBooking, calendarData.bookings]);


  const getRoomUnitOperationalStatus = (unit) => {
    const monitoringStatus = String(unit?.monitoring_status || "").toLowerCase();
    const rawStatus = String(unit?.status ?? "").toLowerCase();

    if (
      monitoringStatus === "maintenance" ||
      rawStatus === "maintenance" ||
      rawStatus === "rusak" ||
      unit?.is_maintenance === true ||
      unit?.maintenance_status === true
    ) {
      return "maintenance";
    }

    if (
      monitoringStatus === "inactive" ||
      rawStatus === "inactive" ||
      rawStatus === "nonaktif" ||
      rawStatus === "0" ||
      rawStatus === "false" ||
      unit?.status === false ||
      unit?.is_active === false ||
      unit?.available === false
    ) {
      return "inactive";
    }

    if (
      monitoringStatus === "cleaning" ||
      rawStatus === "cleaning" ||
      rawStatus === "dirty" ||
      unit?.is_cleaning === true ||
      unit?.cleaning_status === true
    ) {
      return "cleaning";
    }

    return "available";
  };

  const getCurrentBookingsForMonitoringUnit = (unitId) => {
    const now = currentDate.getTime();

    return (calendarData.bookings || [])
      .filter((booking) => String(booking.room_unit_id) === String(unitId))
      .filter((booking) => {
        const status = String(booking?.status || "").toLowerCase();
        const paymentStatus = String(booking?.payment_status || "").toLowerCase();

        if (["cancelled", "rejected"].includes(status)) return false;
        if (paymentStatus === "refunded") return false;

        const checkIn = toSafeDate(getCalendarCheckInTime(booking));
        const checkOut = toSafeDate(getCalendarCheckOutTime(booking));

        if (!checkIn || !checkOut) {
          return ["checked_in", "cleaning", "checked_out", "confirmed"].includes(status);
        }

        if (["checked_in", "cleaning", "checked_out"].includes(status)) {
          return checkIn.getTime() <= now;
        }

        if (status === "confirmed") {
          return checkOut.getTime() >= now;
        }

        return checkIn.getTime() <= now && checkOut.getTime() >= now;
      })
      .sort((a, b) => {
        const statusWeight = {
          checked_in: 1,
          cleaning: 2,
          checked_out: 3,
          confirmed: 4,
          completed: 5,
        };

        const statusA = String(a?.status || "").toLowerCase();
        const statusB = String(b?.status || "").toLowerCase();

        const weightCompare =
          (statusWeight[statusA] || 99) - (statusWeight[statusB] || 99);

        if (weightCompare !== 0) return weightCompare;

        const dateA = toSafeDate(getCalendarCheckInTime(a));
        const dateB = toSafeDate(getCalendarCheckInTime(b));

        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });
  };

  const getMonitoringBookingForUnit = (unit) => {
    return getCurrentBookingsForMonitoringUnit(unit.id)[0] || null;
  };

  const getMonitoringStatus = (unit) => {
    const unitStatus = getRoomUnitOperationalStatus(unit);

    if (unitStatus === "maintenance" || unitStatus === "inactive") {
      return unitStatus;
    }

    if (unitStatus === "cleaning") {
      return "cleaning";
    }

    const booking = getMonitoringBookingForUnit(unit);
    const bookingStatus = String(booking?.status || "").toLowerCase();

    if (booking && isBookingCheckoutDanger(booking)) {
      return "checkout_due";
    }

    if (["checked_in", "check_in", "checkin"].includes(bookingStatus)) {
      return "occupied";
    }

    if (["cleaning", "start_cleaning", "in_cleaning", "proses_cleaning"].includes(bookingStatus)) {
      return "cleaning";
    }

    if (["checked_out", "check_out", "checkout"].includes(bookingStatus)) {
      return "cleaning";
    }

    if (["confirmed", "approved", "paid", "booked", "reserved"].includes(bookingStatus)) {
      return "reserved";
    }

    return "available";
  };

  const getMonitoringStatusMeta = (status) => {
    const map = {
      available: {
        label: "Tersedia",
        shortLabel: "Tersedia",
        dotClass: "bg-emerald-500",
        cardClass:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-800",
        badgeClass: "bg-emerald-100 text-emerald-700",
        helper: "Kamar siap digunakan.",
      },
      occupied: {
        label: "Terisi",
        shortLabel: "Sedang Dipakai",
        dotClass: "bg-green-500",
        cardClass:
          "border-green-200 bg-gradient-to-br from-green-50 to-white text-green-800",
        badgeClass: "bg-green-100 text-green-700",
        helper: "Ada tamu sedang check-in.",
      },
      reserved: {
        label: "Booking",
        shortLabel: "Sudah Dibooking",
        dotClass: "bg-amber-500",
        cardClass:
          "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-800",
        badgeClass: "bg-amber-100 text-amber-700",
        helper: "Ada booking terjadwal.",
      },
      cleaning: {
        label: "Cleaning",
        shortLabel: "Sedang Cleaning",
        dotClass: "bg-orange-500",
        cardClass:
          "border-orange-200 bg-gradient-to-br from-orange-50 to-white text-orange-800",
        badgeClass: "bg-orange-100 text-orange-700",
        helper: "Kamar perlu/ sedang dibersihkan.",
      },
      checkout_due: {
        label: "Waktunya Check-out",
        shortLabel: "Check-out",
        dotClass: "bg-red-700",
        cardClass:
          "border-red-300 bg-gradient-to-br from-red-50 to-white text-red-800",
        badgeClass: "bg-red-100 text-red-700",
        helper: "Booking melewati target check-out.",
      },
      maintenance: {
        label: "Maintenance",
        shortLabel: "Maintenance",
        dotClass: "bg-slate-500",
        cardClass:
          "border-slate-300 bg-gradient-to-br from-slate-100 to-white text-slate-800",
        badgeClass: "bg-slate-200 text-slate-700",
        helper: "Kamar sedang maintenance.",
      },
      inactive: {
        label: "Nonaktif",
        shortLabel: "Nonaktif",
        dotClass: "bg-gray-400",
        cardClass:
          "border-gray-200 bg-gradient-to-br from-gray-100 to-white text-gray-700 opacity-80",
        badgeClass: "bg-gray-200 text-gray-600",
        helper: "Kamar sedang dinonaktifkan.",
      },
    };

    return map[status] || map.available;
  };

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

  const getRoomUnitSortText = (unit) => {
    return String(
      unit?.room_number ||
        unit?.unit_number ||
        unit?.number ||
        unit?.name ||
        unit?.room?.room_number ||
        unit?.room?.name ||
        ""
    ).trim();
  };

  const sortRoomUnitsByNumber = (units = []) => {
    const collator = new Intl.Collator("id-ID", {
      numeric: true,
      sensitivity: "base",
    });

    return [...units].sort((a, b) => {
      const roomCompare = collator.compare(
        getRoomUnitSortText(a),
        getRoomUnitSortText(b)
      );

      if (roomCompare !== 0) return roomCompare;

      return Number(a?.id || 0) - Number(b?.id || 0);
    });
  };

  const visibleRoomUnits = useMemo(() => {
    const units = Array.isArray(calendarData.room_units)
      ? calendarData.room_units
      : [];

    let filteredUnits = [];

    if (canAccessAllHotels) {
      filteredUnits = units;
    } else if (assignedHotelIds.length > 0) {
      filteredUnits = units.filter((unit) =>
        assignedHotelIds.includes(
          String(unit.hotel_id ?? unit.room?.hotel_id ?? unit.hotel?.id ?? "")
        )
      );
    }

    return sortRoomUnitsByNumber(filteredUnits);
  }, [calendarData.room_units, assignedHotelIds, canAccessAllHotels]);


  const CALENDAR_ROW_HEIGHT = 72;

  const calendarDisplayRows = useMemo(() => {
    const realRows = Array.isArray(visibleRoomUnits) ? visibleRoomUnits : [];

    return realRows.map((unit) => ({
      ...unit,
      isPlaceholder: false,
    }));
  }, [visibleRoomUnits]);

  const monitoringSummary = useMemo(() => {
    const base = {
      available: 0,
      occupied: 0,
      reserved: 0,
      cleaning: 0,
      checkout_due: 0,
      maintenance: 0,
      inactive: 0,
    };

    calendarDisplayRows.forEach((unit) => {
      const status = getMonitoringStatus(unit);
      base[status] = (base[status] || 0) + 1;
    });

    return base;
  }, [calendarDisplayRows, calendarData.bookings, currentDate]);

  const calendarViewportStyle = {
    maxHeight: isCalendarFullscreen
      ? "max(520px, calc(100vh - 245px))"
      : "max(430px, calc(100vh - 285px))",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

        <div
          ref={fullscreenAreaRef}
          className={`booking-calendar-fullscreen-shell min-w-0 transition-all ${
            isCalendarFullscreen
              ? "fixed inset-0 z-[1300] overflow-auto bg-gray-100 p-3 pb-10 md:p-5 md:pb-12"
              : "p-4 pb-14 md:p-6 md:pb-16"
          }`}
        >
          <style>{calendarScrollStyle}</style>

          <div className="mb-3 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <div className="grid grid-cols-1 gap-2 rounded-[18px] bg-slate-100 p-1 sm:grid-cols-3">
              {[
                {
                  label: "Booking Calendar",
                  helper: "Lihat jadwal booking per kamar",
                  path: "/admin/bookings/calendar",
                  icon: Clock3,
                },
                {
                  label: "Booking List",
                  helper: "Buka daftar booking operasional",
                  path: "/admin/bookings",
                  icon: ClipboardList,
                },
                {
                  label: "Monitoring Kamar",
                  helper: "Buka status kamar real-time",
                  path: "/admin/room-units",
                  icon: BedDouble,
                },
              ].map((tab) => {
                const Icon = tab.icon;

                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-center gap-2 rounded-[15px] px-3 py-3 text-left transition md:justify-start md:px-4 ${
                        isActive
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive
                              ? "bg-red-50 text-red-600"
                              : "bg-white/70 text-slate-500"
                          }`}
                        >
                          <Icon size={17} />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">
                            {tab.label}
                          </span>
                          <span className="hidden truncate text-[11px] font-semibold text-slate-400 md:block">
                            {tab.helper}
                          </span>
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="mb-3 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              <select
                name="hotel_id"
                value={filters.hotel_id}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 sm:w-[220px] lg:w-[230px]"
                aria-label="Pilih cabang"
              >
                {canAccessAllHotels && <option value="">Semua Cabang</option>}
                {!canAccessAllHotels && <option value="">Pilih Cabang</option>}

                {accessibleHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>

              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="h-10 w-[145px] rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                aria-label="Pilih bulan"
              >
                {monthNames.map((monthName, index) => (
                  <option key={index + 1} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>

              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="h-10 w-[112px] rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                aria-label="Pilih tahun"
              >
                {[2025, 2026, 2027, 2028].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleToggleCalendarFullscreen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100"
                title={
                  isCalendarFullscreen
                    ? "Kembali ke tampilan biasa"
                    : "Perbesar halaman Booking Calendar"
                }
                aria-label={
                  isCalendarFullscreen
                    ? "Kembali ke tampilan biasa"
                    : "Perbesar halaman Booking Calendar"
                }
              >
                {isCalendarFullscreen ? (
                  <Minimize2 size={17} />
                ) : (
                  <Maximize2 size={17} />
                )}
              </button>

              <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
                <Legend color="bg-amber-600" label="Disetujui" />
                <Legend color="bg-green-500" label="Check-in" />
                <Legend color="bg-orange-500" label="Pembersihan" />
                <Legend color="bg-slate-500" label="Selesai" />
                <Legend color="bg-red-700" label="Waktunya Check-out" />
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
                    Pilih cabang dari dropdown untuk membuka isi
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
            <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm md:mb-10">
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
                  ref={calendarScrollRef}
                  onMouseDown={handleCalendarDragStart}
                  onMouseMove={handleCalendarDragMove}
                  onMouseUp={handleCalendarDragEnd}
                  onMouseLeave={handleCalendarDragEnd}
                  onDragStart={(event) => event.preventDefault()}
                  className={`calendar-scroll-area calendar-drag-scroll overflow-auto overscroll-contain ${
                    isCalendarDragging ? "is-dragging" : ""
                  }`}
                  style={calendarViewportStyle}
                  title="Klik tahan area kalender kosong untuk menggeser kiri, kanan, atas, atau bawah"
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
                                Kamar {unit.room_number}
                              </p>
                              <p className="truncate text-[11px] font-medium text-gray-500">
                                {getCalendarUnitTypeLabel(unit)}
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
                              const checkoutDanger = isBookingCheckoutDanger(booking);

                              return (
                                <button
                                  key={booking.id}
                                  type="button"
                                  data-no-drag="true"
                                  onClick={() =>
                                    setSelectedBooking({
                                      ...booking,
                                      related_bookings_same_day:
                                        relatedBookings,
                                    })
                                  }
                                  className={`absolute top-2.5 h-[52px] overflow-hidden rounded-[13px] border px-2.5 py-1 text-left shadow-[0_10px_18px_rgba(15,23,42,0.15)] transition-all duration-200 hover:z-50 hover:scale-[1.03] hover:shadow-[0_14px_24px_rgba(15,23,42,0.20)] ${checkoutDanger ? "rr-calendar-danger-pulse" : ""} ${getBlockColor(
                                    booking
                                  )}`}
                                  style={blockStyle}
                                  title={`${booking.guest_name || "-"} | ${
                                    booking.guest_phone || "-"
                                  } | ${booking.booking_code}`}
                                >
                                  <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-white/30" />

                                  {checkoutDanger && (
                                    <p className="truncate pr-8 text-[8px] font-black uppercase tracking-[0.14em] text-yellow-100">
                                      Waktunya Check-out
                                    </p>
                                  )}

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
          getCalendarCheckInTime={getCalendarCheckInTime}
          getCalendarCheckOutTime={getCalendarCheckOutTime}
          isBookingCheckoutDanger={isBookingCheckoutDanger}
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
  getCalendarCheckInTime,
  getCalendarCheckOutTime,
  isBookingCheckoutDanger,
}) {
  const normalizeRoomTypeLabel = (value) => {
    const text = String(value || "").trim();

    if (!text) return "Kamar";

    const cleaned = text.replace(/\s+room$/i, "").trim();

    return cleaned || text;
  };

  const getBookingTypeText = (bookingType) => {
    if (bookingType === "overnight") return "Full Day";
    if (bookingType === "transit") return "Transit";
    return bookingType || "-";
  };

  const roomLabel = normalizeRoomTypeLabel(booking.room?.type || booking.room?.name || "Kamar");
  const unitNumber = booking.room_unit?.room_number || booking.room_number || "-";
  const roomUnitText = unitNumber === "-" ? roomLabel : `${roomLabel} / ${unitNumber}`;
  const totalPriceText = booking.total_price
    ? `Rp ${Number(booking.total_price).toLocaleString("id-ID")}`
    : "-";
  const actualCheckInTime = getCalendarCheckInTime
    ? getCalendarCheckInTime(booking)
    : booking.check_in;
  const targetCheckOutTime = getCalendarCheckOutTime
    ? getCalendarCheckOutTime(booking)
    : booking.check_out;
  const checkoutDanger = isBookingCheckoutDanger
    ? isBookingCheckoutDanger(booking)
    : false;

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

          {checkoutDanger && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              <p className="text-sm font-black uppercase tracking-wide">
                Waktunya Check-out
              </p>
              <p className="mt-1 text-xs font-semibold">
                Booking ini sudah melewati target check-out dan belum ditekan Check-out.
              </p>
            </div>
          )}

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
                label="Jam Masuk Tamu"
                value={formatDateTime(actualCheckInTime)}
              />

              <InfoCard
                icon={<Clock3 size={17} className="text-red-500" />}
                label="Target Check-out"
                value={formatDateTime(targetCheckOutTime)}
              />

              <InfoCard
                icon={<Clock3 size={17} className="text-red-500" />}
                label="Jadwal Booking Awal"
                value={`${formatDateTime(booking.check_in)} - ${formatDateTime(booking.check_out)}`}
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