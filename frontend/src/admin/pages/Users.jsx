import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Users as UsersIcon,
  ShieldCheck,
  UserRound,
  Search,
  KeyRound,
  Plus,
  Pencil,
  Power,
  RotateCcw,
  Mail,
  Phone,
  UserCog,
  LockKeyhole,
  Building2,
  Check,
} from "lucide-react";

export default function UsersPage() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const isBoss = adminUser?.role === "boss";
  const isBossOrSuperAdmin =
    adminUser?.role === "boss" || adminUser?.role === "super_admin";

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
        return "bg-red-100 text-red-700";
      case "super_admin":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "receptionist":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadgeClass = (status) => {
    return status
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700";
  };

  const canResetPassword = (target, type) => {
    if (!adminUser) return false;

    if (adminUser.role === "boss") {
      return true;
    }

    if (adminUser.role === "super_admin") {
      if (type === "customer") return true;

      if (type === "internal") {
        return target.role !== "boss";
      }
    }

    return false;
  };

  const roleNeedsHotelAssignment = (role) => {
    return role === "admin" || role === "receptionist";
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

  const handleCreateInternalUser = async () => {
    if (!isBoss) {
      toast.error("Hanya boss yang boleh menambah user internal");
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
    if (!isBoss) {
      toast.error("Hanya boss yang boleh edit user internal");
      return;
    }

    if (!selectedInternalUser) return;
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Users</h1>
            <p className="text-gray-500 mt-1">
              Kelola user internal panel admin dan customer web dalam satu halaman.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
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

              {activeTab === "internal" && isBoss && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                >
                  <Plus size={18} />
                  Tambah User Internal
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
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
                </select>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-300 transition"
                >
                  <RotateCcw size={16} />
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data users...
              </div>
            ) : activeTab === "internal" ? (
              <>
                <div className="flex items-center justify-between mb-6">
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
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <h3 className="text-lg font-bold text-gray-800">
                                {user.name}
                              </h3>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(
                                  user.role
                                )}`}
                              >
                                {user.role}
                              </span>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                  user.status
                                )}`}
                              >
                                {user.status ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-start gap-3">
                                <Mail size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">Email</p>
                                  <p className="font-semibold text-gray-800 break-all">
                                    {user.email || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Phone size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">Nomor HP</p>
                                  <p className="font-semibold text-gray-800">
                                    {user.phone || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <UserCog size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">ID User</p>
                                  <p className="font-semibold text-gray-800">
                                    #{user.id}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-gray-400 mb-2">
                                Cabang Akses
                              </p>

                              {user.role === "boss" || user.role === "super_admin" ? (
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                    <Building2 size={14} />
                                    Semua Cabang
                                  </span>
                                </div>
                              ) : Array.isArray(user.hotels) && user.hotels.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {user.hotels.map((hotel) => (
                                    <span
                                      key={hotel.id}
                                      className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                                    >
                                      <Building2 size={14} className="text-red-500" />
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

                          <div className="w-full lg:w-auto flex flex-wrap lg:flex-col gap-3">
                            {isBoss && (
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 text-white font-semibold hover:bg-yellow-600 transition"
                              >
                                <Pencil size={18} />
                                Edit
                              </button>
                            )}

                            {canResetPassword(user, "internal") && (
                              <button
                                type="button"
                                onClick={() => openResetPasswordModal(user, "internal")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700 transition"
                              >
                                <KeyRound size={18} />
                                Reset Password
                              </button>
                            )}

                            {isBoss && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user.id, "internal")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
                              >
                                <Power size={18} />
                                {user.status ? "Nonaktifkan" : "Aktifkan"}
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
                <div className="flex items-center justify-between mb-6">
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
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <h3 className="text-lg font-bold text-gray-800">
                                {customer.name}
                              </h3>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                  customer.status
                                )}`}
                              >
                                {customer.status ? "Aktif" : "Nonaktif"}
                              </span>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  customer.is_verified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {customer.is_verified
                                  ? "Terverifikasi"
                                  : "Belum Verifikasi"}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-start gap-3">
                                <UserRound size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">Nama Customer</p>
                                  <p className="font-semibold text-gray-800">
                                    {customer.name || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Phone size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">Nomor HP</p>
                                  <p className="font-semibold text-gray-800">
                                    {customer.phone || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <UsersIcon size={16} className="text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-gray-400">ID Customer</p>
                                  <p className="font-semibold text-gray-800">
                                    #{customer.id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="w-full lg:w-auto flex flex-wrap lg:flex-col gap-3">
                            {canResetPassword(customer, "customer") && (
                              <button
                                type="button"
                                onClick={() => openResetPasswordModal(customer, "customer")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700 transition"
                              >
                                <KeyRound size={18} />
                                Reset Password
                              </button>
                            )}

                            {isBossOrSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(customer.id, "customer")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-white font-semibold hover:bg-black transition"
                              >
                                <Power size={18} />
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-xl my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Tambah User Internal
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Hanya boss yang boleh menambah user internal baru.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Nama"
                name="name"
                value={addForm.name}
                onChange={handleAddChange}
                placeholder="Nama user"
              />

              <InputField
                label="Email"
                name="email"
                value={addForm.email}
                onChange={handleAddChange}
                placeholder="Email user"
                type="email"
              />

              <InputField
                label="Nomor HP"
                name="phone"
                value={addForm.phone}
                onChange={handleAddChange}
                placeholder="Nomor HP"
              />

              <InputField
                label="Password"
                name="password"
                value={addForm.password}
                onChange={handleAddChange}
                placeholder="Password"
                type="password"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={addForm.role}
                  onChange={handleAddChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 w-full">
                  <input
                    type="checkbox"
                    name="status"
                    checked={addForm.status}
                    onChange={handleAddChange}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    User aktif
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <HotelSelector
                  title="Pilih Cabang Akses"
                  subtitle={
                    roleNeedsHotelAssignment(addForm.role)
                      ? "Pilih satu atau lebih cabang yang boleh diakses user ini."
                      : "Role ini otomatis punya akses penuh, jadi tidak perlu pilih cabang."
                  }
                  hotels={hotels}
                  selectedIds={addForm.hotel_ids}
                  onToggle={toggleAddHotel}
                  disabled={!roleNeedsHotelAssignment(addForm.role)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={closeAddModal}
                className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleCreateInternalUser}
                disabled={
                  savingAdd ||
                  !addForm.name.trim() ||
                  !addForm.email.trim() ||
                  !addForm.password.trim()
                }
                className="flex-1 bg-red-600 text-white rounded-2xl py-3 font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {savingAdd ? "Menyimpan..." : "Simpan User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedInternalUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-xl my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Edit User Internal
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Ubah data user internal dan role sesuai kebutuhan operasional.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Nama"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Nama user"
              />

              <InputField
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="Email user"
                type="email"
              />

              <InputField
                label="Nomor HP"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                placeholder="Nomor HP"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >
                  <option value="boss">Boss</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 w-full">
                  <input
                    type="checkbox"
                    name="status"
                    checked={editForm.status}
                    onChange={handleEditChange}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    User aktif
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <HotelSelector
                  title="Pilih Cabang Akses"
                  subtitle={
                    roleNeedsHotelAssignment(editForm.role)
                      ? "Pilih satu atau lebih cabang yang boleh diakses user ini."
                      : "Role ini otomatis punya akses penuh, jadi tidak perlu pilih cabang."
                  }
                  hotels={hotels}
                  selectedIds={editForm.hotel_ids}
                  onToggle={toggleEditHotel}
                  disabled={!roleNeedsHotelAssignment(editForm.role)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={closeEditModal}
                className="flex-1 bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-300 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleUpdateInternalUser}
                disabled={
                  savingEdit ||
                  !editForm.name.trim() ||
                  !editForm.email.trim()
                }
                className="flex-1 bg-yellow-500 text-white rounded-2xl py-3 font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetPasswordModal && resetPasswordTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <LockKeyhole size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reset Password</h2>
                  <p className="text-sm text-purple-100">
                    Ubah password user dengan aman
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 rounded-2xl bg-purple-50 border border-purple-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Target user</p>
                <p className="font-semibold text-gray-800">
                  {resetPasswordTarget.name}
                </p>
                {resetPasswordTarget.role && (
                  <p className="text-xs text-purple-700 mt-1">
                    Role: {resetPasswordTarget.role}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeResetPasswordModal}
                  className="flex-1 rounded-2xl bg-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-300 transition"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSubmitResetPassword}
                  disabled={savingResetPassword || !newPassword.trim()}
                  className="flex-1 rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {savingResetPassword ? "Menyimpan..." : "Simpan Password"}
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
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
      />
    </div>
  );
}

function HotelSelector({
  title,
  subtitle,
  hotels,
  selectedIds,
  onToggle,
  disabled = false,
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>

      {disabled ? (
        <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700">
          Role ini tidak perlu dibatasi cabang.
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Data hotel belum tersedia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hotels.map((hotel) => {
            const checked = selectedIds.includes(Number(hotel.id));

            return (
              <button
                key={hotel.id}
                type="button"
                onClick={() => onToggle(Number(hotel.id))}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  checked
                    ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                    : "border-gray-200 bg-white hover:border-red-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                        checked
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Building2 size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        {hotel.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {hotel.area || hotel.address || "Cabang hotel"}
                      </p>
                    </div>
                  </div>

                  {checked && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <UsersIcon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-500">{desc}</p>
    </div>
  );
}