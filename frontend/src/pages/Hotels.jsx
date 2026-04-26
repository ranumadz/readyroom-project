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
import AOS from "aos";
import "aos/dist/aos.css";

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
      if (!list.includes(heroUrl)) list.push(heroUrl);
    }

    if (Array.isArray(hotel?.images)) {
      hotel.images.forEach((img) => {
        const imagePath =
          img?.image || img?.path || img?.url || img?.image_path || null;
        const imageUrl = buildImageUrl(imagePath, "/images/hotel.jpg");

        if (imagePath && !list.includes(imageUrl)) list.push(imageUrl);
      });
    }

    if (list.length === 0) list.push("/images/hotel.jpg");

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
    <div className="relative overflow-hidden rounded-t-[16px] sm:rounded-t-[28px]">
      <img
        src={activeImage}
        alt={hotel?.name || "Hotel"}
        onError={(e) => {
          e.currentTarget.src = "/images/hotel.jpg";
        }}
        className="h-24 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-64"
      />

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 via-black/10 to-transparent sm:h-28" />

      <div className="absolute left-2 top-2 inline-flex max-w-[72px] items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-red-600 shadow-md sm:left-4 sm:top-4 sm:max-w-none sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
        <Building2 size={10} className="shrink-0 sm:h-[14px] sm:w-[14px]" />
        <span className="truncate">{hotel?.area || "Hotel"}</span>
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:px-2.5 sm:py-1.5 sm:text-xs">
            <Images size={10} className="sm:h-[13px] sm:w-[13px]" />
            {currentIndex + 1}/{images.length}
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white sm:inline-flex sm:h-10 sm:w-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white sm:inline-flex sm:h-10 sm:w-10"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 sm:bottom-4 sm:gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition sm:h-2.5 ${
                  currentIndex === index
                    ? "w-4 bg-white sm:w-6"
                    : "w-1.5 bg-white/55 hover:bg-white/80 sm:w-2.5"
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
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [loading, hotels.length]);

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

    if (cleanPath.startsWith("images/")) return `/${cleanPath}`;

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

      <section className="relative overflow-visible bg-gradient-to-br from-red-700 via-red-600 to-rose-600 pb-14 pt-14 text-white sm:pb-28 sm:pt-16 md:pb-36 md:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_30%)]" />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-6xl">
              Temukan Hotel Terbaik
              <br />
              di{" "}
              <span className="text-red-100 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                ReadyRoom
              </span>
            </h1>

            <p className="mx-auto mb-8 hidden max-w-3xl text-base leading-relaxed text-red-100 sm:block md:text-xl">
              Cari hotel berdasarkan nama, kota, area, atau alamat. Semua hotel
              yang tampil di sini adalah hotel aktif yang siap kamu jelajahi.
            </p>
          </div>

          <div className="relative z-[100] mx-auto mt-7 max-w-6xl overflow-visible sm:mt-10">
            <HeroSearchFilter />
          </div>

          {(destinationFromQuery || checkInFromQuery) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3">
              {destinationFromQuery && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
                  <MapPin size={14} />
                  Tujuan: {destinationFromQuery}
                </span>
              )}

              {checkInFromQuery && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
                  <CalendarDays size={14} />
                  Check-in: {checkInFromQuery}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        id="hotel-results-section"
        className="relative z-10 mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-14 md:px-6"
      >
        <div className="mb-3 sm:mb-8 sm:flex sm:flex-col sm:gap-4 sm:rounded-[28px] sm:border sm:border-red-100 sm:bg-white/90 sm:p-6 sm:shadow-[0_10px_40px_rgba(255,0,0,0.05)] sm:backdrop-blur-sm md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 sm:mb-3 sm:text-sm">
              <Building2 size={14} />
              Daftar Hotel ReadyRoom
            </div>

            <h2 className="hidden text-3xl font-extrabold tracking-tight text-gray-900 sm:block md:text-4xl">
              Semua Hotel
            </h2>

            <p className="mt-2 hidden text-base leading-relaxed text-gray-500 sm:block">
              {filteredHotels.length} hotel ditemukan dari data hotel aktif
              ReadyRoom.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-3">
            {destinationFromQuery && (
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 sm:px-4 sm:py-2 sm:text-sm">
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
                className="inline-flex items-center justify-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
              >
                Bersihkan
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-sm sm:rounded-[28px]"
              >
                <div className="h-24 w-full bg-gray-200 sm:h-64" />
                <div className="p-2.5 sm:p-5">
                  <div className="mb-2 h-3 w-16 rounded bg-gray-200 sm:h-4 sm:w-24" />
                  <div className="mb-2 h-5 w-24 rounded bg-gray-200 sm:h-6 sm:w-44" />
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200 sm:h-4 sm:w-32" />
                  <div className="h-3 w-full rounded bg-gray-200 sm:h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="rounded-[24px] border border-red-100 bg-white p-8 text-center shadow-[0_14px_45px_rgba(0,0,0,0.04)] sm:rounded-[30px] sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 sm:h-16 sm:w-16">
              <Search size={26} />
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl">
              Hotel tidak ditemukan
            </h3>
            <p className="mx-auto max-w-md text-sm text-gray-500 sm:text-base">
              Coba kata kunci lain untuk menemukan hotel yang kamu cari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                className="group block overflow-hidden rounded-[16px] border border-red-100 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(239,68,68,0.14)] sm:rounded-[28px]"
              >
                <HotelImageSlider hotel={hotel} buildImageUrl={buildImageUrl} />

                <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 px-2.5 pb-2.5 pt-2.5 text-white sm:px-5 sm:pb-5 sm:pt-4">
                  <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 min-h-[34px] text-[14px] font-extrabold leading-[1.18] tracking-tight sm:min-h-0 sm:line-clamp-1 sm:text-[1.7rem]">
                        {hotel.name || "Hotel"}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-[10.5px] font-semibold text-red-50 sm:text-sm">
                        {hotel.city?.name || "-"}
                        {hotel.area ? ` • ${hotel.area}` : ""}
                      </p>
                    </div>

                    <div className="hidden shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:block">
                      ReadyRoom
                    </div>
                  </div>

                  <div className="mb-2 flex items-start gap-1.5 text-[10.5px] text-red-50 sm:mb-4 sm:min-h-[48px] sm:gap-2 sm:text-sm">
                    <MapPin
                      size={12}
                      className="mt-0.5 shrink-0 text-white sm:h-[15px] sm:w-[15px]"
                    />
                    <span className="line-clamp-1 sm:line-clamp-2">
                      {hotel.address || "Alamat hotel belum tersedia."}
                    </span>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1 sm:mb-4 sm:gap-2">
                    {Array.isArray(hotel.facilities) &&
                    hotel.facilities.length > 0 ? (
                      hotel.facilities.slice(0, 2).map((facility) => {
                        const FacilityIcon = getFacilityIcon(facility.icon);

                        return (
                          <span
                            key={facility.id}
                            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9.5px] font-semibold text-white backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
                          >
                            <FacilityIcon size={10} />
                            <span className="max-w-[48px] truncate sm:max-w-none">
                              {facility.name}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9.5px] font-medium text-white backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
                        <Building2 size={10} />
                        Fasilitas
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/20 pt-2 sm:pt-4">
                    <span className="text-[10.5px] font-semibold text-white sm:text-sm">
                      Detail
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold text-red-600 transition group-hover:translate-x-0.5 sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs">
                      Explore
                      <ArrowRight
                        size={11}
                        className="sm:h-[14px] sm:w-[14px]"
                      />
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