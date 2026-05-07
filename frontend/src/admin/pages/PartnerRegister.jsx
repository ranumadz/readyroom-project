import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Building2,
  CheckCircle2,
  FileText,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const initialForm = {
  pic_name: "",
  pic_phone: "",
  pic_email: "",
  hotel_name: "",
  city: "",
  address: "",
  map_link: "",
  description: "",
  cooperation_type: "listing",
  thumbnail: null,
};

export default function PartnerRegister() {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isFormReady = useMemo(() => {
    return (
      form.pic_name.trim() &&
      form.pic_phone.trim() &&
      form.pic_email.trim() &&
      form.hotel_name.trim() &&
      form.city.trim() &&
      form.address.trim()
    );
  }, [form]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (file) {
        setPreview(URL.createObjectURL(file));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormReady) {
      alert("Lengkapi data wajib terlebih dahulu.");
      return;
    }

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setPreview("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-900">
      <Navbar />

      <main className="pt-[88px] md:pt-28">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.10),_transparent_32%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-red-600">
                  <ShieldCheck size={15} />
                  ReadyRoom Partner
                </div>

                <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-gray-950 md:text-5xl">
                  Daftarkan hotel kamu sebagai partner listing ReadyRoom.
                </h1>

                <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-gray-600 md:text-lg">
                  Halaman ini masih sample frontend untuk mapping ke bos. Alurnya:
                  hotel luar daftar, tim ReadyRoom verifikasi, lalu akun merchant
                  bisa dibuat setelah disetujui.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoBox
                    title="Daftar"
                    description="Partner isi data hotel."
                  />
                  <InfoBox
                    title="Verifikasi"
                    description="Boss / Super Admin cek data."
                  />
                  <InfoBox
                    title="Tayang"
                    description="Hotel tampil di platform ReadyRoom."
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:p-6">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Building2 size={24} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white/70">
                        Status pengajuan
                      </p>
                      <h2 className="text-xl font-black">
                        Menunggu Verifikasi
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <StatusStep active label="Data partner dikirim" />
                    <StatusStep label="Dicek tim ReadyRoom" />
                    <StatusStep label="Akun merchant dibuat" />
                    <StatusStep label="Hotel tampil di platform" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                  Untuk versi awal, data belum dikirim ke database. Ini aman
                  untuk demo konsep tanpa menyentuh logic operasional ReadyRoom.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          {submitted ? (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-100 bg-white p-7 text-center shadow-sm md:p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                Pengajuan sample berhasil dibuat
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-gray-500 md:text-base">
                Ini baru simulasi frontend. Nanti versi backend akan menyimpan
                pengajuan ke dashboard internal ReadyRoom untuk dicek Boss,
                Super Admin, atau tim IT.
              </p>

              <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-5 text-left">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                  Ringkasan Pengajuan
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SummaryItem label="PIC" value={form.pic_name} />
                  <SummaryItem label="WhatsApp" value={form.pic_phone} />
                  <SummaryItem label="Email" value={form.pic_email} />
                  <SummaryItem label="Nama Hotel" value={form.hotel_name} />
                  <SummaryItem label="Kota" value={form.city} />
                  <SummaryItem label="Tipe Kerja Sama" value="Listing / Iklan" />
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Buat Pengajuan Baru
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]"
            >
              <div className="space-y-6">
                <FormSection
                  title="Data Penanggung Jawab"
                  description="Data PIC hotel yang akan dihubungi tim ReadyRoom."
                  icon={<UserRound size={20} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Nama PIC"
                      name="pic_name"
                      value={form.pic_name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      required
                      icon={<UserRound size={17} />}
                    />

                    <InputField
                      label="Nomor WhatsApp"
                      name="pic_phone"
                      value={form.pic_phone}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      required
                      icon={<MessageCircle size={17} />}
                    />

                    <InputField
                      label="Email"
                      name="pic_email"
                      type="email"
                      value={form.pic_email}
                      onChange={handleChange}
                      placeholder="partner@email.com"
                      required
                      icon={<Mail size={17} />}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Data Hotel"
                  description="Informasi hotel yang ingin diajukan sebagai partner ReadyRoom."
                  icon={<Building2 size={20} />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Nama Hotel"
                      name="hotel_name"
                      value={form.hotel_name}
                      onChange={handleChange}
                      placeholder="Contoh: Hotel Melati Indah"
                      required
                      icon={<Building2 size={17} />}
                    />

                    <InputField
                      label="Kota"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Contoh: Jakarta"
                      required
                      icon={<MapPin size={17} />}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap hotel"
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <div className="mt-4">
                    <InputField
                      label="Link Google Maps"
                      name="map_link"
                      value={form.map_link}
                      onChange={handleChange}
                      placeholder="Paste link Google Maps hotel"
                      icon={<MapPin size={17} />}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Deskripsi Singkat
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Ceritakan fasilitas, lokasi, dan keunggulan hotel"
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </FormSection>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <ImagePlus size={22} />
                    </div>

                    <div>
                      <h3 className="font-black text-gray-950">
                        Foto Hotel
                      </h3>
                      <p className="text-xs font-medium text-gray-500">
                        Sample upload UI
                      </p>
                    </div>
                  </div>

                  <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 text-center transition hover:border-red-300 hover:bg-red-50/50">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview hotel partner"
                        className="h-[220px] w-full object-cover"
                      />
                    ) : (
                      <div className="px-5">
                        <ImagePlus
                          size={34}
                          className="mx-auto mb-3 text-red-500"
                        />
                        <p className="text-sm font-black text-gray-800">
                          Upload thumbnail hotel
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          JPG, PNG, WEBP
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="rounded-[2rem] border border-red-100 bg-red-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-red-700">
                    <FileText size={18} />
                    <h3 className="font-black">Catatan Mapping</h3>
                  </div>

                  <p className="text-sm font-semibold leading-relaxed text-red-700/80">
                    Setelah backend dibuat, form ini akan masuk ke menu internal:
                    Pengajuan Partner. Boss, Super Admin, atau IT bisa approve
                    sebelum merchant mendapat dashboard sendiri.
                  </p>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />
                  Kirim Pengajuan
                </button>
              </aside>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function InfoBox({ title, description }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-sm font-black text-gray-950">{title}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
}

function StatusStep({ label, active = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          active ? "bg-emerald-400 text-white" : "bg-white/10 text-white/45"
        }`}
      >
        <CheckCircle2 size={15} />
      </div>
      <p className={`text-sm font-bold ${active ? "text-white" : "text-white/55"}`}>
        {label}
      </p>
    </div>
  );
}

function FormSection({ title, description, icon, children }) {
  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-black text-gray-950">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
        />
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}