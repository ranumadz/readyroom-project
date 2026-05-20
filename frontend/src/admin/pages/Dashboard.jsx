import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Building2,
  Users,
  CalendarCheck,
  ArrowUpRight,
  Wallet,
  BedDouble,
  CheckCircle2,
  Hotel,
  ClipboardList,
  ShieldCheck,
  Cpu,
  Layers3,
  Settings,
  BellRing,
  UserCog,
  Activity,
  Server,
  Database,
  Wifi,
  MapPinned,
  Radio,
  UserCheck,
  Route,
  RefreshCw,
  CircleDot,
  Globe2,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("admin_user") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const currentRole = (adminUser?.role || "").toLowerCase();
  const isIT = currentRole === "it";

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponseMs, setApiResponseMs] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [itMapFilter, setItMapFilter] = useState("all");
  const [endpointLatencies, setEndpointLatencies] = useState({});
  const [latencySamples, setLatencySamples] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!isIT) return undefined;

    const intervalId = window.setInterval(() => {
      fetchDashboardData(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [isIT]);

  const getNowPerformance = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const extractArrayData = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const timedRequest = async (key, label, path) => {
    const startedAt = getNowPerformance();
    const response = await api.get(path);
    const finishedAt = getNowPerformance();

    return {
      key,
      label,
      path,
      response,
      ms: Math.max(1, Math.round(finishedAt - startedAt)),
    };
  };

  const fetchDashboardData = async (showLoader = true) => {
    const requestStartedAt = getNowPerformance();

    try {
      if (showLoader) {
        setLoading(true);
      }

      const requests = [
        timedRequest("hotels", "Data Cabang", "/admin/hotels"),
        timedRequest("rooms", "Data Kamar", "/admin/rooms"),
        timedRequest("bookings", "Data Booking", "/admin/bookings"),
      ];

      if (isIT) {
        requests.push(timedRequest("internalUsers", "User Internal", "/admin/users/admin"));
        requests.push(timedRequest("customers", "Customer Web", "/admin/users/customers"));
      }

      const responses = await Promise.all(requests);
      const responseMap = responses.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {});

      const latencyMap = responses.reduce((acc, item) => {
        acc[item.key] = {
          label: item.label,
          path: item.path,
          ms: item.ms,
        };
        return acc;
      }, {});

      const hotelData = extractArrayData(responseMap.hotels?.response);
      const roomData = extractArrayData(responseMap.rooms?.response);
      const bookingData = extractArrayData(responseMap.bookings?.response);
      const internalData = extractArrayData(responseMap.internalUsers?.response);
      const customerData = extractArrayData(responseMap.customers?.response);

      setHotels(hotelData);
      setRooms(roomData);
      setBookings(bookingData);
      setInternalUsers(internalData);
      setCustomers(customerData);
      setEndpointLatencies(latencyMap);

      const requestFinishedAt = getNowPerformance();
      const totalResponseMs = Math.max(1, Math.round(requestFinishedAt - requestStartedAt));
      const averageEndpointMs = responses.length
        ? Math.round(
            responses.reduce((total, item) => total + Number(item.ms || 0), 0) /
              responses.length
          )
        : totalResponseMs;

      setApiResponseMs(averageEndpointMs);
      setLatencySamples((prev) => {
        const next = [
          ...prev,
          {
            time: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            latency: averageEndpointMs,
            total: totalResponseMs,
          },
        ];

        return next.slice(-12);
      });
      setLastSyncAt(new Date());
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const hariIni = new Date();

  const isHariSama = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);

    return (
      date.getFullYear() === hariIni.getFullYear() &&
      date.getMonth() === hariIni.getMonth() &&
      date.getDate() === hariIni.getDate()
    );
  };

  const isBulanSama = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);

    return (
      date.getFullYear() === hariIni.getFullYear() &&
      date.getMonth() === hariIni.getMonth()
    );
  };

  const totalBooking = bookings.length;

  const bookingHariIni = useMemo(() => {
    return bookings.filter((booking) => isHariSama(booking.check_in)).length;
  }, [bookings]);

  const checkInHariIni = useMemo(() => {
    return bookings.filter(
      (booking) => booking.status === "checked_in" || isHariSama(booking.check_in)
    ).length;
  }, [bookings]);

  const checkOutHariIni = useMemo(() => {
    return bookings.filter((booking) => isHariSama(booking.check_out)).length;
  }, [bookings]);

  const kamarTersedia = useMemo(() => {
    return rooms.reduce((total, room) => {
      return total + Number(room.available_rooms || 0);
    }, 0);
  }, [rooms]);

  const totalStokKamar = useMemo(() => {
    return rooms.reduce((total, room) => {
      return total + Number(room.total_rooms || 0);
    }, 0);
  }, [rooms]);

  const kamarTerpakai = useMemo(() => {
    return bookings.filter((booking) =>
      ["confirmed", "checked_in", "checked_out", "cleaning"].includes(
        booking.status
      )
    ).length;
  }, [bookings]);

  const tingkatHunian = useMemo(() => {
    if (!totalStokKamar) return 0;
    return Math.min(100, Math.round((kamarTerpakai / totalStokKamar) * 100));
  }, [kamarTerpakai, totalStokKamar]);

  const pemasukanHariIni = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.payment_status === "paid" && isHariSama(booking.check_in)
      )
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const pemasukanBulanIni = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.payment_status === "paid" && isBulanSama(booking.check_in)
      )
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const totalPemasukanDibayar = useMemo(() => {
    return bookings
      .filter((booking) => booking.payment_status === "paid")
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const customerAktif = useMemo(() => {
    const unique = new Set();

    bookings.forEach((booking) => {
      if (booking.user?.id) {
        unique.add(`user-${booking.user.id}`);
      } else if (booking.guest_phone) {
        unique.add(`phone-${booking.guest_phone}`);
      } else if (booking.guest_email) {
        unique.add(`email-${booking.guest_email}`);
      } else if (booking.guest_name) {
        unique.add(`name-${booking.guest_name}`);
      }
    });

    return unique.size;
  }, [bookings]);

  const analitikBooking = useMemo(() => {
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(hariIni.getDate() - i);

      const jumlahPerHari = bookings.filter((booking) => {
        if (!booking.check_in) return false;
        const bookingDate = new Date(booking.check_in);

        return (
          bookingDate.getFullYear() === targetDate.getFullYear() &&
          bookingDate.getMonth() === targetDate.getMonth() &&
          bookingDate.getDate() === targetDate.getDate()
        );
      }).length;

      result.push({
        name: namaHari[targetDate.getDay()],
        booking: jumlahPerHari,
      });
    }

    return result;
  }, [bookings]);

  const bookingTerbaru = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const aDate = new Date(a.created_at || a.check_in || 0).getTime();
        const bDate = new Date(b.created_at || b.check_in || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [bookings]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusBookingClass = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "checked_in":
        return "text-green-600 bg-green-50";
      case "checked_out":
        return "text-slate-600 bg-slate-100";
      case "cleaning":
        return "text-orange-600 bg-orange-50";
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const internalRoleStats = useMemo(() => {
    const initial = {
      boss: 0,
      super_admin: 0,
      admin: 0,
      receptionist: 0,
      pengawas: 0,
      it: 0,
    };

    internalUsers.forEach((user) => {
      const role = (user.role || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(initial, role)) {
        initial[role] += 1;
      }
    });

    return initial;
  }, [internalUsers]);

  const hotelAktif = useMemo(() => {
    return hotels.filter((hotel) => Number(hotel.status) === 1).length;
  }, [hotels]);

  const roomAktif = useMemo(() => {
    return rooms.filter((room) => Number(room.status) === 1 || room.status === true)
      .length;
  }, [rooms]);

  const recentInternalUsers = useMemo(() => {
    return [...internalUsers]
      .sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [internalUsers]);
  const getStableMapPoint = (seed, index = 0) => {
    const raw = String(seed || `readyroom-${index}`);
    let hash = 0;

    for (let i = 0; i < raw.length; i += 1) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }

    const positiveHash = Math.abs(hash + index * 97);

    return {
      x: 12 + (positiveHash % 74),
      y: 16 + ((positiveHash * 7) % 62),
    };
  };

  const getHotelIdFromBooking = (booking) => {
    return booking?.hotel_id || booking?.hotel?.id || booking?.hotelId || null;
  };

  const getHotelNameById = (hotelId) => {
    const hotel = hotels.find((item) => String(item.id) === String(hotelId));
    return hotel?.name || "Cabang belum diketahui";
  };

  const getPrimaryHotelForUser = (user, index = 0) => {
    const userHotels = Array.isArray(user?.hotels) ? user.hotels : [];

    if (userHotels.length > 0) {
      const firstHotel = userHotels[0];
      const hotelId =
        firstHotel?.id || firstHotel?.hotel_id || firstHotel?.pivot?.hotel_id || null;
      const matchedHotel = hotels.find((hotel) => String(hotel.id) === String(hotelId));

      return {
        id: hotelId || matchedHotel?.id || `internal-${user?.id || index}`,
        name:
          matchedHotel?.name ||
          firstHotel?.name ||
          firstHotel?.hotel?.name ||
          "Cabang internal",
      };
    }

    const directHotelId = user?.hotel_id || user?.branch_id || user?.hotel?.id || null;
    const directHotel = hotels.find((hotel) => String(hotel.id) === String(directHotelId));

    if (directHotel) {
      return {
        id: directHotel.id,
        name: directHotel.name,
      };
    }

    const fallbackHotel = hotels[index % Math.max(1, hotels.length)];

    return {
      id: fallbackHotel?.id || `internal-${user?.id || index}`,
      name: fallbackHotel?.name || "Kantor Pusat ReadyRoom",
    };
  };

  const getUserPresenceStatus = (user) => {
    const currentUserOnline =
      adminUser?.id && String(adminUser.id) === String(user?.id);

    const lastSeenRaw =
      user?.last_seen_at ||
      user?.last_activity_at ||
      user?.updated_at ||
      user?.created_at ||
      null;

    const lastSeenDate = lastSeenRaw ? new Date(lastSeenRaw) : null;
    const hasValidLastSeen =
      lastSeenDate && !Number.isNaN(lastSeenDate.getTime());

    if (currentUserOnline) {
      return {
        label: "Online",
        tone: "online",
        helper: "Akun sedang digunakan",
      };
    }

    if (hasValidLastSeen) {
      const minutesAgo = Math.max(
        0,
        Math.round((Date.now() - lastSeenDate.getTime()) / 60000)
      );

      if (minutesAgo <= 10) {
        return {
          label: "Aktif baru",
          tone: "online",
          helper: `${minutesAgo || 1} menit lalu`,
        };
      }

      if (minutesAgo <= 180) {
        return {
          label: "Baru aktif",
          tone: "idle",
          helper: `${minutesAgo} menit lalu`,
        };
      }
    }

    return {
      label: "Terdaftar",
      tone: "offline",
      helper: "Belum ada last_seen realtime",
    };
  };

  const branchOperationalStats = useMemo(() => {
    return hotels.map((hotel, index) => {
      const hotelBookings = bookings.filter(
        (booking) => String(getHotelIdFromBooking(booking)) === String(hotel.id)
      );

      const assignedInternalUsers = internalUsers.filter((user) => {
        const userHotels = Array.isArray(user.hotels) ? user.hotels : [];
        const hasHotelAccess = userHotels.some((userHotel) => {
          const userHotelId =
            userHotel?.id || userHotel?.hotel_id || userHotel?.pivot?.hotel_id || null;
          return String(userHotelId) === String(hotel.id);
        });

        return (
          hasHotelAccess ||
          String(user.hotel_id || "") === String(hotel.id) ||
          String(user.branch_id || "") === String(hotel.id) ||
          String(user.hotel?.id || "") === String(hotel.id)
        );
      });

      const bookingActive = hotelBookings.filter((booking) =>
        ["pending", "confirmed", "checked_in", "checked_out", "cleaning"].includes(
          booking.status
        )
      ).length;

      const roomCleaning = hotelBookings.filter(
        (booking) => booking.status === "cleaning"
      ).length;

      const point = getStableMapPoint(`${hotel.name}-${hotel.id}`, index);

      return {
        id: hotel.id,
        name: hotel.name || `Cabang ${index + 1}`,
        area: hotel.area || hotel.city?.name || "Area ReadyRoom",
        status: Number(hotel.status) === 1 || hotel.status === true,
        internalCount: assignedInternalUsers.length,
        bookingActive,
        roomCleaning,
        x: point.x,
        y: point.y,
      };
    });
  }, [hotels, bookings, internalUsers]);

  const operationalMapMarkers = useMemo(() => {
    const branchMarkers = branchOperationalStats.map((branch) => ({
      id: `branch-${branch.id}`,
      type: "branch",
      label: branch.name,
      subtitle: branch.area,
      detail: `${branch.bookingActive} booking aktif • ${branch.internalCount} user internal`,
      status: branch.status ? "Cabang aktif" : "Cabang nonaktif",
      x: branch.x,
      y: branch.y,
    }));

    const internalMarkers = internalUsers.slice(0, 16).map((user, index) => {
      const hotel = getPrimaryHotelForUser(user, index);
      const branchPoint =
        branchOperationalStats.find((branch) => String(branch.id) === String(hotel.id)) ||
        null;
      const fallbackPoint = getStableMapPoint(
        `${user.name || user.email || user.id}-internal`,
        index
      );
      const presence = getUserPresenceStatus(user);

      return {
        id: `internal-${user.id || index}`,
        type: "internal",
        label: user.name || user.email || `User Internal ${index + 1}`,
        subtitle: user.role || "internal",
        detail: hotel.name,
        status: `${presence.label} • ${presence.helper}`,
        x: Math.min(90, Math.max(8, (branchPoint?.x || fallbackPoint.x) + ((index % 3) - 1) * 3)),
        y: Math.min(82, Math.max(12, (branchPoint?.y || fallbackPoint.y) + ((index % 4) - 1) * 3)),
      };
    });

    const customerMarkers = bookings.slice(0, 18).map((booking, index) => {
      const hotelId = getHotelIdFromBooking(booking);
      const branchPoint =
        branchOperationalStats.find((branch) => String(branch.id) === String(hotelId)) ||
        null;
      const fallbackPoint = getStableMapPoint(
        `${booking.booking_code || booking.guest_phone || booking.id}-customer`,
        index
      );

      return {
        id: `customer-${booking.id || index}`,
        type: "customer",
        label:
          booking.user?.name ||
          booking.guest_name ||
          booking.booking_code ||
          `Customer ${index + 1}`,
        subtitle: booking.booking_code || "Booking customer",
        detail: booking.hotel?.name || getHotelNameById(hotelId),
        status: booking.status || "booking",
        x: Math.min(90, Math.max(8, (branchPoint?.x || fallbackPoint.x) + ((index % 5) - 2) * 2)),
        y: Math.min(82, Math.max(12, (branchPoint?.y || fallbackPoint.y) + ((index % 4) - 1) * 2)),
      };
    });

    return {
      branch: branchMarkers,
      internal: internalMarkers,
      customer: customerMarkers,
      all: [...branchMarkers, ...internalMarkers, ...customerMarkers],
    };
  }, [branchOperationalStats, internalUsers, bookings, hotels, adminUser?.id]);

  const visibleOperationalMapMarkers = useMemo(() => {
    return operationalMapMarkers[itMapFilter] || operationalMapMarkers.all;
  }, [operationalMapMarkers, itMapFilter]);

  const latestSystemActivities = useMemo(() => {
    const bookingActivities = bookingTerbaru.slice(0, 4).map((booking) => ({
      id: `booking-${booking.id}`,
      title: booking.booking_code || `Booking #${booking.id}`,
      desc: `${booking.hotel?.name || "Cabang"} • ${
        booking.user?.name || booking.guest_name || "Tamu"
      }`,
      meta: booking.status || "booking",
      tone: "cyan",
    }));

    const userActivities = recentInternalUsers.slice(0, 3).map((user) => ({
      id: `user-${user.id}`,
      title: user.name || user.email || "User internal",
      desc: user.email || "Akun internal ReadyRoom",
      meta: user.role || "role",
      tone: "blue",
    }));

    return [...bookingActivities, ...userActivities].slice(0, 6);
  }, [bookingTerbaru, recentInternalUsers]);


  const getPersonPhone = (person) => {
    return (
      person?.phone ||
      person?.phone_number ||
      person?.guest_phone ||
      person?.whatsapp ||
      person?.wa_number ||
      person?.mobile ||
      person?.telp ||
      person?.no_hp ||
      "-"
    );
  };

  const getCustomerDisplayName = (customer, index = 0) => {
    return (
      customer?.name ||
      customer?.guest_name ||
      customer?.user?.name ||
      customer?.email ||
      `Customer ${index + 1}`
    );
  };

  const getCustomerDisplayPhone = (customer) => {
    return getPersonPhone(customer);
  };

  const averageLatencyMs = useMemo(() => {
    if (latencySamples.length > 0) {
      return Math.round(
        latencySamples.reduce((total, item) => total + Number(item.latency || 0), 0) /
          latencySamples.length
      );
    }

    return apiResponseMs || 0;
  }, [latencySamples, apiResponseMs]);

  const systemHealthScore = useMemo(() => {
    if (!averageLatencyMs) return 0;

    if (averageLatencyMs <= 450) return 96;
    if (averageLatencyMs <= 800) return 88;
    if (averageLatencyMs <= 1200) return 76;
    if (averageLatencyMs <= 1800) return 62;
    if (averageLatencyMs <= 2500) return 48;
    return 35;
  }, [averageLatencyMs]);

  const systemHealthLabel = useMemo(() => {
    if (!averageLatencyMs) return "Menunggu data";
    if (systemHealthScore >= 90) return "Sangat stabil";
    if (systemHealthScore >= 75) return "Normal";
    if (systemHealthScore >= 60) return "Mulai lambat";
    return "Perlu pengecekan";
  }, [averageLatencyMs, systemHealthScore]);

  const systemHealthTone = useMemo(() => {
    if (systemHealthScore >= 75) return "good";
    if (systemHealthScore >= 55) return "warning";
    return "danger";
  }, [systemHealthScore]);

  const systemRecommendation = useMemo(() => {
    if (!averageLatencyMs) {
      return "Dashboard sedang mengumpulkan sample endpoint. Tunggu auto refresh pertama untuk membaca kondisi aplikasi.";
    }

    if (systemHealthScore >= 90) {
      return "Aplikasi terasa sehat. Response endpoint utama masih cepat dan aman untuk operasional.";
    }

    if (systemHealthScore >= 75) {
      return "Aplikasi normal. Tetap pantau saat jam ramai, terutama Booking List dan data customer.";
    }

    if (systemHealthScore >= 60) {
      return "Aplikasi mulai lambat. Cek koneksi VPS, beban query booking, dan ukuran data yang dimuat.";
    }

    return "Perlu pengecekan IT. Prioritaskan cek server, database, dan endpoint booking/customer.";
  }, [averageLatencyMs, systemHealthScore]);

  const endpointLatencyList = useMemo(() => {
    return Object.values(endpointLatencies || {}).sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""))
    );
  }, [endpointLatencies]);

  const activeInternalCount = useMemo(() => {
    return internalUsers.filter((user) => {
      const presence = getUserPresenceStatus(user);
      return presence.tone === "online";
    }).length;
  }, [internalUsers, adminUser?.id]);

  const latestCustomerRows = useMemo(() => {
    const customerSource =
      customers.length > 0
        ? customers
        : bookingTerbaru.map((booking) => ({
            id: booking.user?.id || booking.id,
            name: booking.user?.name || booking.guest_name || "Customer booking",
            email: booking.user?.email || booking.guest_email || "-",
            phone: booking.guest_phone || booking.user?.phone || "-",
            source: booking.booking_code || "Booking",
          }));

    return [...customerSource].slice(0, 8);
  }, [customers, bookingTerbaru]);

  const liveMonitorSubtitle = useMemo(() => {
    if (!lastSyncAt) return "Belum ada sinkronisasi monitoring.";

    return `Auto refresh tiap 15 detik • sync terakhir ${lastSyncAt.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  }, [lastSyncAt]);


  if (isIT) {
    const apiStatus =
      averageLatencyMs === 0
        ? "Mengecek"
        : averageLatencyMs <= 800
        ? "Stabil"
        : averageLatencyMs <= 1800
        ? "Lambat"
        : "Berat";

    const databaseStatus = loading ? "Mengecek" : "Terhubung";
    const applicationServiceStatus = loading ? "Sinkronisasi" : "Online";
    const appLoadStatus = systemHealthLabel;

    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />

        <div className="flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.10),_transparent_22%),radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
          <Topbar />

          <div className="p-6 md:p-8">
            <div className="mb-8 overflow-hidden rounded-[30px] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                    <Cpu size={14} />
                    IT READYROOM
                  </div>

                  <h1 className="text-3xl font-bold text-white md:text-4xl">
                    IT ReadyRoom Control Center
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
                    Pusat monitoring sistem, user internal, customer booking,
                    dan peta operasional ReadyRoom tanpa mengganggu flow
                    operasional booking yang sudah berjalan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ITHeroBadge
                    icon={<ShieldCheck size={18} />}
                    title="Mode Sistem"
                    value={appLoadStatus}
                  />
                  <ITHeroBadge
                    icon={<Wifi size={18} />}
                    title="Response API"
                    value={averageLatencyMs ? `${averageLatencyMs} ms` : "..."}
                  />
                  <ITHeroBadge
                    icon={<Radio size={18} />}
                    title="Last Sync"
                    value={
                      lastSyncAt
                        ? lastSyncAt.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Belum sync"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ITStatCard
                icon={<UserCog size={22} />}
                title="User Internal"
                value={loading ? "..." : internalUsers.length}
                note="Admin, receptionist, pengawas, IT, boss"
              />
              <ITStatCard
                icon={<Users size={22} />}
                title="Customer Web"
                value={loading ? "..." : customers.length}
                note="Data customer terdaftar"
              />
              <ITStatCard
                icon={<Building2 size={22} />}
                title="Cabang Aktif"
                value={loading ? "..." : hotelAktif}
                note={`${hotels.length} total cabang/hotel tersimpan`}
              />
              <ITStatCard
                icon={<BedDouble size={22} />}
                title="Room Aktif"
                value={loading ? "..." : roomAktif}
                note={`${rooms.length} total data room`}
              />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
              <ITServiceStatusCard
                icon={<Activity size={20} />}
                title="Status Aplikasi"
                value={appLoadStatus}
                note="Gabungan response endpoint utama"
                tone={systemHealthTone}
              />
              <ITServiceStatusCard
                icon={<Server size={20} />}
                title="Layanan Aplikasi"
                value={applicationServiceStatus}
                note={averageLatencyMs ? `Rata-rata ${averageLatencyMs} ms` : "Menunggu response"}
                tone={systemHealthTone}
              />
              <ITServiceStatusCard
                icon={<Database size={20} />}
                title="Database"
                value={databaseStatus}
                note="Data hotel, room, booking berhasil dibaca"
                tone="good"
              />
              <ITServiceStatusCard
                icon={<Globe2 size={20} />}
                title="Koneksi Sistem"
                value={apiStatus}
                note="Sampling endpoint dashboard IT"
                tone={systemHealthTone}
              />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 2xl:grid-cols-5">
              <div className="2xl:col-span-2 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      Live Performance
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Rata-rata Kecepatan Aplikasi
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {liveMonitorSubtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchDashboardData(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300 transition hover:bg-cyan-400/20"
                    title="Refresh monitoring"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <ITCircularGauge
                    score={systemHealthScore}
                    latency={averageLatencyMs}
                    label={systemHealthLabel}
                    tone={systemHealthTone}
                  />

                  <div className="flex-1 space-y-3">
                    <ITMiniCard
                      title="User Internal Aktif"
                      value={loading ? "..." : `${activeInternalCount}/${internalUsers.length}`}
                    />
                    <ITMiniCard
                      title="Customer Terdaftar"
                      value={loading ? "..." : customers.length}
                    />
                    <ITMiniCard
                      title="Sample Monitoring"
                      value={loading ? "..." : `${latencySamples.length} sample`}
                    />
                  </div>
                </div>

                <div className="mt-6 h-40 rounded-3xl border border-white/5 bg-slate-950/45 p-4">
                  {latencySamples.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencySamples}>
                        <defs>
                          <linearGradient
                            id="latencyGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.34} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis hide allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(34,211,238,0.12)",
                            borderRadius: "16px",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="latency"
                          stroke="#22d3ee"
                          strokeWidth={3}
                          fill="url(#latencyGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                      Grafik latency akan muncul setelah beberapa kali auto refresh.
                    </div>
                  )}
                </div>
              </div>

              <div className="2xl:col-span-3 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      Network Monitor
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Jaringan Endpoint ReadyRoom
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Istilah teknis server dibuat lebih ramah menjadi Layanan Aplikasi supaya mudah dibaca tim operasional.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                      systemHealthTone === "good"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : systemHealthTone === "warning"
                        ? "bg-amber-400/10 text-amber-300"
                        : "bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {systemHealthLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    {endpointLatencyList.length > 0 ? (
                      endpointLatencyList.map((endpoint) => (
                        <ITNetworkEndpointRow
                          key={endpoint.path}
                          label={endpoint.label}
                          path={endpoint.path}
                          ms={endpoint.ms}
                        />
                      ))
                    ) : (
                      <p className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-400">
                        Belum ada data endpoint. Klik refresh monitoring.
                      </p>
                    )}
                  </div>

                  <ITMonitoringInsight
                    title="Analisa Kondisi Aplikasi"
                    description={systemRecommendation}
                    footer="Catatan IT: versi ini memakai sampling endpoint dashboard. Untuk rata-rata seluruh user lintas device secara server-side, nanti tinggal sambungkan endpoint server health/telemetry."
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 2xl:grid-cols-5">
              <div className="2xl:col-span-3">
                <ITOperationalMap
                  markers={visibleOperationalMapMarkers}
                  markerGroups={operationalMapMarkers}
                  branchStats={branchOperationalStats}
                  activeFilter={itMapFilter}
                  onFilterChange={setItMapFilter}
                  loading={loading}
                />
              </div>

              <div className="2xl:col-span-2 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Pengguna Internal
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Monitoring akun berdasarkan data user dan cabang tugas.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    <Users size={16} />
                    Kelola Users
                  </button>
                </div>

                <div className="space-y-3">
                  {recentInternalUsers.length > 0 ? (
                    recentInternalUsers.map((user, index) => {
                      const presence = getUserPresenceStatus(user);
                      const hotel = getPrimaryHotelForUser(user, index);

                      return (
                        <ITPresenceRow
                          key={user.id || `${user.email}-${index}`}
                          name={user.name || "-"}
                          email={user.email || "-"}
                          phone={getPersonPhone(user)}
                          role={user.role || "-"}
                          branch={hotel.name}
                          status={presence.label}
                          helper={presence.helper}
                          tone={presence.tone}
                        />
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-400">
                      Belum ada data user internal.
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                  <p className="text-sm font-semibold text-cyan-300">
                    Catatan privasi
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Titik user mengikuti cabang tugas, bukan GPS pribadi.
                    Status login realtime bisa dibuat lebih akurat nanti dengan
                    field last_seen di server.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 2xl:grid-cols-3">
              <div className="2xl:col-span-2 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      Data User & Customer
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Monitoring Akun dan Kontak
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Nama, email, nomor WA, role, dan cabang ditampilkan agar IT lebih cepat cek akun operasional.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    <Users size={16} />
                    Kelola Akun
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-white">User Internal</h3>
                      <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                        {internalUsers.length} akun
                      </span>
                    </div>

                    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                      {internalUsers.length > 0 ? (
                        internalUsers.slice(0, 8).map((user, index) => {
                          const presence = getUserPresenceStatus(user);
                          const hotel = getPrimaryHotelForUser(user, index);

                          return (
                            <ITUserDataRow
                              key={user.id || `${user.email}-${index}`}
                              name={user.name || "-"}
                              email={user.email || "-"}
                              phone={getPersonPhone(user)}
                              meta={user.role || "-"}
                              secondary={hotel.name}
                              status={presence.label}
                              tone={presence.tone}
                            />
                          );
                        })
                      ) : (
                        <p className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-400">
                          Belum ada user internal.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Customer / Pengguna</h3>
                      <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-300">
                        {latestCustomerRows.length} data tampil
                      </span>
                    </div>

                    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                      {latestCustomerRows.length > 0 ? (
                        latestCustomerRows.map((customer, index) => (
                          <ITUserDataRow
                            key={customer.id || customer.email || customer.phone || index}
                            name={getCustomerDisplayName(customer, index)}
                            email={customer.email || customer.guest_email || "-"}
                            phone={getCustomerDisplayPhone(customer)}
                            meta={customer.source || "Customer"}
                            secondary="Customer web / booking"
                            status="Tercatat"
                            tone="customer"
                          />
                        ))
                      ) : (
                        <p className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-400">
                          Belum ada data customer.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Catatan Monitoring
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Kondisi Aplikasi
                  </h2>
                </div>

                <div className="space-y-4">
                  <ITMonitoringInsight
                    title="Status saat ini"
                    description={systemRecommendation}
                    footer={`Rata-rata endpoint: ${averageLatencyMs || 0} ms • sample: ${latencySamples.length}`}
                  />

                  <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5">
                    <p className="text-sm font-semibold text-white">
                      Yang perlu dipantau IT
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
                      <li>• Booking List saat ramai check-in/check-out.</li>
                      <li>• Endpoint user dan customer kalau mulai di atas 1.800 ms.</li>
                      <li>• Database booking kalau jumlah data makin besar.</li>
                      <li>• Tambahkan fitur last_seen di server untuk status login realtime asli.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Control Center Tools
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Shortcut aman untuk modul teknis ReadyRoom. Tidak ada
                      tombol berbahaya seperti restart server atau clear cache
                      production di sini.
                    </p>
                  </div>

                  <button
                    onClick={() => fetchDashboardData(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    <RefreshCw size={16} />
                    Refresh Data
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ITOverviewCard
                    icon={<Users size={18} />}
                    title="User & Role"
                    desc="Kelola akun internal, role, dan akses operasional setiap pengguna ReadyRoom."
                    actionLabel="Buka Users"
                    onClick={() => navigate("/admin/users")}
                  />
                  <ITOverviewCard
                    icon={<Layers3 size={18} />}
                    title="Master Content"
                    desc="Kelola konten website, hero, promo, dan elemen visual customer-facing."
                    actionLabel="Buka Master Content"
                    onClick={() => navigate("/admin/master-content")}
                  />
                  <ITOverviewCard
                    icon={<Settings size={18} />}
                    title="System Settings"
                    desc="Area pengaturan sistem internal dan konfigurasi dasar admin panel."
                    actionLabel="Buka Settings"
                    onClick={() => navigate("/admin/settings")}
                  />
                  <ITOverviewCard
                    icon={<BellRing size={18} />}
                    title="Internal Broadcast"
                    desc="Panel pesan internal untuk komunikasi ke role operasional ReadyRoom."
                    actionLabel="Buka Broadcast"
                    onClick={() => navigate("/admin/internal-broadcasts")}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Distribusi Role Internal
                </h2>

                <div className="space-y-4">
                  <ITRoleRow label="Boss" value={loading ? "..." : internalRoleStats.boss} />
                  <ITRoleRow
                    label="Super Admin"
                    value={loading ? "..." : internalRoleStats.super_admin}
                  />
                  <ITRoleRow label="Admin" value={loading ? "..." : internalRoleStats.admin} />
                  <ITRoleRow
                    label="Receptionist"
                    value={loading ? "..." : internalRoleStats.receptionist}
                  />
                  <ITRoleRow
                    label="Pengawas"
                    value={loading ? "..." : internalRoleStats.pengawas}
                  />
                  <ITRoleRow label="IT" value={loading ? "..." : internalRoleStats.it} />
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Analitik Booking
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Pergerakan booking 7 hari terakhir dari sisi sistem.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/admin/bookings")}
                    className="text-sm font-medium text-cyan-300 hover:underline"
                  >
                    Lihat Booking
                  </button>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analitikBooking}>
                      <defs>
                        <linearGradient
                          id="itBookingGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22d3ee"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22d3ee"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1e293b"
                      />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis allowDecimals={false} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(34,211,238,0.12)",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="booking"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        fill="url(#itBookingGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Snapshot Operasional
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ITMiniCard
                    title="Booking Hari Ini"
                    value={loading ? "..." : bookingHariIni}
                  />
                  <ITMiniCard
                    title="Booking Pending"
                    value={
                      loading
                        ? "..."
                        : bookings.filter((b) => b.status === "pending").length
                    }
                  />
                  <ITMiniCard
                    title="Check-in Hari Ini"
                    value={loading ? "..." : checkInHariIni}
                  />
                  <ITMiniCard
                    title="Check-out Hari Ini"
                    value={loading ? "..." : checkOutHariIni}
                  />
                  <ITMiniCard
                    title="Pemasukan Hari Ini"
                    value={loading ? "..." : formatRupiah(pemasukanHariIni)}
                  />
                  <ITMiniCard
                    title="Pemasukan Bulan Ini"
                    value={loading ? "..." : formatRupiah(pemasukanBulanIni)}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                      <MapPinned size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Maps Operasional Aktif
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        Marker cabang, user internal, dan customer booking
                        sudah dipisahkan. Untuk peta real OpenStreetMap nanti
                        tinggal kita sambungkan dengan latitude/longitude cabang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Aktivitas Sistem Terbaru
                  </h2>
                  <span className="text-sm text-slate-400">
                    Booking & user
                  </span>
                </div>

                <div className="space-y-3">
                  {latestSystemActivities.length > 0 ? (
                    latestSystemActivities.map((activity) => (
                      <ITActivityRow
                        key={activity.id}
                        title={activity.title}
                        desc={activity.desc}
                        meta={activity.meta}
                      />
                    ))
                  ) : (
                    <p className="text-slate-400">Belum ada aktivitas terbaru.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Quick Control
                  </h2>
                  <span className="text-sm text-slate-400">
                    Akses cepat modul utama
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ITQuickButton
                    label="Users"
                    onClick={() => navigate("/admin/users")}
                  />
                  <ITQuickButton
                    label="Master Content"
                    onClick={() => navigate("/admin/master-content")}
                  />
                  <ITQuickButton
                    label="Settings"
                    onClick={() => navigate("/admin/settings")}
                  />
                  <ITQuickButton
                    label="Rooms"
                    onClick={() => navigate("/admin/rooms")}
                  />
                  <ITQuickButton
                    label="Booking List"
                    onClick={() => navigate("/admin/bookings")}
                  />
                  <ITQuickButton
                    label="Booking Calendar"
                    onClick={() => navigate("/admin/bookings/calendar")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Ringkasan sistem ReadyRoom dengan data real dari server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Building2 size={22} />}
              iconWrap="bg-red-100 text-red-600"
              title="Total Hotel"
              value={loading ? "..." : hotels.length}
              note="Data hotel dari server"
            />

            <StatCard
              icon={<BedDouble size={22} />}
              iconWrap="bg-blue-100 text-blue-600"
              title="Total Kamar"
              value={loading ? "..." : rooms.length}
              note="Data tipe kamar dari server"
            />

            <StatCard
              icon={<CalendarCheck size={22} />}
              iconWrap="bg-purple-100 text-purple-600"
              title="Total Booking"
              value={loading ? "..." : totalBooking}
              note={`${bookingHariIni} booking check-in hari ini`}
            />

            <StatCard
              icon={<Users size={22} />}
              iconWrap="bg-emerald-100 text-emerald-600"
              title="Customer Aktif"
              value={loading ? "..." : customerAktif}
              note="Dihitung dari data booking"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Analitik Booking
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pergerakan booking 7 hari terakhir
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/bookings")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Lihat Booking
                </button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analitikBooking}>
                    <defs>
                      <linearGradient
                        id="bookingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#dc2626"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="booking"
                      stroke="#dc2626"
                      strokeWidth={3}
                      fill="url(#bookingGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ringkasan Cepat
              </h2>

              <div className="space-y-4">
                <OverviewCard
                  title="Check-in Hari Ini"
                  value={loading ? "..." : checkInHariIni}
                />
                <OverviewCard
                  title="Check-out Hari Ini"
                  value={loading ? "..." : checkOutHariIni}
                />
                <OverviewCard
                  title="Kamar Tersedia"
                  value={loading ? "..." : kamarTersedia}
                />
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-sm text-red-500">Tingkat Hunian</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">
                    {loading ? "..." : `${tingkatHunian}%`}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Pemasukan Hari ini"
              value={loading ? "..." : formatRupiah(pemasukanHariIni)}
            />

            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Pemasukan Bulan Ini"
              value={loading ? "..." : formatRupiah(pemasukanBulanIni)}
            />

            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Total Pemasukan Dibayar"
              value={loading ? "..." : formatRupiah(totalPemasukanDibayar)}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <MiniSummaryCard
              icon={<CheckCircle2 size={18} />}
              title="Booking Aktif"
              value={
                loading
                  ? "..."
                  : bookings.filter((b) =>
                      ["confirmed", "checked_in", "checked_out", "cleaning"].includes(
                        b.status
                      )
                    ).length
              }
            />
            <MiniSummaryCard
              icon={<Hotel size={18} />}
              title="Stok Kamar"
              value={loading ? "..." : totalStokKamar}
            />
            <MiniSummaryCard
              icon={<ClipboardList size={18} />}
              title="Booking Pending"
              value={
                loading
                  ? "..."
                  : bookings.filter((b) => b.status === "pending").length
              }
            />
            <MiniSummaryCard
              icon={<CalendarCheck size={18} />}
              title="Booking Hari Ini"
              value={loading ? "..." : bookingHariIni}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Booking Terbaru
                </h2>
                <button
                  onClick={() => navigate("/admin/bookings")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-4">
                {bookingTerbaru.length > 0 ? (
                  bookingTerbaru.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.booking_code || `Booking #${booking.id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.hotel?.name || "-"} •{" "}
                          {booking.user?.name || booking.guest_name || "Tamu"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBookingClass(
                          booking.status
                        )}`}
                      >
                        {booking.status || "-"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada booking terbaru.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Aksi Cepat
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  label="Tambah Hotel"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => navigate("/admin/hotels/add")}
                />

                <QuickActionButton
                  label="Tambah Kamar"
                  className="bg-gray-900 text-white hover:bg-black"
                  onClick={() => navigate("/admin/rooms/add")}
                />

                <QuickActionButton
                  label="Kelola Booking"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => navigate("/admin/bookings")}
                />

                <QuickActionButton
                  label="Kalender Booking"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => navigate("/admin/bookings/calendar")}
                />
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BedDouble size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      Fokus Operasional Hari Ini
                    </h3>
                    <p className="text-sm text-red-100 mt-1">
                      Pantau booking aktif, pembayaran, check-in, check-out, dan
                      cleaning langsung dari dashboard dan booking list.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Hotel
              </h2>
              <span className="text-sm text-gray-500">
                Total: {hotels.length}
              </span>
            </div>

            {hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.slice(0, 6).map((hotel) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{hotel.name}</p>
                      <p className="text-sm text-gray-500">
                        {hotel.area} • {hotel.city?.name}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        hotel.status ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {hotel.status ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data hotel.</p>
            )}
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Kamar
              </h2>
              <span className="text-sm text-gray-500">
                Total: {rooms.length}
              </span>
            </div>

            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.slice(0, 6).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{room.name}</p>
                      <p className="text-sm text-gray-500">
                        {room.type} • {room.hotel?.name}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {formatRupiah(room.price_per_night)} / malam
                      </p>
                    </div>

                    <span className="text-sm font-medium text-blue-600">
                      Kapasitas: {room.capacity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data kamar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconWrap, title, value, note }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconWrap}`}>{icon}</div>
        <ArrowUpRight className="text-gray-400" size={18} />
      </div>

      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-green-500 text-sm mt-2">{note}</p>
    </div>
  );
}

