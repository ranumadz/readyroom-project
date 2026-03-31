import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/admin/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Gagal mengambil data room:", error);
      toast.error("Gagal mengambil data room");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daftar Kamar List</h1>
              <p className="text-gray-500 mt-1">
                Daftar semua kamar hotel ReadyRoom
              </p>
            </div>

            <a
              href="/admin/rooms/add"
              className="bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-black transition font-medium"
            >
              + Add Room
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-sm text-gray-600">
                      <th className="px-6 py-4 font-semibold">Room Name</th>
                      <th className="px-6 py-4 font-semibold">Hotel</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Capacity</th>
                      <th className="px-6 py-4 font-semibold">Price / Night</th>
                      <th className="px-6 py-4 font-semibold">Transit 3H</th>
                      <th className="px-6 py-4 font-semibold">Transit 6H</th>
                      <th className="px-6 py-4 font-semibold">Transit 12H</th>
                      <th className="px-6 py-4 font-semibold">Total Rooms</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {room.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {room.hotel?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {room.type}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {room.capacity}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">
                          Rp{room.price_per_night}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          Rp{room.price_3h || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          Rp{room.price_6h || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          Rp{room.price_12h || 0}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {room.total_rooms}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              room.status
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {room.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Belum ada data room.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}