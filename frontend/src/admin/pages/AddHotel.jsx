import { useEffect, useMemo, useState } from "react";
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
  Plus,
  X,
  Images,
  Sparkles,
  Upload,
} from "lucide-react";

export default function AddHotel() {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [showCityModal, setShowCityModal] = useState(false);
  const [savingCity, setSavingCity] = useState(false);
  const [newCityName, setNewCityName] = useState("");

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
    gallery_images: [],
    facility_ids: [],
    status: true,
  });

  const [preview, setPreview] = useState({
    thumbnail: null,
    hero_image: null,
    gallery_images: [],
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    return () => {
      if (preview.thumbnail) URL.revokeObjectURL(preview.thumbnail);
      if (preview.hero_image) URL.revokeObjectURL(preview.hero_image);
      if (preview.gallery_images?.length) {
        preview.gallery_images.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [preview]);

  const selectedFacilitiesCount = useMemo(
    () => form.facility_ids.length,
    [form.facility_ids]
  );

  const fetchFormData = async (selectedCityId = null) => {
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

      if (selectedCityId) {
        setForm((prev) => ({
          ...prev,
          city_id: String(selectedCityId),
        }));
      }
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
    const { name, value, type, checked, files, multiple } = e.target;

    if (type === "file") {
      if (multiple) {
        const selectedFiles = Array.from(files || []);

        setForm((prev) => ({
          ...prev,
          [name]: selectedFiles,
        }));

        if (preview.gallery_images?.length) {
          preview.gallery_images.forEach((url) => URL.revokeObjectURL(url));
        }

        setPreview((prev) => ({
          ...prev,
          [name]: selectedFiles.map((file) => URL.createObjectURL(file)),
        }));

        return;
      }

      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (preview[name]) {
        URL.revokeObjectURL(preview[name]);
      }

      if (file) {
        const objectUrl = URL.createObjectURL(file);

        setPreview((prev) => ({
          ...prev,
          [name]: objectUrl,
        }));
      } else {
        setPreview((prev) => ({
          ...prev,
          [name]: null,
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

  const removeGalleryImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== indexToRemove),
    }));

    setPreview((prev) => {
      const removedUrl = prev.gallery_images[indexToRemove];
      if (removedUrl) URL.revokeObjectURL(removedUrl);

      return {
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== indexToRemove),
      };
    });
  };

  const handleSaveCity = async () => {
    const cityName = newCityName.trim();

    if (!cityName) {
      return Swal.fire({
        icon: "warning",
        title: "Nama kota wajib diisi",
        text: "Masukkan nama kota baru terlebih dahulu",
        confirmButtonColor: "#dc2626",
      });
    }

    try {
      setSavingCity(true);

      const res = await api.post("/admin/cities", {
        name: cityName,
        status: true,
      });

      const createdCityId = res.data?.data?.id;

      await fetchFormData(createdCityId);

      setNewCityName("");
      setShowCityModal(false);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kota baru berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("ADD CITY ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Kota baru gagal ditambahkan",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSavingCity(false);
    }
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

      if (form.gallery_images.length > 0) {
        form.gallery_images.forEach((image) => {
          payload.append("gallery_images[]", image);
        });
      }

      await api.post("/admin/hotels", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Hotel berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
      });

      if (preview.thumbnail) URL.revokeObjectURL(preview.thumbnail);
      if (preview.hero_image) URL.revokeObjectURL(preview.hero_image);
      if (preview.gallery_images?.length) {
        preview.gallery_images.forEach((url) => URL.revokeObjectURL(url));
      }

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
        gallery_images: [],
        facility_ids: [],
        status: true,
      });

      setPreview({
        thumbnail: null,
        hero_image: null,
        gallery_images: [],
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/40">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <Sparkles size={16} />
                Admin Panel
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Add Hotel
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                Tambahkan cabang hotel baru ke sistem ReadyRoom dengan informasi utama,
                fasilitas, thumbnail, hero image, dan gallery hotel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/hotels")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <List size={18} />
              Hotels List
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-white px-6 py-5 md:px-8">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Informasi Hotel
                        </h2>
                        <p className="text-sm text-gray-500">
                          Isi data utama hotel atau cabang baru
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-6 md:p-8">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Kota
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowCityModal(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <Plus size={16} />
                          Tambah Kota Baru
                        </button>
                      </div>

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
                        Pilih kota tempat cabang hotel berada.
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          Nomor resmi admin cabang hotel
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
                            placeholder="https://maps.app.goo.gl/xxxxx"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          />
                          <LinkIcon
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                          Paste link Google Maps hotel
                        </p>
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
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-white px-6 py-5 md:px-8">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                        <CheckSquare size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Fasilitas Hotel
                        </h2>
                        <p className="text-sm text-gray-500">
                          Pilih fasilitas yang tersedia di cabang ini
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                        Total dipilih: {selectedFacilitiesCount}
                      </div>
                      <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                        ReadyRoom Hotel Features
                      </div>
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
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-white px-6 py-5 md:px-8">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                        <Images size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Media Hotel
                        </h2>
                        <p className="text-sm text-gray-500">
                          Thumbnail, hero image, dan gallery hotel
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Thumbnail Hotel
                        </label>

                        <label className="group flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white transition hover:border-red-400 hover:bg-red-50/40">
                          {preview.thumbnail ? (
                            <img
                              src={preview.thumbnail}
                              alt="Preview Thumbnail"
                              className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                              <ImageIcon size={30} className="mb-3 text-red-500" />
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

                        <label className="group flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white transition hover:border-red-400 hover:bg-red-50/40">
                          {preview.hero_image ? (
                            <img
                              src={preview.hero_image}
                              alt="Preview Hero"
                              className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                              <ImageIcon size={30} className="mb-3 text-red-500" />
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
                        Gallery Hotel
                      </label>

                      <label className="group flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-gradient-to-br from-red-50 via-white to-white px-6 py-8 text-center transition hover:border-red-400 hover:shadow-sm">
                        <div className="mb-4 rounded-2xl bg-red-100 p-4 text-red-600">
                          <Upload size={28} />
                        </div>
                        <p className="text-base font-bold text-gray-800">
                          Upload Banyak Gambar Hotel
                        </p>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                          Gunakan gallery ini untuk foto lobby, kamar umum, lorong,
                          parkiran, area depan, dan suasana hotel.
                        </p>
                        <p className="mt-2 text-xs font-medium text-red-500">
                          Bisa pilih lebih dari satu gambar sekaligus
                        </p>

                        <input
                          type="file"
                          name="gallery_images"
                          accept="image/*"
                          multiple
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>

                      {preview.gallery_images.length > 0 && (
                        <div className="mt-5">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-700">
                              Preview Gallery ({preview.gallery_images.length})
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                            {preview.gallery_images.map((img, index) => (
                              <div
                                key={`${img}-${index}`}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                              >
                                <img
                                  src={img}
                                  alt={`Gallery Preview ${index + 1}`}
                                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                                >
                                  <X size={16} />
                                </button>

                                <div className="px-3 py-2">
                                  <p className="truncate text-xs font-medium text-gray-600">
                                    {form.gallery_images[index]?.name || `Image ${index + 1}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="sticky top-24 overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-white">
                    <h2 className="text-lg font-bold">Ringkasan Input</h2>
                    <p className="mt-1 text-sm text-red-50">
                      Cek dulu sebelum simpan hotel
                    </p>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Nama Hotel
                      </p>
                      <p className="mt-2 font-semibold text-gray-800">
                        {form.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Kota
                      </p>
                      <p className="mt-2 font-semibold text-gray-800">
                        {cities.find((city) => String(city.id) === String(form.city_id))?.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Area
                      </p>
                      <p className="mt-2 font-semibold text-gray-800">
                        {form.area || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Media
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <p>Thumbnail: {form.thumbnail ? "Sudah dipilih" : "Belum"}</p>
                        <p>Hero Image: {form.hero_image ? "Sudah dipilih" : "Belum"}</p>
                        <p>Gallery: {form.gallery_images.length} gambar</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Fasilitas
                      </p>
                      <p className="mt-2 font-semibold text-gray-800">
                        {selectedFacilitiesCount} dipilih
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </p>
                      <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm">
                        {form.status ? "Hotel Aktif" : "Hotel Nonaktif"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        Catatan
                      </p>
                      <p className="mt-2 text-sm leading-6 text-red-600">
                        Thumbnail dan hero image tetap dipakai. Gallery hotel dipakai
                        untuk banyak foto di halaman detail hotel.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
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
                          Hotel Aktif
                        </label>
                      </div>

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
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Save size={18} />
                        {saving ? "Menyimpan..." : "Simpan Hotel"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showCityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Tambah Kota Baru</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan kota baru agar bisa langsung dipilih di form hotel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCityModal(false);
                  setNewCityName("");
                }}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Kota
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Contoh: Surabaya"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
                <MapPin
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowCityModal(false);
                  setNewCityName("");
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveCity}
                disabled={savingCity}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                <Plus size={18} />
                {savingCity ? "Menyimpan..." : "Simpan Kota"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}