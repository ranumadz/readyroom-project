import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Users as UsersIcon,
  ShieldCheck,
  Search,
  KeyRound,
  Plus,
  Pencil,
  Power,
  RotateCcw,
  Mail,
  Phone,
  UserCog,
  Building2,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function UsersPage() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const currentRole = (adminUser?.role || "").toLowerCase();

  const isBoss = currentRole === "boss";
  const isIT = currentRole === "it";
  const isBossOrIT = isBoss || isIT;
  const isBossOrSuperAdmin =
    currentRole === "boss" || currentRole === "super_admin";

  const [activeTab, setActiveTab] = useState("internal");
  const [loading, setLoading] = useState(true);

  const [internalUsers, setInternalUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
    status: true,
    hotel_ids: [],
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedInternalUser, setSelectedInternalUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
    status: true,
    hotel_ids: [],
  });

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingResetPassword, setSavingResetPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    fetchUsersData();
    fetchHotels();
  }, []);

  const fetchUsersData = async () => {
    try {
      setLoading(true);

      const [internalRes, customerRes] = await Promise.all([
        api.get("/admin/users/admin"),
        api.get("/admin/users/customers"),
      ]);

      const internalData = Array.isArray(internalRes.data?.data)
        ? internalRes.data.data
        : Array.isArray(internalRes.data)
        ? internalRes.data
        : [];

      const customerData = Array.isArray(customerRes.data?.data)
        ? customerRes.data.data
        : Array.isArray(customerRes.data)
        ? customerRes.data
        : [];

      setInternalUsers(internalData);
      setCustomers(customerData);
    } catch (error) {
      console.error("GET USERS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil data users");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/admin/hotels");

      const hotelData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.hotels)
        ? res.data.hotels
        : Array.isArray(res.data)
        ? res.data
        : [];

      setHotels(hotelData);
    } catch (error) {
      console.error("GET HOTELS ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil data hotel");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
  };

  const filteredInternalUsers = useMemo(() => {
    return internalUsers.filter((user) => {
      const keyword = search.toLowerCase();

      const hotelNames = Array.isArray(user.hotels)
        ? user.hotels.map((hotel) => hotel.name?.toLowerCase() || "").join(" ")
        : "";

      const matchSearch =
        !search ||
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword) ||
        hotelNames.includes(keyword);

      const matchRole = !roleFilter || user.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [internalUsers, search, roleFilter]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const keyword = search.toLowerCase();

      return (
        !search ||
        customer.name?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "boss":
        return "bg-red-50 text-red-700 border border-red-100";
      case "super_admin":
        return "bg-violet-50 text-violet-700 border border-violet-100";
      case "admin":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "receptionist":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "pengawas":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "it":
        return "bg-cyan-50 text-cyan-700 border border-cyan-100";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-100";
    }
  };

  const getStatusBadgeClass = (status) => {
    return status
      ? "bg-green-50 text-green-700 border border-green-100"
      : "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "receptionist":
        return "Receptionist";
      case "pengawas":
        return "Pengawas";
      case "it":
        return "IT";
      case "boss":
        return "Boss";
      case "admin":
        return "Admin";
      default:
        return role || "-";
    }
  };

  const canCreateInternalUser = () => {
    return isBossOrIT;
  };

  const canEditInternalUser = (target) => {
    if (!adminUser || !target) return false;

    if (isBoss) return true;

    if (isIT) {
      return target.role !== "boss";
    }

    return false;
  };

  const canResetPassword = (target, type) => {
    if (!adminUser) return false;

    if (isBoss) {
      return true;
    }

    if (currentRole === "super_admin") {
      if (type === "customer") return true;
      if (type === "internal") {
        return target.role !== "boss";
      }
    }

    if (isIT) {
      if (type === "customer") return false;
      if (type === "internal") {
        return target.role !== "boss";
      }
    }

    return false;
  };

  const canToggleInternalStatus = (target) => {
    if (!adminUser || !target) return false;

    if (isBoss) return true;

    if (isIT) {
      return target.role !== "boss";
    }

    return false;
  };

  const canDeleteInternalUser = (target) => {
    if (!adminUser || !target) return false;
    if (!isBossOrIT) return false;
    if (target.role === "boss") return false;
    if (Number(target.id) === Number(adminUser?.id)) return false;

    if (isIT) {
      return target.role !== "boss";
    }

    return true;
  };

  const roleNeedsHotelAssignment = (role) => {
    return role === "admin" || role === "receptionist" || role === "pengawas";
  };

  const roleHasAllBranchAccess = (role) => {
    return role === "boss" || role === "super_admin" || role === "it";
  };

  const normalizeHotelIds = (hotelIds) => {
    if (!Array.isArray(hotelIds)) return [];
    return hotelIds.map((id) => Number(id)).filter(Boolean);
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "role" && !roleNeedsHotelAssignment(value)) {
        next.hotel_ids = [];
      }

      return next;
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "role" && !roleNeedsHotelAssignment(value)) {
        next.hotel_ids = [];
      }

      return next;
    });
  };

  const toggleAddHotel = (hotelId) => {
    setAddForm((prev) => {
      const exists = prev.hotel_ids.includes(hotelId);

      return {
        ...prev,
        hotel_ids: exists
          ? prev.hotel_ids.filter((id) => id !== hotelId)
          : [...prev.hotel_ids, hotelId],
      };
    });
  };

  const toggleEditHotel = (hotelId) => {
    setEditForm((prev) => {
      const exists = prev.hotel_ids.includes(hotelId);

      return {
        ...prev,
        hotel_ids: exists
          ? prev.hotel_ids.filter((id) => id !== hotelId)
          : [...prev.hotel_ids, hotelId],
      };
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "admin",
      status: true,
      hotel_ids: [],
    });
  };

  const openEditModal = (user) => {
    setSelectedInternalUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "admin",
      status: !!user.status,
      hotel_ids: normalizeHotelIds(user.hotels?.map((hotel) => hotel.id) || []),
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedInternalUser(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
      role: "admin",
      status: true,
      hotel_ids: [],
    });
  };

  const openResetPasswordModal = (target, type) => {
    if (!canResetPassword(target, type)) {
      toast.error("Kamu tidak punya akses untuk reset password user ini");
      return;
    }

    setResetPasswordTarget({
      id: target.id,
      name: target.name,
      role: target.role || null,
      type,
    });
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setResetPasswordTarget(null);
    setNewPassword("");
  };

  const openDeleteModal = (user) => {
    if (!canDeleteInternalUser(user)) {
      toast.error("Kamu tidak punya akses untuk menghapus user ini");
      return;
    }

    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingUser) return;
    setDeleteTarget(null);
    setShowDeleteModal(false);
  };

  const handleCreateInternalUser = async () => {
    if (!canCreateInternalUser()) {
      toast.error("Hanya boss atau IT yang boleh menambah user internal");
      return;
    }

    if (!addForm.name.trim()) return toast.error("Nama wajib diisi");
    if (!addForm.email.trim()) return toast.error("Email wajib diisi");
    if (!addForm.password.trim()) return toast.error("Password wajib diisi");

    if (
      roleNeedsHotelAssignment(addForm.role) &&
      addForm.hotel_ids.length === 0
    ) {
      return toast.error("Pilih minimal 1 cabang untuk role ini");
    }

    try {
      setSavingAdd(true);

      await api.post("/admin/users/admin", {
        created_by: adminUser?.id,
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || null,
        password: addForm.password,
        role: addForm.role,
        status: addForm.status,
        hotel_ids: roleNeedsHotelAssignment(addForm.role)
          ? addForm.hotel_ids
          : [],
      });

      toast.success("User internal berhasil ditambahkan");
      closeAddModal();
      fetchUsersData();
    } catch (error) {
      console.error("CREATE INTERNAL USER ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menambah user internal");
    } finally {
      setSavingAdd(false);
    }
  };

  const handleUpdateInternalUser = async () => {
    if (!selectedInternalUser) return;

    if (!canEditInternalUser(selectedInternalUser)) {
      toast.error("Kamu tidak punya akses untuk edit user ini");
      return;
    }

    if (!editForm.name.trim()) return toast.error("Nama wajib diisi");
    if (!editForm.email.trim()) return toast.error("Email wajib diisi");

    if (
      roleNeedsHotelAssignment(editForm.role) &&
      editForm.hotel_ids.length === 0
    ) {
      return toast.error("Pilih minimal 1 cabang untuk role ini");
    }

    try {
      setSavingEdit(true);

      await api.put(`/admin/users/admin/${selectedInternalUser.id}`, {
        updated_by: adminUser?.id,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role,
        status: editForm.status,
        hotel_ids: roleNeedsHotelAssignment(editForm.role)
          ? editForm.hotel_ids
          : [],
      });

      toast.success("User internal berhasil diupdate");
      closeEditModal();
      fetchUsersData();
    } catch (error) {
      console.error("UPDATE INTERNAL USER ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update user internal");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmitResetPassword = async () => {
    if (!resetPasswordTarget) return;

    if (!newPassword.trim()) {
      toast.error("Password baru wajib diisi");
      return;
    }

    try {
      setSavingResetPassword(true);

      const endpoint =
        resetPasswordTarget.type === "internal"
          ? `/admin/users/admin/${resetPasswordTarget.id}/reset-password`
          : `/admin/users/customers/${resetPasswordTarget.id}/reset-password`;

      await api.post(endpoint, {
        new_password: newPassword,
        changed_by: adminUser?.id,
      });

      toast.success("Password berhasil direset");
      closeResetPasswordModal();
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal reset password");
    } finally {
      setSavingResetPassword(false);
    }
  };

  const handleToggleStatus = async (id, type) => {
    const target =
      type === "internal"
        ? internalUsers.find((user) => user.id === id)
        : customers.find((customer) => customer.id === id);

    if (type === "internal" && !canToggleInternalStatus(target)) {
      toast.error("Kamu tidak punya akses untuk mengubah status user ini");
      return;
    }

    if (type === "customer" && !isBossOrSuperAdmin) {
      toast.error("Kamu tidak punya akses untuk mengubah status customer");
      return;
    }

    try {
      const endpoint =
        type === "internal"
          ? `/admin/users/admin/${id}/toggle-status`
          : `/admin/users/customers/${id}/toggle-status`;

      await api.post(endpoint, {
        changed_by: adminUser?.id,
      });

      toast.success("Status berhasil diubah");
      fetchUsersData();
    } catch (error) {
      console.error("TOGGLE STATUS ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingUser(true);

      await api.delete(`/admin/users/admin/${deleteTarget.id}`, {
        data: {
          deleted_by: adminUser?.id,
        },
      });

      toast.success("User berhasil dihapus");
      closeDeleteModal();
      fetchUsersData();
    } catch (error) {
      console.error("DELETE USER ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal menghapus user");
    } finally {
      setDeletingUser(false);
    }
  };

  const calmActionClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300";
  const calmDangerClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-red-600">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Users</h1>
            <p className="mt-1 text-gray-500">
              Kelola user internal panel admin dan customer web dalam satu halaman.
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                    activeTab === "internal"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ShieldCheck size={18} />
                  User Internal
                </button>

                <button
                  onClick={() => setActiveTab("customer")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                    activeTab === "customer"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <UsersIcon size={18} />
                  Customer Web
                </button>
              </div>

              {activeTab === "internal" && canCreateInternalUser() && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  <Plus size={18} />
                  Tambah User Internal
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "internal"
                      ? "Cari nama, email, telepon, role, cabang"
                      : "Cari nama atau telepon customer"
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              {activeTab === "internal" ? (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="">Semua Role</option>
                  <option value="boss">Boss</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="pengawas">Pengawas</option>
                  <option value="it">IT</option>
                </select>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                >
                  <RotateCcw size={18} />
                  Reset Filter
                </button>
              )}
            </div>

            {activeTab === "internal" && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-300"
                >
                  <RotateCcw size={16} />
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data users...
              </div>
            ) : activeTab === "internal" ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Daftar User Internal
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total: {filteredInternalUsers.length}
                  </span>
                </div>

                {filteredInternalUsers.length === 0 ? (
                  <EmptyState
                    title="User internal tidak ditemukan"
                    desc="Coba ubah kata kunci pencarian atau filter role."
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredInternalUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-800">
                                {user.name}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                                  user.role
                                )}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                  user.status
                                )}`}
                              >
                                {user.status ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>

                            <div className="grid gap-4 text-sm md:grid-cols-3">
                              <div className="flex items-start gap-3">
                                <Mail size={16} className="mt-0.5 text-red-500" />
                                <div>
                                  <p className="text-gray-400">Email</p>
                                  <p className="break-all font-semibold text-gray-800">
                                    {user.email || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Phone size={16} className="mt-0.5 text-red-500" />
                                <div>
                                  <p className="text-gray-400">Nomor HP</p>
                                  <p className="font-semibold text-gray-800">
                                    {user.phone || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <UserCog size={16} className="mt-0.5 text-red-500" />
                                <div>
                                  <p className="text-gray-400">ID User</p>
                                  <p className="font-semibold text-gray-800">
                                    #{user.id}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="mb-2 text-sm text-gray-400">
                                Cabang Akses
                              </p>

                              {roleHasAllBranchAccess(user.role) ? (
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                      user.role === "it"
                                        ? "bg-cyan-100 text-cyan-700"
                                        : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    <Building2 size={14} />
                                    Semua Cabang
                                  </span>
                                </div>
                              ) : Array.isArray(user.hotels) && user.hotels.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {user.hotels.map((hotel) => (
                                    <span
                                      key={hotel.id}
                                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                                    >
                                      <Building2
                                        size={14}
                                        className="text-red-500"
                                      />
                                      {hotel.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                  Belum ada cabang dipilih
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:flex-col">
                            {canEditInternalUser(user) && (
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className={calmActionClass}
                              >
                                <Pencil size={16} />
                                Edit
                              </button>
                            )}

                            {canResetPassword(user, "internal") && (
                              <button
                                type="button"
                                onClick={() =>
                                  openResetPasswordModal(user, "internal")
                                }
                                className={calmActionClass}
                              >
                                <KeyRound size={16} />
                                Password
                              </button>
                            )}

                            {canToggleInternalStatus(user) && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(user.id, "internal")
                                }
                                className={calmActionClass}
                              >
                                <Power size={16} />
                                {user.status ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            )}

                            {canDeleteInternalUser(user) && (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(user)}
                                className={calmDangerClass}
                              >
                                <Trash2 size={16} />
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    Daftar Customer Web
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total: {filteredCustomers.length}
                  </span>
                </div>

                {filteredCustomers.length === 0 ? (
                  <EmptyState
                    title="Customer tidak ditemukan"
                    desc="Coba ubah kata kunci pencarian customer."
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold text-gray-800">
                                {customer.name}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                  customer.status
                                )}`}
                              >
                                {customer.status ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>

                            <div className="grid gap-4 text-sm md:grid-cols-3">
                              <div className="flex items-start gap-3">
                                <Phone size={16} className="mt-0.5 text-red-500" />
                                <div>
                                  <p className="text-gray-400">Nomor HP</p>
                                  <p className="font-semibold text-gray-800">
                                    {customer.phone || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <ShieldCheck
                                  size={16}
                                  className="mt-0.5 text-red-500"
                                />
                                <div>
                                  <p className="text-gray-400">Verifikasi</p>
                                  <p className="font-semibold text-gray-800">
                                    {customer.is_verified
                                      ? "Terverifikasi"
                                      : "Belum Verifikasi"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <UserCog size={16} className="mt-0.5 text-red-500" />
                                <div>
                                  <p className="text-gray-400">ID Customer</p>
                                  <p className="font-semibold text-gray-800">
                                    #{customer.id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:flex-col">
                            {canResetPassword(customer, "customer") && (
                              <button
                                type="button"
                                onClick={() =>
                                  openResetPasswordModal(customer, "customer")
                                }
                                className={calmActionClass}
                              >
                                <KeyRound size={16} />
                                Password
                              </button>
                            )}

                            {isBossOrSuperAdmin && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(customer.id, "customer")
                                }
                                className={calmActionClass}
                              >
                                <Power size={16} />
                                {customer.status ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <ModalShell onClose={closeAddModal}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Tambah User Internal
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan user internal baru sesuai role dan cabang akses.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nama"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Masukkan nama"
            />
            <InputField
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Masukkan email"
            />
            <InputField
              label="Nomor HP"
              value={addForm.phone}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Masukkan nomor HP"
            />
            <InputField
              label="Password"
              type="password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Masukkan password"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={addForm.role}
                onChange={handleAddChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="receptionist">Receptionist</option>
                <option value="pengawas">Pengawas</option>
                <option value="it">IT</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input
                id="add-status"
                name="status"
                type="checkbox"
                checked={addForm.status}
                onChange={handleAddChange}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label
                htmlFor="add-status"
                className="text-sm font-semibold text-gray-700"
              >
                Aktifkan user
              </label>
            </div>
          </div>

          {roleNeedsHotelAssignment(addForm.role) && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Pilih Cabang Akses
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {hotels.map((hotel) => {
                  const checked = addForm.hotel_ids.includes(Number(hotel.id));

                  return (
                    <label
                      key={hotel.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        checked
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddHotel(Number(hotel.id))}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="font-medium text-gray-800">
                        {hotel.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeAddModal}
              className="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleCreateInternalUser}
              disabled={savingAdd}
              className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingAdd ? "Menyimpan..." : "Simpan User"}
            </button>
          </div>
        </ModalShell>
      )}

      {showEditModal && selectedInternalUser && (
        <ModalShell onClose={closeEditModal}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Edit User Internal
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Perbarui data user internal, role, dan cabang akses.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nama"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Masukkan nama"
            />
            <InputField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Masukkan email"
            />
            <InputField
              label="Nomor HP"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Masukkan nomor HP"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              >
                {isBoss && <option value="boss">Boss</option>}
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="receptionist">Receptionist</option>
                <option value="pengawas">Pengawas</option>
                <option value="it">IT</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input
                id="edit-status"
                name="status"
                type="checkbox"
                checked={editForm.status}
                onChange={handleEditChange}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label
                htmlFor="edit-status"
                className="text-sm font-semibold text-gray-700"
              >
                Aktifkan user
              </label>
            </div>
          </div>

          {roleNeedsHotelAssignment(editForm.role) && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Pilih Cabang Akses
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {hotels.map((hotel) => {
                  const checked = editForm.hotel_ids.includes(Number(hotel.id));

                  return (
                    <label
                      key={hotel.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        checked
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEditHotel(Number(hotel.id))}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="font-medium text-gray-800">
                        {hotel.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeEditModal}
              className="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleUpdateInternalUser}
              disabled={savingEdit}
              className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingEdit ? "Menyimpan..." : "Update User"}
            </button>
          </div>
        </ModalShell>
      )}

      {showResetPasswordModal && resetPasswordTarget && (
        <ModalShell onClose={closeResetPasswordModal} maxWidth="max-w-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Atur password baru untuk{" "}
              <span className="font-semibold text-gray-700">
                {resetPasswordTarget.name}
              </span>
              .
            </p>
          </div>

          <InputField
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan password baru"
          />

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeResetPasswordModal}
              className="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmitResetPassword}
              disabled={savingResetPassword}
              className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingResetPassword ? "Menyimpan..." : "Reset Password"}
            </button>
          </div>
        </ModalShell>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <AlertTriangle size={24} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-500">
                      Delete User
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      Hapus user ini?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      User{" "}
                      <span className="font-semibold text-gray-800">
                        {deleteTarget.name}
                      </span>{" "}
                      akan dihapus dari sistem. Gunakan aksi ini hanya untuk akun
                      test, duplikat, atau akun yang memang tidak dipakai lagi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="rounded-2xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Nama User</span>
                    <span className="font-semibold text-gray-800">
                      {deleteTarget.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Role</span>
                    <span className="font-semibold text-gray-800">
                      {getRoleLabel(deleteTarget.role)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Email</span>
                    <span className="font-semibold text-gray-800 break-all text-right">
                      {deleteTarget.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Pastikan user ini memang aman untuk dihapus. Untuk akun yang
                masih dipakai operasional, lebih aman gunakan <strong>Nonaktifkan</strong>.
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deletingUser}
                  className="rounded-2xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 size={18} />
                  {deletingUser ? "Menghapus..." : "Ya, Hapus User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
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
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
      />
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function ModalShell({
  children,
  onClose,
  maxWidth = "max-w-2xl",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative w-full ${maxWidth} rounded-3xl bg-white p-6 shadow-2xl`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}