function OverviewCard({ title, value }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  );
}

function MiniSummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>

      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function QuickActionButton({ label, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl transition font-medium ${className}`}
    >
      {label}
    </button>
  );
}

function ITHeroBadge({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-white/5 p-4 text-left backdrop-blur-sm">
      <div className="mb-3 inline-flex rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
        {icon}
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ITStatCard({ icon, title, value, note }) {
  return (
    <div className="rounded-[24px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          {icon}
        </div>
        <ArrowUpRight className="text-cyan-300/70" size={18} />
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{note}</p>
    </div>
  );
}

function ITOverviewCard({
  icon,
  title,
  desc,
  actionLabel,
  onClick,
  disabled = false,
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`mt-5 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
          disabled
            ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
            : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ITRoleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
        {value}
      </span>
    </div>
  );
}

function ITMiniCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
    </div>
  );
}

function ITQuickButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4 text-left font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
    >
      {label}
    </button>
  );
}

function ITServiceStatusCard({ icon, title, value, note, tone = "good" }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-400/15 bg-rose-400/10 text-rose-300"
      : tone === "warning"
      ? "border-amber-400/15 bg-amber-400/10 text-amber-300"
      : "border-emerald-400/15 bg-emerald-400/10 text-emerald-300";

  return (
    <div className="rounded-[24px] border border-cyan-400/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-2xl border p-3 ${toneClass}`}>{icon}</div>
        <CircleDot
          size={18}
          className={
            tone === "danger"
              ? "text-rose-300"
              : tone === "warning"
              ? "text-amber-300"
              : "text-emerald-300"
          }
        />
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-white">{value}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{note}</p>
    </div>
  );
}

