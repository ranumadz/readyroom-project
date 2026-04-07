import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  BellRing,
  Plus,
  Pencil,
  Trash2,
  Power,
  Users,
  Monitor,
  LayoutPanelTop,
  X,
} from "lucide-react";

const ALL_TARGET_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "receptionist", label: "Receptionist" },
  { value: "pengawas", label: "Pengawas" },
  { value: "super_admin", label: "Super Admin" },
];

export default function InternalBroadcasts() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const isIT = (adminUser?.role || "").toLowerCase() === "it";

  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    message: "",
    target_roles: ["admin", "receptionist", "pengawas", "super_admin"],
    show_as_modal: true,
    show_as_banner: false,
    is_active: true,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    message: "",
    target_roles: [],
    show_as_modal: true,
    show_as_banner: false,
    is_active: true,
  });

  useEffect(() => {
    if (isIT) {
      fetchBroadcasts();
    }
  }, [isIT]);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/admin/internal-broadcasts?user_id=${adminUser?.id}`
      );

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setBroadcasts(data);
    } catch (error) {
      console.error("GET BROADCASTS ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal mengambil data broadcast");
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      message: "",
      target_roles: ["admin", "receptionist", "pengawas", "super_admin"],
      show_as_modal: true,
      show_as_banner: false,
      is_active: true,
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  const openEditModal = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setEditForm({
      title: broadcast.title || "",
      message: broadcast.message || "",
      target_roles: Array.isArray(broadcast.target_roles)
        ? broadcast.target_roles
        : [],
      show_as_modal: !!broadcast.show_as_modal,
      show_as_banner: !!broadcast.show_as_banner,
      is_active: !!broadcast.is_active,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedBroadcast(null);
    setEditForm({
      title: "",
      message: "",
      target_roles: [],
      show_as_modal: true,
      show_as_banner: false,
      is_active: true,
    });
  };

  const toggleCreateRole = (role) => {
    setCreateForm((prev) => {
      const exists = prev.target_roles.includes(role);

      return {
        ...prev,
        target_roles: exists
          ? prev.target_roles.filter((item) => item !== role)
          : [...prev.target_roles, role],
      };
    });
  };

  const toggleEditRole = (role) => {
    setEditForm((prev) => {
      const exists = prev.target_roles.includes(role);

      return {
        ...prev,
        target_roles: exists
          ? prev.target_roles.filter((item) => item !== role)
          : [...prev.target_roles, role],
      };
    });
  };

  const handleCreateBroadcast = async () => {
    if (!isIT) {
      toast.error("Hanya role IT yang boleh membuat broadcast");
      return;
    }

    if (!createForm.title.trim()) {
      toast.error("Judul broadcast wajib diisi");
      return;
    }

    if (!createForm.message.trim()) {
      toast.error("Isi broadcast wajib diisi");
      return;
    }

    if (createForm.target_roles.length === 0) {
      toast.error("Pilih minimal 1 target role");
      return;
    }

    try {
      setSavingCreate(true);

      await api.post("/admin/internal-broadcasts", {
        sent_by: adminUser?.id,
        title: createForm.title.trim(),
        message: createForm.message.trim(),
        target_roles: createForm.target_roles,
        show_as_modal: createForm.show_as_modal,
        show_as_banner: createForm.show_as_banner,
        is_active: createForm.is_active,
      });

      toast.success("Broadcast berhasil dibuat");
      closeCreateModal();
      fetchBroadcasts();
    } catch (error) {
      console.error("CREATE BROADCAST ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal membuat broadcast");
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdateBroadcast = async () => {
    if (!selectedBroadcast) return;

    if (!editForm.title.trim()) {
      toast.error("Judul broadcast wajib diisi");
      return;
    }

    if (!editForm.message.trim()) {
      toast.error("Isi broadcast wajib diisi");
      return;
    }

    if (editForm.target_roles.length === 0) {
      toast.error("Pilih minimal 1 target role");
      return;
    }

    try {
      setSavingEdit(true);

      await api.put(`/admin/internal-broadcasts/${selectedBroadcast.id}`, {
        updated_by: adminUser?.id,
        title: editForm.title.trim(),
        message: editForm.message.trim(),
        target_roles: editForm.target_roles,
        show_as_modal: editForm.show_as_modal,
        show_as_banner: editForm.show_as_banner,
        is_active: editForm.is_active,
      });

      toast.success("Broadcast berhasil diupdate");
      closeEditModal();
      fetchBroadcasts();
    } catch (error) {
      console.error("UPDATE BROADCAST ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update broadcast");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (broadcastId) => {
    try {
      await api.post(`/admin/internal-broadcasts/${broadcastId}/toggle-status`, {
        changed_by: adminUser?.id,
      });

      toast.success("Status broadcast berhasil diubah");
      fetchBroadcasts();
    } catch (error) {
      console.error("TOGGLE BROADCAST ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus broadcast ini?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/internal-broadcasts/${broadcastId}`, {
        data: {
          deleted_by: adminUser?.id,
        },
      });

      toast.success("Broadcast berhasil dihapus");
      fetchBroadcasts();
    } catch (error) {
      console.error("DELETE BROADCAST ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menghapus broadcast");
    }
  };

  const getRoleLabel = (role) => {
    const found = ALL_TARGET_ROLES.find((item) => item.value === role);
    return found ? found.label : role;
  };

  if (!isIT) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6 md:p-8">
            <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-gray-800">
                Akses Ditolak
              </h1>
              <p className="mt-3 text-gray-500">
                Halaman broadcast internal hanya untuk role IT ReadyRoom.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-cyan-600">
              IT ReadyRoom
            </p>
            <h1 className="text-3xl font-bold text-gray-800">
              Internal Broadcast
            </h1>
            <p className="mt-1 text-gray-500">
              Kelola pesan broadcast untuk seluruh role kecuali boss.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
            <SummaryCard
              icon={<BellRing size={20} />}
              title="Total Broadcast"
              value={broadcasts.length}
            />
            <SummaryCard
              icon={<Monitor size={20} />}
              title="Broadcast Aktif"
              value={broadcasts.filter((item) => item.is_active).length}
            />
            <SummaryCard
              icon={<LayoutPanelTop size={20} />}
              title="Mode Modal"
              value={broadcasts.filter((item) => item.show_as_modal).length}
            />
            <SummaryCard
              icon={<Users size={20} />}
              title="Dibuat IT"
              value={broadcasts.filter((item) => item.sent_by === adminUser?.id).length}
            />
          </div>

          <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Daftar Broadcast Internal
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Broadcast yang sudah dibuat oleh tim IT ReadyRoom.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                <Plus size={18} />
                Buat Broadcast
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data broadcast...
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
                <h3 className="text-lg font-bold text-gray-800">
                  Belum ada broadcast
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Buat broadcast pertama untuk admin, receptionist, pengawas, atau super admin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-800">
                            {broadcast.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              broadcast.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {broadcast.is_active ? "Aktif" : "Nonaktif"}
                          </span>

                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                            {broadcast.show_as_modal ? "Modal" : "Tanpa Modal"}
                          </span>

                          {broadcast.show_as_banner && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Banner
                            </span>
                          )}
                        </div>

                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                          {broadcast.message}
                        </p>

                        <div className="mt-4">
                          <p className="mb-2 text-sm text-gray-400">
                            Target Role
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {(broadcast.target_roles || []).map((role) => (
                              <span
                                key={role}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                              >
                                {getRoleLabel(role)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          Dikirim oleh:{" "}
                          <span className="font-semibold text-gray-700">
                            {broadcast.sender?.name || "IT ReadyRoom"}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full flex-wrap gap-3 xl:w-auto xl:flex-col">
                        <button
                          type="button"
                          onClick={() => openEditModal(broadcast)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
                        >
                          <Pencil size={18} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(broadcast.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                        >
                          <Power size={18} />
                          {broadcast.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBroadcast(broadcast.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                        >
                          <Trash2 size={18} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <BroadcastModalForm
          title="Buat Broadcast Baru"
          subtitle="Kirim pengumuman internal dari IT ReadyRoom."
          form={createForm}
          setForm={setCreateForm}
          onClose={closeCreateModal}
          onSubmit={handleCreateBroadcast}
          loading={savingCreate}
          toggleRole={toggleCreateRole}
        />
      )}

      {showEditModal && selectedBroadcast && (
        <BroadcastModalForm
          title="Edit Broadcast"
          subtitle="Perbarui isi dan target role broadcast internal."
          form={editForm}
          setForm={setEditForm}
          onClose={closeEditModal}
          onSubmit={handleUpdateBroadcast}
          loading={savingEdit}
          toggleRole={toggleEditRole}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
        {icon}
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}

function BroadcastModalForm({
  title,
  subtitle,
  form,
  setForm,
  onClose,
  onSubmit,
  loading,
  toggleRole,
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4">
          <InputField
            label="Judul Broadcast"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Masukkan judul broadcast"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Isi Broadcast
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Masukkan isi broadcast"
              rows={6}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Target Role
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {ALL_TARGET_ROLES.map((item) => {
                const checked = form.target_roles.includes(item.value);

                return (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      checked
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(item.value)}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="font-medium text-gray-800">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.show_as_modal}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    show_as_modal: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Tampilkan sebagai modal
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.show_as_banner}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    show_as_banner: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Tandai banner
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Broadcast aktif
              </span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Menyimpan..." : "Simpan Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}