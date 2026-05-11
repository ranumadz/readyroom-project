import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  DoorOpen,
  Wifi,
  Car,
  Tv,
  Bath,
  Coffee,
  Dumbbell,
  Waves,
  AirVent,
  UtensilsCrossed,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const facilityIconOptions = [
  { value: "wifi", icon: Wifi },
  { value: "car", icon: Car },
  { value: "tv", icon: Tv },
  { value: "bath", icon: Bath },
  { value: "coffee", icon: Coffee },
  { value: "dumbbell", icon: Dumbbell },
  { value: "waves", icon: Waves },
  { value: "air-vent", icon: AirVent },
  { value: "utensils-crossed", icon: UtensilsCrossed },
  { value: "bed-double", icon: BedDouble },
];

const getFacilityIconComponent = (iconName) => {
  const found = facilityIconOptions.find((item) => item.value === iconName);
  return found ? found.icon : ShieldCheck;
};

const normalizeFacilityScope = (facility) => {
  const raw = String(
    facility?.usage_scope ||
      facility?.scope ||
      facility?.facility_scope ||
      facility?.facility_type ||
      facility?.target ||
      facility?.type_for ||
      facility?.for ||
      facility?.used_for ||
      "hotel"
  ).toLowerCase();

  if (raw.includes("room") || raw.includes("kamar")) return "room";

  return "hotel";
};

