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

  // desktop refs
  const desktopDropdownRef = useRef(null);
  const desktopCalendarRef = useRef(null);

  // mobile refs
  const mobileDropdownRef = useRef(null);
  const mobileCalendarRef = useRef(null);

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
      const isInsideDesktopDropdown =
        desktopDropdownRef.current &&
        desktopDropdownRef.current.contains(e.target);

      const isInsideDesktopCalendar =
        desktopCalendarRef.current &&
        desktopCalendarRef.current.contains(e.target);

      const isInsideMobileDropdown =
        mobileDropdownRef.current &&
        mobileDropdownRef.current.contains(e.target);

      const isInsideMobileCalendar =
        mobileCalendarRef.current &&
        mobileCalendarRef.current.contains(e.target);

      if (!isInsideDesktopDropdown && !isInsideMobileDropdown) {
        setShowDropdown(false);
      }

      if (!isInsideDesktopCalendar && !isInsideMobileCalendar) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleOpenDropdown = () => {
    setShowDropdown(true);
    setShowCalendar(false);
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

  const calendarDays = useMemo(() => {
    return buildCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const displayCheckIn = checkIn
    ? formatDateForDisplay(parseDateString(checkIn))
    : "";

  return (
    <div
      data-aos="fade-up"
      className="relative z-30 mx-auto w-full max-w-[980px] rounded-[1.4rem] border border-white/60 bg-white/95 p-2.5 shadow-[0_16px_45px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:p-3 md:rounded-[1.9rem] md:p-4"
    >
      {/* DESKTOP / TABLET */}
      <div className="hidden md:block">
        <div className="rounded-[1.45rem] border border-gray-200 bg-[#fbfbfb] p-2 shadow-inner">
          <div className="grid grid-cols-[1.18fr_1fr_110px] items-center overflow-visible rounded-[1.2rem] border border-gray-200 bg-white">
            {/* DESTINATION */}
            <div
              className="relative min-w-0 border-r border-gray-200"
              ref={desktopDropdownRef}
            >
              <div
                onClick={handleOpenDropdown}
                className={`flex min-h-[68px] cursor-text items-center gap-3 px-4 transition ${
                  destinationError ? "bg-red-50/60" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <MapPin size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    Destination
                  </p>
                  <input
                    value={destination}
                    onFocus={handleOpenDropdown}
                    onChange={handleDestinationChange}
                    onKeyDown={handleKeyDown}
                    className="mt-1 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Cari kota atau hotel..."
                  />
                </div>
              </div>

              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-[1rem] border border-gray-100 bg-white shadow-2xl">
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

            {/* CHECK IN */}
            <div
              className="relative min-w-0 border-r border-gray-200"
              ref={desktopCalendarRef}
            >
              <button
                type="button"
                onClick={handleOpenCalendar}
                onKeyDown={handleKeyDown}
                className={`flex min-h-[68px] w-full items-center gap-3 px-4 text-left transition ${
                  checkInError ? "bg-red-50/60" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <CalendarDays size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    Check In
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-700">
                    {displayCheckIn || "Pilih tanggal check-in"}
                  </p>
                </div>
              </button>

              {showCalendar && (
                <div className="absolute left-0 top-full z-[80] mt-3">
                  <div className="w-[360px] overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)]">
                    <div className="border-b border-gray-100 px-4 py-4">
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-800">
                            {formatMonthYear(calendarMonth)}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400">
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="mb-2.5 grid grid-cols-7 gap-1">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                          (day) => (
                            <div
                              key={day}
                              className="py-1 text-center text-[9px] font-bold uppercase tracking-wide text-gray-400"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          if (!day) {
                            return <div key={`empty-${index}`} className="h-8.5" />;
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
                              className={`h-8.5 rounded-lg text-[11px] font-semibold transition ${
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

            {/* SEARCH */}
            <div className="px-3">
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[0.95rem] bg-red-400 px-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-500"
              >
                <Search size={17} />
                Cari
              </button>
            </div>
          </div>
        </div>

        {(destinationError || checkInError) && (
          <div className="mt-2 flex flex-wrap gap-3 px-1">
            {destinationError && (
              <p className="text-xs font-medium text-red-500">
                {destinationError}
              </p>
            )}
            {checkInError && (
              <p className="text-xs font-medium text-red-500">
                {checkInError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div className="rounded-[1.15rem] border border-gray-200 bg-[#fbfbfb] p-2 shadow-inner">
          <div className="space-y-2 rounded-[1rem] border border-gray-200 bg-white p-2">
            <div className="relative" ref={mobileDropdownRef}>
              <div
                onClick={handleOpenDropdown}
                className={`flex min-h-[42px] items-center gap-2 rounded-[0.85rem] border px-2.5 py-1.5 ${
                  destinationError
                    ? "border-red-300 bg-red-50/60"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <MapPin size={13} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-gray-800">
                    Destination
                  </p>
                  <input
                    value={destination}
                    onFocus={handleOpenDropdown}
                    onChange={handleDestinationChange}
                    onKeyDown={handleKeyDown}
                    className="mt-0.5 w-full bg-transparent text-[11px] text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Cari kota atau hotel..."
                  />
                </div>
              </div>

              {showDropdown && (
                <div className="absolute left-0 right-0 z-[70] mt-2 overflow-hidden rounded-[1rem] border border-gray-100 bg-white shadow-2xl">
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      Memuat tujuan...
                    </div>
                  ) : filteredSuggestions.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredSuggestions.map((item, index) => (
                        <div
                          key={`${item.type}-${item.value}-${index}`}
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-red-50"
                        >
                          <div className="mt-0.5 text-red-500">
                            {item.type === "hotel" ? (
                              <Building2 size={15} />
                            ) : (
                              <MapPin size={15} />
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

            <div className="relative" ref={mobileCalendarRef}>
              <button
                type="button"
                onClick={handleOpenCalendar}
                onKeyDown={handleKeyDown}
                className={`flex min-h-[42px] w-full items-center gap-2 rounded-[0.85rem] border px-2.5 py-1.5 text-left ${
                  checkInError
                    ? "border-red-300 bg-red-50/60"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <CalendarDays size={13} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-gray-800">
                    Check In
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-700">
                    {displayCheckIn || "Pilih tanggal check-in"}
                  </p>
                </div>
              </button>

              {showCalendar && (
                <div className="relative z-[80] mt-2">
                  <div className="w-full overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)]">
                    <div className="border-b border-gray-100 px-4 py-4">
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-800">
                            {formatMonthYear(calendarMonth)}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400">
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="mb-2.5 grid grid-cols-7 gap-1">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                          (day) => (
                            <div
                              key={day}
                              className="py-1 text-center text-[9px] font-bold uppercase tracking-wide text-gray-400"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          if (!day) {
                            return <div key={`empty-${index}`} className="h-8.5" />;
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
                              className={`h-8.5 rounded-lg text-[11px] font-semibold transition ${
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

            <button
              type="button"
              onClick={handleSearch}
              className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-[0.85rem] bg-red-400 px-3 text-[12px] font-semibold text-white shadow-lg transition hover:bg-red-500"
            >
              <Search size={14} />
              Cari Hotel
            </button>
          </div>
        </div>

        {(destinationError || checkInError) && (
          <div className="space-y-1 pt-2">
            {destinationError && (
              <p className="text-center text-[10px] font-medium text-red-500">
                {destinationError}
              </p>
            )}
            {checkInError && (
              <p className="text-center text-[10px] font-medium text-red-500">
                {checkInError}
              </p>
            )}
          </div>
        )}
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