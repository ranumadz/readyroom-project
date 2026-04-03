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
      console.error("GET HERO HOTEL SUGGESTIONS ERROR:", error.response?.data || error);
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
    setShowDropdown(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (destination.trim()) {
      params.set("destination", destination.trim());
    }

    if (checkIn) {
      params.set("check_in", checkIn);
    }

    navigate(`/hotels?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

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
            className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 py-4 shadow-sm transition hover:border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <MapPin size={18} />
            </div>

            <div className="flex-1">
              <input
                value={destination}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
                placeholder="Cari kota atau hotel..."
              />
            </div>
          </div>

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
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
            <CalendarDays size={18} className="text-gray-400" />
            <input
              type="date"
              min={minDate}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-gray-800 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="flex h-[62px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 font-semibold text-white shadow-lg transition hover:bg-red-700"
        >
          <Search size={18} />
          Search Room
        </button>
      </div>
    </div>
  );
}