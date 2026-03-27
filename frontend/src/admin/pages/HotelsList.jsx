import { useEffect, useMemo, useState } from "react";
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
  X,
  Save,
  ChevronDown,
  MessageCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

export default function HotelsList() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [editForm, setEditForm] = useState({
    city_id: "",
    name: "",
    area: "",
    address: "",
    wa_admin: "",
    map_link: "",
    description: "",
    thumbnail: null,
    hero_image: null,
    status: true,
  });

  const [preview, setPreview] = useState({
    thumbnail: null,
    hero_image: null,
  });

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
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchCities();
  }, []);

  const buildImageUrl = (path, fallback = "/images/hotel.jpg") => {
    if (!path) return fallback;

    const rawPath = String(path).trim();

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }

    const cleanPath = rawPath.replace(/^\/+/, "");

    if (cleanPath.startsWith("images/")) {
      return `/${cleanPath}`;
    }

    if (cleanPath.startsWith("storage/")) {
      return `http://127.0.0.1:8000/${cleanPath}`;
    }

    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  const resetEditState = () => {
    setSelectedHotel(null);
    setEditForm({
      city_id: "",
      name: "",
      area: "",
      address: "",
      wa_admin: "",
      map_link: "",
      description: "",
      thumbnail: null,
      hero_image: null,
      status: true,
    });
    setPreview({
      thumbnail: null,
      hero_image: null,
    });
  };

  const openEditModal = (hotel) => {
    setSelectedHotel(hotel);

    setEditForm({
      city_id: hotel.city_id || "",
      name: hotel.name || "",
      area: hotel.area || "",
      address: hotel.address || "",
      wa_admin: hotel.wa_admin || "",
      map_link: hotel.map_link || "",
      description: hotel.description || "",
      thumbnail: null,
      hero_image: null,
      status: Boolean(hotel.status),
    });

    setPreview({
      thumbnail: hotel.thumbnail ? buildImageUrl(hotel.thumbnail) : null,
      hero_image: hotel.hero_image
        ? buildImageUrl(hotel.hero_image, "/images/hero.jpg")
        : null,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetEditState();
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;

      setEditForm((prev) => ({
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

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("city_id", hotel.city_id || "");
      payload.append("name", hotel.name || "");
      payload.append("area", hotel.area || "");
      payload.append("address", hotel.address || "");
      payload.append("wa_admin", hotel.wa_admin || "");
      payload.append("map_link", hotel.map_link || "");
      payload.append("description", hotel.description || "");
      payload.append("status", hotel.status ? 0 : 1);

      await api.post(`/admin/hotels/${hotel.id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchHotels();
    } catch (err) {
      console.error("TOGGLE HOTEL STATUS ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Status hotel gagal diubah",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();

    if (!selectedHotel) return;

    if (
      !editForm.city_id ||
      !editForm.name.trim() ||
      !editForm.area.trim() ||
      !editForm.address.trim()
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Kota, nama hotel, area, dan alamat wajib diisi",
        confirmButtonColor: "#dc2626",
      });
    }

    if (editForm.wa_admin && editForm.wa_admin.replace(/\D/g, "").length < 10) {
      return Swal.fire({
        icon: "warning",
        title: "Nomor WhatsApp belum valid",
        text: "Nomor WhatsApp admin cabang minimal 10 digit",
        confirmButtonColor: "#dc2626",
      });
    }

    if (editForm.map_link && !/^https?:\/\/.+/i.test(editForm.map_link.trim())) {
      return Swal.fire({
        icon: "warning",
        title: "Link map belum valid",
        text: "Masukkan link Google Maps yang valid",
        confirmButtonColor: "#dc2626",
      });
    }

    try {
      setSavingEdit(true);

      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("city_id", editForm.city_id);
      payload.append("name", editForm.name);
      payload.append("area", editForm.area);
      payload.append("address", editForm.address);
      payload.append("wa_admin", editForm.wa_admin || "");
      payload.append("map_link", editForm.map_link || "");
      payload.append("description", editForm.description || "");
      payload.append("status", editForm.status ? 1 : 0);

      if (editForm.thumbnail) {
        payload.append("thumbnail", editForm.thumbnail);
      }

      if (editForm.hero_image) {
        payload.append("hero_image", editForm.hero_image);
      }

      await api.post(`/admin/hotels/${selectedHotel.id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Hotel berhasil diupdate",
        confirmButtonColor: "#dc2626",
      });

      closeEditModal();
      fetchHotels();
    } catch (err) {
      console.error("UPDATE HOTEL ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          err.response?.data?.errors?.map_link?.[0] ||
          err.response?.data?.errors?.name?.[0] ||
          "Hotel gagal diupdate",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const modalTitle = useMemo(() => {
    if (!selectedHotel) return "Edit Hotel";
    return `Edit Hotel - ${selectedHotel.name}`;
  }, [selectedHotel]);

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
                  onClick={() => navigate("/admin/hotels/add")}
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
                              onClick={() => openEditModal(hotel)}
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update data hotel tanpa pindah halaman
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
              <form onSubmit={handleUpdateHotel} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kota
                    </label>

                    <div className="relative">
                      <select
                        name="city_id"
                        value={editForm.city_id}
                        onChange={handleEditChange}
                        className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 pl-4 pr-12 py-3.5 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
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

                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Hotel / Cabang
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Contoh: ReadyRoom Veteran"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="area"
                        value={editForm.area}
                        onChange={handleEditChange}
                        placeholder="Contoh: Veteran"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                      <MapPin
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor WhatsApp Admin Cabang
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="wa_admin"
                        value={editForm.wa_admin}
                        onChange={handleEditChange}
                        placeholder="Contoh: 081234567890"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                      <MessageCircle
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows={3}
                    placeholder="Masukkan alamat lengkap hotel"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link Google Maps
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="map_link"
                      value={editForm.map_link}
                      onChange={handleEditChange}
                      placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/..."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                    <LinkIcon
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
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
                        onChange={handleEditChange}
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
                        onChange={handleEditChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    type="checkbox"
                    id="edit_status"
                    name="status"
                    checked={editForm.status}
                    onChange={handleEditChange}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label
                    htmlFor="edit_status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hotel Aktif
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-gray-700 font-semibold shadow-sm transition hover:bg-gray-50"
                  >
                    <X size={18} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-red-700 disabled:opacity-70"
                  >
                    <Save size={18} />
                    {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}