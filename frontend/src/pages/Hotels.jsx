import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
    <div className="relative overflow-hidden rounded-t-[18px] sm:rounded-t-[28px]">
      <img
        src={activeImage}
        alt={hotel?.name || "Hotel"}
        onError={(e) => {
          e.currentTarget.src = "/images/hotel.jpg";
        }}
        className="h-[96px] w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-60"
      />

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 via-black/10 to-transparent sm:h-24" />

      {images.length > 1 && (
        <>
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-xs">
            <Images size={10} className="sm:h-[13px] sm:w-[13px]" />
            {currentIndex + 1}/{images.length}
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-1.5 top-1/2 z-10 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white sm:left-3 sm:h-9 sm:w-9"
            aria-label="Previous image"
          >
            <ChevronLeft size={14} className="sm:h-[17px] sm:w-[17px]" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-1.5 top-1/2 z-10 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105 hover:bg-white sm:right-3 sm:h-9 sm:w-9"
            aria-label="Next image"
          >
            <ChevronRight size={14} className="sm:h-[17px] sm:w-[17px]" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 sm:bottom-3 sm:gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition sm:h-2 ${
                  currentIndex === index
                    ? "w-4 bg-white sm:w-5"
                    : "w-1.5 bg-white/55 hover:bg-white/80 sm:w-2"
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
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const destinationFromQuery = searchParams.get("destination") || "";

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const timer1 = window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    const timer2 = window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 150);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [location.pathname, location.search]);

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

  const formatRupiah = (value) => {
    const amount = Number(value || 0);

    if (!amount || Number.isNaN(amount)) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHotelStartingPrice = (hotel) => {
    const directPrice =
      Number(hotel?.lowest_price || 0) ||
      Number(hotel?.min_price || 0) ||
      Number(hotel?.starting_price || 0) ||
      Number(hotel?.start_price || 0);

    if (directPrice > 0) {
      return {
        price: directPrice,
        label:
          hotel?.lowest_price_label || hotel?.starting_price_label || "3 Jam",
      };
    }

    const rooms = Array.isArray(hotel?.rooms)
      ? hotel.rooms
      : Array.isArray(hotel?.room)
      ? hotel.room
      : Array.isArray(hotel?.active_rooms)
      ? hotel.active_rooms
      : [];

    if (!rooms.length) {
      return {
        price: 0,
        label: "",
      };
    }

    const transit3Prices = rooms
      .map((room) => Number(room?.price_transit_3h || room?.price_3h || 0))
      .filter((price) => price > 0);

    if (transit3Prices.length > 0) {
      return {
        price: Math.min(...transit3Prices),
        label: "3 Jam",
      };
    }

    const fallbackPrices = [];

    rooms.forEach((room) => {
      const priceOptions = [
        {
          price: Number(room?.price_transit_6h || room?.price_6h || 0),
          label: "6 Jam",
        },
        {
          price: Number(room?.price_transit_12h || room?.price_12h || 0),
          label: "12 Jam",
        },
        {
          price: Number(room?.price_per_night || room?.price_night || 0),
          label: "Full Day",
        },
      ];

      priceOptions.forEach((item) => {
        if (item.price > 0) fallbackPrices.push(item);
      });
    });

    if (fallbackPrices.length === 0) {
      return {
        price: 0,
        label: "",
      };
    }

    return fallbackPrices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  };

  const getHotelCityName = (hotel) => {
    return (
      hotel?.city?.name ||
      hotel?.city_name ||
      hotel?.location ||
      hotel?.area ||
      hotel?.district ||
      hotel?.province ||
      "Lokasi hotel"
    );
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
      const address = String(hotel.address || "").toLowerCase();

      return (
        name.includes(keyword) ||
        city.includes(keyword) ||
        address.includes(keyword)
      );
    });
  }, [hotels, destinationFromQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff8f8] to-[#f8f6f6] text-gray-800">
      <Navbar />

      <section className="relative overflow-visible bg-gradient-to-b from-[#fff1f1] via-white to-[#fff8f8] pt-20 pb-10 sm:pt-24 sm:pb-14 md:pt-28 md:pb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
          <div className="absolute -top-24 right-[-80px] h-64 w-64 rounded-full bg-red-200/25 blur-3xl" />
          <div className="absolute left-[-90px] bottom-[-120px] h-72 w-72 rounded-full bg-rose-100/50 blur-3xl" />
          <div className="absolute right-[-34px] top-[74px] h-28 w-28 rounded-full border-[18px] border-red-300/20 md:right-[90px] md:top-[105px] md:h-40 md:w-40 md:border-[26px]" />
          <div className="absolute left-[-42px] top-[112px] h-24 w-24 rounded-full border-[16px] border-red-200/20 md:left-[90px] md:top-[130px] md:h-36 md:w-36 md:border-[24px]" />
          <div className="absolute inset-x-10 top-[82px] h-20 rounded-full bg-gradient-to-r from-red-100/0 via-red-100/70 to-red-100/0 blur-2xl md:top-[105px]" />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 pt-3 md:px-6 md:pt-6">
          <div className="relative mx-auto max-w-6xl">
            <div className="pointer-events-none absolute inset-x-4 top-1/2 h-16 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-100/10 via-red-200/40 to-red-100/10 blur-2xl sm:h-20" />
            <div className="relative z-[100] rounded-[24px] border border-white/70 bg-white/35 p-2 shadow-[0_18px_50px_rgba(239,68,68,0.08)] backdrop-blur-[2px] sm:rounded-[30px] sm:p-3">
              <HeroSearchFilter />
            </div>
          </div>
        </div>
      </section>

      <section
        id="hotel-results-section"
        className="relative z-10 mx-auto max-w-7xl px-3 pb-10 sm:px-4 sm:pb-14 md:px-6 md:pb-16"
      >
        <div className="relative overflow-hidden rounded-[26px] border border-red-100/80 bg-gradient-to-br from-white via-[#fff9f9] to-[#fff2f2] px-3 py-4 shadow-[0_18px_60px_rgba(239,68,68,0.06)] sm:rounded-[34px] sm:px-5 sm:py-6 md:px-6 md:py-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-red-100/55 blur-2xl" />
            <div className="absolute right-[-20px] top-16 h-28 w-28 rounded-full bg-rose-100/50 blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-red-50/80 via-white/0 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 sm:mb-4 sm:text-sm">
              <Building2 size={14} />
              Daftar Hotel ReadyRoom
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm sm:rounded-[28px]"
                  >
                    <div className="h-[96px] w-full bg-gray-200 sm:h-60" />
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
              <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {filteredHotels.map((hotel, index) => {
                  const startingPrice = getHotelStartingPrice(hotel);
                  const cityName = getHotelCityName(hotel);
                  const isLastOddMobile =
                    filteredHotels.length % 2 === 1 &&
                    index === filteredHotels.length - 1;

                  return (
                    <Link
                      to={`/hotels/${hotel.id}`}
                      key={hotel.id}
                      className={`group flex h-full flex-col overflow-hidden rounded-[18px] border border-red-100/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(239,68,68,0.12)] sm:rounded-[28px] ${
                        isLastOddMobile ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <HotelImageSlider
                        hotel={hotel}
                        buildImageUrl={buildImageUrl}
                      />

                      <div className="flex min-h-[150px] flex-1 flex-col bg-gradient-to-br from-red-600 via-red-500 to-rose-500 px-2.5 pb-2.5 pt-2 text-white sm:min-h-[220px] sm:px-4 sm:pb-4 sm:pt-3.5">
                        <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-2.5 sm:gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 min-h-[30px] text-[12.8px] font-extrabold leading-[1.2] tracking-tight sm:min-h-0 sm:line-clamp-1 sm:text-[1.45rem]">
                              {hotel.name || "Hotel"}
                            </h3>
                          </div>
                        </div>

                        <div className="mb-2 flex items-start gap-1.5 text-[9.5px] leading-[1.45] text-red-50 sm:mb-3 sm:min-h-[42px] sm:gap-2 sm:text-[13px]">
                          <MapPin
                            size={12}
                            className="mt-0.5 shrink-0 text-white sm:h-[15px] sm:w-[15px]"
                          />

                          <div className="min-w-0 flex-1">
                            <span className="block font-semibold leading-tight text-white/95">
                              {cityName}
                            </span>

                            <p className="mt-0.5 break-words text-[9.5px] leading-[1.45] text-white/85 sm:text-[12px] sm:line-clamp-3">
                              {hotel.address || "Alamat hotel belum tersedia."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto border-t border-white/20 pt-2 sm:pt-3">
                          <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-[10px]">
                                Harga mulai
                              </p>

                              {startingPrice.price > 0 ? (
                                <div className="mt-1 flex flex-wrap items-baseline gap-1">
                                  <p className="text-[13px] font-extrabold leading-none text-white sm:text-[18px]">
                                    {formatRupiah(startingPrice.price)}
                                  </p>
                                </div>
                              ) : (
                                <p className="mt-1 text-[11px] font-bold leading-tight text-white sm:text-sm">
                                  Tersedia di detail
                                </p>
                              )}
                            </div>

                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-red-600 transition group-hover:translate-x-0.5 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px]">
                              Explore
                              <ArrowRight
                                size={10}
                                className="sm:h-[13px] sm:w-[13px]"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}