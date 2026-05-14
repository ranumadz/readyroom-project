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
  MessageCircle,
  Bot,
  X,
  Navigation,
  ArrowRight,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const READYROOM_CS_WHATSAPP =
  "https://wa.me/62811150591?text=Halo%20CS%20ReadyRoom%2C%20saya%20butuh%20bantuan%20mencari%20hotel.";

const READYROOM_BRANDS = [
  {
    id: "red",
    name: "ReadyRoom Red",
   
    subtitle: "Pilihan cepat untuk transit 3, 6, dan 12 jam.",
    description:
      "Brand sample untuk cabang ReadyRoom yang fokus ke harga hemat, proses cepat, dan kebutuhan short stay harian.",
    panelClass: "from-[#310707] via-[#821313] to-[#ef2b2b]",
    chipClass: "bg-red-50 text-red-600 border-red-100",
    bullets: ["Transit fleksibel", "Harga hemat", "Booking cepat"],
  },
  {
    id: "blue",
    name: "ReadyRoom Blue",
    
    subtitle: "Pilihan nyaman untuk istirahat, pasangan, dan full day.",
    description:
      "Brand sample untuk pengalaman menginap yang lebih tenang, rapi, dan cocok untuk customer yang mengutamakan kenyamanan.",
    panelClass: "from-[#07152f] via-[#0f3b83] to-[#38bdf8]",
    chipClass: "bg-sky-50 text-sky-700 border-sky-100",
    bullets: ["Kamar nyaman", "Full Day ready", "Lokasi strategis"],
  },
  {
    id: "silver",
    name: "ReadyRoom Silver",

    subtitle: "Pilihan premium untuk partner dan properti unggulan.",
    description:
      "Brand sample untuk partner pilihan ReadyRoom dengan tampilan lebih eksklusif, fasilitas lebih lengkap, dan citra lebih premium.",
    panelClass: "from-[#111827] via-[#475569] to-[#cbd5e1]",
    chipClass: "bg-slate-50 text-slate-700 border-slate-200",
    bullets: ["Partner premium", "Fasilitas unggulan", "Kurasi ReadyRoom"],
  },
];

const MINROOM_QUICK_QUESTIONS = [
  "Cari ReadyRoom terdekat",
  "Hotel transit",
  "Rekomendasi Full Day",
  "Hotel murah di Jakarta",
  "Cari partner ReadyRoom",
  "Belum menemukan hotel",
];


