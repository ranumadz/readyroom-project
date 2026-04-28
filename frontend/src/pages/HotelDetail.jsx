import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Images,
  MapPin,
  MessageCircle,
  Users,
  X,
  BadgeCheck,
  MoonStar,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const roomsRef = useRef(null);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [roomsVisible, setRoomsVisible] = useState(false);

  useEffect(() => {
    fetchHotelDetailAndRooms();
  }, [id]);

  useEffect(() => {
    if (hotel) {
      saveRecentViewedHotel(hotel);
      setActiveImageIndex(0);
    }
  }, [hotel]);

  useEffect(() => {
    if (!roomsRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRoomsVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "-90px 0px -45% 0px",
      }
    );

    observer.observe(roomsRef.current);

    return () => observer.disconnect();
  }, [loading, rooms.length]);

  const fetchHotelDetailAndRooms = async () => {
    try {
      setLoading(true);

      const [hotelRes, roomsRes] = await Promise.all([
        api.get(`/hotels/${id}`),
        api.get(`/hotels/${id}/rooms`),
      ]);

      setHotel(hotelRes.data?.data || null);
      setRooms(Array.isArray(roomsRes.data?.data) ? roomsRes.data.data : []);
    } catch (error) {
      console.error("GET HOTEL DETAIL / ROOMS ERROR:", error.response?.data || error);
      setHotel(null);
      setRooms([]);
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
    if (cleanPath.startsWith("images/")) return `/${cleanPath}`;
    if (cleanPath.startsWith("storage/")) return `${BACKEND_BASE_URL}/${cleanPath}`;

    return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoomLowestPrice = (room) => {
    const prices = [
      room.price_transit_3h,
      room.price_transit_6h,
      room.price_transit_12h,
      room.price_per_night,
    ]
      .map((price) => Number(price || 0))
      .filter((price) => price > 0);

    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const priceA = getRoomLowestPrice(a);
      const priceB = getRoomLowestPrice(b);

      if (priceA === 0 && priceB === 0) return 0;
      if (priceA === 0) return 1;
      if (priceB === 0) return -1;

      return priceA - priceB;
    });
  }, [rooms]);

  const cheapestRoom = sortedRooms[0] || null;
  const cheapestPrice = cheapestRoom ? getRoomLowestPrice(cheapestRoom) : 0;

  const galleryImages = useMemo(() => {
    if (!hotel) return ["/images/hotel.jpg"];

    const list = [];

    if (hotel.hero_image) {
      list.push(buildImageUrl(hotel.hero_image, "/images/hotel.jpg"));
    }

    if (hotel.thumbnail) {
      const thumbnailUrl = buildImageUrl(hotel.thumbnail, "/images/hotel.jpg");
      if (!list.includes(thumbnailUrl)) list.push(thumbnailUrl);
    }

    if (Array.isArray(hotel.images)) {
      hotel.images.forEach((img) => {
        const imagePath =
          img?.image || img?.path || img?.url || img?.image_path || null;

        if (!imagePath) return;

        const imageUrl = buildImageUrl(imagePath, "/images/hotel.jpg");
        if (!list.includes(imageUrl)) list.push(imageUrl);
      });
    }

    return list.length > 0 ? list : ["/images/hotel.jpg"];
  }, [hotel]);

  const activeImage =
    galleryImages[activeImageIndex] || galleryImages[0] || "/images/hotel.jpg";

  const desktopGalleryImages = useMemo(() => {
    const base = galleryImages.slice(0, 7);
    while (base.length < 7) base.push(galleryImages[0] || "/images/hotel.jpg");
    return base;
  }, [galleryImages]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleScrollToRooms = () => {
    roomsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getFacilityLabel = (facility) => {
    return facility?.name || "Fasilitas";
  };

  const getRoomImage = (room) => {
    return (
      room.thumbnail ||
      room.image ||
      room.images?.[0]?.image_path ||
      room.images?.[0]?.image ||
      hotel?.thumbnail ||
      hotel?.hero_image
    );
  };

  const getCustomerStorageKey = () => {
    try {
      const rawCustomer =
        localStorage.getItem("customer") ||
        localStorage.getItem("customerUser") ||
        localStorage.getItem("user");

      if (!rawCustomer) return "readyroom_recent_hotels_guest";

      const parsedCustomer = JSON.parse(rawCustomer);
      const customerId = parsedCustomer?.id || "guest";

      return `readyroom_recent_hotels_${customerId}`;
    } catch (error) {
      console.error("GET CUSTOMER STORAGE KEY ERROR:", error);
      return "readyroom_recent_hotels_guest";
    }
  };

  const saveRecentViewedHotel = (hotelData) => {
    try {
      if (!hotelData?.id) return;

      const storageKey = getCustomerStorageKey();
      const existingRecent = JSON.parse(localStorage.getItem(storageKey) || "[]");

      const hotelItem = {
        id: hotelData.id,
        name: hotelData.name || "",
        area: hotelData.area || "",
        address: hotelData.address || "",
        rating: hotelData.rating || 0,
        city: hotelData.city || null,
        thumbnail: hotelData.thumbnail || "",
        hero_image: hotelData.hero_image || "",
        facilities: Array.isArray(hotelData.facilities) ? hotelData.facilities : [],
        viewed_at: new Date().toISOString(),
      };

      const filteredRecent = existingRecent.filter(
        (item) => Number(item.id) !== Number(hotelData.id)
      );

      const updatedRecent = [hotelItem, ...filteredRecent].slice(0, 6);
      localStorage.setItem(storageKey, JSON.stringify(updatedRecent));
    } catch (error) {
      console.error("SAVE RECENT VIEWED HOTEL ERROR:", error);
    }
  };

  const mapLink =
    hotel?.map_link && String(hotel.map_link).trim() !== ""
      ? String(hotel.map_link).trim()
      : null;

  const hotelAddress =
    hotel?.address && String(hotel.address).trim() !== ""
      ? String(hotel.address).trim()
      : null;

  const hasCoordinates = Boolean(hotel?.latitude && hotel?.longitude);

  const googleMapsUrl = mapLink
    ? mapLink
    : hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${hotel.latitude},${hotel.longitude}`
      )}`
    : hotelAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(hotelAddress)}`
    : null;

  const embedMapUrl = hotelAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        hotelAddress
      )}&z=15&output=embed`
    : hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${hotel.latitude},${hotel.longitude}`
      )}&z=15&output=embed`
    : null;

  const waAdminLink = useMemo(() => {
    const rawWa = String(hotel?.wa_admin || "").replace(/\D/g, "");
    if (!rawWa) return null;

    const normalizedWa = rawWa.startsWith("0")
      ? `62${rawWa.slice(1)}`
      : rawWa;

    const text = `Halo Admin ${hotel?.name || "Hotel"}, saya ingin bertanya tentang reservasi kamar di hotel ini. Mohon info lebih lanjut ya.`;

    return `https://wa.me/${normalizedWa}?text=${encodeURIComponent(text)}`;
  }, [hotel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] text-gray-800">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="h-[360px] w-full bg-gray-200" />
            <div className="space-y-4 p-8">
              <div className="h-6 w-32 rounded bg-gray-200" />
              <div className="h-10 w-80 rounded bg-gray-200" />
              <div className="h-5 w-60 rounded bg-gray-200" />
              <div className="h-24 w-full rounded bg-gray-200" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] text-gray-800">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-bold text-gray-800">
              Hotel tidak ditemukan
            </h1>
            <p className="mb-6 text-gray-500">
              Data hotel yang kamu cari belum tersedia atau sudah tidak aktif.
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <ArrowLeft size={18} />
              Kembali ke Beranda
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-24 text-gray-800 md:pb-0">
      <Navbar />

      <section className="bg-white pt-24 md:pt-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <ArrowLeft size={17} />
              Kembali
            </button>

            <Link
              to="/hotels"
              className="hidden text-sm font-semibold text-red-600 hover:underline md:block"
            >
              Lihat properti lain
            </Link>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
              {hotel.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 md:text-base">
              <MapPin size={17} className="text-red-500" />
              <span>
                {hotel.city?.name || "-"}
                {hotel.area ? ` • ${hotel.area}` : ""}
              </span>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-[1.35rem] bg-gray-100 md:grid md:h-[430px] md:grid-cols-[1.1fr_1.55fr] md:gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveImageIndex(0);
                setShowGalleryModal(true);
              }}
              className="group relative overflow-hidden bg-gray-200 text-left"
            >
              <img
                src={desktopGalleryImages[0]}
                alt={hotel.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/hotel.jpg";
                }}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />

              <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-xl">
                <Images size={17} />
                Lihat semua foto
              </div>
            </button>

            <div className="grid grid-cols-3 grid-rows-2 gap-2">
              {desktopGalleryImages.slice(1, 7).map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(index + 1);
                    setShowGalleryModal(true);
                  }}
                  className="group relative overflow-hidden bg-gray-200"
                >
                  <img
                    src={image}
                    alt={`${hotel.name} ${index + 2}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />

                  {index === 5 && galleryImages.length > 7 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">
                      +{galleryImages.length - 7} Foto
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowGalleryModal(true)}
              className="relative overflow-hidden rounded-[1.25rem] bg-gray-100"
            >
              <img
                src={activeImage}
                alt={hotel.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/hotel.jpg";
                }}
                className="h-[270px] w-full object-cover"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                {activeImageIndex + 1}/{galleryImages.length}
              </div>
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    activeImageIndex === index
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${hotel.name} ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5 md:p-7">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                  Deskripsi Hotel
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {hotel.description || "Deskripsi hotel belum tersedia."}
                </p>
              </div>

              <div className="p-5 md:p-7">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                  Fasilitas Hotel
                </h2>

                {Array.isArray(hotel.facilities) && hotel.facilities.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hotel.facilities.map((facility) => (
                      <span
                        key={facility.id}
                        className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600"
                      >
                        {getFacilityLabel(facility)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-gray-500">
                    Fasilitas hotel belum tersedia untuk ditampilkan saat ini.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm md:p-7">
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Alamat Hotel</p>
                    <p className="mt-1 leading-relaxed text-gray-600">
                      {hotel.address || "Alamat hotel belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>

              {embedMapUrl ? (
                <>
                  <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-gray-100 md:h-[380px]">
                    <iframe
                      title={`Map ${hotel.name}`}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      src={embedMapUrl}
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full"
                    />
                  </div>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                    >
                      <MapPin size={18} />
                      Buka di Google Maps
                    </a>
                  )}
                </>
              ) : googleMapsUrl ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <p className="leading-relaxed text-gray-600">
                    Peta embed belum tersedia, tapi lokasi hotel sudah bisa dibuka
                    langsung lewat Google Maps.
                  </p>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                  >
                    <MapPin size={18} />
                    Buka di Google Maps
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                  Lokasi hotel belum tersedia.
                </div>
              )}
            </div>

            <div
              ref={roomsRef}
              className="scroll-mt-24 rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm md:p-7"
            >
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <BedDouble size={14} />
                    Pilihan Kamar
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                    Pilih kamar sesuai kebutuhanmu
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Kamar termurah otomatis berada di urutan pertama.
                  </p>
                </div>

                {cheapestPrice > 0 && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs font-semibold text-red-600">
                      Mulai dari
                    </p>
                    <p className="text-xl font-extrabold text-red-600">
                      {formatRupiah(cheapestPrice)}
                    </p>
                  </div>
                )}
              </div>

              {sortedRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                  Belum ada kamar tersedia untuk hotel ini.
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5">
                  {sortedRooms.map((room, index) => {
                    const lowestPrice = getRoomLowestPrice(room);

                    return (
                      <div
                        key={room.id}
                        className="overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:rounded-[1.7rem]"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
                          <div className="relative min-h-[210px] bg-gray-100 md:min-h-[260px]">
                            <img
                              src={buildImageUrl(getRoomImage(room), "/images/hotel.jpg")}
                              alt={room.name}
                              onError={(e) => {
                                e.currentTarget.src = "/images/hotel.jpg";
                              }}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

                            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-red-600 shadow">
                              <BedDouble size={14} />
                              {room.type || "Room"}
                            </div>

                            {index === 0 && (
                              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                <BadgeCheck size={13} />
                                Termurah di hotel ini
                              </div>
                            )}
                          </div>

                          <div className="p-4 md:p-5">
                            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="text-lg font-extrabold leading-tight text-gray-900 md:text-2xl">
                                  {room.name}
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                                  {room.description ||
                                    "Kamar nyaman untuk kebutuhan transit maupun menginap."}
                                </p>
                              </div>

                              {index === 0 && (
                                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                                  Rekomendasi Hemat
                                </span>
                              )}
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold md:text-sm">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-gray-600">
                                <Users size={15} className="text-red-500" />
                                Kapasitas {room.capacity || 0} orang
                              </span>

                              {Number(room.price_transit_3h || 0) > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-red-600">
                                  <Clock3 size={15} />
                                  Transit
                                </span>
                              )}

                              {Number(room.price_per_night || 0) > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-2 text-indigo-600">
                                  <MoonStar size={15} />
                                  Full Day
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                              <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3">
                                <p className="text-[10px] font-bold uppercase text-red-500">
                                  Transit 3 Jam
                                </p>
                                <p className="mt-1 text-sm font-extrabold text-red-700">
                                  {Number(room.price_transit_3h || 0) > 0
                                    ? formatRupiah(room.price_transit_3h)
                                    : "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-3">
                                <p className="text-[10px] font-bold uppercase text-orange-500">
                                  Transit 6 Jam
                                </p>
                                <p className="mt-1 text-sm font-extrabold text-orange-700">
                                  {Number(room.price_transit_6h || 0) > 0
                                    ? formatRupiah(room.price_transit_6h)
                                    : "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3">
                                <p className="text-[10px] font-bold uppercase text-amber-600">
                                  Transit 12 Jam
                                </p>
                                <p className="mt-1 text-sm font-extrabold text-amber-700">
                                  {Number(room.price_transit_12h || 0) > 0
                                    ? formatRupiah(room.price_transit_12h)
                                    : "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                                <p className="text-[10px] font-bold uppercase text-emerald-600">
                                  Full Day
                                </p>
                                <p className="mt-1 text-sm font-extrabold text-emerald-700">
                                  {Number(room.price_per_night || 0) > 0
                                    ? formatRupiah(room.price_per_night)
                                    : "-"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-gray-500">
                                  Mulai dari
                                </p>
                                <p className="text-2xl font-extrabold text-red-600">
                                  {lowestPrice > 0
                                    ? formatRupiah(lowestPrice)
                                    : "Hubungi admin"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/rooms/${room.id}`);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                              >
                                Pilih / Detail Kamar
                                <ArrowRight size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Butuh Bantuan Reservasi?
                  </h3>
                  <p className="text-sm text-gray-500">
                    Hubungi admin hotel untuk info lebih lanjut
                  </p>
                </div>
              </div>

              {waAdminLink ? (
                <>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Untuk pertanyaan ketersediaan kamar, reservasi manual, atau
                    bantuan cepat, kamu bisa langsung menghubungi admin hotel ini
                    melalui WhatsApp.
                  </p>

                  <a
                    href={waAdminLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle size={18} />
                    Chat WhatsApp Admin
                  </a>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                  Kontak admin hotel belum tersedia saat ini.
                </div>
              )}
            </div>

            <Link
              to="/hotels"
              className="block rounded-2xl bg-gray-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-black"
            >
              Kembali ke Semua Hotel
            </Link>
          </div>
        </div>
      </section>

      {!roomsVisible && sortedRooms.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-gray-100 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Mulai dari
              </p>
              <p className="text-lg font-extrabold leading-tight text-red-600">
                {cheapestPrice > 0 ? formatRupiah(cheapestPrice) : "Hubungi admin"}
              </p>
              {cheapestRoom?.name && (
                <p className="line-clamp-1 text-[11px] font-medium text-gray-500">
                  {cheapestRoom.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleScrollToRooms}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
            >
              Lihat kamar
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 p-4 text-white">
          <button
            type="button"
            onClick={() => setShowGalleryModal(false)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            type="button"
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ChevronRight size={28} />
          </button>

          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-sm font-semibold text-white/80">
              {activeImageIndex + 1} / {galleryImages.length}
            </div>

            <img
              src={activeImage}
              alt={`${hotel.name} preview`}
              onError={(e) => {
                e.currentTarget.src = "/images/hotel.jpg";
              }}
              className="max-h-[78vh] max-w-full rounded-2xl object-contain"
            />

            <div className="flex max-w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    activeImageIndex === index
                      ? "border-red-500"
                      : "border-white/20"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${hotel.name} ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}