import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Swal from "sweetalert2";
import {
  Building2,
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
  CheckSquare,
  Images,
  Upload,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function HotelsList() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [hotelStatusFilter, setHotelStatusFilter] = useState("all");

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
    gallery_images: [],
    remove_gallery_image_ids: [],
    facility_ids: [],
    status: true,
  });

  const [preview, setPreview] = useState({
    thumbnail: null,
    hero_image: null,
  });

  const [existingGalleryPreviews, setExistingGalleryPreviews] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [draggedExistingIndex, setDraggedExistingIndex] = useState(null);
  const [draggedNewIndex, setDraggedNewIndex] = useState(null);

  const backendOrigin = useMemo(() => {
    const candidates = [
      import.meta.env.VITE_BACKEND_URL,
      api?.defaults?.baseURL,
      import.meta.env.VITE_API_URL,
    ];

    const absoluteUrl = candidates.find((item) =>
      /^https?:\/\//i.test(String(item || ""))
    );

    if (absoluteUrl) {
      return String(absoluteUrl)
        .replace(/\/api\/?$/i, "")
        .replace(/\/$/, "");
    }

    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return "http://127.0.0.1:8000";
    }

    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return "http://127.0.0.1:8000";
  }, []);

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
    } finally {
      setLoadingCities(false);
      setLoadingFacilities(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchFormData();
  }, []);

  const buildImageUrl = (path, fallback = "/images/hotel.jpg") => {
    if (!path) return fallback;

    const rawPath = String(path).trim();

    if (!rawPath) return fallback;

    if (
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("blob:")
    ) {
      return rawPath;
    }

    const cleanPath = rawPath.replace(/^\/+/, "");

    if (cleanPath.startsWith("storage/")) {
      return `${backendOrigin}/${cleanPath}`;
    }

    if (cleanPath.startsWith("hotels/")) {
      return `${backendOrigin}/storage/${cleanPath}`;
    }

    if (cleanPath.startsWith("images/")) {
      return `/${cleanPath}`;
    }

    return `${backendOrigin}/storage/${cleanPath}`;
  };

  const handleImageError = (e, fallback = "/images/hotel.jpg") => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
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

  const hotelFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const active =
        facility?.status === true ||
        facility?.status === 1 ||
        String(facility?.status) === "1" ||
        String(facility?.status).toLowerCase() === "true";

      return active && normalizeFacilityScope(facility) === "hotel";
    });
  }, [facilities]);

  const getGalleryImagePath = (image) => {
    if (!image) return "";

    if (typeof image === "string") return image;

    return (
      image.image ||
      image.image_path ||
      image.path ||
      image.url ||
      image.gallery_image ||
      image.file_path ||
      image.photo ||
      image.src ||
      ""
    );
  };

  const getGallerySortOrder = (image, fallbackIndex) => {
    if (!image || typeof image !== "object") return fallbackIndex;

    const value =
      image.sort_order ??
      image.order ??
      image.position ??
      image.sequence ??
      fallbackIndex;

    const numeric = Number(value);

    return Number.isFinite(numeric) ? numeric : fallbackIndex;
  };

  const normalizeGalleryImages = (hotel) => {
    const gallerySource = Array.isArray(hotel?.images)
      ? hotel.images
      : Array.isArray(hotel?.gallery_images)
      ? hotel.gallery_images
      : Array.isArray(hotel?.hotel_images)
      ? hotel.hotel_images
      : Array.isArray(hotel?.galleries)
      ? hotel.galleries
      : Array.isArray(hotel?.gallery)
      ? hotel.gallery
      : [];

    return [...gallerySource]
      .sort((a, b) => {
        const orderA = getGallerySortOrder(a, 0);
        const orderB = getGallerySortOrder(b, 0);

        if (orderA === orderB) return 0;

        return orderA - orderB;
      })
      .map((image, index) => {
        const path = getGalleryImagePath(image);

        if (!path) return null;

        return {
          id: typeof image === "object" ? image.id || null : null,
          tempKey: `${path}-${index}`,
          path,
          url: buildImageUrl(path),
          sort_order: getGallerySortOrder(image, index + 1),
        };
      })
      .filter(Boolean);
  };

  const moveArrayItem = (array, fromIndex, toIndex) => {
    if (!Array.isArray(array)) return [];
    if (fromIndex === toIndex) return array;
    if (fromIndex < 0 || toIndex < 0) return array;
    if (fromIndex >= array.length || toIndex >= array.length) return array;

    const next = [...array];
    const [movedItem] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, movedItem);

    return next;
  };

  const moveExistingGalleryImage = (fromIndex, toIndex) => {
    setExistingGalleryPreviews((prev) =>
      moveArrayItem(prev, fromIndex, toIndex)
    );
  };

  const moveNewGalleryImage = (fromIndex, toIndex) => {
    setNewGalleryPreviews((prev) => {
      const nextPreviews = moveArrayItem(prev, fromIndex, toIndex);

      setEditForm((current) => ({
        ...current,
        gallery_images: nextPreviews.map((item) => item.file).filter(Boolean),
      }));

      return nextPreviews;
    });
  };

  const handleExistingGalleryDrop = (dropIndex) => {
    if (draggedExistingIndex === null || draggedExistingIndex === undefined) {
      return;
    }

    moveExistingGalleryImage(draggedExistingIndex, dropIndex);
    setDraggedExistingIndex(null);
  };

  const handleNewGalleryDrop = (dropIndex) => {
    if (draggedNewIndex === null || draggedNewIndex === undefined) {
      return;
    }

    moveNewGalleryImage(draggedNewIndex, dropIndex);
    setDraggedNewIndex(null);
  };

  const resetEditState = () => {
    newGalleryPreviews.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

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
      gallery_images: [],
      remove_gallery_image_ids: [],
      facility_ids: [],
      status: true,
    });

    setPreview({
      thumbnail: null,
      hero_image: null,
    });

    setExistingGalleryPreviews([]);
    setNewGalleryPreviews([]);
    setDraggedExistingIndex(null);
    setDraggedNewIndex(null);
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
      gallery_images: [],
      remove_gallery_image_ids: [],
      facility_ids: Array.isArray(hotel.facilities)
        ? hotel.facilities.map((item) => item.id)
        : [],
      status: Boolean(hotel.status),
    });

    setPreview({
      thumbnail: hotel.thumbnail ? buildImageUrl(hotel.thumbnail) : null,
      hero_image: hotel.hero_image
        ? buildImageUrl(hotel.hero_image, "/images/hero.jpg")
        : null,
    });

    setExistingGalleryPreviews(normalizeGalleryImages(hotel));
    setNewGalleryPreviews([]);
    setDraggedExistingIndex(null);
    setDraggedNewIndex(null);
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

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) =>
      String(file.type || "").startsWith("image/")
    );

    if (imageFiles.length !== files.length) {
      Swal.fire({
        icon: "warning",
        title: "File tidak valid",
        text: "Gallery hotel hanya boleh berisi file gambar.",
        confirmButtonColor: "#dc2626",
      });
    }

    if (imageFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const previews = imageFiles.map((file) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setEditForm((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, ...imageFiles],
    }));

    setNewGalleryPreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
  };

  const removeExistingGalleryImage = (galleryItem) => {
    if (!galleryItem) return;

    if (galleryItem.id) {
      setEditForm((prev) => ({
        ...prev,
        remove_gallery_image_ids: [
          ...prev.remove_gallery_image_ids,
          galleryItem.id,
        ].filter((value, index, array) => array.indexOf(value) === index),
      }));
    }

    setExistingGalleryPreviews((prev) =>
      prev.filter((item) => {
        if (galleryItem.id) return item.id !== galleryItem.id;
        return item.tempKey !== galleryItem.tempKey;
      })
    );
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryPreviews((prev) => {
      const removed = prev[index];

      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      const nextPreviews = prev.filter((_, itemIndex) => itemIndex !== index);

      setEditForm((current) => ({
        ...current,
        gallery_images: nextPreviews.map((item) => item.file).filter(Boolean),
      }));

      return nextPreviews;
    });
  };

  const clearNewGalleryImages = () => {
    newGalleryPreviews.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    setNewGalleryPreviews([]);

    setEditForm((prev) => ({
      ...prev,
      gallery_images: [],
    }));
  };

  const handleFacilityToggle = (facilityId) => {
    setEditForm((prev) => {
      const exists = prev.facility_ids.includes(facilityId);

      return {
        ...prev,
        facility_ids: exists
          ? prev.facility_ids.filter((id) => id !== facilityId)
          : [...prev.facility_ids, facilityId],
      };
    });
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

      const facilityIds = Array.isArray(hotel.facilities)
        ? hotel.facilities.map((item) => item.id)
        : [];

      facilityIds.forEach((facilityId, index) => {
        payload.append(`facility_ids[${index}]`, facilityId);
      });

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

  const appendGalleryOrderPayload = (payload) => {
    existingGalleryPreviews.forEach((item, index) => {
      if (!item?.id) return;

      payload.append(`gallery_order[${index}]`, item.id);
      payload.append(`existing_gallery_order[${index}]`, item.id);
      payload.append(`gallery_image_order[${index}][id]`, item.id);
      payload.append(`gallery_image_order[${index}][sort_order]`, index + 1);
    });
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();

    if (!selectedHotel) return;

    if (!editForm.city_id || !editForm.name.trim() || !editForm.address.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Kota, nama hotel, dan alamat wajib diisi",
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

    if (
      editForm.map_link &&
      !/^https?:\/\/(www\.)?(google\.[^\/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com)/i.test(
        editForm.map_link.trim()
      )
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Link Google Maps belum valid",
        text: "Buka Google Maps, cari nama cabang hotelnya, klik Share, lalu paste link tempat tersebut.",
        confirmButtonColor: "#dc2626",
      });
    }

    try {
      setSavingEdit(true);

      const payload = new FormData();

      payload.append("_method", "PUT");
      payload.append("city_id", editForm.city_id);
      payload.append("name", editForm.name);
      payload.append("area", editForm.area || selectedHotel?.area || "");
      payload.append("address", editForm.address);
      payload.append("wa_admin", editForm.wa_admin || "");
      payload.append("map_link", editForm.map_link || "");
      payload.append("description", editForm.description || "");
      payload.append("status", editForm.status ? 1 : 0);

      editForm.facility_ids.forEach((facilityId, index) => {
        payload.append(`facility_ids[${index}]`, facilityId);
      });

      if (editForm.thumbnail) {
        payload.append("thumbnail", editForm.thumbnail);
      }

      if (editForm.hero_image) {
        payload.append("hero_image", editForm.hero_image);
      }

      editForm.gallery_images.forEach((file, index) => {
        payload.append(`gallery_images[${index}]`, file);
      });

      editForm.remove_gallery_image_ids.forEach((imageId, index) => {
        payload.append(`remove_gallery_image_ids[${index}]`, imageId);
      });

      appendGalleryOrderPayload(payload);

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
          err.response?.data?.errors?.address?.[0] ||
          err.response?.data?.errors?.gallery_images?.[0] ||
          err.response?.data?.errors?.["gallery_images.0"]?.[0] ||
          err.response?.data?.errors?.remove_gallery_image_ids?.[0] ||
          err.response?.data?.errors?.gallery_order?.[0] ||
          err.response?.data?.errors?.gallery_image_order?.[0] ||
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

  const selectedHotelData = useMemo(() => {
    if (!selectedHotelId) return null;

    return hotels.find((hotel) => String(hotel.id) === String(selectedHotelId)) || null;
  }, [hotels, selectedHotelId]);

  const hotelStats = useMemo(() => {
    const active = hotels.filter((hotel) => Boolean(hotel.status)).length;
    const inactive = hotels.length - active;

    return {
      total: hotels.length,
      active,
      inactive,
    };
  }, [hotels]);

  const displayedHotels = useMemo(() => {
    if (!selectedHotelId) return [];

    const keyword = hotelSearch.trim().toLowerCase();

    return hotels
      .filter((hotel) => String(hotel.id) === String(selectedHotelId))
      .filter((hotel) => {
        if (hotelStatusFilter === "active") return Boolean(hotel.status);
        if (hotelStatusFilter === "inactive") return !Boolean(hotel.status);
        return true;
      })
      .filter((hotel) => {
        if (!keyword) return true;

        const cityName = hotel.city?.name || hotel.city_name || "";

        return [hotel.name, cityName, hotel.address, hotel.area, hotel.wa_admin]
          .map((item) => String(item || "").toLowerCase())
          .some((item) => item.includes(keyword));
      });
  }, [hotels, selectedHotelId, hotelSearch, hotelStatusFilter]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

        <div className="p-4 md:p-6">
          <div className="mb-4 overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 px-5 py-4 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-red-300" />
                  <h2 className="text-base font-black">Filter Hotel</h2>
                </div>
                <p className="mt-1 text-xs text-white/75">
                  Pilih cabang terlebih dahulu. Sistem akan menampilkan data hotel sesuai cabang yang dipilih.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/10">
                  {selectedHotelData ? selectedHotelData.name : "Belum pilih cabang"}
                </span>

                <button
                  type="button"
                  onClick={() => navigate("/admin/hotels/add")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                >
                  <Plus size={17} />
                  Add Hotel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12 md:p-5">
              <div className="md:col-span-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Cabang / Hotel
                </label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                >
                  <option value="">Pilih Cabang / Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Cari Hotel / Kota / Alamat
                </label>
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    placeholder="Cari nama hotel, kota, alamat..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Filter Status
                </label>
                <select
                  value={hotelStatusFilter}
                  onChange={(e) => setHotelStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 pb-4 md:px-5">
              <StatusPill color="bg-red-500" label={`Total Hotel: ${hotelStats.total}`} />
              <StatusPill color="bg-emerald-500" label={`Aktif: ${hotelStats.active}`} />
              <StatusPill color="bg-slate-400" label={`Nonaktif: ${hotelStats.inactive}`} />
            </div>
          </div>

          <div className="min-h-[360px] rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center text-gray-500">
                Memuat data hotel...
              </div>
            ) : hotels.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-7 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Building2 size={26} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    Belum ada data hotel
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Tambahkan cabang hotel pertama untuk mulai mengelola kamar dan booking.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/hotels/add")}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    <Plus size={18} />
                    Add Hotel
                  </button>
                </div>
              </div>
            ) : !selectedHotelId ? (
              <div className="flex min-h-[300px] items-center justify-center bg-gradient-to-br from-red-50/40 via-white to-slate-50">
                <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white/90 px-8 py-7 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Building2 size={26} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    Pilih cabang terlebih dahulu
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Setelah cabang dipilih, data hotel akan tampil di tabel ini.
                  </p>
                </div>
              </div>
            ) : displayedHotels.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-7 text-center">
                  <h3 className="text-lg font-black text-gray-900">
                    Data tidak ditemukan
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Coba ubah kata kunci pencarian atau filter status.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        #
                      </th>
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        Hotel
                      </th>
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        Kota
                      </th>
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        Alamat
                      </th>
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-2 py-4 text-sm font-semibold text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedHotels.map((hotel, index) => (
                      <tr
                        key={hotel.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-2 py-4 text-gray-500">{index + 1}</td>

                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {hotel.name}
                              </p>
                              <p className="text-xs text-gray-400">ID: {hotel.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-gray-700">
                          {hotel.city?.name || hotel.city_name || "-"}
                        </td>

                        <td className="max-w-[360px] px-2 py-4 text-gray-600">
                          <p className="truncate">{hotel.address || "-"}</p>
                        </td>

                        <td className="px-2 py-4">
                          <button
                            type="button"
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

                        <td className="px-2 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/rooms?hotel_id=${hotel.id}`, {
                                  state: { hotelId: hotel.id, hotelName: hotel.name },
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-100"
                            >
                              <BedDouble size={16} />
                              Manage Kamar
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(hotel)}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(hotel)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
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
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update data hotel tanpa pindah halaman
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
              <form onSubmit={handleUpdateHotel} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Kota
                    </label>

                    <div className="relative">
                      <select
                        name="city_id"
                        value={editForm.city_id}
                        onChange={handleEditChange}
                        className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-4 pr-12 text-gray-700 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
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
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Nama Hotel / Cabang
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Contoh: ReadyRoom Gancit"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Alamat
                  </label>

                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows={3}
                    placeholder="Masukkan alamat lengkap hotel"
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Link Google Maps Tempat Hotel
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="map_link"
                      value={editForm.map_link}
                      onChange={handleEditChange}
                      placeholder="Cari nama hotel di Maps → Share → Copy link"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-11 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    <LinkIcon
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
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
                      <p className="text-sm text-gray-500">
                        Memuat fasilitas...
                      </p>
                    ) : hotelFacilities.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Belum ada fasilitas hotel aktif di sistem
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {hotelFacilities.map((facility) => {
                          const selected = editForm.facility_ids.includes(
                            facility.id
                          );

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
                                onChange={() =>
                                  handleFacilityToggle(facility.id)
                                }
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
                      Fasilitas yang dipilih akan ikut tersimpan saat hotel
                      diupdate.
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
                      value={editForm.description}
                      onChange={handleEditChange}
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
                          onError={(e) => handleImageError(e)}
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
                        onChange={handleEditChange}
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
                          onError={(e) => handleImageError(e)}
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
                        onChange={handleEditChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Gallery Hotel
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Atur urutan foto dengan tombol panah atau drag foto.
                        Urutan paling kiri akan tampil lebih dulu di customer.
                      </p>
                    </div>

                    {newGalleryPreviews.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNewGalleryImages}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Hapus Upload Baru
                      </button>
                    )}
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                    {existingGalleryPreviews.length > 0 && (
                      <div className="mb-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Images size={18} className="text-red-500" />
                          <p className="text-sm font-bold text-gray-800">
                            Gallery yang sudah tersimpan
                          </p>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                            {existingGalleryPreviews.length} foto
                          </span>
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            Bisa diurutkan
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {existingGalleryPreviews.map((item, index) => (
                            <div
                              key={item.id || item.tempKey || index}
                              draggable
                              onDragStart={() => setDraggedExistingIndex(index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleExistingGalleryDrop(index)}
                              onDragEnd={() => setDraggedExistingIndex(null)}
                              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                                draggedExistingIndex === index
                                  ? "border-red-300 opacity-60"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={item.url}
                                  alt={`Gallery hotel ${index + 1}`}
                                  onError={(e) => handleImageError(e)}
                                  className="h-28 w-full object-cover"
                                />

                                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-black text-white shadow">
                                  <GripVertical size={12} />
                                  {index + 1}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeExistingGalleryImage(item)}
                                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-red-700"
                                >
                                  <Trash2 size={13} />
                                  Hapus
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveExistingGalleryImage(index, index - 1)
                                  }
                                  disabled={index === 0}
                                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <ArrowLeft size={14} />
                                  Kiri
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveExistingGalleryImage(index, index + 1)
                                  }
                                  disabled={
                                    index === existingGalleryPreviews.length - 1
                                  }
                                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Kanan
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                          Foto yang dihapus dan urutan foto baru tersimpan
                          setelah klik Simpan Perubahan.
                        </p>
                      </div>
                    )}

                    <label className="flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-red-50/40 px-5 py-8 text-center transition hover:border-red-400 hover:bg-red-50">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                        <Upload size={24} />
                      </div>

                      <p className="font-bold text-gray-800">
                        Upload Tambahan Gallery Hotel
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Bisa pilih lebih dari satu gambar sekaligus.
                      </p>
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        JPG, PNG, WEBP
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </label>

                    {newGalleryPreviews.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Images size={18} className="text-red-500" />
                          <p className="text-sm font-bold text-gray-800">
                            Foto baru yang akan ditambahkan
                          </p>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                            {newGalleryPreviews.length} foto
                          </span>
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            Bisa diurutkan
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {newGalleryPreviews.map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              draggable
                              onDragStart={() => setDraggedNewIndex(index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleNewGalleryDrop(index)}
                              onDragEnd={() => setDraggedNewIndex(null)}
                              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                                draggedNewIndex === index
                                  ? "border-red-300 opacity-60"
                                  : "border-red-100"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={item.preview}
                                  alt={`Preview gallery baru ${index + 1}`}
                                  className="h-28 w-full object-cover"
                                />

                                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-black text-white shadow">
                                  <GripVertical size={12} />
                                  {index + 1}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeNewGalleryImage(index)}
                                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-red-50"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="px-3 py-2">
                                <p className="truncate text-xs font-semibold text-gray-600">
                                  {item.name}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveNewGalleryImage(index, index - 1)
                                  }
                                  disabled={index === 0}
                                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <ArrowLeft size={14} />
                                  Kiri
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveNewGalleryImage(index, index + 1)
                                  }
                                  disabled={
                                    index === newGalleryPreviews.length - 1
                                  }
                                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Kanan
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {existingGalleryPreviews.length === 0 &&
                      newGalleryPreviews.length === 0 && (
                        <p className="mt-4 text-center text-xs text-gray-400">
                          Belum ada gallery hotel yang tampil di modal edit ini.
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    type="checkbox"
                    id="edit_status"
                    name="status"
                    checked={editForm.status}
                    onChange={handleEditChange}
                    className="h-4 w-4 accent-red-600"
                  />
                  <label
                    htmlFor="edit_status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hotel Aktif
                  </label>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <X size={18} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-70"
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

function StatusPill({ color, label }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
