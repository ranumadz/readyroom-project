import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Swal from "sweetalert2";
import {
  AlertCircle,
  BedDouble,
  Clock3,
  Hotel,
  Lock,
  RefreshCw,
  Save,
  Search,
  Unlock,
  X,
} from "lucide-react";

const CLOSE_META_STORAGE_KEY = "readyroom_room_booking_close_meta";

export default function BookingAvailability() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingRoomId, setUpdatingRoomId] = useState(null);

  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [search, setSearch] = useState("");

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedCloseRoom, setSelectedCloseRoom] = useState(null);
  const [savingClose, setSavingClose] = useState(false);
  const [roomCloseMetaMap, setRoomCloseMetaMap] = useState({});
  const [closeForm, setCloseForm] = useState({
    booking_closed_reason: "Kamar penuh",
    booking_reopen_at: "",
  });
  const [selectedQuickCloseHours, setSelectedQuickCloseHours] = useState(null);

  const [userAccessHotels, setUserAccessHotels] = useState([]);
  const [loadingUserAccessHotels, setLoadingUserAccessHotels] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const adminRole = String(adminUser?.role || "").toLowerCase();

  /*
   * Mengikuti kebutuhan halaman Ketersediaan Booking:
   * - boss / super_admin / it boleh melihat semua cabang.
   * - admin / pengawas / receptionist mengikuti akses cabang yang dipilih di Kelola Users.
   */
  const canAccessAllHotels = ["boss", "super_admin", "it"].includes(adminRole);

  const normalizeArrayResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.hotels)) return payload.hotels;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    return [];
  };

  const fetchHotels = async () => {
    const res = await api.get("/admin/hotels");
    return normalizeArrayResponse(res.data);
  };

  const fetchRooms = async () => {
    const res = await api.get("/admin/rooms");
    return normalizeArrayResponse(res.data);
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

  const fetchAvailabilityData = async () => {
    try {
      setLoading(true);

      const [hotelData, roomData] = await Promise.all([
        fetchHotels(),
        fetchRooms(),
      ]);

      setHotels(hotelData);
      setRooms(roomData);
    } catch (err) {
      console.error("GET BOOKING AVAILABILITY ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Data ketersediaan booking gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
    fetchUserAccessHotels();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CLOSE_META_STORAGE_KEY);
      setRoomCloseMetaMap(saved ? JSON.parse(saved) : {});
    } catch (error) {
      console.error("READ ROOM CLOSE META ERROR:", error);
      setRoomCloseMetaMap({});
    }
  }, []);

  const persistRoomCloseMetaMap = (nextMap) => {
    setRoomCloseMetaMap(nextMap);
    localStorage.setItem(CLOSE_META_STORAGE_KEY, JSON.stringify(nextMap));
  };

  const getHotelCityName = (hotel) => {
    return (
      hotel?.city?.name ||
      hotel?.city_name ||
      hotel?.city ||
      hotel?.area ||
      "-"
    );
  };

  const getRoomHotelId = (room) => {
    return String(room?.hotel_id || room?.hotel?.id || "");
  };

  const hotelsById = useMemo(() => {
    const map = new Map();

    hotels.forEach((hotel) => {
      if (hotel?.id) {
        map.set(String(hotel.id), hotel);
      }
    });

    return map;
  }, [hotels]);

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

  const accessScopedHotels = useMemo(() => {
    if (canAccessAllHotels) {
      return hotels;
    }

    if (assignedHotelIds.length === 0) {
      return [];
    }

    return hotels.filter((hotel) => assignedHotelIds.includes(String(hotel?.id)));
  }, [hotels, assignedHotelIds, canAccessAllHotels]);

  const accessScopedRooms = useMemo(() => {
    if (canAccessAllHotels) {
      return rooms;
    }

    if (assignedHotelIds.length === 0) {
      return [];
    }

    return rooms.filter((room) => assignedHotelIds.includes(getRoomHotelId(room)));
  }, [rooms, assignedHotelIds, canAccessAllHotels]);

  const hotelOptions = useMemo(() => {
    const map = new Map();

    accessScopedHotels.forEach((hotel) => {
      if (!hotel?.id) return;

      map.set(String(hotel.id), hotel);
    });

    accessScopedRooms.forEach((room) => {
      const hotelId = getRoomHotelId(room);
      if (!hotelId) return;

      const hotelFromRoom = room?.hotel || null;
      const hotelFromList = hotelsById.get(String(hotelId)) || null;
      const hotel = hotelFromRoom || hotelFromList;

      map.set(String(hotelId), {
        ...(hotel || {}),
        id: hotel?.id || hotelId,
        name: hotel?.name || room?.hotel_name || `Hotel #${hotelId}`,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""))
    );
  }, [accessScopedHotels, accessScopedRooms, hotelsById]);

  useEffect(() => {
    if (!selectedHotelId) return;

    const stillAllowed = hotelOptions.some(
      (hotel) => String(hotel?.id) === String(selectedHotelId)
    );

    if (!stillAllowed) {
      setSelectedHotelId("");
      setSearch("");
    }
  }, [hotelOptions, selectedHotelId]);

  const handleHotelChange = (value) => {
    setSelectedHotelId(value);
    setSearch("");
  };

  const getRoomHotel = (room) => {
    return room?.hotel || hotelsById.get(getRoomHotelId(room)) || null;
  };

  const isRoomActive = (room) => {
    return (
      room?.status === true ||
      room?.status === 1 ||
      room?.status === "1" ||
      String(room?.status || "").toLowerCase() === "true" ||
      String(room?.status || "").toLowerCase() === "active"
    );
  };

  const getRoomTransitPrice = (room, duration) => {
    if (duration === "3h") {
      return room?.price_transit_3h ?? room?.price_3h ?? 0;
    }

    if (duration === "6h") {
      return room?.price_transit_6h ?? room?.price_6h ?? 0;
    }

    if (duration === "12h") {
      return room?.price_transit_12h ?? room?.price_12h ?? 0;
    }

    return 0;
  };

  const getTransitPayloadKey = (room, canonicalKey, fallbackKey) => {
    if (Object.prototype.hasOwnProperty.call(room || {}, canonicalKey)) {
      return canonicalKey;
    }

    return fallbackKey;
  };

  const getRoomFacilityIds = (room) => {
    const source = Array.isArray(room?.room_facility_ids)
      ? room.room_facility_ids
      : Array.isArray(room?.facility_ids)
      ? room.facility_ids
      : Array.isArray(room?.room_facilities)
      ? room.room_facilities
      : Array.isArray(room?.roomFacilities)
      ? room.roomFacilities
      : Array.isArray(room?.facilities)
      ? room.facilities
      : [];

    return source
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id || item.facility_id || item.value || null;
        }

        return item;
      })
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .filter((value, index, array) => array.indexOf(value) === index);
  };

  const buildRoomStatusPayload = (room, nextStatus) => {
    const price3Key = getTransitPayloadKey(
      room,
      "price_transit_3h",
      "price_3h"
    );
    const price6Key = getTransitPayloadKey(
      room,
      "price_transit_6h",
      "price_6h"
    );
    const price12Key = getTransitPayloadKey(
      room,
      "price_transit_12h",
      "price_12h"
    );

    const payload = {
      name: room?.name || "",
      hotel_id: Number(room?.hotel_id || room?.hotel?.id || 0) || "",
      type: room?.type || "",
      capacity: Number(room?.capacity || 0),
      price_per_night: Number(room?.price_per_night || 0),
      [price3Key]: Number(getRoomTransitPrice(room, "3h") || 0),
      [price6Key]: Number(getRoomTransitPrice(room, "6h") || 0),
      [price12Key]: Number(getRoomTransitPrice(room, "12h") || 0),
      total_rooms: Number(room?.total_rooms || 0),
      status: nextStatus,
      room_facility_ids: getRoomFacilityIds(room),
    };

    return payload;
  };

  const updateRoomRequest = async (roomId, payload) => {
    try {
      return await api.put(`/admin/rooms/${roomId}`, payload);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/rooms/${roomId}`, {
          ...payload,
          _method: "PUT",
        });
      }

      throw error;
    }
  };

  useEffect(() => {
    const autoOpenExpiredRooms = async () => {
      const entries = Object.entries(roomCloseMetaMap).filter(([, meta]) => {
        if (!meta?.booking_reopen_at) return false;

        const reopenTime = new Date(meta.booking_reopen_at).getTime();

        return Number.isFinite(reopenTime) && reopenTime <= Date.now();
      });

      if (entries.length === 0) return;

      const nextMap = { ...roomCloseMetaMap };
      let shouldPersist = false;
      let shouldRefresh = false;

      for (const [roomId] of entries) {
        const room = accessScopedRooms.find(
          (item) => String(item?.id) === String(roomId)
        );

        if (!room) {
          delete nextMap[roomId];
          shouldPersist = true;
          continue;
        }

        if (isRoomActive(room)) {
          delete nextMap[roomId];
          shouldPersist = true;
          continue;
        }

        try {
          await updateRoomRequest(room.id, buildRoomStatusPayload(room, 1));
          delete nextMap[roomId];
          shouldPersist = true;
          shouldRefresh = true;
        } catch (error) {
          console.error(
            "AUTO OPEN ROOM BOOKING ERROR:",
            error.response?.data || error
          );
        }
      }

      if (shouldPersist) {
        persistRoomCloseMetaMap(nextMap);
      }

      if (shouldRefresh) {
        await fetchAvailabilityData();
      }
    };

    autoOpenExpiredRooms();

    const intervalId = window.setInterval(autoOpenExpiredRooms, 30000);

    return () => window.clearInterval(intervalId);
  }, [accessScopedRooms, roomCloseMetaMap]);

  const getDateTimeLocalAfterHours = (hours) => {
    const date = new Date();
    date.setHours(date.getHours() + Number(hours || 0));

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const getMinDateTimeLocal = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getRoomCloseMeta = (roomId) => {
    return roomCloseMetaMap[String(roomId)] || null;
  };

  const openCloseRoomModal = (room) => {
    const savedMeta = getRoomCloseMeta(room?.id);

    setSelectedCloseRoom(room);
    setCloseForm({
      booking_closed_reason:
        savedMeta?.booking_closed_reason || "Kamar penuh",
      booking_reopen_at:
        savedMeta?.booking_reopen_at || getDateTimeLocalAfterHours(3),
    });
    setSelectedQuickCloseHours(savedMeta?.booking_reopen_at ? null : 3);
    setShowCloseModal(true);
  };

  const closeCloseRoomModal = () => {
    if (savingClose) return;

    setShowCloseModal(false);
    setSelectedCloseRoom(null);
    setCloseForm({
      booking_closed_reason: "Kamar penuh",
      booking_reopen_at: "",
    });
    setSelectedQuickCloseHours(null);
  };

  const handleCloseFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "booking_reopen_at") {
      setSelectedQuickCloseHours(null);
    }

    setCloseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickCloseHours = (hours) => {
    setSelectedQuickCloseHours(hours);

    setCloseForm((prev) => ({
      ...prev,
      booking_reopen_at: getDateTimeLocalAfterHours(hours),
    }));
  };

  const handleCloseRoomBooking = async (e) => {
    e.preventDefault();

    if (!selectedCloseRoom?.id) return;

    if (!closeForm.booking_reopen_at) {
      return Swal.fire({
        icon: "warning",
        title: "Jam buka kembali wajib diisi",
        text: "Pilih sampai jam berapa booking kamar ini ditutup.",
        confirmButtonColor: "#dc2626",
      });
    }

    const reopenTime = new Date(closeForm.booking_reopen_at);
    const minTime = new Date();
    minTime.setMinutes(minTime.getMinutes() + 4);

    if (
      Number.isNaN(reopenTime.getTime()) ||
      reopenTime.getTime() <= minTime.getTime()
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Jam belum valid",
        text: "Pilih jam buka kembali minimal beberapa menit dari sekarang.",
        confirmButtonColor: "#dc2626",
      });
    }

    const roomHotel = getRoomHotel(selectedCloseRoom);
    const result = await Swal.fire({
      title: "Tutup booking kamar?",
      text: `${selectedCloseRoom?.name || "Kamar"} di ${
        roomHotel?.name || "hotel ini"
      } akan ditutup sampai ${formatDateTime(closeForm.booking_reopen_at)}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, tutup",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setSavingClose(true);
      setUpdatingRoomId(selectedCloseRoom.id);

      await updateRoomRequest(
        selectedCloseRoom.id,
        buildRoomStatusPayload(selectedCloseRoom, 0)
      );

      const nextMap = {
        ...roomCloseMetaMap,
        [String(selectedCloseRoom.id)]: {
          room_id: selectedCloseRoom.id,
          booking_closed_reason:
            closeForm.booking_closed_reason?.trim() || "Kamar penuh",
          booking_reopen_at: closeForm.booking_reopen_at,
          closed_at: new Date().toISOString(),
        },
      };

      persistRoomCloseMetaMap(nextMap);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Booking kamar berhasil ditutup.",
        confirmButtonColor: "#dc2626",
      });

      closeCloseRoomModal();
      await fetchAvailabilityData();
    } catch (err) {
      console.error("CLOSE ROOM BOOKING ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Status booking kamar gagal ditutup.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSavingClose(false);
      setUpdatingRoomId(null);
    }
  };

  const handleOpenRoomBooking = async (room) => {
    if (!room?.id) return;

    const roomHotel = getRoomHotel(room);

    const result = await Swal.fire({
      title: "Buka booking kamar?",
      text: `${room?.name || "Kamar"} di ${
        roomHotel?.name || "hotel ini"
      } akan dibuka kembali untuk booking customer.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, buka",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingRoomId(room.id);

      await updateRoomRequest(room.id, buildRoomStatusPayload(room, 1));

      const nextMap = { ...roomCloseMetaMap };
      delete nextMap[String(room.id)];
      persistRoomCloseMetaMap(nextMap);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Booking kamar berhasil dibuka kembali.",
        confirmButtonColor: "#16a34a",
      });

      await fetchAvailabilityData();
    } catch (err) {
      console.error("OPEN ROOM BOOKING ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Status booking kamar gagal dibuka.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!selectedHotelId) return [];

    return accessScopedRooms
      .filter((room) => getRoomHotelId(room) === String(selectedHotelId))
      .filter((room) => {
        if (!keyword) return true;

        const roomHotel = getRoomHotel(room);
        const cityName = getHotelCityName(roomHotel);

        return [
          room?.name,
          room?.type,
          roomHotel?.name,
          cityName,
          roomHotel?.area,
          roomHotel?.address,
        ]
          .map((item) => String(item || "").toLowerCase())
          .some((item) => item.includes(keyword));
      })
      .sort((a, b) => {
        const hotelA = String(getRoomHotel(a)?.name || "");
        const hotelB = String(getRoomHotel(b)?.name || "");

        if (hotelA !== hotelB) return hotelA.localeCompare(hotelB);

        return String(a?.name || "").localeCompare(String(b?.name || ""));
      });
  }, [accessScopedRooms, search, selectedHotelId, hotelsById]);

  const availabilityStats = useMemo(() => {
    const activeRooms = filteredRooms.filter((room) => isRoomActive(room)).length;
    const closedRooms = filteredRooms.length - activeRooms;
    const totalUnits = filteredRooms.reduce(
      (sum, room) => sum + Number(room?.total_rooms || 0),
      0
    );

    return {
      totalRooms: filteredRooms.length,
      activeRooms,
      closedRooms,
      totalUnits,
    };
  }, [filteredRooms]);

  const selectedHotelData = selectedHotelId
    ? hotelOptions.find((hotel) => String(hotel?.id) === String(selectedHotelId)) ||
      hotelsById.get(String(selectedHotelId)) ||
      null
    : null;

  const selectedHotelLabel = selectedHotelData?.name || "Belum pilih cabang";

  const selectedCloseRoomHotel = selectedCloseRoom
    ? getRoomHotel(selectedCloseRoom)
    : null;

  const hasHotelAccess =
    canAccessAllHotels || loadingUserAccessHotels || assignedHotelIds.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                fetchAvailabilityData();
                fetchUserAccessHotels();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mb-4 overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 px-5 py-4 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black">Filter</h2>
                  <p className="mt-1 text-xs text-white/70">
                    Pilih cabang/hotel, lalu kamar akan langsung tampil.
                  </p>
                </div>

                <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                  {selectedHotelLabel}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12 md:p-5">
              <div className="md:col-span-5">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Cabang / Hotel
                </label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  disabled={!hasHotelAccess}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {loading || loadingUserAccessHotels
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
                  <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-600">
                    Sedang memuat akses cabang user...
                  </p>
                )}

                {!loadingUserAccessHotels && !hasHotelAccess && (
                  <p className="mt-2 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-700">
                    Akun ini belum memiliki akses cabang. Atur akses cabang dari Kelola Users.
                  </p>
                )}

                {!selectedHotelId && hasHotelAccess && (
                  <p className="mt-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold leading-relaxed text-red-700">
                    Wajib pilih cabang/hotel dulu agar daftar kamar tampil.
                  </p>
                )}

                {selectedHotelId && (
                  <p className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold leading-relaxed text-emerald-700">
                    Cabang dipilih. Silakan atur kamar yang mau dibuka atau ditutup.
                  </p>
                )}
              </div>

              <div className="md:col-span-7">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Cari Kamar
                </label>
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      selectedHotelId ? "Cari kamar atau tipe..." : "Pilih cabang dulu"
                    }
                    disabled={!selectedHotelId}
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {selectedHotelId && (
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 pb-4 md:px-5">
                <StatusPill label={`Total Kamar: ${availabilityStats.totalRooms}`} />
                <StatusPill
                  color="bg-emerald-500"
                  label={`Dibuka: ${availabilityStats.activeRooms}`}
                />
                <StatusPill
                  color="bg-amber-500"
                  label={`Ditutup: ${availabilityStats.closedRooms}`}
                />
                <StatusPill
                  color="bg-slate-500"
                  label={`Total Unit: ${availabilityStats.totalUnits}`}
                />
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-extrabold text-gray-900">
                  Data Kamar
                </h2>

                <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                  {filteredRooms.length} data ditemukan
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Atur booking buka/tutup dari tipe kamar yang dipilih.
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data ketersediaan...
              </div>
            ) : !hasHotelAccess ? (
              <EmptyState
                title="Belum ada akses cabang"
                description="Akun ini belum memiliki akses cabang. Atur akses cabang dari Kelola Users terlebih dahulu."
              />
            ) : !selectedHotelId ? (
              <EmptyState
                title="Pilih cabang dulu"
                description="Kamar baru akan tampil setelah hotel atau cabang dipilih."
              />
            ) : filteredRooms.length === 0 ? (
              <EmptyState
                title="Data kamar tidak ditemukan"
                description="Belum ada kamar untuk hotel ini atau coba kata kunci pencarian berbeda."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px]">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-5 py-4 font-semibold">Kamar</th>
                      <th className="px-5 py-4 font-semibold">Hotel</th>
                      <th className="px-5 py-4 font-semibold">Kota / Area</th>
                      <th className="px-5 py-4 font-semibold">Total Unit</th>
                      <th className="px-5 py-4 font-semibold">Status Booking</th>
                      <th className="px-5 py-4 font-semibold">Buka Kembali</th>
                      <th className="px-5 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRooms.map((room) => {
                      const roomHotel = getRoomHotel(room);
                      const active = isRoomActive(room);
                      const updating = updatingRoomId === room.id;
                      const closeMeta = getRoomCloseMeta(room.id);

                      return (
                        <tr
                          key={room.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <BedDouble size={18} />
                              </div>

                              <div>
                                <p className="font-bold text-gray-900">
                                  {room?.name || "-"}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-gray-400">
                                  {room?.type || "Tipe kamar"} • ID: {room?.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            <div className="inline-flex items-center gap-2">
                              <Hotel size={16} className="text-gray-400" />
                              <span className="font-semibold">
                                {roomHotel?.name || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            <p className="font-semibold">
                              {getHotelCityName(roomHotel)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {roomHotel?.area || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            {room?.total_rooms || 0}
                          </td>

                          <td className="px-5 py-4">
                            {active ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                                <Unlock size={15} />
                                Booking dibuka
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                                  <Lock size={15} />
                                  Booking ditutup
                                </span>
                                {closeMeta?.booking_closed_reason && (
                                  <p className="mt-1 text-xs font-medium text-gray-400">
                                    {closeMeta.booking_closed_reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {!active && closeMeta?.booking_reopen_at ? (
                              <div className="inline-flex items-center gap-2">
                                <Clock3 size={16} className="text-gray-400" />
                                {formatDateTime(closeMeta.booking_reopen_at)}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              {active ? (
                                <button
                                  type="button"
                                  onClick={() => openCloseRoomModal(room)}
                                  disabled={updating}
                                  className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Lock size={16} />
                                  {updating ? "Memproses..." : "Tutup Booking"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoomBooking(room)}
                                  disabled={updating}
                                  className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Unlock size={16} />
                                  {updating ? "Memproses..." : "Buka Booking"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCloseModal && selectedCloseRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tutup Booking Kamar
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCloseRoom?.name || "Kamar"} •{" "}
                  {selectedCloseRoomHotel?.name || "Hotel"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCloseRoomModal}
                disabled={savingClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCloseRoomBooking} className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                Kamar akan disembunyikan dari booking customer sampai jam yang dipilih admin.
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Alasan Tutup Booking
                </label>
                <input
                  type="text"
                  name="booking_closed_reason"
                  value={closeForm.booking_closed_reason}
                  onChange={handleCloseFormChange}
                  placeholder="Contoh: Kamar penuh"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tombol Cepat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "3 Jam", hours: 3 },
                    { label: "6 Jam", hours: 6 },
                    { label: "12 Jam", hours: 12 },
                  ].map((item) => {
                    const active = selectedQuickCloseHours === item.hours;

                    return (
                      <button
                        key={item.hours}
                        type="button"
                        onClick={() => handleQuickCloseHours(item.hours)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          active
                            ? "border-amber-500 bg-amber-400 text-amber-950 shadow-lg shadow-amber-100 ring-2 ring-amber-200"
                            : "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                {selectedQuickCloseHours && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    Tombol cepat aktif: {selectedQuickCloseHours} jam. Admin tetap bisa ubah manual di bawah.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Buka Kembali
                </label>
                <div className="relative">
                  <Clock3
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="datetime-local"
                    name="booking_reopen_at"
                    min={getMinDateTimeLocal()}
                    value={closeForm.booking_reopen_at}
                    onChange={handleCloseFormChange}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Admin tetap bebas pilih tanggal dan jam manual, tidak harus pakai tombol cepat.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeCloseRoomModal}
                  disabled={savingClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={18} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={18} />
                  {savingClose ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ color = "bg-red-500", label }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-5 py-12">
      <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}
