import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Plus,
  Wifi,
  CheckCircle2,
  CircleOff,
  Layers3,
  Car,
  Tv,
  Bath,
  Coffee,
  Dumbbell,
  Waves,
  AirVent,
  UtensilsCrossed,
  BedDouble,
  ChevronDown,
  Building2,
  DoorOpen,
  Trash2,
  ShieldCheck,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";

const iconOptions = [
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "car", label: "Parkir", icon: Car },
  { value: "tv", label: "TV", icon: Tv },
  { value: "bath", label: "Kamar Mandi", icon: Bath },
  { value: "coffee", label: "Breakfast / Coffee", icon: Coffee },
  { value: "dumbbell", label: "Gym", icon: Dumbbell },
  { value: "waves", label: "Kolam Renang", icon: Waves },
  { value: "air-vent", label: "AC", icon: AirVent },
  { value: "utensils-crossed", label: "Restoran", icon: UtensilsCrossed },
  { value: "bed-double", label: "Tempat Tidur Besar", icon: BedDouble },
];

const purposeOptions = [
  {
    value: "hotel",
    label: "Hotel",
    description: "Fasilitas untuk data hotel",
    icon: Building2,
  },
  {
    value: "room",
    label: "Kamar",
    description: "Fasilitas untuk data kamar",
    icon: DoorOpen,
  },
];

const filterOptions = [
  { value: "all", label: "Semua Data", icon: Layers3 },
  { value: "hotel", label: "Hotel", icon: Building2 },
  { value: "room", label: "Kamar", icon: DoorOpen },
];

const getIconComponent = (iconName) => {
  const found = iconOptions.find((item) => item.value === iconName);
  return found ? found.icon : Wifi;
};

const normalizePurpose = (facility) => {
  const raw = String(
    facility?.usage_scope ||
      facility?.scope ||
      facility?.facility_scope ||
      facility?.facility_type ||
      facility?.target ||
      facility?.type_for ||
      facility?.for ||
      facility?.used_for ||
      "hotel"
  ).toLowerCase();

  if (raw.includes("room") || raw.includes("kamar")) return "room";

  /*
    Data lama yang dulu masih "all / both / semua" sengaja diarahkan ke hotel,
    supaya di UI sekarang tidak muncul kategori "Semua" lagi.
  */
  if (
    raw.includes("all") ||
    raw.includes("both") ||
    raw.includes("semua") ||
    raw.includes("hotel")
  ) {
    return "hotel";
  }

  return "hotel";
};

const getPurposeMeta = (value) => {
  return purposeOptions.find((item) => item.value === value) || purposeOptions[0];
};

