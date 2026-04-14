import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, MapPin, Search, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function HeroSearchFilter() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [checkInError, setCheckInError] = useState("");

  const dropdownRef = useRef(null);

  const citySuggestions = [
    "Jakarta",
    "Surabaya",
    "Semarang",
    "Aceh",
    "Yogyakarta",
    "Bali",
  ];

  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    fetchHotelSuggestions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchHotelSuggestions = async () => {
    try {
      setLoadingSuggestions(true);

      const res = await api.get("/hotels");
      const hotelData = Array.isArray(res.data?.data) ? res.data.data : [];

      setHotels(hotelData);
    } catch (error) {
      console.error(
        "GET HERO HOTEL SUGGESTIONS ERROR:",
        error.response?.data || error
      );
      setHotels([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const combinedSuggestions = useMemo(() => {
    const cityItems = citySuggestions.map((city) => ({
      type: "city",
      label: city,
      value: city,
    }));

    const hotelItems = hotels.map((hotel) => ({
      type: "hotel",
      label: hotel.name,
      value: hotel.name,
      city: hotel.city?.name || "",
      area: hotel.area || "",
      id: hotel.id,
    }));

    const allItems = [...cityItems, ...hotelItems];

    return allItems.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (x) => x.value.toLowerCase() === item.value.toLowerCase()
        )
    );
  }, [hotels]);

  const filteredSuggestions = useMemo(() => {
    if (!destination.trim()) {
      return combinedSuggestions.slice(0, 10);
    }

    return combinedSuggestions.filter((item) =>
      item.label.toLowerCase().includes(destination.toLowerCase())
    );
  }, [combinedSuggestions, destination]);

  const handleSelectSuggestion = (item) => {
    setDestination(item.value);
    setDestinationError("");
    setShowDropdown(false);
  };

  const validateForm = () => {
    let valid = true;

    if (!destination.trim()) {
      setDestinationError("Destination wajib diisi dulu.");
      valid = false;
    } else {
      setDestinationError("");
    }

    if (!checkIn) {
      setCheckInError("Tanggal check-in wajib diisi.");
      valid = false;
    } else {
      setCheckInError("");
    }

    return valid;
  };

  const handleSearch = () => {
    if (!validateForm()) return;

    const params = new URLSearchParams();
    params.set("destination", destination.trim());
    params.set("check_in", checkIn);

    navigate(`/hotels?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    setDestinationError("");

    if (!e.target.value.trim()) {
      setCheckIn("");
    }
  };

  const handleCheckInFocus = () => {
    if (!destination.trim()) {
      setDestinationError("Isi destination dulu sebelum pilih check-in.");
    }
  };

  const handleCheckInChange = (e) => {
    setCheckIn(e.target.value);
    setCheckInError("");
  };

  const isFormComplete = destination.trim() && checkIn;

  return (
    <div
      data-aos="fade-up"
      className="relative z-30 mx-auto max-w-5xl rounded-[2rem] border border-white/40 bg-white/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-6"
    >
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[1.35fr_1fr_auto]">
        <div className="relative" ref={dropdownRef}>
          <label className="mb-2 block text-sm font-semibold text-red-600">
            Destination
          </label>

          <div
            onClick={() => setShowDropdown(true)}
            className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 shadow-sm transition focus-within:ring-4 ${
              destinationError
                ? "border-red-300 bg-red-50/60 focus-within:border-red-400 focus-within:ring-red-100"
                : "border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <MapPin size={18} />
            </div>

            <div className="flex-1">
              <input
                value={destination}
                onFocus={() => setShowDropdown(true)}
                onChange={handleDestinationChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
                placeholder="Cari kota atau hotel..."
              />
            </div>
          </div>

          {destinationError ? (
            <p className="mt-2 text-xs font-medium text-red-500">
              {destinationError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">
              Pilih kota atau hotel tujuan terlebih dahulu.
            </p>
          )}

          {showDropdown && (
            <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-sm text-gray-400">
                  Memuat tujuan...
                </div>
              ) : filteredSuggestions.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                  {filteredSuggestions.map((item, index) => (
                    <div
                      key={`${item.type}-${item.value}-${index}`}
                      onClick={() => handleSelectSuggestion(item)}
                      className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-red-50"
                    >
                      <div className="mt-0.5 text-red-500">
                        {item.type === "hotel" ? (
                          <Building2 size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {item.label}
                        </p>

                        {item.type === "hotel" ? (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.city || "-"}
                            {item.area ? ` • ${item.area}` : ""}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Kota tujuan
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">
                  Tidak ditemukan
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-red-600">
            Check In
          </label>

          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-4 transition ${
              checkInError
                ? "border-red-300 bg-red-50/60"
                : destination.trim()
                ? "border-gray-200 bg-gray-50"
                : "border-gray-200 bg-gray-100 opacity-80"
            }`}
          >
            <CalendarDays size={18} className="text-gray-400" />
            <input
              type="date"
              min={minDate}
              value={checkIn}
              onFocus={handleCheckInFocus}
              onChange={handleCheckInChange}
              onKeyDown={handleKeyDown}
              disabled={!destination.trim()}
              className="w-full bg-transparent text-gray-800 outline-none disabled:cursor-not-allowed disabled:text-gray-400"
            />
          </div>

          {checkInError ? (
            <p className="mt-2 text-xs font-medium text-red-500">
              {checkInError}
            </p>
          ) : !destination.trim() ? (
            <p className="mt-2 text-xs text-gray-400">
              Isi destination dulu untuk membuka check-in.
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">
              Pilih tanggal check-in kamu.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!isFormComplete}
          className="flex h-[62px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 font-semibold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
        >
          <Search size={18} />
          Explore Hotels
        </button>
      </div>
    </div>
  );
}