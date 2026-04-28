import {
  Instagram,
  MapPin,
  Mail,
  Phone,
  Clock3,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Beranda", href: "/" },
    { label: "Semua Hotel", href: "/hotels" },
    { label: "Tentang Kami", href: "#" },
    { label: "Kontak", href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#101010] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="pointer-events-none absolute right-0 top-0 hidden select-none md:block">
        <div className="relative h-[150px] w-[360px] translate-x-[42px] -translate-y-[58px] overflow-visible">
          <div className="absolute right-0 top-0 h-[130px] w-[130px] rounded-full border-[18px] border-red-600/80 border-b-transparent border-l-transparent rotate-[16deg]" />
          <div className="absolute right-[58px] top-[22px] h-[102px] w-[102px] rounded-full border-[15px] border-red-500/55 border-b-transparent border-l-transparent rotate-[16deg]" />
          <div className="absolute right-[108px] top-[42px] h-[74px] w-[74px] rounded-full border-[12px] border-red-300/45 border-b-transparent border-l-transparent rotate-[16deg]" />

          <div className="absolute right-[172px] top-[88px] h-[2px] w-[84px] rounded-full bg-gradient-to-r from-red-400/0 via-red-400/35 to-red-400/0" />

          <div className="absolute right-[14px] top-[112px] text-[10px] font-semibold uppercase tracking-[0.52em] text-red-200/25">
            READYROOM
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.35fr_0.85fr_0.8fr]">
          {/* KOLOM BRAND */}
          <div>
            <div className="inline-flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/10">
                <img
                  src="/logo.png"
                  alt="ReadyRoom"
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  ReadyRoom
                </h3>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/45">
                  Tempat Rehat Paling Tepat
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/68 md:text-[15px]">
              ReadyRoom hadir sebagai jaringan properti dan platform booking
              yang membantu tamu menemukan tempat rehat paling tepat, dengan
              akses yang mudah, lokasi yang strategis, dan pengalaman menginap
              yang lebih nyaman.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/68">
              <div className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-red-400" />
                <span>
                  Office Center
                  <br />
                  Jl. Melawai X No.12, Melawai, Kec. Kby. Baru, Kota Jakarta
                  Selatan, Daerah Khusus Ibukota Jakarta 12160
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={17} className="shrink-0 text-red-400" />
                <span>readyroom.id@gmail.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={17} className="shrink-0 text-red-400" />
                <span>+62 811 590 150</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock3 size={17} className="shrink-0 text-red-400" />
                <span>Setiap Hari • 24/7 Layanan Service</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/readyroom.id/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10"
              >
                <Instagram size={16} />
                Instagram
              </a>

              <a
                href="https://www.tiktok.com/@readyroom"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.68h-3.138v12.58a2.725 2.725 0 1 1-2.725-2.725c.226 0 .447.028.659.08V8.763a5.863 5.863 0 1 0 5.204 5.823V8.148a7.92 7.92 0 0 0 4.77 1.6V6.686Z" />
                </svg>
                TikTok
              </a>
            </div>
          </div>

          {/* JELAJAHI */}
          <div>
            <h4 className="text-lg font-bold tracking-tight">
              Jelajahi ReadyRoom
            </h4>

            <div className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-white/68 transition hover:text-white"
                >
                  <ChevronRight
                    size={15}
                    className="text-red-400 transition group-hover:translate-x-0.5"
                  />
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* CARD INFO */}
          
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} ReadyRoom. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-5">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms of Service
            </a>
            <span className="text-white/30">
              Designed for modern hospitality
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}