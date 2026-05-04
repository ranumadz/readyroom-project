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

  useEffect(() => {
    fetchRooms();
  }, []);

  const normalizeArrayResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    if (Array.isArray(payload?.units)) return payload.units;
    return [];
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

    const room = rooms.find((item) => String(item.id) === String(roomId));

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
    const mappedHotels = rooms
      .map((room) => room.hotel)
      .filter((hotel) => hotel?.id && hotel?.name);

    const uniqueHotels = [];

    mappedHotels.forEach((hotel) => {
      const exists = uniqueHotels.some(
        (item) => Number(item.id) === Number(hotel.id)
      );

      if (!exists) uniqueHotels.push(hotel);
    });

    return uniqueHotels.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [rooms]);

  const selectedHotelData = useMemo(() => {
    if (!selectedHotelId) return null;

    return hotelOptions.find(
      (hotel) => String(hotel.id) === String(selectedHotelId)
    );
  }, [hotelOptions, selectedHotelId]);

  const roomsBySelectedHotel = useMemo(() => {
    if (!selectedHotelId) return [];

    const filteredRooms = rooms.filter((room) => {
      const hotelId = getRoomHotelId(room);
      return String(hotelId) === String(selectedHotelId);
    });

    return [...filteredRooms].sort((a, b) => {
      const typeA = String(a?.type || a?.name || "");
      const typeB = String(b?.type || b?.name || "");
      return typeA.localeCompare(typeB);
    });
  }, [rooms, selectedHotelId]);

  const fetchAllUnitsByHotel = async (hotelId) => {
    if (!hotelId) {
      setUnits([]);
      return;
    }

    const hotelRooms = rooms.filter((room) => {
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

  const getRoomUnitStatus = (unit) => {
    const monitoringStatus = String(unit?.monitoring_status || "").toLowerCase();
    const rawStatus = String(unit?.status ?? "").toLowerCase();

    if (monitoringStatus === "maintenance") return "maintenance";
    if (monitoringStatus === "cleaning") return "cleaning";
    if (monitoringStatus === "occupied" || monitoringStatus === "booked")
      return "occupied";
    if (monitoringStatus === "inactive") return "inactive";
    if (monitoringStatus === "available") return "available";

    if (
      rawStatus === "maintenance" ||
      rawStatus === "rusak" ||
      unit?.is_maintenance === true ||
      unit?.maintenance_status === true
    ) {
      return "maintenance";
    }

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
        shortLabel: "Perlu Dibersihkan",
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

  const getReservedBooking = (unit) => {
    return getReservedBookings(unit)[0] || null;
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
      booking?.customer?.name ||
      booking?.user?.name ||
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
    const raw = String(booking?.status || "").toLowerCase();

    if (["checked_in", "check_in", "checkin"].includes(raw)) {
      return "Sedang Dipakai";
    }

    if (
      [
        "checked-out",
        "checked_out",
        "check_out",
        "checkout",
        "cleaning",
        "start_cleaning",
        "in_cleaning",
      ].includes(raw)
    ) {
      return "Cleaning";
    }

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

  const getBookingTimeText = (booking) => {
    const start =
      booking?.check_in ||
      booking?.checkin ||
      booking?.check_in_at ||
      booking?.checkin_at ||
      booking?.start_time ||
      booking?.start_at ||
      booking?.booking_start ||
      booking?.from_time ||
      "";

    const end =
      booking?.check_out ||
      booking?.checkout ||
      booking?.check_out_at ||
      booking?.checkout_at ||
      booking?.end_time ||
      booking?.end_at ||
      booking?.booking_end ||
      booking?.to_time ||
      "";

    const startText = formatTimeOnly(start);
    const endText = formatTimeOnly(end);

    if (startText && endText) return `${startText} - ${endText}`;
    if (startText) return `Mulai ${startText}`;
    if (endText) return `Sampai ${endText}`;

    return "-";
  };

  const getUnitActiveBookingText = (unit) => {
    const booking = unit?.current_booking || unit?.active_booking || null;

    if (!booking) return "";

    const code = booking?.booking_code || booking?.code || booking?.id;
    const checkout =
      booking?.check_out ||
      booking?.checkout_at ||
      booking?.end_time ||
      booking?.check_out_time;

    if (code && checkout) return `${code} • sampai ${formatTimeOnly(checkout)}`;
    if (code) return `Booking ${code}`;
    if (checkout) return `Terisi sampai ${formatTimeOnly(checkout)}`;

    return "Sedang terisi";
  };

  const filteredUnits = useMemo(() => {
    const keyword = searchUnit.trim().toLowerCase();

    return units.filter((unit) => {
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
    });
  }, [units, searchUnit, selectedStatus]);

  const handleHotelChange = (hotelId) => {
    setSelectedHotelId(hotelId);
    setSelectedRoom("all");
    setUnits([]);
    setSearchUnit("");
    setSelectedStatus("all");
    setRoomSelectWarning("");

    if (!hotelId) return;

    const availableRooms = rooms.filter((room) => {
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

  const buildStatusPayload = () => {
    if (statusAction === "available") {
      return {
        status: true,
        reason: "",
        inactive_reason: "",
        maintenance_reason: "",
        is_maintenance: false,
        is_cleaning: false,
      };
    }

    if (statusAction === "inactive") {
      return {
        status: false,
        reason: statusReason,
        inactive_reason: statusReason,
        is_maintenance: false,
        is_cleaning: false,
      };
    }

    if (statusAction === "maintenance") {
      return {
        status: "maintenance",
        reason: statusReason,
        maintenance_reason: statusReason,
        is_maintenance: true,
        is_cleaning: false,
      };
    }

    if (statusAction === "cleaning") {
      return {
        status: "cleaning",
        reason: statusReason,
        is_maintenance: false,
        is_cleaning: true,
      };
    }

    return {
      status: true,
      reason: statusReason,
    };
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
    if (!selectedUnit?.id) return;

    const needsReason =
      statusAction === "inactive" || statusAction === "maintenance";

    if (needsReason && !statusReason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }

    try {
      setSavingStatus(true);

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

  const bookingModalBookings = bookingModalUnit
    ? getAllBookingsForUnit(bookingModalUnit)
    : [];

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                Admin Panel
              </p>

              <h1 className="text-3xl font-black tracking-tight text-gray-950">
                Monitoring Kamar
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
                Pantau status kamar fisik, lihat booking yang sudah terjadwal,
                dan tutup kamar sementara saat rusak, maintenance, atau belum siap digunakan.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Cabang Terdaftar
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {hotelOptions.length}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Mengikuti data kamar yang bisa diakses user login.
              </p>
            </div>
          </div>

          <div className="mb-5 overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 px-6 py-5 text-white">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-black">Filter Monitoring Kamar</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    Pilih cabang terlebih dahulu. Sistem akan menampilkan semua kamar
                    dari cabang tersebut, lalu bisa difilter berdasarkan tipe kamar.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
                  {selectedHotelData?.name || "Belum pilih cabang"}
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
                  disabled={loadingRooms}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingRooms ? "Memuat cabang..." : "Pilih Cabang / Hotel"}
                  </option>

                  {hotelOptions.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
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
                  <option value="">
                    {loadingRooms
                      ? "Memuat tipe kamar..."
                      : !selectedHotelId
                      ? "Pilih cabang terlebih dahulu"
                      : roomsBySelectedHotel.length === 0
                      ? "Belum ada tipe kamar"
                      : "Pilih Tipe Kamar"}
                  </option>

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

            <div className="border-t border-gray-100 px-6 pb-6">
              <div className="flex flex-wrap gap-2 pt-4">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      if (!selectedHotelId) {
                        toast.error("Pilih cabang terlebih dahulu");
                        return;
                      }

                      setSelectedStatus(tab.value);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      selectedStatus === tab.value
                        ? "bg-gray-950 text-white shadow-lg shadow-gray-200"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Denah Monitoring Kamar
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tampilan tile seperti denah kamar agar admin dan resepsionis
                  cepat melihat kamar yang tersedia, terisi, cleaning, atau nonaktif.
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-black text-gray-600">
                {filteredUnits.length} dari {units.length} unit tampil
              </div>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-600">
                {["available", "occupied", "cleaning", "maintenance", "inactive"].map(
                  (status) => {
                    const meta = getStatusMeta(status);

                    return (
                      <div
                        key={status}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2"
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

            <div className="min-h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.08),_transparent_32%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] p-6">
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
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {filteredUnits.map((unit) => {
                    const status = getRoomUnitStatus(unit);
                    const meta = getStatusMeta(status);
                    const reason = getUnitReason(unit);
                    const activeBookingText = getUnitActiveBookingText(unit);
                    const currentBooking =
                      unit?.current_booking || unit?.active_booking || null;
                    const reservedBookings = getReservedBookings(unit);
                    const primaryBooking = currentBooking || getReservedBooking(unit);
                    const allBookings = getAllBookingsForUnit(unit);
                    const extraBookingCount = Math.max(allBookings.length - 1, 0);
                    const unitRoomType =
                      unit?.room_type_name ||
                      unit?.room?.type ||
                      unit?.room?.name ||
                      unit?.room_name ||
                      "-";

                    return (
                      <div
                        key={unit.id}
                        className={`group relative min-h-[250px] overflow-hidden rounded-[26px] border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${meta.cardClass}`}
                      >
                        <div className="absolute right-3 top-3">
                          <span
                            className={`inline-flex h-3 w-3 rounded-full ring-4 ring-white ${meta.dotClass}`}
                          />
                        </div>

                        <p className="pt-2 text-xs font-bold uppercase tracking-wide text-current/55">
                          Kamar
                        </p>

                        <h3 className="mt-1 text-2xl font-black tracking-tight">
                          {unit.room_number || "-"}
                        </h3>

                        <div className="mt-2">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-current/70 shadow-sm">
                            {unitRoomType}
                          </span>
                        </div>

                        <div className="mt-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${meta.badgeClass}`}
                          >
                            {meta.shortLabel}
                          </span>
                        </div>

                        {primaryBooking && (
                          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/90 px-3 py-3 text-xs leading-relaxed text-blue-800">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="font-black text-blue-900">
                                {currentBooking
                                  ? "Sedang Dipakai Sekarang"
                                  : "Sudah Ada Booking"}
                              </p>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getBookingTypeBadgeClass(
                                  primaryBooking
                                )}`}
                              >
                                {getBookingTypeText(primaryBooking)}
                              </span>
                            </div>

                            <p className="font-semibold">
                              <span className="font-black">Kode:</span>{" "}
                              {getBookingCode(primaryBooking)}
                            </p>

                            <p className="font-semibold">
                              <span className="font-black">Tamu:</span>{" "}
                              {getBookingGuestName(primaryBooking)}
                            </p>

                            <p className="font-semibold">
                              <span className="font-black">Jam:</span>{" "}
                              {getBookingTimeText(primaryBooking)}
                            </p>

                            {extraBookingCount > 0 && (
                              <button
                                type="button"
                                onClick={() => openBookingModal(unit)}
                                className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
                              >
                                +{extraBookingCount} Booking Lagi
                              </button>
                            )}

                            {extraBookingCount === 0 && allBookings.length > 0 && (
                              <button
                                type="button"
                                onClick={() => openBookingModal(unit)}
                                className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"
                              >
                                Lihat Detail Booking
                              </button>
                            )}
                          </div>
                        )}

                        {!primaryBooking && reservedBookings.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openBookingModal(unit)}
                            className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                          >
                            Lihat Semua Booking
                          </button>
                        )}

                        {activeBookingText && !primaryBooking && (
                          <p className="mt-3 line-clamp-2 text-xs font-semibold leading-relaxed text-current/70">
                            {activeBookingText}
                          </p>
                        )}

                        {reason && (
                          <p className="mt-3 line-clamp-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold leading-relaxed text-current/70">
                            {reason}
                          </p>
                        )}

                        <div className="mt-4 grid gap-2">
                          {status !== "available" && status !== "occupied" && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(unit, "available")}
                              className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-gray-800 shadow-sm transition hover:bg-gray-100"
                            >
                              Aktifkan
                            </button>
                          )}

                          {status === "available" && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(unit, "maintenance")}
                              className="rounded-2xl bg-gray-950 px-3 py-2 text-xs font-black text-white transition hover:bg-black"
                            >
                              Maintenance
                            </button>
                          )}

                          {status === "cleaning" && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(unit, "available")}
                              className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                            >
                              Selesai Cleaning
                            </button>
                          )}

                          {status === "occupied" && (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-2xl bg-red-100 px-3 py-2 text-xs font-black text-red-700"
                            >
                              Dipakai Booking
                            </button>
                          )}
                        </div>
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
                    Kamar {selectedUnit?.room_number || "-"}
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
                    Tandai kamar sebagai cleaning?
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
                    const isCurrent =
                      String(booking?.id || "") ===
                        String(
                          bookingModalUnit?.current_booking?.id ||
                            bookingModalUnit?.active_booking?.id ||
                            ""
                        ) ||
                      ["checked_in", "check_in", "checkin"].includes(
                        String(booking?.status || "").toLowerCase()
                      );

                    return (
                      <div
                        key={`${getBookingCode(booking)}-${index}`}
                        className={`rounded-2xl border px-4 py-4 ${
                          isCurrent
                            ? "border-red-100 bg-red-50"
                            : "border-blue-100 bg-blue-50/70"
                        }`}
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              isCurrent
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isCurrent
                              ? "Sedang Dipakai Sekarang"
                              : getBookingStatusText(booking)}
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
                              Jam
                            </p>
                            <p className="mt-1 font-black text-gray-900">
                              {getBookingTimeText(booking)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 px-3 py-3">
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