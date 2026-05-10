import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  ClipboardList,
  Users,
  Settings,
  ChartColumn,
  BadgeCheck,
  CalendarDays,
  Layers3,
  Cpu,
  ShieldCheck,
  Crown,
  BriefcaseBusiness,
  UserCog,
  BellRing,
  ClipboardCheck,
} from "lucide-react";

const allMenuSections = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },

  {
    title: "Hotel Management",
    items: [
      {
        name: "Hotels List",
        path: "/admin/hotels",
        icon: Building2,
        end: true,
        activePaths: [
          "/admin/hotels",
          "/admin/hotels/add",
          "/admin/rooms",
          "/admin/rooms/add",
        ],
      },
      {
        name: "Facilities",
        path: "/admin/facilities",
        icon: BadgeCheck,
        end: true,
      },
    ],
  },

  {
    title: "Front Office",
    items: [
      {
        name: "Monitoring Kamar",
        path: "/admin/room-units",
        icon: BedDouble,
        end: true,
      },
      {
        name: "Ketersediaan Booking",
        path: "/admin/booking-availability",
        icon: CalendarDays,
        end: true,
      },
      {
        name: "Booking List",
        path: "/admin/bookings",
        icon: ClipboardList,
        end: true,
      },
      {
        name: "Booking Calendar",
        path: "/admin/bookings/calendar",
        icon: CalendarDays,
        end: true,
      },
      {
        name: "Housekeeping",
        path: "/admin/housekeeping",
        icon: ClipboardCheck,
        end: true,
      },
    ],
  },

  {
    title: "Partner / OTA",
    items: [
      {
        name: "Pengajuan Partner",
        path: "/admin/partner-applications",
        icon: ClipboardCheck,
        end: true,
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
        end: true,
      },
      {
        name: "Analisa Kinerja Karyawan",
        path: "/admin/analisa-kinerja-karyawan",
        icon: ChartColumn,
        end: true,
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
        end: true,
      },
      {
        name: "Master Content",
        path: "/admin/master-content",
        icon: Layers3,
        end: true,
      },
      {
        name: "Settings",
        path: "/admin/settings",
        icon: Settings,
        end: true,
      },
    ],
  },
];

const roleAllowedPaths = {
  receptionist: [
    "/admin/room-units",
    "/admin/bookings",
    "/admin/bookings/calendar",
    "/admin/housekeeping",
  ],
  housekeeping: ["/admin/housekeeping"],
  admin: [
    "/admin/room-units",
    "/admin/booking-availability",
    "/admin/bookings",
    "/admin/bookings/calendar",
    "/admin/housekeeping",
    "/admin/reports",
  ],
  pengawas: [
    "/admin/room-units",
    "/admin/booking-availability",
    "/admin/bookings",
    "/admin/bookings/calendar",
    "/admin/housekeeping",
    "/admin/reports",
  ],
  it: [
    "/admin/dashboard",
    "/admin/hotels",
    "/admin/rooms",
    "/admin/room-units",
    "/admin/facilities",
    "/admin/partner-applications",
    "/admin/users",
    "/admin/master-content",
    "/admin/settings",
  ],
  super_admin: "all",
  boss: "all",
};

