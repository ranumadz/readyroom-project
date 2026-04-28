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

  const handleHotelCardOpen = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

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

  const heroMainImage = buildImageUrl(
    websiteContent?.hero_image,
    "/images/hotel.jpg"
  );

  const infoTitle = websiteContent?.info_title || "Info Terbaru ReadyRoom";

  const infoDescription =
    websiteContent?.info_description ||
    "Nikmati pengalaman booking hotel yang lebih cepat, aman, dan nyaman untuk kebutuhan harian maupun perjalanan bisnis.";

  const infoImage = buildImageUrl(websiteContent?.info_image, "/images/hotel.jpg");

  const promo2Title = websiteContent?.promo2_title || "Promo Tambahan ReadyRoom";

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

  const ScrollRow = ({ children, className = "" }) => {
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
        className={`-mx-4 cursor-grab overflow-x-auto px-4 pb-3 select-none [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden ${className}`}
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
        onClick={handleHotelCardOpen}
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

      <section className="relative overflow-visible pt-[70px] pb-14 sm:pt-[78px] sm:pb-16 md:pt-20 md:pb-28 lg:pb-32">
        <div className="absolute inset-0">
          <img
            src={heroMainImage}
            alt="ReadyRoom Hero"
            className="h-full w-full object-cover object-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/5" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div
            className="min-h-[205px] sm:min-h-[245px] md:min-h-[430px] lg:min-h-[500px]"
            data-aos="fade-up"
          />
        </div>

        <div className="absolute left-0 right-0 bottom-[-29px] z-30 px-3 sm:bottom-[-44px] md:px-6">
          <div className="mb-3 hidden justify-center md:flex">
            
          </div>

          <div className="mx-auto w-full max-w-[680px] sm:max-w-[760px] md:max-w-[980px] lg:max-w-[1180px]">
            <HeroSearchFilter />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 pb-3 md:px-6 md:pt-24 md:pb-10">
        <div className="mb-4 md:mb-8">
          <h3 className="text-lg font-bold md:text-3xl">
            Jelajahi Berdasarkan Kota
          </h3>
          <p className="mt-1 text-[11px] text-gray-500 md:mt-2 md:text-base">
            Temukan hotel ReadyRoom favorit di berbagai kota pilihan.
          </p>
        </div>

       <ScrollRow className="pr-6 md:pr-0">
  {cityItems.map((city, i) => (
    <Link
      draggable={false}
      to={`/hotels?destination=${encodeURIComponent(city.name)}`}
      key={i}
      data-aos="zoom-in"
      className="group relative block min-w-[88px] w-[24%] shrink-0 overflow-hidden rounded-[0.9rem] shadow-sm sm:min-w-[150px] md:w-[31.5%] md:min-w-[280px] md:rounded-[1.75rem] lg:min-w-[360px]"
    >
      <img
        draggable={false}
        src={city.img}
        alt={city.name}
        className="h-24 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-32 md:h-52"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2 md:p-4">
        <h4 className="text-xs font-bold text-white md:text-xl">
          {city.name}
        </h4>
      </div>
    </Link>
  ))}
</ScrollRow>
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
                Terakhir Kamu Lihat
              </div>

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
              Hotel Populer
            </div>

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
              Pilihan ReadyRoom
            </div>

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

      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fff7f7] to-[#f7f7f7] py-10 md:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-red-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-red-100/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-[-70px] h-52 w-52 rounded-full border-[34px] border-red-500/10 md:right-[-20px] md:h-80 md:w-80 md:border-[54px]" />
        <div className="pointer-events-none absolute bottom-28 right-8 h-24 w-24 rounded-full bg-red-400/10 blur-2xl md:h-40 md:w-40" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto mb-7 max-w-2xl text-center md:mb-14">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-[10px] font-bold text-red-600 shadow-sm md:text-sm">
              <BadgeCheck size={14} />
              ReadyRoom Advantage
            </div>

            <h2 className="text-xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
              Mengapa Pilih <span className="text-red-600">ReadyRoom?</span>
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-[11px] leading-relaxed text-gray-500 md:mt-4 md:text-base">
              Fasilitas premium, sistem booking fleksibel, dan pengalaman reservasi
              yang cepat untuk kebutuhan transit maupun menginap.
            </p>
          </div>

          <div className="relative grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {[
              {
                icon: <Clock size={24} />,
                title: "Booking Fleksibel",
                desc: "Durasi mulai dari 3 jam hingga 1 hari penuh.",
              },
              {
                icon: <ShieldCheck size={24} />,
                title: "Aman Terpercaya",
                desc: "Sistem booking lebih aman dan terpantau.",
              },
              {
                icon: <MapPin size={24} />,
                title: "Lokasi Strategis",
                desc: "Cabang tersedia di berbagai area pilihan.",
              },
              {
                icon: <Wifi size={24} />,
                title: "Wifi Cepat",
                desc: "Internet stabil untuk kebutuhan harian.",
              },
              {
                icon: <Car size={24} />,
                title: "Parkir Nyaman",
                desc: "Area parkir tersedia untuk tamu hotel.",
              },
              {
                icon: <Coffee size={24} />,
                title: "Fasilitas Lengkap",
                desc: "AC, TV, water heater, dan fasilitas kamar.",
              },
            ].map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 70}
                className="group relative min-h-[138px] overflow-hidden rounded-[1.25rem] border border-gray-100 bg-white/95 p-3.5 text-left shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-2xl md:min-h-[230px] md:rounded-[2rem] md:p-7"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-red-100/70 transition duration-300 group-hover:scale-125 md:h-32 md:w-32" />
                <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-red-50/80 md:h-32 md:w-32" />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 md:h-14 md:w-14">
                      {item.icon}
                    </div>

                    <span className="rounded-full bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-400 md:text-xs">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="text-[13px] font-extrabold leading-tight text-gray-950 md:text-xl">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-[10.5px] leading-relaxed text-gray-500 md:mt-3 md:text-sm">
                    {item.desc}
                  </p>
                </div>
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