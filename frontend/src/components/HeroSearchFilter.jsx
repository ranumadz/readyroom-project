import { Clock, Search, CalendarDays, Hotel, ArrowRight } from "lucide-react";

export default function HeroSearchFilter() {
  return (
    <div
      data-aos="fade-up"
      className="max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 md:p-6 border border-white/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
          <label className="text-sm font-semibold text-red-600 mb-2 block">
            Destination
          </label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-red-500">
            <Search size={18} className="text-gray-400" />
            <input
              className="w-full bg-transparent outline-none text-gray-800"
              placeholder="Cari kota atau hotel"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-600 mb-2 block">
            Check In
          </label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-red-500">
            <CalendarDays size={18} className="text-gray-400" />
            <input
              type="date"
              className="w-full bg-transparent outline-none text-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-600 mb-2 block">
            Duration
          </label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50">
            <Clock size={18} className="text-gray-400" />
            <select className="w-full bg-transparent outline-none text-gray-800">
              <option>3 Jam Transit</option>
              <option>6 Jam Transit</option>
              <option>12 Jam Transit</option>
              <option>1 Malam</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-600 mb-2 block">
            Room Type
          </label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50">
            <Hotel size={18} className="text-gray-400" />
            <select className="w-full bg-transparent outline-none text-gray-800">
              <option>Semua Kamar</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 text-sm font-medium hover:bg-red-100 transition">
            Transit Friendly
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-100 transition">
            Free Wifi
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium hover:bg-gray-100 transition">
            Breakfast
          </button>
        </div>

        <button className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-2xl hover:bg-red-700 transition shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 font-semibold">
          Search Room
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}