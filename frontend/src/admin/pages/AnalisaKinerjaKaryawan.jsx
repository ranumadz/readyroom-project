import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Medal,
  RefreshCcw,
  Search,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";

export default function AnalisaKinerjaKaryawan() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    startDate: getFirstDayOfCurrentMonth(),
    endDate: getTodayDate(),
    hotelId: "",
    userId: "",
    role: "",
    search: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [bookingRes, userRes, hotelRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/users/admin"),
        api.get("/admin/hotels"),
      ]);

      setBookings(extractArray(bookingRes.data));
      setUsers(extractArray(userRes.data));
      setHotels(extractArray(hotelRes.data));
    } catch (error) {
      console.error(
        "GET ANALISA KINERJA ERROR:",
        error.response?.data || error
      );
      toast.error("Gagal mengambil data analisa kinerja");
    } finally {
      setLoading(false);
    }
  };

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      map.set(Number(user.id), user);
    });
    return map;
  }, [users]);

  const hotelMap = useMemo(() => {
    const map = new Map();
    hotels.forEach((hotel) => {
      map.set(Number(hotel.id), hotel);
    });
    return map;
  }, [hotels]);

  const roleOptions = useMemo(() => {
    return users
      .map((user) => user.role)
      .filter(Boolean)
      .filter((role, index, arr) => arr.indexOf(role) === index);
  }, [users]);

  const cleaningBookings = useMemo(() => {
    return bookings.filter((booking) => {
      return (
        booking?.cleaning_started_by ||
        booking?.cleaning_finished_by ||
        booking?.cleaning_started_at ||
        booking?.cleaning_finished_at ||
        booking?.status === "cleaning"
      );
    });
  }, [bookings]);

  const filteredCleaningBookings = useMemo(() => {
    return cleaningBookings.filter((booking) => {
      const actionDate =
        booking.cleaning_finished_at ||
        booking.cleaning_started_at ||
        booking.updated_at ||
        booking.created_at;

      const dateMatch = isDateInRange(
        actionDate,
        filters.startDate,
        filters.endDate
      );

      const hotelId = getBookingHotelId(booking);
      const hotelMatch =
        !filters.hotelId || String(hotelId) === String(filters.hotelId);

      const finishedBy = Number(booking.cleaning_finished_by || 0);
      const startedBy = Number(booking.cleaning_started_by || 0);

      const userMatch =
        !filters.userId ||
        Number(filters.userId) === finishedBy ||
        Number(filters.userId) === startedBy;

      const roleMatch = (() => {
        if (!filters.role) return true;

        const finishedUser = userMap.get(finishedBy);
        const startedUser = userMap.get(startedBy);

        return (
          finishedUser?.role === filters.role ||
          startedUser?.role === filters.role
        );
      })();

      return dateMatch && hotelMatch && userMatch && roleMatch;
    });
  }, [cleaningBookings, filters, userMap]);

  const employeeStats = useMemo(() => {
    const statsMap = new Map();

    const ensureEmployee = (userId) => {
      const id = Number(userId || 0);
      if (!id) return null;

      const user = userMap.get(id);

      if (!statsMap.has(id)) {
        statsMap.set(id, {
          id,
          name: user?.name || `User #${id}`,
          role: user?.role || "-",
          email: user?.email || "-",
          phone: user?.phone || "-",
          startedCount: 0,
          finishedCount: 0,
          inProgressCount: 0,
          overEstimateCount: 0,
          totalDurationMinutes: 0,
          durationSamples: 0,
          hotels: new Map(),
          latestActivities: [],
        });
      }

      return statsMap.get(id);
    };

    filteredCleaningBookings.forEach((booking) => {
      const startedBy = Number(booking.cleaning_started_by || 0);
      const finishedBy = Number(booking.cleaning_finished_by || 0);
      const hotelId = Number(getBookingHotelId(booking) || 0);
      const hotel = hotelMap.get(hotelId) || booking.hotel || null;
      const hotelName = hotel?.name || "-";

      if (startedBy) {
        const startedEmployee = ensureEmployee(startedBy);

        if (startedEmployee) {
          startedEmployee.startedCount += 1;

          if (booking.status === "cleaning") {
            startedEmployee.inProgressCount += 1;
          }

          if (hotelId) {
            startedEmployee.hotels.set(hotelId, hotelName);
          }

          startedEmployee.latestActivities.push({
            type: "Mulai Cleaning",
            room: getBookingRoomUnit(booking),
            hotel: hotelName,
            date: booking.cleaning_started_at,
          });
        }
      }

      if (finishedBy) {
        const finishedEmployee = ensureEmployee(finishedBy);

        if (finishedEmployee) {
          finishedEmployee.finishedCount += 1;

          if (hotelId) {
            finishedEmployee.hotels.set(hotelId, hotelName);
          }

          const duration = getCleaningDurationMinutes(booking);

          if (duration !== null) {
            finishedEmployee.totalDurationMinutes += duration;
            finishedEmployee.durationSamples += 1;

            const estimation = Number(booking.cleaning_estimation_minutes || 15);
            if (duration > estimation) {
              finishedEmployee.overEstimateCount += 1;
            }
          }

          finishedEmployee.latestActivities.push({
            type: "Selesai Cleaning",
            room: getBookingRoomUnit(booking),
            hotel: hotelName,
            date: booking.cleaning_finished_at,
          });
        }
      }
    });

    return Array.from(statsMap.values())
      .map((employee) => {
        const averageDuration =
          employee.durationSamples > 0
            ? Math.round(employee.totalDurationMinutes / employee.durationSamples)
            : 0;

        return {
          ...employee,
          averageDuration,
          hotelNames: Array.from(employee.hotels.values()),
          latestActivities: employee.latestActivities
            .filter((item) => item.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3),
        };
      })
      .filter((employee) => {
        const keyword = filters.search.trim().toLowerCase();

        if (!keyword) return true;

        const hotelText = employee.hotelNames.join(" ").toLowerCase();

        return (
          employee.name.toLowerCase().includes(keyword) ||
          employee.role.toLowerCase().includes(keyword) ||
          hotelText.includes(keyword)
        );
      })
      .sort((a, b) => {
        if (b.finishedCount !== a.finishedCount) {
          return b.finishedCount - a.finishedCount;
        }

        if (b.startedCount !== a.startedCount) {
          return b.startedCount - a.startedCount;
        }

        return a.averageDuration - b.averageDuration;
      });
  }, [filteredCleaningBookings, userMap, hotelMap, filters.search]);

  const summary = useMemo(() => {
    const totalFinished = employeeStats.reduce(
      (sum, employee) => sum + employee.finishedCount,
      0
    );

    const totalStarted = employeeStats.reduce(
      (sum, employee) => sum + employee.startedCount,
      0
    );

    const totalInProgress = employeeStats.reduce(
      (sum, employee) => sum + employee.inProgressCount,
      0
    );

    const totalOverEstimate = employeeStats.reduce(
      (sum, employee) => sum + employee.overEstimateCount,
      0
    );

    const totalDuration = employeeStats.reduce(
      (sum, employee) => sum + employee.totalDurationMinutes,
      0
    );

    const durationSamples = employeeStats.reduce(
      (sum, employee) => sum + employee.durationSamples,
      0
    );

    const averageDuration =
      durationSamples > 0 ? Math.round(totalDuration / durationSamples) : 0;

    const topEmployee = employeeStats[0] || null;

    return {
      totalEmployee: employeeStats.length,
      totalFinished,
      totalStarted,
      totalInProgress,
      totalOverEstimate,
      averageDuration,
      topEmployee,
    };
  }, [employeeStats]);

  const maxFinished = Math.max(
    ...employeeStats.map((employee) => employee.finishedCount),
    1
  );

  return (
    <div className="min-h-screen bg-slate-100 lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden h-screen shrink-0 overflow-y-auto overflow-x-hidden bg-slate-950 lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden">
        <div className="hidden lg:block">
          <Topbar />
        </div>

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-24 pt-4 sm:px-5 lg:px-8 lg:pb-8 lg:pt-6">
          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <div className="relative p-5 md:p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-100 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
                    <BarChart3 size={14} />
                    ReadyRoom Performance
                  </div>

                  <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    Analisa Kinerja Karyawan
                  </h1>

                  
                </div>

                <button
                  type="button"
                  onClick={fetchData}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  <RefreshCcw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh Data
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              icon={Users}
              label="Karyawan Aktif"
              value={summary.totalEmployee}
              desc="Terlibat cleaning"
              tone="sky"
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Cleaning Selesai"
              value={summary.totalFinished}
              desc="Kamar selesai"
              tone="emerald"
            />
            <SummaryCard
              icon={Activity}
              label="Mulai Cleaning"
              value={summary.totalStarted}
              desc="Aksi mulai"
              tone="slate"
            />
            <SummaryCard
              icon={Timer}
              label="Rata-rata Durasi"
              value={formatMinutes(summary.averageDuration)}
              desc="Dari data selesai"
              tone="violet"
            />
            <SummaryCard
              icon={Clock3}
              label="Lewat Estimasi"
              value={summary.totalOverEstimate}
              desc="Perlu dipantau"
              tone="amber"
            />
          </section>

          {summary.topEmployee && (
            <section className="mt-4 rounded-[28px] border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Medal size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                      Kinerja Teratas
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      {summary.topEmployee.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getRoleLabel(summary.topEmployee.role)} •{" "}
                      {summary.topEmployee.finishedCount} cleaning selesai
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-amber-100">
                  Rata-rata durasi:{" "}
                  <span className="font-black text-slate-950">
                    {formatMinutes(summary.topEmployee.averageDuration)}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="mt-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div className="relative xl:col-span-2">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Cari nama, role, cabang..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <FilterDateInput
                label="Dari"
                value={filters.startDate}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, startDate: value }))
                }
              />

              <FilterDateInput
                label="Sampai"
                value={filters.endDate}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, endDate: value }))
                }
              />

              <select
                value={filters.hotelId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, hotelId: e.target.value }))
                }
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="">Semua Cabang</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, role: e.target.value }))
                }
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="">Semua Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="mt-4">
            {loading ? (
              <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <Loader2 className="mx-auto mb-3 animate-spin text-red-600" />
                <p className="text-sm font-bold text-slate-600">
                  Memuat analisa kinerja...
                </p>
              </div>
            ) : employeeStats.length === 0 ? (
              <EmptyPanel />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {employeeStats.map((employee, index) => {
                  const width = Math.max(
                    8,
                    Math.round((employee.finishedCount / maxFinished) * 100)
                  );

                  return (
                    <article
                      key={employee.id}
                      className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                      <div className="p-4 md:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                              <UserCheck size={22} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-black text-slate-950">
                                  {employee.name}
                                </h3>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">
                                  #{index + 1}
                                </span>
                              </div>

                              <p className="mt-1 text-sm font-bold text-slate-600">
                                {getRoleLabel(employee.role)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-100">
                            <p className="text-xl font-black text-emerald-700">
                              {employee.finishedCount}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                              Selesai
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                          <MiniMetric
                            label="Mulai"
                            value={employee.startedCount}
                          />
                          <MiniMetric
                            label="Selesai"
                            value={employee.finishedCount}
                          />
                          <MiniMetric
                            label="Proses"
                            value={employee.inProgressCount}
                          />
                          <MiniMetric
                            label="Rata-rata"
                            value={formatMinutes(employee.averageDuration)}
                          />
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                              Kontribusi Cleaning
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              {employee.finishedCount} / {maxFinished}
                            </p>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-100">
                          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                            <Building2 size={14} />
                            Cabang Terlibat
                          </div>

                          {employee.hotelNames.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {employee.hotelNames.slice(0, 5).map((hotel) => (
                                <span
                                  key={hotel}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                                >
                                  {hotel}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-slate-500">
                              Belum ada cabang tercatat
                            </p>
                          )}
                        </div>

                        {employee.latestActivities.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                              Aktivitas Terakhir
                            </p>

                            <div className="space-y-2">
                              {employee.latestActivities.map((activity, idx) => (
                                <div
                                  key={`${activity.type}-${idx}`}
                                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-slate-900">
                                      {activity.type} • Kamar {activity.room}
                                    </p>
                                    <p className="truncate text-xs font-semibold text-slate-600">
                                      {activity.hotel}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-xs font-bold text-slate-500">
                                    {formatShortDateTime(activity.date)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, desc, tone = "slate" }) {
  const toneClass = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            toneClass[tone] || toneClass.slate
          }`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-black text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function FilterDateInput({ label, value, onChange }) {
  return (
    <div className="relative">
      <CalendarDays
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
      />
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
        <BarChart3 size={30} />
      </div>

      <h3 className="text-lg font-black text-slate-950">
        Belum ada data kinerja
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-600">
        Data akan muncul setelah ada aktivitas mulai cleaning atau selesai
        cleaning pada periode yang dipilih.
      </p>
    </div>
  );
}

function extractArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.hotels)) return payload.hotels;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getBookingHotelId(booking) {
  return String(booking?.hotel?.id || booking?.hotel_id || "");
}

function getBookingRoomUnit(booking) {
  return (
    booking?.roomUnit?.room_number ||
    booking?.room_unit?.room_number ||
    "Belum di-assign"
  );
}

function getCleaningDurationMinutes(booking) {
  if (!booking.cleaning_started_at || !booking.cleaning_finished_at) {
    return null;
  }

  const start = new Date(booking.cleaning_started_at);
  const finish = new Date(booking.cleaning_finished_at);

  if (Number.isNaN(start.getTime()) || Number.isNaN(finish.getTime())) {
    return null;
  }

  const diff = Math.round((finish.getTime() - start.getTime()) / 60000);

  if (diff < 0) return null;

  return diff;
}

function isDateInRange(value, startDate, endDate) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;

  return true;
}

function formatMinutes(minutes) {
  const value = Number(minutes || 0);

  if (!value) return "0 mnt";

  if (value < 60) {
    return `${value} mnt`;
  }

  const hours = Math.floor(value / 60);
  const rest = value % 60;

  if (!rest) {
    return `${hours} jam`;
  }

  return `${hours}j ${rest}m`;
}

function formatShortDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayDate() {
  const date = new Date();
  return toInputDate(date);
}

function getFirstDayOfCurrentMonth() {
  const date = new Date();
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRoleLabel(role) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "receptionist":
      return "Receptionist";
    case "pengawas":
      return "Pengawas";
    case "housekeeping":
      return "Housekeeping";
    case "it":
      return "IT";
    case "boss":
      return "Boss";
    case "admin":
      return "Admin";
    default:
      return role || "-";
  }
}
