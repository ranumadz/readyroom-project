import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  ArrowLeft,
  BedDouble,
  Users,
  Building2,
  Clock3,
} from "lucide-react";

export default function HotelRooms() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelAndRooms();
  }, [id]);

  const fetchHotelAndRooms = async () => {
    try {
      setLoading(true);

      const [hotelRes, roomsRes] = await Promise.all([
        api.get(`/hotels/${id}`),
        api.get(`/hotels/${id}/rooms`),
      ]);

      setHotel(hotelRes.data?.data || null);
      setRooms(roomsRes.data?.data || []);
    } catch (error) {
      console.error("GET HOTEL ROOMS ERROR:", error.response?.data || error);
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

    if (cleanPath.startsWith("images/")) {
      return `/${cleanPath}`;
    }

    if (cleanPath.startsWith("storage/")) {
      return `http://127.0.0.1:8000/${cleanPath}`;
    }

    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-60 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="h-52 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-10 w-full bg-gray-200 rounded-2xl" />
                  </div>
                </div>
              ))}
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
              Data hotel tidak tersedia atau sudah tidak aktif.
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

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <Building2 size={16} />
              Daftar Kamar Hotel
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {hotel.name}
            </h1>

            <p className="text-gray-500 max-w-2xl">
              Pilih tipe kamar yang tersedia untuk hotel ini. Lanjutkan ke detail
              kamar untuk melihat informasi lebih lengkap dan proses booking.
            </p>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <BedDouble size={28} />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Belum ada kamar tersedia
            </h2>
            <p className="text-gray-500">
              Saat ini kamar untuk hotel ini belum tersedia atau masih dinonaktifkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="relative">
                  <img
                    src={buildImageUrl(room.thumbnail, "/images/hotel.jpg")}
                    alt={room.name}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hotel.jpg";
                    }}
                    className="w-full h-56 object-cover"
                  />

                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
                    <BedDouble size={14} />
                    {room.type || "Room"}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      {room.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {room.description || "Kamar nyaman untuk kebutuhan menginap atau transit."}
                    </p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-red-500" />
                      Kapasitas {room.capacity || 0} orang
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 size={16} className="text-red-500" />
                      Transit 3 jam: {formatRupiah(room.price_transit_3h || 0)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 size={16} className="text-red-500" />
                      Transit 6 jam: {formatRupiah(room.price_transit_6h || 0)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 size={16} className="text-red-500" />
                      Transit 12 jam: {formatRupiah(room.price_transit_12h || 0)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
                    <p className="text-xs font-semibold text-red-600 mb-1">
                      Harga menginap
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatRupiah(room.price_per_night || 0)}
                      <span className="text-sm font-medium text-gray-500"> / malam</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="w-full rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Lihat Detail Kamar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}