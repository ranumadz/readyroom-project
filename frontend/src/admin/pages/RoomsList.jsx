import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    hotel_id: "",
    type: "",
    capacity: "",
    price_per_night: "",
    price_3h: "",
    price_6h: "",
    price_12h: "",
    total_rooms: "",
    status: 1,
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingRoomId, setTogglingRoomId] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const normalizeArrayResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    if (Array.isArray(payload?.hotels)) return payload.hotels;
    return [];
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get("/admin/rooms");
      setRooms(normalizeArrayResponse(response.data));
    } catch (error) {
      console.error("Gagal mengambil data room:", error);
      toast.error("Gagal mengambil data room");
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await api.get("/admin/hotels");
      setHotels(normalizeArrayResponse(response.data));
    } catch (error) {
      console.warn("Data hotel untuk modal edit belum bisa diambil:", error);
    }
  };

  const isRoomActive = (room) => {
    return (
      room?.status === true ||
      room?.status === 1 ||
      room?.status === "1" ||
      String(room?.status || "").toLowerCase() === "active"
    );
  };

  const getRoomTransitPrice = (room, duration) => {
    if (duration === "3h") {
      return room?.price_transit_3h ?? room?.price_3h ?? 0;
    }

    if (duration === "6h") {
      return room?.price_transit_6h ?? room?.price_6h ?? 0;
    }

    if (duration === "12h") {
      return room?.price_transit_12h ?? room?.price_12h ?? 0;
    }

    return 0;
  };

  const getTransitPayloadKey = (room, canonicalKey, fallbackKey) => {
    if (Object.prototype.hasOwnProperty.call(room || {}, canonicalKey)) {
      return canonicalKey;
    }

    return fallbackKey;
  };

  const hotelOptions = useMemo(() => {
    if (hotels.length > 0) return hotels;

    const mappedHotels = rooms
      .map((room) => room.hotel)
      .filter((hotel) => hotel?.id && hotel?.name);

    const uniqueHotels = [];

    mappedHotels.forEach((hotel) => {
      const alreadyExists = uniqueHotels.some(
        (item) => Number(item.id) === Number(hotel.id)
      );

      if (!alreadyExists) uniqueHotels.push(hotel);
    });

    return uniqueHotels;
  }, [hotels, rooms]);

  const openEditModal = (room) => {
    setSelectedRoom(room);

    setEditForm({
      name: room?.name || "",
      hotel_id: room?.hotel_id || room?.hotel?.id || "",
      type: room?.type || "",
      capacity: room?.capacity || "",
      price_per_night: room?.price_per_night || "",
      price_3h: getRoomTransitPrice(room, "3h"),
      price_6h: getRoomTransitPrice(room, "6h"),
      price_12h: getRoomTransitPrice(room, "12h"),
      total_rooms: room?.total_rooms || "",
      status: isRoomActive(room) ? 1 : 0,
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (savingEdit) return;

    setShowEditModal(false);
    setSelectedRoom(null);
    setEditForm({
      name: "",
      hotel_id: "",
      type: "",
      capacity: "",
      price_per_night: "",
      price_3h: "",
      price_6h: "",
      price_12h: "",
      total_rooms: "",
      status: 1,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildUpdatePayload = (room, formData, statusOverride = null) => {
    const price3Key = getTransitPayloadKey(
      room,
      "price_transit_3h",
      "price_3h"
    );
    const price6Key = getTransitPayloadKey(
      room,
      "price_transit_6h",
      "price_6h"
    );
    const price12Key = getTransitPayloadKey(
      room,
      "price_transit_12h",
      "price_12h"
    );

    const finalStatus =
      statusOverride !== null
        ? Number(statusOverride)
        : Number(formData.status ?? (isRoomActive(room) ? 1 : 0));

    return {
      name: formData.name ?? room?.name ?? "",
      hotel_id:
        Number(formData.hotel_id || room?.hotel_id || room?.hotel?.id || 0) ||
        "",
      type: formData.type ?? room?.type ?? "",
      capacity: Number(formData.capacity || 0),
      price_per_night: Number(formData.price_per_night || 0),
      [price3Key]: Number(formData.price_3h || 0),
      [price6Key]: Number(formData.price_6h || 0),
      [price12Key]: Number(formData.price_12h || 0),
      total_rooms: Number(formData.total_rooms || 0),
      status: finalStatus,
    };
  };

  const updateRoomRequest = async (roomId, payload) => {
    try {
      return await api.put(`/admin/rooms/${roomId}`, payload);
    } catch (error) {
      const statusCode = error?.response?.status;

      if (statusCode === 404 || statusCode === 405) {
        return await api.post(`/admin/rooms/${roomId}`, {
          ...payload,
          _method: "PUT",
        });
      }

      throw error;
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!selectedRoom?.id) {
      toast.error("Room belum dipilih");
      return;
    }

    if (!editForm.name.trim()) {
      toast.error("Nama room wajib diisi");
      return;
    }

    if (!editForm.hotel_id) {
      toast.error("Hotel wajib dipilih");
      return;
    }

    try {
      setSavingEdit(true);

      const payload = buildUpdatePayload(selectedRoom, editForm);
      await updateRoomRequest(selectedRoom.id, payload);

      toast.success("Room berhasil diperbarui");
      closeEditModal();
      fetchRooms();
    } catch (error) {
      console.error("Gagal update room:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal memperbarui data room"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (room) => {
    if (!room?.id) return;

    const nextStatus = isRoomActive(room) ? 0 : 1;

    const formFromRoom = {
      name: room?.name || "",
      hotel_id: room?.hotel_id || room?.hotel?.id || "",
      type: room?.type || "",
      capacity: room?.capacity || "",
      price_per_night: room?.price_per_night || "",
      price_3h: getRoomTransitPrice(room, "3h"),
      price_6h: getRoomTransitPrice(room, "6h"),
      price_12h: getRoomTransitPrice(room, "12h"),
      total_rooms: room?.total_rooms || "",
      status: nextStatus,
    };

    try {
      setTogglingRoomId(room.id);

      const payload = buildUpdatePayload(room, formFromRoom, nextStatus);
      await updateRoomRequest(room.id, payload);

      toast.success(nextStatus ? "Room diaktifkan" : "Room dinonaktifkan");
      fetchRooms();
    } catch (error) {
      console.error("Gagal update status room:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Gagal mengubah status room"
      );
    } finally {
      setTogglingRoomId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Daftar Kamar List
              </h1>
              <p className="text-gray-500 mt-1">
                Daftar semua kamar hotel ReadyRoom
              </p>
            </div>

            <a
              href="/admin/rooms/add"
              className="bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-black transition font-medium"
            >
              + Add Room
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-6 py-4 font-semibold">Room Name</th>
                    <th className="px-6 py-4 font-semibold">Hotel</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Capacity</th>
                    <th className="px-6 py-4 font-semibold">Price / Night</th>
                    <th className="px-6 py-4 font-semibold">Transit 3H</th>
                    <th className="px-6 py-4 font-semibold">Transit 6H</th>
                    <th className="px-6 py-4 font-semibold">Transit 12H</th>
                    <th className="px-6 py-4 font-semibold">Total Rooms</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.length > 0 ? (
                    rooms.map((room) => {
                      const active = isRoomActive(room);
                      const isToggling = togglingRoomId === room.id;

                      return (
                        <tr
                          key={room.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {room.name}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.hotel?.name || "-"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.type || "-"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.capacity || 0}
                          </td>

                          <td className="px-6 py-4 text-red-600 font-medium">
                            Rp{room.price_per_night || 0}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            Rp{getRoomTransitPrice(room, "3h")}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            Rp{getRoomTransitPrice(room, "6h")}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            Rp{getRoomTransitPrice(room, "12h")}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {room.total_rooms || 0}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(room)}
                              disabled={isToggling}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {isToggling
                                ? "Updating..."
                                : active
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(room)}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(room)}
                                disabled={isToggling}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  active
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                {active ? "Disable" : "Enable"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="11"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Belum ada data room.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Room
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Perbarui data kamar hotel ReadyRoom
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Room Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Contoh: Deluxe Room"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hotel
                    </label>

                    {hotelOptions.length > 0 ? (
                      <select
                        name="hotel_id"
                        value={editForm.hotel_id}
                        onChange={handleEditFormChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      >
                        <option value="">Pilih Hotel</option>
                        {hotelOptions.map((hotel) => (
                          <option key={hotel.id} value={hotel.id}>
                            {hotel.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        name="hotel_id"
                        value={editForm.hotel_id}
                        onChange={handleEditFormChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        placeholder="Hotel ID"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={editForm.type}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Contoh: Standard / Deluxe"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="0"
                      value={editForm.capacity}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Kapasitas tamu"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Price / Night
                    </label>
                    <input
                      type="number"
                      name="price_per_night"
                      min="0"
                      value={editForm.price_per_night}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga full day"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Total Rooms
                    </label>
                    <input
                      type="number"
                      name="total_rooms"
                      min="0"
                      value={editForm.total_rooms}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Jumlah kamar"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 3H
                    </label>
                    <input
                      type="number"
                      name="price_3h"
                      min="0"
                      value={editForm.price_3h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 3 jam"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 6H
                    </label>
                    <input
                      type="number"
                      name="price_6h"
                      min="0"
                      value={editForm.price_6h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 6 jam"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Transit 12H
                    </label>
                    <input
                      type="number"
                      name="price_12h"
                      min="0"
                      value={editForm.price_12h}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      placeholder="Harga transit 12 jam"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Catatan
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-700">
                    Perubahan data room akan langsung tersimpan ke database
                    Pastikan harga transit dan full day sudah sesuai sebelum
                    menekan tombol Simpan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}