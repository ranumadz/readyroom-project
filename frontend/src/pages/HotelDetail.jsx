import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  MapPin,
  Star,
  Building2,
  FileText,
  Image as ImageIcon,
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
  ShieldCheck,
} from "lucide-react";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelDetail();
  }, [id]);

  useEffect(() => {
    if (hotel) {
      saveRecentViewedHotel(hotel);
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
      return `http://127.0.0.1:8000/${cleanPath}`;
    }

    return `/storage/${cleanPath}`;
  };

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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="w-full h-[320px] bg-gray-200" />
            <div className="p-8 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-80 bg-gray-200 rounded" />
              <div className="h-5 w-60 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded" />
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
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Hotel tidak ditemukan
            </h1>
            <p className="text-gray-500 mb-6">
              Data hotel yang kamu cari belum tersedia atau sudah tidak aktif.
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
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
        <div className="absolute inset-0 bg-black/40 z-10" />

        <img
          src={buildImageUrl(
            hotel.hero_image || hotel.thumbnail,
            "/images/hero.jpg"
          )}
          alt={hotel.name}
          onError={(e) => {
            e.currentTarget.src = "/images/hero.jpg";
          }}
          className="w-full h-[340px] md:h-[430px] object-cover"
        />

        <div className="absolute inset-0 z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex flex-col justify-end pb-10">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-white font-medium hover:bg-white/20 transition"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 mb-4 text-white text-sm">
                <Building2 size={16} />
                Hotel Detail
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
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

                <div className="inline-flex items-center gap-2">
                  <Star size={18} />
                  <span>{hotel.rating || "0.0"} / 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lokasi</h2>
                  <p className="text-sm text-gray-500">
                    Informasi area dan alamat hotel
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {hotel.address || "Alamat hotel belum tersedia."}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Deskripsi</h2>
                  <p className="text-sm text-gray-500">
                    Gambaran singkat mengenai hotel
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {hotel.description || "Deskripsi hotel belum tersedia."}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Fasilitas Hotel</h2>
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

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Navigation size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lokasi di Map</h2>
                  <p className="text-sm text-gray-500">
                    Lihat posisi hotel langsung di peta
                  </p>
                </div>
              </div>

              {embedMapUrl ? (
                <>
                  <div className="w-full h-[320px] rounded-2xl overflow-hidden border border-gray-100">
                    <iframe
                      title={`Map ${hotel.name}`}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      src={embedMapUrl}
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  </div>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 mt-4 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
                    >
                      <MapPin size={18} />
                      Buka di Google Maps
                    </a>
                  )}
                </>
              ) : googleMapsUrl ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <p className="text-gray-600 leading-relaxed">
                    Peta embed belum tersedia, tapi lokasi hotel sudah bisa dibuka
                    langsung lewat Google Maps.
                  </p>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-4 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
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
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ringkasan Hotel
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Nama Hotel</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {hotel.name}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Kota</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {hotel.city?.name || "-"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Area</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {hotel.area || "-"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {hotel.rating || "0.0"} / 5
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-emerald-600 text-right">
                    {hotel.status ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">Jumlah Fasilitas</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {Array.isArray(hotel.facilities) ? hotel.facilities.length : 0} fasilitas
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                  className="w-full rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                >
                  Lihat Kamar Hotel
                </button>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Step berikutnya kita sambungkan ke daftar kamar hotel ini.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
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
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Untuk pertanyaan ketersediaan kamar, reservasi manual, atau
                    bantuan cepat, kamu bisa langsung menghubungi admin hotel ini
                    melalui WhatsApp.
                  </p>

                  <a
                    href={waAdminLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition"
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

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Preview Gambar
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thumbnail hotel saat ini
                  </p>
                </div>
              </div>

              <img
                src={buildImageUrl(hotel.thumbnail, "/images/hotel.jpg")}
                alt={hotel.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/hotel.jpg";
                }}
                className="w-full h-56 object-cover rounded-2xl border border-gray-100"
              />
            </div>

            <Link
              to="/hotels"
              className="block text-center rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
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