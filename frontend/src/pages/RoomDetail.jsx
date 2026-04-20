import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Clock3,
  Hotel,
  MoonStar,
  Users,
  FileText,
  LogIn,
  MessageCircle,
  ShieldCheck,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Home,
  AlertCircle,
  User,
  Phone,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const FULL_DAY_MIN_HOUR = 14;

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [bookingMode, setBookingMode] = useState("transit");
  const [transitDuration, setTransitDuration] = useState("3");

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    check_in: "",
    overnight_end_date: "",
  });

  const [guestForm, setGuestForm] = useState({
    guest_name: "",
    guest_phone: "",
  });

  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState({
    open: false,
    bookingCode: "",
  });

  const [bookingError, setBookingError] = useState("");
  const [guestError, setGuestError] = useState("");

  useEffect(() => {
    fetchRoomDetail();
    detectCustomerLogin();
  }, [id]);

  const isFullDayMode = bookingMode === "overnight";

  const detectCustomerLogin = () => {
    try {
      const possibleToken =
        localStorage.getItem("token") ||
        localStorage.getItem("customerToken") ||
        localStorage.getItem("authToken");

      const possibleUserRaw =
        localStorage.getItem("user") ||
        localStorage.getItem("customer") ||
        localStorage.getItem("customerUser");

      let parsedUser = null;

      if (possibleUserRaw) {
        try {
          parsedUser = JSON.parse(possibleUserRaw);
        } catch {
          parsedUser = null;
        }
      }

      setCustomerUser(parsedUser);
      setIsCustomerLoggedIn(Boolean(possibleToken || parsedUser));
    } catch (error) {
      console.error("DETECT CUSTOMER LOGIN ERROR:", error);
      setIsCustomerLoggedIn(false);
      setCustomerUser(null);
    }
  };

  const fetchRoomDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rooms/${id}`);
      const roomData = res.data?.data || null;

      setRoom(roomData);

      const imageList = buildGallery(roomData);
      setActiveImage(imageList[0] || "/images/hotel.jpg");
    } catch (error) {
      console.error("GET ROOM DETAIL ERROR:", error.response?.data || error);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const buildImageUrl = (path, fallback = "/images/hotel.jpg") => {
    if (!path) return fallback;

    const rawPath = String(path).trim();

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }

    const cleanPath = rawPath.replace(/^\/+/, "");

    if (cleanPath.startsWith("images/")) {
      return `/${cleanPath}`;
    }

    if (cleanPath.startsWith("storage/")) {
      return `${BACKEND_BASE_URL}/${cleanPath}`;
    }

    return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
  };

  const buildGallery = (roomData) => {
    if (!roomData) return ["/images/hotel.jpg"];

    const gallery = [];

    if (roomData.thumbnail) {
      gallery.push(buildImageUrl(roomData.thumbnail));
    }

    if (Array.isArray(roomData.images)) {
      roomData.images
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .forEach((img) => {
          const imagePath = img.image_path || img.path || img.image;
          if (imagePath) {
            const finalUrl = buildImageUrl(imagePath);
            if (!gallery.includes(finalUrl)) {
              gallery.push(finalUrl);
            }
          }
        });
    }

    if (gallery.length === 0) {
      gallery.push("/images/hotel.jpg");
    }

    return gallery;
  };

  const galleryImages = useMemo(() => buildGallery(room), [room]);

  const activeImageIndex = useMemo(() => {
    const idx = galleryImages.findIndex((image) => image === activeImage);
    return idx >= 0 ? idx : 0;
  }, [galleryImages, activeImage]);

  const parseDateTimeLocalValue = (value) => {
    if (!value) return null;

    const [datePart, timePart] = value.split(" ");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    return new Date(
      year,
      (month || 1) - 1,
      day || 1,
      hour || 0,
      minute || 0,
      second || 0
    );
  };

  const formatDateTimeLocalValue = (date) => {
    if (!date) return "";

    const pad = (num) => String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const formatDateOnlyValue = (date) => {
    if (!date) return "";

    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  };

  const parseDateOnlyValue = (value) => {
    if (!value) return null;

    const [year, month, day] = String(value).split("-").map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const selectedCheckInDate = useMemo(() => {
    return bookingForm.check_in
      ? parseDateTimeLocalValue(bookingForm.check_in)
      : null;
  }, [bookingForm.check_in]);

  const selectedOvernightEndDate = useMemo(() => {
    return bookingForm.overnight_end_date
      ? parseDateOnlyValue(bookingForm.overnight_end_date)
      : null;
  }, [bookingForm.overnight_end_date]);

  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    []
  );

  const minuteOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")),
    []
  );

  const selectedHour = useMemo(() => {
    if (!selectedCheckInDate) return "";
    return String(selectedCheckInDate.getHours()).padStart(2, "0");
  }, [selectedCheckInDate]);

  const selectedMinute = useMemo(() => {
    if (!selectedCheckInDate) return "";
    return String(selectedCheckInDate.getMinutes()).padStart(2, "0");
  }, [selectedCheckInDate]);

  const overnightMinimumCheckoutDate = useMemo(() => {
    if (!selectedCheckInDate) return null;

    const checkIn = new Date(selectedCheckInDate);
    const noonBoundary = new Date(checkIn);
    noonBoundary.setHours(12, 0, 0, 0);

    const minimumDate = new Date(checkIn);

    if (checkIn < noonBoundary) {
      minimumDate.setHours(12, 0, 0, 0);
      return minimumDate;
    }

    minimumDate.setDate(minimumDate.getDate() + 1);
    minimumDate.setHours(12, 0, 0, 0);
    return minimumDate;
  }, [selectedCheckInDate]);

  const overnightMinimumCheckoutDateOnly = useMemo(() => {
    if (!overnightMinimumCheckoutDate) return null;

    return new Date(
      overnightMinimumCheckoutDate.getFullYear(),
      overnightMinimumCheckoutDate.getMonth(),
      overnightMinimumCheckoutDate.getDate(),
      0,
      0,
      0,
      0
    );
  }, [overnightMinimumCheckoutDate]);

  const selectedOvernightCheckOutDateTime = useMemo(() => {
    if (bookingMode !== "overnight") return null;
    if (!selectedCheckInDate) return null;

    if (!selectedOvernightEndDate && overnightMinimumCheckoutDate) {
      return new Date(overnightMinimumCheckoutDate);
    }

    if (!selectedOvernightEndDate) return null;

    const checkout = new Date(selectedOvernightEndDate);
    checkout.setHours(12, 0, 0, 0);

    if (
      overnightMinimumCheckoutDate &&
      checkout.getTime() < overnightMinimumCheckoutDate.getTime()
    ) {
      return new Date(overnightMinimumCheckoutDate);
    }

    return checkout;
  }, [
    bookingMode,
    selectedCheckInDate,
    selectedOvernightEndDate,
    overnightMinimumCheckoutDate,
  ]);

  const overnightDurationDays = useMemo(() => {
    if (bookingMode !== "overnight") return 1;
    if (!selectedCheckInDate) return 1;
    if (!selectedOvernightCheckOutDateTime) return 1;

    const start = new Date(
      selectedCheckInDate.getFullYear(),
      selectedCheckInDate.getMonth(),
      selectedCheckInDate.getDate(),
      0,
      0,
      0,
      0
    );

    const end = new Date(
      selectedOvernightCheckOutDateTime.getFullYear(),
      selectedOvernightCheckOutDateTime.getMonth(),
      selectedOvernightCheckOutDateTime.getDate(),
      0,
      0,
      0,
      0
    );

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays <= 0 ? 1 : diffDays;
  }, [bookingMode, selectedCheckInDate, selectedOvernightCheckOutDateTime]);

  const updateCheckInTimePart = (type, value) => {
    if (!selectedCheckInDate) {
      if (isCustomerLoggedIn) {
        setBookingError("Pilih tanggal terlebih dahulu.");
      } else {
        setGuestError("Pilih tanggal terlebih dahulu.");
      }
      return;
    }

    if (isFullDayMode && type === "hour" && Number(value) < FULL_DAY_MIN_HOUR) {
      return;
    }

    const nextDate = new Date(selectedCheckInDate);

    if (type === "hour") {
      nextDate.setHours(Number(value));
    }

    if (type === "minute") {
      nextDate.setMinutes(Number(value));
    }

    nextDate.setSeconds(0, 0);

    if (isFullDayMode && nextDate.getHours() < FULL_DAY_MIN_HOUR) {
      nextDate.setHours(FULL_DAY_MIN_HOUR, 0, 0, 0);
    }

    setBookingForm((prev) => ({
      ...prev,
      check_in: formatDateTimeLocalValue(nextDate),
    }));

    setBookingError("");
    setGuestError("");
  };

  useEffect(() => {
    if (bookingMode !== "overnight") return;
    if (!selectedCheckInDate) return;
    if (!overnightMinimumCheckoutDateOnly) return;

    if (!selectedOvernightEndDate) {
      setBookingForm((prev) => ({
        ...prev,
        overnight_end_date: formatDateOnlyValue(overnightMinimumCheckoutDateOnly),
      }));
      return;
    }

    const chosenEndDate = new Date(
      selectedOvernightEndDate.getFullYear(),
      selectedOvernightEndDate.getMonth(),
      selectedOvernightEndDate.getDate(),
      0,
      0,
      0,
      0
    );

    if (chosenEndDate.getTime() < overnightMinimumCheckoutDateOnly.getTime()) {
      setBookingForm((prev) => ({
        ...prev,
        overnight_end_date: formatDateOnlyValue(overnightMinimumCheckoutDateOnly),
      }));
    }
  }, [
    bookingMode,
    selectedCheckInDate,
    selectedOvernightEndDate,
    overnightMinimumCheckoutDateOnly,
  ]);

  useEffect(() => {
    if (!isFullDayMode || !selectedCheckInDate) return;

    if (selectedCheckInDate.getHours() < FULL_DAY_MIN_HOUR) {
      const adjustedDate = new Date(selectedCheckInDate);
      adjustedDate.setHours(FULL_DAY_MIN_HOUR, 0, 0, 0);

      setBookingForm((prev) => ({
        ...prev,
        check_in: formatDateTimeLocalValue(adjustedDate),
      }));
    }
  }, [isFullDayMode, selectedCheckInDate]);

  const estimatedCheckOutText = useMemo(() => {
    if (!selectedCheckInDate) return "-";

    const checkIn = new Date(selectedCheckInDate);
    const checkOut = new Date(checkIn);

    if (bookingMode === "transit") {
      checkOut.setHours(checkOut.getHours() + Number(transitDuration || 0));
    } else if (selectedOvernightCheckOutDateTime) {
      checkOut.setTime(selectedOvernightCheckOutDateTime.getTime());
    } else {
      const sameDayNoon = new Date(checkIn);
      sameDayNoon.setHours(12, 0, 0, 0);

      if (checkIn < sameDayNoon) {
        checkOut.setTime(sameDayNoon.getTime());
      } else {
        sameDayNoon.setDate(sameDayNoon.getDate() + 1);
        checkOut.setTime(sameDayNoon.getTime());
      }
    }

    return checkOut.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [
    selectedCheckInDate,
    bookingMode,
    transitDuration,
    selectedOvernightCheckOutDateTime,
  ]);

  useEffect(() => {
    if (!galleryImages.length) return;

    if (!activeImage || !galleryImages.includes(activeImage)) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages, activeImage]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => {
        const currentIndex = galleryImages.findIndex((image) => image === prev);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = (safeIndex + 1) % galleryImages.length;
        return galleryImages[nextIndex];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [galleryImages]);

  const handlePrevImage = () => {
    if (!galleryImages.length) return;

    const prevIndex =
      activeImageIndex === 0 ? galleryImages.length - 1 : activeImageIndex - 1;
    setActiveImage(galleryImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (!galleryImages.length) return;

    const nextIndex = (activeImageIndex + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIndex]);
  };

  const handleCheckInDateChange = (date) => {
    if (!date) {
      setBookingForm((prev) => ({
        ...prev,
        check_in: "",
        ...(bookingMode === "overnight" ? { overnight_end_date: "" } : {}),
      }));
      setBookingError("");
      setGuestError("");
      return;
    }

    const nextDate = new Date(date);

    if (!selectedCheckInDate) {
      nextDate.setHours(isFullDayMode ? FULL_DAY_MIN_HOUR : 12, 0, 0, 0);
    } else {
      nextDate.setHours(
        selectedCheckInDate.getHours(),
        selectedCheckInDate.getMinutes(),
        0,
        0
      );
    }

    if (isFullDayMode && nextDate.getHours() < FULL_DAY_MIN_HOUR) {
      nextDate.setHours(FULL_DAY_MIN_HOUR, 0, 0, 0);
    }

    setBookingForm((prev) => ({
      ...prev,
      check_in: formatDateTimeLocalValue(nextDate),
    }));

    setBookingError("");
    setGuestError("");
  };

  const handleOvernightRangeChange = (dates) => {
    const [start, end] = dates || [];

    if (!start) {
      setBookingForm((prev) => ({
        ...prev,
        check_in: "",
        overnight_end_date: "",
      }));
      setBookingError("");
      setGuestError("");
      return;
    }

    const nextStart = new Date(start);

    if (!selectedCheckInDate) {
      nextStart.setHours(FULL_DAY_MIN_HOUR, 0, 0, 0);
    } else {
      nextStart.setHours(
        selectedCheckInDate.getHours(),
        selectedCheckInDate.getMinutes(),
        0,
        0
      );
    }

    if (nextStart.getHours() < FULL_DAY_MIN_HOUR) {
      nextStart.setHours(FULL_DAY_MIN_HOUR, 0, 0, 0);
    }

    setBookingForm((prev) => ({
      ...prev,
      check_in: formatDateTimeLocalValue(nextStart),
      overnight_end_date: end ? formatDateOnlyValue(end) : prev.overnight_end_date,
    }));

    setBookingError("");
    setGuestError("");
  };

  const handleOvernightEndDateChange = (date) => {
    if (!date) {
      setBookingForm((prev) => ({
        ...prev,
        overnight_end_date: "",
      }));
      setBookingError("");
      setGuestError("");
      return;
    }

    setBookingForm((prev) => ({
      ...prev,
      overnight_end_date: formatDateOnlyValue(date),
    }));

    setBookingError("");
    setGuestError("");
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const normalizePhone = (phone) => {
    const cleaned = String(phone || "").replace(/\D/g, "");
    if (!cleaned) return "";

    if (cleaned.startsWith("0")) {
      return `62${cleaned.slice(1)}`;
    }

    if (cleaned.startsWith("62")) {
      return cleaned;
    }

    return `62${cleaned}`;
  };

  const transitPrice =
    transitDuration === "3"
      ? room?.price_transit_3h || 0
      : transitDuration === "6"
      ? room?.price_transit_6h || 0
      : room?.price_transit_12h || 0;

  const overnightUnitPrice = Number(room?.price_per_night || 0);

  const mainPrice =
    bookingMode === "transit"
      ? transitPrice
      : overnightUnitPrice * Number(overnightDurationDays || 1);

  const bookingLabelText =
    bookingMode === "transit"
      ? `Transit ${transitDuration} Jam`
      : `Full Day ${overnightDurationDays} Hari`;

  const waAdminLink = useMemo(() => {
    const rawWa = String(room?.hotel?.wa_admin || "").replace(/\D/g, "");
    if (!rawWa) return null;

    const normalizedWa = rawWa.startsWith("0")
      ? `62${rawWa.slice(1)}`
      : rawWa;

    const text = `Halo Admin ${room?.hotel?.name || "Hotel"}, saya ingin reservasi kamar.\n\nHotel: ${
      room?.hotel?.name || "-"
    }\nKamar: ${room?.name || "-"}\nTipe Booking: ${bookingLabelText}\nCheck-in: ${
      selectedCheckInDate
        ? selectedCheckInDate.toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-"
    }\nEstimasi Checkout: ${estimatedCheckOutText}\nHarga: ${formatRupiah(
      mainPrice
    )}\n\nMohon info ketersediaannya ya.`;

    return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(text)}`;
  }, [
    room,
    bookingLabelText,
    mainPrice,
    selectedCheckInDate,
    estimatedCheckOutText,
  ]);

  const guestWaLink = useMemo(() => {
    const rawWa = String(room?.hotel?.wa_admin || "").replace(/\D/g, "");
    if (!rawWa) return null;

    const normalizedAdminWa = rawWa.startsWith("0")
      ? `62${rawWa.slice(1)}`
      : rawWa;

    const normalizedGuestPhone = normalizePhone(guestForm.guest_phone);

    const checkInText = selectedCheckInDate
      ? selectedCheckInDate.toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    const text = `Halo Admin ${room?.hotel?.name || "Hotel"}, saya ingin reservasi manual.\n\nNama: ${
      guestForm.guest_name || "-"
    }\nNo. WhatsApp: ${normalizedGuestPhone || guestForm.guest_phone || "-"}\nHotel: ${
      room?.hotel?.name || "-"
    }\nKamar: ${room?.name || "-"}\nTipe Booking: ${bookingLabelText}\nCheck-in: ${checkInText}\nEstimasi Checkout: ${estimatedCheckOutText}\nHarga: ${formatRupiah(
      mainPrice
    )}\n\nMohon dibantu cek ketersediaan dan konfirmasi reservasinya ya.`;

    return `https://wa.me/${normalizedAdminWa}?text=${encodeURIComponent(text)}`;
  }, [
    room,
    bookingLabelText,
    mainPrice,
    guestForm.guest_name,
    guestForm.guest_phone,
    selectedCheckInDate,
    estimatedCheckOutText,
  ]);

  const closeSuccessModal = () => {
    setBookingSuccess({
      open: false,
      bookingCode: "",
    });
  };

  const resolveCustomerUserId = () => {
    if (customerUser?.id) return customerUser.id;

    try {
      const fallbackId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("customer_id");

      return fallbackId ? Number(fallbackId) : null;
    } catch {
      return null;
    }
  };

  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;

    setGuestForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setGuestError("");
  };

  const validateGuestManualBooking = () => {
    if (!guestForm.guest_name.trim()) {
      setGuestError("Nama tamu wajib diisi.");
      return false;
    }

    if (!guestForm.guest_phone.trim()) {
      setGuestError("Nomor WhatsApp wajib diisi.");
      return false;
    }

    if (!bookingForm.check_in) {
      setGuestError("Silakan pilih tanggal / jam check-in terlebih dahulu.");
      return false;
    }

    if (bookingMode === "overnight" && !selectedOvernightCheckOutDateTime) {
      setGuestError("Silakan pilih tanggal checkout untuk full day.");
      return false;
    }

    if (!room?.hotel?.wa_admin) {
      setGuestError("WhatsApp admin hotel belum tersedia.");
      return false;
    }

    return true;
  };

  const handleManualGuestBooking = () => {
    if (!validateGuestManualBooking()) return;

    window.open(guestWaLink, "_blank", "noopener,noreferrer");
  };

  const handleSubmitBooking = async () => {
    const userId = resolveCustomerUserId();

    if (!userId) {
      setBookingError(
        "User login tidak terdeteksi. Silakan login ulang dulu ya."
      );
      return;
    }

    if (!bookingForm.check_in) {
      setBookingError("Silakan isi tanggal / jam check-in terlebih dahulu.");
      return;
    }

    if (bookingMode === "overnight" && !selectedOvernightCheckOutDateTime) {
      setBookingError("Silakan pilih tanggal checkout untuk full day.");
      return;
    }

    try {
      setSubmittingBooking(true);
      setBookingError("");

      const payload = {
        user_id: userId,
        hotel_id: room.hotel_id || room.hotel?.id,
        room_id: room.id,
        booking_type: bookingMode,
        duration_hours:
          bookingMode === "transit" ? Number(transitDuration) : null,
        duration_days:
          bookingMode === "overnight" ? Number(overnightDurationDays) : null,
        check_in: bookingForm.check_in,
        check_out:
          bookingMode === "overnight" && selectedOvernightCheckOutDateTime
            ? formatDateTimeLocalValue(selectedOvernightCheckOutDateTime)
            : null,
      };

      const res = await api.post("/bookings", payload);
      const bookingCode = res.data?.data?.booking_code || "-";

      setBookingForm({
        check_in: "",
        overnight_end_date: "",
      });

      setBookingSuccess({
        open: true,
        bookingCode,
      });
    } catch (error) {
      console.error("SUBMIT BOOKING ERROR:", error.response?.data || error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.check_in?.[0] ||
        error.response?.data?.errors?.check_out?.[0] ||
        error.response?.data?.errors?.user_id?.[0] ||
        "Booking gagal dibuat. Silakan coba lagi.";

      setBookingError(message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-40 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[380px] bg-gray-200 rounded-3xl" />
              <div className="space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded-xl" />
                <div className="h-5 w-40 bg-gray-200 rounded-xl" />
                <div className="h-24 w-full bg-gray-200 rounded-xl" />
                <div className="h-14 w-full bg-gray-200 rounded-2xl" />
                <div className="h-32 w-full bg-gray-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Detail kamar tidak ditemukan
            </h1>
            <p className="text-gray-500 mb-6">
              Data kamar belum tersedia atau sudah tidak aktif.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .readyroom-datepicker-inline {
          width: 100% !important;
        }

        .readyroom-datepicker-inline .react-datepicker {
          width: 100% !important;
          border: 1px solid #fecaca !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          box-shadow: 0 24px 60px rgba(239, 68, 68, 0.12) !important;
          font-family: inherit !important;
          background: #ffffff !important;
        }

        .readyroom-datepicker-inline .react-datepicker__month-container {
          float: none !important;
          width: 100% !important;
        }

        .readyroom-datepicker-inline .react-datepicker__header {
          background: linear-gradient(135deg, #dc2626 0%, #f43f5e 100%) !important;
          border-bottom: none !important;
          padding-top: 16px !important;
          padding-bottom: 14px !important;
        }

        .readyroom-datepicker-inline .react-datepicker__current-month,
        .readyroom-datepicker-inline .react-datepicker-year-header {
          color: #ffffff !important;
          font-weight: 800 !important;
          font-size: 15px !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day-names {
          margin-top: 8px !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.92) !important;
          font-weight: 700 !important;
          width: 2.2rem !important;
          line-height: 2.2rem !important;
          margin: 0.2rem !important;
        }

        .readyroom-datepicker-inline .react-datepicker__navigation {
          top: 14px !important;
        }

        .readyroom-datepicker-inline .react-datepicker__navigation-icon::before {
          border-color: #ffffff !important;
          border-width: 2px 2px 0 0 !important;
        }

        .readyroom-datepicker-inline .react-datepicker__month {
          margin: 0 !important;
          padding: 16px 14px 18px !important;
        }

        .readyroom-datepicker-inline .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day {
          width: 2.35rem !important;
          line-height: 2.35rem !important;
          margin: 0.16rem !important;
          border-radius: 14px !important;
          color: #1f2937 !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day:hover {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day--today {
          background: #fff1f2 !important;
          color: #dc2626 !important;
          font-weight: 800 !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day--selected,
        .readyroom-datepicker-inline .react-datepicker__day--keyboard-selected,
        .readyroom-datepicker-inline .react-datepicker__day--range-start,
        .readyroom-datepicker-inline .react-datepicker__day--range-end {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: #ffffff !important;
          font-weight: 800 !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day--in-range {
          background: #fee2e2 !important;
          color: #dc2626 !important;
          font-weight: 700 !important;
        }

        .readyroom-datepicker-inline .react-datepicker__day--outside-month {
          color: #cbd5e1 !important;
        }

        .readyroom-time-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .readyroom-time-scroll::-webkit-scrollbar-thumb {
          background: #fecaca;
          border-radius: 999px;
        }

        .readyroom-time-scroll::-webkit-scrollbar-track {
          background: #fff5f5;
        }
      `}</style>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
                <img
                  src={activeImage || "/images/hotel.jpg"}
                  alt={room.name}
                  onError={(e) => {
                    e.currentTarget.src = "/images/hotel.jpg";
                  }}
                  className="w-full h-[380px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-lg backdrop-blur hover:bg-white transition"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-lg backdrop-blur hover:bg-white transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`dot-${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`h-2.5 rounded-full transition-all ${
                          activeImage === image
                            ? "w-7 bg-white shadow"
                            : "w-2.5 bg-white/60 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      activeImage === image
                        ? "border-red-500 shadow-lg scale-[1.02]"
                        : "border-transparent hover:border-red-200 hover:shadow-md"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = "/images/hotel.jpg";
                      }}
                      className="w-full h-24 object-cover"
                    />

                    {activeImage === image && (
                      <div className="absolute inset-0 ring-2 ring-red-500 rounded-2xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 mb-4">
                <BedDouble size={16} />
                Detail Kamar
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {room.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
                <div className="inline-flex items-center gap-2">
                  <Building2 size={16} className="text-red-500" />
                  {room.hotel?.name || "-"}
                </div>

                <div className="inline-flex items-center gap-2">
                  <Users size={16} className="text-red-500" />
                  Kapasitas {room.capacity || 0} orang
                </div>

                <div className="inline-flex items-center gap-2">
                  <Hotel size={16} className="text-red-500" />
                  {room.type || "Room"}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Pilih Tipe Booking
                </h2>

                <div className="relative w-full rounded-2xl bg-gray-100 p-1 flex">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-2xl bg-red-600 transition-all duration-300 ${
                      bookingMode === "transit" ? "left-1" : "left-1/2"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setBookingMode("transit")}
                    className={`relative z-10 w-1/2 rounded-2xl py-3 text-sm font-semibold transition ${
                      bookingMode === "transit" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Transit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode("overnight")}
                    className={`relative z-10 w-1/2 rounded-2xl py-3 text-sm font-semibold transition ${
                      bookingMode === "overnight"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    Full Day
                  </button>
                </div>

                {bookingMode === "transit" && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-3">
                      {["3", "6", "12"].map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setTransitDuration(hour)}
                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                            transitDuration === hour
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {hour} Jam
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <Clock3 size={16} className="text-red-500" />
                      Pilih durasi transit yang kamu butuhkan
                    </div>
                  </div>
                )}

                {bookingMode === "overnight" && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <MoonStar size={16} className="mt-0.5 shrink-0" />
                    <p>
                      Untuk booking full day, check-in hanya bisa mulai pukul
                      14.00 dan checkout tetap mengikuti aturan hotel maksimal
                      pukul 12.00 siang. Sekarang kamu juga bisa pilih lebih dari
                      1 hari.
                    </p>
                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    Harga{" "}
                    {bookingMode === "transit"
                      ? `Transit ${transitDuration} Jam`
                      : `Full Day ${overnightDurationDays} Hari`}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatRupiah(mainPrice)}
                  </p>

                  {bookingMode === "overnight" && (
                    <p className="mt-2 text-xs text-gray-500">
                      {formatRupiah(overnightUnitPrice)} x {overnightDurationDays}{" "}
                      hari
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Pilih Tanggal & Jam Booking
                    </h2>
                    <p className="text-sm text-gray-500">
                      Pilih jadwal booking sebelum lanjut ke reservasi
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
                  <div className="rounded-[24px] border border-red-100 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-red-50 bg-gradient-to-r from-red-50 to-rose-50">
                      <h3 className="font-semibold text-gray-800">
                        {bookingMode === "transit"
                          ? "Tanggal Check-in"
                          : "Tanggal Check-in & Checkout"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {bookingMode === "transit"
                          ? "Pilih tanggal booking yang kamu inginkan"
                          : "Pilih range tanggal untuk full day"}
                      </p>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="readyroom-datepicker-inline">
                        {bookingMode === "transit" ? (
                          <DatePicker
                            selected={selectedCheckInDate}
                            onChange={handleCheckInDateChange}
                            minDate={new Date()}
                            inline
                            calendarClassName="readyroom-datepicker-inline"
                          />
                        ) : (
                          <DatePicker
                            selected={selectedCheckInDate}
                            startDate={selectedCheckInDate}
                            endDate={selectedOvernightEndDate}
                            onChange={handleOvernightRangeChange}
                            minDate={new Date()}
                            selectsRange
                            monthsShown={2}
                            inline
                            calendarClassName="readyroom-datepicker-inline"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-red-100 bg-white p-4">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Waktu Check-in
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Pilih jam tanpa popup tambahan
                      </p>

                      {!selectedCheckInDate && (
                        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          Silakan pilih tanggal terlebih dahulu sebelum pilih jam.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-red-500">
                            Pilih Jam
                          </label>
                          <div className="readyroom-time-scroll h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-2">
                            <div className="grid grid-cols-2 gap-2">
                              {hourOptions.map((hour) => {
                                const isDisabledHour =
                                  isFullDayMode &&
                                  Number(hour) < FULL_DAY_MIN_HOUR;

                                return (
                                  <button
                                    key={hour}
                                    type="button"
                                    disabled={isDisabledHour}
                                    onClick={() =>
                                      updateCheckInTimePart("hour", hour)
                                    }
                                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                      isDisabledHour
                                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                        : selectedHour === hour
                                        ? "bg-red-600 text-white shadow"
                                        : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    }`}
                                  >
                                    {hour}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {isFullDayMode && (
                            <p className="mt-2 text-xs text-gray-500">
                              Untuk full day, jam 00:00–13:55 tidak bisa dipilih.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-red-500">
                            Pilih Menit
                          </label>
                          <div className="readyroom-time-scroll h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-2">
                            <div className="grid grid-cols-2 gap-2">
                              {minuteOptions.map((minute) => (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() =>
                                    updateCheckInTimePart("minute", minute)
                                  }
                                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                    selectedMinute === minute
                                      ? "bg-red-600 text-white shadow"
                                      : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600"
                                  }`}
                                >
                                  {minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {bookingMode === "overnight" && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                          <p className="text-xs font-semibold text-red-600 mb-1">
                            Checkout Minimum Otomatis
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {overnightMinimumCheckoutDate
                              ? overnightMinimumCheckoutDate.toLocaleString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "-"}
                          </p>
                        </div>
                      )}

                      {bookingMode === "overnight" && (
                        <div className="mt-4">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-red-500">
                            Tanggal Checkout
                          </label>
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <DatePicker
                              selected={selectedOvernightEndDate}
                              onChange={handleOvernightEndDateChange}
                              minDate={overnightMinimumCheckoutDateOnly || new Date()}
                              dateFormat="dd MMM yyyy"
                              placeholderText="Pilih tanggal checkout"
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-red-300"
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Jam checkout tetap mengikuti aturan hotel: 12.00 siang.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          Check-in Dipilih
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedCheckInDate
                            ? selectedCheckInDate.toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>

                      {bookingMode === "overnight" && (
                        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Checkout Dipilih
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {selectedOvernightCheckOutDateTime
                              ? selectedOvernightCheckOutDateTime.toLocaleString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "-"}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-medium text-amber-800">
                          Estimasi checkout:{" "}
                          <span className="font-bold">
                            {estimatedCheckOutText}
                          </span>
                        </p>
                      </div>

                      {bookingMode === "overnight" && (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                          <p className="text-sm font-medium text-emerald-800">
                            Total durasi full day:{" "}
                            <span className="font-bold">
                              {overnightDurationDays} hari
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isCustomerLoggedIn ? (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                      <p className="text-sm text-red-600 font-semibold mb-1">
                        Ringkasan Pilihan
                      </p>
                      <p className="font-bold text-gray-800">{room.name}</p>
                      <p className="text-sm text-gray-600">
                        {bookingLabelText} • {formatRupiah(mainPrice)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                      <div className="flex gap-3">
                        <ShieldCheck
                          className="text-emerald-600 mt-0.5 shrink-0"
                          size={18}
                        />
                        <p className="text-sm text-gray-700">
                          Booking akan masuk sebagai <b>pending</b> dan menunggu
                          admin.
                        </p>
                      </div>
                    </div>

                    {bookingError && (
                      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-600"
                          />
                          <p className="text-sm text-red-700">{bookingError}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleSubmitBooking}
                        disabled={submittingBooking}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-white font-semibold hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submittingBooking ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Memproses Booking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Konfirmasi Booking
                          </>
                        )}
                      </button>

                      {waAdminLink ? (
                        <a
                          href={waAdminLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 font-semibold hover:bg-green-100 transition"
                        >
                          <MessageCircle size={18} />
                          Chat WhatsApp Admin
                        </a>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-400 font-semibold">
                          <MessageCircle size={18} />
                          WhatsApp Admin Belum Tersedia
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/60 p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        Reservasi manual tanpa login
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-5">
                        Isi nama dan nomor WhatsApp, lalu kirim reservasi manual ke
                        admin hotel. Admin akan follow up semua konfirmasi lewat
                        WhatsApp.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-red-600">
                            Nama Tamu
                          </label>
                          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5">
                            <User size={18} className="text-gray-400" />
                            <input
                              type="text"
                              name="guest_name"
                              value={guestForm.guest_name}
                              onChange={handleGuestInputChange}
                              placeholder="Masukkan nama tamu"
                              className="w-full bg-transparent text-gray-800 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-red-600">
                            No. WhatsApp
                          </label>
                          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5">
                            <Phone size={18} className="text-gray-400" />
                            <input
                              type="text"
                              name="guest_phone"
                              value={guestForm.guest_phone}
                              onChange={handleGuestInputChange}
                              placeholder="08xxxx / 628xxxx"
                              className="w-full bg-transparent text-gray-800 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {guestError && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle
                              size={18}
                              className="mt-0.5 shrink-0 text-red-600"
                            />
                            <p className="text-sm text-red-700">{guestError}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handleManualGuestBooking}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3.5 text-white font-semibold hover:bg-green-700 transition"
                        >
                          <MessageCircle size={18} />
                          Reservasi Manual via WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3.5 text-red-600 font-semibold hover:bg-red-50 transition"
                        >
                          <LogIn size={18} />
                          Login Jika Mau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Deskripsi Kamar
                    </h2>
                    <p className="text-sm text-gray-500">
                      Informasi singkat mengenai kamar
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {room.description || "Deskripsi kamar belum tersedia."}
                </p>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Semua reservasi tetap akan ditindaklanjuti admin terlebih dahulu.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {bookingSuccess.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg">
              <CheckCircle2 size={36} />
            </div>

            <div className="mt-6 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                Booking Berhasil Dibuat
              </p>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight mt-5">
                Yeay, pesananmu berhasil masuk
              </h2>

              <p className="mt-3 text-gray-500 leading-relaxed">
                Booking kamu sudah berhasil dibuat dan sekarang sedang
                menunggu persetujuan admin ReadyRoom.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-5">
              <p className="text-sm text-red-600 font-semibold mb-2">
                Kode Booking Kamu
              </p>
              <p className="text-2xl font-extrabold tracking-wide text-gray-800">
                {bookingSuccess.bookingCode || "-"}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Simpan kode ini ya, nanti bisa dipakai untuk konfirmasi ke hotel
                saat booking sudah disetujui.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Sambil menunggu approval admin
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yuk cek booking kamu di halaman daftar booking customer.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  closeSuccessModal();
                  navigate("/");
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-white font-semibold hover:bg-red-700 transition"
              >
                <Home size={18} />
                Kembali ke Beranda
              </button>

              <button
                type="button"
                onClick={() => {
                  closeSuccessModal();
                  navigate("/my-bookings");
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                <FileText size={18} />
                Lihat My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}