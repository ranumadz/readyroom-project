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
  Link as LinkIcon,
  CheckSquare,
} from "lucide-react";

export default function AddHotel() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [form, setForm] = useState({
    city_id: "",
    name: "",
    area: "",
    address: "",
    wa_admin: "",
    map_link: "",
    description: "",
    thumbnail: null,
    hero_image: null,
    facility_ids: [],
    status: true,
  });

  const [preview, setPreview] = useState({
    thumbnail: null,
    hero_image: null,
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoadingCities(true);
      setLoadingFacilities(true);

      const res = await api.get("/admin/hotels/create");

      const cityData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.cities)
        ? res.data.cities
        : Array.isArray(res.data?.data?.cities)
        ? res.data.data.cities
        : [];

      const facilityData = Array.isArray(res.data?.facilities)
        ? res.data.facilities
        : Array.isArray(res.data?.data?.facilities)
        ? res.data.data.facilities
        : [];

      setCities(cityData);
      setFacilities(facilityData);
    } catch (err) {
      console.error("GET HOTEL FORM DATA ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data kota / fasilitas gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoadingCities(false);
      setLoadingFacilities(false);
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

  const handleFacilityToggle = (facilityId) => {
    setForm((prev) => {
      const exists = prev.facility_ids.includes(facilityId);

      return {
        ...prev,
        facility_ids: exists
          ? prev.facility_ids.filter((id) => id !== facilityId)
          : [...prev.facility_ids, facilityId],
      };
    });
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

    if (
      form.map_link &&
      !/^https?:\/\/(www\.)?(google\.[^\/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com)/i.test(
        form.map_link.trim()
      )
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Link Google Maps belum valid",
        text: "Masukkan link Google Maps yang valid",
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
      payload.append("map_link", form.map_link || "");
      payload.append("description", form.description || "");
      payload.append("status", form.status ? 1 : 0);

      form.facility_ids.forEach((facilityId, index) => {
        payload.append(`facility_ids[${index}]`, facilityId);
      });

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
        map_link: "",
        description: "",
        thumbnail: null,
        hero_image: null,
        facility_ids: [],
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
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-red-600">Admin Panel</p>
              <h1 className="text-3xl font-bold text-gray-800">Add Hotel</h1>
              <p className="mt-1 text-gray-500">
                Tambahkan cabang hotel baru ke sistem ReadyRoom
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/hotels")}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <List size={18} />
              Hotels List
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Kota
                </label>

                <div className="group relative">
                  <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
                    <MapPin size={18} className="text-red-500" />
                  </div>

                  <select
                    name="city_id"
                    value={form.city_id}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 py-3.5 pl-12 pr-12 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 group-hover:border-gray-300"
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

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Pilih kota tempat cabang hotel berada
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Alamat
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Masukkan alamat lengkap hotel"
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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

                <p className="mt-2 text-xs text-gray-400">
                  Nomor ini akan dipakai sebagai kontak resmi admin cabang hotel
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Link Google Maps
                </label>

                <div className="relative">
                  <input
                    type="text"
                    name="map_link"
                    value={form.map_link}
                    onChange={handleChange}
                    placeholder="Contoh: https://maps.app.goo.gl/xxxxx atau https://www.google.com/maps/..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                  <LinkIcon
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Lebih mudah untuk admin. Cukup paste link lokasi dari Google Maps
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Fasilitas Hotel
                </label>

                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckSquare size={18} className="text-red-500" />
                    <p className="font-semibold text-gray-800">
                      Pilih fasilitas yang tersedia di hotel ini
                    </p>
                  </div>

                  {loadingFacilities ? (
                    <p className="text-sm text-gray-500">Memuat fasilitas...</p>
                  ) : facilities.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Belum ada fasilitas aktif di sistem
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {facilities.map((facility) => {
                        const selected = form.facility_ids.includes(facility.id);

                        return (
                          <label
                            key={facility.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              selected
                                ? "border-red-300 bg-red-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => handleFacilityToggle(facility.id)}
                              className="mt-1 h-4 w-4 accent-red-600"
                            />

                            <div className="min-w-0">
                              <p
                                className={`font-semibold ${
                                  selected ? "text-red-700" : "text-gray-800"
                                }`}
                              >
                                {facility.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Icon: {facility.icon || "-"}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Fasilitas yang dipilih akan tersimpan ke hotel dan nanti bisa ditampilkan di sisi customer.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Thumbnail Hotel
                  </label>

                  <label className="flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-red-400 hover:bg-red-50/40">
                    {preview.thumbnail ? (
                      <img
                        src={preview.thumbnail}
                        alt="Preview Thumbnail"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                        <ImageIcon size={28} className="mb-3 text-red-500" />
                        <p className="font-semibold text-gray-700">
                          Upload Thumbnail Hotel
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
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
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hero Image Hotel
                  </label>

                  <label className="flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-red-400 hover:bg-red-50/40">
                    {preview.hero_image ? (
                      <img
                        src={preview.hero_image}
                        alt="Preview Hero"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                        <ImageIcon size={28} className="mb-3 text-red-500" />
                        <p className="font-semibold text-gray-700">
                          Upload Hero Image
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Deskripsi
                </label>

                <div className="relative">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Deskripsi singkat hotel"
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
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
                  className="h-4 w-4 accent-red-600"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Hotel Aktif
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admin/hotels")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <List size={18} />
                  Lihat Hotels List
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-70"
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