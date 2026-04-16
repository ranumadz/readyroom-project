import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  ShieldCheck,
  Clock3,
  MapPinned,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function Hotels() {
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const destinationFromQuery = searchParams.get("destination") || "";
  const checkInFromQuery = searchParams.get("check_in") || "";

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    setSearch(destinationFromQuery);
  }, [destinationFromQuery]);

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
    const keyword = search.trim().toLowerCase();

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
  }, [hotels, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff8f8] to-[#f8f8f8] text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600 pb-16 pt-16 text-white md:pb-24 md:pt-24">
        <div className="absolute inset-0">
          <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_30%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="hidden lg:col-span-5 lg:block">
              <div className="relative">
                <div className="absolute -left-6 top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-md">
                      <HotelIcon size={26} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-red-100">
                        Hotel ReadyRoom
                      </p>
                      <h3 className="text-2xl font-bold leading-tight">
                        Tempat Rehat Paling Tepat
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-sm text-red-100">Hotel pilihan</p>
                      <p className="mt-1 text-lg font-semibold leading-snug">
                        Hotel aktif dengan lokasi strategis dan akses
                        mudah untuk kebutuhan istirahatmu.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="mb-2 flex items-center gap-2 text-red-100">
                          <Clock3 size={16} />
                          <p className="text-sm">Check-in fleksibel</p>
                        </div>
                        <p className="text-base font-semibold leading-snug">
                          Cocok untuk transit maupun overnight.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="mb-2 flex items-center gap-2 text-red-100">
                          <MapPinned size={16} />
                          <p className="text-sm">Lebih praktis</p>
                        </div>
                        <p className="text-base font-semibold leading-snug">
                          Cari hotel berdasarkan kota, area, atau alamat.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-red-100">
                        <ShieldCheck size={16} />
                        <p className="text-sm">Pengalaman lebih nyaman</p>
                      </div>
                      <p className="text-sm leading-relaxed text-red-100">
                        Jelajahi hotel partner ReadyRoom untuk kebutuhan
                        istirahat, perjalanan bisnis, atau singgah singkat
                        dengan pengalaman booking yang lebih mudah dan lebih
                        praktis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="mx-auto max-w-4xl text-center lg:ml-auto lg:mr-0 lg:max-w-3xl lg:text-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md lg:ml-auto">
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

                <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-red-100 md:text-xl lg:mr-0">
                  Cari hotel berdasarkan nama, kota, area, atau alamat. Semua
                  hotel yang tampil di sini adalah hotel aktif yang siap kamu
                  jelajahi.
                </p>

                <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/35 bg-white/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-md lg:mr-0">
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari hotel, kota, area, atau alamat..."
                      className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-gray-800 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {(destinationFromQuery || checkInFromQuery) && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-end">
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
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
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
            {search && (
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                <Search size={14} />
                Kata kunci:{" "}
                <span className="font-semibold text-gray-800">{search}</span>
              </div>
            )}

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Bersihkan Pencarian
              </button>
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
                <div className="h-60 w-full bg-gray-200" />
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
                className="group block overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={buildImageUrl(hotel.thumbnail, "/images/hotel.jpg")}
                    alt={hotel.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-md">
                    <Building2 size={14} />
                    {hotel.area || "Hotel"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-1 text-xl font-bold text-gray-800 transition group-hover:text-red-600">
                    {hotel.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-gray-500">
                    <MapPin size={16} className="shrink-0 text-red-500" />
                    <span className="line-clamp-1">
                      {hotel.city?.name || "-"}
                      {hotel.area ? ` • ${hotel.area}` : ""}
                    </span>
                  </p>

                  <p className="mt-3 min-h-[40px] line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {hotel.address || "Alamat hotel belum tersedia."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.isArray(hotel.facilities) &&
                    hotel.facilities.length > 0 ? (
                      hotel.facilities.slice(0, 3).map((facility) => {
                        const FacilityIcon = getFacilityIcon(facility.icon);

                        return (
                          <span
                            key={facility.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                          >
                            <FacilityIcon size={13} />
                            {facility.name}
                          </span>
                        );
                      })
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                        <Building2 size={13} />
                        Fasilitas menyusul
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-600">
                      Lihat Detail
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition group-hover:bg-red-100">
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