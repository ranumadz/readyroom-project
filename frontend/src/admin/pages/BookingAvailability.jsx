import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Swal from "sweetalert2";
import {
  Building2,
  Search,
  Lock,
  Unlock,
  Clock3,
  RefreshCw,
  AlertCircle,
  X,
  Save,
} from "lucide-react";

export default function BookingAvailability() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingClose, setSavingClose] = useState(false);
  const [search, setSearch] = useState("");

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [closeForm, setCloseForm] = useState({
    booking_closed_reason: "Kamar penuh",
    booking_reopen_at: "",
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/hotels");

      const hotelData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.hotels)
        ? res.data.hotels
        : Array.isArray(res.data)
        ? res.data
        : [];

      setHotels(hotelData);
    } catch (err) {
      console.error(
        "GET BOOKING AVAILABILITY HOTELS ERROR:",
        err.response?.data || err
      );

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Data hotel gagal diambil",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return hotels;

    return hotels.filter((hotel) => {
      const name = String(hotel?.name || "").toLowerCase();
      const city = String(
        hotel?.city?.name || hotel?.city_name || ""
      ).toLowerCase();
      const area = String(hotel?.area || "").toLowerCase();
      const address = String(hotel?.address || "").toLowerCase();

      return (
        name.includes(keyword) ||
        city.includes(keyword) ||
        area.includes(keyword) ||
        address.includes(keyword)
      );
    });
  }, [hotels, search]);

  const formatReopenAt = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getMinDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const openCloseModal = (hotel) => {
    const minValue = getMinDateTimeLocal();

    setSelectedHotel(hotel);
    setCloseForm({
      booking_closed_reason: hotel?.booking_closed_reason || "Kamar penuh",
      booking_reopen_at: minValue,
    });
    setShowCloseModal(true);
  };

  const closeCloseModal = () => {
    setShowCloseModal(false);
    setSelectedHotel(null);
    setSavingClose(false);
    setCloseForm({
      booking_closed_reason: "Kamar penuh",
      booking_reopen_at: "",
    });
  };

  const handleCloseFormChange = (e) => {
    const { name, value } = e.target;

    setCloseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseBooking = async (e) => {
    e.preventDefault();

    if (!selectedHotel) return;

    if (!closeForm.booking_reopen_at) {
      return Swal.fire({
        icon: "warning",
        title: "Jam buka kembali wajib diisi",
        text: "Pilih sampai jam berapa booking hotel ini ditutup.",
        confirmButtonColor: "#dc2626",
      });
    }

    try {
      setSavingClose(true);

      await api.post(`/admin/hotels/${selectedHotel.id}/close-booking`, {
        booking_closed_reason:
          closeForm.booking_closed_reason?.trim() || "Kamar penuh",
        booking_reopen_at: closeForm.booking_reopen_at,
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Booking hotel berhasil ditutup sementara.",
        confirmButtonColor: "#dc2626",
      });

      closeCloseModal();
      fetchHotels();
    } catch (err) {
      console.error("CLOSE BOOKING HOTEL ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          err.response?.data?.errors?.booking_reopen_at?.[0] ||
          err.response?.data?.errors?.booking_closed_reason?.[0] ||
          "Booking hotel gagal ditutup.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSavingClose(false);
    }
  };

  const handleOpenBooking = async (hotel) => {
    const result = await Swal.fire({
      title: "Buka booking hotel?",
      text: `Booking untuk "${hotel.name}" akan dibuka kembali.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, buka",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/admin/hotels/${hotel.id}/open-booking`);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Booking hotel berhasil dibuka kembali.",
        confirmButtonColor: "#16a34a",
      });

      fetchHotels();
    } catch (err) {
      console.error("OPEN BOOKING HOTEL ERROR:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Booking hotel gagal dibuka.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            

            <button
              onClick={fetchHotels}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              

              <div className="relative w-full md:max-w-sm">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari hotel, kota, area..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data hotel...
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Data tidak ditemukan
                </h3>
                <p className="mt-2 text-gray-500">
                  Coba gunakan kata kunci pencarian lain.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-4 text-sm font-semibold text-gray-600">
                        Hotel
                      </th>
                      <th className="py-4 text-sm font-semibold text-gray-600">
                        Kota / Area
                      </th>
                      <th className="py-4 text-sm font-semibold text-gray-600">
                        Status Booking
                      </th>
                      <th className="py-4 text-sm font-semibold text-gray-600">
                        Buka Kembali
                      </th>
                      <th className="py-4 text-sm font-semibold text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHotels.map((hotel) => {
                      const isBookingClosed = Boolean(hotel.booking_is_closed);

                      return (
                        <tr
                          key={hotel.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <Building2 size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {hotel.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {hotel.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-gray-700">
                            <p className="font-semibold">
                              {hotel.city?.name || hotel.city_name || "-"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {hotel.area || "-"}
                            </p>
                          </td>

                          <td className="py-4">
                            {isBookingClosed ? (
                              <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                                  <Lock size={15} />
                                  Ditutup sementara
                                </span>
                                <p className="mt-1 text-xs text-gray-400">
                                  {hotel.booking_closed_reason || "Kamar penuh"}
                                </p>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                                <Unlock size={15} />
                                Booking dibuka
                              </span>
                            )}
                          </td>

                          <td className="py-4">
                            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                              <Clock3 size={16} className="text-gray-400" />
                              {isBookingClosed
                                ? formatReopenAt(hotel.booking_reopen_at)
                                : "-"}
                            </div>
                          </td>

                          <td className="py-4">
                            {isBookingClosed ? (
                              <button
                                onClick={() => handleOpenBooking(hotel)}
                                className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-100"
                              >
                                <Unlock size={16} />
                                Buka Booking
                              </button>
                            ) : (
                              <button
                                onClick={() => openCloseModal(hotel)}
                                disabled={!hotel.status}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Lock size={16} />
                                Tutup Booking
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCloseModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tutup Booking
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedHotel.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCloseModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCloseBooking} className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Hotel tetap tampil di customer, tapi tombol booking akan
                ditutup sementara.
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Alasan Tutup Booking
                </label>
                <input
                  type="text"
                  name="booking_closed_reason"
                  value={closeForm.booking_closed_reason}
                  onChange={handleCloseFormChange}
                  placeholder="Contoh: Kamar penuh"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tutup Sampai
                </label>
                <input
                  type="datetime-local"
                  name="booking_reopen_at"
                  min={getMinDateTimeLocal()}
                  value={closeForm.booking_reopen_at}
                  onChange={handleCloseFormChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Setelah melewati jam ini, sistem akan menganggap booking hotel
                  terbuka kembali saat data hotel dimuat.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeCloseModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <X size={18} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={savingClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                >
                  <Save size={18} />
                  {savingClose ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}