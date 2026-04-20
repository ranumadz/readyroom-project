import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSearchFilter from "../components/HeroSearchFilter";
import api from "../services/api";
import {
  Building2,
  MapPin,
  Search,
  ArrowRight,
  Hotel as HotelIcon,
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
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Images,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function HotelImageSlider({ hotel, buildImageUrl }) {
  const images = useMemo(() => {
    const list = [];

    if (hotel?.thumbnail) {
      list.push(buildImageUrl(hotel.thumbnail, "/images/hotel.jpg"));
    }

    if (hotel?.hero_image) {
      const heroUrl = buildImageUrl(hotel.hero_image, "/images/hotel.jpg");
      if (!list.includes(heroUrl)) {
        list.push(heroUrl);
      }
    }

    if (Array.isArray(hotel?.images)) {
      hotel.images.forEach((img) => {
        const imagePath =
          img?.image || img?.path || img?.url || img?.image_path || null;
        const imageUrl = buildImageUrl(imagePath, "/images/hotel.jpg");

        if (imagePath && !list.includes(imageUrl)) {
          list.push(imageUrl);
        }
      });
    }

    if (list.length === 0) {
      list.push("/images/hotel.jpg");
    }

    return list;
  }, [hotel, buildImageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [hotel?.id]);

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const activeImage = images[currentIndex] || "/images/hotel.jpg";

  return (
    <div className="relative overflow-hidden rounded-t-[28px]">
      <img
        src={activeImage}
        alt={hotel?.name || "Hotel"}
        onError={(e) => {
          e.currentTarget.src = "/images/hotel.jpg";
        }}
        className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-md">
        <Building2 size={14} />
        {hotel?.area || "Hotel"}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Images size={13} />
            {currentIndex + 1}/{images.length}
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-2.5 rounded-full transition ${
                  currentIndex === index
                    ? "w-6 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Hotels() {
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const destinationFromQuery = searchParams.get("destination") || "";
  const checkInFromQuery = searchParams.get("check_in") || "";

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);

      const res = await api.get("/hotels");
      const hotelData = Array.isArray(res.data?.data) ? res.data.data : [];

      setHotels(hotelData);
    } catch (error) {
      console.error("GET HOTELS ERROR:", error.response?.data || error);
      setHotels([]);
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

  const filteredHotels = useMemo(() => {
    const keyword = destinationFromQuery.trim().toLowerCase();

    if (!keyword) return hotels;

    return hotels.filter((hotel) => {
      const name = String(hotel.name || "").toLowerCase();
      const city = String(hotel.city?.name || "").toLowerCase();
      const area = String(hotel.area || "").toLowerCase();
      const address = String(hotel.address || "").toLowerCase();

      return (
        name.includes(keyword) ||
        city.includes(keyword) ||
        area.includes(keyword) ||
        address.includes(keyword)
      );
    });
  }, [hotels, destinationFromQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff8f8] to-[#f8f8f8] text-gray-800">
      <Navbar />

      <section className="relative overflow-visible bg-gradient-to-br from-red-700 via-red-600 to-rose-600 pb-28 pt-16 text-white md:pb-36 md:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_30%)]" />

          <div className="absolute left-0 top-0 hidden select-none lg:block">
            <div className="relative h-[220px] w-[360px] -translate-x-[72px] -translate-y-[68px]">
              <div className="absolute left-0 top-0 h-[180px] w-[180px] rounded-full border-[24px] border-white/12 border-b-transparent border-r-transparent rotate-[-18deg]" />
              <div className="absolute left-[82px] top-[38px] h-[120px] w-[120px] rounded-full border-[18px] border-red-200/20 border-b-transparent border-r-transparent rotate-[-18deg]" />
              <div className="absolute left-[160px] top-[66px] h-[72px] w-[72px] rounded-full border-[12px] border-red-100/15 border-b-transparent border-r-transparent rotate-[-18deg]" />
              <div className="absolute left-[145px] top-[170px] text-[11px] font-semibold uppercase tracking-[0.5em] text-red-100/20">
                READYROOM
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 hidden select-none lg:block">
            <div className="relative h-[220px] w-[420px] translate-x-[68px] -translate-y-[74px]">
              <div className="absolute right-0 top-0 h-[170px] w-[170px] rounded-full border-[24px] border-red-300/20 border-b-transparent border-l-transparent rotate-[14deg]" />
              <div className="absolute right-[76px] top-[34px] h-[118px] w-[118px] rounded-full border-[18px] border-white/12 border-b-transparent border-l-transparent rotate-[14deg]" />
              <div className="absolute right-[140px] top-[74px] h-[70px] w-[70px] rounded-full border-[12px] border-red-200/15 border-b-transparent border-l-transparent rotate-[14deg]" />
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-1/3 select-none lg:block">
            <div className="relative h-[120px] w-[560px]">
              <div className="absolute left-0 top-[44px] h-[2px] w-[180px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute left-[190px] top-[30px] h-12 w-12 rounded-full border border-white/15 bg-white/5" />
              <div className="absolute left-[252px] top-[40px] h-8 w-8 rounded-full bg-white/10" />
              <div className="absolute left-[308px] top-[22px] h-16 w-16 rounded-full border-[10px] border-red-200/15 border-b-transparent border-r-transparent rotate-[-18deg]" />
              <div className="absolute right-0 top-[44px] h-[2px] w-[180px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md">
              <HotelIcon size={16} />
              <span className="text-sm font-medium">
                Jelajahi hotel partner terbaik ReadyRoom
              </span>
            </div>

            <h1 className="mb-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Temukan Hotel Terbaik
              <br />
              di{" "}
              <span className="text-red-100 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                ReadyRoom
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-red-100 md:text-xl">
              Cari hotel berdasarkan nama, kota, area, atau alamat. Semua hotel
              yang tampil di sini adalah hotel aktif yang siap kamu jelajahi.
            </p>
          </div>

          <div className="relative z-[100] mx-auto mt-10 max-w-6xl overflow-visible">
            <HeroSearchFilter />
          </div>

          {(destinationFromQuery || checkInFromQuery) && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {destinationFromQuery && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  <MapPin size={15} />
                  Tujuan: {destinationFromQuery}
                </span>
              )}

              {checkInFromQuery && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  <CalendarDays size={15} />
                  Check-in: {checkInFromQuery}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        id="hotel-results-section"
        className="relative z-10 mx-auto max-w-7xl px-4 py-14 md:px-6"
      >
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-red-100 bg-white/90 p-6 shadow-[0_10px_40px_rgba(255,0,0,0.05)] backdrop-blur-sm md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
              <Building2 size={15} />
              Daftar Hotel ReadyRoom
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Semua Hotel
            </h2>
            <p className="mt-2 text-gray-500">
              {filteredHotels.length} hotel ditemukan dari data hotel aktif
              ReadyRoom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {destinationFromQuery && (
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                <Search size={14} />
                Kata kunci:{" "}
                <span className="font-semibold text-gray-800">
                  {destinationFromQuery}
                </span>
              </div>
            )}

            {destinationFromQuery && (
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Bersihkan Pencarian
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-64 w-full bg-gray-200" />
                <div className="p-5">
                  <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
                  <div className="mb-2 h-6 w-44 rounded bg-gray-200" />
                  <div className="mb-3 h-4 w-32 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="rounded-[30px] border border-red-100 bg-white p-10 text-center shadow-[0_14px_45px_rgba(0,0,0,0.04)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Search size={28} />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-800">
              Hotel tidak ditemukan
            </h3>
            <p className="mx-auto max-w-md text-gray-500">
              Coba kata kunci lain untuk menemukan hotel yang kamu cari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                className="group block overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(239,68,68,0.14)]"
              >
                <HotelImageSlider hotel={hotel} buildImageUrl={buildImageUrl} />

                <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 px-5 pb-5 pt-4 text-white">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-1 text-[1.7rem] font-extrabold leading-tight tracking-tight">
                        {hotel.name || "Hotel"}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-red-50">
                        {hotel.city?.name || "-"}
                        {hotel.area ? ` • ${hotel.area}` : ""}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      ReadyRoom
                    </div>
                  </div>

                  <div className="mb-4 flex min-h-[48px] items-start gap-2 text-sm text-red-50">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-white" />
                    <span className="line-clamp-2">
                      {hotel.address || "Alamat hotel belum tersedia."}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {Array.isArray(hotel.facilities) &&
                    hotel.facilities.length > 0 ? (
                      hotel.facilities.slice(0, 3).map((facility) => {
                        const FacilityIcon = getFacilityIcon(facility.icon);

                        return (
                          <span
                            key={facility.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                          >
                            <FacilityIcon size={13} />
                            {facility.name}
                          </span>
                        );
                      })
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <Building2 size={13} />
                        Fasilitas menyusul
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="text-sm font-semibold text-white">
                      Lihat Detail
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-red-600 transition group-hover:translate-x-0.5">
                      Explore
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}