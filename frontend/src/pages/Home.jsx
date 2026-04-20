import { useEffect, useMemo, useState } from "react";
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
  BadgeCheck,
  WalletCards,
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
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 900,
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
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
            >
              <FacilityIcon size={13} />
              {facility.name}
            </span>
          );
        })}
      </>
    );
  };

  const recommendedHotels = useMemo(() => {
    return popularHotels.slice(0, 3);
  }, [popularHotels]);

  const heroTitle =
    loadingContent
      ? ""
      : websiteContent?.hero_title ||
        "Booking hotel lebih mudah bersama ReadyRoom";

  const heroSubtitle =
    loadingContent
      ? ""
      : websiteContent?.hero_subtitle ||
        "Temukan hotel yang nyaman, lokasi strategis, dan proses booking yang cepat untuk kebutuhan transit maupun menginap.";

  const heroMainImage = buildImageUrl(
    websiteContent?.hero_image,
    "/images/hotel.jpg"
  );

  const infoTitle =
    websiteContent?.info_title || "Info Terbaru ReadyRoom";

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

  const cityItems = [
    { img: "/photo_jakarta.jpg", name: "Jakarta" },
    { img: "/destinasi_bali.jpg", name: "Bali" },
    { img: "/destinasi aceh.jpg", name: "Aceh" },
    { img: "/tebing-breksi.jpg", name: "Yogyakarta" },
    { img: "/destinasi_surabaya.jpg", name: "Surabaya" },
    { img: "/destinasi-semarang.jpg", name: "Semarang" },
  ];

  const partnerLogos = [
    { name: "Royal Hotel", logo: "/royal_hotel.jpg" },
    { name: "Inna Hotel", logo: "/inna_hotel.jpg" },
    { name: "Grand Hotel", logo: "/grand hotel.jpg" },
    { name: "Manhattan", logo: "/mahantan_hotel.png" },
    { name: "Hotel Mulia", logo: "/hotel_mulia.jpg" },
    { name: "For Season Hotel", logo: "/for_season.jpg" },
    { name: "Falatehan Hotel", logo: "/falatehan_hotel.png" },
    { name: "ReadyRoom Luxury", logo: "/readyroom.png" },
  ];

  const heroSlides = useMemo(() => {
    const rawSlides = [
      heroMainImage,
      "/galeri4.jpeg",
      "/galeri1.jpeg",
      "/galeri6.jpeg",
    ];

    return rawSlides.filter(Boolean);
  }, [heroMainImage]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides]);

  const activeHeroImage = heroSlides[activeHeroIndex] || "/images/hotel.jpg";

  const galleryItems = [
    {
      title: "Sudut Santai",
      subtitle: "Area duduk nyaman dengan pencahayaan alami",
      image: "/galeri7.jpg",
    },
    {
      title: "Nuansa Kamar Eksklusif",
      subtitle: "Nuansa hangat dan eksklusif",
      image: "/kamar1.jpg",
    },
    {
      title: "Tempat Rehat",
      subtitle: "Interior modern dengan sentuhan premium",
      image: "/kolam1.jpg",
    },
    {
      title: "Reception Experience",
      subtitle: "Pelayanan yang terasa rapi dan profesional",
      image: "/resepsionis.jpeg",
    },
  ];

  const offerShowcaseImages = [
    "/galeri_mix.jpg",
    "/destinasi_bali.jpg",
    "/destinasi_surabaya.jpg",
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f8f8] text-gray-800">
      <Navbar />

      <section className="relative pt-16 pb-24 md:pt-20 md:pb-28">
        <div className="absolute inset-0">
          <img
            src={activeHeroImage}
            alt="ReadyRoom Hero"
            className="h-full w-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#240000]/80 via-[#7a0c0c]/55 to-[#240000]/20" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex min-h-[440px] items-center justify-center md:min-h-[500px]">
            <div
              className="mx-auto -mt-28 flex max-w-4xl flex-col items-center text-center text-white md:-mt-32"
              data-aos="fade-up"
            >
              {heroTitle ? (
                <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl xl:text-[72px]">
                  {heroTitle}
                </h1>
              ) : (
                <div className="mb-4 h-14 w-4/5 animate-pulse rounded-2xl bg-white/15" />
              )}

              {heroSubtitle ? (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-red-50/95 md:text-lg">
                  {heroSubtitle}
                </p>
              ) : (
                <div className="mt-6 h-6 w-2/3 animate-pulse rounded-xl bg-white/10" />
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-[34px] z-30 mx-auto max-w-6xl px-4 md:bottom-[52px] md:px-6">
          <HeroSearchFilter />

          <div className="mt-3 flex justify-center">
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-red-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-red-50"
            >
              Kunjungi Semua Hotel
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6 md:pt-28">
        <div className="mb-8">
          <h3 className="text-3xl font-bold">Explore by City</h3>
          <p className="mt-2 text-gray-500">
            Temukan destinasi dan kamar favorit di berbagai kota.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-6">
          {cityItems.map((city, i) => (
            <Link
              to={`/hotels?destination=${encodeURIComponent(city.name)}`}
              key={i}
              data-aos="zoom-in"
              className="group relative block overflow-hidden rounded-[1.75rem] shadow-sm"
            >
              <img
                src={city.img}
                alt={city.name}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h4 className="text-lg font-bold text-white md:text-xl">
                  {city.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-72 md:h-80">
              <img
                src={infoImage}
                alt={infoTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-red-600 shadow">
                <Newspaper size={16} />
                Informasi Highlight
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

          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                className="block overflow-hidden rounded-[1.85rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <WalletCards size={16} />
              Most Chosen
            </div>
            <h3 className="text-3xl font-bold">Popular Hotels</h3>
            <p className="mt-2 text-gray-500">
              Properti yang paling sering dilihat dan dipilih customer.
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
                className="animate-pulse overflow-hidden rounded-[1.85rem] border border-gray-100 bg-white shadow-sm"
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
          <div className="rounded-[1.85rem] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
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
                className="group block overflow-hidden rounded-[1.85rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <div className="relative">
                  <img
                    src={buildImageUrl(hotel.thumbnail, "/images/hotel.jpg")}
                    alt={hotel.name}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                    <BadgeCheck size={13} className="text-red-500" />
                    Popular Choice
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {hotel.area || "Hotel"}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      <Eye size={13} />
                      Banyak Dilihat
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <ShieldCheck size={16} />
              Curated Picks
            </div>
            <h3 className="text-3xl font-bold">Recommended Hotels</h3>
            <p className="mt-2 text-gray-500">
              Pilihan hotel yang dikurasi untuk pengalaman menginap yang lebih nyaman.
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
                className="animate-pulse overflow-hidden rounded-[1.85rem] border border-gray-100 bg-white shadow-sm"
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
          <div className="rounded-[1.85rem] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
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
                className="group block overflow-hidden rounded-[1.85rem] border border-red-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <div className="relative">
                  <img
                    src={buildImageUrl(
                      hotel.hero_image || hotel.thumbnail,
                      "/images/hotel.jpg"
                    )}
                    alt={hotel.name}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                    <Sparkles size={13} className="text-red-500" />
                    Pilihan Kurasi
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {hotel.area || "Hotel"}
                    </span>

                    <span className="rounded-full bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-red-600">
                      Siap Dipilih
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

      <section className="overflow-hidden bg-gradient-to-br from-[#fff5f5] via-[#ffe9e9] to-[#fff7f7] py-20 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.05fr_1.1fr_0.95fr] lg:items-center">
            <div
              data-aos="fade-right"
              className="overflow-hidden rounded-[2rem] bg-white/70 p-2 shadow-[0_18px_50px_rgba(127,17,17,0.08)] backdrop-blur-sm"
            >
              <div className="overflow-hidden rounded-[1.7rem]">
                <img
                  src={galleryItems[0].image}
                  alt={galleryItems[0].title}
                  className="h-[360px] w-full object-cover object-center transition duration-500 hover:scale-[1.03] md:h-[470px]"
                />
              </div>
              <div className="px-2 pt-4 md:px-3">
                <h3 className="text-[28px] font-extrabold leading-[1.05] tracking-tight text-[#3d3b37] md:text-[38px]">
                  {galleryItems[0].title}
                </h3>
                <p className="mt-1 text-sm text-[#6e6961] md:text-base">
                  {galleryItems[0].subtitle}
                </p>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay={80}
              className="overflow-hidden rounded-[2rem] bg-white/70 p-2 shadow-[0_18px_50px_rgba(127,17,17,0.08)] backdrop-blur-sm"
            >
              <div className="px-2 pb-4 pt-2 md:px-3 md:pb-5">
                <h3 className="text-[28px] font-extrabold leading-[1.05] tracking-tight text-[#3d3b37] md:text-[38px]">
                  {galleryItems[1].title}
                </h3>
                <p className="mt-1 text-sm text-[#6e6961] md:text-base">
                  {galleryItems[1].subtitle}
                </p>
              </div>
              <div className="overflow-hidden rounded-[1.7rem]">
                <img
                  src={galleryItems[1].image}
                  alt={galleryItems[1].title}
                  className="h-[360px] w-full object-cover object-center transition duration-500 hover:scale-[1.03] md:h-[470px]"
                />
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay={140}
              className="overflow-hidden rounded-[2rem] bg-white/70 p-2 shadow-[0_18px_50px_rgba(127,17,17,0.08)] backdrop-blur-sm"
            >
              <div className="overflow-hidden rounded-[1.7rem]">
                <img
                  src={galleryItems[2].image}
                  alt={galleryItems[2].title}
                  className="h-[360px] w-full object-cover object-center transition duration-500 hover:scale-[1.03] md:h-[470px]"
                />
              </div>
              <div className="px-2 pt-4 md:px-3 md:pt-5">
                <h3 className="text-[28px] font-extrabold leading-[1.05] tracking-tight text-[#3d3b37] md:text-[38px]">
                  {galleryItems[2].title}
                </h3>
                <p className="mt-1 text-sm text-[#6e6961] md:text-base">
                  {galleryItems[2].subtitle}
                </p>
              </div>
            </div>

            <div
              data-aos="fade-left"
              className="flex h-full flex-col justify-center pl-0 lg:pl-4"
            >
              <p className="text-base font-medium uppercase tracking-[0.28em] text-[#a24b4b] md:text-lg">
                Galeri Properti
              </p>

              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight text-[#5c4a4a] md:text-[50px]">
                tempat rehat
                <span className="mt-1 block font-extrabold text-[#8f0f0f]">
                  Paling Tepat
                </span>
              </h2>

              <div className="mt-6 h-[2px] w-24 rounded-full bg-[#c26a6a]/45" />

              <p className="mt-6 max-w-sm text-base leading-8 text-[#6b5555] md:text-lg">
                Jelajahi pilihan properti dengan karakter ruang yang hangat,
                bersih, dan dirancang untuk memberi pengalaman menginap yang
                terasa lebih tenang, modern, dan berkelas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#8f0f0f] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div data-aos="fade-right" className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-100/80">
              Penawaran Tambahan
            </p>

            <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              Bikin properti kamu lebih menarik di mata tamu
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-red-50/85 md:text-base">
              Tampilan yang rapi, modern, dan siap meningkatkan daya tarik
              properti kamu di setiap pencarian.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/hotels"
                className="rounded-full bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Lihat Properti
              </Link>

              <button className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Lihat Detail
              </button>
            </div>
          </div>

          <div data-aos="fade-left">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:col-span-2">
                <img
                  src={offerShowcaseImages[0]}
                  alt="Showcase utama ReadyRoom"
                  className="h-64 w-full object-cover md:h-80"
                />
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10">
                <img
                  src={offerShowcaseImages[1]}
                  alt="Showcase kedua ReadyRoom"
                  className="h-52 w-full object-cover md:h-64"
                />
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10">
                <img
                  src={offerShowcaseImages[2]}
                  alt="Showcase ketiga ReadyRoom"
                  className="h-52 w-full object-cover md:h-64"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Tumbuh bersama partner ReadyRoom
            </h2>

            <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-gray-500">
              Beberapa partner properti dan kolaborasi yang siap berkembang bersama
              ekosistem ReadyRoom.
            </p>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-gradient-to-br from-white via-red-50/30 to-white p-5 shadow-sm md:p-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {partnerLogos.map((partner, i) => (
                <div
                  key={partner.name}
                  data-aos="zoom-in"
                  data-aos-delay={i * 60}
                  className="group rounded-[1.75rem] border border-gray-100 bg-white px-4 py-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-gray-100 bg-gray-50 shadow-sm transition duration-300 group-hover:border-red-200 group-hover:bg-white">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-11 w-11 object-contain md:h-12 md:w-12"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-700 md:text-base">
                    {partner.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-[#f7f7f7] py-20">
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
                className="rounded-[1.85rem] border border-white/40 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
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
          <div className="rounded-[2rem] bg-gradient-to-r from-[#7f1010] via-red-600 to-red-500 p-8 text-white shadow-2xl md:p-12">
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
                  className="rounded-full bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-gray-100"
                >
                  Explore Rooms
                </Link>
                <button className="rounded-full border border-white/20 bg-black/10 px-6 py-3 font-semibold transition hover:bg-black/20">
                  Promo & Informasi
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