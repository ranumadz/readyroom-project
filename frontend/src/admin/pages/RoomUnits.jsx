import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomUnits() {
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [units, setUnits] = useState([]);

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);

  const [searchUnit, setSearchUnit] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

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

      if (!selectedRoom && roomList.length > 0) {
        const firstRoomId = String(roomList[0].id);
        const firstHotelId = String(
          roomList[0]?.hotel_id || roomList[0]?.hotel?.id || "all"
        );

        setSelectedHotelId(firstHotelId || "all");
        setSelectedRoom(firstRoomId);
        fetchUnits(firstRoomId);
      }
    } catch (error) {
      console.error("Gagal mengambil data rooms:", error);
      toast.error("Gagal mengambil data tipe kamar");
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchUnits = async (roomId) => {
    if (!roomId) {
      setUnits([]);
      return;
    }

    try {
      setLoadingUnits(true);
      const res = await api.get(`/admin/room-units/${roomId}`);
      setUnits(normalizeArrayResponse(res.data));
    } catch (error) {
      console.error("Gagal mengambil data room units:", error);
      toast.error("Gagal mengambil data kamar fisik");
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const selectedRoomData = useMemo(() => {
    return rooms.find((room) => String(room.id) === String(selectedRoom));
  }, [rooms, selectedRoom]);

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
    if (selectedHotelId === "all") return null;

    return hotelOptions.find(
      (hotel) => String(hotel.id) === String(selectedHotelId)
    );
  }, [hotelOptions, selectedHotelId]);

  const roomsBySelectedHotel = useMemo(() => {
    const filteredRooms =
      selectedHotelId === "all"
        ? rooms
        : rooms.filter((room) => {
            const hotelId = room?.hotel_id || room?.hotel?.id;
            return String(hotelId) === String(selectedHotelId);
          });

    return [...filteredRooms].sort((a, b) => {
      const hotelA = String(a?.hotel?.name || "");
      const hotelB = String(b?.hotel?.name || "");
      const hotelCompare = hotelA.localeCompare(hotelB);

      if (hotelCompare !== 0) return hotelCompare;

      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [rooms, selectedHotelId]);

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
    if (monitoringStatus === "occupied" || monitoringStatus === "booked") return "occupied";
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
        shortLabel: "Available",
        cardClass:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-800",
        badgeClass: "bg-emerald-100 text-emerald-700",
        dotClass: "bg-emerald-500",
        buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      },
      occupied: {
        label: "Terisi",
        shortLabel: "Occupied",
        cardClass:
          "border-red-200 bg-gradient-to-br from-red-50 to-white text-red-800",
        badgeClass: "bg-red-100 text-red-700",
        dotClass: "bg-red-500",
        buttonClass: "bg-red-600 text-white hover:bg-red-700",
      },
      cleaning: {
        label: "Cleaning",
        shortLabel: "Cleaning",
        cardClass:
          "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-800",
        badgeClass: "bg-amber-100 text-amber-700",
        dotClass: "bg-amber-500",
        buttonClass: "bg-amber-500 text-white hover:bg-amber-600",
      },
      maintenance: {
        label: "Maintenance",
        shortLabel: "Maintenance",
        cardClass:
          "border-slate-300 bg-gradient-to-br from-slate-100 to-white text-slate-800",
        badgeClass: "bg-slate-200 text-slate-700",
        dotClass: "bg-slate-500",
        buttonClass: "bg-slate-800 text-white hover:bg-slate-900",
      },
      inactive: {
        label: "Nonaktif",
        shortLabel: "Inactive",
        cardClass:
          "border-gray-200 bg-gradient-to-br from-gray-100 to-white text-gray-700 opacity-75",
        badgeClass: "bg-gray-200 text-gray-600",
        dotClass: "bg-gray-400",
        buttonClass: "bg-gray-700 text-white hover:bg-gray-800",
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

  const getUnitActiveBookingText = (unit) => {
    const booking = unit?.current_booking || unit?.active_booking || null;

    if (!booking) return "";

    const code = booking?.booking_code || booking?.code || booking?.id;
    const checkout =
      booking?.check_out ||
      booking?.checkout_at ||
      booking?.end_time ||
      booking?.check_out_time;

    if (code && checkout) return `${code} • sampai ${checkout}`;
    if (code) return `Booking ${code}`;
    if (checkout) return `Terisi sampai ${checkout}`;

    return "Sedang terisi";
  };

  const filteredUnits = useMemo(() => {
    const keyword = searchUnit.trim().toLowerCase();

    return units.filter((unit) => {
      const status = getRoomUnitStatus(unit);
      const roomNumberText = String(unit?.room_number || "").toLowerCase();
      const reasonText = getUnitReason(unit).toLowerCase();

      const matchStatus = selectedStatus === "all" || selectedStatus === status;
      const matchKeyword =
        !keyword ||
        roomNumberText.includes(keyword) ||
        reasonText.includes(keyword);

      return matchStatus && matchKeyword;
    });
  }, [units, searchUnit, selectedStatus]);

  const unitStats = useMemo(() => {
    const stats = {
      total: units.length,
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      inactive: 0,
    };

    units.forEach((unit) => {
      const status = getRoomUnitStatus(unit);
      stats[status] = (stats[status] || 0) + 1;
    });

    return stats;
  }, [units]);

  const handleHotelChange = (hotelId) => {
    setSelectedHotelId(hotelId);
    setSearchUnit("");
    setSelectedStatus("all");

    const availableRooms =
      hotelId === "all"
        ? rooms
        : rooms.filter((room) => {
            const roomHotelId = room?.hotel_id || room?.hotel?.id;
            return String(roomHotelId) === String(hotelId);
          });

    if (availableRooms.length > 0) {
      const firstRoomId = String(availableRooms[0].id);
      setSelectedRoom(firstRoomId);
      fetchUnits(firstRoomId);
      return;
    }

    setSelectedRoom("");
    setUnits([]);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    setSearchUnit("");
    setSelectedStatus("all");
    fetchUnits(roomId);
  };

  const handleAdd = async () => {
    if (!selectedRoom) return toast.error("Pilih tipe kamar terlebih dahulu");
    if (!roomNumber.trim()) return toast.error("Isi nomor kamar");

    try {
      setAddingUnit(true);

      await api.post("/admin/room-units", {
        room_id: selectedRoom,
        room_number: roomNumber.trim(),
        status: true,
      });

      toast.success("Kamar fisik berhasil ditambahkan");
      setRoomNumber("");
      fetchUnits(selectedRoom);
    } catch (err) {
      console.error("Gagal tambah kamar fisik:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Gagal tambah kamar");
    } finally {
      setAddingUnit(false);
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
      fetchUnits(selectedRoom);
    } catch (error) {
      console.error("Gagal update status kamar:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Backend belum support update status room unit. Kirim RoomUnitController.php untuk Step B."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleKeyDownAdd = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

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
                Kelola nomor kamar fisik, pantau status kamar, dan tutup kamar
                sementara saat rusak, maintenance, atau belum siap digunakan.
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

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Total Unit
              </p>
              <p className="mt-2 text-3xl font-black text-gray-950">
                {unitStats.total}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Pada tipe kamar terpilih
              </p>
            </div>

            <div className="rounded-[26px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Tersedia
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-700">
                {unitStats.available}
              </p>
              <p className="mt-1 text-sm text-emerald-700/70">
                Siap dipilih booking
              </p>
            </div>

            <div className="rounded-[26px] border border-red-100 bg-red-50/70 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Terisi
              </p>
              <p className="mt-2 text-3xl font-black text-red-700">
                {unitStats.occupied}
              </p>
              <p className="mt-1 text-sm text-red-700/70">
                Dari booking aktif
              </p>
            </div>

            <div className="rounded-[26px] border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                Cleaning
              </p>
              <p className="mt-2 text-3xl font-black text-amber-700">
                {unitStats.cleaning}
              </p>
              <p className="mt-1 text-sm text-amber-700/70">
                Belum siap dipakai
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Nonaktif
              </p>
              <p className="mt-2 text-3xl font-black text-slate-700">
                {unitStats.inactive + unitStats.maintenance}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Rusak / maintenance
              </p>
            </div>
          </div>

          <div className="mb-5 overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-950 via-gray-900 to-red-950 px-6 py-5 text-white">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-black">Filter Monitoring Kamar</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    Pilih cabang terlebih dahulu, lalu tipe kamar hanya akan
                    menampilkan kamar yang terdaftar di cabang tersebut.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
                  {selectedRoomData?.hotel?.name || "Belum pilih cabang"}
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
                  <option value="all">Semua Cabang</option>
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
                  onChange={(e) => handleRoomChange(e.target.value)}
                  disabled={loadingRooms || roomsBySelectedHotel.length === 0}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingRooms
                      ? "Memuat tipe kamar..."
                      : roomsBySelectedHotel.length === 0
                      ? "Belum ada tipe kamar"
                      : "Pilih Tipe Kamar"}
                  </option>

                  {roomsBySelectedHotel.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.type || "Tipe"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Cari Nomor Kamar
                </label>

                <input
                  type="text"
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  placeholder="Cari 101, 202, A01..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                  Filter Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
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
                    onClick={() => setSelectedStatus(tab.value)}
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

            {selectedRoomData && (
              <div className="grid grid-cols-1 gap-3 border-t border-gray-100 bg-red-50/50 px-6 py-4 text-sm md:grid-cols-3">
                <div className="rounded-2xl border border-red-100 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Hotel / Cabang
                  </p>
                  <p className="mt-1 font-black text-gray-900">
                    {selectedHotelData?.name || selectedRoomData?.hotel?.name || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Tipe Kamar
                  </p>
                  <p className="mt-1 font-black text-gray-900">
                    {selectedRoomData?.type || selectedRoomData?.name || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Kapasitas
                  </p>
                  <p className="mt-1 font-black text-gray-900">
                    {selectedRoomData?.capacity || 0} Orang
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-5 rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Tambah Kamar Fisik
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Masukkan nomor kamar fisik sesuai tipe kamar yang sedang
                  dipilih. Contoh: 101, 102, 201, A01.
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                {selectedRoomData?.name || "Pilih cabang dan tipe kamar dulu"}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                onKeyDown={handleKeyDownAdd}
                placeholder="Masukkan nomor kamar"
                disabled={!selectedRoom || addingUnit}
                className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedRoom || addingUnit}
                className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingUnit ? "Menambahkan..." : "+ Tambah Unit"}
              </button>
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
                  cepat melihat kamar yang tersedia, terisi, cleaning, atau
                  nonaktif.
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

            <div className="min-h-[280px] bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.08),_transparent_32%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] p-6">
              {loadingUnits ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="rounded-3xl border border-gray-100 bg-white px-6 py-5 text-center shadow-sm">
                    <p className="text-sm font-black text-gray-800">
                      Memuat kamar fisik...
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Mohon tunggu sebentar.
                    </p>
                  </div>
                </div>
              ) : !selectedRoom ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
                    <p className="text-lg font-black text-gray-900">
                      Pilih cabang dan tipe kamar dulu
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Setelah cabang dan tipe kamar dipilih, daftar kamar fisik akan tampil
                      dalam bentuk monitoring.
                    </p>
                  </div>
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
                    <p className="text-lg font-black text-gray-900">
                      Belum ada kamar yang cocok
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Tambahkan nomor kamar fisik atau ubah filter pencarian dan
                      status.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
                  {filteredUnits.map((unit) => {
                    const status = getRoomUnitStatus(unit);
                    const meta = getStatusMeta(status);
                    const reason = getUnitReason(unit);
                    const activeBookingText = getUnitActiveBookingText(unit);

                    return (
                      <div
                        key={unit.id}
                        className={`group relative overflow-hidden rounded-[26px] border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${meta.cardClass}`}
                      >
                        <div className="absolute right-3 top-3">
                          <span
                            className={`inline-flex h-3 w-3 rounded-full ring-4 ring-white ${meta.dotClass}`}
                          />
                        </div>

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-lg font-black shadow-sm">
                          🛏
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wide text-current/55">
                          Kamar
                        </p>

                        <h3 className="mt-1 text-2xl font-black tracking-tight">
                          {unit.room_number || "-"}
                        </h3>

                        <div className="mt-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${meta.badgeClass}`}
                          >
                            {meta.shortLabel}
                          </span>
                        </div>

                        {activeBookingText && (
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
                            <>
                              <button
                                type="button"
                                onClick={() => openStatusModal(unit, "maintenance")}
                                className="rounded-2xl bg-gray-950 px-3 py-2 text-xs font-black text-white transition hover:bg-black"
                              >
                                Maintenance
                              </button>

                              <button
                                type="button"
                                onClick={() => openStatusModal(unit, "inactive")}
                                className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-black text-white transition hover:bg-red-700"
                              >
                                Nonaktifkan
                              </button>
                            </>
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
    </div>
  );
}
