import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  Search,
  MapPin,
  Building2,
  BedDouble,
  Users,
  Clock3,
  MoonStar,
  ArrowRight,
  SlidersHorizontal,
  Hotel as HotelIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function Rooms() {
  const [searchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("destination") || ""
  );
  const [bookingType, setBookingType] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCity, bookingType, priceFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const res = await api.get("/rooms");
      const roomData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRooms(roomData);
    } catch (error) {
      console.error("GET GLOBAL ROOMS ERROR:", error.response?.data || error);
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
      return `${BACKEND_BASE_URL}/${cleanPath}`;
    }

    return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
  };

  const cityOptions = useMemo(() => {
    const allCities = rooms
      .map((room) => room.hotel?.city?.name)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    return allCities.sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const getDisplayPrice = (room) => {
    if (bookingType === "transit") {
      const transitPrices = [
        Number(room.price_transit_3h || 0),
        Number(room.price_transit_6h || 0),
        Number(room.price_transit_12h || 0),
      ].filter((price) => price > 0);

      return transitPrices.length > 0 ? Math.min(...transitPrices) : 0;
    }

    if (bookingType === "overnight") {
      return Number(room.price_per_night || 0);
    }

    const allPrices = [
      Number(room.price_per_night || 0),
      Number(room.price_transit_3h || 0),
      Number(room.price_transit_6h || 0),
      Number(room.price_transit_12h || 0),
    ].filter((price) => price > 0);

    return allPrices.length > 0 ? Math.min(...allPrices) : 0;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const roomName = String(room.name || "").toLowerCase();
      const roomType = String(room.type || "").toLowerCase();
      const hotelName = String(room.hotel?.name || "").toLowerCase();
      const cityName = String(room.hotel?.city?.name || "").toLowerCase();
      const areaName = String(room.hotel?.area || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        roomName.includes(keyword) ||
        roomType.includes(keyword) ||
        hotelName.includes(keyword) ||
        cityName.includes(keyword) ||
        areaName.includes(keyword);

      const matchesCity =
        !selectedCity ||
        String(room.hotel?.city?.name || "")
          .toLowerCase()
          .includes(selectedCity.toLowerCase());

      const hasTransit =
        Number(room.price_transit_3h || 0) > 0 ||
        Number(room.price_transit_6h || 0) > 0 ||
        Number(room.price_transit_12h || 0) > 0;

      const hasOvernight = Number(room.price_per_night || 0) > 0;

      const matchesBookingType =
        bookingType === "all" ||
        (bookingType === "transit" && hasTransit) ||
        (bookingType === "overnight" && hasOvernight);

      const displayPrice = getDisplayPrice(room);

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under150" &&
          displayPrice > 0 &&
          displayPrice < 150000) ||
        (priceFilter === "150to300" &&
          displayPrice >= 150000 &&
          displayPrice <= 300000) ||
        (priceFilter === "above300" && displayPrice > 300000);

      return matchesSearch && matchesCity && matchesBookingType && matchesPrice;
    });
  }, [rooms, search, selectedCity, bookingType, priceFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRooms.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  const startItem = filteredRooms.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredRooms.length);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff9f9] to-[#f7f7f7] text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600 pb-28 pt-16 text-white md:pb-36 md:pt-20">
        <div className="absolute inset-0">
          <div className="absolute -top-10 left-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 top-12 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-red-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_28%)]" />

          {/* ORNAMEN KIRI */}
          <div className="pointer-events-none absolute left-0 top-0 hidden select-none lg:block">
            <div className="relative h-[260px] w-[420px] -translate-x-[86px] -translate-y-[84px]">
              <div className="absolute left-0 top-0 h-[210px] w-[210px] rounded-full border-[28px] border-white/12 border-b-transparent border-r-transparent rotate-[-20deg]" />
              <div className="absolute left-[94px] top-[48px] h-[136px] w-[136px] rounded-full border-[20px] border-red-200/20 border-b-transparent border-r-transparent rotate-[-20deg]" />
              <div className="absolute left-[182px] top-[92px] h-[82px] w-[82px] rounded-full border-[13px] border-red-100/16 border-b-transparent border-r-transparent rotate-[-20deg]" />
              <div className="absolute left-[156px] top-[204px] text-[11px] font-semibold uppercase tracking-[0.52em] text-red-100/22">
                READYROOM
              </div>
            </div>
          </div>

          {/* ORNAMEN KANAN */}
          <div className="pointer-events-none absolute right-0 top-0 hidden select-none lg:block">
            <div className="relative h-[260px] w-[460px] translate-x-[86px] -translate-y-[90px]">
              <div className="absolute right-0 top-0 h-[198px] w-[198px] rounded-full border-[28px] border-red-300/18 border-b-transparent border-l-transparent rotate-[18deg]" />
              <div className="absolute right-[84px] top-[40px] h-[136px] w-[136px] rounded-full border-[20px] border-white/12 border-b-transparent border-l-transparent rotate-[18deg]" />
              <div className="absolute right-[154px] top-[90px] h-[82px] w-[82px] rounded-full border-[13px] border-red-200/14 border-b-transparent border-l-transparent rotate-[18deg]" />
            </div>
          </div>

          {/* ORNAMEN TENGAH ATAS */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 select-none md:block">
            <div className="relative h-[120px] w-[420px] -translate-y-[30px]">
              <div className="absolute left-[90px] top-[58px] h-[2px] w-[74px] rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <div className="absolute left-[172px] top-[44px] h-6 w-6 rounded-full bg-white/14" />
              <div className="absolute left-[210px] top-[24px] h-14 w-14 rounded-full border-[10px] border-red-100/18 border-b-transparent border-r-transparent rotate-[-20deg]" />
              <div className="absolute left-[282px] top-[58px] h-[2px] w-[74px] rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </div>
          </div>

          {/* ORNAMEN BAWAH */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-1/3 select-none lg:block">
            <div className="relative h-[140px] w-[680px]">
              <div className="absolute left-0 top-[56px] h-[2px] w-[220px] bg-gradient-to-r from-transparent via-white/24 to-transparent" />
              <div className="absolute left-[236px] top-[36px] h-10 w-10 rounded-full border border-white/16 bg-white/6" />
              <div className="absolute left-[292px] top-[48px] h-6 w-6 rounded-full bg-white/12" />
              <div className="absolute left-[336px] top-[28px] h-[72px] w-[72px] rounded-full border-[11px] border-red-100/16 border-b-transparent border-r-transparent rotate-[-18deg]" />
              <div className="absolute left-[424px] top-[56px] h-[2px] w-[220px] bg-gradient-to-r from-transparent via-white/24 to-transparent" />
            </div>
          </div>

          {/* AKSEN FLOATING */}
          <div className="pointer-events-none absolute left-[14%] top-[32%] hidden h-3 w-3 rounded-full bg-white/18 blur-[1px] lg:block" />
          <div className="pointer-events-none absolute left-[22%] top-[64%] hidden h-4 w-4 rounded-full bg-red-200/18 blur-[1px] lg:block" />
          <div className="pointer-events-none absolute right-[16%] top-[30%] hidden h-3 w-3 rounded-full bg-white/16 blur-[1px] lg:block" />
          <div className="pointer-events-none absolute right-[24%] top-[68%] hidden h-4 w-4 rounded-full bg-red-100/16 blur-[1px] lg:block" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md">
              <BedDouble size={16} />
              <span className="text-sm font-medium">
                Jelajahi semua tipe kamar dari hotel aktif ReadyRoom
              </span>
            </div>

            <h1 className="mb-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Temukan Kamar yang
              <br />
              Cocok untuk Transit
              <br />
              atau Menginap
            </h1>

            <p className="mx-auto max-w-3xl text-lg text-red-100 md:text-xl">
              Cari kamar berdasarkan nama, hotel, kota, atau harga. Semua kamar
              aktif dari hotel aktif dikumpulkan di sini agar lebih mudah
              dibanding pilih hotel satu per satu.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <div className="h-fit rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_16px_45px_rgba(0,0,0,0.08)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Filter Rooms
                  </h2>
                  <p className="text-sm text-gray-500">
                    Cari kamar yang paling cocok
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nama kamar / hotel / kota"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Kota
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  >
                    <option value="">Semua Kota</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Jenis Booking
                  </label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="transit">Transit</option>
                    <option value="overnight">Menginap</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Filter Harga
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  >
                    <option value="all">Semua Harga</option>
                    <option value="under150">Di bawah Rp 150.000</option>
                    <option value="150to300">Rp 150.000 - Rp 300.000</option>
                    <option value="above300">Di atas Rp 300.000</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCity("");
                    setBookingType("all");
                    setPriceFilter("all");
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            <div>
              <div className="mb-6 rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_16px_45px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                      <HotelIcon size={16} />
                      Listing Kamar Aktif
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
                      Semua Kamar
                    </h2>

                    <p className="mt-2 text-gray-500">
                      {filteredRooms.length} kamar ditemukan dari semua hotel
                      aktif.
                    </p>

                    {!loading && filteredRooms.length > 0 && (
                      <p className="mt-2 text-sm text-gray-400">
                        Menampilkan {startItem}-{endItem} dari{" "}
                        {filteredRooms.length} kamar
                      </p>
                    )}
                  </div>

                  {(search ||
                    selectedCity ||
                    bookingType !== "all" ||
                    priceFilter !== "all") && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                      <Sparkles size={15} className="text-red-500" />
                      Filter aktif
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="grid animate-pulse grid-cols-1 gap-4 overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-[320px_1fr]"
                    >
                      <div className="h-64 rounded-2xl bg-gray-200" />
                      <div className="space-y-4 p-2">
                        <div className="h-6 w-48 rounded bg-gray-200" />
                        <div className="h-4 w-40 rounded bg-gray-200" />
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="flex gap-2">
                          <div className="h-8 w-24 rounded-full bg-gray-200" />
                          <div className="h-8 w-24 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  ))}</div>
              ) : filteredRooms.length === 0 ? (
                <div className="rounded-[2rem] border border-gray-100 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Search size={28} />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-800">
                    Kamar tidak ditemukan
                  </h3>
                  <p className="text-gray-500">
                    Coba ubah keyword atau filter harga supaya hasilnya lebih
                    cocok.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {paginatedRooms.map((room) => {
                      const roomImage =
                        room.thumbnail ||
                        room.images?.[0]?.image_path ||
                        room.hotel?.thumbnail ||
                        room.hotel?.hero_image;

                      return (
                        <Link
                          to={`/rooms/${room.id}`}
                          key={room.id}
                          className="group grid grid-cols-1 gap-4 overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.10)] md:grid-cols-[320px_1fr]"
                        >
                          <div className="relative overflow-hidden rounded-2xl">
                            <img
                              src={buildImageUrl(roomImage, "/images/hotel.jpg")}
                              alt={room.name}
                              onError={(e) => {
                                e.currentTarget.src = "/images/hotel.jpg";
                              }}
                              className="h-full min-h-[240px] w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

                            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow">
                              <BedDouble size={14} />
                              {room.type || "Room"}
                            </div>
                          </div>

                          <div className="flex flex-col justify-between p-2">
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-2">
                                  <Building2 size={15} className="text-red-500" />
                                  {room.hotel?.name || "-"}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <MapPin size={15} className="text-red-500" />
                                  {room.hotel?.city?.name || "-"}
                                  {room.hotel?.area
                                    ? ` • ${room.hotel.area}`
                                    : ""}
                                </span>
                              </div>

                              <h3 className="text-2xl font-bold text-gray-800 transition group-hover:text-red-600">
                                {room.name}
                              </h3>

                              <p className="mt-2 line-clamp-2 text-gray-500">
                                {room.description ||
                                  "Kamar nyaman untuk kebutuhan transit maupun menginap."}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                                  <Users size={15} className="text-red-500" />
                                  Kapasitas {room.capacity || 0} orang
                                </span>

                                {Number(room.price_transit_3h || 0) > 0 && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-red-600">
                                    <Clock3 size={15} />
                                    Transit 3 jam
                                  </span>
                                )}

                                {Number(room.price_per_night || 0) > 0 && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-indigo-600">
                                    <MoonStar size={15} />
                                    Menginap
                                  </span>
                                )}
                              </div>

                              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                                  <p className="text-xs font-semibold text-red-500">
                                    Transit 3 Jam
                                  </p>
                                  <p className="mt-1 font-bold text-red-700">
                                    {Number(room.price_transit_3h || 0) > 0
                                      ? formatCurrency(room.price_transit_3h)
                                      : "Belum tersedia"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                                  <p className="text-xs font-semibold text-orange-500">
                                    Transit 6 Jam
                                  </p>
                                  <p className="mt-1 font-bold text-orange-700">
                                    {Number(room.price_transit_6h || 0) > 0
                                      ? formatCurrency(room.price_transit_6h)
                                      : "Belum tersedia"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                                  <p className="text-xs font-semibold text-amber-600">
                                    Transit 12 Jam
                                  </p>
                                  <p className="mt-1 font-bold text-amber-700">
                                    {Number(room.price_transit_12h || 0) > 0
                                      ? formatCurrency(room.price_transit_12h)
                                      : "Belum tersedia"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                  <p className="text-xs font-semibold text-emerald-600">
                                    Harga Menginap
                                  </p>
                                  <p className="mt-1 font-bold text-emerald-700">
                                    {Number(room.price_per_night || 0) > 0
                                      ? formatCurrency(room.price_per_night)
                                      : "Belum tersedia"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                              <span className="text-sm font-semibold text-red-600">
                                Lihat Detail Kamar
                              </span>

                              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition group-hover:bg-red-100">
                                Explore
                                <ArrowRight size={15} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-gray-100 bg-white px-4 py-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                      <div className="text-sm text-gray-500">
                        Halaman{" "}
                        <span className="font-semibold text-gray-800">
                          {safeCurrentPage}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-gray-800">
                          {totalPages}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={safeCurrentPage === 1}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft size={16} />
                          Prev
                        </button>

                        {pageNumbers.map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 py-2 text-sm font-semibold text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[44px] rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                                safeCurrentPage === page
                                  ? "bg-red-600 text-white shadow-lg"
                                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={safeCurrentPage === totalPages}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}