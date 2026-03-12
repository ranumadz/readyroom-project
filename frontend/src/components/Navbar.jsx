import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/readyroom.png" className="w-10 h-10 rounded-full shadow-sm" />
          <div>
            <h1 className="text-xl font-bold text-red-600 leading-none">
              ReadyRoom
            </h1>
            <p className="text-xs text-gray-400">Smart Hotel Booking</p>
          </div>
        </div>

        <div className="hidden md:flex space-x-6 items-center">
          <button className="text-gray-700 hover:text-red-600 font-medium transition">
            Rooms
          </button>

          <button className="text-gray-700 hover:text-red-600 font-medium transition">
            Deals
          </button>

          <Link
            to="/login"
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20"
          >
            Login
          </Link>

          <Link
            to="/admin/login"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Admin
          </Link>

          <Link
            to="/admin/dashboard"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}