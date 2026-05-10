import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";

export default function Housekeeping() {
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [accountHotels, setAccountHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [confirmAction, setConfirmAction] = useState({
    open: false,
    type: null,
    booking: null,
  });

  const [filters, setFilters] = useState({
    hotelId: "",
    search: "",
    status: "all",
  });

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
  const currentRole = String(adminUser?.role || "").toLowerCase();

  const canAccessAllHotels = ["boss", "super_admin", "pengawas"].includes(
    currentRole
  );

  useEffect(() => {
    fetchLoggedInUserHotels();
    fetchBookings();
    fetchHotels();

    const intervalId = window.setInterval(() => {
      fetchBookings(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const fetchLoggedInUserHotels = async () => {
    try {
      if (!adminUser?.id) return;

      if (Array.isArray(adminUser?.hotels) && adminUser.hotels.length > 0) {
        setAccountHotels(adminUser.hotels);
        return;
      }

      const res = await api.get("/admin/users/admin");

      const internalData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const currentUserData = internalData.find(
        (user) => Number(user.id) === Number(adminUser.id)
      );

      const currentUserHotels = Array.isArray(currentUserData?.hotels)
        ? currentUserData.hotels
        : [];

      setAccountHotels(currentUserHotels);

      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          ...adminUser,
          hotels: currentUserHotels,
        })
      );
    } catch (error) {
      console.error(
        "GET LOGGED IN USER HOTELS ERROR:",
        error.response?.data || error
      );
    }
  };

  const fetchBookings = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const res = await api.get("/admin/bookings", {
        params: {
          admin_user_id: adminUser?.id || null,
          current_user_id: adminUser?.id || null,
        },
      });

      const bookingData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setBookings(bookingData);
    } catch (error) {
      console.error(
        "GET HOUSEKEEPING BOOKINGS ERROR:",
        error.response?.data || error
      );
      toast.error("Gagal mengambil data housekeeping");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
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
    }
  };

  const getBookingHotelId = (booking) => {
    return String(booking?.hotel?.id || booking?.hotel_id || "");
  };

  const getBookingCustomerName = (booking) => {
    return booking?.user?.name || booking?.guest_name || "Tamu";
  };

  const getBookingRoomName = (booking) => {
    return booking?.room?.type || booking?.room?.name || "-";
  };

  const getBookingRoomUnit = (booking) => {
    return (
      booking?.roomUnit?.room_number ||
      booking?.room_unit?.room_number ||
      "Belum di-assign"
    );
  };

  const getCleaningStatusMeta = (booking) => {
    if (booking?.status === "checked_out") {
      return {
        title: "Perlu dibersihkan",
        subtitle: "Kamar sudah kosong dan siap ditangani.",
        buttonText: "Tangani Cleaning",
        badgeText: "Perlu Bersih",
        accent: "from-amber-400 to-orange-500",
        badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        noticeClass: "bg-amber-50 text-amber-900 ring-1 ring-amber-100",
        buttonClass: "bg-slate-950 text-white shadow-slate-900/15",
      };
    }

    if (booking?.status === "cleaning") {
      return {
        title: "Sedang ditangani",
        subtitle: "Kamar sedang dalam proses cleaning.",
        buttonText: "Tandai Selesai",
        badgeText: "Diproses",
        accent: "from-sky-400 to-cyan-500",
        badgeClass: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
        noticeClass: "bg-sky-50 text-sky-900 ring-1 ring-sky-100",
        buttonClass: "bg-emerald-600 text-white shadow-emerald-600/20",
      };
    }

    return {
      title: "Tidak aktif",
      subtitle: "-",
      buttonText: "-",
      badgeText: "Tidak Aktif",
      accent: "from-slate-400 to-slate-500",
      badgeClass: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
      noticeClass: "bg-slate-50 text-slate-900 ring-1 ring-slate-100",
      buttonClass: "bg-slate-950 text-white",
    };
  };

  const housekeepingBookings = useMemo(() => {
    return bookings.filter((booking) =>
      ["checked_out", "cleaning"].includes(booking?.status)
    );
  }, [bookings]);

  const accessibleHotelIds = useMemo(() => {
    if (canAccessAllHotels) {
      return hotels.map((hotel) => String(hotel.id));
    }

    const storedUserHotels = Array.isArray(adminUser?.hotels)
      ? adminUser.hotels
      : [];

    const selectedUserHotels =
      accountHotels.length > 0 ? accountHotels : storedUserHotels;

    return selectedUserHotels
      .map((hotel) => String(hotel?.id))
      .filter(Boolean);
  }, [hotels, accountHotels, adminUser, canAccessAllHotels]);

  const accessibleHotels = useMemo(() => {
    if (canAccessAllHotels) return hotels;

    if (accessibleHotelIds.length === 0) return [];

    return hotels.filter((hotel) =>
      accessibleHotelIds.includes(String(hotel.id))
    );
  }, [hotels, accessibleHotelIds, canAccessAllHotels]);

  const branchRestrictedHousekeepingBookings = useMemo(() => {
    if (canAccessAllHotels) return housekeepingBookings;

    if (accessibleHotelIds.length === 0) return [];

    return housekeepingBookings.filter((booking) =>
      accessibleHotelIds.includes(getBookingHotelId(booking))
    );
  }, [housekeepingBookings, accessibleHotelIds, canAccessAllHotels]);

  const filteredBookings = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();

    return branchRestrictedHousekeepingBookings.filter((booking) => {
      const bookingHotelId = getBookingHotelId(booking);

      const matchesHotel =
        !filters.hotelId || bookingHotelId === String(filters.hotelId);

      const matchesStatus =
        filters.status === "all" || booking?.status === filters.status;

      const customerName = getBookingCustomerName(booking).toLowerCase();
      const hotelName = String(booking?.hotel?.name || "").toLowerCase();
      const roomName = getBookingRoomName(booking).toLowerCase();
      const roomUnit = getBookingRoomUnit(booking).toLowerCase();

      const matchesSearch =
        !searchText ||
        customerName.includes(searchText) ||
        hotelName.includes(searchText) ||
        roomName.includes(searchText) ||
        roomUnit.includes(searchText);

      return matchesHotel && matchesStatus && matchesSearch;
    });
  }, [branchRestrictedHousekeepingBookings, filters]);

  const summary = useMemo(() => {
    const needCleaning = branchRestrictedHousekeepingBookings.filter(
      (booking) => booking.status === "checked_out"
    ).length;

    const inProgress = branchRestrictedHousekeepingBookings.filter(
      (booking) => booking.status === "cleaning"
    ).length;

    return {
      total: branchRestrictedHousekeepingBookings.length,
      needCleaning,
      inProgress,
    };
  }, [branchRestrictedHousekeepingBookings]);

  const hasBranchAccess = canAccessAllHotels || accessibleHotelIds.length > 0;

  const openConfirmModal = (type, booking) => {
    setConfirmAction({
      open: true,
      type,
      booking,
    });
  };

  const closeConfirmModal = () => {
    if (processingId) return;

    setConfirmAction({
      open: false,
      type: null,
      booking: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.booking || !confirmAction.type) return;

    if (confirmAction.type === "start") {
      await handleStartCleaning(confirmAction.booking);
    }

    if (confirmAction.type === "finish") {
      await handleFinishCleaning(confirmAction.booking);
    }

    setConfirmAction({
      open: false,
      type: null,
      booking: null,
    });
  };

  const handleStartCleaning = async (booking) => {
    if (!adminUser?.id) {
      toast.error("Akun login tidak ditemukan");
      return;
    }

    try {
      setProcessingId(booking.id);

      await api.post(`/admin/bookings/${booking.id}/start-cleaning`, {
        admin_user_id: adminUser.id,
        current_user_id: adminUser.id,
        changed_by: adminUser.id,
        cleaning_started_by: adminUser.id,
        cleaning_estimation_minutes: 15,
      });

      toast.success("Cleaning mulai ditangani");
      fetchBookings(false);
    } catch (error) {
      console.error("START CLEANING ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menangani cleaning");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFinishCleaning = async (booking) => {
    if (!adminUser?.id) {
      toast.error("Akun login tidak ditemukan");
      return;
    }

    try {
      setProcessingId(booking.id);

      await api.post(`/admin/bookings/${booking.id}/finish-cleaning`, {
        admin_user_id: adminUser.id,
        current_user_id: adminUser.id,
        changed_by: adminUser.id,
        cleaning_finished_by: adminUser.id,
      });

      toast.success("Cleaning selesai, kamar siap digunakan");
      fetchBookings(false);
    } catch (error) {
      console.error("FINISH CLEANING ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan cleaning"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden h-screen shrink-0 overflow-y-auto overflow-x-hidden bg-slate-950 lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden">
        <div className="hidden lg:block">
          <Topbar />
        </div>

        <main className="mx-auto min-h-screen w-full max-w-[1500px] px-3 pb-24 pt-3 sm:px-5 lg:px-6 lg:pb-8 lg:pt-6">
          <section className="sticky top-0 z-30 -mx-3 border-b border-slate-200/70 bg-[#f4f8fb]/95 px-3 pb-3 pt-3 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:rounded-[28px] lg:border lg:bg-white lg:p-4 lg:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">
                  Room Readiness
                </p>
                <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
                  Housekeeping
                </h1>
              </div>

              <button
                type="button"
                onClick={() => fetchBookings(true)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 transition active:scale-[0.98] lg:w-auto lg:px-4 lg:text-sm lg:font-black"
              >
                <RefreshCcw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="ml-2 hidden lg:inline">Refresh</span>
              </button>
            </div>
          </section>

          <section className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryCard
              icon={BedDouble}
              label="Total"
              value={summary.total}
              description="Tugas"
              tone="sky"
            />
            <SummaryCard
              icon={Clock3}
              label="Perlu"
              value={summary.needCleaning}
              description="Bersih"
              tone="amber"
            />
            <SummaryCard
              icon={Timer}
              label="Proses"
              value={summary.inProgress}
              description="Jalan"
              tone="emerald"
            />
          </section>

          <section className="mt-3 rounded-[24px] border border-white bg-white/95 p-3 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Cari kamar, tamu, cabang..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                />
              </div>

              <select
                value={filters.hotelId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, hotelId: e.target.value }))
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
              >
                <option value="">
                  {canAccessAllHotels ? "Semua Cabang" : "Cabang Saya"}
                </option>
                {accessibleHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
              >
                <option value="all">Semua Status</option>
                <option value="checked_out">Perlu Dibersihkan</option>
                <option value="cleaning">Sedang Ditangani</option>
              </select>
            </div>
          </section>

          <section className="mt-3">
            {loading ? (
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <Loader2 className="mx-auto mb-3 animate-spin text-sky-600" />
                <p className="text-sm font-bold text-slate-500">
                  Memuat data housekeeping...
                </p>
              </div>
            ) : !hasBranchAccess ? (
              <EmptyPanel
                icon={Building2}
                title="Cabang akses belum diatur"
                desc="Minta boss atau IT memilih cabang untuk akun housekeeping ini."
                tone="amber"
              />
            ) : filteredBookings.length === 0 ? (
              <EmptyPanel
                icon={CheckCircle2}
                title="Belum ada kamar yang perlu dibersihkan"
                desc="Kalau ada tamu check-out di cabang akun ini, kamar akan muncul di sini."
                tone="emerald"
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {filteredBookings.map((booking) => {
                  const meta = getCleaningStatusMeta(booking);
                  const isProcessing = processingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className="overflow-hidden rounded-[24px] border border-white bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        className={`h-1.5 bg-gradient-to-r ${meta.accent}`}
                      />

                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                              <BedDouble size={19} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-xl font-black tracking-tight text-slate-950">
                                Kamar {getBookingRoomUnit(booking)}
                              </h3>
                              <p className="truncate text-xs font-black text-slate-500">
                                {getBookingRoomName(booking)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${meta.badgeClass}`}
                          >
                            <ClipboardCheck size={12} />
                            {meta.badgeText}
                          </span>
                        </div>

                        <div
                          className={`mt-3 rounded-2xl px-3 py-3 ${meta.noticeClass}`}
                        >
                          <p className="text-sm font-black">{meta.title}</p>
                          <p className="mt-0.5 text-[11px] font-bold leading-relaxed opacity-80">
                            {meta.subtitle}
                          </p>
                        </div>

                        <div className="mt-3">
                          {booking.status === "checked_out" && (
                            <button
                              type="button"
                              onClick={() => openConfirmModal("start", booking)}
                              disabled={isProcessing}
                              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isProcessing ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <ClipboardCheck size={17} />
                              )}
                              Tangani Cleaning
                            </button>
                          )}

                          {booking.status === "cleaning" && (
                            <button
                              type="button"
                              onClick={() =>
                                openConfirmModal("finish", booking)
                              }
                              disabled={isProcessing}
                              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isProcessing ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={17} />
                              )}
                              Tandai Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {confirmAction.open && (
        <ConfirmActionModal
          type={confirmAction.type}
          booking={confirmAction.booking}
          loading={Boolean(processingId)}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          roomUnit={getBookingRoomUnit(confirmAction.booking)}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, description, tone = "sky" }) {
  const toneClass = {
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-[20px] border border-white bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70 sm:p-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            toneClass[tone] || toneClass.sky
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
          <p className="text-xl font-black leading-none text-slate-950">
            {value}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, desc, tone = "emerald" }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-[28px] border border-white bg-white px-5 py-12 text-center shadow-sm ring-1 ring-slate-200/70">
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl ${
          toneClass[tone] || toneClass.emerald
        }`}
      >
        <Icon size={27} />
      </div>

      <h3 className="text-base font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {desc}
      </p>
    </div>
  );
}

function ConfirmActionModal({
  type,
  booking,
  loading,
  onClose,
  onConfirm,
  roomUnit,
}) {
  const isStart = type === "start";

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-[28px] border border-white bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">
              Konfirmasi
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-950">
              {isStart ? "Mulai bersihkan kamar?" : "Kamar sudah bersih?"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BedDouble size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-black text-slate-950">
                  Kamar {roomUnit || "-"}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  {booking?.room?.type || booking?.room?.name || "Kamar"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-amber-50 px-4 py-3 text-sm font-bold leading-relaxed text-amber-800 ring-1 ring-amber-100">
            {isStart
              ? "Pastikan kamu memang sedang menangani kamar ini."
              : "Pastikan kamar sudah dicek dan siap dipakai lagi."}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[46px] rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition active:scale-[0.98] disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60 ${
                isStart
                  ? "bg-slate-950 shadow-slate-900/15"
                  : "bg-emerald-600 shadow-emerald-600/20"
              }`}
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : isStart ? (
                <ShieldCheck size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {isStart ? "Ya, Mulai" : "Ya, Selesai"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}