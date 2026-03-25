import { useEffect, useState } from "react";
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
} from "lucide-react";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelDetail();
  }, [id]);

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

  // gambar bawaan frontend/public
  if (cleanPath.startsWith("images/")) {
    return `/${cleanPath}`;
  }

  // kalau sudah storage/...
  if (cleanPath.startsWith("storage/")) {
    return `http://127.0.0.1:8000/${cleanPath}`;
  }

  // default: file upload backend
  return `http://127.0.0.1:8000/storage/${cleanPath}`;
};

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
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
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