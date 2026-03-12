import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AddHotel() {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    city_id: "",
    name: "",
    area: "",
    address: "",
    description: "",
    thumbnail: "",
    hero_image: "",
    rating: "",
    status: true,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get("/admin/hotels/create");
      setCities(response.data);
    } catch (error) {
      console.error("Gagal mengambil data kota:", error);
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
      const response = await api.post("/admin/hotels", form);
      alert(response.data.message);

      setForm({
        city_id: "",
        name: "",
        area: "",
        address: "",
        description: "",
        thumbnail: "",
        hero_image: "",
        rating: "",
        status: true,
      });
    } catch (error) {
      console.error("Gagal menambahkan hotel:", error);
      alert("Gagal menambahkan hotel");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Add Hotel</h1>
            <p className="text-gray-500 mt-1">
              Tambahkan cabang hotel baru ke sistem ReadyRoom
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota
                </label>
                <select
                  name="city_id"
                  value={form.city_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Pilih Kota</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Hotel
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ReadyRoom Melawai - Jakarta"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Melawai"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  placeholder="4.5"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Masukkan alamat lengkap hotel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi hotel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleChange}
                  placeholder="/images/hotel.jpg"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  name="hero_image"
                  value={form.hero_image}
                  onChange={handleChange}
                  placeholder="/images/hero.jpg"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">
                  Hotel Aktif
                </label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Simpan Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}