const getPurposeClass = (value) => {
  const map = {
    hotel: "border-blue-100 bg-blue-50 text-blue-600",
    room: "border-emerald-100 bg-emerald-50 text-emerald-600",
  };

  return map[value] || map.hotel;
};

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [purposeDropdownOpen, setPurposeDropdownOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");

  const dropdownRef = useRef(null);
  const purposeDropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    icon: "wifi",
    usage_scope: "hotel",
    status: true,
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/facilities");

      setFacilities(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("GET FACILITIES ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Data fasilitas gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (
        purposeDropdownRef.current &&
        !purposeDropdownRef.current.contains(event.target)
      ) {
        setPurposeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildFacilityPayload = (data, withPurpose = true) => {
    const basePayload = {
      name: data.name,
      icon: data.icon,
      status: data.status,
    };

    if (!withPurpose) return basePayload;

    return {
      ...basePayload,
      usage_scope: data.usage_scope,
      scope: data.usage_scope,
      facility_scope: data.usage_scope,
      facility_type: data.usage_scope,
      target: data.usage_scope,
      type_for: data.usage_scope,
      used_for: data.usage_scope,
    };
  };

  const shouldRetryWithoutPurpose = (error) => {
    const message = String(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        ""
    ).toLowerCase();

    return (
      error?.response?.status === 422 ||
      message.includes("usage_scope") ||
      message.includes("scope") ||
      message.includes("facility_scope") ||
      message.includes("facility_type") ||
      message.includes("target") ||
      message.includes("unknown column")
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectIcon = (value) => {
    setForm((prev) => ({
      ...prev,
      icon: value,
    }));

    setDropdownOpen(false);
  };

  const handleSelectPurpose = (value) => {
    setForm((prev) => ({
      ...prev,
      usage_scope: value,
    }));

    setPurposeDropdownOpen(false);
  };

  const resetForm = () => {
    setForm({
      name: "",
      icon: "wifi",
      usage_scope: "hotel",
      status: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops",
        text: "Nama fasilitas wajib diisi",
        confirmButtonColor: "#dc2626",
      });

      return;
    }

    try {
      setSaving(true);

      try {
        await api.post("/admin/facilities", buildFacilityPayload(form, true));
      } catch (error) {
        if (!shouldRetryWithoutPurpose(error)) throw error;

        await api.post("/admin/facilities", buildFacilityPayload(form, false));

        Swal.fire({
          icon: "warning",
          title: "Fasilitas Tersimpan",
          text: "Fasilitas berhasil ditambahkan, tapi kategori belum tersimpan karena backend belum support field kategori.",
          confirmButtonColor: "#dc2626",
        });

        resetForm();
        fetchFacilities();
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Fasilitas berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
      });

      resetForm();
      fetchFacilities();
    } catch (err) {
      console.error("POST FACILITY ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Fasilitas gagal ditambahkan",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (facility) => {
    const currentPurpose = normalizePurpose(facility);

    const payload = {
      name: facility.name,
      icon: facility.icon,
      usage_scope: currentPurpose,
      status: !facility.status,
    };

    try {
      try {
        await api.put(
          `/admin/facilities/${facility.id}`,
          buildFacilityPayload(payload, true)
        );
      } catch (error) {
        if (!shouldRetryWithoutPurpose(error)) throw error;

        await api.put(
          `/admin/facilities/${facility.id}`,
          buildFacilityPayload(payload, false)
        );
      }

      fetchFacilities();
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Status fasilitas gagal diubah",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleDelete = async (facility) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus fasilitas?",
      text: `Fasilitas "${facility.name}" akan dihapus dari daftar master fasilitas.`,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(facility.id);

      await api.delete(`/admin/facilities/${facility.id}`);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Fasilitas berhasil dihapus",
        confirmButtonColor: "#dc2626",
      });

      fetchFacilities();
    } catch (err) {
      console.error("DELETE FACILITY ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Fasilitas gagal dihapus. Jika fasilitas sudah dipakai hotel/kamar, lebih aman nonaktifkan saja.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const selectedIcon =
    iconOptions.find((item) => item.value === form.icon) || iconOptions[0];
  const SelectedIconComponent = selectedIcon.icon;

  const selectedPurpose = getPurposeMeta(form.usage_scope);
  const SelectedPurposeIcon = selectedPurpose.icon;

  const filteredFacilities = facilities.filter((facility) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const currentPurpose = normalizePurpose(facility);

    const matchPurpose =
      purposeFilter === "all" || currentPurpose === purposeFilter;

    const purpose = getPurposeMeta(currentPurpose);

    const matchKeyword =
      !keyword ||
      [
        facility?.name,
        facility?.icon,
        purpose?.label,
        currentPurpose,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchPurpose && matchKeyword;
  });

  const activeCount = facilities.filter((item) => Boolean(item.status)).length;
  const roomCount = facilities.filter(
    (item) => normalizePurpose(item) === "room"
  ).length;
  const hotelCount = facilities.filter(
    (item) => normalizePurpose(item) === "hotel"
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  Admin Panel
                </p>

                <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                  Management Facilities
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                  Kelola master fasilitas untuk kebutuhan hotel dan kamar agar
                  data tetap rapi saat input properti.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-black text-gray-950">
                    {facilities.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Hotel
                  </p>
                  <p className="mt-1 text-2xl font-black text-blue-700">
                    {hotelCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Kamar
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {roomCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="sticky top-6 rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <Plus size={22} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-gray-950">
                        Tambah Fasilitas
                      </h2>
                      <p className="text-sm text-gray-500">
                        Tambahkan fasilitas baru untuk master data.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Nama Fasilitas
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Contoh: AC, TV, Air Panas"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Dipakai Untuk
                      </label>

                      <div className="relative" ref={purposeDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setPurposeDropdownOpen(!purposeDropdownOpen)
                          }
                          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition hover:border-red-300 focus:ring-4 focus:ring-red-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${getPurposeClass(
                                form.usage_scope
                              )}`}
                            >
                              <SelectedPurposeIcon size={18} />
                            </div>

                            <div className="text-left">
                              <p className="text-sm font-black text-gray-900">
                                {selectedPurpose.label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {selectedPurpose.description}
                              </p>
                            </div>
                          </div>

                          <ChevronDown
                            size={18}
                            className={`text-gray-500 transition ${
                              purposeDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {purposeDropdownOpen && (
                          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                            {purposeOptions.map((item) => {
                              const ItemIcon = item.icon;

                              return (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => handleSelectPurpose(item.value)}
                                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-50 ${
                                    form.usage_scope === item.value
                                      ? "bg-red-50"
                                      : "bg-white"
                                  }`}
                                >
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${getPurposeClass(
                                      item.value
                                    )}`}
                                  >
                                    <ItemIcon size={18} />
                                  </div>

                                  <div>
                                    <p className="text-sm font-black text-gray-900">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {item.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Icon Fasilitas
                      </label>

                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition hover:border-red-300 focus:ring-4 focus:ring-red-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                              <SelectedIconComponent size={18} />
                            </div>

                            <div className="text-left">
                              <p className="text-sm font-black text-gray-900">
                                {selectedIcon.label}
                              </p>
                              <p className="text-xs text-gray-400">
                                {selectedIcon.value}
                              </p>
                            </div>
                          </div>

                          <ChevronDown
                            size={18}
                            className={`text-gray-500 transition ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                            <div className="max-h-72 overflow-y-auto">
                              {iconOptions.map((item) => {
                                const ItemIcon = item.icon;

                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => handleSelectIcon(item.value)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-50 ${
                                      form.icon === item.value
                                        ? "bg-red-50"
                                        : "bg-white"
                                    }`}
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                      <ItemIcon size={18} />
                                    </div>

                                    <div>
                                      <p className="text-sm font-black text-gray-900">
                                        {item.label}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {item.value}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <input
                        type="checkbox"
                        id="status"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                        className="h-4 w-4 accent-red-600"
                      />

                      <label
                        htmlFor="status"
                        className="text-sm font-bold text-gray-700"
                      >
                        Aktifkan fasilitas
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-2xl bg-red-600 py-3.5 font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Menyimpan..." : "Simpan Fasilitas"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <Layers3 size={22} />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-gray-950">
                          Daftar Fasilitas
                        </h2>
                        <p className="text-sm text-gray-500">
                          Data fasilitas aktif dan nonaktif di sistem.
                        </p>
                      </div>
                    </div>

                    <div className="relative w-full xl:w-72">
                      <Search
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Cari fasilitas..."
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {filterOptions.map((item) => {
                      const FilterIcon = item.icon;
                      const isActive = purposeFilter === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setPurposeFilter(item.value)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${
                            isActive
                              ? "border-gray-950 bg-gray-950 text-white shadow-lg shadow-gray-200"
                              : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <FilterIcon size={14} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {loading ? (
                    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-center">
                      <div>
                        <p className="text-sm font-black text-gray-800">
                          Memuat data fasilitas...
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Mohon tunggu sebentar.
                        </p>
                      </div>
                    </div>
                  ) : filteredFacilities.length === 0 ? (
                    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-center">
                      <div>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                          <ShieldCheck size={24} />
                        </div>

                        <p className="text-base font-black text-gray-900">
                          Belum ada fasilitas yang cocok
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                          Tambahkan fasilitas baru atau ubah filter pencarian.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-gray-100">
                      <table className="w-full min-w-[760px]">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50 text-left">
                            <th className="w-12 px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                              #
                            </th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                              Fasilitas
                            </th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                              Icon
                            </th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                              Untuk
                            </th>
                            <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-400">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredFacilities.map((item, index) => {
                            const TableIcon = getIconComponent(item.icon);
                            const purposeValue = normalizePurpose(item);
                            const purpose = getPurposeMeta(purposeValue);
                            const PurposeIcon = purpose.icon;

                            return (
                              <tr
                                key={item.id}
                                className="border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                              >
                                <td className="px-4 py-4 text-sm font-bold text-gray-400">
                                  {index + 1}
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                      <TableIcon size={18} />
                                    </div>

                                    <div>
                                      <p className="font-black text-gray-900">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Master fasilitas
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                    {item.icon || "-"}
                                  </span>
                                </td>

                                <td className="px-4 py-4">
                                  <div
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-black ${getPurposeClass(
                                      purposeValue
                                    )}`}
                                    title={purpose.description}
                                  >
                                    <PurposeIcon size={15} />
                                    <span>{purpose.label}</span>
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus(item)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black transition ${
                                      item.status
                                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {item.status ? (
                                      <>
                                        <CheckCircle2 size={16} />
                                        Aktif
                                      </>
                                    ) : (
                                      <>
                                        <CircleOff size={16} />
                                        Nonaktif
                                      </>
                                    )}
                                  </button>
                                </td>

                                <td className="px-4 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.id}
                                    className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 size={15} />
                                    {deletingId === item.id
                                      ? "Menghapus..."
                                      : "Hapus"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-4 text-xs font-semibold text-gray-400">
                    Menampilkan {filteredFacilities.length} dari{" "}
                    {facilities.length} fasilitas. Aktif: {activeCount}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}