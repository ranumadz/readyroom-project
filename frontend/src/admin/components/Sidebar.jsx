import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  ClipboardList,
  Users,
  Settings,
  ChartColumn,
  Building2,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Hotels",
    path: "/admin/hotels/add",
    icon: Building2,
  },
  {
    name: "Rooms",
    path: "/admin/rooms/add",
    icon: BedDouble,
  },
  {
    name: "Facilities",
    path: "/admin/facilities",
    icon: Sparkles,
  },
  {
    name: "Bookings",
    path: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: ChartColumn,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white border-r border-white/10 shadow-2xl">
      <div className="p-6">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Hotel size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide">
                ReadyRoom
              </h2>
              <p className="text-xs text-gray-400">
                Admin Management Panel
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm text-gray-300">
              Kelola hotel, kamar, booking, fasilitas, dan laporan dalam satu dashboard.
            </p>
          </div>
        </div>

        {/* Menu Title */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Main Menu
          </p>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-gray-300 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <Icon size={20} />
                </div>

                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Info */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 p-4 shadow-lg">
          <p className="text-sm font-semibold mb-1">
            Hotel Management
          </p>
          <p className="text-xs text-red-100 leading-relaxed">
            Pantau cabang, kamar, dan booking customer secara lebih rapi dan cepat.
          </p>
        </div>
      </div>
    </aside>
  );
}