import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ReceiptText } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customer, setCustomer] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("customer");
    setCustomer(null);
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

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100 md:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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