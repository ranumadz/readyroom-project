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
  Building2,
  Award,
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

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    fetchPopularHotels();
    loadRecentHotels();
    fetchWebsiteContent();
  }, []);

  useEffect(() => {
    const handleFocus = () => loadRecentHotels();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchPopularHotels = async () => {
    try {
      setLoadingHotels(true);
      const res = await api.get("/hotels");
      const hotels = Array.isArray(res.data?.data) ? res.data.data : [];
      setPopularHotels(hotels.slice(0, 10));
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

    if (cleanPath.startsWith("images/")) return `/${cleanPath}`;
    if (cleanPath.startsWith("storage/")) return `${BACKEND_BASE_URL}/${cleanPath}`;

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
        return Award;
    }
  };

  const renderFacilityBadges = (hotel, limit = 3) => {
    const facilities = Array.isArray(hotel?.facilities)
      ? hotel.facilities.slice(0, limit)
      : [];

    if (facilities.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 md:px-2.5 md:py-1 md:text-[11px]">
          <Building2 size={11} />
          Fasilitas
        </span>
      );
    }

    return facilities.map((facility) => {
      const FacilityIcon = getFacilityIcon(facility.icon);
      return (
        <span
          key={facility.id}
          className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 md:px-2.5 md:py-1 md:text-[11px]"
        >
          <FacilityIcon size={11} />
          {facility.name}
        </span>
      );
    });
  };

  const recommendedHotels = useMemo(() => {
    return popularHotels.slice(0, 6);
  }, [popularHotels]);

  const heroTitle =
    websiteContent?.hero_title ||
    websiteContent?.banner_title ||
    "ReadyRoom, Booking Hotel Lebih Mudah";

  const heroSubtitle =
    websiteContent?.hero_subtitle ||
    websiteContent?.banner_subtitle ||
    "Nikmati pengalaman booking yang cepat, nyaman, modern, dan fleksibel untuk kebutuhan transit maupun menginap.";

  const heroMainImage = buildImageUrl(
    websiteContent?.hero_image,
    "/images/hotel.jpg"
  );

  const infoTitle = websiteContent?.info_title || "Info Terbaru ReadyRoom";

  const infoDescription =
    websiteContent?.info_description ||
    "Nikmati pengalaman booking hotel yang lebih cepat, aman, dan nyaman untuk kebutuhan harian maupun perjalanan bisnis.";

  const infoImage = buildImageUrl(websiteContent?.info_image, "/images/hotel.jpg");

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

  const offerShowcaseImages = [
    "/galeri_mix.jpg",
    "/destinasi_bali.jpg",
    "/destinasi_surabaya.jpg",
  ];

  const ScrollRow = ({ children }) => {
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e) => {
      if (!scrollRef.current) return;

      isDragging.current = true;
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
      scrollRef.current.classList.add("cursor-grabbing");
    };

    const stopDragging = () => {
      isDragging.current = false;
      scrollRef.current?.classList.remove("cursor-grabbing");
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current || !scrollRef.current) return;

      e.preventDefault();

      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.35;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={handleMouseMove}
        className="-mx-4 cursor-grab overflow-x-auto px-4 pb-3 select-none [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-3 md:gap-4">{children}</div>
      </div>
    );
  };

  const HotelCard = ({
    hotel,
    i,
    variant = "popular",
    borderClass = "border-gray-100",
  }) => {
    const image =
      variant === "recommended"
        ? hotel.hero_image || hotel.thumbnail
        : hotel.thumbnail || hotel.hero_image;

    const badgeText =
      variant === "recent"
        ? "Baru Dilihat"
        : variant === "recommended"
        ? "Pilihan Kurasi"
        : "Popular Choice";

    const BadgeIcon =
      variant === "recommended" ? Award : variant === "recent" ? Eye : BadgeCheck;

    return (
      <Link
        draggable={false}
        to={`/hotels/${hotel.id}`}
        key={hotel.id}
        data-aos="fade-up"
        data-aos-delay={i * 80}
        className={`group block w-[230px] shrink-0 overflow-hidden rounded-[1.05rem] border ${borderClass} bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[250px] md:w-[270px] lg:w-[282px]`}
      >
        <div className="relative">
          <img
            draggable={false}
            src={buildImageUrl(image, "/images/hotel.jpg")}
            alt={hotel.name}
            className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-36 md:h-40"
          />

          <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-gray-800 shadow md:text-[10px]">
            <BadgeIcon size={10} className="text-red-500" />
            {badgeText}
          </div>
        </div>

        <div className="p-2.5 md:p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-semibold text-red-600 md:text-[10px]">
              {hotel.area || "Hotel"}
            </span>

            {variant !== "recent" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-700">
                <Eye size={10} />
                Banyak Dilihat
              </span>
            )}
          </div>

          <h4 className="line-clamp-1 text-[13px] font-bold text-gray-900 md:text-[15px]">
            {hotel.name}
          </h4>

          <p className="mt-0.5 text-[11px] text-gray-500 md:text-xs">
            {hotel.city?.name || "-"}
            {hotel.area ? ` • ${hotel.area}` : ""}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {renderFacilityBadges(hotel)}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-[10px] text-gray-500 md:text-[11px]">
              {hotel.address || "Alamat belum tersedia"}
            </p>

            <span className="shrink-0 text-[10px] font-semibold text-red-600 md:text-[11px]">
              {variant === "recent" ? "Lihat Lagi" : "Lihat Detail"}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const HorizontalHotelSection = ({
    children,
    loading,
    emptyText,
    skeletonCount = 4,
  }) => {
    if (loading) {
      return (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 md:gap-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={index}
                className="w-[230px] shrink-0 animate-pulse overflow-hidden rounded-[1.05rem] border border-gray-100 bg-white shadow-sm sm:w-[250px] md:w-[270px] lg:w-[282px]"
              >
                <div className="h-32 w-full bg-gray-200 sm:h-36 md:h-40" />
                <div className="p-2.5 md:p-3">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-36 rounded bg-gray-200" />
                  <div className="mb-3 h-3 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-28 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!children || children.length === 0) {
      return (
        <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm md:p-10">
          {emptyText}
        </div>
      );
    }

    return <ScrollRow>{children}</ScrollRow>;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f8f8] text-gray-800">
      <Navbar />

      <section className="relative overflow-visible pt-12 pb-5 sm:pt-[64px] sm:pb-7 md:pt-20 md:pb-44 lg:pb-52">
        <div className="absolute inset-0">
          <img
            src={heroMainImage}
            alt="ReadyRoom Hero"
            className="h-full w-full object-cover object-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#240000]/58 via-[#5f0a0a]/18 to-[#240000]/6 md:from-[#240000]/72 md:via-[#5f0a0a]/38 md:to-[#240000]/10" />
          <div className="absolute inset-0 bg-black/8 md:bg-black/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex min-h-[120px] items-start justify-center pt-4 sm:min-h-[155px] sm:pt-6 md:min-h-[430px] md:items-center md:pt-6 md:pb-32 lg:min-h-[500px] lg:pb-40">
            <div
              className="mx-auto flex w-full max-w-4xl flex-col items-center text-center text-white"
              data-aos="fade-up"
            >
              <h1 className="mt-1.5 max-w-[260px] text-balance break-words text-[15px] font-extrabold leading-[1.06] tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)] sm:max-w-[315px] sm:text-[19px] md:mt-5 md:max-w-[800px] md:text-[42px] lg:text-[52px] xl:text-[58px]">
                {loadingContent ? "Memuat tampilan hero..." : heroTitle}
              </h1>

              <p className="mt-1 max-w-[235px] text-[9px] leading-relaxed text-red-50/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.28)] sm:max-w-[295px] sm:text-[10px] md:mt-3 md:max-w-2xl md:text-[14px] lg:text-[15px]">
                {loadingContent
                  ? "Tunggu sebentar, konten sedang disiapkan."
                  : heroSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-30 mx-auto -mt-7 block max-w-3xl px-3 sm:-mt-6 md:hidden">
          <div className="mx-auto w-full max-w-[330px]">
            <HeroSearchFilter />
          </div>

          <div className="mt-1.5 flex justify-center">
            <Link
              to="/hotels"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-red-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-red-50"
            >
              Kunjungi Semua Hotel
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-[96px] z-30 mx-auto hidden max-w-6xl px-4 md:block md:px-6 lg:bottom-[108px]">
          <div className="mx-auto max-w-5xl">
            <HeroSearchFilter />
          </div>

          <div className="mt-3 flex justify-center">
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-red-50"
            >
              Kunjungi Semua Hotel
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-7 pb-8 md:px-6 md:pt-20 md:pb-16">
        <div className="mb-4 md:mb-8">
          <h3 className="text-lg font-bold md:text-3xl">Explore by City</h3>
          <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-base">
            Temukan destinasi dan kamar favorit di berbagai kota.
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 md:grid md:grid-cols-6 md:gap-5">
            {cityItems.map((city, i) => (
              <Link
                draggable={false}
                to={`/hotels?destination=${encodeURIComponent(city.name)}`}
                key={i}
                data-aos="zoom-in"
                className="group relative block w-[135px] shrink-0 overflow-hidden rounded-[1rem] shadow-sm md:w-auto md:rounded-[1.75rem]"
              >
                <img
                  draggable={false}
                  src={city.img}
                  alt={city.name}
                  className="h-24 w-full object-cover transition duration-500 group-hover:scale-110 md:h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 md:p-4">
                  <h4 className="text-xs font-bold text-white md:text-xl">
                    {city.name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-3 md:gap-8 lg:grid-cols-2">
          {[
            {
              image: infoImage,
              title: infoTitle,
              desc: infoDescription,
              label: "Informasi Highlight",
              icon: Newspaper,
              color: "text-red-600",
            },
            {
              image: promo2Image,
              title: promo2Title,
              desc: promo2Description,
              label: "Promo Highlight",
              icon: Award,
              color: "text-green-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="overflow-hidden rounded-[1.15rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-[2rem]"
              >
                <div className="relative h-40 md:h-80">
                  <img
                    draggable={false}
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div
                    className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold ${item.color} shadow md:top-5 md:left-5 md:px-4 md:py-2 md:text-sm`}
                  >
                    <Icon size={13} />
                    {item.label}
                  </div>

                  <div className="absolute right-0 bottom-0 left-0 p-3.5 text-white md:p-8">
                    <h3 className="text-base font-bold leading-tight md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-white/85 md:mt-3 md:text-base">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {recentHotels.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
          <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 md:mb-4 md:px-4 md:py-2 md:text-sm">
                <History size={13} />
                Recent Viewed
              </div>
              <h3 className="text-lg font-bold md:text-3xl">
                Terakhir Kamu Lihat
              </h3>
              <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-base">
                Lanjutkan lihat hotel yang baru saja kamu kunjungi.
              </p>
            </div>

            <Link
              to="/hotels"
              className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline md:text-base"
            >
              Jelajahi Semua
            </Link>
          </div>

          <HorizontalHotelSection emptyText="Belum ada hotel yang baru dilihat.">
            {recentHotels.map((hotel, i) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                i={i}
                variant="recent"
                borderClass="border-gray-100"
              />
            ))}
          </HorizontalHotelSection>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 md:mb-4 md:px-4 md:py-2 md:text-sm">
              <WalletCards size={13} />
              Most Chosen
            </div>
            <h3 className="text-lg font-bold md:text-3xl">Popular Hotels</h3>
            <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-base">
              Properti yang paling sering dilihat dan dipilih customer.
            </p>
          </div>

          <Link
            to="/hotels"
            className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline md:text-base"
          >
            View All
          </Link>
        </div>

        <HorizontalHotelSection
          loading={loadingHotels}
          emptyText="Belum ada hotel aktif yang tampil."
        >
          {popularHotels.map((hotel, i) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              i={i}
              variant="popular"
              borderClass="border-gray-100"
            />
          ))}
        </HorizontalHotelSection>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 md:mb-4 md:px-4 md:py-2 md:text-sm">
              <ShieldCheck size={13} />
              Curated Picks
            </div>
            <h3 className="text-lg font-bold md:text-3xl">
              Recommended Hotels
            </h3>
            <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-base">
              Pilihan hotel yang dikurasi untuk pengalaman menginap yang lebih nyaman.
            </p>
          </div>

          <Link
            to="/hotels"
            className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline md:text-base"
          >
            Explore More
          </Link>
        </div>

        <HorizontalHotelSection
          loading={loadingHotels}
          emptyText="Belum ada hotel rekomendasi yang tampil."
        >
          {recommendedHotels.map((hotel, i) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              i={i}
              variant="recommended"
              borderClass="border-red-100"
            />
          ))}
        </HorizontalHotelSection>
      </section>

      <section className="bg-[#8f0f0f] py-10 text-white md:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 md:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
          <div data-aos="fade-right" className="flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-100/80 md:text-sm">
              Penawaran Tambahan
            </p>

            <h2 className="mt-2.5 text-xl font-bold leading-tight md:text-5xl">
              Bikin properti kamu lebih menarik di mata tamu
            </h2>

            <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-red-50/85 md:mt-5 md:text-base">
              Tampilan yang rapi, modern, dan siap meningkatkan daya tarik
              properti kamu di setiap pencarian.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-4">
              <Link
                to="/hotels"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 md:px-6 md:py-3 md:text-base"
              >
                Lihat Properti
              </Link>

              <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 md:px-6 md:py-3 md:text-base">
                Lihat Detail
              </button>
            </div>
          </div>

          <div data-aos="fade-left">
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-4">
              <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/10 md:col-span-2 md:rounded-[2rem]">
                <img
                  draggable={false}
                  src={offerShowcaseImages[0]}
                  alt="Showcase utama ReadyRoom"
                  className="h-40 w-full object-cover md:h-80"
                />
              </div>

              <div className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/10 md:rounded-[1.75rem]">
                <img
                  draggable={false}
                  src={offerShowcaseImages[1]}
                  alt="Showcase kedua ReadyRoom"
                  className="h-32 w-full object-cover md:h-64"
                />
              </div>

              <div className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/10 md:rounded-[1.75rem]">
                <img
                  draggable={false}
                  src={offerShowcaseImages[2]}
                  alt="Showcase ketiga ReadyRoom"
                  className="h-32 w-full object-cover md:h-64"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-10 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-6 text-center md:mb-10">
            <h2 className="text-lg font-bold leading-tight md:text-4xl">
              Tumbuh bersama partner ReadyRoom
            </h2>

            <p className="mx-auto mt-2 max-w-3xl text-[11px] leading-relaxed text-gray-500 md:mt-4 md:text-base">
              Beberapa partner properti dan kolaborasi yang siap berkembang bersama
              ekosistem ReadyRoom.
            </p>
          </div>

          <div className="rounded-[1.15rem] border border-gray-100 bg-gradient-to-br from-white via-red-50/30 to-white p-2.5 shadow-sm md:rounded-[2rem] md:p-8">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
              {partnerLogos.map((partner, i) => (
                <div
                  key={partner.name}
                  data-aos="zoom-in"
                  data-aos-delay={i * 60}
                  className="group rounded-[1rem] border border-gray-100 bg-white px-2.5 py-3 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-[1.75rem] md:px-4 md:py-5"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[0.9rem] border border-gray-100 bg-gray-50 shadow-sm transition duration-300 group-hover:border-red-200 group-hover:bg-white md:h-20 md:w-20 md:rounded-[1.5rem]">
                    <img
                      draggable={false}
                      src={partner.logo}
                      alt={partner.name}
                      className="h-8 w-8 object-contain md:h-12 md:w-12"
                    />
                  </div>

                  <p className="mt-2 text-[11px] font-semibold text-gray-700 md:mt-4 md:text-base">
                    {partner.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-[#f7f7f7] py-10 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h2 className="text-lg font-bold md:text-4xl">
            Mengapa Pilih <span className="text-red-600">ReadyRoom?</span>
          </h2>

          <p className="mx-auto mt-2 mb-6 max-w-2xl text-[11px] text-gray-500 md:mt-3 md:mb-14 md:text-base">
            Fasilitas premium, sistem booking fleksibel, dan pengalaman reservasi
            yang cepat untuk kebutuhan transit maupun menginap.
          </p>

          <div className="grid gap-2.5 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: <Clock size={22} />,
                title: "Booking Fleksibel",
                desc: "Durasi booking mulai dari 3 jam hingga 1 hari penuh",
              },
              {
                icon: <ShieldCheck size={22} />,
                title: "Aman & Terpercaya",
                desc: "Keamanan 24/7 dengan sistem booking terpercaya",
              },
              {
                icon: <MapPin size={22} />,
                title: "Lokasi Strategis",
                desc: "Cabang tersedia di berbagai kota besar Indonesia",
              },
              {
                icon: <Wifi size={22} />,
                title: "Wifi High Speed",
                desc: "Internet cepat dan stabil di setiap kamar",
              },
              {
                icon: <Car size={22} />,
                title: "Parkir Luas",
                desc: "Area parkir luas tersedia",
              },
              {
                icon: <Coffee size={22} />,
                title: "Fasilitas Premium",
                desc: "AC, TV, water heater dan fasilitas lengkap",
              },
            ].map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                className="rounded-[1.1rem] border border-white/40 bg-white p-3.5 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl md:rounded-[1.85rem] md:p-8"
              >
                <div className="mb-2.5 flex justify-center md:mb-4">
                  <div className="rounded-xl bg-red-500 p-2 text-white shadow-lg shadow-red-500/20 md:rounded-2xl md:p-3">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-xs font-semibold md:text-lg">{item.title}</h3>
                <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="rounded-[1.15rem] bg-gradient-to-r from-[#7f1010] via-red-600 to-red-500 p-4 text-white shadow-2xl md:rounded-[2rem] md:p-12">
            <div className="max-w-3xl">
              <h3 className="mb-2.5 text-lg font-bold md:mb-4 md:text-4xl">
                Booking lebih cepat dengan ReadyRoom
              </h3>
              <p className="mb-4 text-[11px] text-red-100 md:mb-6 md:text-lg">
                Jelajahi hotel, pilih kamar, dan nikmati sistem booking fleksibel
                untuk transit maupun menginap.
              </p>

              <div className="flex flex-wrap gap-2.5 md:gap-4">
                <Link
                  to="/hotels"
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-gray-100 md:px-6 md:py-3 md:text-base"
                >
                  Explore Rooms
                </Link>
                <button className="rounded-full border border-white/20 bg-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black/20 md:px-6 md:py-3 md:text-base">
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