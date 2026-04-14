import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSearchFilter from "../components/HeroSearchFilter";
import api from "../services/api";

import {
  Clock,
  ShieldCheck,
  MapPin,
  Wifi,
  Car,
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  History,
  Eye,
  Newspaper,
  Tv,
  Bath,
  Dumbbell,
  Waves,
  AirVent,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [popularHotels, setPopularHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [recentHotels, setRecentHotels] = useState([]);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);

  const partnerScrollRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    fetchPopularHotels();
    loadRecentHotels();
    fetchWebsiteContent();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadRecentHotels();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchPopularHotels = async () => {
    try {
      setLoadingHotels(true);

      const res = await api.get("/hotels");
      const hotels = Array.isArray(res.data?.data) ? res.data.data : [];

      setPopularHotels(hotels.slice(0, 6));
    } catch (error) {
      console.error("GET POPULAR HOTELS ERROR:", error.response?.data || error);
      setPopularHotels([]);
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchWebsiteContent = async () => {
    try {
      setLoadingContent(true);

      const res = await api.get("/website-content");
      setWebsiteContent(res.data?.data || null);
    } catch (error) {
      console.error("GET WEBSITE CONTENT ERROR:", error.response?.data || error);
      setWebsiteContent(null);
    } finally {
      setLoadingContent(false);
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

  const loadRecentHotels = () => {
    try {
      const storageKey = getCustomerStorageKey();
      const storedRecent = JSON.parse(localStorage.getItem(storageKey) || "[]");

      setRecentHotels(Array.isArray(storedRecent) ? storedRecent : []);
    } catch (error) {
      console.error("LOAD RECENT HOTELS ERROR:", error);
      setRecentHotels([]);
    }
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

  const renderFacilityBadges = (hotel, limit = 3) => {
    const facilities = Array.isArray(hotel?.facilities)
      ? hotel.facilities.slice(0, limit)
      : [];

    if (facilities.length === 0) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          <Building2 size={13} />
          Fasilitas menyusul
        </span>
      );
    }

    return (
      <>
        {facilities.map((facility) => {
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
        })}
      </>
    );
  };

  const scrollPartners = (direction) => {
    if (!partnerScrollRef.current) return;

    const scrollAmount = window.innerWidth < 640 ? 280 : 340;

    partnerScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const recommendedHotels = useMemo(() => {
    return popularHotels.slice(0, 3);
  }, [popularHotels]);

  const heroTitle = loadingContent ? "" : websiteContent?.hero_title || "";
  const heroSubtitle =
    loadingContent ? "" : websiteContent?.hero_subtitle || "";

  const heroImage = buildImageUrl(
    websiteContent?.hero_image,
    "/images/hotel.jpg"
  );

  const infoTitle = websiteContent?.info_title || "Info Terbaru ReadyRoom";
  const infoDescription =
    websiteContent?.info_description ||
    "Nikmati pengalaman booking hotel yang lebih cepat, aman, dan nyaman untuk kebutuhan harian maupun perjalanan bisnis.";
  const infoImage = buildImageUrl(
    websiteContent?.info_image,
    "/images/hotel.jpg"
  );

  const promo2Title =
    websiteContent?.promo2_title || "Promo Tambahan ReadyRoom";
  const promo2Description =
    websiteContent?.promo2_description ||
    "Nikmati promo tambahan dan berbagai pilihan kamar yang nyaman untuk kebutuhan transit maupun menginap.";
  const promo2Image = buildImageUrl(
    websiteContent?.promo2_image,
    "/images/hotel.jpg"
  );

  const partnerBrands = [
    {
      name: "ReadyRoom Prime",
      image: "/readyroom.png",
      description:
        "Brand premium untuk pengalaman menginap yang lebih eksklusif.",
      accent: "from-slate-900 via-slate-800 to-slate-700",
    },
    {
      name: "ReadyRoom Transit",
      image: "/readyroom.png",
      description:
        "Pilihan fleksibel untuk tamu transit yang butuh cepat dan nyaman.",
      accent: "from-red-600 via-rose-600 to-orange-500",
    },
    {
      name: "ReadyRoom Business",
      image: "/readyroom.png",
      description:
        "Dirancang untuk perjalanan bisnis dengan kenyamanan efisien.",
      accent: "from-emerald-700 via-emerald-600 to-teal-500",
    },
    {
      name: "ReadyRoom Suites",
      image: "/readyroom.png",
      description: "Kelas suite dengan suasana modern dan fasilitas lengkap.",
      accent: "from-amber-500 via-yellow-500 to-orange-400",
    },
    {
      name: "ReadyRoom Residence",
      image: "/readyroom.png",
      description:
        "Pilihan menginap lebih panjang dengan rasa nyaman seperti rumah.",
      accent: "from-indigo-700 via-violet-700 to-purple-600",
    },
    {
      name: "ReadyRoom Urban",
      image: "/readyroom.png",
      description:
        "Gaya urban modern di lokasi strategis kota besar Indonesia.",
      accent: "from-cyan-700 via-sky-700 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden pt-20 pb-20 text-white md:pt-28 md:pb-28">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="ReadyRoom Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#4b0000]/90 via-red-800/80 to-rose-700/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(0,0,0,0.18),transparent_30%),radial-gradient(circle_at_bottom_center,rgba(255,255,255,0.08),transparent_25%)]" />
          <div className="absolute top-12 right-10 h-96 w-96 rounded-full bg-black/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-red-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            {heroTitle ? (
              <h2 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
                {heroTitle}
              </h2>
            ) : (
              <div className="mx-auto mb-5 h-12 w-3/4 animate-pulse rounded-2xl bg-white/15 md:h-16" />
            )}

            {heroSubtitle ? (
              <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-red-100 md:text-xl">
                {heroSubtitle}
              </p>
            ) : (
              <div className="mx-auto mb-10 h-6 w-2/3 animate-pulse rounded-xl bg-white/10" />
            )}

            <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-red-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-100"
              >
                Explore Hotels
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mx-auto max-w-6xl">
              <HeroSearchFilter />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">Explore by City</h3>
            <p className="mt-2 text-gray-500">
              Temukan destinasi dan kamar favorit di berbagai kota.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-6">
          {[
            { img: "/photo_jakarta.jpg", name: "Jakarta" },
            { img: "/destinasi_bali.jpg", name: "Bali" },
            { img: "/destinasi aceh.jpg", name: "Aceh" },
            { img: "/tebing-breksi.jpg", name: "Yogyakarta" },
            { img: "/destinasi_surabaya.jpg", name: "Surabaya" },
            { img: "/destinasi-semarang.jpg", name: "Semarang" },
          ].map((city, i) => (
            <Link
              to={`/hotels?destination=${encodeURIComponent(city.name)}`}
              key={i}
              data-aos="zoom-in"
              className="group relative block cursor-pointer overflow-hidden rounded-3xl shadow-md"
            >
              <img
                src={city.img}
                alt={city.name}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-black/20 p-4">
                <h4 className="text-xl font-bold text-white">{city.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
            <div className="relative h-72 md:h-80">
              <img
                src={infoImage}
                alt={infoTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-red-600 shadow">
                <Newspaper size={16} />
                Highlight
              </div>
              <div className="absolute right-0 bottom-0 left-0 p-6 text-white md:p-8">
                <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                  {infoTitle}
                </h3>
                <p className="mt-3 leading-relaxed text-white/85">
                  {infoDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
            <div className="relative h-72 md:h-80">
              <img
                src={promo2Image}
                alt={promo2Title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-green-600 shadow">
                <Sparkles size={16} />
                Promo Highlight
              </div>
              <div className="absolute right-0 bottom-0 left-0 p-6 text-white md:p-8">
                <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                  {promo2Title}
                </h3>
                <p className="mt-3 leading-relaxed text-white/85">
                  {promo2Description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {recentHotels.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <History size={16} />
                Recent Viewed
              </div>
              <h3 className="text-3xl font-bold">Terakhir Kamu Lihat</h3>
              <p className="mt-2 text-gray-500">
                Lanjutkan lihat hotel yang baru saja kamu kunjungi.
              </p>
            </div>

            <Link
              to="/hotels"
              className="font-semibold text-red-600 hover:underline"
            >
              Jelajahi Semua
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentHotels.map((hotel, i) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative">
                  <img
                    src={buildImageUrl(
                      hotel.thumbnail || hotel.hero_image,
                      "/images/hotel.jpg"
                    )}
                    alt={hotel.name}
                    className="h-56 w-full object-cover"
                  />

                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow">
                    <Eye size={13} />
                    Baru Dilihat
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {hotel.area || "Hotel"}
                    </span>
                  </div>

                  <h4 className="line-clamp-1 text-xl font-bold">
                    {hotel.name}
                  </h4>
                  <p className="mt-1 text-gray-500">
                    {hotel.city?.name || "-"}
                    {hotel.area ? ` • ${hotel.area}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {renderFacilityBadges(hotel)}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {hotel.address || "Alamat belum tersedia"}
                    </p>
                    <span className="text-sm font-medium text-red-600">
                      Lihat Lagi
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">Popular Hotels</h3>
            <p className="mt-2 text-gray-500">
              Pilihan hotel populer untuk transit maupun menginap.
            </p>
          </div>
          <Link
            to="/hotels"
            className="font-semibold text-red-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {loadingHotels ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-56 w-full bg-gray-200" />
                <div className="p-5">
                  <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
                  <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
                  <div className="mb-5 h-4 w-28 rounded bg-gray-200" />
                  <div className="h-5 w-32 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : popularHotels.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
            Belum ada hotel aktif yang tampil.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularHotels.map((hotel, i) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={buildImageUrl(hotel.thumbnail, "/images/hotel.jpg")}
                  alt={hotel.name}
                  className="h-56 w-full object-cover"
                />

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {hotel.area || "Hotel"}
                    </span>
                  </div>

                  <h4 className="line-clamp-1 text-xl font-bold">
                    {hotel.name}
                  </h4>
                  <p className="mt-1 text-gray-500">
                    {hotel.city?.name || "-"}
                    {hotel.area ? ` • ${hotel.area}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {renderFacilityBadges(hotel)}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {hotel.address || "Alamat belum tersedia"}
                    </p>
                    <span className="text-sm font-medium text-red-600">
                      Lihat Detail
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">Recommended Hotels</h3>
            <p className="mt-2 text-gray-500">
              Rekomendasi hotel real berdasarkan booking valid terbanyak.
            </p>
          </div>
          <Link
            to="/hotels"
            className="font-semibold text-red-600 hover:underline"
          >
            Explore More
          </Link>
        </div>

        {loadingHotels ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-56 w-full bg-gray-200" />
                <div className="p-5">
                  <div className="mb-3 h-6 w-32 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
                  <div className="mb-4 h-4 w-full rounded bg-gray-200" />
                  <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-full bg-gray-200" />
                    <div className="h-7 w-20 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendedHotels.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
            Belum ada hotel rekomendasi yang tampil.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {recommendedHotels.map((hotel, i) => (
              <Link
                to={`/hotels/${hotel.id}`}
                key={hotel.id}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={buildImageUrl(
                    hotel.hero_image || hotel.thumbnail,
                    "/images/hotel.jpg"
                  )}
                  alt={hotel.name}
                  className="h-56 w-full object-cover"
                />

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {hotel.area || "Hotel"}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Top Choice
                    </span>
                  </div>

                  <h4 className="line-clamp-1 text-xl font-bold">
                    {hotel.name}
                  </h4>
                  <p className="mt-1 text-gray-500">
                    {hotel.city?.name || "-"}
                    {hotel.area ? ` • ${hotel.area}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {renderFacilityBadges(hotel)}
                  </div>

                  <p className="mt-4 line-clamp-2 min-h-[40px] text-sm text-gray-500">
                    {hotel.address || "Alamat hotel belum tersedia"}
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

      <section className="overflow-hidden bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.45fr]">
            <div data-aos="fade-right">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <Building2 size={16} />
                Discover Our Partners
              </div>

              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                Mitra Kami, tumbuh bersama ReadyRoom
              </h2>

              <p className="mt-4 max-w-xl leading-relaxed text-gray-500">
                ReadyRoom membuka kolaborasi dengan hotel, residence, transit stay,
                dan berbagai properti penginapan untuk menghadirkan pengalaman booking
                yang modern, cepat, dan terpercaya.
              </p>

              <p className="mt-4 max-w-xl leading-relaxed text-gray-500">
                Tampilkan brand properti kamu dengan tampilan profesional, dukungan
                promosi, dan sistem reservasi yang siap bersaing dengan hotel-hotel besar.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollPartners("left")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-red-200 hover:text-red-600"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollPartners("right")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div data-aos="fade-left" className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-14 bg-gradient-to-r from-white to-transparent md:block" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-14 bg-gradient-to-l from-white to-transparent md:block" />

              <div
                ref={partnerScrollRef}
                className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:gap-5 md:px-0"
              >
                {partnerBrands.map((brand, i) => (
                  <div
                    key={brand.name}
                    data-aos="zoom-in"
                    data-aos-delay={i * 80}
                    className="group min-w-[78vw] max-w-[78vw] overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl sm:min-w-[320px] sm:max-w-[320px]"
                  >
                    <div
                      className={`h-36 bg-gradient-to-br ${brand.accent} md:h-40`}
                    />

                    <div className="relative px-5 pb-6 md:px-6">
                      <div className="-mt-12 mb-5 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-4 border-white bg-white shadow-lg md:-mt-14 md:h-24 md:w-24 md:rounded-[1.7rem]">
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="h-12 w-12 object-contain md:h-14 md:w-14"
                        />
                      </div>

                      <h3 className="text-xl font-bold text-gray-800">
                        {brand.name}
                      </h3>

                      <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-gray-500">
                        {brand.description}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                        Join as Partner
                        <ArrowRight
                          size={15}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Mengapa Pilih <span className="text-red-600">ReadyRoom?</span>
          </h2>

          <p className="mx-auto mt-3 mb-14 max-w-2xl text-gray-500">
            Fasilitas premium, sistem booking fleksibel, dan pengalaman reservasi
            yang cepat untuk kebutuhan transit maupun menginap.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Clock size={26} />,
                title: "Booking Fleksibel",
                desc: "Durasi booking mulai dari 3 jam hingga 1 hari penuh",
              },
              {
                icon: <ShieldCheck size={26} />,
                title: "Aman & Terpercaya",
                desc: "Keamanan 24/7 dengan sistem booking terpercaya",
              },
              {
                icon: <MapPin size={26} />,
                title: "Lokasi Strategis",
                desc: "Cabang tersedia di berbagai kota besar Indonesia",
              },
              {
                icon: <Wifi size={26} />,
                title: "Wifi High Speed",
                desc: "Internet cepat dan stabil di setiap kamar",
              },
              {
                icon: <Car size={26} />,
                title: "Parkir Luas",
                desc: "Area parkir luas tersedia",
              },
              {
                icon: <Coffee size={26} />,
                title: "Fasilitas Premium",
                desc: "AC, TV, water heater dan fasilitas lengkap",
              },
            ].map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-sm backdrop-blur-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-2xl bg-red-500 p-3 text-white shadow-lg shadow-red-500/20">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="rounded-[2rem] bg-gradient-to-r from-red-600 via-red-500 to-rose-500 p-8 text-white shadow-2xl md:p-12">
            <div className="max-w-3xl">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Booking lebih cepat dengan ReadyRoom
              </h3>
              <p className="mb-6 text-lg text-red-100">
                Jelajahi hotel, pilih kamar, dan nikmati sistem booking fleksibel
                untuk transit maupun menginap.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/hotels"
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-gray-100"
                >
                  Explore Rooms
                </Link>
                <button className="rounded-2xl border border-white/20 bg-black/20 px-6 py-3 font-semibold transition hover:bg-black/30">
                  Download App Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}