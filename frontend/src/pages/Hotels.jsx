import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      return `http://127.0.0.1:8000/${cleanPath}`;
    }

    return `http://127.0.0.1:8000/storage/${cleanPath}`;
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

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600 text-white pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="absolute inset-0">
          <div className="absolute -top-10 left-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute top-12 right-10 w-80 h-80 bg-black/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-300/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 mb-6 shadow-lg">
              <HotelIcon size={16} />
              <span className="text-sm font-medium">
                Jelajahi hotel partner terbaik ReadyRoom
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
              Temukan Hotel Terbaik
              <br />
              di <span className="text-red-100 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">ReadyRoom</span>
            </h1>

            <p className="text-red-100 text-lg md:text-xl max-w-3xl mb-8">
              Cari hotel berdasarkan nama, kota, area, atau alamat. Semua hotel
              yang tampil di sini adalah hotel aktif yang siap kamu jelajahi.
            </p>

            <div className="w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl p-3">
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
                  className="w-full rounded-2xl bg-transparent pl-12 pr-4 py-4 text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Building2 size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Hotel Aktif</h3>
              <p className="text-gray-500 text-sm">
                Semua hotel yang tampil di halaman ini berasal dari data hotel aktif.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <MapPin size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Lokasi Strategis</h3>
              <p className="text-gray-500 text-sm">
                Jelajahi pilihan hotel berdasarkan kota, area, dan alamat yang tersedia.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Star size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Siap Dieksplor</h3>
              <p className="text-gray-500 text-sm">
                Klik detail hotel untuk lihat lokasi, deskripsi, dan kamar yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-14 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Semua Hotel</h2>
            <p className="text-gray-500 mt-2">
              {filteredHotels.length} hotel ditemukan dari data hotel aktif ReadyRoom.
            </p>
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Bersihkan Pencarian
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="w-full h-60 bg-gray-200" />
                <div className="p-5">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                  <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Search size={28} />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Hotel tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba kata kunci lain untuk menemukan hotel yang kamu cari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition duration-300 block"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={buildImageUrl(hotel.thumbnail, "/images/hotel.jpg")}
                    alt={hotel.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="w-full h-60 object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow">
                    <Building2 size={14} />
                    {hotel.area || "Hotel"}
                  </div>

                  <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
                    ⭐ {hotel.rating || "0.0"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl line-clamp-1 text-gray-800">
                    {hotel.name}
                  </h3>

                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500 shrink-0" />
                    <span className="line-clamp-1">
                      {hotel.city?.name || "-"}
                      {hotel.area ? ` • ${hotel.area}` : ""}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2 min-h-[40px]">
                    {hotel.address || "Alamat hotel belum tersedia."}
                  </p>

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