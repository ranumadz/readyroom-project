import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function AddRoom() {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    hotel_id: "",
    name: "",
    type: "",
    capacity: "",
    price_per_night: "",
    price_3h: "",
    price_6h: "",
    price_12h: "",
    total_rooms: "",
    status: true,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get("/admin/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Gagal mengambil data hotel:", error);
      toast.error("Gagal mengambil data hotel");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/admin/rooms", form);

      toast.success("Room berhasil ditambahkan");

      setForm({
        hotel_id: "",
        name: "",
        type: "",
        capacity: "",
        price_per_night: "",
        price_3h: "",
        price_6h: "",
        price_12h: "",
        total_rooms: "",
        status: true,
      });
    } catch (error) {
      console.error("Gagal menambahkan room:", error);
      toast.error(
        error.response?.data?.message || "Gagal menambahkan room"
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Add Room</h1>
            <p className="text-gray-500 mt-1">
              Tambahkan kamar baru ke hotel tertentu
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel
                </label>
                <select
                  name="hotel_id"
                  value={form.hotel_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Pilih Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Room
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Deluxe Room"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Room
                </label>
                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="Deluxe"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price / Night
                </label>
                <input
                  type="number"
                  name="price_per_night"
                  value={form.price_per_night}
                  onChange={handleChange}
                  placeholder="450000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price 3 Jam
                </label>
                <input
                  type="number"
                  name="price_3h"
                  value={form.price_3h}
                  onChange={handleChange}
                  placeholder="150000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price 6 Jam
                </label>
                <input
                  type="number"
                  name="price_6h"
                  value={form.price_6h}
                  onChange={handleChange}
                  placeholder="250000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price 12 Jam
                </label>
                <input
                  type="number"
                  name="price_12h"
                  value={form.price_12h}
                  onChange={handleChange}
                  placeholder="350000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rooms
                </label>
                <input
                  type="number"
                  name="total_rooms"
                  value={form.total_rooms}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Room Aktif</label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition font-medium"
                >
                  Simpan Room
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}  