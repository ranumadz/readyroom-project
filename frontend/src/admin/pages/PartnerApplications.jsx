import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const dummyApplications = [
  {
    id: 1,
    hotel_name: "Hotel Santika Partner",
    city: "Jakarta",
    address: "Jl. Gatot Subroto No. 21, Jakarta",
    map_link: "https://maps.google.com",
    pic_name: "Budi Santoso",
    pic_phone: "081234567890",
    pic_email: "budi@hotelpartner.com",
    cooperation_type: "Listing / Iklan",
    status: "pending",
    submitted_at: "7 Mei 2026, 10:30",
    description:
      "Hotel ingin bergabung sebagai partner listing ReadyRoom untuk meningkatkan exposure dan calon tamu.",
  },
  {
    id: 2,
    hotel_name: "Grand Melawai Residence",
    city: "Bandung",
    address: "Jl. Merdeka No. 18, Bandung",
    map_link: "https://maps.google.com",
    pic_name: "Sinta Rahma",
    pic_phone: "082112223333",
    pic_email: "sinta@grandmelawai.com",
    cooperation_type: "Listing / Iklan",
    status: "approved",
    submitted_at: "6 Mei 2026, 15:12",
    description:
      "Pengajuan partner hotel untuk listing di platform ReadyRoom. Setelah approve, akun merchant bisa dibuat.",
  },
  {
    id: 3,
    hotel_name: "Kuta Urban Stay",
    city: "Bali",
    address: "Jl. Pantai Kuta No. 9, Badung",
    map_link: "https://maps.google.com",
    pic_name: "Made Pratama",
    pic_phone: "087700001111",
    pic_email: "made@kutaurbanstay.com",
    cooperation_type: "Listing / Iklan",
    status: "rejected",
    submitted_at: "5 Mei 2026, 09:45",
    description:
      "Data hotel perlu dilengkapi ulang sebelum bisa diproses sebagai partner ReadyRoom.",
  },
];

export default function PartnerApplications() {
  const [applications, setApplications] = useState(dummyApplications);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return applications
      .filter((item) => {
        if (statusFilter === "all") return true;
        return item.status === statusFilter;
      })
      .filter((item) => {
        if (!keyword) return true;

        return [
          item.hotel_name,
          item.city,
          item.address,
          item.pic_name,
          item.pic_phone,
          item.pic_email,
          item.cooperation_type,
        ]
          .map((value) => String(value || "").toLowerCase())
          .some((value) => value.includes(keyword));
      });
  }, [applications, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      approved: applications.filter((item) => item.status === "approved").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    };
  }, [applications]);

  const updateStatus = (applicationId, nextStatus) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === applicationId ? { ...item, status: nextStatus } : item
      )
    );

    setSelectedApplication((prev) =>
      prev && prev.id === applicationId ? { ...prev, status: nextStatus } : prev
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar />

        <main className="p-4 md:p-6">
          <section className="mb-5 overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 px-5 py-5 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-red-300" />
                  <h1 className="text-lg font-black">Pengajuan Partner</h1>
                </div>
                <p className="mt-1 text-xs font-medium text-white/70">
                  Mapping awal untuk melihat hotel luar yang mengajukan kerja sama ReadyRoom.
                </p>
              </div>

              <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/10">
                Sample Frontend
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4 md:p-5">
              <StatCard label="Total Pengajuan" value={stats.total} />
              <StatCard label="Menunggu Review" value={stats.pending} tone="amber" />
              <StatCard label="Disetujui" value={stats.approved} tone="emerald" />
              <StatCard label="Ditolak" value={stats.rejected} tone="red" />
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-gray-100 p-4 md:grid-cols-12 md:p-5">
              <div className="md:col-span-8">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Pencarian
                </label>
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama hotel, kota, PIC, email, atau nomor WhatsApp..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Review</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Daftar Pengajuan
                </h2>
                <p className="text-sm text-gray-500">
                  Data dummy untuk gambaran ke bos sebelum backend dibuat.
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                {filteredApplications.length} data tampil
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center px-5 py-10">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Building2 size={26} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    Data tidak ditemukan
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Coba ubah kata pencarian atau filter status.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left">
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Hotel
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        PIC
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Kota
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Tipe
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Tanggal Masuk
                      </th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <p className="font-black text-gray-900">
                                {item.hotel_name}
                              </p>
                              <p className="mt-0.5 max-w-[280px] truncate text-xs font-medium text-gray-500">
                                {item.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{item.pic_name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.pic_phone}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-700">
                          {item.city}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {item.cooperation_type}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                          {item.submitted_at}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(item)}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                              <Eye size={15} />
                              Detail
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "approved")}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "rejected")}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={() => updateStatus(selectedApplication.id, "approved")}
          onReject={() => updateStatus(selectedApplication.id, "rejected")}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={`rounded-3xl border p-4 ${toneClass[tone] || toneClass.slate}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
        <CheckCircle2 size={14} />
        Disetujui
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 ring-1 ring-red-100">
        <XCircle size={14} />
        Ditolak
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 ring-1 ring-amber-100">
      <Clock3 size={14} />
      Menunggu
    </span>
  );
}

function ApplicationDetailModal({ application, onClose, onApprove, onReject }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-red-600">
              Detail Pengajuan Partner
            </p>
            <h3 className="mt-1 text-2xl font-black text-gray-950">
              {application.hotel_name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Data ini masih dummy sample untuk mapping flow approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <StatusBadge status={application.status} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailItem
              icon={<Building2 size={17} />}
              label="Nama Hotel"
              value={application.hotel_name}
            />
            <DetailItem
              icon={<MapPin size={17} />}
              label="Kota"
              value={application.city}
            />
            <DetailItem
              icon={<MapPin size={17} />}
              label="Alamat"
              value={application.address}
            />
            <DetailItem
              icon={<ShieldCheck size={17} />}
              label="Tipe Kerja Sama"
              value={application.cooperation_type}
            />
            <DetailItem
              icon={<Phone size={17} />}
              label="Nama PIC"
              value={application.pic_name}
            />
            <DetailItem
              icon={<Phone size={17} />}
              label="WhatsApp"
              value={application.pic_phone}
            />
            <DetailItem
              icon={<Mail size={17} />}
              label="Email"
              value={application.pic_email}
            />
            <DetailItem
              icon={<Clock3 size={17} />}
              label="Tanggal Masuk"
              value={application.submitted_at}
            />
          </div>

          <div className="mt-4 rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">
              Deskripsi
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700">
              {application.description || "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Reject
          </button>

          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-red-500">
        {icon}
        <p className="text-xs font-black uppercase tracking-wide text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-black text-gray-900">{value || "-"}</p>
    </div>
  );
}