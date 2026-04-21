import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function HeroSearchFilter() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [checkInError, setCheckInError] = useState("");

  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);

  const citySuggestions = [
    "Jakarta",
    "Surabaya",
    "Semarang",
    "Aceh",
    "Yogyakarta",
    "Bali",
  ];

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    fetchHotelSuggestions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }

      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
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
  };

  const handleOpenCalendar = () => {
    setCheckInError("");
    setShowDropdown(false);
    setShowCalendar(true);

    if (checkIn) {
      const selected = parseDateString(checkIn);
      if (selected) {
        setCalendarMonth(
          new Date(selected.getFullYear(), selected.getMonth(), 1)
        );
        return;
      }
    }

    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleSelectDate = (date) => {
    const formatted = formatDateToInput(date);
    setCheckIn(formatted);
    setCheckInError("");
    setShowCalendar(false);
  };

  const isFormComplete = destination.trim() && checkIn;

  const calendarDays = useMemo(() => {
    return buildCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const displayCheckIn = checkIn
    ? formatDateForDisplay(parseDateString(checkIn))
    : "";

  return (
    <div
      data-aos="fade-up"
      className="relative z-30 mx-auto max-w-5xl overflow-visible rounded-[2rem] border border-white/40 bg-white/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-6"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr_180px]">
        <div className="relative" ref={dropdownRef}>
          <label className="mb-2 block text-center text-sm font-semibold text-red-600 lg:text-left">
            Destination
          </label>

          <div
            onClick={() => {
              setShowDropdown(true);
              setShowCalendar(false);
            }}
            className={`group flex min-h-[68px] items-center gap-3 rounded-2xl border px-4 py-4 shadow-sm transition focus-within:ring-4 ${
              destinationError
                ? "border-red-300 bg-red-50/60 focus-within:border-red-400 focus-within:ring-red-100"
                : "border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <MapPin size={18} />
            </div>

            <div className="flex-1">
              <input
                value={destination}
                onFocus={() => {
                  setShowDropdown(true);
                  setShowCalendar(false);
                }}
                onChange={handleDestinationChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
                placeholder="Cari kota atau hotel..."
              />
            </div>
          </div>

          {destinationError ? (
            <p className="mt-2 text-center text-xs font-medium text-red-500 lg:text-left">
              {destinationError}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-gray-400 lg:text-left">
              Pilih kota atau hotel tujuan, atau isi setelah menentukan tanggal.
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

        <div className="relative" ref={calendarRef}>
          <label className="mb-2 block text-center text-sm font-semibold text-red-600 lg:text-left">
            Check In
          </label>

          <button
            type="button"
            onClick={handleOpenCalendar}
            onKeyDown={handleKeyDown}
            className={`w-full min-h-[68px] rounded-2xl border px-4 py-4 text-left transition ${
              checkInError
                ? "border-red-300 bg-red-50/60"
                : "border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <CalendarDays size={18} />
              </div>

              <div className="min-w-0 flex-1">
                {checkIn ? (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Tanggal Check In
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-800 md:text-base">
                      {displayCheckIn}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Tanggal Check In
                    </p>
                    <p className="mt-1 text-sm text-gray-800 md:text-base">
                      Pilih tanggal check-in
                    </p>
                  </>
                )}
              </div>
            </div>
          </button>

          {checkInError ? (
            <p className="mt-2 text-center text-xs font-medium text-red-500 lg:text-left">
              {checkInError}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-gray-400 lg:text-left">
              Kamu bisa pilih tanggal check-in lebih dulu.
            </p>
          )}

          {showCalendar && (
            <div className="relative z-50 mt-3 md:absolute md:left-0 md:right-0 md:mt-3">
              <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                <div className="border-b border-gray-100 px-4 py-4 md:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="text-center">
                      <p className="text-base font-bold text-gray-800">
                        {formatMonthYear(calendarMonth)}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Pilih tanggal check-in kamu
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-3 md:p-5">
                  <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                      (day) => (
                        <div
                          key={day}
                          className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-400 md:text-xs"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="h-10 md:h-11"
                          />
                        );
                      }

                      const disabled = isBeforeDay(day, today);
                      const selected = checkIn === formatDateToInput(day);
                      const isToday = isSameDay(day, today);

                      return (
                        <button
                          key={formatDateToInput(day)}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSelectDate(day)}
                          className={`h-10 rounded-xl text-sm font-semibold transition md:h-11 md:rounded-2xl ${
                            disabled
                              ? "cursor-not-allowed bg-gray-50 text-gray-300"
                              : selected
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200"
                              : isToday
                              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-start pt-0 lg:pt-[30px]">
          <button
            type="button"
            onClick={handleSearch}
            disabled={!isFormComplete}
            className="flex min-h-[68px] w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 font-semibold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
          >
            <Search size={18} />
            Cari Hotel
          </button>
        </div>
      </div>
    </div>
  );
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const result = [];

  for (let i = 0; i < startWeekday; i++) {
    result.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    result.push(new Date(year, month, day));
  }

  return result;
}

function formatDateToInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateString(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDateForDisplay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonthYear(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isBeforeDay(a, b) {
  return (
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() &&
      a.getMonth() < b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() < b.getDate())
  );
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}