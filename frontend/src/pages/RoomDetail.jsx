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
  X,
  LogIn,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Home,
  AlertCircle,
} from "lucide-react";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [bookingMode, setBookingMode] = useState("transit");
  const [transitDuration, setTransitDuration] = useState("3");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    check_in: "",
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState({
    open: false,
    bookingCode: "",
  });
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    fetchRoomDetail();
    detectCustomerLogin();
  }, [id]);

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
      return `http://127.0.0.1:8000/${cleanPath}`;
    }

    return `http://127.0.0.1:8000/storage/${cleanPath}`;
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

  const selectedCheckInDate = useMemo(() => {
    return bookingForm.check_in
      ? parseDateTimeLocalValue(bookingForm.check_in)
      : null;
  }, [bookingForm.check_in]);

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

  const updateCheckInTimePart = (type, value) => {
    if (!selectedCheckInDate) return;

    const nextDate = new Date(selectedCheckInDate);

    if (type === "hour") {
      nextDate.setHours(Number(value));
    }

    if (type === "minute") {
      nextDate.setMinutes(Number(value));
    }

    nextDate.setSeconds(0, 0);

    setBookingForm((prev) => ({
      ...prev,
      check_in: formatDateTimeLocalValue(nextDate),
    }));

    setBookingError("");
  };

  const estimatedCheckOutText = useMemo(() => {
    if (!selectedCheckInDate) return "-";

    const checkIn = new Date(selectedCheckInDate);
    const checkOut = new Date(checkIn);

    if (bookingMode === "transit") {
      checkOut.setHours(checkOut.getHours() + Number(transitDuration || 0));
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
  }, [selectedCheckInDate, bookingMode, transitDuration]);

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
      }));
      setBookingError("");
      return;
    }

    const nextDate = new Date(date);

    if (!selectedCheckInDate) {
      nextDate.setHours(12, 0, 0, 0);
    } else {
      nextDate.setHours(
        selectedCheckInDate.getHours(),
        selectedCheckInDate.getMinutes(),
        0,
        0
      );
    }

    setBookingForm((prev) => ({
      ...prev,
      check_in: formatDateTimeLocalValue(nextDate),
    }));
    setBookingError("");
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const transitPrice =
    transitDuration === "3"
      ? room?.price_transit_3h || 0
      : transitDuration === "6"
      ? room?.price_transit_6h || 0
      : room?.price_transit_12h || 0;

  const mainPrice =
    bookingMode === "transit"
      ? transitPrice
      : Number(room?.price_per_night || 0);

  const waAdminLink = useMemo(() => {
    const rawWa = String(room?.hotel?.wa_admin || "").replace(/\D/g, "");
    if (!rawWa) return null;

    const normalizedWa = rawWa.startsWith("0")
      ? `62${rawWa.slice(1)}`
      : rawWa;

    const bookingLabel =
      bookingMode === "transit"
        ? `Transit ${transitDuration} Jam`
        : "Overnight";

    const text = `Halo Admin ${room?.hotel?.name || "Hotel"}, saya ingin reservasi kamar.\n\nHotel: ${
      room?.hotel?.name || "-"
    }\nKamar: ${room?.name || "-"}\nTipe Booking: ${bookingLabel}\nHarga: ${formatRupiah(
      mainPrice
    )}\n\nMohon info ketersediaannya ya.`;

    return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(text)}`;
  }, [room, bookingMode, transitDuration, mainPrice]);

  const handleBookingClick = () => {
    setBookingError("");
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingError("");
  };

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

  const handleSubmitBooking = async () => {
    const userId = resolveCustomerUserId();

    if (!userId) {
      setBookingError("User login tidak terdeteksi. Silakan login ulang dulu ya.");
      return;
    }

    if (!bookingForm.check_in) {
      setBookingError("Silakan isi tanggal / jam check-in terlebih dahulu.");
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
        check_in: bookingForm.check_in,
      };

      const res = await api.post("/bookings", payload);

      const bookingCode = res.data?.data?.booking_code || "-";

      closeBookingModal();

      setBookingForm({
        check_in: "",
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
        .readyroom-datepicker-popper {
          z-index: 9999 !important;
        }

        .readyroom-datepicker-calendar {
          border: 1px solid #fecaca !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          box-shadow: 0 24px 60px rgba(239, 68, 68, 0.16) !important;
          font-family: inherit !important;
          background: #ffffff !important;
        }

        .readyroom-datepicker-calendar.react-datepicker {
          width: 100% !important;
          min-width: 100% !important;
          border: none !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__month-container {
          float: none !important;
          width: 100% !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__header {
          background: linear-gradient(135deg, #dc2626 0%, #f43f5e 100%) !important;
          border-bottom: none !important;
          padding-top: 16px !important;
          padding-bottom: 14px !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__current-month,
        .readyroom-datepicker-calendar .react-datepicker-year-header {
          color: #ffffff !important;
          font-weight: 800 !important;
          font-size: 15px !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day-names {
          margin-top: 8px !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.92) !important;
          font-weight: 700 !important;
          width: 2.2rem !important;
          line-height: 2.2rem !important;
          margin: 0.2rem !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__navigation {
          top: 14px !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__navigation-icon::before {
          border-color: #ffffff !important;
          border-width: 2px 2px 0 0 !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__month {
          margin: 0 !important;
          padding: 16px 14px 18px !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day {
          width: 2.45rem !important;
          line-height: 2.45rem !important;
          margin: 0.18rem !important;
          border-radius: 14px !important;
          color: #1f2937 !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day:hover {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day--today {
          background: #fff1f2 !important;
          color: #dc2626 !important;
          font-weight: 800 !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day--selected,
        .readyroom-datepicker-calendar .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: #ffffff !important;
          font-weight: 800 !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__day--outside-month {
          color: #cbd5e1 !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__triangle {
          display: none !important;
        }

        .readyroom-datepicker-calendar .react-datepicker__today-button {
          background: #fff1f2 !important;
          color: #dc2626 !important;
          border-top: 1px solid #ffe4e6 !important;
          font-weight: 700 !important;
          padding: 12px !important;
        }

        .readyroom-time-scroll::-webkit-scrollbar {
          width: 8px;
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
                    Overnight
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
                      Untuk booking overnight, checkout mengikuti aturan hotel
                      dan maksimal pukul 12.00 siang.
                    </p>
                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    Harga{" "}
                    {bookingMode === "transit"
                      ? `Transit ${transitDuration} Jam`
                      : "Overnight"}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatRupiah(mainPrice)}
                  </p>
                </div>
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

              <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <MoonStar size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Ringkasan Harga
                    </h2>
                    <p className="text-sm text-gray-500">
                      Perbandingan harga kamar
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transit 3 Jam</span>
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(room.price_transit_3h || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transit 6 Jam</span>
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(room.price_transit_6h || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transit 12 Jam</span>
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(room.price_transit_12h || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Overnight / per malam</span>
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(room.price_per_night || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingClick}
                className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-4 text-white font-semibold hover:bg-red-700 transition shadow-lg shadow-red-100"
              >
                Lanjut Booking
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Booking tetap akan masuk ke admin terlebih dahulu untuk proses
                approval.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-visible">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Lanjut Booking
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih cara booking yang paling nyaman untuk kamu
                </p>
              </div>

              <button
                type="button"
                onClick={closeBookingModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-4 mb-6">
                <p className="text-sm text-red-600 font-semibold mb-1">
                  Ringkasan Pilihan
                </p>
                <p className="text-gray-800 font-bold">{room.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {bookingMode === "transit"
                    ? `Transit ${transitDuration} Jam`
                    : "Overnight"}{" "}
                  • {formatRupiah(mainPrice)}
                </p>
              </div>

              {isCustomerLoggedIn ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        className="text-emerald-600 mt-0.5"
                        size={20}
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Akun customer terdeteksi
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Booking kamu tetap masuk sebagai <b>pending</b> dan
                          menunggu persetujuan admin. Riwayat transaksi akan
                          tersimpan di akun kamu.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal / Jam Check-in
                    </label>

                    <div className="relative">
                      <DatePicker
                        selected={selectedCheckInDate}
                        onChange={handleCheckInDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Pilih tanggal check-in"
                        minDate={new Date()}
                        todayButton="Hari ini"
                        isClearable
                        popperPlacement="bottom-start"
                        calendarClassName="readyroom-datepicker-calendar"
                        popperClassName="readyroom-datepicker-popper"
                        wrapperClassName="w-full"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 text-gray-800 placeholder:text-gray-400"
                      />
                      <CalendarDays
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3">
                        <p className="text-xs font-semibold text-red-600 mb-2">
                          Pilih Jam
                        </p>

                        <select
                          value={selectedHour}
                          onChange={(e) =>
                            updateCheckInTimePart("hour", e.target.value)
                          }
                          disabled={!selectedCheckInDate}
                          size={6}
                          className="readyroom-time-scroll w-full rounded-2xl border border-red-100 bg-white px-3 py-2 text-gray-800 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {hourOptions.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3">
                        <p className="text-xs font-semibold text-red-600 mb-2">
                          Pilih Menit
                        </p>

                        <select
                          value={selectedMinute}
                          onChange={(e) =>
                            updateCheckInTimePart("minute", e.target.value)
                          }
                          disabled={!selectedCheckInDate}
                          size={6}
                          className="readyroom-time-scroll w-full rounded-2xl border border-red-100 bg-white px-3 py-2 text-gray-800 outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {minuteOptions.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!selectedCheckInDate && (
                      <p className="text-xs text-amber-600 mt-3">
                        Pilih tanggal dulu, lalu pilih jam dan menit check-in.
                      </p>
                    )}

                    {selectedCheckInDate && (
                      <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-semibold text-red-600 mb-1">
                          Check-in Dipilih
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {selectedCheckInDate.toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      Pilih waktu mulai booking. Untuk transit, check-out
                      dihitung otomatis sesuai durasi. Untuk overnight, checkout
                      mengikuti aturan hotel dan maksimal pukul 12.00 siang.
                    </p>

                    <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">
                        Estimasi Check-out
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {estimatedCheckOutText}
                      </p>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className="text-red-600 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-red-700">
                            Booking belum bisa diproses
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {bookingError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSubmitBooking}
                      disabled={submittingBooking}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-white font-semibold hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Memproses Booking...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          Konfirmasi Booking
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                      <X size={18} />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="text-amber-600 mt-0.5"
                        size={20}
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Login customer dulu ya
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Supaya booking tersimpan di riwayat akun kamu dan bisa
                          diproses admin dengan lebih rapi.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-white font-semibold hover:bg-red-700 transition"
                    >
                      <LogIn size={18} />
                      Login Customer
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                      <UserPlus size={18} />
                      Daftar Akun
                    </button>
                  </div>

                  {waAdminLink && (
                    <a
                      href={waAdminLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                    >
                      <MessageCircle size={18} />
                      Tanya Admin via WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {bookingSuccess.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-[2rem] bg-white p-6 md:p-8 shadow-2xl border border-gray-100">
            <button
              type="button"
              onClick={closeSuccessModal}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-200">
              <CheckCircle2 size={38} />
            </div>

            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <Sparkles size={16} />
                Booking Berhasil
              </div>

              <h2 className="text-3xl font-extrabold text-gray-800 leading-tight mt-5">
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
                Simpan kode ini ya , nanti bisa dipakai untuk konfirmasi ke
                hotel saat booking sudah disetujui.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Sambil menunggu approval admin
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Yuk cek beranda ReadyRoom lagi untuk lihat promo menarik,
                pilihan kamar lain, atau reservasi hotel favoritmu berikutnya.
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
                  navigate("/riwayat-booking");
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                <FileText size={18} />
                Lihat Riwayat Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}