function ITCircularGauge({ score, latency, label, tone }) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  const toneColor =
    tone === "danger" ? "#fb7185" : tone === "warning" ? "#f59e0b" : "#22d3ee";

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full p-3 shadow-2xl"
        style={{
          background: `conic-gradient(${toneColor} ${safeScore * 3.6}deg, rgba(15,23,42,0.95) 0deg)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950 text-center">
          <p className="text-4xl font-black text-white">{safeScore}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Health
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-200">{label}</p>
          <p className="mt-1 text-xs text-slate-400">
            {latency ? `${latency} ms` : "mengukur"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ITNetworkEndpointRow({ label, path, ms }) {
  const tone =
    ms <= 800 ? "good" : ms <= 1800 ? "warning" : "danger";
  const toneClass =
    tone === "good"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "warning"
      ? "bg-amber-400/10 text-amber-300"
      : "bg-rose-400/10 text-rose-300";

  const barWidth = Math.max(8, Math.min(100, Math.round((Number(ms || 0) / 2500) * 100)));

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{path}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-bold ${toneClass}`}>
          {ms} ms
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${
            tone === "good"
              ? "bg-emerald-400"
              : tone === "warning"
              ? "bg-amber-400"
              : "bg-rose-400"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

function ITMonitoringInsight({ title, description, footer }) {
  return (
    <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-5">
      <div className="mb-3 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
        <Activity size={18} />
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
      <p className="mt-4 rounded-2xl border border-white/5 bg-slate-950/45 px-4 py-3 text-xs leading-relaxed text-slate-400">
        {footer}
      </p>
    </div>
  );
}

function ITUserDataRow({ name, email, phone, meta, secondary, status, tone }) {
  const toneClass =
    tone === "online"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "idle"
      ? "bg-amber-400/10 text-amber-300"
      : tone === "customer"
      ? "bg-rose-400/10 text-rose-300"
      : "bg-slate-700/60 text-slate-300";

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{email}</p>
          <p className="mt-1 text-xs font-semibold text-cyan-200">WA: {phone || "-"}</p>
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
          {status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
          {meta}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          {secondary}
        </span>
      </div>
    </div>
  );
}

function ITOperationalMap({
  markers,
  markerGroups,
  branchStats,
  activeFilter,
  onFilterChange,
  loading,
}) {
  const filters = [
    { key: "all", label: "Semua Titik", count: markerGroups.all.length },
    { key: "branch", label: "Cabang", count: markerGroups.branch.length },
    { key: "internal", label: "User Internal", count: markerGroups.internal.length },
    { key: "customer", label: "Customer", count: markerGroups.customer.length },
  ];

  const getMarkerClass = (type) => {
    if (type === "internal") {
      return "border-blue-200 bg-blue-500 shadow-blue-500/40";
    }

    if (type === "customer") {
      return "border-rose-200 bg-rose-500 shadow-rose-500/40";
    }

    return "border-amber-200 bg-amber-400 shadow-amber-500/40";
  };

  const getMarkerIcon = (type) => {
    if (type === "internal") return <UserCheck size={14} />;
    if (type === "customer") return <Users size={14} />;
    return <Building2 size={14} />;
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-cyan-400/10 bg-white/5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-cyan-400/10 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            <MapPinned size={13} />
            Maps Operasional
          </div>
          <h2 className="text-xl font-semibold text-white">
            Peta Titik User & Customer
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Titik cabang, user internal, dan customer booking dipisah agar mudah dipantau.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                activeFilter === filter.key
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-cyan-400/10 bg-slate-900/70 text-cyan-200 hover:bg-cyan-400/10"
              }`}
            >
              {filter.label}
              <span className="ml-2 rounded-full bg-black/15 px-2 py-0.5">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="relative min-h-[430px] overflow-hidden bg-[radial-gradient(circle_at_30%_25%,rgba(34,211,238,0.16),transparent_18%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_20%),linear-gradient(135deg,#06111f_0%,#0f172a_48%,#020617_100%)]">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-[12%] top-[18%] h-32 w-48 rounded-full border border-cyan-300/30" />
            <div className="absolute right-[10%] top-[20%] h-40 w-64 rounded-full border border-blue-300/20" />
            <div className="absolute bottom-[12%] left-[22%] h-44 w-72 rounded-full border border-emerald-300/20" />
            <div className="absolute bottom-[18%] right-[18%] h-28 w-52 rounded-full border border-rose-300/20" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-300/20" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-300/20" />
          </div>

          <div className="absolute left-6 top-6 z-10 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Route size={16} className="text-cyan-300" />
              ReadyRoom Network Map
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Mode aman: titik mengikuti cabang & booking, bukan GPS pribadi.
            </p>
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex flex-wrap gap-2">
            <MapLegend color="bg-amber-400" label="Cabang" />
            <MapLegend color="bg-blue-500" label="User Internal" />
            <MapLegend color="bg-rose-500" label="Customer" />
          </div>

          {loading ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20">
              <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/70 px-5 py-4 text-sm font-semibold text-cyan-200 backdrop-blur">
                Memuat titik operasional...
              </div>
            </div>
          ) : markers.length > 0 ? (
            markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                title={`${marker.label} • ${marker.detail}`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-white shadow-lg ring-4 ring-white/10 transition group-hover:scale-110 ${getMarkerClass(
                    marker.type
                  )}`}
                >
                  {getMarkerIcon(marker.type)}
                </span>

                <span className="pointer-events-none absolute left-1/2 top-11 z-30 hidden w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-left shadow-2xl backdrop-blur group-hover:block">
                  <span className="block text-sm font-bold text-white">
                    {marker.label}
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-wide text-cyan-300">
                    {marker.subtitle}
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-slate-300">
                    {marker.detail}
                  </span>
                  <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-200">
                    {marker.status}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4 text-center text-sm text-slate-300 backdrop-blur">
                Belum ada titik untuk filter ini.
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-cyan-400/10 bg-slate-950/45 p-5 xl:border-l xl:border-t-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">
              Ringkasan Cabang
            </h3>
            <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              {branchStats.length} cabang
            </span>
          </div>

          <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
            {branchStats.length > 0 ? (
              branchStats.slice(0, 8).map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-2xl border border-white/5 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{branch.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{branch.area}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        branch.status
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {branch.status ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      <p className="text-xs text-slate-400">Internal</p>
                      <p className="font-bold text-cyan-300">{branch.internalCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      <p className="text-xs text-slate-400">Booking</p>
                      <p className="font-bold text-blue-300">{branch.bookingActive}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 px-2 py-2">
                      <p className="text-xs text-slate-400">Cleaning</p>
                      <p className="font-bold text-amber-300">{branch.roomCleaning}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-400">
                Belum ada data cabang untuk ditampilkan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapLegend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function ITPresenceRow({ name, email, phone, role, branch, status, helper, tone }) {
  const toneClass =
    tone === "online"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "idle"
      ? "bg-amber-400/10 text-amber-300"
      : "bg-slate-700/60 text-slate-300";

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="mt-1 text-xs text-slate-400">{email}</p>
          <p className="mt-1 text-xs font-semibold text-cyan-200">WA: {phone || "-"}</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
          {status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
          {role}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          {branch}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
          {helper}
        </span>
      </div>
    </div>
  );
}

function ITActivityRow({ title, desc, meta }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/70 p-4">
      <div className="mt-1 rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
        <Activity size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{title}</p>
        <p className="mt-1 truncate text-sm text-slate-400">{desc}</p>
      </div>

      <span className="shrink-0 rounded-full border border-cyan-400/10 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
        {meta}
      </span>
    </div>
  );
}

