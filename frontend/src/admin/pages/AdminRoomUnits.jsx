import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomUnits() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await api.get("/admin/rooms");
    setRooms(res.data);
  };

  const fetchUnits = async (roomId) => {
    const res = await api.get(`/admin/room-units/${roomId}`);
    setUnits(res.data);
  };

  const handleAdd = async () => {
    if (!selectedRoom) return toast.error("Pilih tipe kamar");
    if (!roomNumber) return toast.error("Isi nomor kamar");

    try {
      await api.post("/admin/room-units", {
        room_id: selectedRoom,
        room_number: roomNumber,
        status: true,
      });

      toast.success("Kamar berhasil ditambahkan");
      setRoomNumber("");
      fetchUnits(selectedRoom);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal tambah kamar");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">
            Manajemen Kamar Fisik
          </h1>

          <div className="bg-white p-6 rounded-2xl shadow">
            {/* SELECT ROOM */}
            <select
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
                fetchUnits(e.target.value);
              }}
              className="w-full border p-3 rounded-xl mb-4"
            >
              <option value="">Pilih Tipe Kamar</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.hotel?.name}
                </option>
              ))}
            </select>

            {/* INPUT */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Contoh: 101"
                className="flex-1 border p-3 rounded-xl"
              />

              <button
                onClick={handleAdd}
                className="bg-red-600 text-white px-5 rounded-xl"
              >
                Tambah
              </button>
            </div>

            {/* LIST */}
            <div className="flex flex-wrap gap-2">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-gray-100 px-4 py-2 rounded-xl"
                >
                  {unit.room_number}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}