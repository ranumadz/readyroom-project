import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

    const text = `Halo Admin ${room?.hotel?.name || "Hotel"}, saya ingin reservasi kamar.\n\nHotel: ${room?.hotel?.name || "-"}\nKamar: ${room?.name || "-"}\nTipe Booking: ${bookingLabel}\nHarga: ${formatRupiah(mainPrice)}\n\nMohon info ketersediaannya ya.`;

    return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(text)}`;
  }, [room, bookingMode, transitDuration, mainPrice]);

  const handleBookingClick = () => {
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      alert("User login tidak terdeteksi. Silakan login ulang dulu ya.");
      return;
    }

    if (!bookingForm.check_in) {
      alert("Silakan isi tanggal / jam check-in terlebih dahulu.");
      return;
    }

    try {
      setSubmittingBooking(true);

      const payload = {
        user_id: userId,
        hotel_id: room.hotel_id || room.hotel?.id,
        room_id: room.id,
        booking_type: bookingMode,
        duration_hours: bookingMode === "transit" ? Number(transitDuration) : null,
        check_in: bookingForm.check_in,
      };

      const res = await api.post("/bookings", payload);

      const bookingCode = res.data?.data?.booking_code || "-";

      closeBookingModal();

      alert(
        `Booking berhasil dibuat dan menunggu persetujuan admin.\nKode Booking: ${bookingCode}`
      );

      navigate("/login");
    } catch (error) {
      console.error("SUBMIT BOOKING ERROR:", error.response?.data || error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.check_in?.[0] ||
        error.response?.data?.errors?.user_id?.[0] ||
        "Booking gagal dibuat. Silakan coba lagi.";

      alert(message);
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
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <img
                  src={activeImage || "/images/hotel.jpg"}
                  alt={room.name}
                  onError={(e) => {
                    e.currentTarget.src = "/images/hotel.jpg";
                  }}
                  className="w-full h-[380px] object-cover"
                />
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`rounded-2xl overflow-hidden border-2 transition ${
                      activeImage === image
                        ? "border-red-500"
                        : "border-transparent"
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
                      bookingMode === "overnight" ? "text-white" : "text-gray-600"
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
                className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-4 text-white font-semibold hover:bg-red-700 transition"
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
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
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
                      <ShieldCheck className="text-emerald-600 mt-0.5" size={20} />
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
                      <input
                        type="datetime-local"
                        name="check_in"
                        value={bookingForm.check_in}
                        onChange={handleBookingFormChange}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                      <CalendarDays
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Pilih waktu mulai booking. Untuk transit, check-out dihitung
                      otomatis sesuai durasi. Untuk overnight, sistem hitung +1 hari.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleSubmitBooking}
                      disabled={submittingBooking}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-70"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          Buat Booking Sekarang
                        </>
                      )}
                    </button>

                    {waAdminLink && (
                      <a
                        href={waAdminLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition"
                      >
                        <MessageCircle size={18} />
                        Reservasi via Admin
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <p className="text-sm text-gray-600">
                      Kamu belum login. Kamu bisa booking dengan akun supaya
                      riwayat transaksi tersimpan, atau reservasi manual lewat admin.
                      Semua booking tetap menunggu approval admin dulu ya.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                    >
                      <LogIn size={18} />
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-red-600 font-semibold hover:bg-red-100 transition"
                    >
                      <UserPlus size={18} />
                      Daftar
                    </button>
                  </div>

                  {waAdminLink && (
                    <a
                      href={waAdminLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition"
                    >
                      <MessageCircle size={18} />
                      Reservasi via Admin
                    </a>
                  )}

                  {!waAdminLink && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">
                      Kontak admin hotel belum tersedia untuk reservasi manual.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}