import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  Building2,
  BedDouble,
  DoorOpen,
  CalendarDays,
  Clock3,
  MoonStar,
  Save,
  User,
  Wallet,
} from "lucide-react";

export default function ManualBooking() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomUnits, setRoomUnits] = useState([]);

  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    hotel_id: "",
    room_id: "",
    room_unit_id: "",
    booking_type: "transit",
    duration_hours: "3",
    check_in: "",
    admin_note: "",
  });

  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (form.room_id) {
      fetchRoomUnits(form.room_id);
    } else {
      setRoomUnits([]);
      setForm((prev) => ({
        ...prev,
        room_unit_id: "",
      }));
    }
  }, [form.room_id]);

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
      toast.error("Gagal mengambil data hotel");
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
      toast.error("Gagal mengambil data tipe kamar");
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRoomUnits = async (roomId) => {
    try {
      setLoadingUnits(true);
      const res = await api.get(`/admin/room-units/${roomId}`);
      const unitData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const activeUnits = unitData.filter(
        (unit) => unit.status === 1 || unit.status === true
      );

      setRoomUnits(activeUnits);
    } catch (error) {
      console.error("GET ROOM UNITS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil kamar fisik");
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "hotel_id") {
        next.room_id = "";
        next.room_unit_id = "";
      }

      if (name === "booking_type" && value === "overnight") {
        next.duration_hours = "";
      }

      if (name === "booking_type" && value === "transit" && !prev.duration_hours) {
        next.duration_hours = "3";
      }

      if (name === "room_id") {
        next.room_unit_id = "";
      }

      return next;
    });
  };

  const filteredRooms = useMemo(() => {
    if (!form.hotel_id) return [];
    return rooms.filter(
      (room) => String(room.hotel_id) === String(form.hotel_id)
    );
  }, [rooms, form.hotel_id]);

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => String(room.id) === String(form.room_id));
  }, [rooms, form.room_id]);

  const estimatedPrice = useMemo(() => {
    if (!selectedRoom) return 0;

    if (form.booking_type === "transit") {
      if (String(form.duration_hours) === "3") return selectedRoom.price_transit_3h || 0;
      if (String(form.duration_hours) === "6") return selectedRoom.price_transit_6h || 0;
      if (String(form.duration_hours) === "12") return selectedRoom.price_transit_12h || 0;
      return 0;
    }

    return selectedRoom.price_per_night || 0;
  }, [selectedRoom, form.booking_type, form.duration_hours]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.user_id) return toast.error("User ID wajib diisi");
    if (!form.hotel_id) return toast.error("Pilih hotel");
    if (!form.room_id) return toast.error("Pilih tipe kamar");
    if (!form.room_unit_id) return toast.error("Pilih kamar fisik");
    if (!form.check_in) return toast.error("Check-in wajib diisi");
    if (form.booking_type === "transit" && !form.duration_hours) {
      return toast.error("Durasi transit wajib dipilih");
    }

    try {
      setSaving(true);

      const payload = {
        user_id: Number(form.user_id),
        hotel_id: Number(form.hotel_id),
        room_id: Number(form.room_id),
        room_unit_id: Number(form.room_unit_id),
        booking_type: form.booking_type,
        duration_hours:
          form.booking_type === "transit" ? Number(form.duration_hours) : null,
        check_in: form.check_in.replace("T", " ") + ":00",
        admin_note: form.admin_note || "",
      };

      await api.post("/admin/bookings/manual", payload);

      toast.success("Booking manual berhasil dibuat");

      setForm({
        user_id: "",
        hotel_id: "",
        room_id: "",
        room_unit_id: "",
        booking_type: "transit",
        duration_hours: "3",
        check_in: "",
        admin_note: "",
      });
      setRoomUnits([]);
    } catch (error) {
      console.error("MANUAL BOOKING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal membuat booking manual"
      );
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
              Manual Booking
            </h1>
            <p className="text-gray-500 mt-1">
              Input booking manual untuk walk-in, OTS, atau booking dari resepsionis/admin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DATA CUSTOMER */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Data Customer
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sementara gunakan User ID customer yang sudah ada di sistem.
                </p>
              </div>

              <div className="max-w-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User ID / Customer ID
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    placeholder="Contoh: 1"
                    className={`${inputClass} pl-12`}
                  />
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                  />
                </div>
              </div>
            </div>

            {/* DATA HOTEL & KAMAR */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Pilih Hotel & Kamar
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih hotel, tipe kamar, lalu kamar fisik yang tersedia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hotel
                  </label>
                  <div className="relative">
                    <select
                      name="hotel_id"
                      value={form.hotel_id}
                      onChange={handleChange}
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
                      value={form.room_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-12`}
                      disabled={!form.hotel_id}
                    >
                      <option value="">
                        {loadingRooms
                          ? "Memuat tipe kamar..."
                          : !form.hotel_id
                          ? "Pilih hotel dulu"
                          : "Pilih tipe kamar"}
                      </option>
                      {filteredRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.type || room.name}
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
                      value={form.room_unit_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-12`}
                      disabled={!form.room_id}
                    >
                      <option value="">
                        {loadingUnits
                          ? "Memuat kamar fisik..."
                          : !form.room_id
                          ? "Pilih tipe kamar dulu"
                          : "Pilih kamar fisik"}
                      </option>
                      {roomUnits.map((unit) => (
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

            {/* DATA BOOKING */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Data Booking
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih jenis booking, jam check-in, dan durasi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Booking
                  </label>
                  <select
                    name="booking_type"
                    value={form.booking_type}
                    onChange={handleChange}
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
                      value={form.check_in}
                      onChange={handleChange}
                      className={`${inputClass} pl-12`}
                    />
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>

                {form.booking_type === "transit" ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durasi Transit
                    </label>
                    <div className="relative">
                      <select
                        name="duration_hours"
                        value={form.duration_hours}
                        onChange={handleChange}
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
                      value={formatCurrency(estimatedPrice)}
                      readOnly
                      className={`${inputClass} pl-12 font-semibold`}
                    />
                    <Wallet
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CATATAN */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Catatan Admin
                </h2>
              </div>

              <textarea
                name="admin_note"
                value={form.admin_note}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: Booking walk-in dari resepsionis, tamu datang langsung."
                className={inputClass}
              />
            </div>

            {/* BUTTON */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-red-700 disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Booking Manual"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}