export default function AddRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialHotelIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("hotel_id") || "";
  }, [location.search]);

  const backToRoomsUrl = useMemo(() => {
    const currentParams = new URLSearchParams(location.search);
    const hotelId = currentParams.get("hotel_id") || "";
    const returnUrl = currentParams.get("return") || "";

    const nextParams = new URLSearchParams();

    if (hotelId) {
      nextParams.set("hotel_id", hotelId);
    }

    if (returnUrl && returnUrl.startsWith("/admin/hotels")) {
      nextParams.set("return", returnUrl);
    }

    const queryString = nextParams.toString();

    return queryString ? `/admin/rooms?${queryString}` : "/admin/rooms";
  }, [location.search]);

  const [hotels, setHotels] = useState([]);
  const [facilities, setFacilities] = useState([]);

  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    hotel_id: initialHotelIdFromQuery || "",
    type: "",
    capacity: "",
    price_per_night: "",
    price_transit_3h: "",
    price_transit_6h: "",
    price_transit_12h: "",
    total_rooms: "",
    room_numbers: "",
    facility_ids: [],
    description: "",
    thumbnail: null,
    images: [],
    status: true,
  });

  useEffect(() => {
    fetchHotels();
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!initialHotelIdFromQuery) return;

    setForm((prev) => {
      if (String(prev.hotel_id) === String(initialHotelIdFromQuery)) {
        return prev;
      }

      return {
        ...prev,
        hotel_id: initialHotelIdFromQuery,
      };
    });
  }, [initialHotelIdFromQuery]);

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

  const fetchFacilities = async () => {
    try {
      setLoadingFacilities(true);

      const res = await api.get("/admin/facilities");

      const facilityData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.facilities)
        ? res.data.facilities
        : Array.isArray(res.data)
        ? res.data
        : [];

      setFacilities(facilityData);
    } catch (error) {
      console.error("Gagal mengambil data fasilitas kamar:", error);
      toast.error("Gagal mengambil data fasilitas kamar");
    } finally {
      setLoadingFacilities(false);
    }
  };

  const roomFacilities = facilities.filter((facility) => {
    const isActive =
      facility?.status === true ||
      facility?.status === 1 ||
      String(facility?.status) === "1" ||
      String(facility?.status).toLowerCase() === "true";

    return isActive && normalizeFacilityScope(facility) === "room";
  });

  const selectedFacilityCount = form.facility_ids.length;

  const isValidImageFile = (file) => {
    if (!(file instanceof File)) return false;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      toast.error("File gambar harus JPG, JPEG, PNG, atau WEBP");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 4MB");
      return false;
    }

    return true;
  };

  const getBackendErrorMessage = (error) => {
    const message = error.response?.data?.message;

    const errors = error.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstError = errors[firstKey]?.[0];

      if (firstError) return firstError;
    }

    return message || "Gagal menambahkan kamar";
  };

  const parseRoomNumbers = (value) => {
    return String(value || "")
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);
  };

  const roomNumberList = parseRoomNumbers(form.room_numbers);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggleFacility = (facilityId) => {
    setForm((prev) => {
      const id = Number(facilityId);
      const currentIds = prev.facility_ids.map((item) => Number(item));

      const isSelected = currentIds.includes(id);

      return {
        ...prev,
        facility_ids: isSelected
          ? currentIds.filter((item) => item !== id)
          : [...currentIds, id],
      };
    });
  };

  const handleSelectAllFacilities = () => {
    const allIds = roomFacilities.map((facility) => Number(facility.id));

    setForm((prev) => ({
      ...prev,
      facility_ids: allIds,
    }));
  };

  const handleClearFacilities = () => {
    setForm((prev) => ({
      ...prev,
      facility_ids: [],
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!isValidImageFile(file)) {
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
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

    const allValid = selectedFiles.every((file) => isValidImageFile(file));

    if (!allValid) {
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
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
      hotel_id: initialHotelIdFromQuery || "",
      type: "",
      capacity: "",
      price_per_night: "",
      price_transit_3h: "",
      price_transit_6h: "",
      price_transit_12h: "",
      total_rooms: "",
      room_numbers: "",
      facility_ids: [],
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

  const getCreatedRoomId = (responseData) => {
    return (
      responseData?.data?.id ||
      responseData?.room?.id ||
      responseData?.id ||
      responseData?.data?.room?.id ||
      responseData?.data?.data?.id ||
      null
    );
  };

  const createPhysicalRoomUnits = async (roomId, numbers) => {
    if (!roomId || numbers.length === 0) return;

    const results = await Promise.allSettled(
      numbers.map((roomNumber) =>
        api.post("/admin/room-units", {
          room_id: roomId,
          room_number: roomNumber,
          status: true,
        })
      )
    );

    const successCount = results.filter((item) => item.status === "fulfilled").length;
    const failedCount = results.length - successCount;

    if (successCount > 0 && failedCount === 0) {
      toast.success(`${successCount} kamar fisik berhasil ditambahkan`);
      return;
    }

    if (successCount > 0 && failedCount > 0) {
      toast.success(`${successCount} kamar fisik berhasil ditambahkan`);
      toast.error(`${failedCount} kamar fisik gagal ditambahkan`);
      return;
    }

    if (failedCount > 0) {
      toast.error(
        "Tipe kamar berhasil dibuat, tapi kamar fisik gagal dibuat. Cek nomor kamar atau tambahkan dari monitoring."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hotel_id) return toast.error("Pilih hotel terlebih dahulu");
    if (!form.type) return toast.error("Pilih tipe kamar");
    if (!form.capacity) return toast.error("Kapasitas wajib diisi");
    if (!form.total_rooms) return toast.error("Total kamar wajib diisi");
    if (!form.price_per_night) return toast.error("Harga per malam wajib diisi");

    if (roomNumberList.length > Number(form.total_rooms || 0)) {
      return toast.error("Jumlah nomor kamar fisik lebih banyak dari total kamar");
    }

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

      roomNumberList.forEach((roomNumber) => {
        payload.append("room_numbers[]", roomNumber);
      });

      form.facility_ids.forEach((facilityId) => {
        payload.append("facility_ids[]", facilityId);
        payload.append("room_facility_ids[]", facilityId);
        payload.append("facilities[]", facilityId);
      });

      if (form.thumbnail instanceof File) {
        payload.append("thumbnail", form.thumbnail);
      }

      form.images.forEach((file) => {
        if (file instanceof File) {
          payload.append("images[]", file);
        }
      });

      const res = await api.post("/admin/rooms", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdRoomId = getCreatedRoomId(res.data);

      toast.success("Kamar berhasil ditambahkan");

      if (roomNumberList.length > 0) {
        if (createdRoomId) {
          await createPhysicalRoomUnits(createdRoomId, roomNumberList);
        } else {
          toast.error(
            "Kamar berhasil dibuat, tapi ID kamar tidak terbaca untuk membuat kamar fisik otomatis."
          );
        }
      }

      resetForm();
    } catch (error) {
      console.error("Gagal menambahkan kamar:", error.response?.data || error);
      toast.error(getBackendErrorMessage(error));
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
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <button
              type="button"
              onClick={() => navigate(backToRoomsUrl)}
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <ArrowLeft size={18} />
              Kembali ke Rooms List
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Kamar Fisik / Nomor Kamar
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Isi nomor kamar fisik yang akan langsung dibuat untuk monitoring kamar.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Kamar Fisik
                </label>

                <div className="relative">
                  <textarea
                    name="room_numbers"
                    value={form.room_numbers}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Contoh: 101, 102, 103 atau tulis per baris"
                    className={`${inputClass} pl-12 resize-none`}
                  />
                  <DoorOpen
                    size={18}
                    className="absolute left-4 top-4 text-red-500"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-semibold text-blue-800">
                    {roomNumberList.length > 0
                      ? `${roomNumberList.length} nomor kamar siap dibuat`
                      : "Belum ada nomor kamar fisik yang diisi"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-700">
                    Pisahkan nomor kamar dengan koma atau enter. Contoh: 101, 102, 201, A01.
                  </p>
                </div>

                {roomNumberList.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {roomNumberList.map((number) => (
                      <span
                        key={number}
                        className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                      >
                        Kamar {number}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Fasilitas Kamar
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pilih fasilitas yang tersedia khusus untuk tipe kamar ini.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {roomFacilities.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleSelectAllFacilities}
                        className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Pilih Semua
                      </button>

                      <button
                        type="button"
                        onClick={handleClearFacilities}
                        className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
                      >
                        Bersihkan
                      </button>
                    </>
                  )}

                  <span className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
                    {selectedFacilityCount} dipilih
                  </span>
                </div>
              </div>

              {loadingFacilities ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
                  <p className="text-sm font-bold text-gray-700">
                    Memuat fasilitas kamar...
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Mohon tunggu sebentar.
                  </p>
                </div>
              ) : roomFacilities.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                    <ShieldCheck size={24} />
                  </div>

                  <p className="text-base font-bold text-gray-800">
                    Belum ada fasilitas kamar
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Tambahkan fasilitas dengan kategori Kamar dari halaman Facilities terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {roomFacilities.map((facility) => {
                    const FacilityIcon = getFacilityIconComponent(facility.icon);
                    const isSelected = form.facility_ids
                      .map((item) => Number(item))
                      .includes(Number(facility.id));

                    return (
                      <button
                        key={facility.id}
                        type="button"
                        onClick={() => handleToggleFacility(facility.id)}
                        className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-red-200 bg-red-50 shadow-sm"
                            : "border-gray-200 bg-gray-50 hover:border-red-100 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                              isSelected
                                ? "bg-red-600 text-white"
                                : "bg-white text-red-600"
                            }`}
                          >
                            <FacilityIcon size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-black text-gray-900">
                              {facility.name}
                            </p>
                            <p className="text-xs font-semibold text-gray-400">
                              Icon: {facility.icon || "-"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-gray-200 bg-white text-transparent"
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
                    PNG, JPG, JPEG, WEBP. Maksimal 4MB.
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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
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
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  accept="image/jpeg,image/jpg,image/png,image/webp"
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
