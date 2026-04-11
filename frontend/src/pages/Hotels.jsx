import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  Building2,
  MapPin,
  Search,
  Star,
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
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600 pb-20 pt-16 text-white md:pb-24 md:pt-20">
        <div className="absolute inset-0">
          <div className="absolute -top-10 left-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 top-12 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md">
              <HotelIcon size={16} />
              <span className="text-sm font-medium">
                Jelajahi hotel partner terbaik ReadyRoom
              </span>
            </div>

            <h1 className="mb-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Temukan Hotel Terbaik
              <br />
              di{" "}
              <span className="text-red-100 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                ReadyRoom
              </span>
            </h1>

            <p className="mb-8 max-w-3xl text-lg text-red-100 md:text-xl">
              Cari hotel berdasarkan nama, kota, area, atau alamat. Semua hotel
              yang tampil di sini adalah hotel aktif yang siap kamu jelajahi.
            </p>

            <div className="w-full max-w-2xl rounded-3xl border border-white/40 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
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
              <div className="mt-5 flex flex-wrap items-center gap-3">
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
      </section>

      <section className="-mt-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Building2 size={22} />
              </div>
              <h3 className="mb-2 text-lg font-bold">Hotel Aktif</h3>
              <p className="text-sm text-gray-500">
                Semua hotel yang tampil di halaman ini berasal dari data hotel aktif.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <MapPin size={22} />
              </div>
              <h3 className="mb-2 text-lg font-bold">Lokasi Strategis</h3>
              <p className="text-sm text-gray-500">
                Jelajahi pilihan hotel berdasarkan kota, area, dan alamat yang tersedia.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Star size={22} />
              </div>
              <h3 className="mb-2 text-lg font-bold">Siap Dieksplor</h3>
              <p className="text-sm text-gray-500">
                Klik detail hotel untuk lihat lokasi, deskripsi, dan kamar yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Semua Hotel</h2>
            <p className="mt-2 text-gray-500">
              {filteredHotels.length} hotel ditemukan dari data hotel aktif ReadyRoom.
            </p>
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Bersihkan Pencarian
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
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
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Search size={28} />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-800">
              Hotel tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba kata kunci lain untuk menemukan hotel yang kamu cari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
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

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow">
                    <Building2 size={14} />
                    {hotel.area || "Hotel"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-1 text-xl font-bold text-gray-800">
                    {hotel.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-gray-500">
                    <MapPin size={16} className="shrink-0 text-red-500" />
                    <span className="line-clamp-1">
                      {hotel.city?.name || "-"}
                      {hotel.area ? ` • ${hotel.area}` : ""}
                    </span>
                  </p>

                  <p className="mt-3 min-h-[40px] line-clamp-2 text-sm text-gray-500">
                    {hotel.address || "Alamat hotel belum tersedia."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.isArray(hotel.facilities) && hotel.facilities.length > 0 ? (
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

                    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
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