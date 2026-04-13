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
  UserPlus,
  MessageCircle,
  ShieldCheck,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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

    return `/storage/${cleanPath}`;
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
    if (!selectedCheckInDate) {
      setBookingError("Pilih tanggal terlebih dahulu.");
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
        .readyroom-datepicker-inline .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: #ffffff !important;
          font-weight: 800 !important;
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
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Pilih Tanggal & Jam Booking
                    </h2>
                    <p className="text-sm text-gray-500">
                      Tanggal ada di bawah harga dan booking langsung tanpa modal
                    </p>
                  </div>
                </div>

                {isCustomerLoggedIn ? (
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                      <p className="text-sm text-red-600 font-semibold mb-1">
                        Ringkasan Pilihan
                      </p>
                      <p className="font-bold text-gray-800">{room.name}</p>
                      <p className="text-sm text-gray-600">
                        {bookingMode === "transit"
                          ? `Transit ${transitDuration} Jam`
                          : "Overnight"}{" "}
                        • {formatRupiah(mainPrice)}
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

                    <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
                      <div className="rounded-[24px] border border-red-100 bg-white overflow-hidden">
                        <div className="px-4 py-3 border-b border-red-50 bg-gradient-to-r from-red-50 to-rose-50">
                          <h3 className="font-semibold text-gray-800">
                            Tanggal Check-in
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Pilih tanggal booking yang kamu inginkan
                          </p>
                        </div>

                        <div className="p-3 sm:p-4">
                          <div className="readyroom-datepicker-inline">
                            <DatePicker
                              selected={selectedCheckInDate}
                              onChange={handleCheckInDateChange}
                              minDate={new Date()}
                              inline
                              calendarClassName="readyroom-datepicker-inline"
                            />
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
                                  {hourOptions.map((hour) => (
                                    <button
                                      key={hour}
                                      type="button"
                                      onClick={() =>
                                        updateCheckInTimePart("hour", hour)
                                      }
                                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                        selectedHour === hour
                                          ? "bg-red-600 text-white shadow"
                                          : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600"
                                      }`}
                                    >
                                      {hour}
                                    </button>
                                  ))}
                                </div>
                              </div>
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

                          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-medium text-amber-800">
                              Estimasi checkout:{" "}
                              <span className="font-bold">
                                {estimatedCheckOutText}
                              </span>
                            </p>
                          </div>
                        </div>
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
                  <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/60 p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Login dulu untuk lanjut booking
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Supaya kamu bisa memilih tanggal, jam check-in, dan
                      mengirim booking ke admin hotel, silakan login atau buat
                      akun terlebih dahulu.
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-white font-semibold hover:bg-red-700 transition"
                      >
                        <LogIn size={18} />
                        Login Sekarang
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3.5 text-red-600 font-semibold hover:bg-red-50 transition"
                      >
                        <UserPlus size={18} />
                        Buat Akun
                      </button>
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

              <p className="text-xs text-gray-400 mt-4 text-center">
                Booking tetap akan masuk ke admin terlebih dahulu untuk proses
                approval.
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