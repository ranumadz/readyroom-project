import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ReceiptText } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");

    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer");
    setCustomer(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/readyroom.png"
              alt="ReadyRoom"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-red-600">ReadyRoom</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/hotels"
              className="text-gray-700 hover:text-red-600 font-medium transition"
            >
              Hotels
            </Link>
            <Link
              to="/hotels"
              className="text-gray-700 hover:text-red-600 font-medium transition"
            >
              Rooms
            </Link>

            {customer && (
              <Link
                to="/my-bookings"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition"
              >
                <ReceiptText size={17} />
                Riwayat Booking
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {customer ? (
              <>
                <div className="flex items-center gap-3 bg-gray-100 rounded-full pl-3 pr-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-red-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/hotels"
              className="block text-gray-700 hover:text-red-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Hotels
            </Link>

            <Link
              to="/hotels"
              className="block text-gray-700 hover:text-red-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Rooms
            </Link>

            {customer && (
              <Link
                to="/my-bookings"
                className="block text-gray-700 hover:text-red-600 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Riwayat Booking
              </Link>
            )}

            {customer ? (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                    {customer.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-center bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition"
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