import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Hotel,
  BedDouble,
  User,
  CalendarDays,
  Wallet,
  CircleCheck,
  CircleX,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Plus,
  Building2,
  DoorOpen,
  Clock3,
  MoonStar,
  Save,
  Phone,
  Mail,
  Pencil,
  Layers3,
  History,
  MessageCircle,
} from "lucide-react";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [roomUnits, setRoomUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [approving, setApproving] = useState(false);

  const [selectedRejectBooking, setSelectedRejectBooking] = useState(null);
  const [rejectReasonCustomer, setRejectReasonCustomer] = useState("");
  const [rejectReasonInternal, setRejectReasonInternal] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [selectedEditBooking, setSelectedEditBooking] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editRoomUnits, setEditRoomUnits] = useState([]);
  const [editForm, setEditForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    room_unit_id: "",
    check_in: "",
    admin_note: "",
  });

  const [selectedRefundBooking, setSelectedRefundBooking] = useState(null);
  const [refunding, setRefunding] = useState(false);
  const [refundForm, setRefundForm] = useState({
    refund_amount: "",
    refund_reason: "",
  });

  const [selectedCancelBooking, setSelectedCancelBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    cancel_reason: "",
  });

  const [showManualModal, setShowManualModal] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [manualRoomUnits, setManualRoomUnits] = useState([]);
  const [savingManual, setSavingManual] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingManualUnits, setLoadingManualUnits] = useState(false);

  const [manualForm, setManualForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    hotel_id: "",
    room_id: "",
    room_unit_id: "",
    booking_type: "transit",
    duration_hours: "3",
    check_in: "",
    manual_discount_percent: "",
    admin_note: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    bookingType: "",
    hotelId: "",
    month: "",
  });

  const [viewMode, setViewMode] = useState("today_active");

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const canEditBooking =
    adminUser?.role === "boss" || adminUser?.role === "super_admin";

  useEffect(() => {
    fetchBookings();
    fetchHotels();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (manualForm.room_id) {
      fetchManualRoomUnits(manualForm.room_id);
    } else {
      setManualRoomUnits([]);
      setManualForm((prev) => ({
        ...prev,
        room_unit_id: "",
      }));
    }
  }, [manualForm.room_id]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/bookings");

      const bookingData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setBookings(bookingData);
    } catch (error) {
      console.error("GET BOOKINGS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil data booking");
    } finally {
      setLoading(false);
    }
  };

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
      console.error("GET HOTELS ERROR:", error.response?.data || error);
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.get("/admin/rooms");
      const roomData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setRooms(roomData);
    } catch (error) {
      console.error("GET ROOMS ERROR:", error.response?.data || error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRoomUnits = async (roomId) => {
    try {
      const res = await api.get(`/admin/room-units/${roomId}`);

      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const availableUnits = unitData.filter(
        (unit) => unit.status === true || unit.status === 1
      );

      setRoomUnits(availableUnits);
      return availableUnits;
    } catch (err) {
      console.error("GET ROOM UNITS ERROR:", err.response?.data || err);
      toast.error("Gagal ambil kamar fisik");
      return [];
    }
  };

  const fetchManualRoomUnits = async (roomId) => {
    try {
      setLoadingManualUnits(true);
      const res = await api.get(`/admin/room-units/${roomId}`);

      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const activeUnits = unitData.filter(
        (unit) => unit.status === 1 || unit.status === true
      );

      setManualRoomUnits(activeUnits);
    } catch (error) {
      console.error("GET MANUAL ROOM UNITS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil kamar fisik");
    } finally {
      setLoadingManualUnits(false);
    }
  };

  const handleApproveClick = async (booking) => {
    setSelectedBooking(booking);
    setSelectedUnit("");
    setAdminNote("");
    await fetchRoomUnits(booking.room_id);
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    if (!selectedUnit) {
      toast.error("Pilih kamar fisik dulu");
      return;
    }

    try {
      setApproving(true);

      await api.post(`/admin/bookings/${selectedBooking.id}/approve`, {
        room_unit_id: selectedUnit,
        admin_note: adminNote,
      });

      toast.success("Booking berhasil di-approve");

      setSelectedBooking(null);
      setSelectedUnit("");
      setAdminNote("");
      setRoomUnits([]);

      fetchBookings();
    } catch (err) {
      console.error("APPROVE BOOKING ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Gagal approve booking");
    } finally {
      setApproving(false);
    }
  };

  const closeApproveModal = () => {
    setSelectedBooking(null);
    setSelectedUnit("");
    setAdminNote("");
    setRoomUnits([]);
  };

  const handleRejectClick = (booking) => {
    setSelectedRejectBooking(booking);
    setRejectReasonCustomer("Mohon maaf, kamar sedang penuh pada jadwal tersebut.");
    setRejectReasonInternal("");
  };

  const closeRejectModal = () => {
    setSelectedRejectBooking(null);
    setRejectReasonCustomer("");
    setRejectReasonInternal("");
  };

  const handleReject = async () => {
    if (!selectedRejectBooking) return;

    if (!rejectReasonCustomer.trim()) {
      toast.error("Alasan untuk customer wajib diisi");
      return;
    }

    try {
      setRejecting(true);

      await api.post(`/admin/bookings/${selectedRejectBooking.id}/reject`, {
        rejection_reason_customer: rejectReasonCustomer.trim(),
        rejection_reason_internal: rejectReasonInternal.trim() || null,
      });

      toast.success("Booking berhasil ditolak");
      closeRejectModal();
      fetchBookings();
    } catch (error) {
      console.error("REJECT BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal reject booking");
    } finally {
      setRejecting(false);
    }
  };

  const handleMarkPaid = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/paid`);
      toast.success("Pembayaran berhasil dikonfirmasi");
      fetchBookings();
    } catch (error) {
      console.error("MARK PAID ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal mengubah status pembayaran"
      );
    }
  };

  const handleCheckIn = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/check-in`);
      toast.success("Tamu berhasil check-in");
      fetchBookings();
    } catch (error) {
      console.error("CHECK IN ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal check-in");
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/check-out`);
      toast.success("Tamu berhasil check-out");
      fetchBookings();
    } catch (error) {
      console.error("CHECK OUT ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal check-out");
    }
  };

  const handleStartCleaning = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/start-cleaning`);
      toast.success("Kamar masuk proses cleaning");
      fetchBookings();
    } catch (error) {
      console.error("START CLEANING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal memulai cleaning");
    }
  };

  const handleFinishCleaning = async (booking) => {
    try {
      await api.post(`/admin/bookings/${booking.id}/finish-cleaning`);
      toast.success("Cleaning selesai, kamar siap dipakai lagi");
      fetchBookings();
    } catch (error) {
      console.error("FINISH CLEANING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan cleaning"
      );
    }
  };

  const handleEditClick = async (booking) => {
    const units = await fetchRoomUnits(booking.room_id);

    setSelectedEditBooking(booking);
    setEditRoomUnits(units);

    setEditForm({
      guest_name: booking.guest_name || booking.user?.name || "",
      guest_phone: booking.guest_phone || "",
      guest_email: booking.guest_email || "",
      room_unit_id: booking.room_unit_id || "",
      check_in: booking.check_in
        ? String(booking.check_in).replace(" ", "T").slice(0, 16)
        : "",
      admin_note: booking.admin_note || "",
    });
  };

  const closeEditModal = () => {
    setSelectedEditBooking(null);
    setEditRoomUnits([]);
    setEditForm({
      guest_name: "",
      guest_phone: "",
      guest_email: "",
      room_unit_id: "",
      check_in: "",
      admin_note: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBooking = async () => {
    if (!selectedEditBooking) return;

    if (!editForm.guest_name.trim()) return toast.error("Nama tamu wajib diisi");
    if (!editForm.guest_phone.trim()) return toast.error("Nomor HP wajib diisi");
    if (!editForm.room_unit_id) return toast.error("Pilih kamar fisik");
    if (!editForm.check_in) return toast.error("Check-in wajib diisi");

    try {
      setEditing(true);

      await api.post(`/admin/bookings/${selectedEditBooking.id}/update`, {
        guest_name: editForm.guest_name.trim(),
        guest_phone: editForm.guest_phone.trim(),
        guest_email: editForm.guest_email.trim() || null,
        room_unit_id: Number(editForm.room_unit_id),
        check_in: editForm.check_in.replace("T", " ") + ":00",
        admin_note: editForm.admin_note || "",
        edited_by: adminUser?.id || null,
      });

      toast.success("Booking berhasil diupdate");
      closeEditModal();
      fetchBookings();
    } catch (error) {
      console.error("UPDATE BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update booking");
    } finally {
      setEditing(false);
    }
  };

  const openRefundModal = (booking) => {
    setSelectedRefundBooking(booking);
    setRefundForm({
      refund_amount: booking.total_price || "",
      refund_reason: "",
    });
  };

  const closeRefundModal = () => {
    setSelectedRefundBooking(null);
    setRefundForm({
      refund_amount: "",
      refund_reason: "",
    });
  };

  const handleRefundChange = (e) => {
    const { name, value } = e.target;
    setRefundForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefundBooking = async () => {
    if (!selectedRefundBooking) return;
    if (!refundForm.refund_reason.trim()) {
      toast.error("Alasan refund wajib diisi");
      return;
    }

    try {
      setRefunding(true);

      await api.post(`/admin/bookings/${selectedRefundBooking.id}/refund`, {
        refunded_by: adminUser?.id || null,
        refund_reason: refundForm.refund_reason.trim(),
        refund_amount: refundForm.refund_amount
          ? Number(refundForm.refund_amount)
          : Number(selectedRefundBooking.total_price || 0),
      });

      toast.success("Refund berhasil diproses");
      closeRefundModal();
      fetchBookings();
    } catch (error) {
      console.error("REFUND BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal memproses refund");
    } finally {
      setRefunding(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedCancelBooking(booking);
    setCancelForm({
      cancel_reason:
        "Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.",
    });
  };

  const closeCancelModal = () => {
    setSelectedCancelBooking(null);
    setCancelForm({
      cancel_reason: "",
    });
  };

  const handleCancelChange = (e) => {
    const { name, value } = e.target;
    setCancelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelBooking = async () => {
    if (!selectedCancelBooking) return;

    if (!cancelForm.cancel_reason.trim()) {
      toast.error("Alasan cancel wajib diisi");
      return;
    }

    try {
      setCancelling(true);

      await api.post(`/admin/bookings/${selectedCancelBooking.id}/cancel`, {
        cancelled_by: adminUser?.id || null,
        cancel_reason: cancelForm.cancel_reason.trim(),
      });

      toast.success("Booking berhasil dicancel");
      closeCancelModal();
      fetchBookings();
    } catch (error) {
      console.error("CANCEL BOOKING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const openManualModal = () => {
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setShowManualModal(false);
    setManualForm({
      guest_name: "",
      guest_phone: "",
      guest_email: "",
      hotel_id: "",
      room_id: "",
      room_unit_id: "",
      booking_type: "transit",
      duration_hours: "3",
      check_in: "",
      manual_discount_percent: "",
      admin_note: "",
    });
    setManualRoomUnits([]);
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;

    setManualForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "hotel_id") {
        next.room_id = "";
        next.room_unit_id = "";
      }

      if (name === "room_id") {
        next.room_unit_id = "";
      }

      if (name === "booking_type" && value === "overnight") {
        next.duration_hours = "";
      }

      if (name === "booking_type" && value === "transit" && !prev.duration_hours) {
        next.duration_hours = "3";
      }

      return next;
    });
  };

  const filteredRoomsForManual = useMemo(() => {
    if (!manualForm.hotel_id) return [];
    return rooms.filter(
      (room) => String(room.hotel_id) === String(manualForm.hotel_id)
    );
  }, [rooms, manualForm.hotel_id]);

  const selectedManualRoom = useMemo(() => {
    return rooms.find((room) => String(room.id) === String(manualForm.room_id));
  }, [rooms, manualForm.room_id]);

  const estimatedManualPrice = useMemo(() => {
    if (!selectedManualRoom) return 0;

    if (manualForm.booking_type === "transit") {
      if (String(manualForm.duration_hours) === "3")
        return selectedManualRoom.price_transit_3h || 0;
      if (String(manualForm.duration_hours) === "6")
        return selectedManualRoom.price_transit_6h || 0;
      if (String(manualForm.duration_hours) === "12")
        return selectedManualRoom.price_transit_12h || 0;
      return 0;
    }

    return selectedManualRoom.price_per_night || 0;
  }, [selectedManualRoom, manualForm.booking_type, manualForm.duration_hours]);

  const manualDiscountPercent = useMemo(() => {
    const raw = Number(manualForm.manual_discount_percent || 0);
    if (Number.isNaN(raw)) return 0;
    if (raw < 0) return 0;
    if (raw > 100) return 100;
    return raw;
  }, [manualForm.manual_discount_percent]);

  const manualDiscountAmount = useMemo(() => {
    if (!estimatedManualPrice || !manualDiscountPercent) return 0;
    return Math.round((estimatedManualPrice * manualDiscountPercent) / 100);
  }, [estimatedManualPrice, manualDiscountPercent]);

  const finalManualPrice = useMemo(() => {
    return Math.max(0, estimatedManualPrice - manualDiscountAmount);
  }, [estimatedManualPrice, manualDiscountAmount]);

  const handleSaveManualBooking = async () => {
    if (!manualForm.guest_name.trim()) return toast.error("Nama tamu wajib diisi");
    if (!manualForm.guest_phone.trim()) return toast.error("Nomor HP wajib diisi");
    if (!manualForm.hotel_id) return toast.error("Pilih hotel");
    if (!manualForm.room_id) return toast.error("Pilih tipe kamar");
    if (!manualForm.room_unit_id) return toast.error("Pilih kamar fisik");
    if (!manualForm.check_in) return toast.error("Check-in wajib diisi");
    if (manualForm.booking_type === "transit" && !manualForm.duration_hours) {
      return toast.error("Durasi transit wajib dipilih");
    }

    try {
      setSavingManual(true);

      const payload = {
        guest_name: manualForm.guest_name.trim(),
        guest_phone: manualForm.guest_phone.trim(),
        guest_email: manualForm.guest_email.trim() || null,
        created_by: adminUser?.id || null,
        hotel_id: Number(manualForm.hotel_id),
        room_id: Number(manualForm.room_id),
        room_unit_id: Number(manualForm.room_unit_id),
        booking_type: manualForm.booking_type,
        duration_hours:
          manualForm.booking_type === "transit"
            ? Number(manualForm.duration_hours)
            : null,
        check_in: manualForm.check_in.replace("T", " ") + ":00",
        discount_percent: canEditBooking ? manualDiscountPercent : 0,
        admin_note: manualForm.admin_note || "",
      };

      await api.post("/admin/bookings/manual", payload);

      toast.success("Booking manual berhasil dibuat");
      closeManualModal();
      fetchBookings();
    } catch (error) {
      console.error("MANUAL BOOKING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal membuat booking manual"
      );
    } finally {
      setSavingManual(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const normalizeWhatsAppNumber = (phone) => {
    if (!phone) return "";

    let cleaned = String(phone).replace(/\D/g, "");

    if (cleaned.startsWith("620")) {
      cleaned = "62" + cleaned.slice(3);
    } else if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  };

const buildWhatsAppMessage = (booking) => {
  const customerName = booking.user?.name || booking.guest_name || "Kak";
  const bookingCode = booking.booking_code || `#${booking.id}`;
  const hotelName = booking.hotel?.name || "ReadyRoom";
  const roomName = booking.room?.type || booking.room?.name || "kamar";
  const checkInText = booking.check_in
    ? formatDateTime(booking.check_in)
    : "-";
  const adminContact = booking.hotel?.wa_admin || "-";

  return `Halo Kak ${customerName}, kami dari ${hotelName}. Booking Anda dengan kode ${bookingCode} untuk ${roomName} pada ${checkInText} mohon segera dikonfirmasi. Jika dalam 30 menit setelah waktu check-in belum ada kejelasan, booking dapat dibatalkan oleh pihak hotel. Jika ada kendala atau keterlambatan, silakan hubungi admin cabang di nomor ${adminContact}. Terima kasih.`;
};

  const handleNotifyWhatsApp = (booking) => {
    const rawPhone = booking.guest_phone || "";
    const phone = normalizeWhatsAppNumber(rawPhone);

    if (!phone) {
      toast.error("Nomor WhatsApp tamu tidak tersedia");
      return;
    }

    const message = buildWhatsAppMessage(booking);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "checked_in":
        return "bg-blue-100 text-blue-700";
      case "checked_out":
        return "bg-gray-200 text-gray-700";
      case "cleaning":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      bookingType: "",
      hotelId: "",
      month: "",
    });
    setViewMode("today_active");
  };

  const uniqueHotels = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      if (booking.hotel?.id) {
        map.set(booking.hotel.id, booking.hotel.name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [bookings]);

  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const isBookingRelevantToday = (booking) => {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const checkIn = booking.check_in ? new Date(booking.check_in) : null;
    const checkOut = booking.check_out ? new Date(booking.check_out) : null;

    const activeStatuses = [
      "pending",
      "confirmed",
      "checked_in",
      "checked_out",
      "cleaning",
    ];

    if (activeStatuses.includes(booking.status)) {
      return true;
    }

    if (booking.status === "completed" && checkOut) {
      return isSameDay(checkOut, now);
    }

    if (booking.status === "cancelled" && checkIn) {
      return isSameDay(checkIn, now);
    }

    if (checkIn && checkOut) {
      return checkIn <= todayEnd && checkOut >= todayStart;
    }

    if (checkIn) {
      return isSameDay(checkIn, now);
    }

    return false;
  };

  const filteredBookings = useMemo(() => {
    const searchActive = filters.search.trim().length > 0;

    return bookings.filter((booking) => {
      const searchText = filters.search.toLowerCase();

      const customerName = booking.user?.name || booking.guest_name || "";
      const customerPhone = booking.guest_phone || "";

      const matchesSearch =
        !filters.search ||
        booking.booking_code?.toLowerCase().includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        customerPhone.toLowerCase().includes(searchText) ||
        booking.hotel?.name?.toLowerCase().includes(searchText) ||
        booking.room?.type?.toLowerCase().includes(searchText) ||
        booking.room?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        !filters.status || booking.status === filters.status;

      const matchesBookingType =
        !filters.bookingType || booking.booking_type === filters.bookingType;

      const matchesHotel =
        !filters.hotelId ||
        String(booking.hotel?.id) === String(filters.hotelId);

      let matchesMonth = true;
      if (filters.month && booking.check_in) {
        const bookingDate = new Date(booking.check_in);
        const year = bookingDate.getFullYear();
        const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
        const bookingMonth = `${year}-${month}`;
        matchesMonth = bookingMonth === filters.month;
      }

      const matchesViewMode =
        searchActive || viewMode === "all"
          ? true
          : isBookingRelevantToday(booking);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBookingType &&
        matchesHotel &&
        matchesMonth &&
        matchesViewMode
      );
    });
  }, [bookings, filters, viewMode]);

  const todayVisibleCount = useMemo(() => {
    return bookings.filter((booking) => isBookingRelevantToday(booking)).length;
  }, [bookings]);

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
              Booking List
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola booking customer, approve kamar, input booking manual, dan proses operasional hotel.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">
                  Filter Booking
                </h2>
              </div>

              <button
                type="button"
                onClick={openManualModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
              >
                <Plus size={18} />
                Manual Booking
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <button
                type="button"
                onClick={() => setViewMode("today_active")}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                  viewMode === "today_active"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Layers3 size={18} />
                Aktif Hari Ini
              </button>

              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                  viewMode === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <History size={18} />
                Semua Booking
              </button>

              <div className="inline-flex items-center rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                Booking aktif / relevan hari ini: {todayVisibleCount}
              </div>

              {filters.search.trim() && (
                <div className="inline-flex items-center rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                  Search aktif: histori lama juga ikut dicari
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="relative xl:col-span-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari kode booking, nama tamu, hotel, tipe kamar"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cleaning">Cleaning</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.bookingType}
                onChange={(e) => handleFilterChange("bookingType", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                <option value="">Semua Jenis</option>
                <option value="transit">Transit</option>
                <option value="overnight">Overnight</option>
              </select>

              <select
                value={filters.hotelId}
                onChange={(e) => handleFilterChange("hotelId", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                <option value="">Semua Hotel</option>
                {uniqueHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Filter Bulan
                </label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => handleFilterChange("month", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
                >
                  <RotateCcw size={18} />
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data booking...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ClipboardList size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Tidak ada booking ditemukan
                </h3>
                <p className="text-gray-500 mt-2">
                  Coba ubah filter atau tunggu booking baru masuk.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredBookings.map((booking) => {
                  const customerName =
                    booking.user?.name || booking.guest_name || "Tamu manual";
                  const customerPhone = booking.guest_phone || null;
                  const customerEmail = booking.guest_email || null;
                  const sourceLabel =
                    booking.booking_source === "admin_manual"
                      ? "Manual Admin"
                      : booking.booking_source === "customer_app"
                      ? "App Customer"
                      : booking.booking_source || null;

                  const discountPercent = Number(booking.discount_percent || 0);
                  const originalPrice =
                    discountPercent > 0
                      ? Math.round(
                          Number(booking.total_price || 0) /
                            (1 - discountPercent / 100)
                        )
                      : Number(booking.total_price || 0);

                  const showCancelButton =
                    canEditBooking &&
                    ["confirmed", "checked_in"].includes(booking.status);

                  const showNotifyButton =
                    !!booking.guest_phone &&
                    ["pending", "confirmed", "checked_in"].includes(booking.status);

                  return (
                    <div
                      key={booking.id}
                      className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                              {booking.booking_code || `Booking #${booking.id}`}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusClass(
                                booking.payment_status
                              )}`}
                            >
                              {booking.payment_status || "unpaid"}
                            </span>

                            {sourceLabel && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700">
                                {sourceLabel}
                              </span>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                              <User size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Customer / Tamu</p>
                                <p className="font-semibold text-gray-800">
                                  {customerName}
                                </p>
                                {booking.creator && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Dibuat oleh: {booking.creator.name}
                                  </p>
                                )}
                                {booking.editor && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    Diedit oleh: {booking.editor.name}
                                  </p>
                                )}
                                {booking.refunder && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    Refund oleh: {booking.refunder.name}
                                  </p>
                                )}
                                {booking.canceller && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Cancel oleh: {booking.canceller.name}
                                  </p>
                                )}
                                {customerPhone && (
                                  <p className="text-gray-500 mt-1">
                                    {customerPhone}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Hotel size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Hotel</p>
                                <p className="font-semibold text-gray-800">
                                  {booking.hotel?.name || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <BedDouble size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Tipe Kamar</p>
                                <p className="font-semibold text-gray-800">
                                  {booking.room?.type || booking.room?.name || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CalendarDays size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Check In</p>
                                <p className="font-semibold text-gray-800">
                                  {formatDateTime(booking.check_in)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CalendarDays size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Check Out</p>
                                <p className="font-semibold text-gray-800">
                                  {formatDateTime(booking.check_out)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Wallet size={16} className="text-red-500 mt-0.5" />
                              <div>
                                <p className="text-gray-400">Total Harga</p>
                                <p className="font-semibold text-gray-800">
                                  {formatCurrency(booking.total_price)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {(customerEmail || customerPhone) && (
                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                              {customerPhone && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                  <Phone size={14} className="text-red-500" />
                                  {customerPhone}
                                </span>
                              )}

                              {customerEmail && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                  <Mail size={14} className="text-red-500" />
                                  {customerEmail}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-3 text-sm">
                            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                              Booking: {booking.booking_type}
                            </span>

                            {booking.duration_hours && (
                              <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                Durasi: {booking.duration_hours} jam
                              </span>
                            )}

                            {booking.roomUnit && (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                Unit Kamar: {booking.roomUnit.room_number}
                              </span>
                            )}
                          </div>

                          {discountPercent > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-700">
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                                  Discount
                                </p>
                                <p className="font-bold">{discountPercent}%</p>
                              </div>

                              <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-700">
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                                  Harga Awal
                                </p>
                                <p className="font-bold">
                                  {formatCurrency(originalPrice)}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-700">
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                                  Harga Setelah Discount
                                </p>
                                <p className="font-bold">
                                  {formatCurrency(booking.total_price)}
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.payment_status === "refunded" && (
                            <div className="mt-4 rounded-2xl bg-purple-50 border border-purple-100 px-4 py-3 text-sm text-purple-700">
                              <p>
                                <strong>Refund:</strong>{" "}
                                {formatCurrency(booking.refund_amount || 0)}
                              </p>
                              {booking.refund_reason && (
                                <p className="mt-1">
                                  <strong>Alasan Refund:</strong> {booking.refund_reason}
                                </p>
                              )}
                              {booking.refunded_at && (
                                <p className="mt-1">
                                  <strong>Waktu Refund:</strong>{" "}
                                  {formatDateTime(booking.refunded_at)}
                                </p>
                              )}
                            </div>
                          )}

                          {booking.cancel_reason && (
                            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                              <p>
                                <strong>Alasan Cancel:</strong> {booking.cancel_reason}
                              </p>
                              {booking.cancelled_at && (
                                <p className="mt-1">
                                  <strong>Waktu Cancel:</strong>{" "}
                                  {formatDateTime(booking.cancelled_at)}
                                </p>
                              )}
                            </div>
                          )}

                          {booking.admin_note && (
                            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                              <strong>Catatan Admin:</strong> {booking.admin_note}
                            </div>
                          )}

{["pending", "confirmed", "checked_in"].includes(booking.status) && (
  <div className="mt-4 rounded-2xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
    <strong>Informasi untuk Tamu:</strong>
    <p className="mt-1">
      Harap datang sesuai waktu booking yang telah dipilih.
    </p>
    <p>
      Jika dalam 30 menit setelah waktu check-in tidak ada konfirmasi atau kehadiran, booking dapat dibatalkan oleh pihak hotel.
    </p>
    <p>
      Jika mengalami kendala atau keterlambatan, silakan hubungi admin cabang melalui kontak resmi hotel.
    </p>

    {booking.hotel?.wa_admin && (
      <p className="mt-2 font-semibold text-blue-700">
        Kontak Admin Cabang: {booking.hotel.wa_admin}
      </p>
    )}
  </div>
)}
                          {booking.rejection_reason_customer && (
                            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                              <strong>Alasan ke customer:</strong>{" "}
                              {booking.rejection_reason_customer}
                            </div>
                          )}

                          {booking.rejection_reason_internal && (
                            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                              <strong>Catatan internal:</strong>{" "}
                              {booking.rejection_reason_internal}
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:w-auto flex lg:flex-col gap-3">
                          {showNotifyButton && (
                            <button
                              type="button"
                              onClick={() => handleNotifyWhatsApp(booking)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition"
                            >
                              <MessageCircle size={18} />
                              Notify WA
                            </button>
                          )}

                          {canEditBooking && (
                            <button
                              type="button"
                              onClick={() => handleEditClick(booking)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-white font-semibold hover:bg-yellow-600 transition"
                            >
                              <Pencil size={18} />
                              Edit
                            </button>
                          )}

                          {booking.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveClick(booking)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition"
                              >
                                <CircleCheck size={18} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectClick(booking)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                              >
                                <CircleX size={18} />
                                Reject
                              </button>
                            </>
                          ) : booking.status === "confirmed" &&
                            booking.payment_status !== "paid" &&
                            booking.payment_status !== "refunded" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(booking)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 transition"
                              >
                                <Wallet size={18} />
                                Mark Paid
                              </button>

                              {showCancelButton && (
                                <button
                                  type="button"
                                  onClick={() => openCancelModal(booking)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                                >
                                  <CircleX size={18} />
                                  Cancel
                                </button>
                              )}
                            </>
                          ) : booking.status === "confirmed" &&
                            booking.payment_status === "paid" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCheckIn(booking)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
                              >
                                <CheckCircle2 size={18} />
                                Check In
                              </button>

                              {canEditBooking && (
                                <button
                                  type="button"
                                  onClick={() => openRefundModal(booking)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700 transition"
                                >
                                  <Wallet size={18} />
                                  Refund
                                </button>
                              )}

                              {showCancelButton && (
                                <button
                                  type="button"
                                  onClick={() => openCancelModal(booking)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                                >
                                  <CircleX size={18} />
                                  Cancel
                                </button>
                              )}
                            </>
                          ) : booking.status === "checked_in" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCheckOut(booking)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition"
                              >
                                <CircleCheck size={18} />
                                Check Out
                              </button>

                              {showCancelButton && (
                                <button
                                  type="button"
                                  onClick={() => openCancelModal(booking)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                                >
                                  <CircleX size={18} />
                                  Cancel
                                </button>
                              )}
                            </>
                          ) : booking.status === "checked_out" ? (
                            <button
                              type="button"
                              onClick={() => handleStartCleaning(booking)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-white font-semibold hover:bg-orange-700 transition"
                            >
                              <RotateCcw size={18} />
                              Start Cleaning
                            </button>
                          ) : booking.status === "cleaning" ? (
                            <button
                              type="button"
                              onClick={() => handleFinishCleaning(booking)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700 transition"
                            >
                              <CircleCheck size={18} />
                              Finish Cleaning
                            </button>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold">
                              <CheckCircle2 size={18} />
                              Sudah Diproses
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Approve Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Pilih kamar fisik untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Kamar Fisik
                    </label>
                    <select
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                    >
                      <option value="">Pilih kamar fisik</option>
                      {roomUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Kamar {unit.room_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Admin (Opsional)
                    </label>
                    <textarea
                      placeholder="Contoh: Silakan check-in di resepsionis sebelum jam 20.00"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none"
                      rows={4}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeApproveModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-green-600 text-white rounded-2xl py-3 font-semibold hover:bg-green-700 transition disabled:opacity-70"
                      onClick={handleApprove}
                      disabled={approving}
                    >
                      {approving ? "Menyimpan..." : "Confirm Approve"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRejectBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Reject Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Isi alasan penolakan untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedRejectBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan untuk Customer
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Mohon maaf, kamar sedang penuh pada jadwal tersebut."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                      value={rejectReasonCustomer}
                      onChange={(e) => setRejectReasonCustomer(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Internal Admin (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Customer masuk blacklist internal."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                      value={rejectReasonInternal}
                      onChange={(e) => setRejectReasonInternal(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeRejectModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition disabled:opacity-70"
                      onClick={handleReject}
                      disabled={rejecting}
                    >
                      {rejecting ? "Menyimpan..." : "Confirm Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedEditBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Edit Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Edit data booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedEditBooking.booking_code}
                  </span>
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Tamu
                    </label>
                    <input
                      type="text"
                      name="guest_name"
                      value={editForm.guest_name}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Nama tamu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor HP
                    </label>
                    <input
                      type="text"
                      name="guest_phone"
                      value={editForm.guest_phone}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Nomor HP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={editForm.guest_email}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Email tamu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check In
                    </label>
                    <input
                      type="datetime-local"
                      name="check_in"
                      value={editForm.check_in}
                      onChange={handleEditChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kamar Fisik
                    </label>
                    <select
                      name="room_unit_id"
                      value={editForm.room_unit_id}
                      onChange={handleEditChange}
                      className={inputClass}
                    >
                      <option value="">Pilih kamar fisik</option>
                      {editRoomUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Kamar {unit.room_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Admin
                    </label>
                    <textarea
                      name="admin_note"
                      rows={4}
                      value={editForm.admin_note}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Catatan admin"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-5">
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                    onClick={closeEditModal}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    className="flex-1 bg-yellow-500 text-white rounded-2xl py-3 font-semibold hover:bg-yellow-600 transition disabled:opacity-70"
                    onClick={handleUpdateBooking}
                    disabled={editing}
                  >
                    {editing ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedRefundBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Refund Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Proses refund untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedRefundBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nominal Refund
                    </label>
                    <input
                      type="number"
                      name="refund_amount"
                      value={refundForm.refund_amount}
                      onChange={handleRefundChange}
                      className={inputClass}
                      placeholder="Masukkan nominal refund"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan Refund
                    </label>
                    <textarea
                      name="refund_reason"
                      rows={4}
                      value={refundForm.refund_reason}
                      onChange={handleRefundChange}
                      className={inputClass}
                      placeholder="Contoh: Pembatalan oleh pihak hotel / tamu komplain / double booking"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeRefundModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-purple-600 text-white rounded-2xl py-3 font-semibold hover:bg-purple-700 transition disabled:opacity-70"
                      onClick={handleRefundBooking}
                      disabled={refunding}
                    >
                      {refunding ? "Memproses..." : "Confirm Refund"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCancelBooking && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Cancel Booking
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Isi alasan pembatalan untuk booking{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedCancelBooking.booking_code}
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alasan Cancel
                    </label>
                    <textarea
                      name="cancel_reason"
                      rows={4}
                      value={cancelForm.cancel_reason}
                      onChange={handleCancelChange}
                      className={inputClass}
                      placeholder="Contoh: Tamu tidak memberikan kepastian kedatangan."
                    />
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Booking yang dicancel akan berubah status menjadi
                    <strong> cancelled</strong>.
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
                      onClick={closeCancelModal}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition disabled:opacity-70"
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                    >
                      {cancelling ? "Memproses..." : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showManualModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl p-6 w-full max-w-5xl shadow-xl my-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Manual Booking
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Input booking manual untuk resepsionis, walk-in, atau OTS.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeManualModal}
                    className="rounded-2xl bg-gray-200 px-4 py-2 text-gray-700 font-medium hover:bg-gray-300 transition"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Data Tamu
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Isi data tamu langsung tanpa harus memakai akun customer.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Tamu
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="guest_name"
                            value={manualForm.guest_name}
                            onChange={handleManualChange}
                            placeholder="Contoh: Budi Santoso"
                            className={`${inputClass} pl-12`}
                          />
                          <User
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nomor HP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="guest_phone"
                            value={manualForm.guest_phone}
                            onChange={handleManualChange}
                            placeholder="Contoh: 08123456789"
                            className={`${inputClass} pl-12`}
                          />
                          <Phone
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email (Opsional)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="guest_email"
                            value={manualForm.guest_email}
                            onChange={handleManualChange}
                            placeholder="Contoh: tamu@mail.com"
                            className={`${inputClass} pl-12`}
                          />
                          <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Pilih Hotel & Kamar
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hotel
                        </label>
                        <div className="relative">
                          <select
                            name="hotel_id"
                            value={manualForm.hotel_id}
                            onChange={handleManualChange}
                            className={`${inputClass} pl-12`}
                          >
                            <option value="">
                              {loadingHotels ? "Memuat hotel..." : "Pilih hotel"}
                            </option>
                            {hotels.map((hotel) => (
                              <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                              </option>
                            ))}
                          </select>
                          <Building2
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipe Kamar
                        </label>
                        <div className="relative">
                          <select
                            name="room_id"
                            value={manualForm.room_id}
                            onChange={handleManualChange}
                            className={`${inputClass} pl-12`}
                            disabled={!manualForm.hotel_id}
                          >
                            <option value="">
                              {loadingRooms
                                ? "Memuat tipe kamar..."
                                : !manualForm.hotel_id
                                ? "Pilih hotel dulu"
                                : "Pilih tipe kamar"}
                            </option>
                            {filteredRoomsForManual.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.name} {room.type ? `- ${room.type}` : ""}
                              </option>
                            ))}
                          </select>
                          <BedDouble
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Kamar Fisik
                        </label>
                        <div className="relative">
                          <select
                            name="room_unit_id"
                            value={manualForm.room_unit_id}
                            onChange={handleManualChange}
                            className={`${inputClass} pl-12`}
                            disabled={!manualForm.room_id}
                          >
                            <option value="">
                              {loadingManualUnits
                                ? "Memuat kamar fisik..."
                                : !manualForm.room_id
                                ? "Pilih tipe kamar dulu"
                                : "Pilih kamar fisik"}
                            </option>
                            {manualRoomUnits.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                Kamar {unit.room_number}
                              </option>
                            ))}
                          </select>
                          <DoorOpen
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Data Booking
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Jenis Booking
                        </label>
                        <select
                          name="booking_type"
                          value={manualForm.booking_type}
                          onChange={handleManualChange}
                          className={inputClass}
                        >
                          <option value="transit">Transit</option>
                          <option value="overnight">Overnight</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Check In
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            name="check_in"
                            value={manualForm.check_in}
                            onChange={handleManualChange}
                            className={`${inputClass} pl-12`}
                          />
                          <CalendarDays
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      {manualForm.booking_type === "transit" ? (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Durasi Transit
                          </label>
                          <div className="relative">
                            <select
                              name="duration_hours"
                              value={manualForm.duration_hours}
                              onChange={handleManualChange}
                              className={`${inputClass} pl-12`}
                            >
                              <option value="3">3 Jam</option>
                              <option value="6">6 Jam</option>
                              <option value="12">12 Jam</option>
                            </select>
                            <Clock3
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Jenis Menginap
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value="Per Malam"
                              readOnly
                              className={`${inputClass} pl-12`}
                            />
                            <MoonStar
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estimasi Harga
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formatCurrency(estimatedManualPrice)}
                            readOnly
                            className={`${inputClass} pl-12 font-semibold`}
                          />
                          <Wallet
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                          />
                        </div>
                      </div>

                      {canEditBooking && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Discount (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="manual_discount_percent"
                              min="0"
                              max="100"
                              value={manualForm.manual_discount_percent}
                              onChange={handleManualChange}
                              placeholder="Contoh: 20"
                              className={`${inputClass} pr-12`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                              %
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {canEditBooking && manualDiscountPercent > 0 && (
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                          <p className="text-sm text-amber-700 font-medium">
                            Potongan Discount
                          </p>
                          <p className="text-lg font-bold text-amber-800">
                            - {formatCurrency(manualDiscountAmount)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                          <p className="text-sm text-emerald-700 font-medium">
                            Total Setelah Discount
                          </p>
                          <p className="text-lg font-bold text-emerald-800">
                            {formatCurrency(finalManualPrice)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Catatan Admin
                      </h3>
                    </div>

                    <textarea
                      name="admin_note"
                      value={manualForm.admin_note}
                      onChange={handleManualChange}
                      rows={4}
                      placeholder="Contoh: Booking walk-in dari resepsionis, tamu datang langsung."
                      className={inputClass}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeManualModal}
                      className="rounded-2xl bg-gray-200 px-5 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveManualBooking}
                      disabled={savingManual}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-70"
                    >
                      <Save size={18} />
                      {savingManual ? "Menyimpan..." : "Simpan Booking Manual"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}