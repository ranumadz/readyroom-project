import { useMemo, useState, useRef, useEffect } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";

export default function HeroSearchFilter() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();

  const suggestions = [
    "Jakarta",
    "Bali",
    "Bandung",
    "Surabaya",
    "Yogyakarta",
    "ReadyRoom Sudirman",
    "ReadyRoom Kuta",
    "ReadyRoom Bandung Center"
  ];

  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // klik luar nutup dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filtered = suggestions.filter((item) =>
    item.toLowerCase().includes(destination.toLowerCase())
  );

  return (
    <div
  data-aos="fade-up"
  className="relative z-30 max-w-5xl mx-auto rounded-[2rem] border border-white/40 bg-white/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-5 md:p-6"
>
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr_auto] gap-4 items-end">

        {/* DESTINATION */}
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
                className="w-full bg-transparent text-sm md:text-base text-gray-800 outline-none placeholder:text-gray-400"
                placeholder="Cari kota atau hotel..."
              />
            </div>
          </div>

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
              
              {filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setDestination(item);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition"
                  >
                    <MapPin size={16} className="text-red-500" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  Tidak ditemukan
                </div>
              )}

            </div>
          )}
        </div>

        {/* CHECK IN */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-red-600">
            Check In
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 bg-gray-50">
            <CalendarDays size={18} className="text-gray-400" />
            <input
              type="date"
              min={minDate}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button className="h-[62px] flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 text-white font-semibold shadow-lg hover:bg-red-700 transition">
          <Search size={18} />
          Search Room
        </button>
      </div>
    </div>
  );
}