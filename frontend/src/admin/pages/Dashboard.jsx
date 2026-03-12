import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  Building2,
  Users,
  CalendarCheck,
  ArrowUpRight,
  Wallet,
  BedDouble,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get("/admin/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Gagal mengambil data hotel:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get("/admin/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Gagal mengambil data room:", error);
    }
  };

  const bookingData = [
    { name: "Mon", bookings: 12 },
    { name: "Tue", bookings: 18 },
    { name: "Wed", bookings: 15 },
    { name: "Thu", bookings: 22 },
    { name: "Fri", bookings: 28 },
    { name: "Sat", bookings: 32 },
    { name: "Sun", bookings: 25 },
  ];

  const recentBookings = [
    {
      room: "Deluxe Room",
      city: "Jakarta",
      guest: "Andi Saputra",
      status: "Paid",
    },
    {
      room: "Standard Room",
      city: "Bandung",
      guest: "Siti Rahma",
      status: "Pending",
    },
    {
      room: "Suite Room",
      city: "Bali",
      guest: "Budi Santoso",
      status: "Paid",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview sistem booking ReadyRoom
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <Building2 size={22} />
                </div>
                <ArrowUpRight className="text-gray-400" size={18} />
              </div>

              <h2 className="text-gray-500 text-sm">Total Hotels</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {hotels.length}
              </p>
              <p className="text-green-500 text-sm mt-2">
                Data hotel dari backend
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <CalendarCheck size={22} />
                </div>
                <ArrowUpRight className="text-gray-400" size={18} />
              </div>

              <h2 className="text-gray-500 text-sm">Total Bookings</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">53</p>
              <p className="text-green-500 text-sm mt-2">
                +12 booking hari ini
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <Users size={22} />
                </div>
                <ArrowUpRight className="text-gray-400" size={18} />
              </div>

              <h2 className="text-gray-500 text-sm">Total Users</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">120</p>
              <p className="text-green-500 text-sm mt-2">+8 user baru</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Wallet size={22} />
                </div>
                <ArrowUpRight className="text-gray-400" size={18} />
              </div>

              <h2 className="text-gray-500 text-sm">Total Rooms</h2>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {rooms.length}
              </p>
              <p className="text-green-500 text-sm mt-2">
                Data room dari backend
              </p>
            </div>
          </div>

          {/* Analytics + Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Booking Analytics
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Performa booking mingguan
                  </p>
                </div>

                <button className="text-sm text-red-600 font-medium hover:underline">
                  View Report
                </button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingData}>
                    <defs>
                      <linearGradient
                        id="bookingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#dc2626"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#dc2626"
                      strokeWidth={3}
                      fill="url(#bookingGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Quick Overview
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-500">Check-in Hari Ini</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">18</h3>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-500">Check-out Hari Ini</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">11</h3>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-500">Kamar Tersedia</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">34</h3>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-sm text-red-500">Occupancy Rate</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">78%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent + Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Bookings
                </h2>
                <button className="text-sm text-red-600 font-medium hover:underline">
                  See All
                </button>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.room}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.city} • {booking.guest}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        booking.status === "Paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-red-600 text-white p-4 rounded-2xl hover:bg-red-700 transition font-medium">
                  Add Hotel
                </button>

                <button className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-black transition font-medium">
                  Add Room
                </button>

                <button className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition font-medium">
                  Manage Booking
                </button>

                <button className="bg-gray-200 text-gray-800 p-4 rounded-2xl hover:bg-gray-300 transition font-medium">
                  Manage Users
                </button>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BedDouble size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      Booking Transit 3 Jam
                    </h3>
                    <p className="text-sm text-red-100 mt-1">
                      Siapkan panel khusus untuk booking transit agar admin lebih
                      mudah mengatur kamar dan jam check-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel List */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Hotels
              </h2>
              <span className="text-sm text-gray-500">
                Total: {hotels.length}
              </span>
            </div>

            {hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {hotel.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {hotel.area} • {hotel.city?.name}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-green-600">
                      {hotel.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data hotel.</p>
            )}
          </div>

          {/* Room List */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Data Rooms
              </h2>
              <span className="text-sm text-gray-500">
                Total: {rooms.length}
              </span>
            </div>

            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {room.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {room.type} • {room.hotel?.name}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Rp{room.price_per_night} / night
                      </p>
                    </div>

                    <span className="text-sm font-medium text-blue-600">
                      Capacity: {room.capacity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada data room.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}