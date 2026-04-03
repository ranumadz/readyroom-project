import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Plus,
  Wifi,
  CheckCircle2,
  CircleOff,
  Layers3,
  Car,
  Tv,
  Bath,
  Coffee,
  Dumbbell,
  Waves,
  AirVent,
  UtensilsCrossed,
  BedDouble,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2";

const iconOptions = [
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "car", label: "Parkir", icon: Car },
  { value: "tv", label: "TV", icon: Tv },
  { value: "bath", label: "Kamar Mandi", icon: Bath },
  { value: "coffee", label: "Breakfast / Coffee", icon: Coffee },
  { value: "dumbbell", label: "Gym", icon: Dumbbell },
  { value: "waves", label: "Kolam Renang", icon: Waves },
  { value: "air-vent", label: "AC", icon: AirVent },
  { value: "utensils-crossed", label: "Restoran", icon: UtensilsCrossed },
  { value: "bed-double", label: "Tempat Tidur Besar", icon: BedDouble },
];

const getIconComponent = (iconName) => {
  const found = iconOptions.find((item) => item.value === iconName);
  return found ? found.icon : Wifi;
};

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    icon: "wifi",
    status: true,
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/facilities");
      setFacilities(res.data.data || []);
    } catch (err) {
      console.error("GET FACILITIES ERROR:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data fasilitas gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectIcon = (value) => {
    setForm((prev) => ({
      ...prev,
      icon: value,
    }));
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops",
        text: "Nama fasilitas wajib diisi",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    try {
      setSaving(true);

      await api.post("/admin/facilities", form);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Fasilitas berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
      });

      setForm({
        name: "",
        icon: "wifi",
        status: true,
      });

      fetchFacilities();
    } catch (err) {
      console.error("POST FACILITY ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Fasilitas gagal ditambahkan",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (facility) => {
    try {
      await api.put(`/admin/facilities/${facility.id}`, {
        name: facility.name,
        icon: facility.icon,
        status: !facility.status,
      });

      fetchFacilities();
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Status fasilitas gagal diubah",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const selectedIcon =
    iconOptions.find((item) => item.value === form.icon) || iconOptions[0];
  const SelectedIconComponent = selectedIcon.icon;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-red-600">Admin Panel</p>
              <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
                Management Facilities
              </h1>
              <p className="mt-2 text-gray-500">
                Kelola daftar fasilitas yang nanti bisa dipakai untuk hotel dan kamar.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Tambah Fasilitas
                      </h2>
                      <p className="text-sm text-gray-500">
                        Tambahkan fasilitas baru untuk sistem hotel.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nama Fasilitas
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Contoh: WiFi"
                        className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Icon Fasilitas
                      </label>

                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex w-full items-center justify-between rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none hover:border-red-400 focus:ring-2 focus:ring-red-500"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                              <SelectedIconComponent size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-gray-800">
                                {selectedIcon.label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {selectedIcon.value}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`text-gray-500 transition ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                            <div className="max-h-72 overflow-y-auto">
                              {iconOptions.map((item) => {
                                const ItemIcon = item.icon;
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => handleSelectIcon(item.value)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-50 ${
                                      form.icon === item.value ? "bg-red-50" : "bg-white"
                                    }`}
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                      <ItemIcon size={18} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">
                                        {item.label}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {item.value}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        Admin tinggal pilih icon, jadi tidak perlu mengetik manual.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <input
                        type="checkbox"
                        id="status"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                        className="h-4 w-4 accent-red-600"
                      />
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700"
                      >
                        Aktifkan fasilitas
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-2xl bg-red-600 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                    >
                      {saving ? "Menyimpan..." : "Simpan Fasilitas"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                        <Layers3 size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          Daftar Fasilitas
                        </h2>
                        <p className="text-sm text-gray-500">
                          List fasilitas aktif dan nonaktif di sistem.
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Total:{" "}
                      <span className="font-semibold text-gray-800">
                        {facilities.length}
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-16 text-center text-gray-500">
                      Memuat data fasilitas...
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                      Belum ada data fasilitas.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200 text-left">
                            <th className="py-3 text-sm font-semibold text-gray-600">#</th>
                            <th className="py-3 text-sm font-semibold text-gray-600">Nama</th>
                            <th className="py-3 text-sm font-semibold text-gray-600">Icon</th>
                            <th className="py-3 text-sm font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facilities.map((item, index) => {
                            const TableIcon = getIconComponent(item.icon);

                            return (
                              <tr
                                key={item.id}
                                className="border-b border-gray-100 transition hover:bg-gray-50"
                              >
                                <td className="py-4 text-gray-500">{index + 1}</td>
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                      <TableIcon size={18} />
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                      {item.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 text-gray-600">
                                  {item.icon || "-"}
                                </td>
                                <td className="py-4">
                                  <button
                                    onClick={() => toggleStatus(item)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition ${
                                      item.status
                                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {item.status ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}