import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState(() => {
    if (typeof window === "undefined") return "all";

    const params = new URLSearchParams(window.location.search);
    return params.get("hotel_id") || "all";
  });
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    hotel_id: "",
    type: "",
    capacity: "",
    price_per_night: "",
    price_3h: "",
    price_6h: "",
    price_12h: "",
    total_rooms: "",
    status: 1,
    room_facility_ids: [],
  });

  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState("");
  const [editGalleryFiles, setEditGalleryFiles] = useState([]);
  const [editGalleryPreviews, setEditGalleryPreviews] = useState([]);
  const [editCurrentGalleryItems, setEditCurrentGalleryItems] = useState([]);
  const [deletedGalleryImageIds, setDeletedGalleryImageIds] = useState([]);
  const [draggedCurrentGalleryIndex, setDraggedCurrentGalleryIndex] = useState(null);
  const [draggedNewGalleryIndex, setDraggedNewGalleryIndex] = useState(null);

  const [editRoomUnits, setEditRoomUnits] = useState([]);
  const [loadingEditRoomUnits, setLoadingEditRoomUnits] = useState(false);
  const [newRoomUnitNumbers, setNewRoomUnitNumbers] = useState("");
  const [savingRoomUnits, setSavingRoomUnits] = useState(false);
  const [updatingRoomUnitId, setUpdatingRoomUnitId] = useState(null);
  const [deletingRoomUnitId, setDeletingRoomUnitId] = useState(null);
  const [roomUnitActionMode, setRoomUnitActionMode] = useState(null);
  const [selectedRoomUnitIds, setSelectedRoomUnitIds] = useState([]);
  const [bulkRoomUnitProcessing, setBulkRoomUnitProcessing] = useState(false);

  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingRoomId, setTogglingRoomId] = useState(null);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const backToHotelsUrl = useMemo(() => {
    if (typeof window === "undefined") return "/admin/hotels";

    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get("return");

    if (returnUrl && returnUrl.startsWith("/admin/hotels")) {
      return returnUrl;
    }

    return "/admin/hotels";
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchHotels();
    fetchFacilities();
  }, []);

  const normalizeArrayResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    if (Array.isArray(payload?.hotels)) return payload.hotels;
    if (Array.isArray(payload?.facilities)) return payload.facilities;
    if (Array.isArray(payload?.room_units)) return payload.room_units;
    if (Array.isArray(payload?.units)) return payload.units;
    return [];
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get("/admin/rooms");
      setRooms(normalizeArrayResponse(response.data));
    } catch (error) {
      console.error("Gagal mengambil data room:", error);
      toast.error("Gagal mengambil data room");
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await api.get("/admin/hotels");
      setHotels(normalizeArrayResponse(response.data));
    } catch (error) {
      console.warn("Data hotel untuk modal edit belum bisa diambil:", error);
    }
  };

  const fetchFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const response = await api.get("/admin/facilities");
      setFacilities(normalizeArrayResponse(response.data));
    } catch (error) {
      console.warn("Data fasilitas kamar belum bisa diambil:", error);
      setFacilities([]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const fetchEditRoomUnits = async (roomId) => {
    if (!roomId) return;

    try {
      setLoadingEditRoomUnits(true);

      const response = await api.get(`/admin/room-units/${roomId}`);
      const unitData = normalizeArrayResponse(response.data);

      setEditRoomUnits(unitData);

      if (unitData.length > 0) {
        setEditForm((prev) => ({
          ...prev,
          total_rooms: String(unitData.length),
        }));
      }
    } catch (error) {
      console.error("Gagal mengambil room unit:", error.response?.data || error);
      setEditRoomUnits([]);
      toast.error("Gagal mengambil nomor kamar fisik");
    } finally {
      setLoadingEditRoomUnits(false);
    }
  };

  const isRoomActive = (room) => {
    return (
      room?.status === true ||
      room?.status === 1 ||
      room?.status === "1" ||
      String(room?.status || "").toLowerCase() === "active"
    );
  };

  const isFacilityActive = (facility) => {
    return (
      facility?.status === true ||
      facility?.status === 1 ||
      facility?.status === "1" ||
      String(facility?.status || "").toLowerCase() === "true" ||
      String(facility?.status || "").toLowerCase() === "active"
    );
  };

  const isRoomUnitActive = (unit) => {
    return (
      unit?.status === true ||
      unit?.status === 1 ||
      unit?.status === "1" ||
      String(unit?.status || "").toLowerCase() === "true" ||
      String(unit?.status || "").toLowerCase() === "active" ||
      String(unit?.status || "").toLowerCase() === "available"
    );
  };

  const getRoomUnitNumber = (unit) => {
    return (
      unit?.room_number ||
      unit?.number ||
      unit?.unit_number ||
      unit?.name ||
      ""
    );
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
        "room"
    ).toLowerCase();

    if (raw.includes("hotel")) return "hotel";
    if (raw.includes("room") || raw.includes("kamar")) return "room";
    if (raw.includes("both") || raw.includes("all") || raw.includes("semua")) {
      return "room";
    }

    return "room";
  };

  const roomFacilityOptions = useMemo(() => {
    return facilities
      .filter((facility) => {
        return (
          isFacilityActive(facility) && normalizeFacilityScope(facility) === "room"
        );
      })
      .sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      );
  }, [facilities]);

  const getRoomFacilitySource = (room) => {
    if (Array.isArray(room?.room_facilities)) return room.room_facilities;
    if (Array.isArray(room?.roomFacilities)) return room.roomFacilities;
    if (Array.isArray(room?.facilities)) return room.facilities;
    if (Array.isArray(room?.amenities)) return room.amenities;
    if (Array.isArray(room?.room_facility_ids)) return room.room_facility_ids;
    if (Array.isArray(room?.facility_ids)) return room.facility_ids;
    return [];
  };

  const getRoomFacilityIds = (room) => {
    const source = getRoomFacilitySource(room);

    return source
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id || item.facility_id || item.value || null;
        }

        return item;
      })
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .filter((value, index, array) => array.indexOf(value) === index);
  };

  const getSelectedRoomFacilityNames = (room) => {
    const ids = getRoomFacilityIds(room);

    if (ids.length === 0) return [];

    return roomFacilityOptions
      .filter((facility) => ids.includes(Number(facility.id)))
      .map((facility) => facility.name);
  };

  const handleRoomFacilityToggle = (facilityId) => {
    const numericId = Number(facilityId);

    setEditForm((prev) => {
      const currentIds = Array.isArray(prev.room_facility_ids)
        ? prev.room_facility_ids.map(Number)
        : [];

      const exists = currentIds.includes(numericId);

      return {
        ...prev,
        room_facility_ids: exists
          ? currentIds.filter((id) => id !== numericId)
          : [...currentIds, numericId],
      };
    });
  };

  const formatRupiah = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\u00A0/g, " ");
  };

  const normalizeImageUrl = (path) => {
    if (!path) return "";

    const rawPath = String(path).trim();
    if (!rawPath) return "";

    if (
      rawPath.startsWith("http://") ||
      rawPath.startsWith("https://") ||
      rawPath.startsWith("blob:") ||
      rawPath.startsWith("data:")
    ) {
      return rawPath;
    }

    const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(
      /\/$/,
      ""
    );

    if (rawPath.startsWith("/storage/")) {
      return backendUrl ? `${backendUrl}${rawPath}` : rawPath;
    }

    if (rawPath.startsWith("storage/")) {
      return backendUrl ? `${backendUrl}/${rawPath}` : `/${rawPath}`;
    }

    if (rawPath.startsWith("/")) {
      return backendUrl ? `${backendUrl}${rawPath}` : rawPath;
    }

    return backendUrl ? `${backendUrl}/storage/${rawPath}` : `/storage/${rawPath}`;
  };

  const getRoomCoverUrl = (room) => {
    return normalizeImageUrl(
      room?.cover_image ||
        room?.cover ||
        room?.thumbnail ||
        room?.image ||
        room?.photo ||
        room?.image_url ||
        room?.cover_url ||
        room?.cover_image_url
    );
  };

  const getRoomGalleryItems = (room) => {
    const images = Array.isArray(room?.images)
      ? room.images
      : Array.isArray(room?.gallery)
      ? room.gallery
      : Array.isArray(room?.room_images)
      ? room.room_images
      : [];

    return images
      .map((image, index) => {
        if (typeof image === "string") {
          return {
            id: null,
            url: normalizeImageUrl(image),
            label: `Gallery ${index + 1}`,
          };
        }

        return {
          id: image?.id ?? image?.image_id ?? image?.room_image_id ?? null,
          url: normalizeImageUrl(
            image?.image ||
              image?.image_path ||
              image?.path ||
              image?.url ||
              image?.photo ||
              image?.file
          ),
          label: image?.name || image?.title || `Gallery ${index + 1}`,
        };
      })
      .filter((image) => image.url);
  };

  const getRoomGalleryImages = (room) => {
    return getRoomGalleryItems(room).map((image) => image.url);
  };

  const getVisibleCurrentGalleryItems = (room) => {
    return getRoomGalleryItems(room).filter((image) => {
      if (!image.id) return true;
      return !deletedGalleryImageIds.includes(Number(image.id));
    });
  };

  const validateImageFile = (file) => {
    if (!file) return false;

    if (!String(file.type || "").startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return false;
    }

    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran gambar maksimal 4MB");
      return false;
    }

    return true;
  };

  const getRoomTransitPrice = (room, duration) => {
    if (duration === "3h") {
      return room?.price_transit_3h ?? room?.price_3h ?? 0;
    }

    if (duration === "6h") {
      return room?.price_transit_6h ?? room?.price_6h ?? 0;
    }

    if (duration === "12h") {
      return room?.price_transit_12h ?? room?.price_12h ?? 0;
    }

    return 0;
  };

  const getTransitPayloadKey = (room, canonicalKey, fallbackKey) => {
    if (Object.prototype.hasOwnProperty.call(room || {}, canonicalKey)) {
      return canonicalKey;
    }

    return fallbackKey;
  };

  const hotelOptions = useMemo(() => {
    if (hotels.length > 0) return hotels;

    const mappedHotels = rooms
      .map((room) => room.hotel)
      .filter((hotel) => hotel?.id && hotel?.name);

    const uniqueHotels = [];

    mappedHotels.forEach((hotel) => {
      const alreadyExists = uniqueHotels.some(
        (item) => Number(item.id) === Number(hotel.id)
      );

      if (!alreadyExists) uniqueHotels.push(hotel);
    });

    return uniqueHotels;
  }, [hotels, rooms]);

  const selectedHotelData = useMemo(() => {
    if (selectedHotelId === "all") return null;

    return (
      hotelOptions.find((hotel) => String(hotel.id) === String(selectedHotelId)) ||
      null
    );
  }, [hotelOptions, selectedHotelId]);

  const selectedBranchLabel = selectedHotelData?.name ||
    (selectedHotelId === "all" ? "Semua Cabang" : "Cabang dipilih");

  const roomTypeOptions = useMemo(() => {
    const types = rooms
      .map((room) => room?.type)
      .filter(Boolean)
      .map((type) => String(type).trim())
      .filter(Boolean);

    return [...new Set(types)].sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return rooms.filter((room) => {
      const roomHotelId = Number(room?.hotel_id || room?.hotel?.id || 0);
      const active = isRoomActive(room);

      const matchHotel =
        selectedHotelId === "all" || roomHotelId === Number(selectedHotelId);

      const matchType =
        selectedRoomType === "all" ||
        String(room?.type || "").toLowerCase() ===
          String(selectedRoomType).toLowerCase();

      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && active) ||
        (selectedStatus === "inactive" && !active);

      const selectedFacilityNames = getSelectedRoomFacilityNames(room)
        .join(" ")
        .toLowerCase();

      const matchKeyword =
        !keyword ||
        String(room?.name || "").toLowerCase().includes(keyword) ||
        String(room?.type || "").toLowerCase().includes(keyword) ||
        String(room?.hotel?.name || "").toLowerCase().includes(keyword) ||
        selectedFacilityNames.includes(keyword);

      return matchHotel && matchType && matchStatus && matchKeyword;
    });
  }, [
    rooms,
    searchTerm,
    selectedHotelId,
    selectedRoomType,
    selectedStatus,
    roomFacilityOptions,
  ]);

  const roomStatsSource = useMemo(() => {
    if (selectedHotelId === "all") return rooms;

    return rooms.filter((room) => {
      const roomHotelId = Number(room?.hotel_id || room?.hotel?.id || 0);
      return roomHotelId === Number(selectedHotelId);
    });
  }, [rooms, selectedHotelId]);

  const roomStats = useMemo(() => {
    const activeRooms = roomStatsSource.filter((room) => isRoomActive(room)).length;
    const inactiveRooms = roomStatsSource.length - activeRooms;
    const totalUnits = roomStatsSource.reduce(
      (sum, room) => sum + Number(room?.total_rooms || 0),
      0
    );

    const uniqueHotels = new Set(
      roomStatsSource
        .map((room) => room?.hotel_id || room?.hotel?.id)
        .filter(Boolean)
        .map((id) => String(id))
    );

    return {
      totalRoomTypes: roomStatsSource.length,
      activeRooms,
      inactiveRooms,
      totalUnits,
      totalBranches: uniqueHotels.size,
    };
  }, [roomStatsSource]);

  const hasActiveFilters =
    searchTerm.trim() ||
    selectedHotelId !== "all" ||
    selectedRoomType !== "all" ||
    selectedStatus !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedHotelId("all");
    setSelectedRoomType("all");
    setSelectedStatus("all");
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);

    setEditForm({
      name: room?.name || "",
      hotel_id: room?.hotel_id || room?.hotel?.id || "",
      type: room?.type || "",
      capacity: room?.capacity || "",
      price_per_night: room?.price_per_night || "",
      price_3h: getRoomTransitPrice(room, "3h"),
      price_6h: getRoomTransitPrice(room, "6h"),
      price_12h: getRoomTransitPrice(room, "12h"),
      total_rooms: room?.total_rooms || "",
      status: isRoomActive(room) ? 1 : 0,
      room_facility_ids: getRoomFacilityIds(room),
    });

    setEditCoverFile(null);
    setEditCoverPreview(getRoomCoverUrl(room));
    setEditGalleryFiles([]);
    setEditGalleryPreviews([]);
    setEditCurrentGalleryItems(getRoomGalleryItems(room));
    setDeletedGalleryImageIds([]);
    setDraggedCurrentGalleryIndex(null);
    setDraggedNewGalleryIndex(null);

    setEditRoomUnits([]);
    setNewRoomUnitNumbers("");
    setRoomUnitActionMode(null);
    setSelectedRoomUnitIds([]);
    setBulkRoomUnitProcessing(false);
    setShowEditModal(true);

    fetchEditRoomUnits(room?.id);
  };

  const resetEditImageState = () => {
    editGalleryPreviews.forEach((preview) => {
      if (String(preview || "").startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    if (String(editCoverPreview || "").startsWith("blob:")) {
      URL.revokeObjectURL(editCoverPreview);
    }

    setEditCoverFile(null);
    setEditCoverPreview("");
    setEditGalleryFiles([]);
    setEditGalleryPreviews([]);
    setEditCurrentGalleryItems([]);
    setDeletedGalleryImageIds([]);
    setDraggedCurrentGalleryIndex(null);
    setDraggedNewGalleryIndex(null);
  };

  const closeEditModal = () => {
    if (
      savingEdit ||
      savingRoomUnits ||
      updatingRoomUnitId ||
      deletingRoomUnitId ||
      bulkRoomUnitProcessing
    ) {
      return;
    }

    setShowEditModal(false);
    setSelectedRoom(null);
    setEditForm({
      name: "",
      hotel_id: "",
      type: "",
      capacity: "",
      price_per_night: "",
      price_3h: "",
      price_6h: "",
      price_12h: "",
      total_rooms: "",
      status: 1,
      room_facility_ids: [],
    });
    setEditRoomUnits([]);
    setNewRoomUnitNumbers("");
    setRoomUnitActionMode(null);
    setSelectedRoomUnitIds([]);
    setBulkRoomUnitProcessing(false);
    resetEditImageState();
  };

  const handleEditCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    if (String(editCoverPreview || "").startsWith("blob:")) {
      URL.revokeObjectURL(editCoverPreview);
    }

    setEditCoverFile(file);
    setEditCoverPreview(URL.createObjectURL(file));
  };

  const handleEditGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => validateImageFile(file));
    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    const nextFiles = [...editGalleryFiles, ...validFiles].slice(0, 10);
    const nextPreviews = [
      ...editGalleryPreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ].slice(0, 10);

    setEditGalleryFiles(nextFiles);
    setEditGalleryPreviews(nextPreviews);
    e.target.value = "";
  };

  const removeSelectedGalleryImage = (index) => {
    const preview = editGalleryPreviews[index];

    if (String(preview || "").startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setEditGalleryFiles((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
    setEditGalleryPreviews((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
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

  const moveCurrentGalleryImage = (fromIndex, toIndex) => {
    setEditCurrentGalleryItems((prev) =>
      moveArrayItem(prev, fromIndex, toIndex)
    );
  };

  const moveNewGalleryImage = (fromIndex, toIndex) => {
    setEditGalleryPreviews((prev) => {
      const nextPreviews = moveArrayItem(prev, fromIndex, toIndex);

      setEditGalleryFiles((currentFiles) =>
        moveArrayItem(currentFiles, fromIndex, toIndex)
      );

      return nextPreviews;
    });
  };

  const handleCurrentGalleryDrop = (dropIndex) => {
    if (draggedCurrentGalleryIndex === null) return;
    moveCurrentGalleryImage(draggedCurrentGalleryIndex, dropIndex);
    setDraggedCurrentGalleryIndex(null);
  };

  const handleNewGalleryDrop = (dropIndex) => {
    if (draggedNewGalleryIndex === null) return;
    moveNewGalleryImage(draggedNewGalleryIndex, dropIndex);
    setDraggedNewGalleryIndex(null);
  };

  const markCurrentGalleryImageForDelete = (image) => {
    if (!image?.id) {
      toast.error("Gambar ini belum punya ID, jadi belum bisa dihapus dari database");
      return;
    }

    setDeletedGalleryImageIds((prev) => {
      const imageId = Number(image.id);
      if (prev.includes(imageId)) return prev;
      return [...prev, imageId];
    });

    toast.success(
      "Gambar ditandai untuk dihapus. Klik Simpan Perubahan untuk menyimpan."
    );
  };

  const restoreCurrentGalleryImage = (image) => {
    if (!image?.id) return;

    setDeletedGalleryImageIds((prev) =>
      prev.filter((imageId) => Number(imageId) !== Number(image.id))
    );
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditRoomUnitNumberChange = (unitId, value) => {
    setEditRoomUnits((prev) =>
      prev.map((unit) =>
        Number(unit.id) === Number(unitId)
          ? {
              ...unit,
              room_number: value,
            }
          : unit
      )
    );
  };

  const parseRoomNumbers = (value) => {
    return String(value || "")
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);
  };

  const buildUpdatePayload = (room, formData, statusOverride = null) => {
    const price3Key = getTransitPayloadKey(
      room,
      "price_transit_3h",
      "price_3h"
    );
    const price6Key = getTransitPayloadKey(
      room,
      "price_transit_6h",
      "price_6h"
    );
    const price12Key = getTransitPayloadKey(
      room,
      "price_transit_12h",
      "price_12h"
    );

    const finalStatus =
      statusOverride !== null
        ? Number(statusOverride)
        : Number(formData.status ?? (isRoomActive(room) ? 1 : 0));

    const payload = {
      name: formData.name ?? room?.name ?? "",
      hotel_id:
        Number(formData.hotel_id || room?.hotel_id || room?.hotel?.id || 0) ||
        "",
      type: formData.type ?? room?.type ?? "",
      capacity: Number(formData.capacity || 0),
      price_per_night: Number(formData.price_per_night || 0),
      [price3Key]: Number(formData.price_3h || 0),
      [price6Key]: Number(formData.price_6h || 0),
      [price12Key]: Number(formData.price_12h || 0),
      total_rooms: Number(formData.total_rooms || 0),
      status: finalStatus,
      delete_image_ids: deletedGalleryImageIds,
    };

    if (Array.isArray(formData.room_facility_ids)) {
      payload.room_facility_ids = formData.room_facility_ids
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0);
    }

    return payload;
  };

  const buildTotalRoomSyncPayload = (room, nextTotal) => {
    const price3Key = getTransitPayloadKey(
      room,
      "price_transit_3h",
      "price_3h"
    );
    const price6Key = getTransitPayloadKey(
      room,
      "price_transit_6h",
      "price_6h"
    );
    const price12Key = getTransitPayloadKey(
      room,
      "price_transit_12h",
      "price_12h"
    );

    return {
      name: room?.name || "",
      hotel_id: Number(room?.hotel_id || room?.hotel?.id || 0) || "",
      type: room?.type || "",
      capacity: Number(room?.capacity || 0),
      price_per_night: Number(room?.price_per_night || 0),
      [price3Key]: Number(getRoomTransitPrice(room, "3h") || 0),
      [price6Key]: Number(getRoomTransitPrice(room, "6h") || 0),
      [price12Key]: Number(getRoomTransitPrice(room, "12h") || 0),
      total_rooms: Number(nextTotal || 0),
      status: isRoomActive(room) ? 1 : 0,
      room_facility_ids: getRoomFacilityIds(room),
    };
  };

  const buildUpdateFormData = (payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === "room_facility_ids" && value.length === 0) {
          formData.append("room_facility_ids[]", "");
          return;
        }

        value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
        return;
      }

      formData.append(key, value ?? "");
    });

    if (editCoverFile) {
      formData.append("thumbnail", editCoverFile);
      formData.append("cover_image", editCoverFile);
    }

    editGalleryFiles.forEach((file) => {
      formData.append("images[]", file);
    });

    editCurrentGalleryItems
      .filter((image) => image?.id && !deletedGalleryImageIds.includes(Number(image.id)))
      .forEach((image, index) => {
        formData.append(`gallery_order[${index}]`, image.id);
        formData.append(`image_order[${index}]`, image.id);
        formData.append(`room_image_order[${index}][id]`, image.id);
        formData.append(`room_image_order[${index}][sort_order]`, index + 1);
      });

    formData.append("_method", "PUT");

    return formData;
  };

  const updateRoomRequest = async (roomId, payload) => {
    const isFormData = payload instanceof FormData;

    if (isFormData) {
      return await api.post(`/admin/rooms/${roomId}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    try {
      return await api.put(`/admin/rooms/${roomId}`, payload);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/rooms/${roomId}`, {
          ...payload,
          _method: "PUT",
        });
      }

      throw error;
    }
  };

  const updateRoomUnitRequest = async (unitId, payload) => {
    try {
      return await api.put(`/admin/room-units/${unitId}`, payload);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/room-units/${unitId}`, {
          ...payload,
          _method: "PUT",
        });
      }

      throw error;
    }
  };

  const deleteRoomUnitRequest = async (unitId) => {
    try {
      return await api.delete(`/admin/room-units/${unitId}`);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/room-units/${unitId}`, {
          _method: "DELETE",
        });
      }

      throw error;
    }
  };

  const syncRoomTotalUnits = async (nextTotal) => {
    if (!selectedRoom?.id) return;

    const payload = buildTotalRoomSyncPayload(selectedRoom, nextTotal);
    await updateRoomRequest(selectedRoom.id, payload);

    setEditForm((prev) => ({
      ...prev,
      total_rooms: String(nextTotal),
    }));

    setSelectedRoom((prev) =>
      prev
        ? {
            ...prev,
            total_rooms: nextTotal,
          }
        : prev
    );
  };

  const refreshRoomUnitsAndSyncTotal = async () => {
    if (!selectedRoom?.id) return;

    const response = await api.get(`/admin/room-units/${selectedRoom.id}`);
    const unitData = normalizeArrayResponse(response.data);

    setEditRoomUnits(unitData);
    await syncRoomTotalUnits(unitData.length);
    await fetchRooms();
  };

  const handleAddRoomUnitsFromEdit = async () => {
    if (!selectedRoom?.id) {
      toast.error("Room belum dipilih");
      return;
    }

    const numbers = parseRoomNumbers(newRoomUnitNumbers);

    if (numbers.length === 0) {
      toast.error("Isi nomor kamar yang mau ditambahkan");
      return;
    }

    const existingNumbers = editRoomUnits
      .map((unit) => String(getRoomUnitNumber(unit)).trim().toLowerCase())
      .filter(Boolean);

    const duplicateNumbers = numbers.filter((number) =>
      existingNumbers.includes(String(number).trim().toLowerCase())
    );

    if (duplicateNumbers.length > 0) {
      toast.error(`Nomor kamar sudah ada: ${duplicateNumbers.join(", ")}`);
      return;
    }

    try {
      setSavingRoomUnits(true);

      const results = await Promise.allSettled(
        numbers.map((roomNumber) =>
          api.post("/admin/room-units", {
            room_id: selectedRoom.id,
            room_number: roomNumber,
            status: true,
          })
        )
      );

      const successCount = results.filter(
        (item) => item.status === "fulfilled"
      ).length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} nomor kamar berhasil ditambahkan`);
      }

      if (failedCount > 0) {
        toast.error(`${failedCount} nomor kamar gagal ditambahkan`);
      }

      setNewRoomUnitNumbers("");
      await refreshRoomUnitsAndSyncTotal();
    } catch (error) {
      console.error("Gagal tambah room unit:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menambah nomor kamar");
    } finally {
      setSavingRoomUnits(false);
    }
  };

  const handleSaveRoomUnitNumber = async (unit) => {
    if (!unit?.id) return;

    const roomNumber = String(getRoomUnitNumber(unit) || "").trim();

    if (!roomNumber) {
      toast.error("Nomor kamar tidak boleh kosong");
      return;
    }

    try {
      setUpdatingRoomUnitId(unit.id);

      await updateRoomUnitRequest(unit.id, {
        room_id: selectedRoom?.id,
        room_number: roomNumber,
        status: isRoomUnitActive(unit) ? 1 : 0,
      });

      toast.success("Nomor kamar berhasil diperbarui");
      await fetchEditRoomUnits(selectedRoom?.id);
      await fetchRooms();
    } catch (error) {
      console.error("Gagal update room unit:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update nomor kamar");
    } finally {
      setUpdatingRoomUnitId(null);
    }
  };

  const handleToggleRoomUnitStatus = async (unit) => {
    if (!unit?.id) return;

    const nextStatus = isRoomUnitActive(unit) ? 0 : 1;

    try {
      setUpdatingRoomUnitId(unit.id);

      await updateRoomUnitRequest(unit.id, {
        room_id: selectedRoom?.id,
        room_number: getRoomUnitNumber(unit),
        status: nextStatus,
      });

      toast.success(nextStatus ? "Nomor kamar diaktifkan" : "Nomor kamar dinonaktifkan");
      await fetchEditRoomUnits(selectedRoom?.id);
      await fetchRooms();
    } catch (error) {
      console.error("Gagal update status room unit:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update status nomor kamar");
    } finally {
      setUpdatingRoomUnitId(null);
    }
  };

  const handleDeleteRoomUnit = async (unit) => {
    if (!unit?.id) return;

    const confirmed = window.confirm(
      `Hapus nomor kamar ${getRoomUnitNumber(unit)}? Jika kamar ini sudah pernah dipakai booking, backend bisa menolak penghapusan.`
    );

    if (!confirmed) return;

    try {
      setDeletingRoomUnitId(unit.id);

      await deleteRoomUnitRequest(unit.id);

      toast.success("Nomor kamar berhasil dihapus");
      await refreshRoomUnitsAndSyncTotal();
    } catch (error) {
      console.error("Gagal hapus room unit:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Gagal hapus nomor kamar. Jika sudah dipakai booking, gunakan Nonaktifkan saja."
      );
    } finally {
      setDeletingRoomUnitId(null);
    }
  };



  const getRoomUnitActionLabel = (mode = roomUnitActionMode) => {
    if (mode === "activate") return "Aktifkan";
    if (mode === "deactivate") return "Nonaktifkan";
    if (mode === "delete") return "Hapus";
    return "Pilih Aksi";
  };

  const startRoomUnitActionMode = (mode) => {
    if (savingRoomUnits || bulkRoomUnitProcessing) return;

    setRoomUnitActionMode((currentMode) => (currentMode === mode ? null : mode));
    setSelectedRoomUnitIds([]);
  };

  const cancelRoomUnitActionMode = () => {
    if (bulkRoomUnitProcessing) return;

    setRoomUnitActionMode(null);
    setSelectedRoomUnitIds([]);
  };

  const toggleSelectedRoomUnit = (unitId) => {
    if (!roomUnitActionMode || bulkRoomUnitProcessing) return;

    const id = String(unitId);

    setSelectedRoomUnitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllRoomUnitsForAction = () => {
    if (!roomUnitActionMode || bulkRoomUnitProcessing) return;

    setSelectedRoomUnitIds(
      editRoomUnits
        .filter((unit) => unit?.id)
        .map((unit) => String(unit.id))
    );
  };

  const clearSelectedRoomUnits = () => {
    if (bulkRoomUnitProcessing) return;
    setSelectedRoomUnitIds([]);
  };

  const handleApplyRoomUnitAction = async () => {
    if (!roomUnitActionMode) {
      toast.error("Pilih tindakan kamar dulu");
      return;
    }

    const selectedUnits = editRoomUnits.filter((unit) =>
      selectedRoomUnitIds.includes(String(unit?.id))
    );

    if (selectedUnits.length === 0) {
      toast.error("Pilih nomor kamar yang mau diproses");
      return;
    }

    const actionLabel = getRoomUnitActionLabel(roomUnitActionMode).toLowerCase();
    const roomNumbers = selectedUnits
      .map((unit) => getRoomUnitNumber(unit))
      .filter(Boolean)
      .join(", ");

    const confirmed = window.confirm(
      `Yakin ingin ${actionLabel} ${selectedUnits.length} nomor kamar${
        roomNumbers ? `: ${roomNumbers}` : ""
      }?`
    );

    if (!confirmed) return;

    try {
      setBulkRoomUnitProcessing(true);

      let results = [];

      if (roomUnitActionMode === "delete") {
        results = await Promise.allSettled(
          selectedUnits.map((unit) => deleteRoomUnitRequest(unit.id))
        );
      } else {
        const nextStatus = roomUnitActionMode === "activate" ? 1 : 0;

        results = await Promise.allSettled(
          selectedUnits.map((unit) =>
            updateRoomUnitRequest(unit.id, {
              room_id: selectedRoom?.id,
              room_number: getRoomUnitNumber(unit),
              status: nextStatus,
            })
          )
        );
      }

      const successCount = results.filter(
        (item) => item.status === "fulfilled"
      ).length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `${successCount} nomor kamar berhasil di${actionLabel}`
        );
      }

      if (failedCount > 0) {
        toast.error(
          `${failedCount} nomor kamar gagal diproses. Jika kamar sudah dipakai booking, gunakan Nonaktifkan saja.`
        );
      }

      setRoomUnitActionMode(null);
      setSelectedRoomUnitIds([]);

      if (roomUnitActionMode === "delete") {
        await refreshRoomUnitsAndSyncTotal();
      } else {
        await fetchEditRoomUnits(selectedRoom?.id);
        await fetchRooms();
      }
    } catch (error) {
      console.error("Gagal proses tindakan kamar fisik:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal memproses nomor kamar");
    } finally {
      setBulkRoomUnitProcessing(false);
    }
  };
  const deleteRoomRequest = async (roomId) => {
    try {
      return await api.delete(`/admin/rooms/${roomId}`);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/rooms/${roomId}`, {
          _method: "DELETE",
        });
      }

      throw error;
    }
  };

  const syncEditedRoomUnitNumbers = async () => {
    if (!selectedRoom?.id || editRoomUnits.length === 0) return;

    const results = await Promise.allSettled(
      editRoomUnits
        .filter((unit) => unit?.id)
        .map((unit) => {
          const roomNumber = String(getRoomUnitNumber(unit) || "").trim();

          if (!roomNumber) {
            throw new Error("Nomor kamar tidak boleh kosong");
          }

          return updateRoomUnitRequest(unit.id, {
            room_id: selectedRoom.id,
            room_number: roomNumber,
            status: isRoomUnitActive(unit) ? 1 : 0,
          });
        })
    );

    const failed = results.filter((item) => item.status === "rejected");

    if (failed.length > 0) {
      throw new Error("Ada nomor kamar yang gagal disimpan");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!selectedRoom?.id) {
      toast.error("Room belum dipilih");
      return;
    }

    if (!editForm.name.trim()) {
      toast.error("Nama room wajib diisi");
      return;
    }

    if (!editForm.hotel_id) {
      toast.error("Data hotel room tidak terbaca");
      return;
    }

    try {
      setSavingEdit(true);

      await syncEditedRoomUnitNumbers();

      const payload = buildUpdatePayload(selectedRoom, editForm);
      const hasGalleryOrderChanges = editCurrentGalleryItems.some((image) => image?.id);
      const hasImageChanges =
        editCoverFile ||
        editGalleryFiles.length > 0 ||
        deletedGalleryImageIds.length > 0 ||
        hasGalleryOrderChanges;

      const finalPayload = hasImageChanges ? buildUpdateFormData(payload) : payload;

      await updateRoomRequest(selectedRoom.id, finalPayload);

      toast.success("Room berhasil diperbarui");
      closeEditModal();
      fetchRooms();
    } catch (error) {
      console.error("Gagal update room:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal memperbarui data room"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (room) => {
    if (!room?.id) return;

    const nextStatus = isRoomActive(room) ? 0 : 1;

    const formFromRoom = {
      name: room?.name || "",
      hotel_id: room?.hotel_id || room?.hotel?.id || "",
      type: room?.type || "",
      capacity: room?.capacity || "",
      price_per_night: room?.price_per_night || "",
      price_3h: getRoomTransitPrice(room, "3h"),
      price_6h: getRoomTransitPrice(room, "6h"),
      price_12h: getRoomTransitPrice(room, "12h"),
      total_rooms: room?.total_rooms || "",
      status: nextStatus,
      room_facility_ids: getRoomFacilityIds(room),
    };

    try {
      setTogglingRoomId(room.id);

      const payload = buildUpdatePayload(room, formFromRoom, nextStatus);
      await updateRoomRequest(room.id, payload);

      toast.success(nextStatus ? "Room diaktifkan" : "Room dinonaktifkan");
      fetchRooms();
    } catch (error) {
      console.error("Gagal update status room:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal mengubah status room"
      );
    } finally {
      setTogglingRoomId(null);
    }
  };

  const openDeleteModal = (room) => {
    if (!room?.id) return;

    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingRoomId) return;

    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete?.id) return;

    try {
      setDeletingRoomId(roomToDelete.id);

      await deleteRoomRequest(roomToDelete.id);

      toast.success("Room berhasil dihapus");
      setShowDeleteModal(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error("Gagal hapus room:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Gagal menghapus room. Jika room sudah punya booking atau room unit, gunakan Disable saja."
      );
    } finally {
      setDeletingRoomId(null);
    }
  };

  const selectedFacilityCount = Array.isArray(editForm.room_facility_ids)
    ? editForm.room_facility_ids.length
    : 0;

  const activeRoomUnitCount = editRoomUnits.filter((unit) =>
    isRoomUnitActive(unit)
  ).length;
  const inactiveRoomUnitCount = editRoomUnits.length - activeRoomUnitCount;
  const selectedRoomUnitCount = selectedRoomUnitIds.length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-start gap-2">
            <a
              href={backToHotelsUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <span className="text-lg leading-none">←</span>
              Kembali
            </a>

            <a
              href="/admin/rooms/add"
              className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-gray-200 transition hover:bg-black"
            >
              + Add Room
            </a>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-extrabold text-gray-900">
                  Data Kamar
                </h2>

                <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                  {filteredRooms.length} data ditemukan
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Kamar berdasarkan cabang yang dipilih.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-6 py-4 font-semibold">Nama Kamar</th>
                    <th className="px-6 py-4 font-semibold">Cabang</th>
                    <th className="px-6 py-4 font-semibold">Tipe</th>
                    <th className="px-6 py-4 font-semibold">Kapasitas</th>
                    <th className="px-6 py-4 font-semibold">
                      Harga Full Day
                    </th>
                    <th className="px-6 py-4 font-semibold">Transit 3 Jam</th>
                    <th className="px-6 py-4 font-semibold">Transit 6 Jam</th>
                    <th className="px-6 py-4 font-semibold">Transit 12 Jam</th>
                    <th className="px-6 py-4 font-semibold">Total Unit</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => {
                      const active = isRoomActive(room);
                      const isToggling = togglingRoomId === room.id;
                      const isDeleting = deletingRoomId === room.id;

                      return (
                        <tr
                          key={room.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">
                              {room.name || "-"}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-gray-400">
                              ID: {room.id}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.hotel?.name || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {room.type || "-"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.capacity || 0} orang
                          </td>

                          <td className="px-6 py-4 font-bold text-red-600">
                            {formatRupiah(room.price_per_night)}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {formatRupiah(getRoomTransitPrice(room, "3h"))}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {formatRupiah(getRoomTransitPrice(room, "6h"))}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {formatRupiah(getRoomTransitPrice(room, "12h"))}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.total_rooms || 0}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(room)}
                              disabled={isToggling || isDeleting}
                              className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {isToggling
                                ? "Updating..."
                                : active
                                ? "Aktif"
                                : "Nonaktif"}
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(room)}
                                disabled={isDeleting}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(room)}
                                disabled={isToggling || isDeleting}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  active
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                {active ? "Disable" : "Enable"}
                              </button>

                              <button
                                type="button"
                                onClick={() => openDeleteModal(room)}
                                disabled={isDeleting || isToggling}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="11"
                        className="px-6 py-14 text-center text-gray-500"
                      >
                        <div className="mx-auto max-w-md">
                          <p className="text-lg font-bold text-gray-800">
                            Tidak ada kamar yang cocok
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-500">
                            Coba ubah cabang, tipe kamar, status, atau kata
                            kunci pencarian.
                          </p>

                          <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-5 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Perbarui data kamar, fasilitas, harga, gambar, dan nomor kamar fisik.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={
                  savingEdit ||
                  savingRoomUnits ||
                  Boolean(updatingRoomUnitId) ||
                  Boolean(deletingRoomUnitId) ||
                  bulkRoomUnitProcessing
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Cover Kamar
                    </label>

                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
                      {editCoverPreview ? (
                        <img
                          src={editCoverPreview}
                          alt="Preview cover kamar"
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-56 w-full flex-col items-center justify-center px-5 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
                            +
                          </div>
                          <p className="mt-3 text-sm font-bold text-gray-800">
                            Belum ada cover kamar
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            Tambahkan gambar utama supaya room terlihat lebih
                            profesional di halaman customer.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {editCoverFile
                              ? editCoverFile.name
                              : editCoverPreview
                              ? "Cover saat ini"
                              : "Upload cover baru"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            PNG, JPG, JPEG, WEBP. Maksimal 4MB.
                          </p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">
                          Ganti Cover
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditCoverChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Gallery Kamar
                    </label>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Atur gallery kamar
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Geser urutan foto dengan tombol kiri/kanan atau drag. Simpan Perubahan untuk menyimpan.
                          </p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50">
                          Tambah Gambar
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleEditGalleryChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {editCurrentGalleryItems.filter((image) => !image.id || !deletedGalleryImageIds.includes(Number(image.id))).length > 0 && (
                        <div className="mb-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                Gallery Saat Ini
                              </p>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                                Bisa diurutkan
                              </span>
                            </div>

                            {deletedGalleryImageIds.length > 0 && (
                              <p className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                {deletedGalleryImageIds.length} gambar akan dihapus
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {editCurrentGalleryItems
                              .filter((image) => !image.id || !deletedGalleryImageIds.includes(Number(image.id)))
                              .slice(0, 12)
                              .map((image, index) => (
                                <div
                                  key={`${image.url}-${image.id || index}`}
                                  draggable
                                  onDragStart={() => setDraggedCurrentGalleryIndex(index)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleCurrentGalleryDrop(index)}
                                  onDragEnd={() => setDraggedCurrentGalleryIndex(null)}
                                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                                    draggedCurrentGalleryIndex === index
                                      ? "border-red-300 opacity-60"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="relative">
                                    <img
                                      src={image.url}
                                      alt={image.label || `Gallery kamar ${index + 1}`}
                                      className="h-24 w-full object-cover"
                                    />

                                    <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-black text-white shadow">
                                      {index + 1}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => markCurrentGalleryImageForDelete(image)}
                                      className="absolute bottom-2 right-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-red-700"
                                    >
                                      Hapus
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 p-2">
                                    <button
                                      type="button"
                                      onClick={() => moveCurrentGalleryImage(index, index - 1)}
                                      disabled={index === 0}
                                      className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      ← 
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveCurrentGalleryImage(index, index + 1)}
                                      disabled={
                                        index ===
                                        editCurrentGalleryItems.filter((item) => !item.id || !deletedGalleryImageIds.includes(Number(item.id))).length - 1
                                      }
                                      className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                       →
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-gray-500">
                            Urutan gallery dan gambar yang dihapus akan diproses saat klik Simpan Perubahan.
                          </p>
                        </div>
                      )}

                      {editGalleryPreviews.length > 0 ? (
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              Gambar Baru Dipilih
                            </p>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                              Bisa diurutkan
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {editGalleryPreviews.map((preview, index) => (
                              <div
                                key={`${preview}-${index}`}
                                draggable
                                onDragStart={() => setDraggedNewGalleryIndex(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleNewGalleryDrop(index)}
                                onDragEnd={() => setDraggedNewGalleryIndex(null)}
                                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                                  draggedNewGalleryIndex === index
                                    ? "border-red-300 opacity-60"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview gallery ${index + 1}`}
                                    className="h-24 w-full object-cover"
                                  />

                                  <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-black text-white shadow">
                                    {index + 1}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeSelectedGalleryImage(index)}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50"
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 p-2">
                                  <button
                                    type="button"
                                    onClick={() => moveNewGalleryImage(index, index - 1)}
                                    disabled={index === 0}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    ← 
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveNewGalleryImage(index, index + 1)}
                                    disabled={index === editGalleryPreviews.length - 1}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                     →
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
                          <p className="text-sm font-bold text-gray-800">
                            Belum ada gambar baru dipilih
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Klik Tambah Gambar kalau ingin menambah gallery room.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Nama Kamar
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Contoh: Deluxe Room"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Tipe Kamar
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={editForm.type}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Contoh: Standard / Deluxe"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Kapasitas
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="0"
                      value={editForm.capacity}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Kapasitas tamu"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Total Unit
                    </label>
                    <input
                      type="number"
                      name="total_rooms"
                      min="0"
                      value={editForm.total_rooms}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                      placeholder="Otomatis dari nomor kamar fisik"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Total unit mengikuti jumlah nomor kamar fisik di bawah.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Harga Full Day
                    </label>
                    <input
                      type="number"
                      name="price_per_night"
                      min="0"
                      value={editForm.price_per_night}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga full day"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value={1}>Aktif</option>
                      <option value={0}>Nonaktif</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 3 Jam
                    </label>
                    <input
                      type="number"
                      name="price_3h"
                      min="0"
                      value={editForm.price_3h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 3 jam"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 6 Jam
                    </label>
                    <input
                      type="number"
                      name="price_6h"
                      min="0"
                      value={editForm.price_6h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 6 jam"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 12 Jam
                    </label>
                    <input
                      type="number"
                      name="price_12h"
                      min="0"
                      value={editForm.price_12h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 12 jam"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900">
                        Kamar Fisik / Nomor Kamar
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Nomor kamar dibuat lebih compact. Pilih tindakan di atas, centang kamar, lalu terapkan.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm">
                        {editRoomUnits.length} unit
                      </span>
                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-green-700 ring-1 ring-green-100">
                        {activeRoomUnitCount} aktif
                      </span>
                      <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 ring-1 ring-red-100">
                        {inactiveRoomUnitCount} nonaktif
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-blue-100 bg-white p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                          Tambah Nomor Kamar
                        </label>
                        <textarea
                          value={newRoomUnitNumbers}
                          onChange={(e) => setNewRoomUnitNumbers(e.target.value)}
                          rows={2}
                          placeholder="Contoh: 101, 102, 103 atau tulis per baris"
                          className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddRoomUnitsFromEdit}
                        disabled={savingRoomUnits || !newRoomUnitNumbers.trim()}
                        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingRoomUnits ? "Menambah..." : "Tambah"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                          Tindakan Kamar
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Klik Aktifkan, Nonaktifkan, atau Hapus untuk mulai memilih nomor kamar.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startRoomUnitActionMode("activate")}
                          disabled={loadingEditRoomUnits || savingRoomUnits || bulkRoomUnitProcessing}
                          className={`rounded-2xl px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            roomUnitActionMode === "activate"
                              ? "bg-green-600 text-white shadow-lg shadow-green-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          Aktifkan
                        </button>

                        <button
                          type="button"
                          onClick={() => startRoomUnitActionMode("deactivate")}
                          disabled={loadingEditRoomUnits || savingRoomUnits || bulkRoomUnitProcessing}
                          className={`rounded-2xl px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            roomUnitActionMode === "deactivate"
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          Nonaktifkan
                        </button>

                        <button
                          type="button"
                          onClick={() => startRoomUnitActionMode("delete")}
                          disabled={loadingEditRoomUnits || savingRoomUnits || bulkRoomUnitProcessing}
                          className={`rounded-2xl px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            roomUnitActionMode === "delete"
                              ? "bg-red-600 text-white shadow-lg shadow-red-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    {roomUnitActionMode && (
                      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-black text-gray-900">
                            Mode {getRoomUnitActionLabel()}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {selectedRoomUnitCount} nomor kamar dipilih
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllRoomUnitsForAction}
                            disabled={bulkRoomUnitProcessing || editRoomUnits.length === 0}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Pilih Semua
                          </button>

                          <button
                            type="button"
                            onClick={clearSelectedRoomUnits}
                            disabled={bulkRoomUnitProcessing || selectedRoomUnitCount === 0}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Bersihkan
                          </button>

                          <button
                            type="button"
                            onClick={cancelRoomUnitActionMode}
                            disabled={bulkRoomUnitProcessing}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Batal Mode
                          </button>

                          <button
                            type="button"
                            onClick={handleApplyRoomUnitAction}
                            disabled={bulkRoomUnitProcessing || selectedRoomUnitCount === 0}
                            className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {bulkRoomUnitProcessing
                              ? "Memproses..."
                              : `Terapkan ${getRoomUnitActionLabel()}`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {loadingEditRoomUnits ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-500">
                      Memuat nomor kamar fisik...
                    </div>
                  ) : editRoomUnits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-5 text-center">
                      <p className="text-sm font-black text-gray-800">
                        Belum ada nomor kamar fisik
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Tambahkan nomor kamar agar muncul di Monitoring Kamar.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
                      {editRoomUnits.map((unit) => {
                        const unitActive = isRoomUnitActive(unit);
                        const unitId = String(unit.id);
                        const selected = selectedRoomUnitIds.includes(unitId);
                        const isUpdating = Number(updatingRoomUnitId) === Number(unit.id);
                        const isDeleting = Number(deletingRoomUnitId) === Number(unit.id);
                        const busy =
                          isUpdating || isDeleting || bulkRoomUnitProcessing || savingRoomUnits;

                        return (
                          <div
                            key={unit.id}
                            className={`relative rounded-2xl border bg-white p-2.5 transition ${
                              selected
                                ? "border-blue-400 shadow-md ring-4 ring-blue-100"
                                : unitActive
                                ? "border-green-100 hover:border-green-200"
                                : "border-red-100 hover:border-red-200"
                            }`}
                          >
                            {roomUnitActionMode && (
                              <button
                                type="button"
                                onClick={() => toggleSelectedRoomUnit(unit.id)}
                                disabled={busy}
                                className={`absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  selected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-gray-300 bg-white text-transparent hover:border-blue-300"
                                }`}
                                title="Pilih kamar"
                              >
                                ✓
                              </button>
                            )}

                            <div
                              role={roomUnitActionMode ? "button" : undefined}
                              tabIndex={roomUnitActionMode ? 0 : undefined}
                              onClick={() => {
                                if (roomUnitActionMode) {
                                  toggleSelectedRoomUnit(unit.id);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (
                                  roomUnitActionMode &&
                                  (e.key === "Enter" || e.key === " ")
                                ) {
                                  e.preventDefault();
                                  toggleSelectedRoomUnit(unit.id);
                                }
                              }}
                              className={`w-full text-left ${
                                roomUnitActionMode
                                  ? "cursor-pointer"
                                  : "cursor-default"
                              } ${busy && roomUnitActionMode ? "opacity-70" : ""}`}
                            >
                              <label className="mb-1 block text-[9px] font-black uppercase tracking-wide text-gray-400">
                                Nomor
                              </label>

                              <input
                                type="text"
                                value={getRoomUnitNumber(unit)}
                                onChange={(e) =>
                                  handleEditRoomUnitNumberChange(unit.id, e.target.value)
                                }
                                readOnly={Boolean(roomUnitActionMode) || busy}
                                className={`w-full rounded-xl border px-2.5 py-2 text-center text-sm font-black outline-none transition ${
                                  roomUnitActionMode
                                    ? "cursor-pointer border-transparent bg-gray-50 text-gray-900"
                                    : "border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                }`}
                              />

                              <div className="mt-2 flex items-center justify-center">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
                                    unitActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {unitActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-red-100 bg-red-50/40 p-5">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900">
                        Fasilitas Kamar
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Pilih fasilitas yang tampil di detail kamar customer.
                      </p>
                    </div>

                    <div className="rounded-full bg-white px-4 py-2 text-xs font-black text-red-600 shadow-sm">
                      {selectedFacilityCount} dipilih
                    </div>
                  </div>

                  {loadingFacilities ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                      Memuat fasilitas kamar...
                    </div>
                  ) : roomFacilityOptions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-red-200 bg-white px-4 py-5">
                      <p className="text-sm font-black text-gray-800">
                        Belum ada fasilitas kamar aktif
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">
                        Tambahkan master fasilitas dengan kategori Kamar dari menu
                        Facilities terlebih dahulu.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {roomFacilityOptions.map((facility) => {
                        const checked = editForm.room_facility_ids
                          .map(Number)
                          .includes(Number(facility.id));

                        return (
                          <button
                            key={facility.id}
                            type="button"
                            onClick={() => handleRoomFacilityToggle(facility.id)}
                            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                              checked
                                ? "border-red-300 bg-white text-red-700 shadow-sm ring-4 ring-red-50"
                                : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-black ${
                                checked
                                  ? "border-red-500 bg-red-600 text-white"
                                  : "border-gray-300 bg-white text-transparent"
                              }`}
                            >
                              ✓
                            </span>

                            <span className="min-w-0">
                              <span className="block font-black">
                                {facility.name}
                              </span>
                              <span className="mt-0.5 block text-xs text-gray-400">
                                Icon: {facility.icon || "-"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Catatan
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-700">
                    Perubahan data room akan langsung tersimpan ke database.
                    Nomor kamar fisik memakai data room unit, sehingga perubahan
                    di bagian ini akan dipakai juga oleh halaman Monitoring Kamar.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={
                    savingEdit ||
                    savingRoomUnits ||
                    Boolean(updatingRoomUnitId) ||
                    Boolean(deletingRoomUnitId) ||
                    bulkRoomUnitProcessing
                  }
                  className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    savingEdit ||
                    savingRoomUnits ||
                    Boolean(updatingRoomUnitId) ||
                    Boolean(deletingRoomUnitId) ||
                    bulkRoomUnitProcessing
                  }
                  className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="border-b border-red-100 bg-gradient-to-br from-red-50 to-white px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-xl font-black text-red-600">
                  !
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Hapus Room?
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Kamu akan menghapus data kamar dari sistem ReadyRoom.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                <p className="text-sm font-bold text-red-700">
                  {roomToDelete?.name || "Room ini"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-red-600">
                  Aksi ini dapat menghapus data kamar dari sistem. Jika room ini
                  sudah punya booking, room unit, atau riwayat transaksi, lebih
                  aman gunakan tombol <b>Disable</b> saja.
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                Pastikan room ini memang tidak digunakan lagi sebelum
                melanjutkan.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingRoomId)}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={Boolean(deletingRoomId)}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingRoomId ? "Menghapus..." : "Ya, Hapus Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}