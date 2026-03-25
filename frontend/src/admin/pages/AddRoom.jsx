import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  Hotel,
  BedDouble,
  Users,
  Wallet,
  MoonStar,
  Clock3,
  Clock6,
  Clock12,
  Boxes,
  ChevronDown,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  Images,
} from "lucide-react";

export default function AddRoom() {
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    hotel_id: "",
    type: "",
    capacity: "",
    price_per_night: "",
    price_transit_3h: "",
    price_transit_6h: "",
    price_transit_12h: "",
    total_rooms: "",
    description: "",
    thumbnail: null,
    images: [],
    status: true,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoadingHotels(true);

      const res = await api.get("/admin/hotels");

      const hotelData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.hotels)
        ? res.data.hotels
        : Array.isArray(res.data)
        ? res.data
        : [];

      setHotels(hotelData);
    } catch (error) {
      console.error("Gagal mengambil data hotel:", error);
      toast.error("Gagal mengambil data hotel");
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Cover harus berupa gambar");
      return;
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      thumbnail: file,
    }));

    setCoverPreview(previewUrl);
  };

  const removeCover = () => {
    setForm((prev) => ({
      ...prev,
      thumbnail: null,
    }));

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverPreview(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleGalleryChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      toast.error("Semua file gallery harus berupa gambar");
      return;
    }

    const newPreviews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    setGalleryPreviews((prev) => [...prev, ...newPreviews]);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setGalleryPreviews((prev) => {
      const removed = prev[index];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearGallery = () => {
    galleryPreviews.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    setForm((prev) => ({
      ...prev,
      images: [],
    }));

    setGalleryPreviews([]);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    galleryPreviews.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    setForm({
      hotel_id: "",
      type: "",
      capacity: "",
      price_per_night: "",
      price_transit_3h: "",
      price_transit_6h: "",
      price_transit_12h: "",
      total_rooms: "",
      description: "",
      thumbnail: null,
      images: [],
      status: true,
    });

    setCoverPreview(null);
    setGalleryPreviews([]);

    if (coverInputRef.current) coverInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hotel_id) return toast.error("Pilih hotel terlebih dahulu");
    if (!form.type) return toast.error("Pilih tipe kamar");
    if (!form.capacity) return toast.error("Kapasitas wajib diisi");
    if (!form.total_rooms) return toast.error("Total kamar wajib diisi");
    if (!form.price_per_night) return toast.error("Harga per malam wajib diisi");

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("hotel_id", form.hotel_id);
      payload.append("name", `${form.type} Room`);
      payload.append("type", form.type);
      payload.append("capacity", form.capacity);
      payload.append("price_per_night", form.price_per_night || 0);
      payload.append("price_transit_3h", form.price_transit_3h || 0);
      payload.append("price_transit_6h", form.price_transit_6h || 0);
      payload.append("price_transit_12h", form.price_transit_12h || 0);
      payload.append("total_rooms", form.total_rooms);
      payload.append("description", form.description || "");
      payload.append("status", form.status ? 1 : 0);

      if (form.thumbnail) {
        payload.append("thumbnail", form.thumbnail);
      }

      form.images.forEach((file) => {
        payload.append("images[]", file);
      });

      await api.post("/admin/rooms", payload);

      toast.success("Kamar berhasil ditambahkan");
      resetForm();
    } catch (error) {
      console.error("Gagal menambahkan kamar:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menambahkan kamar");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100";

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
              Add Kamar
            </h1>
            <p className="text-gray-500 mt-1">
              Tambahkan tipe kamar baru ke cabang hotel tertentu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* INFO KAMAR */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Informasi Kamar
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih hotel, tipe kamar, kapasitas, dan jumlah stok kamar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hotel / Cabang
                  </label>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Hotel size={18} className="text-red-500" />
                    </div>

                    <select
                      name="hotel_id"
                      value={form.hotel_id}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 pl-12 pr-12 py-3.5 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="">
                        {loadingHotels ? "Memuat hotel..." : "Pilih Hotel"}
                      </option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Kamar
                  </label>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <BedDouble size={18} className="text-red-500" />
                    </div>

                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 pl-12 pr-12 py-3.5 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="">Pilih Tipe Kamar</option>
                      <option value="Standard">Standard</option>
                      <option value="Superior">Superior</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Family">Family</option>
                      <option value="Suite">Suite</option>
                    </select>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kapasitas
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="Contoh: 2"
                      className={`${inputClass} pl-12`}
                    />
                    <Users
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Kamar
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="total_rooms"
                      value={form.total_rooms}
                      onChange={handleChange}
                      placeholder="Contoh: 10"
                      className={`${inputClass} pl-12`}
                    />
                    <Boxes
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* HARGA */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Harga Booking
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Isi harga manual untuk transit dan menginap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Per Malam
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_per_night"
                      value={form.price_per_night}
                      onChange={handleChange}
                      placeholder="Contoh: 450000"
                      className={`${inputClass} pl-12`}
                    />
                    <MoonStar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Transit 3 Jam
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_transit_3h"
                      value={form.price_transit_3h}
                      onChange={handleChange}
                      placeholder="Contoh: 150000"
                      className={`${inputClass} pl-12`}
                    />
                    <Clock3
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Transit 6 Jam
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_transit_6h"
                      value={form.price_transit_6h}
                      onChange={handleChange}
                      placeholder="Contoh: 250000"
                      className={`${inputClass} pl-12`}
                    />
                    <Clock6
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Transit 12 Jam
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_transit_12h"
                      value={form.price_transit_12h}
                      onChange={handleChange}
                      placeholder="Contoh: 350000"
                      className={`${inputClass} pl-12`}
                    />
                    <Clock12
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <Wallet size={18} className="text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">
                  Harga dibuat manual supaya tiap cabang dan tipe kamar bisa punya tarif berbeda.
                </p>
              </div>
            </div>

            {/* COVER */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Cover Kamar
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload gambar utama untuk tipe kamar ini.
                </p>
              </div>

              {!coverPreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-gray-50 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Upload size={24} />
                  </div>

                  <h3 className="text-base font-semibold text-gray-800">
                    Upload Cover Kamar
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    PNG, JPG, JPEG. Pilih satu gambar utama untuk cover kamar.
                  </p>

                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                  >
                    <ImageIcon size={18} />
                    Tambah Cover
                  </button>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="max-w-sm">
                  <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={coverPreview}
                        alt="Preview cover kamar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800">
                        Preview Cover Kamar
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Gambar ini akan dipakai sebagai cover utama kamar.
                      </p>

                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                        >
                          <Upload size={16} />
                          Ganti
                        </button>

                        <button
                          type="button"
                          onClick={removeCover}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>

                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GALLERY */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Gallery Kamar
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload banyak gambar tambahan untuk kamar ini.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                  >
                    <Images size={18} />
                    Tambah Gambar
                  </button>

                  {galleryPreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={clearGallery}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-red-600 font-semibold hover:bg-red-100 transition"
                    >
                      <Trash2 size={18} />
                      Hapus Semua
                    </button>
                  )}
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </div>

              {galleryPreviews.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-gray-50 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Images size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Belum ada gambar gallery
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Tambahkan beberapa gambar agar customer bisa melihat detail kamar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {galleryPreviews.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="aspect-[4/3] bg-gray-100">
                        <img
                          src={item.preview}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 truncate">
                          Gambar {index + 1}
                        </h4>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {item.name}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DESKRIPSI */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Deskripsi Kamar
                </h2>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: Kamar deluxe nyaman untuk transit dan menginap."
                className={inputClass}
              />
            </div>

            {/* STATUS + SUBMIT */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={form.status}
                    onChange={handleChange}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Kamar Aktif
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-red-700 disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Kamar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}