export default function Home() {
  const [popularHotels, setPopularHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [recentHotels, setRecentHotels] = useState([]);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [activeBrand, setActiveBrand] = useState("red");
  const [minroomOpen, setMinroomOpen] = useState(false);
  const [minroomLocating, setMinroomLocating] = useState(false);
  const [minroomNearbyHotels, setMinroomNearbyHotels] = useState([]);
  const [minroomMessages, setMinroomMessages] = useState([
    {
      id: "minroom-welcome",
      role: "assistant",
      text:
        "Halo, aku Minroom. Hari ini mau kemana? Pilih panduan cepat di atas, nanti aku bantu arahkan ke hotel ReadyRoom yang paling relevan.",
    },
  ]);

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

  const forceNextPageStartFromTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      sessionStorage.setItem("readyroom_force_scroll_top", "1");
    } catch (error) {
      console.error("FORCE SCROLL TOP ERROR:", error);
    }
  };

  const handleHotelCardOpen = () => {
    forceNextPageStartFromTop();
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
    if (cleanPath.startsWith("storage/"))
      return `${BACKEND_BASE_URL}/${cleanPath}`;

    return `${BACKEND_BASE_URL}/storage/${cleanPath}`;
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);

    if (!amount || Number.isNaN(amount)) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHotelStartingPrice = (hotel) => {
    const directPrice =
      Number(hotel?.lowest_price || 0) ||
      Number(hotel?.min_price || 0) ||
      Number(hotel?.starting_price || 0) ||
      Number(hotel?.start_price || 0);

    if (directPrice > 0) {
      return {
        price: directPrice,
        label:
          hotel?.lowest_price_label ||
          hotel?.starting_price_label ||
          hotel?.min_price_label ||
          "3 Jam",
      };
    }

    const rooms = Array.isArray(hotel?.rooms)
      ? hotel.rooms
      : Array.isArray(hotel?.room)
      ? hotel.room
      : Array.isArray(hotel?.active_rooms)
      ? hotel.active_rooms
      : [];

    if (!rooms.length) {
      return {
        price: 0,
        label: "",
      };
    }

    const priceOptions = [];

    rooms.forEach((room) => {
      const options = [
        {
          price: Number(room?.price_transit_3h || room?.price_3h || 0),
          label: "3 Jam",
        },
        {
          price: Number(room?.price_transit_6h || room?.price_6h || 0),
          label: "6 Jam",
        },
        {
          price: Number(room?.price_transit_12h || room?.price_12h || 0),
          label: "12 Jam",
        },
        {
          price: Number(room?.price_per_night || room?.price_night || 0),
          label: "Full Day",
        },
      ];

      options.forEach((item) => {
        if (item.price > 0) priceOptions.push(item);
      });
    });

    if (!priceOptions.length) {
      return {
        price: 0,
        label: "",
      };
    }

    return priceOptions.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
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

  const loadRecentHotels = async () => {
    try {
      const storageKey = getCustomerStorageKey();
      const storedRecent = JSON.parse(localStorage.getItem(storageKey) || "[]");

      if (!Array.isArray(storedRecent) || storedRecent.length === 0) {
        setRecentHotels([]);
        return;
      }

      const res = await api.get("/hotels");
      const freshHotels = Array.isArray(res.data?.data) ? res.data.data : [];

      const mergedRecent = storedRecent.map((storedHotel) => {
        const freshHotel = freshHotels.find(
          (hotel) => String(hotel.id) === String(storedHotel.id)
        );

        return freshHotel
          ? {
              ...storedHotel,
              ...freshHotel,
            }
          : storedHotel;
      });

      setRecentHotels(mergedRecent);

      localStorage.setItem(storageKey, JSON.stringify(mergedRecent));
    } catch (error) {
      console.error("LOAD RECENT HOTELS ERROR:", error);

      try {
        const storageKey = getCustomerStorageKey();
        const storedRecent = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setRecentHotels(Array.isArray(storedRecent) ? storedRecent : []);
      } catch (fallbackError) {
        console.error("LOAD RECENT HOTELS FALLBACK ERROR:", fallbackError);
        setRecentHotels([]);
      }
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

  const getHotelBookingScore = (hotel) => {
    const scoreOptions = [
      hotel?.bookings_count,
      hotel?.booking_count,
      hotel?.total_bookings,
      hotel?.booked_count,
      hotel?.reservation_count,
      hotel?.order_count,
      hotel?.total_orders,
      hotel?.completed_bookings_count,
      hotel?.paid_bookings_count,
    ]
      .map((value) => Number(value || 0))
      .filter((value) => value > 0 && !Number.isNaN(value));

    return scoreOptions.length ? Math.max(...scoreOptions) : 0;
  };

  const bookingCrowdHotels = useMemo(() => {
    if (!popularHotels.length) return [];

    const hotelScores = popularHotels.map((hotel, index) => ({
      hotel,
      index,
      score: getHotelBookingScore(hotel),
    }));

    const hasBookingScore = hotelScores.some((item) => item.score > 0);

    if (!hasBookingScore) return popularHotels;

    return hotelScores
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((item) => item.hotel);
  }, [popularHotels]);

  const getHotelRecommendationScore = (hotel) => {
    const startingPrice = getHotelStartingPrice(hotel);
    const facilitiesCount = Array.isArray(hotel?.facilities)
      ? hotel.facilities.length
      : 0;
    const roomsCount = Array.isArray(hotel?.rooms) ? hotel.rooms.length : 0;
    const hasImage = hotel?.thumbnail || hotel?.hero_image ? 1 : 0;
    const bookingScore = getHotelBookingScore(hotel);
    const priceScore =
      startingPrice?.price > 0
        ? Math.max(0, 12 - Math.min(startingPrice.price / 50000, 12))
        : 0;

    return (
      bookingScore * 2.5 +
      facilitiesCount * 1.4 +
      roomsCount * 1.2 +
      hasImage * 2 +
      priceScore
    );
  };

  const recommendedHotels = useMemo(() => {
    if (!popularHotels.length) return [];

    return [...popularHotels]
      .map((hotel, index) => ({
        hotel,
        index,
        score: getHotelRecommendationScore(hotel),
      }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((item) => item.hotel)
      .slice(0, 6);
  }, [popularHotels]);

  const heroMainImage = buildImageUrl(
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

  const activeBrandData = useMemo(() => {
    return (
      READYROOM_BRANDS.find((brand) => brand.id === activeBrand) ||
      READYROOM_BRANDS[0]
    );
  }, [activeBrand]);

  const brandHotels = useMemo(() => {
    if (!popularHotels.length) return [];

    return popularHotels.slice(0, 4);
  }, [popularHotels]);

  const safeText = (value) => String(value || "").toLowerCase().trim();

  const getHotelCityName = (hotel) => {
    return (
      hotel?.city?.name ||
      hotel?.city_name ||
      hotel?.city ||
      hotel?.area ||
      ""
    );
  };

  const getHotelCoordinates = (hotel) => {
    const latitude = Number(
      hotel?.latitude || hotel?.lat || hotel?.location_lat || hotel?.map_lat || 0
    );
    const longitude = Number(
      hotel?.longitude || hotel?.lng || hotel?.location_lng || hotel?.map_lng || 0
    );

    if (
      !latitude ||
      !longitude ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return null;
    }

    return { latitude, longitude };
  };

  const calculateDistanceKm = (from, to) => {
    const earthRadius = 6371;
    const toRad = (degree) => (degree * Math.PI) / 180;

    const dLat = toRad(to.latitude - from.latitude);
    const dLng = toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.latitude)) *
        Math.cos(toRad(to.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  };

  const sortHotelsByNearest = (coords) => {
    const hotelsWithDistance = popularHotels
      .map((hotel) => {
        const hotelCoords = getHotelCoordinates(hotel);
        if (!hotelCoords) return null;

        return {
          ...hotel,
          distance_km: calculateDistanceKm(coords, hotelCoords),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance_km - b.distance_km);

    return hotelsWithDistance.length
      ? hotelsWithDistance.slice(0, 3)
      : popularHotels.slice(0, 3);
  };

  const getCityFromQuestion = (question) => {
    const query = safeText(question);
    return cityItems.find((city) => query.includes(safeText(city.name)));
  };

  const pickHotelsForMinroom = (question) => {
    const query = safeText(question);
    const selectedCity = getCityFromQuestion(question);

    if (
      query.includes("partner") ||
      query.includes("belum menemukan") ||
      query.includes("cs") ||
      query.includes("customer service")
    ) {
      return [];
    }

    if (query.includes("terdekat") && minroomNearbyHotels.length > 0) {
      return minroomNearbyHotels.slice(0, 3);
    }

    let hotels = [...popularHotels];

    if (selectedCity) {
      hotels = hotels.filter((hotel) => {
        const cityName = safeText(getHotelCityName(hotel));
        const address = safeText(hotel?.address);
        const area = safeText(hotel?.area);
        const selectedCityName = safeText(selectedCity.name);

        return (
          cityName.includes(selectedCityName) ||
          address.includes(selectedCityName) ||
          area.includes(selectedCityName)
        );
      });
    }

    if (
      query.includes("murah") ||
      query.includes("hemat") ||
      query.includes("promo") ||
      query.includes("harga")
    ) {
      hotels = [...hotels].sort((a, b) => {
        const priceA = getHotelStartingPrice(a)?.price || 999999999;
        const priceB = getHotelStartingPrice(b)?.price || 999999999;
        return priceA - priceB;
      });
    }

    if (query.includes("full day") || query.includes("fullday")) {
      hotels = hotels.filter((hotel) => {
        const rooms = Array.isArray(hotel?.rooms) ? hotel.rooms : [];
        if (!rooms.length) return true;
        return rooms.some((room) => Number(room?.price_per_night || 0) > 0);
      });
    }

    return (hotels.length ? hotels : popularHotels).slice(0, 3);
  };

  const createMinroomReply = (question, hotels) => {
    const query = safeText(question);
    const selectedCity = getCityFromQuestion(question);

    if (query.includes("partner")) {
      return "Untuk saat ini partner ReadyRoom belum tersedia di pencarian customer. Fitur ini sedang disiapkan agar nanti customer bisa memilih hotel berdasarkan brand/partner resmi ReadyRoom.";
    }

    if (
      query.includes("belum menemukan") ||
      query.includes("cs") ||
      query.includes("customer service")
    ) {
      return "Kalau belum menemukan hotel yang cocok, CS ReadyRoom bisa bantu arahkan pilihan terdekat dan ketersediaan kamar melalui WhatsApp.";
    }

    if (!popularHotels.length) {
      return "Aku belum menemukan data hotel aktif saat ini. Coba refresh halaman atau hubungi CS ReadyRoom untuk dibantu cek ketersediaan kamar.";
    }

    if (query.includes("terdekat")) {
      return minroomNearbyHotels.length > 0
        ? "Aku pilihkan ReadyRoom terdekat dari lokasimu. Kamu bisa buka detail hotel untuk cek kamar dan harga paling update."
        : "Aku bisa bantu cari yang terdekat. Klik tombol Pakai Lokasi Saya dulu ya, nanti aku urutkan dari yang paling dekat.";
    }

    if (selectedCity) {
      return `Untuk area ${selectedCity.name}, ini pilihan ReadyRoom yang paling relevan dari data hotel yang tersedia.`;
    }

    if (query.includes("full day") || query.includes("fullday")) {
      return "Untuk kebutuhan Full Day, aku pilihkan hotel yang cocok buat istirahat lebih lama dan pengalaman menginap yang nyaman.";
    }

    if (query.includes("murah") || query.includes("hemat") || query.includes("promo")) {
      return "Aku urutkan dari opsi yang terasa paling hemat dulu. Tetap cek detail kamar karena harga bisa berbeda tergantung tipe dan durasi.";
    }

    return "Aku pilihkan beberapa rekomendasi ReadyRoom yang bisa kamu cek dulu. Kamu juga bisa sebut kota, contoh: Bali, Jakarta, Semarang.";
  };

  const pushMinroomMessage = (message) => {
    setMinroomMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        ...message,
      },
    ]);
  };

  const handleMinroomSubmit = (customQuestion) => {
    const question = String(customQuestion || "").trim();
    if (!question) return;

    pushMinroomMessage({ role: "user", text: question });

    window.setTimeout(() => {
      const query = safeText(question);
      const hotels = pickHotelsForMinroom(question);
      const reply = createMinroomReply(question, hotels);
      const shouldShowWhatsapp =
        query.includes("partner") ||
        query.includes("belum menemukan") ||
        query.includes("cs") ||
        query.includes("customer service");

      pushMinroomMessage({
        role: "assistant",
        text: reply,
        hotels,
        whatsapp: shouldShowWhatsapp,
      });
    }, 250);
  };

  const handleMinroomUseLocation = () => {
    if (!navigator.geolocation) {
      pushMinroomMessage({
        role: "assistant",
        text: "Browser kamu belum mendukung akses lokasi. Kamu tetap bisa pilih template kota atau hubungi CS ReadyRoom untuk dibantu cek hotel terdekat.",
      });
      return;
    }

    setMinroomLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const nearbyHotels = sortHotelsByNearest(coords);
        setMinroomNearbyHotels(nearbyHotels);
        setMinroomLocating(false);

        pushMinroomMessage({
          role: "assistant",
          text:
            nearbyHotels.some((hotel) => hotel.distance_km)
              ? "Aku sudah cek lokasimu. Ini ReadyRoom terdekat yang bisa kamu lihat sekarang."
              : "Aku sudah cek lokasimu, tapi data koordinat hotel belum lengkap. Untuk sementara aku tampilkan rekomendasi ReadyRoom teratas dulu.",
          hotels: nearbyHotels,
        });
      },
      () => {
        setMinroomLocating(false);
        pushMinroomMessage({
          role: "assistant",
          text: "Akses lokasi belum diizinkan. Aman, kamu bisa pilih template pencarian atau hubungi CS ReadyRoom untuk dibantu cek hotel terdekat.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

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
      ? "Pilihan ReadyRoom"
      : "Ramai Dibooking";

  const BadgeIcon =
    variant === "recommended"
      ? Award
      : variant === "recent"
      ? Eye
      : BadgeCheck;

  const startingPrice = getHotelStartingPrice(hotel);

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

      <div className="flex min-h-[205px] flex-col p-2.5 md:min-h-[218px] md:p-3">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            

            
          </div>

          <h4 className="line-clamp-1 text-[13px] font-bold text-gray-900 md:text-[15px]">
            {hotel.name}
          </h4>

          <div className="mt-1 flex min-h-[54px] items-start gap-1.5 text-[11px] text-gray-500 md:min-h-[58px] md:text-xs">
            <MapPin size={12} className="mt-0.5 shrink-0 text-red-500" />

            <div className="min-w-0 flex-1">
              <span className="block line-clamp-1">
                {hotel.city?.name || "Lokasi hotel"}
              </span>

              <p className="mt-0.5 line-clamp-2 text-[10px] leading-[1.45] text-gray-500 md:text-[11px]">
                {hotel.address || "Alamat belum tersedia"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto translate-y-[-20px] rounded-2xl border border-red-100 bg-white px-3 py-2.5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition duration-300 group-hover:translate-y-[-12px] group-hover:border-red-200 group-hover:shadow-[0_12px_28px_rgba(239,68,68,0.10)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-red-500">
                Harga Mulai
              </p>

              {startingPrice?.price > 0 ? (
                <p className="mt-1 truncate text-[16px] font-black leading-none text-gray-950 md:text-[18px]">
                  {formatRupiah(startingPrice.price)}
                </p>
              ) : (
                <p className="mt-1 truncate text-[11px] font-extrabold leading-tight text-gray-950 md:text-[13px]">
                  Tersedia di detail
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-extrabold text-white shadow-[0_8px_18px_rgba(239,68,68,0.28)] transition group-hover:bg-red-700 md:px-3 md:py-1.5 md:text-[10px]">
              Booking
            </div>
          </div>
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

  const BrandHotelCard = ({ hotel, i }) => {
    const image = hotel.thumbnail || hotel.hero_image;
    const startingPrice = getHotelStartingPrice(hotel);

    return (
      <Link
        draggable={false}
        to={`/hotels/${hotel.id}`}
        onClick={handleHotelCardOpen}
        key={hotel.id}
        data-aos="fade-up"
        data-aos-delay={i * 70}
        className="group block w-[238px] shrink-0 overflow-hidden rounded-[1.15rem] border border-white/15 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[260px] md:w-[278px]"
      >
        <div className="relative">
          <img
            draggable={false}
            src={buildImageUrl(image, "/images/hotel.jpg")}
            alt={hotel.name}
            className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.04] md:h-40"
          />
          <div className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold text-gray-900 shadow">
            {activeBrandData.name}
          </div>
        </div>

        <div className="p-3">
          <h4 className="line-clamp-1 text-[13px] font-extrabold text-gray-950 md:text-[15px]">
            {hotel.name}
          </h4>

          <div className="mt-1.5 flex min-h-[42px] items-start gap-1.5 text-[10.5px] leading-relaxed text-gray-500 md:text-xs">
            <MapPin size={12} className="mt-0.5 shrink-0 text-red-500" />
            <div className="min-w-0">
              <p className="line-clamp-1 font-semibold text-gray-700">
                {hotel.city?.name || hotel.area || "Lokasi hotel"}
              </p>
              <p className="line-clamp-1">
                {hotel.address || "Alamat belum tersedia"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-red-100 bg-red-50/70 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[8.5px] font-black uppercase tracking-[0.16em] text-red-500">
                Harga Mulai
              </p>
              <p className="mt-0.5 truncate text-[13px] font-black text-gray-950 md:text-[15px]">
                {startingPrice?.price > 0
                  ? formatRupiah(startingPrice.price)
                  : "Cek detail"}
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-red-600" />
          </div>
        </div>
      </Link>
    );
  };

  const BrandSection = () => {
    return (
      <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
        <div className="mb-4 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
          
            <h3 className="text-lg font-extrabold text-gray-950 md:text-3xl">
              Cari Berdasarkan Brand
            </h3>
          </div>

          <Link
            to="/hotels"
            onClick={forceNextPageStartFromTop}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-[11px] font-bold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 md:text-sm"
          >
            Lihat Semua Brand
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-gray-100 bg-white shadow-sm md:rounded-[2rem]">
          <div className="grid grid-cols-3 bg-[#f7f7f7]">
            {READYROOM_BRANDS.map((brand) => {
              const isActive = brand.id === activeBrand;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setActiveBrand(brand.id)}
                  className={`relative min-h-[82px] border-b px-2.5 py-3 text-left transition duration-300 sm:min-h-[96px] md:min-h-[112px] md:px-6 md:py-5 ${
                    isActive
                      ? `border-transparent bg-gradient-to-br ${brand.panelClass} text-white shadow-[0_14px_35px_rgba(15,23,42,0.14)]`
                      : "border-gray-100 bg-white/75 text-gray-900 hover:bg-white"
                  }`}
                >
                  <div className="flex h-full flex-col justify-between gap-2">
                    <div className="flex items-center gap-2.5 md:gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border shadow-sm md:h-12 md:w-12 ${
                          isActive
                            ? "border-white/25 bg-white"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <img
                          src="/logo.png"
                          alt="ReadyRoom"
                          className="h-6 w-6 object-contain md:h-8 md:w-8"
                        />
                      </span>

                      <div className="min-w-0">
                        <p
                          className={`line-clamp-1 text-[12px] font-black leading-tight md:text-lg ${
                            isActive ? "text-white" : "text-gray-950"
                          }`}
                        >
                          {brand.name}
                        </p>
                        <p
                          className={`mt-1 hidden text-[10px] font-semibold leading-relaxed sm:line-clamp-2 md:text-xs ${
                            isActive ? "text-white/78" : "text-gray-500"
                          }`}
                        >
                          {brand.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`hidden h-1.5 w-16 rounded-full sm:block ${
                        isActive
                          ? "bg-white/80"
                          : brand.id === "red"
                          ? "bg-red-500/70"
                          : brand.id === "blue"
                          ? "bg-sky-500/70"
                          : "bg-slate-400/70"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className={`bg-gradient-to-br ${activeBrandData.panelClass} p-3.5 text-white md:p-7`}
          >
            <div className="rounded-[1rem] border border-white/20 bg-white/10 p-3.5 backdrop-blur md:rounded-[1.45rem] md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-gray-950 shadow-sm md:text-xs">
                    <BadgeCheck size={13} className="text-red-500" />
                    {activeBrandData.label}
                  </div>
                  <h3 className="text-xl font-black leading-tight md:text-4xl">
                    {activeBrandData.name}
                  </h3>
                  <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-white/82 md:text-base">
                    {activeBrandData.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:max-w-[520px] md:justify-end">
                  {activeBrandData.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[10.5px] font-bold text-white/95 md:px-4 md:py-2 md:text-sm"
                    >
                      ✓ {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              {loadingHotels ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-64 animate-pulse rounded-[1.15rem] bg-white/20"
                    />
                  ))}
                </div>
              ) : brandHotels.length > 0 ? (
                <ScrollRow className="md:-mx-7 md:px-7">
                  {brandHotels.map((hotel, i) => (
                    <BrandHotelCard key={hotel.id} hotel={hotel} i={i} />
                  ))}
                </ScrollRow>
              ) : (
                <div className="rounded-[1.1rem] border border-white/15 bg-white/10 p-6 text-center text-sm text-white/80">
                  Belum ada hotel aktif untuk ditampilkan pada brand ini.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center md:mt-6">
              <Link
                to="/hotels"
                onClick={forceNextPageStartFromTop}
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-[12px] font-black text-white transition hover:bg-white hover:text-red-600 md:px-7 md:py-3 md:text-sm"
              >
                Lihat Semua
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const MinroomAgent = () => {
    return (
      <div className="fixed bottom-3 right-3 z-[90] flex flex-col items-end gap-2 md:bottom-6 md:right-6 md:gap-3">
        {minroomOpen && (
          <div className="w-[calc(100vw-1rem)] max-w-[360px] overflow-hidden rounded-[1.2rem] border border-red-100 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.22)] md:max-w-[385px] md:rounded-[1.75rem]">
            <div className="bg-gradient-to-br from-[#7f1010] via-red-600 to-red-500 p-3.5 text-white md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg">
                    <Bot size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none">Minroom</p>
                    <p className="mt-1 text-[10px] font-medium text-red-50/90 md:text-[11px]">
                      Agent ReadyRoom
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMinroomOpen(false)}
                  className="rounded-full bg-white/15 p-1.5 transition hover:bg-white/25 md:p-2"
                  aria-label="Tutup Minroom"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-white/15 bg-white/12 p-2.5 backdrop-blur md:mt-4 md:p-3">
                <p className="text-[10px] font-semibold text-red-50/90 md:text-[11px]">
                  Pertanyaan hari ini
                </p>
                <p className="mt-0.5 text-sm font-black md:text-base">
                  Hari ini mau kemana?
                </p>
              </div>
            </div>

            <div className="max-h-[42vh] space-y-2.5 overflow-y-auto bg-[#fffafa] p-3 [scrollbar-width:thin] md:max-h-[430px] md:space-y-3 md:p-4">
              <button
                type="button"
                onClick={handleMinroomUseLocation}
                disabled={minroomLocating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-3 py-2 text-[11px] font-black text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 md:py-2.5 md:text-sm"
              >
                <Navigation size={14} />
                {minroomLocating ? "Mengecek lokasi..." : "Pakai Lokasi Saya"}
              </button>

              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {MINROOM_QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleMinroomSubmit(question)}
                    className="rounded-full border border-gray-100 bg-white px-2.5 py-1.5 text-[9.5px] font-bold text-gray-600 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 md:px-3 md:text-[10px]"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5 md:space-y-3">
                {minroomMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-[11px] leading-relaxed shadow-sm md:max-w-[88%] md:text-sm ${
                        message.role === "user"
                          ? "bg-red-600 text-white"
                          : "border border-gray-100 bg-white text-gray-700"
                      }`}
                    >
                      <p>{message.text}</p>

                      {Array.isArray(message.hotels) && message.hotels.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.hotels.map((hotel) => {
                            const startingPrice = getHotelStartingPrice(hotel);
                            return (
                              <Link
                                key={hotel.id}
                                to={`/hotels/${hotel.id}`}
                                onClick={handleHotelCardOpen}
                                className="group flex gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-2 transition hover:border-red-100 hover:bg-red-50"
                              >
                                <img
                                  src={buildImageUrl(
                                    hotel.thumbnail || hotel.hero_image,
                                    "/images/hotel.jpg"
                                  )}
                                  alt={hotel.name}
                                  className="h-14 w-16 shrink-0 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-1 text-[11px] font-black text-gray-950 md:text-xs">
                                    {hotel.name}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-gray-500">
                                    {hotel.distance_km
                                      ? `${hotel.distance_km.toFixed(1)} km dari lokasimu`
                                      : hotel.city?.name || hotel.area || "ReadyRoom"}
                                  </p>
                                  <p className="mt-1 text-[10px] font-black text-red-600">
                                    {startingPrice?.price > 0
                                      ? `Mulai ${formatRupiah(startingPrice.price)}`
                                      : "Cek harga di detail"}
                                  </p>
                                </div>
                                <ArrowRight
                                  size={15}
                                  className="mt-1 shrink-0 text-red-500 transition group-hover:translate-x-0.5"
                                />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {message.whatsapp && (
                        <a
                          href={READYROOM_CS_WHATSAPP}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#16a34a] px-3 py-1.5 text-[10px] font-black text-white shadow-sm transition hover:bg-[#15803d] md:text-[11px]"
                        >
                          <MessageCircle size={13} />
                          Chat CS
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-black text-gray-700 md:text-xs">
                    Butuh bantuan langsung?
                  </p>
                 
                </div>

                <a
                  href={READYROOM_CS_WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-black text-[#16a34a] transition hover:bg-[#16a34a] hover:text-white md:px-3.5 md:py-2 md:text-[11px]"
                  aria-label="WhatsApp CS ReadyRoom"
                >
                  <MessageCircle size={13} />
                  Chat CS
                </a>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMinroomOpen((prev) => !prev)}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#7f1010] via-red-600 to-red-500 p-0 text-white shadow-[0_16px_40px_rgba(239,68,68,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(239,68,68,0.45)] md:h-auto md:w-auto md:gap-3 md:px-4 md:py-3"
          aria-label="Buka Minroom Agent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 md:h-10 md:w-10">
            <MessageCircle size={20} />
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-xs font-black leading-none">Minroom</span>
            <span className="mt-1 block text-[10px] font-semibold text-red-50/90">
              Tanya hotel terdekat
            </span>
          </span>
        </button>
      </div>
    );
  };


  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f8f8] text-gray-800">
      <Navbar />

      <section className="relative overflow-visible pt-[62px] pb-14 sm:pt-[70px] sm:pb-16 md:pt-20 md:pb-28 lg:pb-32">
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
            className="min-h-[245px] sm:min-h-[285px] md:min-h-[430px] lg:min-h-[500px]"
            data-aos="fade-up"
          />
        </div>

        <div className="absolute left-0 right-0 bottom-[-29px] z-30 px-3 sm:bottom-[-44px] md:px-6">
          <div className="mb-3 hidden justify-center md:flex" />

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

        <ScrollRow className="pr-20 md:pr-0">
          {cityItems.map((city, i) => (
            <Link
              draggable={false}
              to={`/hotels?destination=${encodeURIComponent(city.name)}`}
              onClick={forceNextPageStartFromTop}
              key={i}
              data-aos="zoom-in"
              className="group relative block min-w-[104px] w-[29%] shrink-0 overflow-hidden rounded-[0.9rem] shadow-sm sm:min-w-[150px] md:w-[31.5%] md:min-w-[280px] md:rounded-[1.75rem] lg:min-w-[360px]"
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

      {/*
        SECTION "Cari Berdasarkan Brand" sementara di-hide dulu sesuai revisi bos.
        Kode BrandSection tidak dihapus, hanya pemanggilannya yang dikomentari.
        Kalau nanti mau ditampilkan lagi, aktifkan kembali baris ini: <BrandSection />
      */}

      <section className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-3 md:gap-8 lg:grid-cols-2">
          {[
            {
              image: infoImage,
              title: infoTitle,
              desc: infoDescription,
             
              icon: Newspaper,
              color: "text-red-600",
            },
            {
              image: promo2Image,
              title: promo2Title,
              desc: promo2Description,
              
              icon: Award,
              color: "text-green-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
  <div
    key={`${item.title}-${item.image}`}
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
              onClick={forceNextPageStartFromTop}
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
              Properti yang ramai dibooking dan sering dipilih customer ReadyRoom.
            </p>
          </div>

          <Link
            to="/hotels"
            onClick={forceNextPageStartFromTop}
            className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline md:text-base"
          >
            Lihat Semua
          </Link>
        </div>

        <HorizontalHotelSection
          loading={loadingHotels}
          emptyText="Belum ada hotel aktif yang tampil."
        >
          {bookingCrowdHotels.map((hotel, i) => (
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
              Pilihan hotel yang terasa paling value dari harga, fasilitas, dan kenyamanan.
            </p>
          </div>

          <Link
            to="/hotels"
            onClick={forceNextPageStartFromTop}
            className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline md:text-base"
          >
            Lihat Semua
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
              Jangkauan ReadyRoom
            </p>

            <h2 className="mt-2.5 text-xl font-bold leading-tight md:text-5xl">
              Temukan ReadyRoom di Berbagai Tempat
            </h2>

            <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-red-50/85 md:mt-5 md:text-base">
              Nikmati pilihan hotel ReadyRoom di berbagai area strategis untuk kebutuhan transit, istirahat, maupun perjalanan singkat.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-4">
              <Link
                to="/hotels"
                onClick={forceNextPageStartFromTop}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 md:px-6 md:py-3 md:text-base"
              >
                Lihat Properti
              </Link>

              
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
                  onClick={forceNextPageStartFromTop}
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

      <MinroomAgent />

      <Footer />
    </div>
  );
}