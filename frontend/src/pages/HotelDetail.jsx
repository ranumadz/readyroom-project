import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  MapPin,
  Building2,
  FileText,
  Navigation,
  MessageCircle,
  Wifi,
  Car,
  Coffee,
  Tv,
  Bath,
  Dumbbell,
  Waves,
  AirVent,
  UtensilsCrossed,
  BedDouble,
  Sparkles,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchHotelDetail();
  }, [id]);

  useEffect(() => {
    if (hotel) {
      saveRecentViewedHotel(hotel);
      setActiveImageIndex(0);
    }
  }, [hotel]);

  const fetchHotelDetail = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/hotels/${id}`);
      const hotelData = res.data?.data || null;

      setHotel(hotelData);
    } catch (error) {
      console.error("GET HOTEL DETAIL ERROR:", error.response?.data || error);
      setHotel(null);
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

  const galleryImages = useMemo(() => {
    if (!hotel) return ["/images/hotel.jpg"];

    const list = [];

    if (hotel.hero_image) {
      list.push(buildImageUrl(hotel.hero_image, "/images/hotel.jpg"));
    }

    if (hotel.thumbnail) {
      const thumbnailUrl = buildImageUrl(hotel.thumbnail, "/images/hotel.jpg");
      if (!list.includes(thumbnailUrl)) {
        list.push(thumbnailUrl);
      }
    }

    if (Array.isArray(hotel.images)) {
      hotel.images.forEach((img) => {
        const imagePath =
          img?.image || img?.path || img?.url || img?.image_path || null;

        if (!imagePath) return;

        const imageUrl = buildImageUrl(imagePath, "/images/hotel.jpg");
        if (!list.includes(imageUrl)) {
          list.push(imageUrl);
        }
      });
    }

    return list.length > 0 ? list : ["/images/hotel.jpg"];
  }, [hotel]);

  const activeImage =
    galleryImages[activeImageIndex] || galleryImages[0] || "/images/hotel.jpg";

  const previewImages = useMemo(() => {
    return galleryImages.slice(0, 5);
  }, [galleryImages]);

  const getFacilityIcon = (iconName) => {
    switch (iconName) {
      case "wifi":
        return Wifi;
      case "car":
        return Car;
      case "coffee":
        return Coffee;
      case "tv":
        return Tv;
      case "bath":
        return Bath;
      case "dumbbell":
        return Dumbbell;
      case "waves":
        return Waves;
      case "air-vent":
        return AirVent;
      case "utensils-crossed":
        return UtensilsCrossed;
      case "bed-double":
        return BedDouble;
      default:
        return Sparkles;
    }
  };

  const getFacilityLabel = (facility) => {
    return facility?.name || "Fasilitas";
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
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse">
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
      <div className="min-h-screen bg-gray-100 text-gray-800">
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
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <section className="relative">
        <div className="absolute inset-0 z-10 bg-black/40" />

        <img
          src={buildImageUrl(
            hotel.hero_image || hotel.thumbnail || galleryImages[0],
            "/images/hero.jpg"
          )}
          alt={hotel.name}
          onError={(e) => {
            e.currentTarget.src = "/images/hero.jpg";
          }}
          className="h-[340px] w-full object-cover md:h-[430px]"
        />

        <div className="absolute inset-0 z-20">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 md:px-6">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-md">
                <Building2 size={16} />
                Hotel Detail
              </div>

              <h1 className="mb-3 text-3xl font-extrabold text-white md:text-5xl">
                {hotel.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="inline-flex items-center gap-2">
                  <MapPin size={18} />
                  <span>
                    {hotel.city?.name || "-"}
                    {hotel.area ? ` • ${hotel.area}` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 mx-auto -mt-8 max-w-7xl px-4 md:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] md:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Galeri Hotel</h2>
            <p className="text-sm text-gray-500">
              Klik foto kecil untuk melihat preview besar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[22px]">
              <img
                src={activeImage}
                alt={hotel.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/hotel.jpg";
                }}
                className="h-[280px] w-full rounded-[22px] object-cover md:h-[420px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {previewImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-[18px] transition ${
                    activeImageIndex === index
                      ? "ring-2 ring-red-500"
                      : "hover:opacity-90"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${hotel.name} ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="h-[120px] w-full rounded-[18px] object-cover md:h-[198px]"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Navigation size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Lokasi, Deskripsi & Map
                  </h2>
                  <p className="text-sm text-gray-500">
                    Informasi utama hotel dalam satu bagian
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50/60 p-4">
                <div className="mb-4 flex items-start gap-3">
                  <FileText size={18} className="mt-1 shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Deskripsi Hotel</p>
                    <p className="mt-1 leading-relaxed text-gray-600">
                      {hotel.description || "Deskripsi hotel belum tersedia."}
                    </p>
                  </div>
                </div>

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
                  <div className="h-[340px] w-full overflow-hidden rounded-2xl border border-gray-100">
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

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Fasilitas Hotel
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fasilitas utama yang tersedia di hotel ini
                  </p>
                </div>
              </div>

              {Array.isArray(hotel.facilities) && hotel.facilities.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-3">
                    {hotel.facilities.map((facility) => {
                      const FacilityIcon = getFacilityIcon(facility.icon);

                      return (
                        <div
                          key={facility.id}
                          className="inline-flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                            <FacilityIcon size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-red-700">
                              {getFacilityLabel(facility)}
                            </p>
                            <p className="text-xs text-red-500">
                              {facility.icon || "facility"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-gray-500">
                    Fasilitas yang tersedia di ReadyRoom
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                  Fasilitas hotel belum tersedia untuk ditampilkan saat ini.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                className="w-full rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Lihat Kamar Hotel
              </button>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
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

      <Footer />
    </div>
  );
}