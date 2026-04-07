import { NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  ClipboardList,
  Users,
  Settings,
  ChartColumn,
  Sparkles,
  CalendarDays,
  Layers3,
  Cpu,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const allMenuSections = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Hotel Management",
    items: [
      {
        name: "Add Hotel",
        path: "/admin/hotels/add",
        icon: Building2,
      },
      {
        name: "Rooms List",
        path: "/admin/rooms",
        icon: BedDouble,
      },
      {
        name: "Add Room",
        path: "/admin/rooms/add",
        icon: BedDouble,
      },
      {
        name: "Room Units",
        path: "/admin/room-units",
        icon: BedDouble,
      },
      {
        name: "Facilities",
        path: "/admin/facilities",
        icon: Sparkles,
      },
    ],
  },

  {
    title: "Bookings",
    items: [
      {
        name: "Booking List",
        path: "/admin/bookings",
        icon: ClipboardList,
      },
      {
        name: "Booking Calendar",
        path: "/admin/bookings/calendar",
        icon: CalendarDays,
      },
    ],
  },

  {
    title: "Analytics",
    items: [
      {
        name: "Reports",
        path: "/admin/reports",
        icon: ChartColumn,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        name: "Users",
        path: "/admin/users",
        icon: Users,
      },
      {
        name: "Master Content",
        path: "/admin/master-content",
        icon: Layers3,
      },
      {
        name: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

const roleAllowedPaths = {
  receptionist: ["/admin/bookings", "/admin/bookings/calendar"],
  admin: ["/admin/bookings", "/admin/bookings/calendar", "/admin/reports"],
  pengawas: ["/admin/bookings", "/admin/bookings/calendar", "/admin/reports"],
  it: [
    "/admin/dashboard",
    "/admin/hotels/add",
    "/admin/rooms",
    "/admin/rooms/add",
    "/admin/room-units",
    "/admin/facilities",
    "/admin/users",
    "/admin/master-content",
    "/admin/settings",
  ],
  super_admin: "all",
  boss: "all",
};

export default function Sidebar() {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const readAdminUser = () => {
      try {
        const rawUser =
          localStorage.getItem("adminUser") ||
          localStorage.getItem("admin_user") ||
          localStorage.getItem("user");

        if (!rawUser) {
          setAdminUser(null);
          return;
        }

        const parsedUser = JSON.parse(rawUser);
        setAdminUser(parsedUser);
      } catch (error) {
        console.error("READ ADMIN USER ERROR:", error);
        setAdminUser(null);
      }
    };

    readAdminUser();
    window.addEventListener("storage", readAdminUser);

    return () => {
      window.removeEventListener("storage", readAdminUser);
    };
  }, []);

  const currentRole = (adminUser?.role || "").toLowerCase();
  const isIT = currentRole === "it";

  const filteredMenuSections = useMemo(() => {
    const allowed = roleAllowedPaths[currentRole];

    if (allowed === "all") {
      return allMenuSections;
    }

    const fallbackAllowed = ["/admin/bookings", "/admin/bookings/calendar"];

    const allowedPaths = Array.isArray(allowed) ? allowed : fallbackAllowed;

    return allMenuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => allowedPaths.includes(item.path)),
      }))
      .filter((section) => section.items.length > 0);
  }, [currentRole]);

  const getRoleDescription = () => {
    switch (currentRole) {
      case "receptionist":
        return "Akses fokus ke operasional booking harian dan kalender reservasi.";
      case "admin":
        return "Akses fokus ke booking, kalender, dan laporan operasional.";
      case "pengawas":
        return "Akses monitoring operasional booking, kalender, dan laporan cabang.";
      case "super_admin":
        return "Akses luas untuk mengelola operasional dan sistem internal.";
      case "boss":
        return "Akses penuh untuk seluruh kebutuhan manajemen ReadyRoom.";
      case "it":
        return "Akses khusus sistem, konfigurasi, konten, user, dan kontrol teknis ReadyRoom.";
      default:
        return "Kelola operasional hotel sesuai hak akses akun yang sedang login.";
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case "super_admin":
        return "SUPER ADMIN";
      case "receptionist":
        return "RECEPTIONIST";
      case "pengawas":
        return "PENGAWAS";
      case "it":
        return "IT READYROOM";
      case "boss":
        return "BOSS";
      case "admin":
        return "ADMIN";
      default:
        return adminUser?.role || "UNKNOWN ROLE";
    }
  };

  const asideClassName = isIT
    ? "w-72 min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),linear-gradient(180deg,#03111f_0%,#071827_45%,#020817_100%)] text-white border-r border-cyan-400/10 shadow-2xl"
    : "w-72 min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white border-r border-white/10 shadow-2xl";

  const logoWrapClassName = isIT
    ? "w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/20 shrink-0"
    : "w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-red-500/30 border border-white/10 shrink-0";

  const infoBoxClassName = isIT
    ? "rounded-2xl bg-cyan-400/5 border border-cyan-300/10 p-4"
    : "rounded-2xl bg-white/5 border border-white/10 p-4";

  const roleBadgeClassName = isIT
    ? "mt-3 inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300 border border-cyan-400/20"
    : "mt-3 inline-flex rounded-full bg-red-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300 border border-red-500/20";

  const sectionTitleClassName = isIT
    ? "text-xs uppercase tracking-[0.2em] text-cyan-500/70 mb-3"
    : "text-xs uppercase tracking-[0.2em] text-gray-500 mb-3";

  const getNavClassName = (isActive) => {
    if (isIT) {
      return `group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
          : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`;
    }

    return `group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive
        ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`;
  };

  const getIconWrapClassName = (isActive) => {
    if (isIT) {
      return `w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 ${
        isActive
          ? "bg-white/15"
          : "bg-white/5 group-hover:bg-white/10"
      }`;
    }

    return "w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition shrink-0";
  };

  const bottomCardClassName = isIT
    ? "mt-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-4 shadow-lg shadow-cyan-500/20"
    : "mt-10 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 p-4 shadow-lg";

  const bottomTitle = isIT ? "IT Control Center" : "ReadyRoom System";
  const bottomDesc = isIT
    ? "Area khusus IT untuk mengelola konfigurasi, hak akses, konten, dan kontrol teknis sistem ReadyRoom."
    : "Sistem manajemen hotel untuk mengelola cabang, kamar, booking, laporan, dan pengguna dengan lebih mudah.";

  return (
    <aside className={asideClassName}>
      <div className="p-6">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className={logoWrapClassName}>
              <img
                src="/readyroom.png"
                alt="ReadyRoom Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide">ReadyRoom</h2>
              <p className={isIT ? "text-xs text-cyan-200/70" : "text-xs text-gray-400"}>
                {isIT ? "System Control Panel" : "Admin Management Panel"}
              </p>
            </div>
          </div>

          <div className={infoBoxClassName}>
            <p className={isIT ? "text-sm text-cyan-50/90" : "text-sm text-gray-300"}>
              {getRoleDescription()}
            </p>

            {adminUser?.role && (
              <div className={roleBadgeClassName}>
                Role: {getRoleLabel()}
              </div>
            )}

            {isIT && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-300/10 bg-white/5 px-3 py-2 text-xs text-cyan-100/80">
                <Cpu size={14} className="text-cyan-300" />
                <span>Mode khusus sistem aktif</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {filteredMenuSections.map((section) => (
            <div key={section.title}>
              <p className={sectionTitleClassName}>{section.title}</p>

              <nav className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => getNavClassName(isActive)}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={getIconWrapClassName(isActive)}>
                            <Icon size={20} />
                          </div>

                          <span className="font-medium">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className={bottomCardClassName}>
          <div className="mb-2 flex items-center gap-2">
            {isIT ? <Wrench size={16} /> : <ShieldCheck size={16} />}
            <p className="text-sm font-semibold">{bottomTitle}</p>
          </div>

          <p className={isIT ? "text-xs text-cyan-50/90 leading-relaxed" : "text-xs text-red-100 leading-relaxed"}>
            {bottomDesc}
          </p>
        </div>
      </div>
    </aside>
  );
}