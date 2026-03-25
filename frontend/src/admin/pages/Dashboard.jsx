import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Building2,
  Users,
  CalendarCheck,
  ArrowUpRight,
  Wallet,
  BedDouble,
  CheckCircle2,
  Hotel,
  ClipboardList,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [hotelRes, roomRes, bookingRes] = await Promise.all([
        api.get("/admin/hotels"),
        api.get("/admin/rooms"),
        api.get("/admin/bookings"),
      ]);

      const hotelData = Array.isArray(hotelRes.data?.data)
        ? hotelRes.data.data
        : Array.isArray(hotelRes.data)
        ? hotelRes.data
        : [];

      const roomData = Array.isArray(roomRes.data?.data)
        ? roomRes.data.data
        : Array.isArray(roomRes.data)
        ? roomRes.data
        : [];

      const bookingData = Array.isArray(bookingRes.data?.data)
        ? bookingRes.data.data
        : Array.isArray(bookingRes.data)
        ? bookingRes.data
        : [];

      setHotels(hotelData);
      setRooms(roomData);
      setBookings(bookingData);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const hariIni = new Date();

  const isHariSama = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);

    return (
      date.getFullYear() === hariIni.getFullYear() &&
      date.getMonth() === hariIni.getMonth() &&
      date.getDate() === hariIni.getDate()
    );
  };

  const isBulanSama = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);

    return (
      date.getFullYear() === hariIni.getFullYear() &&
      date.getMonth() === hariIni.getMonth()
    );
  };

  const totalBooking = bookings.length;

  const bookingHariIni = useMemo(() => {
    return bookings.filter((booking) => isHariSama(booking.check_in)).length;
  }, [bookings]);

  const checkInHariIni = useMemo(() => {
    return bookings.filter(
      (booking) => booking.status === "checked_in" || isHariSama(booking.check_in)
    ).length;
  }, [bookings]);

  const checkOutHariIni = useMemo(() => {
    return bookings.filter((booking) => isHariSama(booking.check_out)).length;
  }, [bookings]);

  const kamarTersedia = useMemo(() => {
    return rooms.reduce((total, room) => {
      return total + Number(room.available_rooms || 0);
    }, 0);
  }, [rooms]);

  const totalStokKamar = useMemo(() => {
    return rooms.reduce((total, room) => {
      return total + Number(room.total_rooms || 0);
    }, 0);
  }, [rooms]);

  const kamarTerpakai = useMemo(() => {
    return bookings.filter((booking) =>
      ["confirmed", "checked_in", "checked_out", "cleaning"].includes(
        booking.status
      )
    ).length;
  }, [bookings]);

  const tingkatHunian = useMemo(() => {
    if (!totalStokKamar) return 0;
    return Math.min(100, Math.round((kamarTerpakai / totalStokKamar) * 100));
  }, [kamarTerpakai, totalStokKamar]);

  const pemasukanHariIni = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.payment_status === "paid" && isHariSama(booking.check_in)
      )
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const pemasukanBulanIni = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.payment_status === "paid" && isBulanSama(booking.check_in)
      )
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const totalPemasukanDibayar = useMemo(() => {
    return bookings
      .filter((booking) => booking.payment_status === "paid")
      .reduce((total, booking) => total + Number(booking.total_price || 0), 0);
  }, [bookings]);

  const customerAktif = useMemo(() => {
    const unique = new Set();

    bookings.forEach((booking) => {
      if (booking.user?.id) {
        unique.add(`user-${booking.user.id}`);
      } else if (booking.guest_phone) {
        unique.add(`phone-${booking.guest_phone}`);
      } else if (booking.guest_email) {
        unique.add(`email-${booking.guest_email}`);
      } else if (booking.guest_name) {
        unique.add(`name-${booking.guest_name}`);
      }
    });

    return unique.size;
  }, [bookings]);

  const analitikBooking = useMemo(() => {
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(hariIni.getDate() - i);

      const jumlahPerHari = bookings.filter((booking) => {
        if (!booking.check_in) return false;
        const bookingDate = new Date(booking.check_in);

        return (
          bookingDate.getFullYear() === targetDate.getFullYear() &&
          bookingDate.getMonth() === targetDate.getMonth() &&
          bookingDate.getDate() === targetDate.getDate()
        );
      }).length;

      result.push({
        name: namaHari[targetDate.getDay()],
        booking: jumlahPerHari,
      });
    }

    return result;
  }, [bookings]);

  const bookingTerbaru = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const aDate = new Date(a.created_at || a.check_in || 0).getTime();
        const bDate = new Date(b.created_at || b.check_in || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [bookings]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusBookingClass = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "checked_in":
        return "text-green-600 bg-green-50";
      case "checked_out":
        return "text-slate-600 bg-slate-100";
      case "cleaning":
        return "text-orange-600 bg-orange-50";
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Ringkasan sistem ReadyRoom dengan data real dari backend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Building2 size={22} />}
              iconWrap="bg-red-100 text-red-600"
              title="Total Hotel"
              value={loading ? "..." : hotels.length}
              note="Data hotel dari backend"
            />

            <StatCard
              icon={<BedDouble size={22} />}
              iconWrap="bg-blue-100 text-blue-600"
              title="Total Kamar"
              value={loading ? "..." : rooms.length}
              note="Data tipe kamar dari backend"
            />

            <StatCard
              icon={<CalendarCheck size={22} />}
              iconWrap="bg-purple-100 text-purple-600"
              title="Total Booking"
              value={loading ? "..." : totalBooking}
              note={`${bookingHariIni} booking check-in hari ini`}
            />

            <StatCard
              icon={<Users size={22} />}
              iconWrap="bg-emerald-100 text-emerald-600"
              title="Customer Aktif"
              value={loading ? "..." : customerAktif}
              note="Dihitung dari data booking"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Analitik Booking
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pergerakan booking 7 hari terakhir
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/bookings")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Lihat Booking
                </button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analitikBooking}>
                    <defs>
                      <linearGradient
                        id="bookingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#dc2626"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="booking"
                      stroke="#dc2626"
                      strokeWidth={3}
                      fill="url(#bookingGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ringkasan Cepat
              </h2>

              <div className="space-y-4">
                <OverviewCard
                  title="Check-in Hari Ini"
                  value={loading ? "..." : checkInHariIni}
                />
                <OverviewCard
                  title="Check-out Hari Ini"
                  value={loading ? "..." : checkOutHariIni}
                />
                <OverviewCard
                  title="Kamar Tersedia"
                  value={loading ? "..." : kamarTersedia}
                />
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-sm text-red-500">Tingkat Hunian</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">
                    {loading ? "..." : `${tingkatHunian}%`}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Pemasukan Hari ini"
              value={loading ? "..." : formatRupiah(pemasukanHariIni)}
            />

            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Pemasukan Bulan Ini"
              value={loading ? "..." : formatRupiah(pemasukanBulanIni)}
            />

            <MiniSummaryCard
              icon={<Wallet size={18} />}
              title="Total Pemasukan Dibayar"
              value={loading ? "..." : formatRupiah(totalPemasukanDibayar)}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <MiniSummaryCard
              icon={<CheckCircle2 size={18} />}
              title="Booking Aktif"
              value={
                loading
                  ? "..."
                  : bookings.filter((b) =>
                      ["confirmed", "checked_in", "checked_out", "cleaning"].includes(
                        b.status
                      )
                    ).length
              }
            />
            <MiniSummaryCard
              icon={<Hotel size={18} />}
              title="Stok Kamar"
              value={loading ? "..." : totalStokKamar}
            />
            <MiniSummaryCard
              icon={<ClipboardList size={18} />}
              title="Booking Pending"
              value={
                loading
                  ? "..."
                  : bookings.filter((b) => b.status === "pending").length
              }
            />
            <MiniSummaryCard
              icon={<CalendarCheck size={18} />}
              title="Booking Hari Ini"
              value={loading ? "..." : bookingHariIni}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Booking Terbaru
                </h2>
                <button
                  onClick={() => navigate("/admin/bookings")}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-4">
                {bookingTerbaru.length > 0 ? (
                  bookingTerbaru.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.booking_code || `Booking #${booking.id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.hotel?.name || "-"} •{" "}
                          {booking.user?.name || booking.guest_name || "Tamu"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBookingClass(
                          booking.status
                        )}`}
                      >
                        {booking.status || "-"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada booking terbaru.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Aksi Cepat
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  label="Tambah Hotel"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => navigate("/admin/hotels/add")}
                />

                <QuickActionButton
                  label="Tambah Kamar"
                  className="bg-gray-900 text-white hover:bg-black"
                  onClick={() => navigate("/admin/rooms/add")}
                />

                <QuickActionButton
                  label="Kelola Booking"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => navigate("/admin/bookings")}
                />

                <QuickActionButton
                  label="Kalender Booking"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => navigate("/admin/bookings/calendar")}
                />
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BedDouble size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      Fokus Operasional Hari Ini
                    </h3>
                    <p className="text-sm text-red-100 mt-1">
                      Pantau booking aktif, pembayaran, check-in, check-out, dan
                      cleaning langsung dari dashboard dan booking list.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Hotel
              </h2>
              <span className="text-sm text-gray-500">
                Total: {hotels.length}
              </span>
            </div>

            {hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.slice(0, 6).map((hotel) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{hotel.name}</p>
                      <p className="text-sm text-gray-500">
                        {hotel.area} • {hotel.city?.name}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        hotel.status ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {hotel.status ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data hotel.</p>
            )}
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Kamar
              </h2>
              <span className="text-sm text-gray-500">
                Total: {rooms.length}
              </span>
            </div>

            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.slice(0, 6).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{room.name}</p>
                      <p className="text-sm text-gray-500">
                        {room.type} • {room.hotel?.name}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {formatRupiah(room.price_per_night)} / malam
                      </p>
                    </div>

                    <span className="text-sm font-medium text-blue-600">
                      Kapasitas: {room.capacity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data kamar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconWrap, title, value, note }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconWrap}`}>{icon}</div>
        <ArrowUpRight className="text-gray-400" size={18} />
      </div>

      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-green-500 text-sm mt-2">{note}</p>
    </div>
  );
}

function OverviewCard({ title, value }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  );
}

function MiniSummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>

      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function QuickActionButton({ label, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl transition font-medium ${className}`}
    >
      {label}
    </button>
  );
}     