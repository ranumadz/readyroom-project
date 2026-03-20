import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  BedDouble,
  ChevronDown,
  DoorOpen,
  Hotel,
  Plus,
  Building2,
} from "lucide-react";

export default function RoomUnits() {
  const [rooms, setRooms] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);

      const res = await api.get("/admin/rooms");

      const roomData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setRooms(roomData);
    } catch (error) {
      console.error("GET ROOMS ERROR:", error.response?.data || error);
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

      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setUnits(unitData);
    } catch (error) {
      console.error("GET ROOM UNITS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil data kamar fisik");
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleRoomChange = (e) => {
    const value = e.target.value;
    setSelectedRoom(value);
    setRoomNumber("");
    fetchUnits(value);
  };

  const handleAddUnit = async () => {
    if (!selectedRoom) {
      return toast.error("Pilih tipe kamar terlebih dahulu");
    }

    if (!roomNumber.trim()) {
      return toast.error("Nomor kamar wajib diisi");
    }

    try {
      setSaving(true);

      await api.post("/admin/room-units", {
        room_id: selectedRoom,
        room_number: roomNumber.trim(),
        status: true,
      });

      toast.success("Kamar fisik berhasil ditambahkan");
      setRoomNumber("");
      fetchUnits(selectedRoom);
    } catch (error) {
      console.error("ADD ROOM UNIT ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal menambahkan kamar fisik"
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedRoomData = rooms.find(
    (room) => String(room.id) === String(selectedRoom)
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Admin Panel
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Room Units
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola kamar fisik per tipe kamar untuk kebutuhan approval booking.
            </p>
          </div>

          {/* SELECT ROOM */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Pilih Tipe Kamar
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Pilih tipe kamar terlebih dahulu, lalu tambahkan nomor kamar fisiknya.
              </p>
            </div>

            <div className="relative max-w-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <BedDouble size={18} className="text-red-500" />
              </div>

              <select
                value={selectedRoom}
                onChange={handleRoomChange}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 pl-12 pr-12 py-3.5 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                <option value="">
                  {loadingRooms ? "Memuat tipe kamar..." : "Pilih Tipe Kamar"}
                </option>

                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.type || room.name} - {room.hotel?.name || "Tanpa Hotel"}
                  </option>
                ))}
              </select>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            </div>

            {selectedRoomData && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 size={16} className="text-red-500" />
                    <span>
                      <strong>Hotel:</strong>{" "}
                      {selectedRoomData.hotel?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <BedDouble size={16} className="text-red-500" />
                    <span>
                      <strong>Tipe:</strong>{" "}
                      {selectedRoomData.type || selectedRoomData.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Hotel size={16} className="text-red-500" />
                    <span>
                      <strong>Kapasitas:</strong>{" "}
                      {selectedRoomData.capacity || "-"} Orang
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ADD ROOM UNIT */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Tambah Kamar Fisik
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Contoh nomor kamar: 101, 102, 201, A01.
              </p>
            </div>

            <div className="max-w-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Masukkan nomor kamar"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pl-12 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                  <DoorOpen
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddUnit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-red-700 disabled:opacity-70"
                >
                  <Plus size={18} />
                  {saving ? "Menyimpan..." : "Tambah Unit"}
                </button>
              </div>
            </div>
          </div>

          {/* LIST UNITS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Kamar Fisik
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Daftar nomor kamar fisik untuk tipe kamar yang dipilih.
              </p>
            </div>

            {!selectedRoom ? (
              <div className="py-14 text-center text-gray-500">
                Pilih tipe kamar terlebih dahulu untuk melihat daftar kamar fisik.
              </div>
            ) : loadingUnits ? (
              <div className="py-14 text-center text-gray-500">
                Memuat data kamar fisik...
              </div>
            ) : units.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <DoorOpen size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Belum ada kamar fisik
                </h3>
                <p className="text-gray-500 mt-2">
                  Tambahkan nomor kamar fisik untuk tipe kamar ini.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <DoorOpen size={16} className="text-red-500" />
                    <span className="font-semibold text-gray-800">
                      {unit.room_number}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        unit.status
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {unit.status ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}