const roleThemes = {
  receptionist: {
    label: "Receptionist",
    panelSubtitle: "Front Office Panel",
    description:
      "Akses fokus untuk operasional booking harian, check-in, check-out, dan kalender reservasi.",
    icon: BellRing,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_22%),linear-gradient(180deg,#03130f_0%,#061d17_42%,#02110d_100%)] border-emerald-400/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-emerald-300/55",
    activeNav:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.20)]",
    inactiveNav: "text-emerald-50/80 hover:bg-white/8 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 shadow-lg shadow-emerald-500/20",
    bottomText: "text-emerald-50/90",
  },

  housekeeping: {
    label: "Housekeeping",
    panelSubtitle: "Room Readiness Panel",
    description:
      "Akses khusus untuk memantau kamar yang perlu dibersihkan, menangani cleaning, dan memastikan kamar siap digunakan kembali.",
    icon: ClipboardCheck,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,#06131f_0%,#082235_45%,#020b14_100%)] border-sky-400/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/10 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-sky-300/55",
    activeNav:
      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.20)]",
    inactiveNav: "text-sky-50/85 hover:bg-white/8 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-500 p-4 shadow-lg shadow-sky-500/20",
    bottomText: "text-sky-50/90",
  },

  admin: {
    label: "Admin",
    panelSubtitle: "Operations Panel",
    description:
      "Akses utama untuk booking, kalender, dan laporan operasional cabang yang berjalan setiap hari.",
    icon: UserCog,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-gradient-to-b from-black via-gray-950 to-black border-white/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-red-500/25 border border-white/10 shrink-0",
    sectionTitle: "mb-3 text-xs uppercase tracking-[0.22em] text-gray-500",
    activeNav:
      "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_10px_24px_rgba(244,63,94,0.20)]",
    inactiveNav: "text-gray-300 hover:bg-white/10 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-red-600 to-rose-500 p-4 shadow-lg shadow-red-500/20",
    bottomText: "text-red-50/90",
  },

  pengawas: {
    label: "Pengawas",
    panelSubtitle: "Monitoring Panel",
    description:
      "Akses monitoring booking, kalender, dan laporan cabang untuk kebutuhan pengawasan operasional.",
    icon: ShieldCheck,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_24%),linear-gradient(180deg,#161006_0%,#241807_45%,#120c03_100%)] border-amber-400/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-white/10 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-amber-300/55",
    activeNav:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_10px_24px_rgba(245,158,11,0.20)]",
    inactiveNav: "text-amber-50/85 hover:bg-white/8 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 shadow-lg shadow-amber-500/20",
    bottomText: "text-amber-50/90",
  },

  super_admin: {
    label: "Super Admin",
    panelSubtitle: "Core Management Panel",
    description:
      "Akses luas untuk mengelola operasional, struktur sistem, konten, user, dan kontrol manajemen internal.",
    icon: BriefcaseBusiness,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_22%),linear-gradient(180deg,#0f0820_0%,#170b2d_42%,#0a0614_100%)] border-violet-400/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg shadow-violet-500/20 border border-white/10 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-violet-300/55",
    activeNav:
      "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_10px_24px_rgba(168,85,247,0.20)]",
    inactiveNav: "text-violet-50/85 hover:bg-white/8 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 shadow-lg shadow-violet-500/20",
    bottomText: "text-violet-50/90",
  },

  boss: {
    label: "Boss",
    panelSubtitle: "Executive Panel",
    description:
      "Akses penuh untuk kebutuhan manajemen, evaluasi performa, keputusan operasional, dan kontrol bisnis.",
    icon: Crown,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.16),_transparent_22%),linear-gradient(180deg,#171717_0%,#111827_42%,#0a0a0a_100%)] border-yellow-300/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg shadow-yellow-500/20 border border-white/10 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-yellow-200/45",
    activeNav:
      "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-[0_10px_24px_rgba(234,179,8,0.22)]",
    inactiveNav: "text-slate-200 hover:bg-white/8 hover:text-white",
    activeIcon: "bg-white/20",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-yellow-400 to-amber-500 p-4 shadow-lg shadow-yellow-500/20",
    bottomText: "text-slate-900",
  },

  it: {
    label: "IT",
    panelSubtitle: "System Control Panel",
    description:
      "Akses khusus sistem, konfigurasi, konten, user, dan kontrol teknis ReadyRoom.",
    icon: Cpu,
    aside:
      "w-72 min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),linear-gradient(180deg,#03111f_0%,#071827_45%,#020817_100%)] text-white border-r border-cyan-400/10 shadow-2xl",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/20 shrink-0",
    sectionTitle:
      "mb-3 text-xs uppercase tracking-[0.22em] text-cyan-500/70",
    activeNav:
      "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_10px_24px_rgba(6,182,212,0.20)]",
    inactiveNav: "text-slate-200 hover:bg-white/10 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 p-4 shadow-lg shadow-cyan-500/20",
    bottomText: "text-cyan-50/90",
  },

  default: {
    label: "Admin",
    panelSubtitle: "Management Panel",
    description:
      "Kelola operasional hotel sesuai hak akses akun yang sedang login.",
    icon: ShieldCheck,
    aside:
      "w-72 min-h-screen text-white border-r shadow-2xl bg-gradient-to-b from-black via-gray-950 to-black border-white/10",
    logoWrap:
      "w-12 h-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-red-500/25 border border-white/10 shrink-0",
    sectionTitle: "mb-3 text-xs uppercase tracking-[0.22em] text-gray-500",
    activeNav:
      "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_10px_24px_rgba(244,63,94,0.20)]",
    inactiveNav: "text-gray-300 hover:bg-white/10 hover:text-white",
    activeIcon: "bg-white/15",
    inactiveIcon: "bg-white/5 group-hover:bg-white/10",
    bottomCard:
      "mt-8 rounded-3xl bg-gradient-to-r from-red-600 to-rose-500 p-4 shadow-lg shadow-red-500/20",
    bottomText: "text-red-50/90",
  },
};

