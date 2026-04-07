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
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers3,
  Settings,
  BellRing,
  UserCog,
  MonitorSmartphone,
  Wrench,
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

  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("admin_user") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const currentRole = (adminUser?.role || "").toLowerCase();
  const isIT = currentRole === "it";

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const requests = [
        api.get("/admin/hotels"),
        api.get("/admin/rooms"),
        api.get("/admin/bookings"),
      ];

      if (isIT) {
        requests.push(api.get("/admin/users/admin"));
        requests.push(api.get("/admin/users/customers"));
      }

      const responses = await Promise.all(requests);

      const hotelRes = responses[0];
      const roomRes = responses[1];
      const bookingRes = responses[2];
      const internalRes = responses[3];
      const customerRes = responses[4];

      const hotelData = Array.isArray(hotelRes?.data?.data)
        ? hotelRes.data.data
        : Array.isArray(hotelRes?.data)
        ? hotelRes.data
        : [];

      const roomData = Array.isArray(roomRes?.data?.data)
        ? roomRes.data.data
        : Array.isArray(roomRes?.data)
        ? roomRes.data
        : [];

      const bookingData = Array.isArray(bookingRes?.data?.data)
        ? bookingRes.data.data
        : Array.isArray(bookingRes?.data)
        ? bookingRes.data
        : [];

      const internalData = Array.isArray(internalRes?.data?.data)
        ? internalRes.data.data
        : Array.isArray(internalRes?.data)
        ? internalRes.data
        : [];

      const customerData = Array.isArray(customerRes?.data?.data)
        ? customerRes.data.data
        : Array.isArray(customerRes?.data)
        ? customerRes.data
        : [];

      setHotels(hotelData);
      setRooms(roomData);
      setBookings(bookingData);
      setInternalUsers(internalData);
      setCustomers(customerData);
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

  const internalRoleStats = useMemo(() => {
    const initial = {
      boss: 0,
      super_admin: 0,
      admin: 0,
      receptionist: 0,
      pengawas: 0,
      it: 0,
    };

    internalUsers.forEach((user) => {
      const role = (user.role || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(initial, role)) {
        initial[role] += 1;
      }
    });

    return initial;
  }, [internalUsers]);

  const hotelAktif = useMemo(() => {
    return hotels.filter((hotel) => Number(hotel.status) === 1).length;
  }, [hotels]);

  const roomAktif = useMemo(() => {
    return rooms.filter((room) => Number(room.status) === 1 || room.status === true)
      .length;
  }, [rooms]);

  const recentInternalUsers = useMemo(() => {
    return [...internalUsers]
      .sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [internalUsers]);

  if (isIT) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />

        <div className="flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.08),_transparent_20%),radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <Topbar />

          <div className="p-6 md:p-8">
            <div className="mb-8 overflow-hidden rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                    <Cpu size={14} />
                    IT ReadyRoom
                  </div>

                  <h1 className="text-3xl font-bold text-white md:text-4xl">
                    IT ReadyRoom Control Center
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                    Dashboard khusus tim IT untuk memantau sistem ReadyRoom,
                    akses internal, struktur data utama, dan persiapan fitur
                    broadcast internal ke seluruh role selain boss.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ITHeroBadge
                    icon={<ShieldCheck size={18} />}
                    title="Mode Sistem"
                    value="Aktif"
                  />
                  <ITHeroBadge
                    icon={<MonitorSmartphone size={18} />}
                    title="Akses IT"
                    value="Eksklusif"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ITStatCard
                icon={<UserCog size={22} />}
                title="User Internal"
                value={loading ? "..." : internalUsers.length}
                note="Termasuk admin, receptionist, pengawas, IT, boss"
              />
              <ITStatCard
                icon={<Users size={22} />}
                title="Customer Web"
                value={loading ? "..." : customers.length}
                note="Data customer terdaftar"
              />
              <ITStatCard
                icon={<Building2 size={22} />}
                title="Hotel Aktif"
                value={loading ? "..." : hotelAktif}
                note={`${hotels.length} total hotel tersimpan`}
              />
              <ITStatCard
                icon={<BedDouble size={22} />}
                title="Room Aktif"
                value={loading ? "..." : roomAktif}
                note={`${rooms.length} total data room`}
              />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      System Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Ringkasan struktur inti sistem ReadyRoom dari sisi IT.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/admin/users")}
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Kelola Users
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ITOverviewCard
                    icon={<Layers3 size={18} />}
                    title="Master Content"
                    desc="Kelola konten utama website, hero, promo, dan elemen visual customer-facing."
                    actionLabel="Buka Master Content"
                    onClick={() => navigate("/admin/master-content")}
                  />
                  <ITOverviewCard
                    icon={<Settings size={18} />}
                    title="System Settings"
                    desc="Area untuk pengaturan sistem internal, konfigurasi dasar, dan kebutuhan teknis lainnya."
                    actionLabel="Buka Settings"
                    onClick={() => navigate("/admin/settings")}
                  />
                  <ITOverviewCard
                    icon={<BellRing size={18} />}
                    title="Broadcast Center"
                    desc="Tempat khusus nanti untuk mengirim pesan internal ke semua role selain boss."
                    actionLabel="Coming Soon"
                    disabled
                  />
                  <ITOverviewCard
                    icon={<Wrench size={18} />}
                    title="System Tools"
                    desc="Pusat kontrol cepat untuk monitoring data inti dan akses modul penting ReadyRoom."
                    actionLabel="Lihat User Panel"
                    onClick={() => navigate("/admin/users")}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Distribusi Role Internal
                </h2>

                <div className="space-y-4">
                  <ITRoleRow label="Boss" value={loading ? "..." : internalRoleStats.boss} />
                  <ITRoleRow
                    label="Super Admin"
                    value={loading ? "..." : internalRoleStats.super_admin}
                  />
                  <ITRoleRow label="Admin" value={loading ? "..." : internalRoleStats.admin} />
                  <ITRoleRow
                    label="Receptionist"
                    value={loading ? "..." : internalRoleStats.receptionist}
                  />
                  <ITRoleRow
                    label="Pengawas"
                    value={loading ? "..." : internalRoleStats.pengawas}
                  />
                  <ITRoleRow label="IT" value={loading ? "..." : internalRoleStats.it} />
                </div>

                <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                  <p className="text-sm font-medium text-cyan-300">
                    Catatan Sistem
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Dashboard ini dipisah khusus untuk role IT agar area kerja
                    IT terasa berbeda tanpa mengganggu flow operasional booking
                    yang dipakai role lain.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Analitik Booking
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Tetap bisa mantau pergerakan booking dari sisi overview.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/admin/bookings")}
                    className="text-sm font-medium text-cyan-300 hover:underline"
                  >
                    Lihat Booking
                  </button>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analitikBooking}>
                      <defs>
                        <linearGradient
                          id="itBookingGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22d3ee"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22d3ee"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1e293b"
                      />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis allowDecimals={false} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(34,211,238,0.12)",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="booking"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        fill="url(#itBookingGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Snapshot Sistem
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ITMiniCard
                    title="Booking Hari Ini"
                    value={loading ? "..." : bookingHariIni}
                  />
                  <ITMiniCard
                    title="Booking Pending"
                    value={
                      loading
                        ? "..."
                        : bookings.filter((b) => b.status === "pending").length
                    }
                  />
                  <ITMiniCard
                    title="Check-in Hari Ini"
                    value={loading ? "..." : checkInHariIni}
                  />
                  <ITMiniCard
                    title="Check-out Hari Ini"
                    value={loading ? "..." : checkOutHariIni}
                  />
                  <ITMiniCard
                    title="Pemasukan Hari Ini"
                    value={loading ? "..." : formatRupiah(pemasukanHariIni)}
                  />
                  <ITMiniCard
                    title="Pemasukan Bulan Ini"
                    value={loading ? "..." : formatRupiah(pemasukanBulanIni)}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-5 border border-cyan-400/10">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white/10 p-3 text-cyan-300">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Broadcast Internal
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        Step berikutnya kita bisa lanjut bikin fitur broadcast
                        message dari IT ke semua role selain boss, dengan modal
                        atau banner yang tampil rapi di dashboard penerima.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    User Internal Terbaru
                  </h2>
                  <span className="text-sm text-slate-400">
                    Total: {internalUsers.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {recentInternalUsers.length > 0 ? (
                    recentInternalUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-4"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {user.name || "-"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {user.email || "-"}
                          </p>
                        </div>

                        <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          {user.role || "-"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Belum ada data user internal.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Quick Control
                  </h2>
                  <span className="text-sm text-slate-400">
                    Akses cepat modul utama
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ITQuickButton
                    label="Users"
                    onClick={() => navigate("/admin/users")}
                  />
                  <ITQuickButton
                    label="Master Content"
                    onClick={() => navigate("/admin/master-content")}
                  />
                  <ITQuickButton
                    label="Settings"
                    onClick={() => navigate("/admin/settings")}
                  />
                  <ITQuickButton
                    label="Rooms"
                    onClick={() => navigate("/admin/rooms")}
                  />
                  <ITQuickButton
                    label="Tambah Room"
                    onClick={() => navigate("/admin/rooms/add")}
                  />
                  <ITQuickButton
                    label="Tambah Hotel"
                    onClick={() => navigate("/admin/hotels/add")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

function ITHeroBadge({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-white/5 p-4 text-left backdrop-blur-sm">
      <div className="mb-3 inline-flex rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
        {icon}
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ITStatCard({ icon, title, value, note }) {
  return (
    <div className="rounded-[24px] border border-cyan-400/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          {icon}
        </div>
        <ArrowUpRight className="text-cyan-300/70" size={18} />
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{note}</p>
    </div>
  );
}

function ITOverviewCard({
  icon,
  title,
  desc,
  actionLabel,
  onClick,
  disabled = false,
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`mt-5 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
          disabled
            ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
            : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ITRoleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
        {value}
      </span>
    </div>
  );
}

function ITMiniCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
    </div>
  );
}

function ITQuickButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4 text-left font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
    >
      {label}
    </button>
  );
}