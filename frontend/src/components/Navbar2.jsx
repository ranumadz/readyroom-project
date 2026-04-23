import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customer, setCustomer] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");

    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
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
    <header className="fixed top-0 left-0 right-0 z-[999] w-full border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/readyroom.png"
              alt="ReadyRoom"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-red-600">ReadyRoom</span>
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
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {customer ? (
              <>
                <div className="flex items-center gap-3 rounded-full bg-gray-100 py-2 pl-3 pr-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>

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
            className="text-gray-700 md:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="space-y-4 border-t border-gray-200 py-4 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block rounded-xl px-4 py-3 font-medium transition ${
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
            </div>

            {customer ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-red-600 px-4 py-3 text-center font-medium text-white transition hover:bg-red-700"
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