export default function Sidebar() {
  const location = useLocation();
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

  const filteredMenuSections = useMemo(() => {
    const allowed = roleAllowedPaths[currentRole];

    if (allowed === "all") {
      return allMenuSections;
    }

    const fallbackAllowed = [
      "/admin/room-units",
      "/admin/bookings",
      "/admin/bookings/calendar",
    ];
    const allowedPaths = Array.isArray(allowed) ? allowed : fallbackAllowed;

    return allMenuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => allowedPaths.includes(item.path)),
      }))
      .filter((section) => section.items.length > 0);
  }, [currentRole]);

  const theme = roleThemes[currentRole] || roleThemes.default;
  const BottomIcon = theme.icon;

  const isItemActive = (item) => {
    const currentPath = location.pathname;

    if (Array.isArray(item.activePaths)) {
      return item.activePaths.some(
        (path) =>
          currentPath === path || currentPath.startsWith(`${path}/`)
      );
    }

    if (item.end) {
      return currentPath === item.path;
    }

    return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
  };

  const getNavClassName = (isActive) => {
    return `group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive
        ? `${theme.activeNav} z-10 translate-x-0`
        : `${theme.inactiveNav} z-0 hover:translate-x-0.5`
    }`;
  };

  const getIconWrapClassName = (isActive) => {
    return `w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 ${
      isActive ? theme.activeIcon : theme.inactiveIcon
    }`;
  };

  return (
    <aside
      className={`${theme.aside} sticky top-0 h-screen max-h-screen overflow-y-auto overflow-x-hidden overscroll-contain`}
    >
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className={theme.logoWrap}>
              <img
                src="/readyroom.png"
                alt="ReadyRoom Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide">ReadyRoom</h2>
              <p className="text-xs text-white/55">{theme.panelSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {filteredMenuSections.map((section) => (
            <div key={section.title}>
              <p className={theme.sectionTitle}>{section.title}</p>

              <nav className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={Boolean(item.end)}
                      className={getNavClassName(active)}
                    >
                      <div className={getIconWrapClassName(active)}>
                        <Icon size={20} />
                      </div>

                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className={theme.bottomCard}>
          <div className="mb-2 flex items-center gap-2">
            <BottomIcon size={16} />
            <p className="text-sm font-semibold">{theme.label}</p>
          </div>

          <p className={`text-xs leading-relaxed ${theme.bottomText}`}>
            {theme.description}
          </p>

          {currentRole === "it" && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-cyan-300/10 bg-white/10 px-3 py-2 text-xs text-cyan-50/90">
              <Cpu size={14} />
              <span>Mode khusus sistem aktif</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}