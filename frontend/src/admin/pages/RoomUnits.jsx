import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomUnits() {
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [units, setUnits] = useState([]);

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [searchUnit, setSearchUnit] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [roomSelectWarning, setRoomSelectWarning] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingModalUnit, setBookingModalUnit] = useState(null);

  const [bulkAction, setBulkAction] = useState("");
  const [selectedBulkUnitIds, setSelectedBulkUnitIds] = useState([]);

  const [userAccessHotels, setUserAccessHotels] = useState([]);
  const [loadingUserAccessHotels, setLoadingUserAccessHotels] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const adminRole = String(adminUser?.role || "").toLowerCase();

  /*
   * Scope akses cabang untuk Monitoring Kamar:
   * - boss / super_admin / it bisa melihat semua cabang.
   * - admin / pengawas / receptionist mengikuti cabang yang dipilih di Kelola Users.
   */
  const canAccessAllHotels = ["boss", "super_admin", "it"].includes(adminRole);

  useEffect(() => {
    fetchRooms();
    fetchUserAccessHotels();
  }, []);

  useEffect(() => {
    setBulkAction("");
    setSelectedBulkUnitIds([]);
  }, [selectedHotelId, selectedRoom, selectedStatus, searchUnit]);

  const normalizeArrayResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    if (Array.isArray(payload?.units)) return payload.units;
    return [];
  };

  const normalizeHotelIdsFromList = (list) => {
    if (!Array.isArray(list)) return [];

    return list
      .map((hotel) => hotel?.id || hotel?.hotel_id || hotel?.value || null)
      .filter((id) => id !== null && id !== undefined && id !== "")
      .map((id) => String(id));
  };

  const fetchUserAccessHotels = async () => {
    if (!adminUser?.id || canAccessAllHotels) {
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
      return;
    }

    try {
      setLoadingUserAccessHotels(true);

      const res = await api.get("/admin/users/admin");
      const usersData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const currentUser = usersData.find(
        (user) => String(user.id) === String(adminUser.id)
      );

      const currentUserHotels = Array.isArray(currentUser?.hotels)
        ? currentUser.hotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

      setUserAccessHotels(currentUserHotels);
    } catch (error) {
      console.error("GET USER ACCESS HOTELS ERROR:", error.response?.data || error);
      setUserAccessHotels(Array.isArray(adminUser?.hotels) ? adminUser.hotels : []);
    } finally {
      setLoadingUserAccessHotels(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get("/admin/rooms");
      const roomList = normalizeArrayResponse(res.data);

      setRooms(roomList);
      setSelectedHotelId("");
      setSelectedRoom("all");
      setUnits([]);
    } catch (error) {
      console.error("Gagal mengambil data rooms:", error);
      toast.error("Gagal mengambil data tipe kamar");
    } finally {
      setLoadingRooms(false);
    }
  };

  const getRoomHotelId = (room) => room?.hotel_id || room?.hotel?.id;

  const assignedHotelIds = useMemo(() => {
    if (canAccessAllHotels) return [];

    const sourceHotels =
      Array.isArray(userAccessHotels) && userAccessHotels.length > 0
        ? userAccessHotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

    return normalizeHotelIdsFromList(sourceHotels);
  }, [adminUser, canAccessAllHotels, userAccessHotels]);

  const accessScopedRooms = useMemo(() => {
    if (canAccessAllHotels) return rooms;

    if (assignedHotelIds.length === 0) return [];

    return rooms.filter((room) =>
      assignedHotelIds.includes(String(getRoomHotelId(room)))
    );
  }, [rooms, assignedHotelIds, canAccessAllHotels]);

  const accessScopedHotels = useMemo(() => {
    const map = new Map();

    accessScopedRooms.forEach((room) => {
      const hotel = room?.hotel;
      const hotelId = getRoomHotelId(room);

      if (hotel?.id && hotel?.name) {
        map.set(String(hotel.id), hotel);
        return;
      }

      if (hotelId) {
        map.set(String(hotelId), {
          id: hotelId,
          name: room?.hotel_name || `Hotel #${hotelId}`,
        });
      }
    });

    const sourceHotels =
      canAccessAllHotels || userAccessHotels.length > 0
        ? userAccessHotels
        : Array.isArray(adminUser?.hotels)
        ? adminUser.hotels
        : [];

    sourceHotels.forEach((hotel) => {
      const hotelId = hotel?.id || hotel?.hotel_id || hotel?.value;

      if (!hotelId) return;

      if (!canAccessAllHotels && !assignedHotelIds.includes(String(hotelId))) {
        return;
      }

      if (!map.has(String(hotelId))) {
        map.set(String(hotelId), {
          ...hotel,
          id: hotelId,
          name: hotel?.name || hotel?.hotel_name || `Hotel #${hotelId}`,
        });
      }
    });

    return Array.from(map.values());
  }, [accessScopedRooms, adminUser, assignedHotelIds, canAccessAllHotels, userAccessHotels]);

  const enrichUnits = (unitList, room) => {
    return normalizeArrayResponse(unitList).map((unit) => ({
      ...unit,
      room: unit?.room || room || null,
      hotel: unit?.hotel || room?.hotel || null,
      room_type_name: room?.type || room?.name || unit?.room_type_name || "",
      room_name: room?.name || unit?.room_name || "",
      room_capacity: room?.capacity || unit?.room_capacity || "",
    }));
  };

  const fetchUnitsByRoom = async (roomId) => {
    if (!roomId || roomId === "all") {
      setUnits([]);
      return;
    }

    const room = accessScopedRooms.find((item) => String(item.id) === String(roomId));

    try {
      setLoadingUnits(true);
      const res = await api.get(`/admin/room-units/${roomId}`);
      setUnits(enrichUnits(res.data, room));
    } catch (error) {
      console.error("Gagal mengambil data room units:", error);
      toast.error("Gagal mengambil data kamar fisik");
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const hotelOptions = useMemo(() => {
    return [...accessScopedHotels].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [accessScopedHotels]);

  const selectedHotelData = useMemo(() => {
    if (!selectedHotelId) return null;

    return hotelOptions.find(
      (hotel) => String(hotel.id) === String(selectedHotelId)
    );
  }, [hotelOptions, selectedHotelId]);

  const roomsBySelectedHotel = useMemo(() => {
    if (!selectedHotelId) return [];

    const filteredRooms = accessScopedRooms.filter((room) => {
      const hotelId = getRoomHotelId(room);
      return String(hotelId) === String(selectedHotelId);
    });

    return [...filteredRooms].sort((a, b) => {
      const typeA = String(a?.type || a?.name || "");
      const typeB = String(b?.type || b?.name || "");
      return typeA.localeCompare(typeB);
    });
  }, [accessScopedRooms, selectedHotelId]);

  const fetchAllUnitsByHotel = async (hotelId) => {
    if (!hotelId) {
      setUnits([]);
      return;
    }

    const hotelRooms = accessScopedRooms.filter((room) => {
      const roomHotelId = getRoomHotelId(room);
      return String(roomHotelId) === String(hotelId);
    });

    if (hotelRooms.length === 0) {
      setUnits([]);
      setRoomSelectWarning("Cabang ini belum memiliki tipe kamar.");
      return;
    }

    try {
      setLoadingUnits(true);

      const responses = await Promise.allSettled(
        hotelRooms.map((room) => api.get(`/admin/room-units/${room.id}`))
      );

      const mergedUnits = [];

      responses.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const room = hotelRooms[index];
          mergedUnits.push(...enrichUnits(result.value.data, room));
        }
      });

      setUnits(mergedUnits);
    } catch (error) {
      console.error("Gagal mengambil semua kamar fisik:", error);
      toast.error("Gagal mengambil semua kamar fisik cabang");
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const statusTabs = [
    { value: "all", label: "Semua" },
    { value: "available", label: "Tersedia" },
    { value: "occupied", label: "Terisi" },
    { value: "cleaning", label: "Cleaning" },
    { value: "maintenance", label: "Maintenance" },
    { value: "inactive", label: "Nonaktif" },
  ];

  const isBookingInUseStatus = (booking) => {
    const raw = String(booking?.status || "").toLowerCase();
    return ["checked_in", "check_in", "checkin"].includes(raw);
  };

  const isBookingCleaningProcessStatus = (booking) => {
    const raw = String(booking?.status || "").toLowerCase();
    return ["cleaning", "start_cleaning", "in_cleaning", "proses_cleaning"].includes(raw);
  };

  const isBookingNeedsCleaningStatus = (booking) => {
    const raw = String(booking?.status || "").toLowerCase();
    return ["checked-out", "checked_out", "check_out", "checkout"].includes(raw);
  };

  const isBookingCleaningRelatedStatus = (booking) => {
    return isBookingCleaningProcessStatus(booking) || isBookingNeedsCleaningStatus(booking);
  };

  const getBookingVisualTone = (booking, isCurrentRoomBooking = false) => {
    if (isBookingInUseStatus(booking)) {
      return {
        cardClass: "border-red-100 bg-red-50",
        badgeClass: "bg-red-100 text-red-700",
        label: isCurrentRoomBooking ? "Sedang Dipakai Sekarang" : getBookingStatusText(booking),
      };
    }

    if (isBookingCleaningProcessStatus(booking)) {
      return {
        cardClass: "border-amber-100 bg-amber-50",
        badgeClass: "bg-amber-100 text-amber-700",
        label: "Sedang Cleaning",
      };
    }

    if (isBookingNeedsCleaningStatus(booking)) {
      return {
        cardClass: "border-amber-100 bg-amber-50",
        badgeClass: "bg-amber-100 text-amber-700",
        label: "Perlu Dibersihkan",
      };
    }

    return {
      cardClass: "border-blue-100 bg-blue-50/70",
      badgeClass: "bg-blue-100 text-blue-700",
      label: getBookingStatusText(booking),
    };
  };

  const getRoomUnitStatus = (unit) => {
    const monitoringStatus = String(unit?.monitoring_status || "").toLowerCase();
    const rawStatus = String(unit?.status ?? "").toLowerCase();
    const currentBooking = unit?.current_booking || unit?.active_booking || null;

    if (monitoringStatus === "maintenance") return "maintenance";
    if (monitoringStatus === "cleaning") return "cleaning";

    if (
      rawStatus === "maintenance" ||
      rawStatus === "rusak" ||
      unit?.is_maintenance === true ||
      unit?.maintenance_status === true
    ) {
      return "maintenance";
    }

    if (isBookingCleaningRelatedStatus(currentBooking)) {
      return "cleaning";
    }

    if (monitoringStatus === "occupied" || monitoringStatus === "booked") {
      return "occupied";
    }

    if (monitoringStatus === "inactive") return "inactive";
    if (monitoringStatus === "available") return "available";

    if (
      rawStatus === "cleaning" ||
      rawStatus === "dirty" ||
      unit?.is_cleaning === true ||
      unit?.cleaning_status === true
    ) {
      return "cleaning";
    }

    if (
      rawStatus === "occupied" ||
      rawStatus === "booked" ||
      rawStatus === "terisi" ||
      unit?.is_occupied === true ||
      unit?.booking_active === true ||
      unit?.active_booking === true ||
      unit?.current_booking
    ) {
      return "occupied";
    }

    if (
      rawStatus === "0" ||
      rawStatus === "false" ||
      rawStatus === "inactive" ||
      rawStatus === "nonaktif" ||
      unit?.status === false ||
      unit?.is_active === false ||
      unit?.available === false
    ) {
      return "inactive";
    }

    return "available";
  };

  const getStatusMeta = (status) => {
    const map = {
      available: {
        label: "Tersedia",
        shortLabel: "Tersedia",
        cardClass:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-800",
        badgeClass: "bg-emerald-100 text-emerald-700",
        dotClass: "bg-emerald-500",
      },
      occupied: {
        label: "Terisi",
        shortLabel: "Sedang Dipakai",
        cardClass:
          "border-red-200 bg-gradient-to-br from-red-50 to-white text-red-800",
        badgeClass: "bg-red-100 text-red-700",
        dotClass: "bg-red-500",
      },
      cleaning: {
        label: "Cleaning",
        shortLabel: "Sedang Cleaning",
        cardClass:
          "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-800",
        badgeClass: "bg-amber-100 text-amber-700",
        dotClass: "bg-amber-500",
      },
      maintenance: {
        label: "Maintenance",
        shortLabel: "Maintenance",
        cardClass:
          "border-slate-300 bg-gradient-to-br from-slate-100 to-white text-slate-800",
        badgeClass: "bg-slate-200 text-slate-700",
        dotClass: "bg-slate-500",
      },
      inactive: {
        label: "Nonaktif",
        shortLabel: "Nonaktif",
        cardClass:
          "border-gray-200 bg-gradient-to-br from-gray-100 to-white text-gray-700 opacity-75",
        badgeClass: "bg-gray-200 text-gray-600",
        dotClass: "bg-gray-400",
      },
    };

    return map[status] || map.available;
  };

  const getUnitReason = (unit) => {
    return (
      unit?.reason ||
      unit?.inactive_reason ||
      unit?.maintenance_reason ||
      unit?.note ||
      unit?.notes ||
      ""
    );
  };

  const getReservedBookings = (unit) => {
    const list =
      unit?.reserved_bookings ||
      unit?.upcoming_bookings ||
      unit?.next_bookings ||
      unit?.booking_reserved_list ||
      null;

    if (Array.isArray(list)) return list.filter(Boolean);

    const single =
      unit?.reserved_booking ||
      unit?.upcoming_booking ||
      unit?.next_booking ||
      unit?.booking_reserved ||
      null;

    return single ? [single] : [];
  };

  const getAllBookingsForUnit = (unit) => {
    const current = unit?.current_booking || unit?.active_booking || null;
    const reserved = getReservedBookings(unit);

    const combined = current ? [current, ...reserved] : [...reserved];
    const seen = new Set();

    return combined.filter((booking) => {
      const key = String(
        booking?.id ||
          booking?.booking_code ||
          booking?.code ||
          `${getBookingGuestName(booking)}-${getBookingTimeText(booking)}`
      );

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const getBookingCode = (booking) => {
    return (
      booking?.booking_code ||
      booking?.code ||
      booking?.bookingCode ||
      booking?.id ||
      "-"
    );
  };

  const getBookingGuestName = (booking) => {
    return (
      booking?.customer_name ||
      booking?.guest_name ||
      booking?.name ||
      booking?.user_name ||
      booking?.full_name ||
      booking?.customer_full_name ||
      booking?.guest_full_name ||
      booking?.customer?.name ||
      booking?.customer?.full_name ||
      booking?.user?.name ||
      booking?.user?.full_name ||
      booking?.user?.email ||
      "-"
    );
  };

  const getBookingTypeText = (booking) => {
    const raw = String(
      booking?.booking_type ||
        booking?.type ||
        booking?.stay_type ||
        booking?.room_booking_type ||
        booking?.duration_type ||
        ""
    ).toLowerCase();

    if (raw.includes("transit")) return "Transit";
    if (raw.includes("full")) return "Full Day";
    if (raw.includes("overnight")) return "Full Day";
    if (raw.includes("daily")) return "Full Day";

    const duration =
      booking?.duration || booking?.duration_hours || booking?.hours;

    if (duration && Number(duration) <= 12) return "Transit";

    return "Booking";
  };

  const getBookingStatusText = (booking) => {
    if (isBookingInUseStatus(booking)) {
      return "Sedang Dipakai";
    }

    if (isBookingCleaningProcessStatus(booking)) {
      return "Sedang Cleaning";
    }

    if (isBookingNeedsCleaningStatus(booking)) {
      return "Perlu Dibersihkan";
    }

    const raw = String(booking?.status || "").toLowerCase();

    if (
      ["approved", "approve", "confirmed", "paid", "booked", "reserved"].includes(
        raw
      )
    ) {
      return "Sudah Dibooking";
    }

    if (raw === "pending") return "Menunggu Approval";

    return raw ? raw : "Booking";
  };

  const getBookingTypeBadgeClass = (booking) => {
    const type = getBookingTypeText(booking).toLowerCase();

    if (type.includes("transit")) {
      return "border-blue-100 bg-blue-50 text-blue-700";
    }

    if (type.includes("full")) {
      return "border-purple-100 bg-purple-50 text-purple-700";
    }

    return "border-gray-100 bg-gray-50 text-gray-600";
  };

  const formatTimeOnly = (value) => {
    if (!value) return "";

    const text = String(value);

    const timeMatch = text.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    return text;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const text = String(value);
    const dateTimeMatch = text.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
    );

    if (dateTimeMatch) {
      const [, year, month, day, hour, minute] = dateTimeMatch;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}, ${hour}:${minute}`;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + `, ${date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    }

    return text;
  };

  const getBookingStartValue = (booking) => {
    return (
      booking?.check_in ||
      booking?.checkin ||
      booking?.check_in_at ||
      booking?.checkin_at ||
      booking?.start_time ||
      booking?.start_at ||
      booking?.booking_start ||
      booking?.from_time ||
      ""
    );
  };

  const getBookingEndValue = (booking) => {
    return (
      booking?.check_out ||
      booking?.checkout ||
      booking?.check_out_at ||
      booking?.checkout_at ||
      booking?.end_time ||
      booking?.end_at ||
      booking?.booking_end ||
      booking?.to_time ||
      ""
    );
  };

  const getBookingCheckInText = (booking) => {
    return formatDateTime(getBookingStartValue(booking));
  };

  const getBookingCheckOutText = (booking) => {
    return formatDateTime(getBookingEndValue(booking));
  };

  const getBookingTimeText = (booking) => {
    const start = getBookingStartValue(booking);
    const end = getBookingEndValue(booking);

    const startText = formatTimeOnly(start);
    const endText = formatTimeOnly(end);

    if (startText && endText) return `${startText} - ${endText}`;
    if (startText) return `Mulai ${startText}`;
    if (endText) return `Sampai ${endText}`;

    return "-";
  };

  const getRoomUnitSortText = (unit) => {
    return String(
      unit?.room_number ||
        unit?.number ||
        unit?.unit_number ||
        unit?.name ||
        ""
    ).trim();
  };

  const getRoomUnitSortNumber = (unit) => {
    const text = getRoomUnitSortText(unit);
    const match = text.match(/\d+/);
    const number = match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;

    return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER;
  };

  const sortRoomUnitsByNumber = (a, b) => {
    const numberA = getRoomUnitSortNumber(a);
    const numberB = getRoomUnitSortNumber(b);

    if (numberA !== numberB) {
      return numberA - numberB;
    }

    return getRoomUnitSortText(a).localeCompare(getRoomUnitSortText(b), "id", {
      numeric: true,
      sensitivity: "base",
    });
  };

  const filteredUnits = useMemo(() => {
    const keyword = searchUnit.trim().toLowerCase();

    return units
      .filter((unit) => {
        const status = getRoomUnitStatus(unit);
        const roomNumberText = String(unit?.room_number || "").toLowerCase();
      const reasonText = getUnitReason(unit).toLowerCase();
      const roomTypeText = String(
        unit?.room_type_name ||
          unit?.room?.type ||
          unit?.room?.name ||
          unit?.room_name ||
          ""
      ).toLowerCase();

      const allBookings = getAllBookingsForUnit(unit);

      const bookingText = allBookings
        .map((booking) => {
          return [
            getBookingCode(booking),
            getBookingGuestName(booking),
            getBookingTimeText(booking),
            getBookingCheckInText(booking),
            getBookingCheckOutText(booking),
            getBookingTypeText(booking),
          ].join(" ");
        })
        .join(" ")
        .toLowerCase();

      const matchStatus = selectedStatus === "all" || selectedStatus === status;
      const matchKeyword =
        !keyword ||
        roomNumberText.includes(keyword) ||
        reasonText.includes(keyword) ||
        roomTypeText.includes(keyword) ||
        bookingText.includes(keyword);

        return matchStatus && matchKeyword;
      })
      .sort(sortRoomUnitsByNumber);
  }, [units, searchUnit, selectedStatus]);

  const handleHotelChange = (hotelId) => {
    setSelectedHotelId(hotelId);
    setSelectedRoom("all");
    setUnits([]);
    setSearchUnit("");
    setSelectedStatus("all");
    setRoomSelectWarning("");

    if (!hotelId) return;

    const availableRooms = accessScopedRooms.filter((room) => {
      const roomHotelId = getRoomHotelId(room);
      return String(roomHotelId) === String(hotelId);
    });

    if (availableRooms.length === 0) {
      setRoomSelectWarning("Cabang ini belum memiliki tipe kamar.");
      return;
    }

    fetchAllUnitsByHotel(hotelId);
  };

  const handleRoomChange = (roomId) => {
    if (!selectedHotelId) {
      const message = "Silakan pilih hotel / cabang terlebih dahulu.";
      setRoomSelectWarning(message);
      toast.error(message);
      return;
    }

    setRoomSelectWarning("");
    setSelectedRoom(roomId);
    setSearchUnit("");
    setSelectedStatus("all");

    if (!roomId || roomId === "all") {
      fetchAllUnitsByHotel(selectedHotelId);
      return;
    }

    fetchUnitsByRoom(roomId);
  };

  const handleRoomSelectMouseDown = (event) => {
    if (!selectedHotelId) {
      event.preventDefault();

      const message = "Silakan pilih hotel / cabang terlebih dahulu.";
      setRoomSelectWarning(message);
      toast.error(message);
    }
  };

  const openStatusModal = (unit, action) => {
    setSelectedUnit(unit);
    setStatusAction(action);
    setStatusReason("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (savingStatus) return;

    setSelectedUnit(null);
    setStatusAction("");
    setStatusReason("");
    setShowStatusModal(false);
  };

  const getActionText = (action) => {
    const map = {
      available: "Aktifkan Kembali",
      inactive: "Nonaktifkan Kamar",
      maintenance: "Tandai Maintenance",
      cleaning: "Tandai Cleaning",
    };

    return map[action] || "Ubah Status";
  };

  const buildStatusPayloadByAction = (action, reason = "") => {
    if (action === "available") {
      return {
        status: "available",
        monitoring_status: "available",
        reason: "",
        inactive_reason: "",
        maintenance_reason: "",
        is_active: true,
        active: true,
        available: true,
        is_maintenance: false,
        maintenance_status: false,
        is_cleaning: false,
        cleaning_status: false,
      };
    }

    if (action === "inactive") {
      return {
        status: "inactive",
        monitoring_status: "inactive",
        reason,
        inactive_reason: reason,
        is_active: false,
        active: false,
        available: false,
        is_maintenance: false,
        maintenance_status: false,
        is_cleaning: false,
        cleaning_status: false,
      };
    }

    if (action === "maintenance") {
      return {
        status: "maintenance",
        monitoring_status: "maintenance",
        reason,
        maintenance_reason: reason,
        is_active: true,
        active: true,
        available: false,
        is_maintenance: true,
        maintenance_status: true,
        is_cleaning: false,
        cleaning_status: false,
      };
    }

    if (action === "cleaning") {
      return {
        status: "cleaning",
        monitoring_status: "cleaning",
        reason,
        is_active: true,
        active: true,
        available: false,
        is_maintenance: false,
        maintenance_status: false,
        is_cleaning: true,
        cleaning_status: true,
      };
    }

    return {
      status: "available",
      monitoring_status: "available",
      reason,
      is_active: true,
      active: true,
      available: true,
      is_maintenance: false,
      maintenance_status: false,
      is_cleaning: false,
      cleaning_status: false,
    };
  };

  const buildStatusPayload = () => {
    return buildStatusPayloadByAction(statusAction, statusReason);
  };

  const updateRoomUnitRequest = async (unitId, payload) => {
    try {
      return await api.put(`/admin/room-units/${unitId}`, payload);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/room-units/${unitId}`, {
          ...payload,
          _method: "PUT",
        });
      }

      throw error;
    }
  };

  const reloadCurrentUnits = () => {
    if (!selectedHotelId) return;
    if (!selectedRoom || selectedRoom === "all") {
      fetchAllUnitsByHotel(selectedHotelId);
      return;
    }
    fetchUnitsByRoom(selectedRoom);
  };

  const handleSaveStatus = async () => {
    const bulkUnits = selectedBulkUnitIds
      .map((unitId) => units.find((unit) => String(unit.id) === String(unitId)))
      .filter(Boolean);

    const isBulkUpdate = !selectedUnit?.id && bulkUnits.length > 0;

    if (!selectedUnit?.id && !isBulkUpdate) return;

    const needsReason =
      statusAction === "inactive" || statusAction === "maintenance";

    if (needsReason && !statusReason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }

    try {
      setSavingStatus(true);

      if (isBulkUpdate) {
        const payload = buildStatusPayloadByAction(statusAction, statusReason);
        const results = await Promise.allSettled(
          bulkUnits.map((unit) => updateRoomUnitRequest(unit.id, payload))
        );

        const successCount = results.filter(
          (item) => item.status === "fulfilled"
        ).length;
        const failedCount = results.length - successCount;

        if (successCount > 0) {
          toast.success(`${successCount} kamar berhasil diperbarui`);
        }

        if (failedCount > 0) {
          toast.error(`${failedCount} kamar gagal diperbarui`);
        }

        setBulkAction("");
        setSelectedBulkUnitIds([]);
        closeStatusModal();
        reloadCurrentUnits();
        return;
      }

      await updateRoomUnitRequest(selectedUnit.id, buildStatusPayload());

      toast.success("Status kamar berhasil diperbarui");
      closeStatusModal();
      reloadCurrentUnits();
    } catch (error) {
      console.error("Gagal update status kamar:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Backend belum support update status room unit."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const openBookingModal = (unit) => {
    setBookingModalUnit(unit);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setBookingModalUnit(null);
    setShowBookingModal(false);
  };

  const bulkActionOptions = [
    {
      value: "maintenance",
      label: "Maintenance",
      helper: "Tandai kamar yang dipilih sebagai maintenance.",
      buttonClass: "bg-gray-950 text-white hover:bg-black",
      activeClass: "border-gray-900 bg-gray-950 text-white",
    },
    {
      value: "available",
      label: "Aktifkan",
      helper: "Aktifkan kembali kamar yang dipilih.",
      buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      activeClass: "border-emerald-600 bg-emerald-600 text-white",
    },
    {
      value: "inactive",
      label: "Nonaktifkan",
      helper: "Nonaktifkan kamar yang dipilih sementara.",
      buttonClass: "bg-red-600 text-white hover:bg-red-700",
      activeClass: "border-red-600 bg-red-600 text-white",
    },
  ];

  const getBulkActionMeta = (action) => {
    return (
      bulkActionOptions.find((item) => item.value === action) ||
      bulkActionOptions[0]
    );
  };

  const canSelectUnitForBulk = (unit, action = bulkAction) => {
    if (!unit?.id || !action) return false;

    const status = getRoomUnitStatus(unit);

    if (status === "occupied") return false;

    if (action === "available") {
      return status !== "available";
    }

    if (action === "inactive") {
      return status !== "inactive";
    }

    if (action === "maintenance") {
      return status !== "maintenance" && status !== "inactive";
    }

    return false;
  };

  const isUnitSelectedForBulk = (unit) => {
    return selectedBulkUnitIds.some(
      (unitId) => String(unitId) === String(unit?.id)
    );
  };

  const selectedBulkUnits = useMemo(() => {
    return filteredUnits.filter((unit) => isUnitSelectedForBulk(unit));
  }, [filteredUnits, selectedBulkUnitIds]);

  const selectableBulkUnits = useMemo(() => {
    if (!bulkAction) return [];
    return filteredUnits.filter((unit) => canSelectUnitForBulk(unit));
  }, [filteredUnits, bulkAction]);

  const openBulkMode = (action) => {
    if (!selectedHotelId) {
      toast.error("Pilih cabang terlebih dahulu");
      return;
    }

    if (filteredUnits.length === 0) {
      toast.error("Belum ada kamar yang bisa dipilih");
      return;
    }

    setBulkAction(action);
    setSelectedBulkUnitIds([]);
  };

  const clearBulkMode = () => {
    setBulkAction("");
    setSelectedBulkUnitIds([]);
  };

  const toggleBulkUnitSelection = (unit) => {
    if (!bulkAction) return;

    if (!canSelectUnitForBulk(unit)) {
      const status = getRoomUnitStatus(unit);

      if (status === "occupied") {
        toast.error("Kamar yang sedang dipakai booking tidak bisa dipilih.");
        return;
      }

      if (bulkAction === "available" && status === "available") {
        toast.error("Kamar ini sudah aktif.");
        return;
      }

      if (bulkAction === "inactive" && status === "inactive") {
        toast.error("Kamar ini sudah nonaktif.");
        return;
      }

      if (bulkAction === "maintenance" && status === "maintenance") {
        toast.error("Kamar ini sudah maintenance.");
        return;
      }

      if (bulkAction === "maintenance" && status === "inactive") {
        toast.error("Kamar nonaktif harus diaktifkan dulu sebelum maintenance.");
        return;
      }

      toast.error("Kamar ini tidak bisa dipilih untuk tindakan tersebut.");
      return;
    }

    setSelectedBulkUnitIds((prev) => {
      const exists = prev.some((unitId) => String(unitId) === String(unit.id));

      if (exists) {
        return prev.filter((unitId) => String(unitId) !== String(unit.id));
      }

      return [...prev, unit.id];
    });
  };

  const selectAllBulkUnits = () => {
    if (!bulkAction) return;

    if (selectableBulkUnits.length === 0) {
      toast.error("Tidak ada kamar yang bisa dipilih untuk aksi ini.");
      return;
    }

    setSelectedBulkUnitIds(selectableBulkUnits.map((unit) => unit.id));
  };

  const clearBulkSelection = () => {
    setSelectedBulkUnitIds([]);
  };

  const openBulkStatusModal = () => {
    if (!bulkAction) {
      toast.error("Pilih tindakan terlebih dahulu");
      return;
    }

    if (selectedBulkUnitIds.length === 0) {
      toast.error("Pilih kamar terlebih dahulu");
      return;
    }

    setSelectedUnit(null);
    setStatusAction(bulkAction);
    setStatusReason("");
    setShowStatusModal(true);
  };

  const bookingModalBookings = bookingModalUnit
    ? getAllBookingsForUnit(bookingModalUnit)
    : [];

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-4 md:p-6">
          <div className="mb-5 overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 px-6 py-5 text-white">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-lg font-black">Monitoring Kamar</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    Pilih cabang terlebih dahulu. 
                  </p>
                </div>

                <div className="flex flex-col gap-3 xl:items-end">
                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    {["available", "occupied", "cleaning", "maintenance", "inactive"].map(
                      (status) => {
                        const meta = getStatusMeta(status);

                        return (
                          <div
                            key={status}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/90 shadow-sm backdrop-blur"
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`}
                            />
                            {meta.label}
                          </div>
                        );
                      }
                    )}
                  </div>

                 
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-12">
              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Cabang / Hotel
                </label>

                <select
                  value={selectedHotelId}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  disabled={
                    loadingRooms ||
                    loadingUserAccessHotels ||
                    (!canAccessAllHotels && assignedHotelIds.length === 0)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingRooms || loadingUserAccessHotels
                      ? "Memuat cabang..."
                      : "Pilih Cabang / Hotel"}
                  </option>

                  {hotelOptions.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>

                {loadingUserAccessHotels && (
                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Sedang memuat akses cabang user...
                  </p>
                )}

                {!loadingUserAccessHotels &&
                  !canAccessAllHotels &&
                  assignedHotelIds.length === 0 && (
                    <p className="mt-2 text-xs font-bold text-red-600">
                      Akun ini belum memiliki akses cabang. Atur dari Kelola Users.
                    </p>
                  )}
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Tipe Kamar
                </label>

                <select
                  value={selectedRoom}
                  onMouseDown={handleRoomSelectMouseDown}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  disabled={
                    loadingRooms ||
                    !selectedHotelId ||
                    Boolean(selectedHotelId && roomsBySelectedHotel.length === 0)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedHotelId && roomsBySelectedHotel.length > 0 && (
                    <option value="all">Semua Tipe Kamar</option>
                  )}

                  {roomsBySelectedHotel.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.type || "Tipe"}
                    </option>
                  ))}
                </select>

                {roomSelectWarning && (
                  <p className="mt-2 text-xs font-bold text-red-600">
                    {roomSelectWarning}
                  </p>
                )}
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Cari Nomor / Tamu / Kode Booking
                </label>

                <input
                  type="text"
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  placeholder="Cari 101, Rici, RR-..."
                  disabled={!selectedHotelId}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Filter Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={!selectedHotelId}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statusTabs.map((tab) => (
                    <option key={tab.value} value={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
            {selectedHotelId && filteredUnits.length > 0 && (
              <div className="border-b border-gray-100 bg-white px-4 py-4 md:px-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      Tindakan Kamar
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      Pilih tindakan di sini, lalu tandai kamar yang ingin diubah statusnya.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {bulkActionOptions.map((item) => {
                      const active = bulkAction === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => openBulkMode(item.value)}
                          className={`rounded-2xl border px-3.5 py-2.5 text-xs font-black transition ${
                            active
                              ? item.activeClass
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bulkAction && (
                  <div className="mt-4 rounded-3xl border border-red-100 bg-red-50/70 px-4 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-black text-red-700">
                          Mode {getBulkActionMeta(bulkAction).label} aktif
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-red-600/80">
                          {getBulkActionMeta(bulkAction).helper} Kamar terisi booking tidak bisa dipilih.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-gray-700 shadow-sm">
                          {selectedBulkUnitIds.length} dipilih
                        </span>

                        <button
                          type="button"
                          onClick={selectAllBulkUnits}
                          className="rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                        >
                          Pilih Semua
                        </button>

                        <button
                          type="button"
                          onClick={clearBulkSelection}
                          className="rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                        >
                          Bersihkan
                        </button>

                        <button
                          type="button"
                          onClick={clearBulkMode}
                          className="rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                        >
                          Batal Mode
                        </button>

                        <button
                          type="button"
                          onClick={openBulkStatusModal}
                          disabled={selectedBulkUnitIds.length === 0}
                          className="rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="min-h-[360px] bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.08),_transparent_32%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] p-4 md:p-5">
              {loadingUnits ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="rounded-3xl border border-gray-100 bg-white px-6 py-5 text-center shadow-sm">
                    <p className="text-sm font-black text-gray-800">
                      Memuat kamar fisik...
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Mohon tunggu sebentar.
                    </p>
                  </div>
                </div>
              ) : !selectedHotelId ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
                    <p className="text-lg font-black text-gray-900">
                      Pilih cabang terlebih dahulu
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Setelah cabang dipilih, semua kamar dari cabang tersebut akan
                      langsung tampil di monitoring.
                    </p>
                  </div>
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
                    <p className="text-lg font-black text-gray-900">
                      Belum ada kamar yang cocok
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Data kamar fisik belum tersedia atau tidak cocok dengan filter.
                      Tambahkan nomor kamar fisik dari halaman Add Kamar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                  {filteredUnits.map((unit) => {
                    const status = getRoomUnitStatus(unit);
                    const meta = getStatusMeta(status);
                    const reason = getUnitReason(unit);
                    const allBookings = getAllBookingsForUnit(unit);
                    const unitRoomType =
                      unit?.room_type_name ||
                      unit?.room?.type ||
                      unit?.room?.name ||
                      unit?.room_name ||
                      "-";

                    const selectionMode = Boolean(bulkAction);
                    const selectable = canSelectUnitForBulk(unit);
                    const selected = isUnitSelectedForBulk(unit);

                    return (
                      <div
                        key={unit.id}
                        onClick={() => {
                          if (selectionMode) toggleBulkUnitSelection(unit);
                        }}
                        className={`group relative min-h-[160px] overflow-hidden rounded-[22px] border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${meta.cardClass} ${
                          selectionMode && selectable
                            ? "cursor-pointer"
                            : selectionMode
                            ? "cursor-not-allowed opacity-70"
                            : ""
                        } ${
                          selected
                            ? "ring-4 ring-red-500/25 border-red-400"
                            : ""
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${meta.dotClass}`}
                              />
                              <p className="truncate text-[10px] font-black uppercase tracking-wide text-current/55">
                                Kamar
                              </p>
                            </div>

                            <h3 className="mt-1 text-2xl font-black leading-none tracking-tight">
                              {unit.room_number || "-"}
                            </h3>
                          </div>

                          {selectionMode ? (
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-sm transition ${
                                selected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : selectable
                                  ? "border-gray-200 bg-white text-gray-400"
                                  : "border-gray-200 bg-gray-100 text-gray-300"
                              }`}
                            >
                              {selected ? "✓" : selectable ? "" : "×"}
                            </div>
                          ) : (
                            <span
                              className={`inline-flex h-3 w-3 shrink-0 rounded-full ring-4 ring-white ${meta.dotClass}`}
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="max-w-full truncate rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-black text-current/70 shadow-sm">
                            {unitRoomType}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${meta.badgeClass}`}
                          >
                            {meta.shortLabel}
                          </span>
                        </div>

                        {allBookings.length > 0 && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openBookingModal(unit);
                            }}
                            className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-600 px-3 py-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-blue-700"
                          >
                            Lihat Detail Booking
                          </button>
                        )}

                        {reason && (
                          <p className="mt-2 line-clamp-2 rounded-2xl bg-white/70 px-3 py-2 text-[11px] font-semibold leading-relaxed text-current/70">
                            {reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[30px] bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-gradient-to-br from-gray-950 to-red-950 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white/50">
                    {selectedUnit?.id
                      ? `Kamar ${selectedUnit?.room_number || "-"}`
                      : `${selectedBulkUnitIds.length} kamar dipilih`}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {getActionText(statusAction)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    Perubahan status kamar akan memengaruhi pilihan kamar saat
                    approve booking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeStatusModal}
                  disabled={savingStatus}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-black text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {!selectedUnit?.id && selectedBulkUnitIds.length > 0 && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm font-black text-red-700">
                    Tindakan massal untuk {selectedBulkUnitIds.length} kamar
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-red-600/80">
                    Pastikan kamar yang dipilih sudah benar sebelum menyimpan perubahan status.
                  </p>
                </div>
              )}

              {(statusAction === "inactive" || statusAction === "maintenance") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Alasan
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    rows={4}
                    placeholder="Contoh: AC rusak, kamar bocor, maintenance, deep cleaning..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Alasan ini membantu admin/resepsionis tahu kenapa kamar tidak
                    boleh dipilih.
                  </p>
                </div>
              )}

              {statusAction === "cleaning" && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                  <p className="text-sm font-black text-amber-800">
                    Tandai kamar sedang cleaning?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-700">
                    Kamar tidak boleh muncul di pilihan approve sampai statusnya
                    diaktifkan kembali.
                  </p>
                </div>
              )}

              {statusAction === "available" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <p className="text-sm font-black text-emerald-800">
                    Aktifkan kamar kembali?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-700">
                    Kamar akan kembali tersedia untuk operasional dan approval
                    booking selama tidak ada bentrok booking aktif.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeStatusModal}
                disabled={savingStatus}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={savingStatus}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingStatus ? "Menyimpan..." : "Simpan Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && bookingModalUnit && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-gradient-to-br from-gray-950 to-blue-950 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white/50">
                    Detail Booking Kamar
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Kamar {bookingModalUnit?.room_number || "-"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    Daftar booking yang terhubung dengan kamar ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-black text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {bookingModalBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                  <p className="text-sm font-black text-gray-800">
                    Belum ada booking untuk kamar ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingModalBookings.map((booking, index) => {
                    const isCurrentRoomBooking =
                      String(booking?.id || "") ===
                      String(
                        bookingModalUnit?.current_booking?.id ||
                          bookingModalUnit?.active_booking?.id ||
                          ""
                      );
                    const visualTone = getBookingVisualTone(
                      booking,
                      isCurrentRoomBooking
                    );

                    return (
                      <div
                        key={`${getBookingCode(booking)}-${index}`}
                        className={`rounded-2xl border px-4 py-4 ${visualTone.cardClass}`}
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${visualTone.badgeClass}`}
                          >
                            {visualTone.label}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${getBookingTypeBadgeClass(
                              booking
                            )}`}
                          >
                            {getBookingTypeText(booking)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                          <div className="rounded-xl bg-white/80 px-3 py-3">
                            <p className="text-xs font-bold uppercase text-gray-400">
                              Kode Booking
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingCode(booking)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 px-3 py-3">
                            <p className="text-xs font-bold uppercase text-gray-400">
                              Tamu
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingGuestName(booking)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 px-3 py-3">
                            <p className="text-xs font-bold uppercase text-gray-400">
                              Check In
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingCheckInText(booking)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 px-3 py-3">
                            <p className="text-xs font-bold uppercase text-gray-400">
                              Check Out
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingCheckOutText(booking)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 px-3 py-3 md:col-span-2">
                            <p className="text-xs font-bold uppercase text-gray-400">
                              Status
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingStatusText(booking)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-5">
              <button
                type="button"
                onClick={closeBookingModal}
                className="rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}