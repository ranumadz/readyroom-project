import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Swal from "sweetalert2";
import {
  Building2,
  MapPin,
  CheckCircle2,
  CircleOff,
  Pencil,
  Trash2,
  Plus,
  BedDouble,
} from "lucide-react";

export default function HotelsList() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/hotels");

      const hotelData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.hotels)
        ? res.data.hotels
        : Array.isArray(res.data)
        ? res.data
        : [];

      setHotels(hotelData);
    } catch (err) {
      console.error("GET HOTELS ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data hotel gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (hotel) => {
    const result = await Swal.fire({
      title: "Hapus hotel?",
      text: `Hotel "${hotel.name}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin/hotels/${hotel.id}`);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Hotel berhasil dihapus",
        confirmButtonColor: "#dc2626",
      });

      fetchHotels();
    } catch (err) {
      console.error("DELETE HOTEL ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Hotel gagal dihapus",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const toggleStatus = async (hotel) => {
    try {
      await api.put(`/admin/hotels/${hotel.id}`, {
        city_id: hotel.city_id,
        name: hotel.name,
        area: hotel.area,
        address: hotel.address,
        description: hotel.description,
        status: !hotel.status,
      });

      fetchHotels();
    } catch (err) {
      console.error("TOGGLE HOTEL STATUS ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Status hotel gagal diubah",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">
                Admin Panel
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Hotels List
              </h1>
              <p className="text-gray-500 mt-2">
                Kelola data hotel dan cabang ReadyRoom.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/hotels/add")}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition shadow-sm"
            >
              <Plus size={18} />
              Add Hotel
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data hotel...
              </div>
            ) : hotels.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Building2 size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Belum ada data hotel
                </h3>
                <p className="text-gray-500 mt-2 mb-5">
                  Tambahkan cabang hotel pertama untuk mulai mengelola room dan booking.
                </p>
                <button
                  onClick={() => navigate("/admin/add-hotel")}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
                >
                  <Plus size={18} />
                  Add Hotel
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-4 text-sm font-semibold text-gray-600">#</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Hotel</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Kota</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Area</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Alamat</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="py-4 text-sm font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {hotels.map((hotel, index) => (
                      <tr
                        key={hotel.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 text-gray-500">{index + 1}</td>

                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {hotel.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                ID: {hotel.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 text-gray-700">
                          {hotel.city?.name || hotel.city_name || "-"}
                        </td>

                        <td className="py-4 text-gray-700">
                          <div className="inline-flex items-center gap-2">
                            <MapPin size={15} className="text-gray-400" />
                            {hotel.area || "-"}
                          </div>
                        </td>

                        <td className="py-4 text-gray-600 max-w-[280px]">
                          <p className="truncate">{hotel.address || "-"}</p>
                        </td>

                        <td className="py-4">
                          <button
                            onClick={() => toggleStatus(hotel)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                              hotel.status
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {hotel.status ? (
                              <>
                                <CheckCircle2 size={16} />
                                Aktif
                              </>
                            ) : (
                              <>
                                <CircleOff size={16} />
                                Nonaktif
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/hotels/${hotel.id}/rooms`)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-100 transition"
                            >
                              <BedDouble size={16} />
                              Manage Room
                            </button>

                            <button
                              onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 text-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-100 transition"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(hotel)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-3 py-2 text-sm font-medium hover:bg-red-100 transition"
                            >
                              <Trash2 size={16} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}