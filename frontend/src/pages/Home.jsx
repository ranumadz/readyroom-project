import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSearchFilter from "../components/HeroSearchFilter";

import {
  Clock,
  ShieldCheck,
  MapPin,
  Wifi,
  Car,
  Coffee,
  ArrowRight,
  Building2,
  Hotel
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600 text-white pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="absolute inset-0">
          <div className="absolute -top-10 left-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute top-20 right-10 w-80 h-80 bg-black/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-300/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 mb-6 shadow-lg">
              <Clock size={16} />
              <span className="text-sm font-medium">
                Booking Transit 3 Jam • Stay Harian • Fleksibel
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
              Find Your Perfect Stay with{" "}
              <span className="bg-gradient-to-r from-amber-100 via-yellow-50 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,245,200,0.55)]">
                ReadyRoom
              </span>
            </h2>

            <p className="text-red-100 text-lg md:text-xl max-w-3xl mx-auto mb-10">
              Booking hotel lebih cepat, lebih fleksibel, dan cocok untuk transit,
              perjalanan bisnis, atau staycation singkat di kota favoritmu.
            </p>
          </div>

          <HeroSearchFilter />
        </div>
      </section>

      <section className="-mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              to="/rooms"
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Hotel size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Explore Rooms</h3>
              <p className="text-gray-500 text-sm">
                Lihat berbagai tipe kamar yang tersedia untuk transit maupun
                menginap.
              </p>
            </Link>

            <Link
              to="/hotels"
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Building2 size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Explore Hotels</h3>
              <p className="text-gray-500 text-sm">
                Temukan hotel partner terbaik di kota-kota populer Indonesia.
              </p>
            </Link>

            <Link
              to="/login"
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold mb-2">Fast Booking</h3>
              <p className="text-gray-500 text-sm">
                Login dan lanjutkan reservasi dengan proses yang cepat dan aman.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Mitra Kami</h2>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Hotel partner yang bekerja sama dengan ReadyRoom untuk menghadirkan
            pengalaman booking yang nyaman dan fleksibel.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            {[
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png",
              "/readyroom.png"
            ].map((logo, i) => (
              <div
                key={i}
                data-aos="zoom-in"
                className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:scale-105 transition duration-300 flex items-center justify-center"
              >
                <img src={logo} className="w-16 h-16 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold">Popular Hotels</h3>
            <p className="text-gray-500 mt-2">
              Pilihan hotel populer untuk transit maupun menginap.
            </p>
          </div>
          <Link to="/hotels" className="text-red-600 font-semibold hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: "/123.jpg", name: "Deluxe Room", city: "Jakarta", price: "Rp450.000" },
            { img: "/4546.jpg", name: "Luxury Suite", city: "Bandung", price: "Rp850.000" },
            { img: "/123.jpg", name: "Standard Room", city: "Surabaya", price: "Rp350.000" }
          ].map((hotel, i) => (
            <Link
              to="/rooms"
              key={i}
              data-aos="fade-up"
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition duration-300 block"
            >
              <img src={hotel.img} className="w-full h-56 object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                    Transit Available
                  </span>
                  <span className="text-xs text-gray-400">ReadyRoom</span>
                </div>

                <h4 className="font-bold text-xl">{hotel.name}</h4>
                <p className="text-gray-500 mt-1">{hotel.city}</p>

                <div className="flex items-center justify-between mt-5">
                  <p className="text-red-600 font-bold text-lg">
                    {hotel.price} <span className="text-sm text-gray-400">/ night</span>
                  </p>
                  <span className="text-sm font-medium text-gray-700">
                    Lihat Detail
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold">Explore by City</h3>
            <p className="text-gray-500 mt-2">
              Temukan destinasi dan kamar favorit di berbagai kota.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { img: "/photo_jakarta.jpg", name: "Jakarta" },
            { img: "/destinasi_bali.jpg", name: "Bali" },
            { img: "/destinasi aceh.jpg", name: "Aceh" },
            { img: "/tebing-breksi.jpg", name: "Yogyakarta" },
            { img: "/destinasi_surabaya.jpg", name: "Surabaya" }
          ].map((city, i) => (
            <Link
              to="/hotels"
              key={i}
              data-aos="zoom-in"
              className="relative rounded-3xl overflow-hidden cursor-pointer group block shadow-md"
            >
              <img
                src={city.img}
                className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex items-end p-4">
                <h4 className="text-white text-xl font-bold">{city.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold">Recommended Hotels</h3>
            <p className="text-gray-500 mt-2">
              Rekomendasi hotel dengan fasilitas premium dan lokasi strategis.
            </p>
          </div>
          <Link to="/hotels" className="text-red-600 font-semibold hover:underline">
            Explore More
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { img: "/hotel1.jpg", name: "Ocean View Resort", city: "Bali", price: "Rp720.000" },
            { img: "/hotel2.jpg", name: "Jakarta Business Hotel", city: "Jakarta", price: "Rp600.000" },
            { img: "/hotel3.jpg", name: "Mountain Escape", city: "Bandung", price: "Rp500.000" }
          ].map((hotel, i) => (
            <Link
              to="/rooms"
              key={i}
              data-aos="fade-up"
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition block"
            >
              <img src={hotel.img} className="w-full h-56 object-cover" />
              <div className="p-5">
                <h4 className="font-bold text-xl">{hotel.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{hotel.city}</p>
                <p className="text-red-600 font-bold mt-4 text-lg">
                  {hotel.price} <span className="text-sm text-gray-400">/ night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h3 className="text-3xl font-bold mb-8">Special Offers</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              data-aos="fade-right"
              className="rounded-3xl p-8 bg-gradient-to-br from-red-600 to-red-500 text-white shadow-xl"
            >
              <h4 className="text-2xl font-bold mb-3">30% OFF Bali Hotels</h4>
              <p className="text-red-100 mb-5">
                Book your dream vacation now dan nikmati promo spesial untuk
                hotel pilihan di Bali.
              </p>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-5 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
              >
                Explore Deal
                <ArrowRight size={18} />
              </Link>
            </div>

            <div
              data-aos="fade-left"
              className="rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black text-white shadow-xl"
            >
              <h4 className="text-2xl font-bold mb-3">Weekend Deals Jakarta</h4>
              <p className="text-gray-300 mb-5">
                Special price untuk weekend stay dan transit singkat di area
                Jakarta.
              </p>
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
              >
                Book Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Mengapa Pilih <span className="text-red-600">ReadyRoom?</span>
          </h2>

          <p className="text-gray-500 mt-3 mb-14 max-w-2xl mx-auto">
            Fasilitas premium, sistem booking fleksibel, dan pengalaman reservasi
            yang cepat untuk kebutuhan transit maupun menginap.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock size={26} />,
                title: "Booking Fleksibel",
                desc: "Durasi booking mulai dari 3 jam hingga 1 hari penuh"
              },
              {
                icon: <ShieldCheck size={26} />,
                title: "Aman & Terpercaya",
                desc: "Keamanan 24/7 dengan sistem booking terpercaya"
              },
              {
                icon: <MapPin size={26} />,
                title: "Lokasi Strategis",
                desc: "Cabang tersedia di berbagai kota besar Indonesia"
              },
              {
                icon: <Wifi size={26} />,
                title: "Wifi High Speed",
                desc: "Internet cepat dan stabil di setiap kamar"
              },
              {
                icon: <Car size={26} />,
                title: "Parkir Luas",
                desc: "Area parkir luas tersedia"
              },
              {
                icon: <Coffee size={26} />,
                title: "Fasilitas Premium",
                desc: "AC, TV, water heater dan fasilitas lengkap"
              }
            ].map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                className="backdrop-blur-lg bg-white/80 border border-white/40 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                    {item.icon}
                  </div>
                </div>

                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="rounded-[2rem] bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white p-8 md:p-12 shadow-2xl">
            <div className="max-w-3xl">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Booking lebih cepat dengan ReadyRoom
              </h3>
              <p className="text-red-100 text-lg mb-6">
                Jelajahi hotel, pilih kamar, dan nikmati sistem booking fleksibel
                untuk transit maupun menginap.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-red-600 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition">
                  Explore Rooms
                </button>
                <button className="bg-black/20 border border-white/20 px-6 py-3 rounded-2xl font-semibold hover:bg-black/30 transition">
                  Download App Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}