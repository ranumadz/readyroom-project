import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Swal from "sweetalert2";
import {
  Building2,
  MapPin,
  FileText,
  Save,
  ChevronDown,
  List,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function AddHotel() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [form, setForm] = useState({
    city_id: "",
    name: "",
    area: "",
    address: "",
    wa_admin: "",
    description: "",
    thumbnail: null,
    hero_image: null,
    status: true,
  });

  const [preview, setPreview] = useState({
    thumbnail: null,
    hero_image: null,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);

      const res = await api.get("/admin/hotels/create");

      const cityData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setCities(cityData);
    } catch (err) {
      console.error("GET CITIES ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data kota gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (file) {
        const objectUrl = URL.createObjectURL(file);

        setPreview((prev) => ({
          ...prev,
          [name]: objectUrl,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.city_id || !form.name.trim() || !form.area.trim() || !form.address.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Kota, nama hotel, area, dan alamat wajib diisi",
        confirmButtonColor: "#dc2626",
      });
    }

    if (form.wa_admin && form.wa_admin.replace(/\D/g, "").length < 10) {
      return Swal.fire({
        icon: "warning",
        title: "Nomor WhatsApp belum valid",
        text: "Nomor WhatsApp admin cabang minimal 10 digit",
        confirmButtonColor: "#dc2626",
      });
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("city_id", form.city_id);
      payload.append("name", form.name);
      payload.append("area", form.area);
      payload.append("address", form.address);
      payload.append("wa_admin", form.wa_admin || "");
      payload.append("description", form.description || "");
      payload.append("status", form.status ? 1 : 0);

      if (form.thumbnail) {
        payload.append("thumbnail", form.thumbnail);
      }

      if (form.hero_image) {
        payload.append("hero_image", form.hero_image);
      }

      await api.post("/admin/hotels", payload);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Hotel berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
      });

      setForm({
        city_id: "",
        name: "",
        area: "",
        address: "",
        wa_admin: "",
        description: "",
        thumbnail: null,
        hero_image: null,
        status: true,
      });

      setPreview({
        thumbnail: null,
        hero_image: null,
      });

      navigate("/admin/hotels");
    } catch (err) {
      console.error("ADD HOTEL ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Hotel gagal ditambahkan",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSaving(false);
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
              <p className="text-sm font-semibold text-red-600 mb-2">Admin Panel</p>
              <h1 className="text-3xl font-bold text-gray-800">Add Hotel</h1>
              <p className="text-gray-500 mt-1">
                Tambahkan cabang hotel baru ke sistem ReadyRoom
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/hotels")}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-gray-700 font-semibold shadow-sm transition hover:bg-gray-50"
            >
              <List size={18} />
              Hotels List
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kota
                </label>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <MapPin size={18} className="text-red-500" />
                  </div>

                  <select
                    name="city_id"
                    value={form.city_id}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 pl-12 pr-12 py-3.5 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 group-hover:border-gray-300"
                  >
                    <option value="">
                      {loadingCities ? "Memuat kota..." : "Pilih Kota"}
                    </option>

                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Pilih kota tempat cabang hotel berada
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Hotel / Cabang
                </label>

                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: ReadyRoom Melawai"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                  <Building2
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area
                </label>

                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Contoh: Melawai"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Masukkan alamat lengkap hotel"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor WhatsApp Admin Cabang
                </label>

                <div className="relative">
                  <input
                    type="text"
                    name="wa_admin"
                    value={form.wa_admin}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                  <MessageCircle
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Nomor ini akan dipakai sebagai kontak resmi admin cabang hotel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thumbnail Hotel
                  </label>

                  <label className="flex flex-col items-center justify-center w-full min-h-[170px] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-red-400 hover:bg-red-50/40 transition overflow-hidden">
                    {preview.thumbnail ? (
                      <img
                        src={preview.thumbnail}
                        alt="Preview Thumbnail"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <ImageIcon size={28} className="text-red-500 mb-3" />
                        <p className="font-semibold text-gray-700">
                          Upload Thumbnail Hotel
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG, WEBP
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hero Image Hotel
                  </label>

                  <label className="flex flex-col items-center justify-center w-full min-h-[170px] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-red-400 hover:bg-red-50/40 transition overflow-hidden">
                    {preview.hero_image ? (
                      <img
                        src={preview.hero_image}
                        alt="Preview Hero"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <ImageIcon size={28} className="text-red-500 mb-3" />
                        <p className="font-semibold text-gray-700">
                          Upload Hero Image
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG, WEBP
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      name="hero_image"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi
                </label>

                <div className="relative">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Deskripsi singkat hotel"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                  />
                  <FileText
                    size={18}
                    className="absolute right-4 top-4 text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Hotel Aktif
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/hotels")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-gray-700 font-semibold shadow-sm transition hover:bg-gray-50"
                >
                  <List size={18} />
                  Lihat Hotels List
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-red-700 disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}