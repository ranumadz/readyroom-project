import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  X,
  ReceiptText,
  Bell,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customer, setCustomer] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  useEffect(() => {
    const syncCustomer = () => {
      try {
        const storedCustomer =
          localStorage.getItem("customer") ||
          localStorage.getItem("customerUser") ||
          localStorage.getItem("user");

        setCustomer(storedCustomer ? JSON.parse(storedCustomer) : null);
      } catch (error) {
        console.error("READ CUSTOMER LOCALSTORAGE ERROR:", error);
        setCustomer(null);
      }
    };

    syncCustomer();
    window.addEventListener("storage", syncCustomer);

    return () => window.removeEventListener("storage", syncCustomer);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotificationOpen(false);

    try {
      const storedCustomer =
        localStorage.getItem("customer") ||
        localStorage.getItem("customerUser") ||
        localStorage.getItem("user");

      setCustomer(storedCustomer ? JSON.parse(storedCustomer) : null);
    } catch (error) {
      console.error("SYNC CUSTOMER ON ROUTE CHANGE ERROR:", error);
      setCustomer(null);
    }
  }, [location.pathname]);

  const getCustomerId = (customerData) => {
    return customerData?.id || customerData?.customer_id || null;
  };

  const getReadStorageKey = (customerData = customer) => {
    const customerId = getCustomerId(customerData) || "guest";
    return `readyroom_booking_notifications_read_${customerId}`;
  };

  const readStoredNotificationIds = (customerData = customer) => {
    try {
      const raw = localStorage.getItem(getReadStorageKey(customerData));
      const parsed = raw ? JSON.parse(raw) : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("READ NOTIFICATION IDS ERROR:", error);
      return [];
    }
  };

  const saveReadNotificationIds = (ids, customerData = customer) => {
    try {
      const uniqueIds = Array.from(new Set(ids));
      localStorage.setItem(
        getReadStorageKey(customerData),
        JSON.stringify(uniqueIds)
      );
      setReadNotificationIds(uniqueIds);
    } catch (error) {
      console.error("SAVE NOTIFICATION IDS ERROR:", error);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getBookingTypeText = (booking) => {
    return booking?.booking_type === "transit"
      ? `Transit ${booking?.duration_hours || "-"} Jam`
      : "Full Day";
  };

  const getBookingNotification = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || "").toLowerCase();
    const hotelName = booking?.hotel?.name || "Hotel ReadyRoom";
    const roomName = booking?.room?.name || "kamar";
    const bookingCode = booking?.booking_code || "";
    const baseTime =
      booking?.updated_at || booking?.created_at || booking?.check_in || "";

    if (paymentStatus === "refunded") {
      return {
        id: `booking-${booking.id}-refund-${paymentStatus}`,
        type: "refund",
        title: "Refund booking diproses",
        message: `Refund untuk booking di ${hotelName} sudah tercatat oleh admin.`,
        time: baseTime,
        icon: RotateCcw,
        iconClass: "bg-purple-50 text-purple-600",
      };
    }

    if (status === "confirmed") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "approved",
        title: "Booking disetujui admin",
        message: bookingCode
          ? `Kode booking ${bookingCode} sudah tersedia untuk ${hotelName}.`
          : `Booking kamu di ${hotelName} sudah disetujui admin.`,
        time: baseTime,
        icon: CheckCircle2,
        iconClass: "bg-green-50 text-green-600",
      };
    }

    if (status === "paid") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "paid",
        title: "Pembayaran tercatat",
        message: `Pembayaran booking ${bookingCode || ""} di ${hotelName} sudah tercatat.`,
        time: baseTime,
        icon: CheckCircle2,
        iconClass: "bg-emerald-50 text-emerald-600",
      };
    }

    if (status === "checked_in") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "checked_in",
        title: "Check-in berhasil",
        message: `Check-in untuk ${roomName} di ${hotelName} sudah tercatat.`,
        time: baseTime,
        icon: CheckCircle2,
        iconClass: "bg-green-50 text-green-600",
      };
    }

    if (status === "cancelled") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "cancelled",
        title: "Booking dibatalkan",
        message: `Booking kamu di ${hotelName} dibatalkan oleh admin.`,
        time: baseTime,
        icon: XCircle,
        iconClass: "bg-red-50 text-red-600",
      };
    }

    if (status === "rejected") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "rejected",
        title: "Booking ditolak",
        message:
          booking?.rejection_reason_customer ||
          `Mohon maaf, booking kamu di ${hotelName} belum bisa disetujui.`,
        time: baseTime,
        icon: XCircle,
        iconClass: "bg-red-50 text-red-600",
      };
    }

    if (status === "pending") {
      return {
        id: `booking-${booking.id}-${status}-${paymentStatus}`,
        type: "pending",
        title: "Menunggu konfirmasi admin",
        message: `Pengajuan booking ${getBookingTypeText(
          booking
        )} di ${hotelName} sedang diproses.`,
        time: baseTime,
        icon: Clock3,
        iconClass: "bg-amber-50 text-amber-600",
      };
    }

    return {
      id: `booking-${booking.id}-${status || "info"}-${paymentStatus}`,
      type: "info",
      title: "Update booking",
      message: `Ada update terbaru untuk booking kamu di ${hotelName}.`,
      time: baseTime,
      icon: AlertCircle,
      iconClass: "bg-blue-50 text-blue-600",
    };
  };

  const fetchNotifications = async (customerData = customer) => {
    const customerId = getCustomerId(customerData);

    if (!customerId) {
      setNotifications([]);
      setReadNotificationIds([]);
      return;
    }

    try {
      const storedReadIds = readStoredNotificationIds(customerData);
      setReadNotificationIds(storedReadIds);

      const res = await api.get(`/my-bookings?user_id=${customerId}`);
      const bookingData = Array.isArray(res.data?.data) ? res.data.data : [];

      const nextNotifications = bookingData
        .filter((booking) => booking?.id)
        .map(getBookingNotification)
        .sort((a, b) => {
          const dateA = new Date(a.time || 0).getTime();
          const dateB = new Date(b.time || 0).getTime();

          return dateB - dateA;
        })
        .slice(0, 8);

      setNotifications(nextNotifications);
    } catch (error) {
      console.error("GET CUSTOMER NOTIFICATIONS ERROR:", error.response?.data || error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchNotifications(customer);
    } else {
      setNotifications([]);
      setReadNotificationIds([]);
      setNotificationOpen(false);
    }
  }, [customer?.id, location.pathname]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => !readNotificationIds.includes(notification.id)
    );
  }, [notifications, readNotificationIds]);

  const unreadCount = unreadNotifications.length;

  const markNotificationsAsRead = () => {
    if (!customer || notifications.length === 0) return;

    const notificationIds = notifications.map((item) => item.id);
    saveReadNotificationIds(
      [...readNotificationIds, ...notificationIds],
      customer
    );
  };

  const handleToggleNotifications = () => {
    const nextOpen = !notificationOpen;
    setNotificationOpen(nextOpen);

    if (nextOpen) {
      markNotificationsAsRead();
    }
  };

  const handleOpenMyBookings = () => {
    setNotificationOpen(false);
    setMobileOpen(false);
    navigate("/my-bookings");
  };

  const handleLogout = () => {
    localStorage.removeItem("customer");
    setCustomer(null);
    setNotifications([]);
    setReadNotificationIds([]);
    setNotificationOpen(false);
    navigate("/");
  };

  const navItems = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Hotels", to: "/hotels" },
      { label: "Rooms", to: "/rooms" },
    ],
    []
  );

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[999] w-full border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between md:h-20">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img
              src="/readyroom.png"
              alt="ReadyRoom"
              className="h-7 w-7 object-contain md:h-10 md:w-10"
            />
            <span className="text-lg font-bold text-red-600 md:text-xl">
              ReadyRoom
            </span>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-red-50 text-red-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {customer && (
              <Link
                to="/my-bookings"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive("/my-bookings")
                    ? "bg-red-50 text-red-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                <ReceiptText size={17} />
                Riwayat Booking
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {customer ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                      notificationOpen
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    <Bell size={19} />

                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[360px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                      <div className="border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Notifikasi
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Update terbaru booking kamu
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setNotificationOpen(false)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                              <Bell size={22} />
                            </div>
                            <p className="font-semibold text-gray-700">
                              Belum ada notifikasi
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Update booking akan muncul di sini.
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const Icon = notification.icon;

                            return (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={handleOpenMyBookings}
                                className="flex w-full gap-3 border-b border-gray-50 px-5 py-4 text-left transition hover:bg-gray-50"
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${notification.iconClass}`}
                                >
                                  <Icon size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
                                    {notification.message}
                                  </p>
                                  {notification.time && (
                                    <p className="mt-1 text-xs font-semibold text-gray-400">
                                      {formatDateTime(notification.time)}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="border-t border-gray-100 p-3">
                        <button
                          type="button"
                          onClick={handleOpenMyBookings}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          <ReceiptText size={17} />
                          Lihat Riwayat Booking
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-full bg-gray-100 py-2 pl-3 pr-4 transition hover:bg-gray-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.phone || "-"}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:text-red-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {customer && (
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100"
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {customer && notificationOpen && (
          <div className="border-t border-gray-200 py-3 md:hidden">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">Notifikasi</h3>
                    <p className="text-xs text-gray-500">
                      Update terbaru booking kamu
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-7 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <Bell size={22} />
                    </div>
                    <p className="font-semibold text-gray-700">
                      Belum ada notifikasi
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Update booking akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={handleOpenMyBookings}
                        className="flex w-full gap-3 border-b border-gray-50 px-4 py-4 text-left transition hover:bg-gray-50"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${notification.iconClass}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
                            {notification.message}
                          </p>
                          {notification.time && (
                            <p className="mt-1 text-xs font-semibold text-gray-400">
                              {formatDateTime(notification.time)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={handleOpenMyBookings}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  <ReceiptText size={17} />
                  Lihat Riwayat Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="space-y-3 border-t border-gray-200 py-3 md:hidden">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block rounded-xl px-4 py-2.5 font-medium transition ${
                      active
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {customer && (
                <Link
                  to="/my-bookings"
                  className={`block rounded-xl px-4 py-2.5 font-medium transition ${
                    isActive("/my-bookings")
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  Riwayat Booking
                </Link>
              )}
            </div>

            {customer ? (
              <div className="space-y-3 pt-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-2.5 transition hover:bg-gray-200"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.phone || "-"}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-center font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-red-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}