import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import {
  ClipboardList,
  Hotel,
  BedDouble,
  User,
  CalendarDays,
  Wallet,
  CircleCheck,
  CircleX,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Plus,
  Building2,
  DoorOpen,
  Clock3,
  MoonStar,
  Save,
  Phone,
  Mail,
  Pencil,
  Layers3,
  History,
  MessageCircle,
  ReceiptText,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  X,
  Trash2,
} from "lucide-react";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [roomUnits, setRoomUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [approving, setApproving] = useState(false);

  const [selectedRejectBooking, setSelectedRejectBooking] = useState(null);
  const [rejectReasonCustomer, setRejectReasonCustomer] = useState("");
  const [rejectReasonInternal, setRejectReasonInternal] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [selectedEditBooking, setSelectedEditBooking] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editRoomUnits, setEditRoomUnits] = useState([]);
  const [editForm, setEditForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    room_unit_id: "",
    check_in: "",
    admin_note: "",
  });

  const [selectedRefundBooking, setSelectedRefundBooking] = useState(null);
  const [refunding, setRefunding] = useState(false);
  const [refundForm, setRefundForm] = useState({
    refund_amount: "",
    refund_reason: "",
  });

  const [selectedCancelBooking, setSelectedCancelBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    cancel_reason: "",
  });

  const [selectedDeleteBooking, setSelectedDeleteBooking] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualModalFullscreen, setManualModalFullscreen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [manualRoomUnits, setManualRoomUnits] = useState([]);
  const [savingManual, setSavingManual] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingManualUnits, setLoadingManualUnits] = useState(false);

  const [manualForm, setManualForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    hotel_id: "",
    room_id: "",
    room_unit_id: "",
    booking_type: "transit",
    duration_hours: "",
    duration_days: "1",
    check_in: "",
    manual_discount_percent: "",
    admin_note: "",
  });

  const [manualDatePickerOpen, setManualDatePickerOpen] = useState(false);
  const [manualCheckInDraft, setManualCheckInDraft] = useState({
    date: "",
    hour: "14",
    minute: "00",
  });
  const [manualCalendarMonth, setManualCalendarMonth] = useState(() => new Date());

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    bookingType: "",
    hotelId: "",
    month: "",
  });

  const [viewMode, setViewMode] = useState("today_active");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHousekeepingReportModal, setShowHousekeepingReportModal] = useState(false);
  const [housekeepingReportDate, setHousekeepingReportDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [reportShift, setReportShift] = useState("all");
  const [reportPaymentMethod, setReportPaymentMethod] = useState("all");
  const [reportDate, setReportDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [userAccessHotels, setUserAccessHotels] = useState([]);
  const [loadingUserAccessHotels, setLoadingUserAccessHotels] = useState(false);
  const [branchSeenMap, setBranchSeenMap] = useState({});

  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const receiptPrintRef = useRef(null);
  const reportPrintRef = useRef(null);
  const housekeepingPrintRef = useRef(null);

  const [selectedPaidBooking, setSelectedPaidBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [actualCheckInInput, setActualCheckInInput] = useState("");
  const [expectedCheckOutInput, setExpectedCheckOutInput] = useState("");
  const [paying, setPaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const bookingFullscreenStorageKey = "readyroom_admin_booking_fullscreen";
  const [isBookingListFullscreen, setIsBookingListFullscreen] = useState(() => {
    try {
      return sessionStorage.getItem(bookingFullscreenStorageKey) === "1";
    } catch (error) {
      return false;
    }
  });

  const getNativeFullscreenElement = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  };

  const requestNativeBrowserFullscreen = async () => {
    const target = document.documentElement;

    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return;
    }

    if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
      return;
    }

    if (target.mozRequestFullScreen) {
      await target.mozRequestFullScreen();
      return;
    }

    if (target.msRequestFullscreen) {
      await target.msRequestFullscreen();
      return;
    }

    throw new Error("Browser tidak mendukung fullscreen mode");
  };

  const exitNativeBrowserFullscreen = async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }

    if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
      return;
    }

    if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
      return;
    }

    if (document.msExitFullscreen) {
      await document.msExitFullscreen();
      return;
    }
  };

  const [selectedPenaltyBooking, setSelectedPenaltyBooking] = useState(null);
  const [savingPenalty, setSavingPenalty] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({
    penalty_type: "smoking",
    title: "Merokok di kamar",
    amount: "",
    note: "",
  });

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const canEditBooking =
    adminUser?.role === "boss" || adminUser?.role === "super_admin";
  const canDeleteBooking =
    adminUser?.role === "boss" || adminUser?.role === "super_admin";
  const canCancelBooking = ["boss", "super_admin", "pengawas", "admin"].includes(
    adminUser?.role
  );
  const canAccessAllHotels =
    adminUser?.role === "boss" ||
    adminUser?.role === "super_admin" ||
    adminUser?.role === "pengawas";

  const MANUAL_FULL_DAY_START_HOUR = 14;
  const UNAVAILABLE_PACKAGE_MESSAGE =
    "Paket ini tidak tersedia untuk tipe kamar ini.";

  useEffect(() => {
    fetchBookings();
    fetchHotels();
    fetchRooms();
    fetchUserAccessHotels();

    const intervalId = window.setInterval(() => {
      fetchBookings(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const clockIntervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => window.clearInterval(clockIntervalId);
  }, []);

  useEffect(() => {
    const saveFullscreenState = (value) => {
      try {
        sessionStorage.setItem(bookingFullscreenStorageKey, value ? "1" : "0");
      } catch (error) {
        console.error("SAVE BOOKING FULLSCREEN STATE ERROR:", error);
      }
    };

    const nativeFullscreenActive = Boolean(getNativeFullscreenElement());

    if (nativeFullscreenActive !== isBookingListFullscreen) {
      setIsBookingListFullscreen(nativeFullscreenActive);
      saveFullscreenState(nativeFullscreenActive);
    } else {
      saveFullscreenState(isBookingListFullscreen);
    }

    const handleNativeFullscreenChange = () => {
      const isNativeFullscreen = Boolean(getNativeFullscreenElement());

      setIsBookingListFullscreen(isNativeFullscreen);
      saveFullscreenState(isNativeFullscreen);
    };

    const handleEscapeFullscreen = (event) => {
      if (event.key !== "Escape") return;

      if (!getNativeFullscreenElement() && isBookingListFullscreen) {
        setIsBookingListFullscreen(false);
        saveFullscreenState(false);
      }
    };

    document.addEventListener("fullscreenchange", handleNativeFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleNativeFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleNativeFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleNativeFullscreenChange);
    document.addEventListener("keydown", handleEscapeFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleNativeFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleNativeFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleNativeFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleNativeFullscreenChange);
      document.removeEventListener("keydown", handleEscapeFullscreen);
    };
  }, [isBookingListFullscreen]);

  useEffect(() => {
    const storageKey = `readyroom_booking_seen_map_${adminUser?.id || "guest"}`;

    try {
      const saved = localStorage.getItem(storageKey);
      setBranchSeenMap(saved ? JSON.parse(saved) : {});
    } catch (error) {
      console.error("READ BOOKING SEEN MAP ERROR:", error);
      setBranchSeenMap({});
    }
  }, [adminUser?.id]);

  useEffect(() => {
    if (manualForm.room_id) {
      fetchManualRoomUnits(manualForm.room_id);
    } else {
      setManualRoomUnits([]);
      setManualForm((prev) => ({
        ...prev,
        room_unit_id: "",
      }));
    }
  }, [manualForm.room_id]);

  useEffect(() => {
    if (filters.hotelId) {
      markHotelAsSeen(filters.hotelId);
    }
  }, [filters.hotelId]);

  const fetchBookings = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const res = await api.get("/admin/bookings");

      const bookingData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setBookings(bookingData);
    } catch (error) {
      console.error("GET BOOKINGS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil data booking");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const fetchHotels = async () => {
    try {
      setLoadingHotels(true);
      const res = await api.get("/admin/hotels");
      const hotelData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.hotels)
        ? res.data.hotels
        : Array.isArray(res.data)
        ? res.data
        : [];
      setHotels(hotelData);
    } catch (error) {
      console.error("GET HOTELS ERROR:", error.response?.data || error);
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get("/admin/rooms");
      const roomData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setRooms(roomData);
    } catch (error) {
      console.error("GET ROOMS ERROR:", error.response?.data || error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchUserAccessHotels = async () => {
    if (!adminUser?.id || canAccessAllHotels) {
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
      return;
    }

    try {
      setLoadingUserAccessHotels(true);

      const res = await api.get("/admin/users/admin");
      const usersData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const currentUser = usersData.find(
        (user) => String(user.id) === String(adminUser.id)
      );

      setUserAccessHotels(Array.isArray(currentUser?.hotels) ? currentUser.hotels : []);
    } catch (error) {
      console.error("GET USER ACCESS HOTELS ERROR:", error.response?.data || error);
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
    } finally {
      setLoadingUserAccessHotels(false);
    }
  };

  const fetchRoomUnits = async (roomId) => {
    try {
      const res = await api.get(`/admin/room-units/${roomId}`);

      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const availableUnits = unitData.filter(
        (unit) => unit.status === true || unit.status === 1
      );

      setRoomUnits(availableUnits);
      return availableUnits;
    } catch (err) {
      console.error("GET ROOM UNITS ERROR:", err.response?.data || err);
      toast.error("Gagal ambil kamar fisik");
      return [];
    }
  };

  const fetchManualRoomUnits = async (roomId) => {
    try {
      setLoadingManualUnits(true);
      const res = await api.get(`/admin/room-units/${roomId}`);

      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const activeUnits = unitData.filter(
        (unit) => unit.status === 1 || unit.status === true
      );

      setManualRoomUnits(activeUnits);
    } catch (error) {
      console.error("GET MANUAL ROOM UNITS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil kamar fisik");
    } finally {
      setLoadingManualUnits(false);
    }
  };

  const handleApproveClick = async (booking) => {
    setSelectedBooking(booking);
    setSelectedUnit("");
    setAdminNote("");
    await fetchRoomUnits(booking.room_id);
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    if (!selectedUnit) {
      toast.error("Pilih kamar fisik dulu");
      return;
    }

    try {
      setApproving(true);

      await api.post(`/admin/bookings/${selectedBooking.id}/approve`, {
        room_unit_id: selectedUnit,
        admin_note: adminNote,
      });

      toast.success("Booking berhasil di-approve");

      setSelectedBooking(null);
      setSelectedUnit("");
      setAdminNote("");
      setRoomUnits([]);

      fetchBookings();
    } catch (err) {
      console.error("APPROVE BOOKING ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Gagal approve booking");
    } finally {
      setApproving(false);
    }
  };

  const closeApproveModal = () => {
    setSelectedBooking(null);
    setSelectedUnit("");
    setAdminNote("");
    setRoomUnits([]);
  };

  const handleRejectClick = (booking) => {
    setSelectedRejectBooking(booking);
    setRejectReasonCustomer("Mohon maaf, kamar sedang penuh pada jadwal tersebut.");
    setRejectReasonInternal("");
  };

  const closeRejectModal = () => {
    setSelectedRejectBooking(null);
    setRejectReasonCustomer("");
    setRejectReasonInternal("");
  };

  const handleReject = async () => {
    if (!selectedRejectBooking) return;

    if (!rejectReasonCustomer.trim()) {
      toast.error("Alasan untuk tamu wajib diisi");
      return;
    }

    try {
      setRejecting(true);

      await api.post(`/admin/bookings/${selectedRejectBooking.id}/reject`, {
        rejection_reason_customer: rejectReasonCustomer.trim(),
        rejection_reason_internal: rejectReasonInternal.trim() || null,
      });

      toast.success("Booking berhasil ditolak");
      closeRejectModal();
      fetchBookings();
    } catch (error) {
      console.error("REJECT BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal reject booking");
    } finally {
      setRejecting(false);
    }
  };

  const toSafeDate = (value) => {
    if (!value) return null;

    const normalizedValue =
      value instanceof Date
        ? value
        : new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(normalizedValue.getTime())) return null;

    return normalizedValue;
  };

  const getDateTimeLocalInputValue = (value) => {
    const date = value instanceof Date ? value : toSafeDate(value);
    if (!date) return "";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const normalizeBackendDateTime = (value) => {
    if (!value) return null;

    const [datePart, rawTimePart = "00:00"] = String(value).split("T");
    const timePart = rawTimePart.length === 5 ? `${rawTimePart}:00` : rawTimePart;

    return `${datePart} ${timePart}`;
  };

  const getBookingDurationMs = (booking) => {
    const checkIn = toSafeDate(booking?.check_in);
    const checkOut = toSafeDate(booking?.check_out);

    if (checkIn && checkOut && checkOut.getTime() > checkIn.getTime()) {
      return checkOut.getTime() - checkIn.getTime();
    }

    if (booking?.booking_type === "transit" && Number(booking?.duration_hours || 0) > 0) {
      return Number(booking.duration_hours) * 60 * 60 * 1000;
    }

    if (Number(booking?.duration_days || 0) > 0) {
      return Number(booking.duration_days) * 24 * 60 * 60 * 1000;
    }

    return 3 * 60 * 60 * 1000;
  };

  const calculateExpectedCheckoutInput = (booking, actualCheckInValue) => {
    const actualCheckIn = toSafeDate(actualCheckInValue);
    if (!actualCheckIn) {
      return getDateTimeLocalInputValue(booking?.check_out);
    }

    const expectedCheckout = new Date(
      actualCheckIn.getTime() + getBookingDurationMs(booking)
    );

    return getDateTimeLocalInputValue(expectedCheckout);
  };

  const getOperationalMetaFromNote = (note) => {
    const rawNote = String(note || "");
    const match = rawNote.match(
      /\[RR_OPS\s+actual_check_in="([^"]*)"\s+expected_check_out="([^"]*)"\]/i
    );

    return {
      actualCheckIn: match?.[1] || null,
      expectedCheckOut: match?.[2] || null,
    };
  };

  const cleanPaymentNote = (note) => {
    return String(note || "")
      .replace(/\[RR_OPS\s+actual_check_in="[^"]*"\s+expected_check_out="[^"]*"\]/gi, "")
      .trim();
  };

  const buildPaymentNoteWithOperationalTime = (
    note,
    actualCheckInValue,
    expectedCheckOutValue
  ) => {
    const cleanNote = cleanPaymentNote(note);
    const actualCheckIn = normalizeBackendDateTime(actualCheckInValue) || "";
    const expectedCheckOut = normalizeBackendDateTime(expectedCheckOutValue) || "";
    const meta = `[RR_OPS actual_check_in="${actualCheckIn}" expected_check_out="${expectedCheckOut}"]`;

    return cleanNote ? `${cleanNote}\n\n${meta}` : meta;
  };

  const getOperationalTimeMeta = (booking) => {
    const noteMeta = getOperationalMetaFromNote(booking?.payment_note);

    return {
      actualCheckIn:
        booking?.actual_check_in ||
        booking?.check_in_actual ||
        booking?.checked_in_at ||
        booking?.checkin_at ||
        noteMeta.actualCheckIn ||
        null,
      expectedCheckOut:
        booking?.expected_check_out ||
        booking?.check_out_target ||
        booking?.checkout_target ||
        booking?.estimated_check_out ||
        booking?.operational_check_out ||
        noteMeta.expectedCheckOut ||
        null,
    };
  };

  const getOperationalCheckInTime = (booking) => {
    const meta = getOperationalTimeMeta(booking);
    return meta.actualCheckIn || booking?.check_in || null;
  };

  const getOperationalCheckoutTime = (booking) => {
    const meta = getOperationalTimeMeta(booking);
    return (
      booking?.actual_check_out ||
      booking?.checked_out_at ||
      meta.expectedCheckOut ||
      booking?.check_out ||
      null
    );
  };

  const isBookingCheckoutOverdue = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    if (status !== "checked_in") return false;

    const checkoutDate = toSafeDate(getOperationalCheckoutTime(booking));
    if (!checkoutDate) return false;

    return currentTime.getTime() > checkoutDate.getTime();
  };

  const handleMarkPaid = (booking) => {
    const nowInput = getDateTimeLocalInputValue(new Date());
    const existingMeta = getOperationalTimeMeta(booking);
    const defaultActualCheckIn =
      getDateTimeLocalInputValue(existingMeta.actualCheckIn) || nowInput;
    const defaultExpectedCheckOut =
      getDateTimeLocalInputValue(existingMeta.expectedCheckOut) ||
      calculateExpectedCheckoutInput(booking, defaultActualCheckIn);

    setSelectedPaidBooking(booking);
    setPaymentMethod(booking?.payment_method || "cash");
    setPaidAmountInput(String(Math.round(Number(booking?.total_price || 0))));
    setPaymentNote(cleanPaymentNote(booking?.payment_note || ""));
    setActualCheckInInput(defaultActualCheckIn);
    setExpectedCheckOutInput(defaultExpectedCheckOut);
  };

  const closePaidModal = () => {
    setSelectedPaidBooking(null);
    setPaymentMethod("cash");
    setPaidAmountInput("");
    setPaymentNote("");
    setActualCheckInInput("");
    setExpectedCheckOutInput("");
  };

  const confirmPayment = async () => {
    if (!selectedPaidBooking) return;

    const parsedPaidAmount = paidAmountInput === "" ? null : Number(paidAmountInput);

    if (paidAmountInput !== "" && (Number.isNaN(parsedPaidAmount) || parsedPaidAmount < 0)) {
      toast.error("Nominal pembayaran tidak valid");
      return;
    }

    if (!actualCheckInInput) {
      toast.error("Jam check-in aktual wajib diisi");
      return;
    }

    if (!expectedCheckOutInput) {
      toast.error("Jam check-out wajib diisi");
      return;
    }

    const actualCheckInDate = toSafeDate(actualCheckInInput);
    const expectedCheckOutDate = toSafeDate(expectedCheckOutInput);

    if (!actualCheckInDate || !expectedCheckOutDate) {
      toast.error("Format jam check-in atau check-out tidak valid");
      return;
    }

    if (expectedCheckOutDate.getTime() <= actualCheckInDate.getTime()) {
      toast.error("Jam check-out harus lebih besar dari jam check-in");
      return;
    }

    const actualCheckInBackend = normalizeBackendDateTime(actualCheckInInput);
    const expectedCheckOutBackend = normalizeBackendDateTime(expectedCheckOutInput);
    const noteWithOperationalTime = buildPaymentNoteWithOperationalTime(
      paymentNote,
      actualCheckInInput,
      expectedCheckOutInput
    );

    try {
      setPaying(true);

      await api.post(`/admin/bookings/${selectedPaidBooking.id}/paid`, {
        payment_method: paymentMethod,
        paid_amount: parsedPaidAmount,
        payment_note: noteWithOperationalTime,
        actual_check_in: actualCheckInBackend,
        expected_check_out: expectedCheckOutBackend,
        check_in_actual: actualCheckInBackend,
        check_out_target: expectedCheckOutBackend,
      });

      try {
        await api.post(`/admin/bookings/${selectedPaidBooking.id}/check-in`, {
          actual_check_in: actualCheckInBackend,
          expected_check_out: expectedCheckOutBackend,
          check_in_actual: actualCheckInBackend,
          check_out_target: expectedCheckOutBackend,
        });

        toast.success("Pembayaran tersimpan dan tamu berhasil check-in");
      } catch (checkInError) {
        console.error("CHECK IN AFTER PAYMENT ERROR:", checkInError.response?.data || checkInError);
        toast.success("Pembayaran tersimpan, tapi check-in belum otomatis. Silakan tekan Check In jika masih muncul.");
      }

      closePaidModal();
      fetchBookings();
    } catch (error) {
      console.error("PAYMENT ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal proses pembayaran");
    } finally {
      setPaying(false);
    }
  };

  const handleCheckIn = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/check-in`);
      toast.success("Tamu berhasil check-in");
      fetchBookings();
    } catch (error) {
      console.error("CHECK IN ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal check-in");
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/check-out`);
      toast.success("Tamu berhasil check-out");
      fetchBookings();
    } catch (error) {
      console.error("CHECK OUT ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal check-out");
    }
  };

  const handleStartCleaning = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/start-cleaning`, {
        admin_user_id: adminUser?.id || null,
        current_user_id: adminUser?.id || null,
        changed_by: adminUser?.id || null,
        cleaning_estimation_minutes: 15,
      });

      toast.success("Cleaning mulai ditangani");
      fetchBookings();
    } catch (error) {
      console.error("START CLEANING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal memulai cleaning");
    }
  };

  const handleFinishCleaning = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/finish-cleaning`, {
        admin_user_id: adminUser?.id || null,
        current_user_id: adminUser?.id || null,
        changed_by: adminUser?.id || null,
      });

      toast.success("Cleaning ditandai selesai");
      fetchBookings();
    } catch (error) {
      console.error("FINISH CLEANING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan cleaning"
      );
    }
  };

  const handleEditClick = async (booking) => {
    const units = await fetchRoomUnits(booking.room_id);

    setSelectedEditBooking(booking);
    setEditRoomUnits(units);

    setEditForm({
      guest_name: booking.guest_name || booking.user?.name || "",
      guest_phone: booking.guest_phone || "",
      guest_email: booking.guest_email || "",
      room_unit_id: booking.room_unit_id || "",
      check_in: booking.check_in
        ? String(booking.check_in).replace(" ", "T").slice(0, 16)
        : "",
      admin_note: booking.admin_note || "",
    });
  };

  const closeEditModal = () => {
    setSelectedEditBooking(null);
    setEditRoomUnits([]);
    setEditForm({
      guest_name: "",
      guest_phone: "",
      guest_email: "",
      room_unit_id: "",
      check_in: "",
      admin_note: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBooking = async () => {
    if (!selectedEditBooking) return;

    if (!editForm.guest_name.trim()) return toast.error("Nama tamu wajib diisi");
    if (!editForm.guest_phone.trim()) return toast.error("Nomor HP wajib diisi");
    if (!editForm.room_unit_id) return toast.error("Pilih kamar fisik");
    if (!editForm.check_in) return toast.error("Check-in wajib diisi");

    try {
      setEditing(true);

      await api.post(`/admin/bookings/${selectedEditBooking.id}/update`, {
        guest_name: editForm.guest_name.trim(),
        guest_phone: editForm.guest_phone.trim(),
        guest_email: editForm.guest_email.trim() || null,
        room_unit_id: Number(editForm.room_unit_id),
        check_in: editForm.check_in.replace("T", " ") + ":00",
        admin_note: editForm.admin_note || "",
        edited_by: adminUser?.id || null,
      });

      toast.success("Booking berhasil diupdate");
      closeEditModal();
      fetchBookings();
    } catch (error) {
      console.error("UPDATE BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update booking");
    } finally {
      setEditing(false);
    }
  };

  const openRefundModal = (booking) => {
    setSelectedRefundBooking(booking);
    setRefundForm({
      refund_amount: booking.total_price || "",
      refund_reason: "",
    });
  };

  const closeRefundModal = () => {
    setSelectedRefundBooking(null);
    setRefundForm({
      refund_amount: "",
      refund_reason: "",
    });
  };

  const handleRefundChange = (e) => {
    const { name, value } = e.target;
    setRefundForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefundBooking = async () => {
    if (!selectedRefundBooking) return;
    if (!refundForm.refund_reason.trim()) {
      toast.error("Alasan refund wajib diisi");
      return;
    }

    try {
      setRefunding(true);

      await api.post(`/admin/bookings/${selectedRefundBooking.id}/refund`, {
        refunded_by: adminUser?.id || null,
        refund_reason: refundForm.refund_reason.trim(),
        refund_amount: refundForm.refund_amount
          ? Number(refundForm.refund_amount)
          : Number(selectedRefundBooking.total_price || 0),
      });

      toast.success("Refund berhasil diproses");
      closeRefundModal();
      fetchBookings();
    } catch (error) {
      console.error("REFUND BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal memproses refund");
    } finally {
      setRefunding(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedCancelBooking(booking);
    setCancelForm({
      cancel_reason:
        "Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.",
    });
  };

  const closeCancelModal = () => {
    setSelectedCancelBooking(null);
    setCancelForm({
      cancel_reason: "",
    });
  };

  const handleCancelChange = (e) => {
    const { name, value } = e.target;
    setCancelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelBooking = async () => {
    if (!selectedCancelBooking) return;

    if (!cancelForm.cancel_reason.trim()) {
      toast.error("Alasan cancel wajib diisi");
      return;
    }

    try {
      setCancelling(true);

      await api.post(`/admin/bookings/${selectedCancelBooking.id}/cancel`, {
        cancelled_by: adminUser?.id || null,
        cancel_reason: cancelForm.cancel_reason.trim(),
      });

      toast.success("Booking berhasil dicancel");
      closeCancelModal();
      fetchBookings();
    } catch (error) {
      console.error("CANCEL BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const openDeleteModal = (booking) => {
    if (!canDeleteBooking) {
      toast.error("Hanya boss atau super admin yang bisa hapus booking");
      return;
    }

    setSelectedDeleteBooking(booking);
  };

  const closeDeleteModal = () => {
    setSelectedDeleteBooking(null);
  };

  const handleDeleteBooking = async () => {
    if (!selectedDeleteBooking) return;

    if (!canDeleteBooking) {
      toast.error("Hanya boss atau super admin yang bisa hapus booking");
      return;
    }

    try {
      setDeletingBooking(true);

      await api.delete(`/admin/bookings/${selectedDeleteBooking.id}`, {
        data: {
          deleted_by: adminUser?.id || null,
          delete_mode: "force",
        },
      });

      toast.success("Booking berhasil dihapus permanen");
      closeDeleteModal();
      fetchBookings();
    } catch (error) {
      console.error("DELETE BOOKING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Gagal hapus booking. Pastikan endpoint hapus permanen booking sudah ada di backend."
      );
    } finally {
      setDeletingBooking(false);
    }
  };

  const openManualModal = () => {
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setShowManualModal(false);
    setManualModalFullscreen(false);
    setManualForm({
      guest_name: "",
      guest_phone: "",
      guest_email: "",
      hotel_id: "",
      room_id: "",
      room_unit_id: "",
      booking_type: "transit",
      duration_hours: "",
      duration_days: "1",
      check_in: "",
      manual_discount_percent: "",
      admin_note: "",
    });
    setManualRoomUnits([]);
    setManualDatePickerOpen(false);
    setManualCheckInDraft({
      date: "",
      hour: "14",
      minute: "00",
    });
    setManualCalendarMonth(new Date());
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;

    setManualForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "hotel_id") {
        next.room_id = "";
        next.room_unit_id = "";
      }

      if (name === "room_id") {
        next.room_unit_id = "";
      }

      if (name === "booking_type" && value === "overnight") {
        next.duration_hours = "";
        next.duration_days = prev.duration_days || "1";
      }

      if (name === "booking_type" && value === "transit" && !prev.duration_hours) {
        next.duration_hours = "";
      }

      if (name === "booking_type" && value === "transit") {
        next.duration_days = "1";
      }

      return next;
    });
  };


  const padTwo = (value) => String(value).padStart(2, "0");

  const getLocalDateValue = (date) => {
    return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
  };

  const normalizeManualDraftForBookingType = (draft) => {
    if (manualForm.booking_type !== "overnight") return draft;

    const hourNumber = Number(draft.hour || 0);

    if (hourNumber < MANUAL_FULL_DAY_START_HOUR) {
      return {
        ...draft,
        hour: padTwo(MANUAL_FULL_DAY_START_HOUR),
        minute: "00",
      };
    }

    return draft;
  };

  const getManualPickerDefaultDraft = () => {
    if (manualForm.check_in) {
      const [datePart, timePart = "14:00"] = String(manualForm.check_in).split("T");
      const [hour = "14", minute = "00"] = timePart.split(":");

      return normalizeManualDraftForBookingType({
        date: datePart || getLocalDateValue(new Date()),
        hour: padTwo(hour),
        minute: padTwo(minute),
      });
    }

    const now = new Date();
    const roundedDate = new Date(now);
    const roundedMinute = Math.ceil(now.getMinutes() / 15) * 15;

    if (roundedMinute >= 60) {
      roundedDate.setHours(roundedDate.getHours() + 1, 0, 0, 0);
    } else {
      roundedDate.setMinutes(roundedMinute, 0, 0);
    }

    if (
      manualForm.booking_type === "overnight" &&
      roundedDate.getHours() < MANUAL_FULL_DAY_START_HOUR
    ) {
      roundedDate.setHours(MANUAL_FULL_DAY_START_HOUR, 0, 0, 0);
    }

    return normalizeManualDraftForBookingType({
      date: getLocalDateValue(roundedDate),
      hour: padTwo(roundedDate.getHours()),
      minute: padTwo(roundedDate.getMinutes()),
    });
  };

  const openManualCheckInPicker = () => {
    const draft = getManualPickerDefaultDraft();
    const draftDate = new Date(`${draft.date}T00:00:00`);

    setManualCheckInDraft(draft);
    setManualCalendarMonth(
      Number.isNaN(draftDate.getTime()) ? new Date() : draftDate
    );
    setManualDatePickerOpen(true);
  };

  const handleManualCalendarMonthChange = (direction) => {
    setManualCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const handleManualCalendarDayClick = (day) => {
    if (!day) return;

    setManualCheckInDraft((prev) => ({
      ...prev,
      date: getLocalDateValue(day),
    }));
  };

  const confirmManualCheckInPicker = () => {
    if (!manualCheckInDraft.date) {
      toast.error("Pilih tanggal check-in dulu");
      return;
    }

    if (
      manualForm.booking_type === "overnight" &&
      Number(manualCheckInDraft.hour || 0) < MANUAL_FULL_DAY_START_HOUR
    ) {
      setManualCheckInDraft((prev) => ({
        ...prev,
        hour: padTwo(MANUAL_FULL_DAY_START_HOUR),
        minute: "00",
      }));
      toast.error("Full Day hanya bisa check-in mulai jam 14.00");
      return;
    }

    setManualForm((prev) => ({
      ...prev,
      check_in: `${manualCheckInDraft.date}T${manualCheckInDraft.hour}:${manualCheckInDraft.minute}`,
    }));
    setManualDatePickerOpen(false);
  };

  const clearManualCheckInPicker = () => {
    setManualForm((prev) => ({
      ...prev,
      check_in: "",
    }));
    setManualCheckInDraft({
      date: "",
      hour: "14",
      minute: "00",
    });
    setManualDatePickerOpen(false);
  };

  const getManualCheckInDisplay = (value) => {
    if (!value) return "Pilih tanggal & jam";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Pilih tanggal & jam";

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRoomsForManual = useMemo(() => {
    if (!manualForm.hotel_id) return [];
    return rooms.filter(
      (room) => String(room.hotel_id) === String(manualForm.hotel_id)
    );
  }, [rooms, manualForm.hotel_id]);

  const selectedManualRoom = useMemo(() => {
    return rooms.find((room) => String(room.id) === String(manualForm.room_id));
  }, [rooms, manualForm.room_id]);

  const getManualTransitPriceByDuration = (room, duration) => {
    if (!room) return 0;

    if (String(duration) === "3") return Number(room.price_transit_3h || 0);
    if (String(duration) === "6") return Number(room.price_transit_6h || 0);
    if (String(duration) === "12") return Number(room.price_transit_12h || 0);

    return 0;
  };

  const manualFullDayBasePrice = useMemo(() => {
    return Number(selectedManualRoom?.price_per_night || 0);
  }, [selectedManualRoom]);

  const isManualFullDayAvailable = useMemo(() => {
    return Boolean(selectedManualRoom) && Number(manualFullDayBasePrice || 0) > 0;
  }, [selectedManualRoom, manualFullDayBasePrice]);

  const manualFullDayUnavailableMessage = useMemo(() => {
    if (manualForm.booking_type !== "overnight") return "";

    if (!selectedManualRoom) {
      return "Pilih tipe kamar dulu untuk melihat paket Full Day.";
    }

    if (!isManualFullDayAvailable) {
      return UNAVAILABLE_PACKAGE_MESSAGE;
    }

    return "";
  }, [
    manualForm.booking_type,
    selectedManualRoom,
    isManualFullDayAvailable,
  ]);

  const manualTransitOptions = useMemo(() => {
    return [
      {
        value: "3",
        label: "3 Jam",
        price: getManualTransitPriceByDuration(selectedManualRoom, "3"),
      },
      {
        value: "6",
        label: "6 Jam",
        price: getManualTransitPriceByDuration(selectedManualRoom, "6"),
      },
      {
        value: "12",
        label: "12 Jam",
        price: getManualTransitPriceByDuration(selectedManualRoom, "12"),
      },
    ].map((option) => ({
      ...option,
      available: Number(option.price || 0) > 0,
    }));
  }, [selectedManualRoom]);

  const selectedManualTransitOption = useMemo(() => {
    return manualTransitOptions.find(
      (option) => String(option.value) === String(manualForm.duration_hours)
    );
  }, [manualTransitOptions, manualForm.duration_hours]);

  const availableManualTransitOptions = useMemo(() => {
    return manualTransitOptions.filter((option) => option.available);
  }, [manualTransitOptions]);

  const manualTransitUnavailableMessage = useMemo(() => {
    if (manualForm.booking_type !== "transit") return "";

    if (!selectedManualRoom) {
      return "Pilih tipe kamar dulu untuk melihat durasi transit yang tersedia.";
    }

    if (availableManualTransitOptions.length === 0) {
      return UNAVAILABLE_PACKAGE_MESSAGE;
    }

    if (!manualForm.duration_hours) {
      return "Pilih salah satu durasi transit yang tersedia.";
    }

    if (!selectedManualTransitOption?.available) {
      return UNAVAILABLE_PACKAGE_MESSAGE;
    }

    return "";
  }, [
    manualForm.booking_type,
    manualForm.duration_hours,
    selectedManualRoom,
    selectedManualTransitOption,
    availableManualTransitOptions,
  ]);

  useEffect(() => {
    if (manualForm.booking_type !== "transit") return;
    if (!manualForm.room_id) return;

    if (!selectedManualRoom) {
      if (manualForm.duration_hours) {
        setManualForm((prev) => ({
          ...prev,
          duration_hours: "",
        }));
      }
      return;
    }

    const currentOption = manualTransitOptions.find(
      (option) => String(option.value) === String(manualForm.duration_hours)
    );

    if (currentOption?.available) return;

    setManualForm((prev) => ({
      ...prev,
      duration_hours: "",
    }));
  }, [
    manualForm.booking_type,
    manualForm.room_id,
    manualForm.duration_hours,
    selectedManualRoom,
    manualTransitOptions,
  ]);

  useEffect(() => {
    if (manualForm.booking_type !== "overnight") return;
    if (!manualForm.check_in) return;

    const checkInDate = new Date(manualForm.check_in);

    if (Number.isNaN(checkInDate.getTime())) return;
    if (checkInDate.getHours() >= MANUAL_FULL_DAY_START_HOUR) return;

    checkInDate.setHours(MANUAL_FULL_DAY_START_HOUR, 0, 0, 0);
    const normalizedCheckIn = getDateTimeLocalInputValue(checkInDate);

    setManualForm((prev) => {
      if (prev.check_in === normalizedCheckIn) return prev;

      return {
        ...prev,
        check_in: normalizedCheckIn,
      };
    });

    setManualCheckInDraft((prev) => ({
      ...prev,
      hour: padTwo(MANUAL_FULL_DAY_START_HOUR),
      minute: "00",
    }));
  }, [manualForm.booking_type, manualForm.check_in]);

  const estimatedManualPrice = useMemo(() => {
    if (!selectedManualRoom) return 0;

    if (manualForm.booking_type === "transit") {
      return getManualTransitPriceByDuration(
        selectedManualRoom,
        manualForm.duration_hours
      );
    }

    if (!isManualFullDayAvailable) return 0;

    const durationDays = Math.max(1, Number(manualForm.duration_days || 1));
    return Number(selectedManualRoom.price_per_night || 0) * durationDays;
  }, [
    selectedManualRoom,
    manualForm.booking_type,
    manualForm.duration_hours,
    manualForm.duration_days,
    isManualFullDayAvailable,
  ]);

  const manualDiscountPercent = useMemo(() => {
    const raw = Number(manualForm.manual_discount_percent || 0);
    if (Number.isNaN(raw)) return 0;
    if (raw < 0) return 0;
    if (raw > 100) return 100;
    return raw;
  }, [manualForm.manual_discount_percent]);

  const manualDiscountAmount = useMemo(() => {
    if (!estimatedManualPrice || !manualDiscountPercent) return 0;
    return Math.round((estimatedManualPrice * manualDiscountPercent) / 100);
  }, [estimatedManualPrice, manualDiscountPercent]);

  const finalManualPrice = useMemo(() => {
    return Math.max(0, estimatedManualPrice - manualDiscountAmount);
  }, [estimatedManualPrice, manualDiscountAmount]);

  const handleSaveManualBooking = async () => {
    if (!manualForm.guest_name.trim()) return toast.error("Nama tamu wajib diisi");
    if (!manualForm.guest_phone.trim()) return toast.error("Nomor HP wajib diisi");
    if (!manualForm.hotel_id) return toast.error("Pilih hotel");
    if (!manualForm.room_id) return toast.error("Pilih tipe kamar");
    if (!manualForm.room_unit_id) return toast.error("Pilih kamar fisik");
    if (!manualForm.check_in) return toast.error("Check-in wajib diisi");
    if (manualForm.booking_type === "transit" && !manualForm.duration_hours) {
      return toast.error("Durasi transit wajib dipilih");
    }
    if (
      manualForm.booking_type === "transit" &&
      (!selectedManualTransitOption?.available || Number(estimatedManualPrice || 0) <= 0)
    ) {
      return toast.error(
        manualTransitUnavailableMessage ||
          UNAVAILABLE_PACKAGE_MESSAGE
      );
    }
    if (
      manualForm.booking_type === "overnight" &&
      (!manualForm.duration_days || Number(manualForm.duration_days) < 1)
    ) {
      return toast.error("Durasi hari Full Day wajib diisi");
    }
    if (
      manualForm.booking_type === "overnight" &&
      (!isManualFullDayAvailable || Number(estimatedManualPrice || 0) <= 0)
    ) {
      return toast.error(
        manualFullDayUnavailableMessage || UNAVAILABLE_PACKAGE_MESSAGE
      );
    }
    if (manualForm.booking_type === "overnight") {
      const fullDayCheckIn = new Date(manualForm.check_in);

      if (
        Number.isNaN(fullDayCheckIn.getTime()) ||
        fullDayCheckIn.getHours() < MANUAL_FULL_DAY_START_HOUR
      ) {
        return toast.error("Full Day hanya bisa check-in mulai jam 14.00");
      }
    }

    try {
      setSavingManual(true);

      const payload = {
  guest_name: manualForm.guest_name.trim(),
  guest_phone: manualForm.guest_phone.trim(),
  guest_email: manualForm.guest_email.trim() || null,
  created_by: adminUser?.id || null,
  hotel_id: Number(manualForm.hotel_id),
  room_id: Number(manualForm.room_id),
  room_unit_id: Number(manualForm.room_unit_id),
  booking_type: manualForm.booking_type,
  duration_hours:
    manualForm.booking_type === "transit"
      ? Number(manualForm.duration_hours)
      : null,
  duration_days:
    manualForm.booking_type === "overnight"
      ? Number(manualForm.duration_days || 1)
      : null,
  check_in: manualForm.check_in.replace("T", " ") + ":00",
  check_out:
    manualForm.booking_type === "overnight"
      ? getManualOvernightCheckOut()
      : null,
  admin_note: manualForm.admin_note || "",
  ...(canEditBooking ? { discount_percent: manualDiscountPercent } : {}),
};

      await api.post("/admin/bookings/manual", payload);

      toast.success("Booking manual berhasil dibuat");
      closeManualModal();
      fetchBookings();
    } catch (error) {
      console.error("MANUAL BOOKING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal membuat booking manual"
      );
    } finally {
      setSavingManual(false);
    }
  };

const handlePrintReport = () => {
  const printEl = reportPrintRef.current;

  if (!printEl) {
    toast.error("Laporan belum siap dicetak");
    return;
  }

  const selectedHotel =
    folderHotels.find((hotel) => String(hotel.id) === String(filters.hotelId)) || null;

  const branchName = selectedHotel?.name || "Semua Cabang";
  const printedAt = new Date().toLocaleString("id-ID");
  const shiftLabel =
    reportShift === "all"
      ? "Semua Shift"
      : reportShift === "pagi"
      ? "Shift Pagi"
      : "Shift Malam";
  const paymentMethodLabel = getReportPaymentMethodLabel(reportPaymentMethod);
  const reportDateLabel = reportDate ? formatDate(reportDate) : "Semua Tanggal";

  const printWindow = window.open("", "_blank", "width=1280,height=900");

  if (!printWindow) {
    toast.error("Popup print diblokir browser");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Booking ReadyRoom</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 28px;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
            background:
              radial-gradient(circle at top right, rgba(239,68,68,0.08), transparent 24%),
              radial-gradient(circle at bottom left, rgba(16,185,129,0.08), transparent 26%),
              linear-gradient(180deg, #fff 0%, #f8fafc 100%);
          }
          .sheet {
            max-width: 1180px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 25px 60px rgba(15, 23, 42, 0.10);
          }
          .sheet-top {
            position: relative;
            overflow: hidden;
            padding: 28px 32px;
            background: linear-gradient(135deg, #991b1b 0%, #dc2626 55%, #fb7185 100%);
            color: white;
          }
          .sheet-top::after {
            content: "READYROOM";
            position: absolute;
            right: 20px;
            top: 10px;
            font-size: 34px;
            font-weight: 900;
            letter-spacing: 0.18em;
            color: rgba(255,255,255,0.08);
          }
          .sheet-top h1 {
            margin: 0;
            font-size: 30px;
            font-weight: 800;
          }
          .sheet-top p {
            margin: 8px 0 0;
            font-size: 14px;
            color: rgba(255,255,255,0.92);
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 12px;
            padding: 20px 24px 0;
          }
          .meta-card {
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 12px 14px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          }
          .meta-label {
            margin: 0 0 6px 0;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #6b7280;
          }
          .meta-value {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            color: #111827;
          }
          .content {
            padding: 20px 24px 26px;
          }
          .note {
            margin-bottom: 16px;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid #fee2e2;
            background: linear-gradient(180deg, #fff5f5 0%, #fff1f2 100%);
            color: #b91c1c;
            font-size: 13px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          thead th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            font-weight: 800;
          }
          tbody td {
            padding: 11px 14px;
            border: 1px solid #e5e7eb;
            color: #111827;
            vertical-align: top;
          }
          tbody tr:nth-child(even) {
            background: #fcfcfd;
          }
          .text-right { text-align: right; }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 0 24px 24px;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
              background: #fff;
            }
            .sheet {
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="sheet-top">
            <h1>Laporan Booking ReadyRoom</h1>
            <p>Laporan operasional resepsionis per cabang yang siap dicetak</p>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <p class="meta-label">Cabang</p>
              <p class="meta-value">${branchName}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Tanggal Check In</p>
              <p class="meta-value">${reportDateLabel}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Shift</p>
              <p class="meta-value">${shiftLabel}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Metode Bayar</p>
              <p class="meta-value">${paymentMethodLabel}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Total Data</p>
              <p class="meta-value">${reportBookings.length}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Dicetak</p>
              <p class="meta-value">${printedAt}</p>
            </div>
          </div>

          <div class="content">
            <div class="note">
              Filter aktif: ${branchName} • ${reportDateLabel} • ${shiftLabel} • ${paymentMethodLabel}
            </div>
            ${printEl.innerHTML}
          </div>

          <div class="footer">
            <div>Laporan Admin ReadyRoom</div>
            <div>Dokumen internal cabang</div>
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = function () {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  const getBookingCustomerName = (booking) => {
    return booking?.user?.name || booking?.guest_name || "Tamu";
  };

  const getBookingRoomName = (booking) => {
    return booking?.room?.type || booking?.room?.name || "-";
  };

  const getBookingRoomUnit = (booking) => {
  return (
    booking?.roomUnit?.room_number ||
    booking?.room_unit?.room_number ||
    "Belum di-assign"
  );
};

  const getCreatedByName = (booking) => {
    return (
      booking?.creator?.name ||
      booking?.created_by_user?.name ||
      booking?.createdBy?.name ||
      "Admin"
    );
  };

  const getEditedByName = (booking) => {
    return (
      booking?.editor?.name ||
      booking?.edited_by_user?.name ||
      booking?.editedBy?.name ||
      "-"
    );
  };

  const getRefundedByName = (booking) => {
    return (
      booking?.refunder?.name ||
      booking?.refunded_by_user?.name ||
      booking?.refundedBy?.name ||
      "-"
    );
  };

  const getCancelledByName = (booking) => {
    return (
      booking?.canceller?.name ||
      booking?.cancelled_by_user?.name ||
      booking?.cancelledBy?.name ||
      "-"
    );
  };

  const getCleaningStartedByName = (booking) => {
    return (
      booking?.cleaningStarter?.name ||
      booking?.cleaning_starter?.name ||
      booking?.cleaning_started_by_user?.name ||
      booking?.cleaningStartedBy?.name ||
      booking?.cleaning_started_by_name ||
      "Akun operasional"
    );
  };

  const getCleaningByName = (booking) => {
    return (
      booking?.cleaningFinisher?.name ||
      booking?.cleaning_finisher?.name ||
      booking?.cleaning_finished_by_user?.name ||
      booking?.cleaningFinishedBy?.name ||
      booking?.cleaning_finished_by_name ||
      booking?.cleaningCompleter?.name ||
      booking?.cleaning_completer?.name ||
      booking?.cleaning_completed_by_user?.name ||
      booking?.cleaningCompletedBy?.name ||
      booking?.cleaning_completed_by_name ||
      booking?.cleanedBy?.name ||
      booking?.cleaned_by_user?.name ||
      booking?.cleaned_by_name ||
      getCleaningStartedByName(booking)
    );
  };

  const getReceiptSourceLabel = (booking) => {
    if (booking?.booking_source === "admin_manual") return "Admin Manual";
    if (booking?.booking_source === "customer_app") return "Aplikasi Tamu";
    if (booking?.booking_source === "customer_login") return "Login Tamu";
    return booking?.booking_source || "Operasional Hotel";
  };

  const buildReceiptQrValue = (booking) => {
    return JSON.stringify({
      booking_code: booking?.booking_code || `BOOKING-${booking?.id}`,
      guest_name: getBookingCustomerName(booking),
      guest_phone: booking?.guest_phone || "-",
      hotel: booking?.hotel?.name || "-",
      room: getBookingRoomName(booking),
      room_unit: getBookingRoomUnit(booking),
      check_in: booking?.check_in || null,
      check_out: booking?.check_out || null,
      payment_status: booking?.payment_status || "unpaid",
      status: booking?.status || "-",
      total_price: booking?.total_price || 0,
    });
  };

  const handleOpenReceipt = (booking) => {
    setSelectedReceiptBooking(booking);
  };

  const closeReceiptModal = () => {
    setSelectedReceiptBooking(null);
  };

  const handlePrintReceipt = () => {
    const receiptEl = receiptPrintRef.current;

    if (!selectedReceiptBooking || !receiptEl) {
      toast.error("Kuitansi belum siap dicetak");
      return;
    }

    const qrCanvas = receiptEl.querySelector("canvas");
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL("image/png") : "";

    const clone = receiptEl.cloneNode(true);
    const cloneCanvas = clone.querySelector("canvas");

    if (cloneCanvas && qrDataUrl) {
      const qrImg = document.createElement("img");
      qrImg.src = qrDataUrl;
      qrImg.alt = "QR Booking";
      qrImg.width = cloneCanvas.width || 180;
      qrImg.height = cloneCanvas.height || 180;
      qrImg.style.width = "180px";
      qrImg.style.height = "180px";
      cloneCanvas.parentNode.replaceChild(qrImg, cloneCanvas);
    }

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      toast.error("Popup print diblokir browser");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Kuitansi ${selectedReceiptBooking.booking_code || selectedReceiptBooking.id}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: #f8fafc;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
            }
            body { padding: 24px; }
            .ticket-shell {
              max-width: 980px;
              margin: 0 auto;
            }
            .print-ticket {
              position: relative;
              overflow: hidden;
              border-radius: 28px;
              border: 1px solid #fecaca;
              background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
              box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
            }
            .print-top {
              background: linear-gradient(135deg, #991b1b 0%, #dc2626 45%, #fb7185 100%);
              color: white;
              padding: 28px 32px;
            }
            .print-content {
              padding: 28px 32px 32px;
              position: relative;
            }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }
            .print-card {
              border-radius: 20px;
              border: 1px solid #e5e7eb;
              background: rgba(255,255,255,0.92);
              padding: 14px 16px;
            }
            .print-card p:first-child {
              margin: 0 0 6px 0;
              font-size: 12px;
              color: #64748b;
            }
            .print-card p:last-child {
              margin: 0;
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            .print-lower {
              display: grid;
              grid-template-columns: 1.3fr 0.7fr;
              gap: 18px;
              margin-top: 18px;
              align-items: stretch;
            }
            .print-note {
              border-radius: 24px;
              border: 1px solid #fde68a;
              background: linear-gradient(180deg, #fffbeb 0%, #fff7d6 100%);
              padding: 18px;
            }
            .print-note h4 {
              margin: 0 0 10px 0;
              color: #92400e;
              font-size: 18px;
            }
            .print-note p {
              margin: 0 0 8px 0;
              color: #78350f;
              font-size: 14px;
              line-height: 1.6;
            }
            .print-qr {
              border-radius: 24px;
              border: 1px dashed #cbd5e1;
              background: #ffffff;
              padding: 18px;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .print-qr img {
              display: block;
              width: 180px;
              height: 180px;
              object-fit: contain;
            }
            .print-footer {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
              margin-top: 20px;
              padding-top: 14px;
              border-top: 1px dashed #cbd5e1;
              color: #64748b;
              font-size: 12px;
            }
            @media print {
              html, body {
                background: #fff;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-shell">${clone.outerHTML}</div>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  const getTodayDateValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeDateOnlyValue = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const getManualOvernightCheckOut = () => {
    if (!manualForm.check_in) return "";

    const checkIn = new Date(manualForm.check_in);
    if (Number.isNaN(checkIn.getTime())) return "";

    const durationDays = Math.max(1, Number(manualForm.duration_days || 1));
    const checkout = new Date(checkIn);
    const noonBoundary = new Date(checkIn);
    noonBoundary.setHours(12, 0, 0, 0);

    if (checkIn < noonBoundary) {
      checkout.setHours(12, 0, 0, 0);
      checkout.setDate(checkout.getDate() + (durationDays - 1));
    } else {
      checkout.setDate(checkout.getDate() + durationDays);
      checkout.setHours(12, 0, 0, 0);
    }

    return `${checkout.getFullYear()}-${String(checkout.getMonth() + 1).padStart(2, "0")}-${String(checkout.getDate()).padStart(2, "0")} ${String(checkout.getHours()).padStart(2, "0")}:${String(checkout.getMinutes()).padStart(2, "0")}:00`;
  };

  const getManualOvernightCheckOutText = () => {
    const raw = getManualOvernightCheckOut();
    if (!raw) return "-";
    return formatDateTime(raw);
  };

  const getManualTransitCheckOut = () => {
    if (!manualForm.check_in || !manualForm.duration_hours) return "";

    const checkIn = new Date(manualForm.check_in);
    if (Number.isNaN(checkIn.getTime())) return "";

    const checkout = new Date(checkIn);
    checkout.setHours(checkout.getHours() + Number(manualForm.duration_hours || 0));

    return `${checkout.getFullYear()}-${String(checkout.getMonth() + 1).padStart(2, "0")}-${String(checkout.getDate()).padStart(2, "0")} ${String(checkout.getHours()).padStart(2, "0")}:${String(checkout.getMinutes()).padStart(2, "0")}:00`;
  };

  const getManualEstimatedCheckOut = () => {
    if (manualForm.booking_type === "overnight") {
      return getManualOvernightCheckOut();
    }

    return getManualTransitCheckOut();
  };

  const getManualEstimatedCheckOutText = () => {
    const raw = getManualEstimatedCheckOut();
    if (!raw) return "-";

    const date = new Date(String(raw).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const manualEstimatedCheckOutText = getManualEstimatedCheckOutText();

  const getPenaltySummary = (booking) => {
    const penalties = Array.isArray(booking?.penalties) ? booking.penalties : [];
    const totalPenalty =
      booking?.total_penalty !== undefined && booking?.total_penalty !== null
        ? Number(booking.total_penalty)
        : penalties.reduce((sum, item) => sum + Number(item?.amount || 0), 0);

    return {
      penalties,
      totalPenalty,
      hasPenalty: penalties.length > 0 || totalPenalty > 0,
    };
  };

  const getPenaltyTypeLabelForReport = (value) => {
    const type = String(value || "").trim().toLowerCase();

    if (!type) return "Denda Operasional";
    if (type === "smoking") return "Merokok di kamar";
    if (type === "damage") return "Kerusakan fasilitas";
    if (type === "lost_item") return "Barang hotel hilang";
    if (type === "extra_cleaning") return "Extra cleaning";
    if (type === "late_checkout") return "Telat check-out";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPenaltyInputByForReport = (penalty, booking) => {
    return (
      penalty?.creator?.name ||
      penalty?.created_by_user?.name ||
      penalty?.createdBy?.name ||
      penalty?.admin?.name ||
      penalty?.user?.name ||
      penalty?.creator_name ||
      penalty?.created_by_name ||
      booking?.creator?.name ||
      booking?.created_by_user?.name ||
      "-"
    );
  };

  const getPenaltyRowsForReport = (booking) => {
    const summary = getPenaltySummary(booking);
    const penalties = Array.isArray(summary.penalties) ? summary.penalties : [];

    if (penalties.length > 0) {
      return penalties
        .map((penalty, index) => {
          const amount = Number(penalty?.amount || penalty?.total || 0);
          const title =
            penalty?.title ||
            penalty?.name ||
            getPenaltyTypeLabelForReport(penalty?.penalty_type || penalty?.type);
          const note =
            penalty?.note ||
            penalty?.reason ||
            penalty?.description ||
            penalty?.keterangan ||
            title ||
            "-";

          return {
            id: `${booking?.id || "booking"}-${penalty?.id || index}`,
            booking,
            penalty,
            amount: Number.isNaN(amount) ? 0 : amount,
            title: title || "Denda Operasional",
            note,
            type: getPenaltyTypeLabelForReport(
              penalty?.penalty_type || penalty?.type || title
            ),
            inputBy: getPenaltyInputByForReport(penalty, booking),
            createdAt:
              penalty?.created_at ||
              penalty?.createdAt ||
              booking?.updated_at ||
              booking?.created_at ||
              null,
          };
        })
        .filter((item) => Number(item.amount || 0) > 0);
    }

    if (Number(summary.totalPenalty || 0) <= 0) return [];

    return [
      {
        id: `${booking?.id || "booking"}-total-penalty`,
        booking,
        penalty: null,
        amount: Number(summary.totalPenalty || 0),
        title: "Denda Operasional",
        note: "Denda booking",
        type: "Denda Operasional",
        inputBy: getCreatedByName(booking),
        createdAt: booking?.updated_at || booking?.created_at || null,
      },
    ];
  };

  const getReportBookingAmount = (booking) => {
    const paidAmount = Number(booking?.paid_amount || 0);
    if (!Number.isNaN(paidAmount) && paidAmount > 0) return paidAmount;

    return Number(booking?.total_price || 0);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getBookingTypeLabel = (bookingType) => {
    if (bookingType === "transit") return "Transit";
    if (bookingType === "overnight") return "Full Day";
    return bookingType || "-";
  };

  const getReportTransactionDate = (booking) => {
    return getOperationalCheckInTime(booking) || booking?.check_in || null;
  };

  const matchesReportShift = (booking) => {
    if (reportShift === "all") return true;

    const transactionDate = getReportTransactionDate(booking);
    if (!transactionDate) return false;

    const hour = new Date(transactionDate).getHours();

    if (reportShift === "pagi") {
      return hour >= 0 && hour < 12;
    }

    if (reportShift === "malam") {
      return hour >= 12 && hour < 24;
    }

    return true;
  };

  const normalizeWhatsAppNumber = (phone) => {
    if (!phone) return "";

    let cleaned = String(phone).replace(/\D/g, "");

    if (cleaned.startsWith("620")) {
      cleaned = "62" + cleaned.slice(3);
    } else if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  };

const buildWhatsAppMessage = (booking) => {
  const customerName = booking.user?.name || booking.guest_name || "Kak";
  const bookingCode = booking.booking_code || `#${booking.id}`;
  const hotelName = booking.hotel?.name || "ReadyRoom";
  const roomName = booking.room?.type || booking.room?.name || "kamar";
  const checkInText = booking.check_in
    ? formatDateTime(booking.check_in)
    : "-";
  const adminContact = booking.hotel?.wa_admin || "-";

  return `Halo Kak ${customerName}, kami dari ${hotelName}. Booking Anda dengan kode ${bookingCode} untuk ${roomName} pada ${checkInText} mohon segera dikonfirmasi. Jika dalam 30 menit setelah waktu check-in belum ada kejelasan, booking dapat dibatalkan oleh pihak hotel. Jika ada kendala atau keterlambatan, silakan hubungi admin cabang di nomor ${adminContact}. Terima kasih.`;
};

  const handleNotifyWhatsApp = (booking) => {
    const rawPhone = booking.guest_phone || "";
    const phone = normalizeWhatsAppNumber(rawPhone);

    if (!phone) {
      toast.error("Nomor WhatsApp tamu tidak tersedia");
      return;
    }

    const message = buildWhatsAppMessage(booking);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "checked_in":
        return "bg-blue-100 text-blue-700";
      case "checked_out":
        return "bg-gray-200 text-gray-700";
      case "cleaning":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "Lunas";
      case "refunded":
        return "Refund";
      default:
        return "Belum Lunas";
    }
  };

  const getPaymentMethodLabel = (paymentMethod) => {
    switch (paymentMethod) {
      case "cash":
        return "Tunai";
      case "transfer":
        return "Transfer";
      case "qris":
        return "QRIS";
      default:
        return "-";
    }
  };

  const getReportPaymentMethodLabel = (paymentMethod) => {
    switch (paymentMethod) {
      case "cash":
        return "Tunai";
      case "digital":
        return "Transfer / QRIS";
      default:
        return "Semua Metode";
    }
  };

  const matchesReportPaymentMethod = (booking) => {
    if (reportPaymentMethod === "all") return true;

    const method = String(booking?.payment_method || "").toLowerCase();

    if (reportPaymentMethod === "cash") {
      return method === "cash";
    }

    if (reportPaymentMethod === "digital") {
      return ["transfer", "qris"].includes(method);
    }

    return true;
  };

  const getPaymentMethodClass = (paymentMethod) => {
    switch (paymentMethod) {
      case "cash":
        return "bg-amber-100 text-amber-700";
      case "transfer":
        return "bg-blue-100 text-blue-700";
      case "qris":
        return "bg-fuchsia-100 text-fuchsia-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "checked_in":
        return "Check In";
      case "checked_out":
        return "Check Out";
      case "cleaning":
        return "Proses Cleaning";
      case "completed":
        return "Selesai";
      case "confirmed":
        return "Dikonfirmasi";
      case "pending":
        return "Menunggu";
      case "cancelled":
        return "Dibatalkan";
      case "rejected":
        return "Ditolak";
      default:
        return status || "-";
    }
  };

  const canAddPenaltyToBooking = (booking) => {
    return ["checked_out", "cleaning", "completed"].includes(booking?.status);
  };

  const getPenaltyDefaultTitle = (penaltyType) => {
    switch (penaltyType) {
      case "smoking":
        return "Merokok di kamar";
      case "damage":
        return "Kerusakan fasilitas";
      case "lost_item":
        return "Barang hotel hilang";
      case "extra_cleaning":
        return "Extra cleaning";
      default:
        return "";
    }
  };

  const handleOpenPenaltyModal = (booking) => {
    setSelectedPenaltyBooking(booking);
    setPenaltyForm({
      penalty_type: "smoking",
      title: "Merokok di kamar",
      amount: "",
      note: "",
    });
  };

  const closePenaltyModal = () => {
    setSelectedPenaltyBooking(null);
    setPenaltyForm({
      penalty_type: "smoking",
      title: "Merokok di kamar",
      amount: "",
      note: "",
    });
  };

  const handlePenaltyChange = (e) => {
    const { name, value } = e.target;

    setPenaltyForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "penalty_type") {
        next.title = getPenaltyDefaultTitle(value);
      }

      return next;
    });
  };

  const handleSavePenalty = async () => {
    if (!selectedPenaltyBooking) return;

    if (!penaltyForm.title.trim()) {
      toast.error("Judul denda wajib diisi");
      return;
    }

    if (penaltyForm.amount === "" || Number(penaltyForm.amount) < 0) {
      toast.error("Nominal denda wajib diisi dengan benar");
      return;
    }

    try {
      setSavingPenalty(true);

      await api.post(`/admin/bookings/${selectedPenaltyBooking.id}/penalties`, {
        penalty_type: penaltyForm.penalty_type || null,
        title: penaltyForm.title.trim(),
        amount: Number(penaltyForm.amount),
        note: penaltyForm.note.trim() || null,
        created_by: adminUser?.id || null,
      });

      toast.success("Denda berhasil ditambahkan");
      closePenaltyModal();
      fetchBookings();
    } catch (error) {
      console.error("SAVE PENALTY ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menambahkan denda");
    } finally {
      setSavingPenalty(false);
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
      search: "",
      status: "",
      bookingType: "",
      hotelId: "",
      month: "",
    });
    setViewMode("today_active");
  };

  const getSeenStorageKey = () => {
    return `readyroom_booking_seen_map_${adminUser?.id || "guest"}`;
  };

  const persistBranchSeenMap = (nextMap) => {
    setBranchSeenMap(nextMap);
    localStorage.setItem(getSeenStorageKey(), JSON.stringify(nextMap));
  };

  const markHotelAsSeen = (hotelId) => {
    if (!hotelId) return;

    const nextMap = {
      ...branchSeenMap,
      [String(hotelId)]: new Date().toISOString(),
    };

    persistBranchSeenMap(nextMap);
  };

  const getBookingNotificationTime = (booking) => {
    return booking?.created_at || booking?.updated_at || booking?.check_in || null;
  };

  const isBookingUnreadForHotel = (booking, hotelId) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || "").toLowerCase();

    if (String(booking?.hotel?.id) !== String(hotelId)) return false;
    if (["cancelled", "rejected", "completed"].includes(status)) return false;
    if (paymentStatus === "refunded") return false;

    const notificationTime = getBookingNotificationTime(booking);
    if (!notificationTime) return false;

    const seenAt = branchSeenMap[String(hotelId)];
    if (!seenAt) return true;

    return new Date(notificationTime).getTime() > new Date(seenAt).getTime();
  };

  const uniqueHotels = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      if (booking.hotel?.id) {
        map.set(booking.hotel.id, booking.hotel.name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [bookings]);

  const assignedHotelIds = useMemo(() => {
    if (canAccessAllHotels) return [];

    const sourceHotels =
      Array.isArray(userAccessHotels) && userAccessHotels.length > 0
        ? userAccessHotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

    return sourceHotels.map((hotel) => String(hotel?.id)).filter(Boolean);
  }, [adminUser, canAccessAllHotels, userAccessHotels]);

  const folderHotels = useMemo(() => {
    const sourceHotels =
      Array.isArray(hotels) && hotels.length > 0 ? hotels : uniqueHotels;

    if (canAccessAllHotels) {
      return sourceHotels;
    }

    if (assignedHotelIds.length > 0) {
      return sourceHotels.filter((hotel) =>
        assignedHotelIds.includes(String(hotel.id))
      );
    }

    return [];
  }, [hotels, uniqueHotels, assignedHotelIds, canAccessAllHotels]);

  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const isBookingRelevantToday = (booking) => {
  const activeStatuses = [
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cleaning",
  ];

  if (!activeStatuses.includes(booking?.status)) {
    return false;
  }

  if (booking?.payment_status === "refunded") {
    return false;
  }

  return true;
};

  const isBookingReadyForCheckInPayment = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || "").toLowerCase();

    return (
      status === "confirmed" &&
      paymentStatus !== "paid" &&
      paymentStatus !== "refunded"
    );
  };

  const filteredBookings = useMemo(() => {
    const searchActive = filters.search.trim().length > 0;

    return bookings.filter((booking) => {
      const searchText = filters.search.toLowerCase();

      const customerName = booking.user?.name || booking.guest_name || "";
      const customerPhone = booking.guest_phone || "";

      const matchesSearch =
        !filters.search ||
        booking.booking_code?.toLowerCase().includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        customerPhone.toLowerCase().includes(searchText) ||
        booking.hotel?.name?.toLowerCase().includes(searchText) ||
        booking.room?.type?.toLowerCase().includes(searchText) ||
        booking.room?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        !filters.status || booking.status === filters.status;

      const matchesBookingType =
        !filters.bookingType || booking.booking_type === filters.bookingType;

      const matchesHotel =
        !filters.hotelId ||
        String(booking.hotel?.id) === String(filters.hotelId);

      const matchesAccessHotel = canAccessAllHotels
        ? true
        : assignedHotelIds.includes(String(booking.hotel?.id));

      let matchesMonth = true;
      if (filters.month && booking.check_in) {
        const bookingDate = new Date(booking.check_in);
        const year = bookingDate.getFullYear();
        const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
        const bookingMonth = `${year}-${month}`;
        matchesMonth = bookingMonth === filters.month;
      }

      const matchesViewMode =
        viewMode === "ready_checkin_payment"
          ? isBookingReadyForCheckInPayment(booking)
          : searchActive || viewMode === "all"
          ? true
          : isBookingRelevantToday(booking);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBookingType &&
        matchesHotel &&
        matchesAccessHotel &&
        matchesMonth &&
        matchesViewMode
      );
    });
  }, [bookings, filters, viewMode, assignedHotelIds, canAccessAllHotels]);


const getBookingDiscountPercent = (booking) => {
  const value = Number(
    booking?.discount_percent ??
      booking?.manual_discount_percent ??
      booking?.discountRate ??
      booking?.discount_rate ??
      0
  );

  if (Number.isNaN(value) || value <= 0) return 0;
  if (value > 100) return 100;
  return value;
};

const getBookingDiscountAmount = (booking) => {
  const directAmount = Number(
    booking?.discount_amount ??
      booking?.manual_discount_amount ??
      booking?.discount_value ??
      booking?.discount_nominal ??
      booking?.voucher_discount_amount ??
      0
  );

  if (!Number.isNaN(directAmount) && directAmount > 0) {
    return Math.round(directAmount);
  }

  const percent = getBookingDiscountPercent(booking);
  if (!percent) return 0;

  const paidOrFinalAmount = getReportBookingAmount(booking);
  const originalAmount = Number(
    booking?.original_price ??
      booking?.subtotal_price ??
      booking?.price_before_discount ??
      booking?.room_price_before_discount ??
      0
  );

  const baseAmount =
    !Number.isNaN(originalAmount) && originalAmount > 0
      ? originalAmount
      : percent < 100 && paidOrFinalAmount > 0
      ? paidOrFinalAmount / (1 - percent / 100)
      : paidOrFinalAmount;

  if (!baseAmount || Number.isNaN(baseAmount)) return 0;

  return Math.round((baseAmount * percent) / 100);
};

const reportBookings = useMemo(() => {
  return bookings.filter((booking) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || "").toLowerCase();
    const validOperationalStatuses = [
      "checked_in",
      "checked_out",
      "cleaning",
      "completed",
    ];

    if (!validOperationalStatuses.includes(status)) {
      return false;
    }

    if (paymentStatus !== "paid") {
      return false;
    }

    const matchesAccessHotel = canAccessAllHotels
      ? true
      : assignedHotelIds.includes(String(booking?.hotel?.id));

    const matchesHotel =
      !filters.hotelId || String(booking?.hotel?.id) === String(filters.hotelId);

    const reportCheckInDate = getReportTransactionDate(booking);
    const matchesReportDate = reportDate
      ? normalizeDateOnlyValue(reportCheckInDate) === reportDate
      : true;

    return (
      matchesAccessHotel &&
      matchesHotel &&
      matchesReportDate &&
      matchesReportShift(booking) &&
      matchesReportPaymentMethod(booking)
    );
  });
}, [
  bookings,
  filters.hotelId,
  assignedHotelIds,
  canAccessAllHotels,
  reportDate,
  reportShift,
  reportPaymentMethod,
]);

  const reportPenaltyRows = useMemo(() => {
    return reportBookings.flatMap((booking) => getPenaltyRowsForReport(booking));
  }, [reportBookings]);

  const reportTotalValue = useMemo(() => {
    return reportBookings.reduce(
      (sum, booking) => sum + getReportBookingAmount(booking),
      0
    );
  }, [reportBookings]);

  const reportTotalPenalty = useMemo(() => {
    return reportPenaltyRows.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0
    );
  }, [reportPenaltyRows]);

  const reportTotalDiscount = useMemo(() => {
    return reportBookings.reduce(
      (sum, booking) => sum + getBookingDiscountAmount(booking),
      0
    );
  }, [reportBookings]);

  const reportGrandTotalValue = useMemo(() => {
    return reportTotalValue + reportTotalPenalty;
  }, [reportTotalValue, reportTotalPenalty]);

  const getHousekeepingStartTime = (booking) => {
    return (
      booking?.cleaning_started_at ||
      booking?.cleaning_start_at ||
      booking?.started_cleaning_at ||
      booking?.cleaningStartedAt ||
      booking?.cleaning_started ||
      null
    );
  };

  const getHousekeepingFinishTime = (booking) => {
    return (
      booking?.cleaning_finished_at ||
      booking?.cleaning_completed_at ||
      booking?.cleaning_finish_at ||
      booking?.finished_cleaning_at ||
      booking?.cleaned_at ||
      booking?.completed_at ||
      booking?.cleaningFinishedAt ||
      null
    );
  };

  const getHousekeepingEventTime = (booking) => {
    const status = String(booking?.status || "").toLowerCase();

    if (status === "cleaning") {
      return (
        getHousekeepingStartTime(booking) ||
        booking?.updated_at ||
        getOperationalCheckoutTime(booking) ||
        booking?.check_out ||
        booking?.created_at ||
        null
      );
    }

    if (status === "completed") {
      return (
        getHousekeepingFinishTime(booking) ||
        booking?.updated_at ||
        getHousekeepingStartTime(booking) ||
        getOperationalCheckoutTime(booking) ||
        booking?.check_out ||
        booking?.created_at ||
        null
      );
    }

    return (
      booking?.actual_check_out ||
      booking?.checked_out_at ||
      booking?.check_out_actual ||
      booking?.checkout_at ||
      getOperationalCheckoutTime(booking) ||
      booking?.check_out ||
      booking?.updated_at ||
      booking?.created_at ||
      null
    );
  };

  const housekeepingReportBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking?.status || "").toLowerCase();

      if (!["checked_out", "cleaning", "completed"].includes(status)) {
        return false;
      }

      if (
        filters.hotelId &&
        String(booking.hotel_id || booking.hotel?.id) !== String(filters.hotelId)
      ) {
        return false;
      }

      if (
        !canAccessAllHotels &&
        assignedHotelIds.length > 0 &&
        !assignedHotelIds.includes(String(booking.hotel_id || booking.hotel?.id))
      ) {
        return false;
      }

      if (!housekeepingReportDate) return true;

      return normalizeDateOnlyValue(getHousekeepingEventTime(booking)) === housekeepingReportDate;
    });
  }, [
    bookings,
    filters.hotelId,
    assignedHotelIds,
    canAccessAllHotels,
    housekeepingReportDate,
  ]);

  const housekeepingSummary = useMemo(() => {
    return {
      needsCleaning: housekeepingReportBookings.filter(
        (booking) => String(booking?.status || "").toLowerCase() === "checked_out"
      ).length,
      inCleaning: housekeepingReportBookings.filter(
        (booking) => String(booking?.status || "").toLowerCase() === "cleaning"
      ).length,
      completed: housekeepingReportBookings.filter(
        (booking) => String(booking?.status || "").toLowerCase() === "completed"
      ).length,
      total: housekeepingReportBookings.length,
    };
  }, [housekeepingReportBookings]);

  const handlePrintHousekeepingReport = () => {
    const selectedHotel =
      folderHotels.find((hotel) => String(hotel.id) === String(filters.hotelId)) || null;

    const branchName = selectedHotel?.name || "Semua Cabang";
    const reportDateLabel = housekeepingReportDate
      ? formatDate(housekeepingReportDate)
      : "Semua Tanggal";
    const printedAt = new Date().toLocaleString("id-ID");

    const escapePrintValue = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const rowsHtml = housekeepingReportBookings
      .map((booking, index) => {
        const status = String(booking?.status || "").toLowerCase();
        const statusLabel =
          status === "checked_out"
            ? "Perlu Dibersihkan"
            : status === "cleaning"
            ? "Proses Cleaning"
            : status === "completed"
            ? "Selesai Cleaning"
            : getStatusLabel(booking.status);

        return `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${escapePrintValue(booking.booking_code || "Booking #" + booking.id)}</strong></td>
            <td>
              <strong>${escapePrintValue(getBookingCustomerName(booking))}</strong><br/>
              <span>${escapePrintValue(booking.guest_phone || "-")}</span>
            </td>
            <td>${escapePrintValue(booking.hotel?.name || "-")}</td>
            <td>${escapePrintValue(booking.room?.type || booking.room?.name || "-")}</td>
            <td>${escapePrintValue(getBookingRoomUnit(booking))}</td>
            <td>${escapePrintValue(statusLabel)}</td>
            <td>${escapePrintValue(formatDateTime(getOperationalCheckoutTime(booking)))}</td>
            <td>${escapePrintValue(formatDateTime(getHousekeepingStartTime(booking)))}</td>
            <td>${escapePrintValue(formatDateTime(getHousekeepingFinishTime(booking)))}</td>
            <td>${escapePrintValue(
              ["cleaning", "completed"].includes(status)
                ? getCleaningByName(booking)
                : "Menunggu tindakan"
            )}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=1280,height=900");

    if (!printWindow) {
      toast.error("Popup print diblokir browser");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Housekeeping ReadyRoom</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 28px;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background:
                radial-gradient(circle at top right, rgba(239,68,68,0.10), transparent 26%),
                radial-gradient(circle at bottom left, rgba(16,185,129,0.10), transparent 26%),
                linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
            }
            .sheet {
              max-width: 1220px;
              margin: 0 auto;
              overflow: hidden;
              border: 1px solid #e5e7eb;
              border-radius: 28px;
              background: white;
              box-shadow: 0 25px 60px rgba(15, 23, 42, 0.12);
            }
            .top {
              position: relative;
              overflow: hidden;
              padding: 28px 32px;
              color: white;
              background: linear-gradient(135deg, #020617 0%, #172554 50%, #991b1b 100%);
            }
            .top::after {
              content: "HOUSEKEEPING";
              position: absolute;
              right: 24px;
              top: 12px;
              font-size: 38px;
              font-weight: 900;
              letter-spacing: 0.16em;
              color: rgba(255,255,255,0.08);
            }
            .kicker {
              margin: 0 0 8px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.7);
            }
            h1 {
              margin: 0;
              font-size: 30px;
              line-height: 1.15;
            }
            .subtitle {
              margin: 8px 0 0;
              max-width: 680px;
              color: rgba(255,255,255,0.86);
              font-size: 13px;
              line-height: 1.6;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 12px;
              padding: 20px 24px 0;
            }
            .meta-card {
              border: 1px solid #e5e7eb;
              border-radius: 18px;
              padding: 12px 14px;
              background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
            }
            .meta-label {
              margin: 0 0 6px;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.12em;
              color: #64748b;
              text-transform: uppercase;
            }
            .meta-value {
              margin: 0;
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
            }
            .content {
              padding: 22px 24px 28px;
            }
            .note {
              margin-bottom: 16px;
              padding: 13px 16px;
              border-radius: 16px;
              border: 1px solid #dbeafe;
              background: #eff6ff;
              color: #1e40af;
              font-size: 12px;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 9px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f8fafc;
              color: #475569;
              font-weight: 900;
              white-space: nowrap;
            }
            tbody tr:nth-child(even) {
              background: #fcfcfd;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              padding: 0 24px 24px;
              color: #64748b;
              font-size: 11px;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .sheet { border: none; border-radius: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="top">
              <p class="kicker">ReadyRoom Housekeeping Report</p>
              <h1>Laporan Housekeeping ReadyRoom</h1>
              <p class="subtitle">
                Rekap kamar yang perlu dibersihkan, sedang proses cleaning, dan selesai cleaning berdasarkan tanggal operasional.
              </p>
            </div>

            <div class="meta-grid">
              <div class="meta-card">
                <p class="meta-label">Cabang</p>
                <p class="meta-value">${escapePrintValue(branchName)}</p>
              </div>
              <div class="meta-card">
                <p class="meta-label">Tanggal</p>
                <p class="meta-value">${escapePrintValue(reportDateLabel)}</p>
              </div>
              <div class="meta-card">
                <p class="meta-label">Total Data</p>
                <p class="meta-value">${housekeepingSummary.total}</p>
              </div>
              <div class="meta-card">
                <p class="meta-label">Perlu Cleaning</p>
                <p class="meta-value">${housekeepingSummary.needsCleaning}</p>
              </div>
              <div class="meta-card">
                <p class="meta-label">Proses</p>
                <p class="meta-value">${housekeepingSummary.inCleaning}</p>
              </div>
              <div class="meta-card">
                <p class="meta-label">Selesai</p>
                <p class="meta-value">${housekeepingSummary.completed}</p>
              </div>
            </div>

            <div class="content">
              <div class="note">
                Dicetak pada ${escapePrintValue(printedAt)} • Dokumen internal operasional ReadyRoom.
              </div>

              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode</th>
                    <th>Tamu</th>
                    <th>Hotel</th>
                    <th>Tipe Kamar</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Check-out</th>
                    <th>Mulai Cleaning</th>
                    <th>Selesai Cleaning</th>
                    <th>Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    rowsHtml ||
                    '<tr><td colspan="11">Belum ada data housekeeping pada tanggal ini.</td></tr>' 
                  }
                </tbody>
              </table>
            </div>

            <div class="footer">
              <div>Laporan Housekeeping ReadyRoom</div>
              <div>Dokumen internal cabang</div>
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const branchUnreadCounts = useMemo(() => {
    const counts = {};

    folderHotels.forEach((hotel) => {
      counts[String(hotel.id)] = bookings.filter((booking) =>
        isBookingUnreadForHotel(booking, hotel.id)
      ).length;
    });

    return counts;
  }, [bookings, folderHotels, branchSeenMap]);

  const totalUnreadBranchCount = useMemo(() => {
    return Object.values(branchUnreadCounts).reduce(
      (sum, count) => sum + Number(count || 0),
      0
    );
  }, [branchUnreadCounts]);

  const todayVisibleCount = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesAccessHotel = canAccessAllHotels
        ? true
        : assignedHotelIds.includes(String(booking.hotel?.id));

      return matchesAccessHotel && isBookingRelevantToday(booking);
    }).length;
  }, [bookings, assignedHotelIds, canAccessAllHotels]);

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100";
  const manualInputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

  const needsFolderSelection = !canAccessAllHotels;
const hasSelectedFolder = canAccessAllHotels ? true : !!filters.hotelId;

const selectedFolderHotel = folderHotels.find(
  (hotel) => String(hotel.id) === String(filters.hotelId)
);

const selectedFolderLabel = filters.hotelId
  ? selectedFolderHotel?.name || "Cabang dipilih"
  : canAccessAllHotels
  ? "Semua Cabang"
  : "Belum pilih cabang";


const manualCalendarDays = useMemo(() => {
  const year = manualCalendarMonth.getFullYear();
  const month = manualCalendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalSlots = Math.ceil((startOffset + totalDays) / 7) * 7;

  return Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1 || dayNumber > totalDays) {
      return null;
    }

    return new Date(year, month, dayNumber);
  });
}, [manualCalendarMonth]);

const manualCalendarMonthLabel = manualCalendarMonth.toLocaleDateString("id-ID", {
  month: "long",
  year: "numeric",
});

const manualCheckInDisplay = getManualCheckInDisplay(manualForm.check_in);

  const handleToggleBookingNativeFullscreen = async () => {
    try {
      if (getNativeFullscreenElement()) {
        await exitNativeBrowserFullscreen();
        setIsBookingListFullscreen(false);
        sessionStorage.setItem(bookingFullscreenStorageKey, "0");
        return;
      }

      await requestNativeBrowserFullscreen();
      setIsBookingListFullscreen(true);
      sessionStorage.setItem(bookingFullscreenStorageKey, "1");
    } catch (error) {
      console.error("BOOKING LIST NATIVE FULLSCREEN ERROR:", error);
      toast.error("Browser gagal masuk fullscreen. Coba klik tombol fullscreen sekali lagi.");
      setIsBookingListFullscreen(false);
      try {
        sessionStorage.setItem(bookingFullscreenStorageKey, "0");
      } catch (storageError) {
        console.error("CLEAR BOOKING FULLSCREEN STATE ERROR:", storageError);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {!isBookingListFullscreen && (
        <div className="h-screen shrink-0 overflow-y-auto overflow-x-hidden bg-slate-950">
          <Sidebar />
        </div>
      )}

      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {!isBookingListFullscreen && <Topbar />}

        <div
          className={`min-w-0 overflow-x-hidden transition-all ${
            isBookingListFullscreen
              ? "min-h-screen bg-gray-100 p-3 pb-10 md:p-4 md:pb-12"
              : "p-4 md:p-6"
          }`}
        >
          <div className="mb-3 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 p-2 shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
            <div className="grid grid-cols-1 gap-2 rounded-[18px] bg-white/5 p-1 sm:grid-cols-3">
              {[
                {
                  label: "Booking List",
                  helper: "Buka daftar booking operasional",
                  path: "/admin/bookings",
                  icon: ClipboardList,
                },
                {
                  label: "Booking Calendar",
                  helper: "Lihat jadwal booking per kamar",
                  path: "/admin/bookings/calendar",
                  icon: CalendarDays,
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
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          bookingFullscreenStorageKey,
                          isBookingListFullscreen ? "1" : "0"
                        );
                      } catch (error) {
                        console.error("SAVE BOOKING FULLSCREEN NAV ERROR:", error);
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-center gap-2 rounded-[15px] px-3 py-3 text-left transition md:justify-start md:px-4 ${
                        isActive
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive
                              ? "bg-red-50 text-red-600"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          <Icon size={17} />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">
                            {tab.label}
                          </span>
                          <span
                            className={`hidden truncate text-[11px] font-semibold md:block ${
                              isActive ? "text-slate-400" : "text-white/45"
                            }`}
                          >
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

          <div className="relative mb-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.hotelId}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange("hotelId", value);

                  if (value) {
                    markHotelAsSeen(value);
                  }
                }}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 sm:w-[220px] lg:w-[230px]"
              >
                {canAccessAllHotels && <option value="">Semua Cabang</option>}
                {!canAccessAllHotels && (
                  <option value="">Pilih Cabang / Hotel</option>
                )}

                {folderHotels.map((hotel) => {
                  const unreadCount = branchUnreadCounts[String(hotel.id)] || 0;

                  return (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                      {unreadCount > 0 ? ` (${unreadCount} baru)` : ""}
                    </option>
                  );
                })}
              </select>

              <div className="relative min-w-0 sm:w-[255px] lg:w-[285px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  disabled={!hasSelectedFolder}
                  placeholder="Cari kode, tamu, hotel, kamar"
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-xs font-bold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <select
                value={filters.status === "pending" ? "approval" : viewMode}
                onChange={(e) => {
                  const value = e.target.value;
                  setViewMode(value);
                  if (value !== "approval" && filters.status === "pending") {
                    handleFilterChange("status", "");
                  }
                  if (value === "approval") {
                    setViewMode("all");
                    handleFilterChange("status", "pending");
                  }
                }}
                disabled={!hasSelectedFolder}
                className="h-10 w-[155px] rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="today_active">Aktif Hari Ini</option>
                <option value="ready_checkin_payment">Check-in & Bayar</option>
                <option value="all">Riwayat Booking</option>
                <option value="approval">Approval</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                disabled={!hasSelectedFolder}
                className="h-10 w-[155px] rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Semua Status</option>
                <option value="checked_in">Check In</option>
                <option value="checked_out">Check Out</option>
                <option value="cleaning">Proses Cleaning</option>
                <option value="completed">Selesai</option>
              </select>

              <select
                value={filters.bookingType}
                onChange={(e) => handleFilterChange("bookingType", e.target.value)}
                disabled={!hasSelectedFolder}
                className="h-10 w-[140px] rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Semua Tipe</option>
                <option value="transit">Transit</option>
                <option value="overnight">Full Day</option>
              </select>

              <button
                type="button"
                onClick={handleToggleBookingNativeFullscreen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100"
                title={
                  isBookingListFullscreen
                    ? "Kembali ke tampilan biasa"
                    : "Perbesar halaman Booking List"
                }
                aria-label={
                  isBookingListFullscreen
                    ? "Kembali ke tampilan biasa"
                    : "Perbesar halaman Booking List"
                }
              >
                {isBookingListFullscreen ? (
                  <Minimize2 size={17} />
                ) : (
                  <Maximize2 size={17} />
                )}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasSelectedFolder}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  disabled={!hasSelectedFolder}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 text-xs font-black text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ReceiptText size={15} />
                  Laporan
                </button>

                <button
                  type="button"
                  onClick={() => setShowHousekeepingReportModal(true)}
                  disabled={!hasSelectedFolder}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 text-xs font-black text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BedDouble size={15} />
                  Laporan Housekeeping
                </button>

                <button
                  type="button"
                  onClick={openManualModal}
                  disabled={!hasSelectedFolder}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={15} />
                  Booking Manual
                </button>
              </div>
            </div>

            {loadingUserAccessHotels && (
              <p className="mt-2 text-xs font-semibold text-gray-500">
                Sedang memuat akses cabang user...
              </p>
            )}
          </div>

          {!hasSelectedFolder && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Pilih cabang dulu</h3>
                  <p className="mt-0.5 text-sm text-amber-800">
                    Pilih cabang/hotel untuk membuka isi Booking List sesuai akses user ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasSelectedFolder && (
            <>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-5">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data booking...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ClipboardList size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Tidak ada booking ditemukan
                </h3>
                <p className="text-gray-500 mt-2">
                  Coba ubah filter atau tunggu booking baru masuk.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredBookings.map((booking) => {
                  const customerName =
                    booking.user?.name || booking.guest_name || "Tamu manual";
                  const customerPhone = booking.guest_phone || null;
                  const customerEmail = booking.guest_email || null;
                  const sourceLabel =
                    booking.booking_source === "admin_manual"
                      ? "Admin Manual"
                      : booking.booking_source === "customer_app"
                      ? "Aplikasi Tamu"
                      : booking.booking_source === "customer_login"
                      ? "Login Tamu"
                      : booking.booking_source || null;

                  const discountPercent = Number(booking.discount_percent || 0);
                  const originalPrice =
                    discountPercent > 0
                      ? Math.round(
                          Number(booking.total_price || 0) /
                            (1 - discountPercent / 100)
                        )
                      : Number(booking.total_price || 0);

                  const {
                    penalties: bookingPenalties,
                    totalPenalty,
                    hasPenalty,
                  } = getPenaltySummary(booking);

                  const showCancelButton =
                    canCancelBooking &&
                    ["confirmed", "checked_in"].includes(booking.status);

                  const showAddPenaltyButton = canAddPenaltyToBooking(booking);

                  const showNotifyButton =
                    !!booking.guest_phone &&
                    ["pending", "confirmed", "checked_in"].includes(booking.status);

                  const cleaningByName = getCleaningByName(booking);
                  const hasCleaningHistory =
                    ["cleaning", "completed"].includes(String(booking?.status || "").toLowerCase()) &&
                    !!cleaningByName;

                  const hasBookingHistory = Boolean(
                    booking?.creator?.name ||
                      booking?.editor?.name ||
                      booking?.refunder?.name ||
                      booking?.canceller?.name ||
                      hasCleaningHistory
                  );

                  const operationalMeta = getOperationalTimeMeta(booking);
                  const operationalCheckIn = getOperationalCheckInTime(booking);
                  const operationalCheckOut = getOperationalCheckoutTime(booking);
                  const isOverdueCheckout = isBookingCheckoutOverdue(booking);
                  const visiblePaymentNote = cleanPaymentNote(booking.payment_note);

                  return (
                    <div
                      key={booking.id}
                      className={`group relative overflow-hidden rounded-[30px] border bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${
                        isOverdueCheckout
                          ? "border-red-400 ring-2 ring-red-200 shadow-red-100"
                          : "border-slate-200 hover:border-red-100"
                      }`}
                    >
                      <div
                        className={`pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${
                          isOverdueCheckout
                            ? "from-red-700 via-red-600 to-orange-500"
                            : "from-red-600 via-red-500 to-rose-400"
                        }`}
                      />
                      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-red-50 blur-3xl transition group-hover:bg-red-100" />
                      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-amber-50 blur-3xl" />

                      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_190px] xl:grid-cols-[minmax(0,1fr)_200px]">
                        <div className="min-w-0 p-4 md:p-5 lg:p-6">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="w-full min-w-0">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <h3 className="mr-1 text-lg font-black tracking-tight text-slate-950 md:text-xl">
                                  {booking.booking_code || `Booking #${booking.id}`}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${getStatusClass(
                                    booking.status
                                  )}`}
                                >
                                  {getStatusLabel(booking.status)}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${getPaymentStatusClass(
                                    booking.payment_status
                                  )}`}
                                >
                                  {getPaymentStatusLabel(booking.payment_status)}
                                </span>

                                {booking.payment_method && (
                                  <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${getPaymentMethodClass(
                                      booking.payment_method
                                    )}`}
                                  >
                                    {getPaymentMethodLabel(booking.payment_method)}
                                  </span>
                                )}

                                {sourceLabel && (
                                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm">
                                    {sourceLabel}
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-black text-red-700 shadow-sm">
                                  <Clock3 size={12} />
                                  {getBookingTypeLabel(booking.booking_type)}
                                  {booking.duration_hours
                                    ? ` • ${booking.duration_hours} jam`
                                    : !booking.duration_hours && Number(booking.duration_days || 0) > 0
                                    ? ` • ${booking.duration_days} hari`
                                    : ""}
                                </span>

                                {getBookingRoomUnit(booking) !== "Belum di-assign" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
                                    <DoorOpen size={12} />
                                    Unit {getBookingRoomUnit(booking)}
                                  </span>
                                )}

                                {booking.paid_amount ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700 shadow-sm">
                                    <Wallet size={12} />
                                    Dibayar: {formatCurrency(booking.paid_amount)}
                                  </span>
                                ) : null}

                                {operationalMeta.actualCheckIn && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
                                    <Clock3 size={12} />
                                    Aktual: {formatDateTime(operationalCheckIn)}
                                  </span>
                                )}

                                {operationalMeta.expectedCheckOut && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black shadow-sm ${
                                      isOverdueCheckout
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-sky-100 bg-sky-50 text-sky-700"
                                    }`}
                                  >
                                    <Clock3 size={12} />
                                    Target: {formatDateTime(operationalCheckOut)}
                                  </span>
                                )}

                                {isOverdueCheckout && (
                                  <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-red-200 bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow-sm shadow-red-100">
                                    <Clock3 size={12} />
                                    Waktunya Check-out
                                  </span>
                                )}
                              </div>

                              {isOverdueCheckout && (
                                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                                        Peringatan Operasional
                                      </p>
                                      <p className="mt-1 font-black">
                                        Booking ini sudah melewati waktu check-out. Mohon resepsionis segera cek kamar/tamu.
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-red-700 shadow-sm ring-1 ring-red-100">
                                      Target: {formatDateTime(operationalCheckOut)}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="grid w-full grid-cols-1 gap-2.5 text-sm md:grid-cols-2 xl:grid-cols-[minmax(135px,1fr)_minmax(155px,1.08fr)_minmax(120px,0.85fr)_minmax(345px,1.9fr)_minmax(120px,0.78fr)] 2xl:grid-cols-[minmax(150px,1.05fr)_minmax(180px,1.16fr)_minmax(135px,0.9fr)_minmax(380px,2fr)_minmax(135px,0.82fr)]">
                                <InfoMiniCard
                                  icon={<User size={16} className="text-red-500" />}
                                  label="Nama Tamu"
                                  value={getBookingCustomerName(booking)}
                                />

                                <InfoMiniCard
                                  icon={<Hotel size={16} className="text-red-500" />}
                                  label="Hotel"
                                  value={booking.hotel?.name || "-"}
                                />

                                <InfoMiniCard
                                  icon={<BedDouble size={16} className="text-red-500" />}
                                  label="Tipe Kamar"
                                  value={booking.room?.type || booking.room?.name || "-"}
                                />

                                <StayScheduleMiniCard
                                  icon={<CalendarDays size={16} className="text-red-500" />}
                                  checkIn={formatDateTime(booking.check_in)}
                                  checkOut={formatDateTime(booking.check_out)}
                                  actualCheckIn={operationalMeta.actualCheckIn ? formatDateTime(operationalCheckIn) : ""}
                                  targetCheckOut={operationalMeta.expectedCheckOut ? formatDateTime(operationalCheckOut) : ""}
                                  overdue={isOverdueCheckout}
                                />

                                <InfoMiniCard
                                  icon={<Wallet size={16} className="text-red-500" />}
                                  label="Total Harga"
                                  value={formatCurrency(booking.total_price)}
                                  strong
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            className={`mt-4 grid gap-3 ${
                              hasBookingHistory
                                ? "xl:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.78fr)]"
                                : "grid-cols-1"
                            }`}
                          >
                            <div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-red-50/40 px-3.5 py-3 shadow-sm">
                              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                                {customerPhone && (
                                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2 font-bold text-slate-700 shadow-sm">
                                    <Phone size={14} className="text-red-500" />
                                    {customerPhone}
                                  </span>
                                )}

                                {showNotifyButton && (
                                  <button
                                    type="button"
                                    onClick={() => handleNotifyWhatsApp(booking)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                                  >
                                    <MessageCircle size={15} />
                                    Kirim WA
                                  </button>
                                )}

                                {canEditBooking && (
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(booking)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-black text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                                  >
                                    <Pencil size={15} />
                                    Ubah
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenReceipt(booking)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
                                >
                                  <ReceiptText size={15} />
                                  Kuitansi
                                </button>

                                {booking.status === "checked_out" && (
                                  <span className="inline-flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-3.5 py-2.5 text-xs font-black text-orange-700 shadow-sm">
                                    <Clock3 size={15} />
                                    Kamar perlu dibersihkan
                                  </span>
                                )}

                                {booking.status === "cleaning" && (
                                  <span className="inline-flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-3.5 py-2.5 text-xs font-black text-orange-700 shadow-sm">
                                    <Clock3 size={15} />
                                    Cleaning: {getCleaningStartedByName(booking)}
                                  </span>
                                )}

                                {customerEmail && (
                                  <span className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2 font-semibold text-slate-600 shadow-sm">
                                    <Mail size={14} className="text-red-500" />
                                    <span className="truncate">{customerEmail}</span>
                                  </span>
                                )}

                                {!customerPhone && !customerEmail && (
                                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2 font-semibold text-slate-500 shadow-sm">
                                    <Phone size={14} className="text-slate-400" />
                                    Kontak tamu belum tersedia
                                  </span>
                                )}
                              </div>
                            </div>

                            {hasBookingHistory && (
                              <div className="rounded-[24px] border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                                <div className="mb-2 flex items-center gap-2">
                                  <History size={14} className="text-red-500" />
                                  <p className="text-xs font-black uppercase tracking-wide text-slate-600">
                                    Riwayat Booking
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs">
                                  {booking?.creator?.name && (
                                    <HistoryPill label="Dibuat" value={getCreatedByName(booking)} />
                                  )}

                                  {booking?.editor?.name && (
                                    <HistoryPill label="Diedit" value={getEditedByName(booking)} />
                                  )}

                                  {booking?.refunder?.name && (
                                    <HistoryPill label="Refund" value={getRefundedByName(booking)} />
                                  )}

                                  {booking?.canceller?.name && (
                                    <HistoryPill label="Batalkan" value={getCancelledByName(booking)} />
                                  )}

                                  {hasCleaningHistory && (
                                    <HistoryPill label="Cleaning oleh" value={cleaningByName} />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {visiblePaymentNote && (
                            <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                              <p className="leading-relaxed">
                                <strong>Catatan Pembayaran:</strong> {visiblePaymentNote}
                              </p>
                            </div>
                          )}

                          {discountPercent > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-700">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                                  Diskon
                                </p>
                                <p className="font-bold">{discountPercent}%</p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                                  Harga Awal
                                </p>
                                <p className="font-bold">
                                  {formatCurrency(originalPrice)}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                                  Harga Setelah Diskon
                                </p>
                                <p className="font-bold">
                                  {formatCurrency(booking.total_price)}
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.payment_status === "refunded" && (
                            <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                              <p>
                                <strong>Refund:</strong>{" "}
                                {formatCurrency(booking.refund_amount || 0)}
                              </p>
                              {booking.refund_reason && (
                                <p className="mt-1">
                                  <strong>Alasan Refund:</strong> {booking.refund_reason}
                                </p>
                              )}
                              {booking.refunded_at && (
                                <p className="mt-1">
                                  <strong>Waktu Refund:</strong>{" "}
                                  {formatDateTime(booking.refunded_at)}
                                </p>
                              )}
                            </div>
                          )}

                          {hasPenalty && (
                            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                                    Denda Booking
                                  </p>
                                  <h4 className="mt-1 text-base font-bold text-rose-700">
                                    Total Denda: {formatCurrency(totalPenalty)}
                                  </h4>
                                  <p className="mt-1 text-xs text-rose-600">
                                    Denda tambahan setelah check-out / saat proses cleaning.
                                  </p>
                                </div>

                                <div className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                                  {bookingPenalties.length} item denda
                                </div>
                              </div>

                              {bookingPenalties.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  {bookingPenalties.map((penalty, penaltyIndex) => (
                                    <div
                                      key={penalty.id || `${booking.id}-penalty-${penaltyIndex}`}
                                      className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-3"
                                    >
                                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div>
                                          <p className="font-semibold text-rose-700">
                                            {penalty.title || "Denda tambahan"}
                                          </p>
                                          {penalty.penalty_type && (
                                            <p className="mt-1 text-xs uppercase tracking-wide text-rose-400">
                                              Jenis: {penalty.penalty_type}
                                            </p>
                                          )}
                                          {penalty.note && (
                                            <p className="mt-2 text-sm leading-relaxed text-rose-700">
                                              {penalty.note}
                                            </p>
                                          )}
                                          {penalty.creator?.name && (
                                            <p className="mt-2 text-xs text-rose-500">
                                              Input oleh: {penalty.creator.name}
                                            </p>
                                          )}
                                          {!penalty.creator?.name && penalty.creator_name && (
                                            <p className="mt-2 text-xs text-rose-500">
                                              Input oleh: {penalty.creator_name}
                                            </p>
                                          )}
                                        </div>

                                        <div className="shrink-0 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">
                                          {formatCurrency(Number(penalty.amount || 0))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {booking.cancel_reason && (
                            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                              <p>
                                <strong>Alasan Cancel:</strong> {booking.cancel_reason}
                              </p>
                              {booking.cancelled_at && (
                                <p className="mt-1">
                                  <strong>Waktu Cancel:</strong>{" "}
                                  {formatDateTime(booking.cancelled_at)}
                                </p>
                              )}
                            </div>
                          )}

                          {booking.admin_note && (
                            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                              <strong>Catatan Admin:</strong> {booking.admin_note}
                            </div>
                          )}

                                                    {booking.rejection_reason_customer && (
                            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                              <strong>Alasan untuk tamu:</strong>{" "}
                              {booking.rejection_reason_customer}
                            </div>
                          )}

                          {booking.rejection_reason_internal && (
                            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                              <strong>Catatan internal:</strong>{" "}
                              {booking.rejection_reason_internal}
                            </div>
                          )}
                        </div>

                        <div className="relative border-t border-dashed border-slate-200 bg-slate-50/80 p-4 lg:border-l lg:border-t-0 lg:p-5">
                          <div className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-gray-100 lg:block" />
                          <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-gray-100 lg:block" />

                          <div className="sticky top-4 space-y-2">
                            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Aksi Operasional
                            </p>

                            {booking.status === "pending" ? (
                              <>
                                <ActionButton
                                  icon={<CircleCheck size={17} />}
                                  label="Setujui"
                                  tone="green"
                                  onClick={() => handleApproveClick(booking)}
                                />

                                <ActionButton
                                  icon={<CircleX size={17} />}
                                  label="Tolak"
                                  tone="red"
                                  onClick={() => handleRejectClick(booking)}
                                />
                              </>
                            ) : booking.status === "confirmed" &&
                              booking.payment_status !== "paid" &&
                              booking.payment_status !== "refunded" ? (
                              <>
                                <ActionButton
                                  icon={<DoorOpen size={17} />}
                                  label="Check-in & Bayar"
                                  tone="emerald"
                                  onClick={() => handleMarkPaid(booking)}
                                />

                                {showCancelButton && (
                                  <ActionButton
                                    icon={<CircleX size={17} />}
                                    label="Batalkan"
                                    tone="red"
                                    onClick={() => openCancelModal(booking)}
                                  />
                                )}
                              </>
                            ) : booking.status === "confirmed" &&
                              booking.payment_status === "paid" ? (
                              <>
                                <ActionButton
                                  icon={<CheckCircle2 size={17} />}
                                  label="Check In"
                                  tone="blue"
                                  onClick={() => handleCheckIn(booking)}
                                />

                                {canEditBooking && (
                                  <ActionButton
                                    icon={<Wallet size={17} />}
                                    label="Refund"
                                    tone="purple"
                                    onClick={() => openRefundModal(booking)}
                                  />
                                )}

                                {showCancelButton && (
                                  <ActionButton
                                    icon={<CircleX size={17} />}
                                    label="Batalkan"
                                    tone="red"
                                    onClick={() => openCancelModal(booking)}
                                  />
                                )}
                              </>
                            ) : booking.status === "checked_in" ? (
                              <>
                                <ActionButton
                                  icon={<CircleCheck size={17} />}
                                  label="Check Out"
                                  tone="slate"
                                  onClick={() => handleCheckOut(booking)}
                                />

                                {canEditBooking && booking.payment_status !== "refunded" && (
                                  <ActionButton
                                    icon={<Wallet size={17} />}
                                    label="Refund"
                                    tone="purple"
                                    onClick={() => openRefundModal(booking)}
                                  />
                                )}

                                {showCancelButton && (
                                  <ActionButton
                                    icon={<CircleX size={17} />}
                                    label="Batalkan"
                                    tone="red"
                                    onClick={() => openCancelModal(booking)}
                                  />
                                )}
                              </>
                            ) : booking.status === "checked_out" ? (
                              <ActionButton
                                icon={<RotateCcw size={17} />}
                                label="Tangani Cleaning"
                                tone="orange"
                                onClick={() => handleStartCleaning(booking)}
                              />
                            ) : booking.status === "cleaning" ? (
                              <ActionButton
                                icon={<CircleCheck size={17} />}
                                label="Tandai Selesai"
                                tone="teal"
                                onClick={() => handleFinishCleaning(booking)}
                              />
                            ) : (
                              <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm ring-1 ring-slate-200">
                                <CheckCircle2 size={17} />
                                Sudah Diproses
                              </div>
                            )}

                            {showAddPenaltyButton && (
                              <ActionButton
                                icon={<Plus size={17} />}
                                label="Tambah Denda"
                                tone="rose"
                                onClick={() => handleOpenPenaltyModal(booking)}
                              />
                            )}

                            {canDeleteBooking && (
                              <ActionButton
                                icon={<Trash2 size={17} />}
                                label="Hapus Booking"
                                tone="red"
                                onClick={() => openDeleteModal(booking)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          </>
          )}

          {selectedBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Setujui Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Pilih kamar fisik untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Kamar Fisik
                    </label>
                    <select
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                    >
                      <option value="">Pilih kamar fisik</option>
                      {roomUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Kamar {unit.room_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Admin (Opsional)
                    </label>
                    <textarea
                      placeholder="Contoh: Silakan check-in di resepsionis sebelum jam 20.00"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none"
                      rows={4}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeApproveModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-green-600 text-white rounded-2xl py-3 font-semibold hover:bg-green-700 transition disabled:opacity-70"
                      onClick={handleApprove}
                      disabled={approving}
                    >
                      {approving ? "Menyimpan..." : "Konfirmasi Setujui"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRejectBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Tolak Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Isi alasan penolakan untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedRejectBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan untuk Tamu
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Mohon maaf, kamar sedang penuh pada jadwal tersebut."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                      value={rejectReasonCustomer}
                      onChange={(e) => setRejectReasonCustomer(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Internal Admin (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Tamu masuk blacklist internal."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                      value={rejectReasonInternal}
                      onChange={(e) => setRejectReasonInternal(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeRejectModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition disabled:opacity-70"
                      onClick={handleReject}
                      disabled={rejecting}
                    >
                      {rejecting ? "Menyimpan..." : "Konfirmasi Tolak"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedEditBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Ubah Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Ubah data booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedEditBooking.booking_code}
                  </span>
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Tamu
                    </label>
                    <input
                      type="text"
                      name="guest_name"
                      value={editForm.guest_name}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Nama tamu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor HP
                    </label>
                    <input
                      type="text"
                      name="guest_phone"
                      value={editForm.guest_phone}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Nomor HP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={editForm.guest_email}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Email tamu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check In
                    </label>
                    <input
                      type="datetime-local"
                      name="check_in"
                      value={editForm.check_in}
                      onChange={handleEditChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kamar Fisik
                    </label>
                    <select
                      name="room_unit_id"
                      value={editForm.room_unit_id}
                      onChange={handleEditChange}
                      className={inputClass}
                    >
                      <option value="">Pilih kamar fisik</option>
                      {editRoomUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Kamar {unit.room_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Admin
                    </label>
                    <textarea
                      name="admin_note"
                      rows={4}
                      value={editForm.admin_note}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Catatan admin"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-5">
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                    onClick={closeEditModal}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    className="flex-1 bg-yellow-500 text-white rounded-2xl py-3 font-semibold hover:bg-yellow-600 transition disabled:opacity-70"
                    onClick={handleUpdateBooking}
                    disabled={editing}
                  >
                    {editing ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedRefundBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Refund Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Proses refund untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedRefundBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nominal Refund
                    </label>
                    <input
                      type="number"
                      name="refund_amount"
                      value={refundForm.refund_amount}
                      onChange={handleRefundChange}
                      className={inputClass}
                      placeholder="Masukkan nominal refund"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan Refund
                    </label>
                    <textarea
                      name="refund_reason"
                      rows={4}
                      value={refundForm.refund_reason}
                      onChange={handleRefundChange}
                      className={inputClass}
                      placeholder="Contoh: Pembatalan oleh pihak hotel / tamu komplain / double booking"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeRefundModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-purple-600 text-white rounded-2xl py-3 font-semibold hover:bg-purple-700 transition disabled:opacity-70"
                      onClick={handleRefundBooking}
                      disabled={refunding}
                    >
                      {refunding ? "Memproses..." : "Confirm Refund"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCancelBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Batalkan Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Isi alasan pembatalan untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedCancelBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan Cancel
                    </label>
                    <textarea
                      name="cancel_reason"
                      rows={4}
                      value={cancelForm.cancel_reason}
                      onChange={handleCancelChange}
                      className={inputClass}
                      placeholder="Contoh: Tamu tidak memberikan kepastian kedatangan."
                    />
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Booking yang dicancel akan berubah status menjadi
                    <strong> cancelled</strong>.
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeCancelModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition disabled:opacity-70"
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                    >
                      {cancelling ? "Memproses..." : "Konfirmasi Batalkan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDeleteBooking && (
            <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-lg rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">
                      Hapus Booking
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Hapus booking ini permanen?
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Booking{" "}
                      <span className="font-black text-slate-800">
                        {selectedDeleteBooking.booking_code || `#${selectedDeleteBooking.id}`}
                      </span>{" "}
                      akan dihapus permanen dari database. Aksi ini hanya tersedia untuk boss dan super admin.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                  Mode testing: booking akan benar-benar hilang dari list, laporan, calendar, dan riwayat customer.
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                    onClick={closeDeleteModal}
                    disabled={deletingBooking}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={handleDeleteBooking}
                    disabled={deletingBooking}
                  >
                    {deletingBooking ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            </div>
          )}


          {selectedReceiptBooking && (
            <div className="fixed inset-0 z-[70] bg-black/60 p-4 overflow-y-auto backdrop-blur-[2px]">
              <div className="min-h-full flex items-center justify-center py-8">
                <div className="w-full max-w-6xl">
                  <div className="rounded-[32px] border border-red-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] overflow-hidden">
                    <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-red-100 bg-white/95 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-600">
                          Kuitansi Admin ReadyRoom
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-gray-900 md:text-3xl">
                          Tiket Operasional Booking
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Kuitansi ini bisa dicetak atau disimpan PDF untuk tamu dan resepsionis.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePrintReceipt}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
                        >
                          <Printer size={18} />
                          Cetak / Simpan PDF
                        </button>

                        <button
                          type="button"
                          onClick={closeReceiptModal}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-300"
                        >
                          <X size={18} />
                          Tutup
                        </button>
                      </div>
                    </div>

                    <div className="bg-[radial-gradient(circle_at_top_right,_rgba(254,202,202,0.5),_transparent_26%),linear-gradient(180deg,_#fff_0%,_#fff8f8_100%)] p-4 md:p-8">
                      <div
                        ref={receiptPrintRef}
                        className="print-ticket relative overflow-hidden rounded-[30px] border border-red-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
                      >
                        <div className="print-top relative overflow-hidden bg-gradient-to-br from-red-950 via-red-700 to-rose-500 px-6 py-7 text-white md:px-8 md:py-8">
                          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                          <div className="absolute right-8 top-6 text-[90px] font-black leading-none text-white/10 md:text-[140px]">
                            RR
                          </div>

                          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-3xl">
                              <p className="text-xs font-black uppercase tracking-[0.35em] text-red-100">
                                ReadyRoom • Hotel Ops
                              </p>
                              <h3 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
                                Kuitansi ReadyRoom
                                <span className="block text-red-100">TIKET BOOKING</span>
                              </h3>
                              <p className="mt-3 max-w-2xl text-sm text-red-50 md:text-base">
                                Tunjukkan tiket ini ke resepsionis. Gunakan kode booking atau scan QR untuk validasi cepat saat tamu datang.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${
                                  selectedReceiptBooking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : selectedReceiptBooking.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : selectedReceiptBooking.status === "checked_in"
                                    ? "bg-blue-100 text-blue-700"
                                    : selectedReceiptBooking.status === "checked_out"
                                    ? "bg-slate-100 text-slate-700"
                                    : selectedReceiptBooking.status === "cleaning"
                                    ? "bg-orange-100 text-orange-700"
                                    : selectedReceiptBooking.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-white text-gray-700"
                                }`}
                              >
                                Status: {getStatusLabel(selectedReceiptBooking.status)}
                              </span>

                              <span
                                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${
                                  selectedReceiptBooking.payment_status === "paid"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : selectedReceiptBooking.payment_status === "refunded"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-white text-gray-700"
                                }`}
                              >
                                Pembayaran: {getPaymentStatusLabel(selectedReceiptBooking.payment_status)}
                              </span>

                              {selectedReceiptBooking.payment_method && (
                                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${getPaymentMethodClass(selectedReceiptBooking.payment_method)}`}>
                                  {getPaymentMethodLabel(selectedReceiptBooking.payment_method)}
                                </span>
                              )}

                              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-white ring-1 ring-white/15">
                                {getReceiptSourceLabel(selectedReceiptBooking)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="print-content relative px-6 py-6 md:px-8 md:py-8">
                          <div className="absolute -left-10 top-20 h-28 w-28 rounded-full bg-red-100/60 blur-2xl" />
                          <div className="absolute -bottom-10 right-10 h-36 w-36 rounded-full bg-rose-100/60 blur-3xl" />

                          <div className="relative z-10">
                            <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                              <div>
                                <p className="text-sm font-black uppercase tracking-[0.22em] text-red-600">
                                  Kode Booking
                                </p>
                                <h4 className="mt-2 break-all text-3xl font-black text-gray-950 md:text-5xl">
                                  {selectedReceiptBooking.booking_code || `BOOKING-${selectedReceiptBooking.id}`}
                                </h4>
                                <p className="mt-2 text-sm text-gray-500">
                                  Dicetak dari Aplikasi ReadyRoom  • {new Date().toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </p>
                              </div>

                              <div className="rounded-[24px] border border-red-100 bg-gradient-to-br from-red-50 to-white px-5 py-4 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                                  Total Harga
                                </p>
                                <p className="mt-2 text-2xl font-black text-gray-950 md:text-3xl">
                                  {formatCurrency(selectedReceiptBooking.total_price)}
                                </p>
                              </div>
                            </div>

                            <div className="print-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Nama Tamu
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {getBookingCustomerName(selectedReceiptBooking)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Nomor HP
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {selectedReceiptBooking.guest_phone || "-"}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Hotel
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {selectedReceiptBooking.hotel?.name || "-"}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Tipe Kamar
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {getBookingRoomName(selectedReceiptBooking)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Unit Kamar
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {getBookingRoomUnit(selectedReceiptBooking)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Metode Pembayaran
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {getPaymentMethodLabel(selectedReceiptBooking.payment_method)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Nominal Dibayar
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {formatCurrency(selectedReceiptBooking.paid_amount || selectedReceiptBooking.total_price)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Dibuat Oleh
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {getCreatedByName(selectedReceiptBooking)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Check In
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {formatDateTime(selectedReceiptBooking.check_in)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Check Out
                                </p>
                                <p className="mt-2 text-lg font-black text-slate-900">
                                  {formatDateTime(selectedReceiptBooking.check_out)}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Tipe Booking
                                </p>
                                <p className="mt-2 text-lg font-black capitalize text-slate-900">
                                  {getBookingTypeLabel(selectedReceiptBooking.booking_type)}
                                  {selectedReceiptBooking.duration_hours
                                    ? ` • ${selectedReceiptBooking.duration_hours} jam`
                                    : ""}
                                </p>
                              </div>

                              <div className="print-card rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:col-span-2 xl:col-span-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                  Catatan Admin
                                </p>
                                <p className="mt-2 text-base font-bold text-slate-900">
                                  {selectedReceiptBooking.admin_note || "Tidak ada catatan admin."}
                                </p>
                              </div>
                            </div>

                            <div className="print-lower mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                              <div className="print-note rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600">
                                  Catatan Penting
                                </p>
                                <h5 className="mt-2 text-2xl font-black text-amber-950">
                                  Tunjukkan tiket ini ke resepsionis
                                </h5>

                                <div className="mt-4 space-y-2 text-sm leading-7 text-amber-950">
                                  <p>• Tiket ini adalah bukti booking operasional hotel.</p>
                                  <p>• Resepsionis dapat mencocokkan kode booking atau scan QR untuk validasi cepat.</p>
                                  <p>• Simpan tiket ini hingga proses check-in selesai.</p>
                                  <p>Harap datang sesuai waktu booking yang telah dipilih.

Jika dalam 30 menit setelah waktu check-in tidak ada konfirmasi atau kehadiran, booking dapat dibatalkan oleh pihak hotel.
Jika mengalami kendala atau keterlambatan, silakan hubungi admin cabang melalui kontak resmi hotel.</p>
                                  {selectedReceiptBooking.hotel?.wa_admin && (
                                    <p className="font-bold text-blue-700">
                                      • Kontak Admin Cabang: {selectedReceiptBooking.hotel.wa_admin}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="print-qr rounded-[28px] border border-dashed border-slate-300 bg-white p-5 shadow-sm">
                                <div className="rounded-[22px] bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100">
                                  <QRCodeCanvas
                                    value={buildReceiptQrValue(selectedReceiptBooking)}
                                    size={180}
                                    level="H"
                                    includeMargin={true}
                                  />
                                </div>
                                <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                                  Scan QR Booking
                                </p>
                                <p className="mt-2 break-all text-base font-black text-slate-900">
                                  {selectedReceiptBooking.booking_code || `BOOKING-${selectedReceiptBooking.id}`}
                                </p>
                              </div>
                            </div>

                            <div className="print-footer mt-6 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 text-xs font-medium text-slate-500 md:flex-row md:items-center md:justify-between">
                              <p>Tiket Admin ReadyRoom • Alur operasional semi-manual</p>
                              <p>Gunakan Cetak / Simpan PDF untuk mengirim receipt ke tamu</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePrintReceipt}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black"
                        >
                          <Download size={18} />
                          Cetak / Simpan PDF
                        </button>

                        <button
                          type="button"
                          onClick={closeReceiptModal}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-300"
                        >
                          Tutup Kuitansi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPenaltyBooking && (
            <div className="fixed inset-0 z-[70] bg-black/50 p-4 backdrop-blur-sm flex items-center justify-center">
              <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Tambah Denda Booking</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Input denda operasional setelah tamu check-out atau saat proses cleaning.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closePenaltyModal}
                    className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6 px-6 py-6">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Kode Booking</p>
                        <p className="mt-1 text-sm font-bold text-rose-700">
                          {selectedPenaltyBooking.booking_code || `Booking #${selectedPenaltyBooking.id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Status Booking</p>
                        <p className="mt-1 text-sm font-bold text-rose-700">
                          {selectedPenaltyBooking.status || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Nama Tamu</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {selectedPenaltyBooking.user?.name || selectedPenaltyBooking.guest_name || "Tamu"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Hotel / Kamar</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {selectedPenaltyBooking.hotel?.name || "-"} / {selectedPenaltyBooking.room?.type || selectedPenaltyBooking.room?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Jenis Denda
                      </label>
                      <select
                        name="penalty_type"
                        value={penaltyForm.penalty_type}
                        onChange={handlePenaltyChange}
                        className={inputClass}
                      >
                        <option value="smoking">Merokok di kamar</option>
                        <option value="damage">Kerusakan fasilitas</option>
                        <option value="lost_item">Barang hotel hilang</option>
                        <option value="extra_cleaning">Extra cleaning</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Nominal Denda
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="amount"
                        value={penaltyForm.amount}
                        onChange={handlePenaltyChange}
                        placeholder="Contoh: 150000"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Judul Denda
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={penaltyForm.title}
                      onChange={handlePenaltyChange}
                      placeholder="Contoh: Merokok di kamar"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Catatan
                    </label>
                    <textarea
                      name="note"
                      value={penaltyForm.note}
                      onChange={handlePenaltyChange}
                      rows={4}
                      placeholder="Contoh: Ditemukan bau rokok dan abu rokok saat proses cleaning."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
                  <button
                    type="button"
                    onClick={closePenaltyModal}
                    className="rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePenalty}
                    disabled={savingPenalty}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-white font-semibold hover:bg-rose-700 transition disabled:opacity-70"
                  >
                    <Save size={18} />
                    {savingPenalty ? "Menyimpan..." : "Simpan Denda"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPaidBooking && (
            <div className="fixed inset-0 z-[70] bg-black/50 p-4 backdrop-blur-sm flex items-center justify-center">
              <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Check-in & Pembayaran</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Isi waktu tamu benar-benar masuk, estimasi check-out, dan pembayaran.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closePaidModal}
                    className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-6">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kode Booking</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {selectedPaidBooking.booking_code || `Booking #${selectedPaidBooking.id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nama Tamu</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {selectedPaidBooking.user?.name || selectedPaidBooking.guest_name || "Tamu"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Tagihan</p>
                        <p className="mt-1 text-sm font-bold text-emerald-700">
                          {formatCurrency(selectedPaidBooking.total_price || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Jadwal Booking</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {formatDateTime(selectedPaidBooking.check_in)} → {formatDateTime(selectedPaidBooking.check_out)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <DoorOpen size={17} className="text-emerald-700" />
                      <div>
                        <p className="text-sm font-black text-emerald-900">
                          Waktu Operasional Check-in
                        </p>
                        <p className="text-xs font-semibold text-emerald-700">
                          Dipakai untuk label booking dan peringatan waktu check-out.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Jam Check-in Aktual
                        </label>
                        <input
                          type="datetime-local"
                          value={actualCheckInInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setActualCheckInInput(value);
                            setExpectedCheckOutInput(
                              calculateExpectedCheckoutInput(selectedPaidBooking, value)
                            );
                          }}
                          className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Target Check-out
                        </label>
                        <input
                          type="datetime-local"
                          value={expectedCheckOutInput}
                          onChange={(e) => setExpectedCheckOutInput(e.target.value)}
                          className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Metode Pembayaran</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        { value: "cash", label: "Tunai" },
                        { value: "transfer", label: "Transfer" },
                        { value: "qris", label: "QRIS" },
                      ].map((method) => {
                        const active = paymentMethod === method.value;
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setPaymentMethod(method.value)}
                            className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                              active
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {method.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Nominal Dibayar</label>
                      <input
                        type="number"
                        min="0"
                        value={paidAmountInput}
                        onChange={(e) => setPaidAmountInput(e.target.value)}
                        placeholder="Masukkan nominal"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Catatan Pembayaran</label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="Opsional"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800">
                    Setelah disimpan, sistem akan menandai booking sebagai lunas lalu langsung melakukan check-in.
                    
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
                  <button
                    type="button"
                    onClick={closePaidModal}
                    className="rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={confirmPayment}
                    disabled={paying}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-70"
                  >
                    <DoorOpen size={18} />
                    {paying ? "Menyimpan..." : "Simpan, Lunas & Check-in"}
                  </button>
                </div>
              </div>
            </div>
          )}
{showHousekeepingReportModal && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
    <div className="max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-2xl">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-6 py-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[92px] font-black tracking-[0.12em] text-white/5">
          HK
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
              ReadyRoom Housekeeping
            </p>
            <h3 className="mt-1 text-2xl font-black">
              Laporan Housekeeping
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">
              Riwayat kamar perlu dibersihkan, sedang cleaning, dan selesai cleaning per hari.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHousekeepingReportModal(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(92vh-120px)] overflow-y-auto p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={housekeepingReportDate}
              onChange={(e) => setHousekeepingReportDate(e.target.value)}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
            />
            <span className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm">
              {housekeepingReportDate ? formatDate(housekeepingReportDate) : "Semua tanggal"}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrintHousekeepingReport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-xs font-black text-white shadow-sm transition hover:bg-black"
          >
            <Printer size={15} />
            Print / Simpan PDF
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Total Data</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{housekeepingSummary.total}</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">Perlu Dibersihkan</p>
            <p className="mt-1 text-2xl font-black text-orange-800">{housekeepingSummary.needsCleaning}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-amber-600">Sedang Cleaning</p>
            <p className="mt-1 text-2xl font-black text-amber-800">{housekeepingSummary.inCleaning}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Selesai</p>
            <p className="mt-1 text-2xl font-black text-emerald-800">{housekeepingSummary.completed}</p>
          </div>
        </div>

        <div
          ref={housekeepingPrintRef}
          className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm"
        >
          <div className="border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-red-50 px-5 py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                  Laporan Housekeeping ReadyRoom
                </p>
                <h4 className="mt-1 text-lg font-black text-slate-900">
                  {housekeepingReportDate ? formatDate(housekeepingReportDate) : "Semua Tanggal"}
                </h4>
              </div>
              <p className="text-xs font-bold text-slate-500">
                Total data: {housekeepingReportBookings.length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-black">Kode</th>
                  <th className="px-4 py-3 font-black">Tamu</th>
                  <th className="px-4 py-3 font-black">Hotel</th>
                  <th className="px-4 py-3 font-black">Kamar / Unit</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Check-out</th>
                  <th className="px-4 py-3 font-black">Mulai Cleaning</th>
                  <th className="px-4 py-3 font-black">Selesai Cleaning</th>
                  <th className="px-4 py-3 font-black">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {housekeepingReportBookings.length > 0 ? (
                  housekeepingReportBookings.map((booking) => {
                    const status = String(booking?.status || "").toLowerCase();

                    return (
                      <tr key={booking.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-black text-gray-900">
                          {booking.booking_code || `Booking #${booking.id}`}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800">{getBookingCustomerName(booking)}</p>
                          <p className="text-xs text-gray-500">{booking.guest_phone || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{booking.hotel?.name || "-"}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {booking.room?.type || booking.room?.name || "-"} / Unit {getBookingRoomUnit(booking)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(booking.status)}`}>
                            {status === "checked_out"
                              ? "Perlu Dibersihkan"
                              : status === "cleaning"
                              ? "Proses Cleaning"
                              : status === "completed"
                              ? "Selesai Cleaning"
                              : getStatusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateTime(getOperationalCheckoutTime(booking))}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateTime(getHousekeepingStartTime(booking))}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateTime(getHousekeepingFinishTime(booking))}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {["cleaning", "completed"].includes(status)
                            ? getCleaningByName(booking)
                            : "Menunggu tindakan"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-10 text-center text-gray-500">
                      Belum ada data housekeeping pada tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setShowHousekeepingReportModal(false)}
            className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-black"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showReportModal && (
  <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
    <div className="w-full max-w-7xl rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 max-h-[92vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Laporan Booking</h3>
          <p className="text-sm text-gray-500 mt-1">
            Laporan hanya mengambil booking yang sudah check-in dan sudah lunas. Pending, belum disetujui, belum check-in, cancel, reject, dan refund tidak masuk report.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(false)}
          className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 xl:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Filter Tanggal
          </label>

          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value || getTodayDateValue())}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
          />
          <p className="mt-2 text-xs font-medium text-gray-500">
            Patokan: Jam Masuk Tamu / aktual check-in
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Filter Shift
          </label>

          <select
            value={reportShift}
            onChange={(e) => setReportShift(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
          >
            <option value="all">Semua Shift</option>
            <option value="pagi">Shift Pagi (00:00 - 11:59)</option>
            <option value="malam">Shift Malam (12:00 - 23:59)</option>
          </select>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Filter Metode Pembayaran
          </label>

          <select
            value={reportPaymentMethod}
            onChange={(e) => setReportPaymentMethod(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai</option>
            <option value="digital">Transfer / QRIS</option>
          </select>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">Total Booking</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{reportBookings.length}</p>
          <p className="mt-1 text-xs text-gray-500">Sudah check-in & lunas</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">Pendapatan Booking</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(reportTotalValue)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Dari transaksi lunas</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700">Total Diskon</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(reportTotalDiscount)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Potongan dari booking</p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">Total Denda</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(reportTotalPenalty)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Denda pada filter ini</p>
        </div>
      </div>

      <div
        ref={reportPrintRef}
        className="rounded-[28px] border border-gray-200 overflow-hidden bg-white"
      >
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-500 px-6 py-5 text-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h4 className="text-3xl font-extrabold tracking-tight">Laporan Booking ReadyRoom</h4>
              <p className="mt-1 text-sm text-white/90">Dicetak dari Apps Powered by ReadyRoom Technology</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                Shift: {reportShift === "all" ? "Semua Shift" : reportShift === "pagi" ? "Pagi" : "Malam"}
              </span>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                Pembayaran: {getReportPaymentMethodLabel(reportPaymentMethod)}
              </span>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                Dicetak: {new Date().toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Cabang Report</p>
              <p className="mt-1 text-lg font-bold text-gray-800">
                {folderHotels.find((hotel) => String(hotel.id) === String(filters.hotelId))?.name || "Semua Cabang"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Keterangan</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">Filter aktif: {reportDate ? formatDate(reportDate) : "Semua Tanggal"} • {reportShift === "all" ? "Semua Shift" : reportShift === "pagi" ? "Shift Pagi" : "Shift Malam"} • {getReportPaymentMethodLabel(reportPaymentMethod)}</p>
              <p className="mt-1 text-xs font-medium text-gray-500">Patokan tanggal dan shift menggunakan Jam Masuk Tamu / check-in aktual.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold text-red-600">Total Booking</p>
              <p className="mt-1 text-xl font-black text-gray-900">{reportBookings.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-bold text-emerald-700">Pendapatan Booking</p>
              <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(reportTotalValue)}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-bold text-amber-700">Total Diskon</p>
              <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(reportTotalDiscount)}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-xs font-bold text-rose-700">Total Denda</p>
              <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(reportTotalPenalty)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Total Nilai</p>
              <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(reportGrandTotalValue)}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-lg font-black text-gray-900">Tabel Booking</h5>
                <p className="text-xs font-medium text-gray-500">Hanya booking yang sudah check-in dan lunas.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {reportBookings.length} booking
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-3 font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Jam Masuk Tamu</th>
                    <th className="px-4 py-3 font-semibold">Target Check-out</th>
                    <th className="px-4 py-3 font-semibold">Kode Booking</th>
                    <th className="px-4 py-3 font-semibold">Nama Tamu</th>
                    <th className="px-4 py-3 font-semibold">No Telp</th>
                    <th className="px-4 py-3 font-semibold">Metode Pembayaran</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Harga</th>
                    <th className="px-4 py-3 font-semibold text-right">Diskon</th>
                  </tr>
                </thead>
                <tbody>
                  {reportBookings.length > 0 ? (
                    reportBookings.map((booking, index) => (
                      <tr key={booking.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          {formatDateTime(getReportTransactionDate(booking))}
                        </td>
                        <td className="px-4 py-3">
                          {formatDateTime(getOperationalCheckoutTime(booking))}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {booking.booking_code || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {booking.user?.name || booking.guest_name || "Tamu"}
                        </td>
                        <td className="px-4 py-3">{booking.guest_phone || "-"}</td>
                        <td className="px-4 py-3">
                          {booking.payment_method
                            ? getPaymentMethodLabel(booking.payment_method)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {formatCurrency(getReportBookingAmount(booking))}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-700">
                          {formatCurrency(getBookingDiscountAmount(booking))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        Belum ada data booking yang sudah check-in dan lunas untuk report ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-lg font-black text-gray-900">Tabel Denda</h5>
                <p className="text-xs font-medium text-gray-500">Denda dipisahkan agar mudah dicek oleh boss dan keuangan.</p>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                {reportPenaltyRows.length} item denda
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-rose-100">
              <table className="min-w-full text-sm">
                <thead className="bg-rose-50">
                  <tr className="text-left text-rose-700">
                    <th className="px-4 py-3 font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Kode Booking</th>
                    <th className="px-4 py-3 font-semibold">Nama Tamu</th>
                    <th className="px-4 py-3 font-semibold">Jenis Denda</th>
                    <th className="px-4 py-3 font-semibold">Alasan / Catatan</th>
                    <th className="px-4 py-3 font-semibold">Input Oleh</th>
                    <th className="px-4 py-3 font-semibold">Tanggal Input</th>
                    <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {reportPenaltyRows.length > 0 ? (
                    reportPenaltyRows.map((item, index) => (
                      <tr key={item.id} className="border-t border-rose-100 bg-rose-50/35">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {item.booking?.booking_code || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">
                            {item.booking?.user?.name || item.booking?.guest_name || "Tamu"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.booking?.guest_phone || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {item.type || item.title || "Denda Operasional"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.note || item.title || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.inputBy || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-700">
                          {formatCurrency(item.amount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        Tidak ada denda pada filter report ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-emerald-700">Pendapatan Booking</span>
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(reportTotalValue)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-amber-700">Total Diskon</span>
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(reportTotalDiscount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-rose-700">Total Denda</span>
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(reportTotalPenalty)}</span>
              </div>
              <div className="mt-2 border-t border-emerald-200 pt-2 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-emerald-800">Total Nilai</span>
                <span className="text-xl font-extrabold text-gray-900">{formatCurrency(reportGrandTotalValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowReportModal(false)}
          className="rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
        >
          Tutup
        </button>

        <button
          type="button"
          onClick={handlePrintReport}
          className="rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
        >
          Print PDF
        </button>
      </div>
    </div>
  </div>
)}
          {showManualModal && (
            <div
              className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/55 backdrop-blur-sm ${
                manualModalFullscreen ? "p-0" : "p-3 md:p-5"
              }`}
            >
              <div
                className={`flex w-full flex-col overflow-hidden border border-red-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] ${
                  manualModalFullscreen
                    ? "h-screen max-h-screen max-w-none rounded-none border-0"
                    : "my-5 max-h-[calc(100vh-40px)] max-w-[980px] rounded-[34px]"
                }`}
              >
                <div className="relative shrink-0 overflow-hidden border-b border-red-100 bg-gradient-to-br from-red-950 via-red-700 to-rose-500 px-5 py-4 text-white md:px-6">
                  <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                  <div className="pointer-events-none absolute right-16 top-2 text-[86px] font-black leading-none text-white/10">
                    RR
                  </div>

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.32em] text-red-100">
                        ReadyRoom Manual Ops
                      </p>
                      <h2 className="mt-1 text-xl font-black leading-tight md:text-2xl">
                        Manual Booking
                      </h2>
                      <p className="mt-1 max-w-xl text-xs font-medium text-red-50 md:text-sm">
                        Input booking OTS/walk-in dengan pilihan check-in yang dikunci lewat tombol OK.
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                     

                      <button
                        type="button"
                        onClick={closeManualModal}
                        className="rounded-2xl bg-white/15 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_rgba(254,202,202,0.42),_transparent_24%),linear-gradient(180deg,_#fff_0%,_#fff7f7_100%)] p-4 md:p-5">
                  <div className="rounded-[30px] border border-slate-100 bg-white/95 p-4 shadow-sm md:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="rounded-2xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                        Walk-in / OTS
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
                        {manualForm.check_in
                          ? `Check-in: ${manualCheckInDisplay}`
                          : "Check-in belum dipilih"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Nama Tamu
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="guest_name"
                            value={manualForm.guest_name}
                            onChange={handleManualChange}
                            placeholder="Contoh: Budi Santoso"
                            className={`${manualInputClass} pl-11`}
                          />
                          <User
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Nomor HP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="guest_phone"
                            value={manualForm.guest_phone}
                            onChange={handleManualChange}
                            placeholder="Contoh: 08123456789"
                            className={`${manualInputClass} pl-11`}
                          />
                          <Phone
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Hotel
                        </label>
                        <div className="relative">
                          <select
                            name="hotel_id"
                            value={manualForm.hotel_id}
                            onChange={handleManualChange}
                            className={`${manualInputClass} pl-11`}
                          >
                            <option value="">
                              {loadingHotels ? "Memuat hotel..." : "Pilih hotel"}
                            </option>
                            {folderHotels.map((hotel) => (
                              <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                              </option>
                            ))}
                          </select>
                          <Building2
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Tipe Kamar
                        </label>
                        <div className="relative">
                          <select
                            name="room_id"
                            value={manualForm.room_id}
                            onChange={handleManualChange}
                            className={`${manualInputClass} pl-11`}
                            disabled={!manualForm.hotel_id}
                          >
                            <option value="">
                              {loadingRooms
                                ? "Memuat tipe kamar..."
                                : !manualForm.hotel_id
                                ? "Pilih hotel dulu"
                                : "Pilih tipe kamar"}
                            </option>
                            {filteredRoomsForManual.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.name} {room.type ? `- ${room.type}` : ""}
                              </option>
                            ))}
                          </select>
                          <BedDouble
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Kamar Fisik
                        </label>
                        <div className="relative">
                          <select
                            name="room_unit_id"
                            value={manualForm.room_unit_id}
                            onChange={handleManualChange}
                            className={`${manualInputClass} pl-11`}
                            disabled={!manualForm.room_id}
                          >
                            <option value="">
                              {loadingManualUnits
                                ? "Memuat kamar fisik..."
                                : !manualForm.room_id
                                ? "Pilih tipe kamar dulu"
                                : "Pilih kamar fisik"}
                            </option>
                            {manualRoomUnits.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                Kamar {unit.room_number}
                              </option>
                            ))}
                          </select>
                          <DoorOpen
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Jenis Booking
                        </label>
                        <select
                          name="booking_type"
                          value={manualForm.booking_type}
                          onChange={handleManualChange}
                          className={manualInputClass}
                        >
                          <option value="transit">Transit</option>
                          <option value="overnight">Full Day</option>
                        </select>
                      </div>

                      <div className="relative xl:col-span-2">
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Check In
                        </label>
                        <button
  type="button"
  onClick={openManualCheckInPicker}
  className="flex h-[46px] w-full items-center gap-3 rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50/80 px-4 text-left shadow-sm outline-none transition hover:border-red-300 hover:shadow-md focus:border-red-400 focus:ring-4 focus:ring-red-100"
>
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-100">
    <CalendarDays size={17} />
  </span>

  <span className="min-w-0 flex-1">
    <span className="block truncate text-sm font-black text-slate-900">
      {manualCheckInDisplay}
    </span>
  </span>
</button>

                        {manualDatePickerOpen && (
                          <div className="absolute left-0 top-[calc(100%+6px)] z-[90] w-[350px] max-w-[90vw] rounded-[14px] border border-red-100 bg-white p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.18)]">
                            <div className="flex items-center justify-between gap-1.5 rounded-[12px] bg-gradient-to-br from-red-950 via-red-700 to-rose-500 px-2 py-1.5 text-white">
                              <button
                                type="button"
                                onClick={() => handleManualCalendarMonthChange(-1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs font-black transition hover:bg-white/25"
                              >
                                ‹
                              </button>
                              <div className="text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-red-100">
                                  Kalender Check-in
                                </p>
                                <p className="text-[11px] font-black capitalize">
                                  {manualCalendarMonthLabel}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleManualCalendarMonthChange(1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs font-black transition hover:bg-white/25"
                              >
                                ›
                              </button>
                            </div>

                            <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_86px] gap-1.5">
                              <div>
                                <div className="grid grid-cols-7 gap-[3px] text-center">
                                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                                    <div key={day} className="py-0.5 text-[8px] font-black uppercase text-slate-400">
                                      {day}
                                    </div>
                                  ))}

                                  {manualCalendarDays.map((day, index) => {
                                    const dateValue = day ? getLocalDateValue(day) : "";
                                    const selected = dateValue && dateValue === manualCheckInDraft.date;
                                    const today = day && isSameDay(day, new Date());

                                    return (
                                      <button
                                        key={dateValue || `empty-${index}`}
                                        type="button"
                                        disabled={!day}
                                        onClick={() => handleManualCalendarDayClick(day)}
                                        className={`h-6 rounded-md text-[9px] font-black transition ${
                                          !day
                                            ? "cursor-default bg-transparent"
                                            : selected
                                            ? "bg-red-600 text-white shadow-lg shadow-red-100"
                                            : today
                                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                        }`}
                                      >
                                        {day ? day.getDate() : ""}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="rounded-[12px] border border-slate-100 bg-slate-50 p-1.5">
                                <div className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                  <Clock3 size={10} className="text-red-500" />
                                  Pilih Jam
                                </div>

                                {manualForm.booking_type === "overnight" && (
                                  <p className="mb-1 rounded-lg bg-amber-50 px-1.5 py-1 text-[8px] font-bold leading-snug text-amber-700">
                                    Full Day mulai 14.00
                                  </p>
                                )}

                                <div className="grid grid-cols-1 gap-1">
                                  <select
                                    value={manualCheckInDraft.hour}
                                    onChange={(e) =>
                                      setManualCheckInDraft((prev) => ({
                                        ...prev,
                                        hour: e.target.value,
                                      }))
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                  >
                                    {Array.from({ length: 24 }, (_, index) => padTwo(index)).map((hour) => {
                                      const fullDayHourDisabled =
                                        manualForm.booking_type === "overnight" &&
                                        Number(hour) < MANUAL_FULL_DAY_START_HOUR;

                                      return (
                                        <option
                                          key={hour}
                                          value={hour}
                                          disabled={fullDayHourDisabled}
                                        >
                                          {fullDayHourDisabled ? `${hour} - Tidak tersedia` : hour}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  <select
                                    value={manualCheckInDraft.minute}
                                    onChange={(e) =>
                                      setManualCheckInDraft((prev) => ({
                                        ...prev,
                                        minute: e.target.value,
                                      }))
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                  >
                                    {Array.from({ length: 60 }, (_, index) => padTwo(index)).map((minute) => (
                                      <option key={minute} value={minute}>
                                        {minute}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="mt-1 rounded-lg bg-white px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                                  {manualCheckInDraft.date
                                    ? `${manualCheckInDraft.date} • ${manualCheckInDraft.hour}:${manualCheckInDraft.minute}`
                                    : "Tanggal belum dipilih"}
                                </div>
                              </div>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={clearManualCheckInPicker}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 transition hover:bg-slate-200"
                              >
                                Hapus
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setManualDatePickerOpen(false)}
                                  className="rounded-lg bg-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-700 transition hover:bg-slate-300"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={confirmManualCheckInPicker}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                                >
                                  <CheckCircle2 size={11} />
                                  OK
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {manualForm.booking_type === "transit" ? (
                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                            Durasi Transit
                          </label>
                          <div className="relative">
                            <select
                              name="duration_hours"
                              value={manualForm.duration_hours}
                              onChange={handleManualChange}
                              className={`${manualInputClass} pl-11 ${
                                manualTransitUnavailableMessage
                                  ? "border-amber-200 bg-amber-50 text-slate-600"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {selectedManualRoom
                                  ? "Pilih durasi tersedia"
                                  : "Pilih tipe kamar dulu"}
                              </option>
                              {manualTransitOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={!option.available}
                                  className={
                                    option.available
                                      ? "text-slate-900"
                                      : "bg-slate-100 text-slate-400"
                                  }
                                >
                                  {option.available
                                    ? `${option.label} - ${formatCurrency(option.price)}`
                                    : `${option.label} - Tidak tersedia`}
                                </option>
                              ))}
                            </select>
                            <Clock3
                              size={17}
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                                manualTransitUnavailableMessage
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            />
                          </div>

                          {manualTransitUnavailableMessage && (
                            <p className="mt-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700">
                              {manualTransitUnavailableMessage}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                            Durasi Hari
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              name="duration_days"
                              value={manualForm.duration_days}
                              onChange={handleManualChange}
                              disabled={Boolean(selectedManualRoom && !isManualFullDayAvailable)}
                              className={`${manualInputClass} pl-11 ${
                                manualFullDayUnavailableMessage
                                  ? "border-amber-200 bg-amber-50 text-slate-600"
                                  : ""
                              }`}
                            />
                            <MoonStar
                              size={17}
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                                manualFullDayUnavailableMessage
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            />
                          </div>

                          {manualFullDayUnavailableMessage && (
                            <p className="mt-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700">
                              {manualFullDayUnavailableMessage}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Estimasi Harga
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              manualForm.booking_type === "overnight" &&
                              selectedManualRoom &&
                              !isManualFullDayAvailable
                                ? "Tidak tersedia"
                                : formatCurrency(estimatedManualPrice)
                            }
                            readOnly
                            className={`${manualInputClass} pl-11 font-black ${
                              (manualForm.booking_type === "overnight" &&
                                selectedManualRoom &&
                                !isManualFullDayAvailable) ||
                              (manualForm.booking_type === "transit" &&
                                manualForm.duration_hours &&
                                !selectedManualTransitOption?.available)
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          />
                          <Wallet
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      {canEditBooking && (
                        <div>
                          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                            Diskon (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="manual_discount_percent"
                              min="0"
                              max="100"
                              value={manualForm.manual_discount_percent}
                              onChange={handleManualChange}
                              placeholder="Contoh: 20"
                              className={`${manualInputClass} pr-12`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                              %
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2 xl:col-span-3">
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Catatan Admin
                        </label>
                        <textarea
                          name="admin_note"
                          value={manualForm.admin_note}
                          onChange={handleManualChange}
                          rows={manualModalFullscreen ? 4 : 3}
                          placeholder="Contoh: Booking walk-in dari resepsionis, tamu datang langsung."
                          className={`${manualInputClass} resize-none`}
                        />
                      </div>
                    </div>

                    {canEditBooking && manualDiscountPercent > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                            Potongan Diskon
                          </p>
                          <p className="mt-1 text-lg font-black text-amber-800">
                            - {formatCurrency(manualDiscountAmount)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                            Total Setelah Diskon
                          </p>
                          <p className="mt-1 text-lg font-black text-emerald-800">
                            {formatCurrency(finalManualPrice)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-red-100 bg-white/95 px-4 py-3 backdrop-blur md:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
                        {manualForm.check_in
                          ? `Check-in: ${manualCheckInDisplay}`
                          : "Check-in belum dipilih"}
                      </div>

                      {manualForm.check_in && manualEstimatedCheckOutText !== "-" && (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
                          Estimasi checkout: {manualEstimatedCheckOutText}
                        </div>
                      )}

                      {manualForm.booking_type === "overnight" && manualForm.check_in && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                          Full Day mulai 14.00 • checkout 12.00
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeManualModal}
                        className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-300"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveManualBooking}
                        disabled={savingManual}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:opacity-70"
                      >
                        <Save size={18} />
                        {savingManual ? "Menyimpan..." : "Simpan Booking Manual"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
function StayScheduleMiniCard({
  icon,
  checkIn,
  checkOut,
  actualCheckIn = "",
  targetCheckOut = "",
  overdue = false,
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-2xl border bg-white px-2.5 py-2.5 shadow-sm ${
        overdue ? "border-red-200 ring-1 ring-red-100" : "border-slate-100"
      }`}
    >
      <div
        className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:flex ${
          overdue ? "bg-red-100" : "bg-red-50"
        }`}
      >
        {icon}
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2">
          <p className="text-[8px] font-black uppercase leading-none tracking-wide text-slate-400">
            Jadwal Check In
          </p>
          <p className="mt-1.5 whitespace-normal break-words text-[11px] font-black leading-snug text-slate-950">
            {checkIn || "-"}
          </p>
          {actualCheckIn && (
            <p className="mt-1 rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black leading-snug text-emerald-700">
              Aktual: {actualCheckIn}
            </p>
          )}
        </div>

        <div
          className={`min-w-0 rounded-xl border px-2 py-2 ${
            overdue
              ? "border-red-200 bg-red-50"
              : "border-slate-100 bg-slate-50/80"
          }`}
        >
          <p
            className={`text-[8px] font-black uppercase leading-none tracking-wide ${
              overdue ? "text-red-500" : "text-slate-400"
            }`}
          >
            Jadwal Check Out
          </p>
          <p
            className={`mt-1.5 whitespace-normal break-words text-[11px] font-black leading-snug ${
              overdue ? "text-red-700" : "text-slate-950"
            }`}
          >
            {checkOut || "-"}
          </p>
          {targetCheckOut && (
            <p
              className={`mt-1 rounded-lg px-2 py-1 text-[9px] font-black leading-snug ${
                overdue ? "bg-white text-red-700" : "bg-sky-50 text-sky-700"
              }`}
            >
              Target: {targetCheckOut}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoMiniCard({ icon, label, value, strong = false }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p
          className={`mt-1 truncate text-sm ${
            strong ? "font-black text-slate-950" : "font-bold text-slate-800"
          }`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function HistoryPill({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
      <span className="font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="font-bold text-slate-800">{value || "-"}</span>
    </div>
  );
}

function ActionButton({ icon, label, tone = "slate", onClick }) {
  const toneClass = {
    green: "bg-green-600 text-white hover:bg-green-700 shadow-green-100",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100",
    blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100",
    red: "bg-red-600 text-white hover:bg-red-700 shadow-red-100",
    purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100",
    orange: "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100",
    teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100",
    rose: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100",
    slate: "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-100",
  }[tone] || "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${toneClass}`}
    >
      {icon}
      {label}
    </button>
  );
}
