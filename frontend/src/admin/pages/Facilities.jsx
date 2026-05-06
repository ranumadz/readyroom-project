import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Plus,
  Layers3,
  ChevronDown,
  Building2,
  DoorOpen,
  Trash2,
  ShieldCheck,
  Search,
  X,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [purposeDropdownOpen, setPurposeDropdownOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");

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
      icon: data.icon || "wifi",
      status: data.status ?? true,
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

  const getDefaultScopeFromFilter = () => {
    if (purposeFilter === "room") return "room";
    return "hotel";
  };

  const resetForm = (nextScope = getDefaultScopeFromFilter()) => {
    setForm({
      name: "",
      icon: "wifi",
      usage_scope: nextScope,
      status: true,
    });
  };

  const openCreateModal = (scope = null) => {
    const nextScope = scope || getDefaultScopeFromFilter();
    resetForm(nextScope);
    setPurposeDropdownOpen(false);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setPurposeDropdownOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectPurpose = (value) => {
    setForm((prev) => ({
      ...prev,
      usage_scope: value,
    }));

    setPurposeDropdownOpen(false);
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

        closeCreateModal();
        fetchFacilities();
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Fasilitas berhasil ditambahkan",
        confirmButtonColor: "#dc2626",
      });

      closeCreateModal();
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
      [facility?.name, purpose?.label, currentPurpose]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchPurpose && matchKeyword;
  });

  const roomCount = facilities.filter(
    (item) => normalizePurpose(item) === "room"
  ).length;

  const hotelCount = facilities.filter(
    (item) => normalizePurpose(item) === "hotel"
  ).length;

  const createButtonLabel =
    purposeFilter === "room"
      ? "Tambah Fasilitas Kamar"
      : purposeFilter === "hotel"
      ? "Tambah Fasilitas Hotel"
      : "Tambah Fasilitas";

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm md:p-6">
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
                      Pilih kategori, cari data, atau tambah fasilitas dari tombol di kanan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-72">
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

                  <button
                    type="button"
                    onClick={() => openCreateModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                  >
                    <Plus size={17} />
                    {createButtonLabel}
                  </button>
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
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

                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600">
                    Total: {facilities.length}
                  </span>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">
                    Hotel: {hotelCount}
                  </span>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                    Kamar: {roomCount}
                  </span>
                </div>
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
                  <table className="w-full min-w-[620px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left">
                        <th className="w-12 px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                          #
                        </th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                          Fasilitas
                        </th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-400">
                          Untuk
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-gray-400">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFacilities.map((item, index) => {
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
                              <div>
                                <p className="font-black text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Master fasilitas
                                </p>
                              </div>
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
                Menampilkan {filteredFacilities.length} dari {facilities.length} fasilitas.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-red-600">
                  Fasilitas Baru
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  {form.usage_scope === "room"
                    ? "Tambah Fasilitas Kamar"
                    : "Tambah Fasilitas Hotel"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Isi nama fasilitas dan pilih penggunaannya.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
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
                  autoFocus
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
                    onClick={() => setPurposeDropdownOpen(!purposeDropdownOpen)}
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

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm font-bold text-blue-800">Catatan</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  Icon dan status fasilitas disimpan otomatis oleh sistem. Admin cukup isi nama fasilitas dan pilih dipakai untuk Hotel atau Kamar.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <X size={17} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={17} />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
