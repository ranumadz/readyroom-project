import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  LayoutTemplate,
  Newspaper,
  PlayCircle,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  AlignLeft,
} from "lucide-react";

export default function MasterContent() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_image: "",
    info_title: "",
    info_description: "",
    info_image: "",
    video_title: "",
    video_description: "",
    video_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/website-content");
      const data = res.data?.data || {};

      setForm({
        hero_title: data.hero_title || "",
        hero_subtitle: data.hero_subtitle || "",
        hero_image: data.hero_image || "",
        info_title: data.info_title || "",
        info_description: data.info_description || "",
        info_image: data.info_image || "",
        video_title: data.video_title || "",
        video_description: data.video_description || "",
        video_url: data.video_url || "",
      });
    } catch (error) {
      console.error("GET WEBSITE CONTENT ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil website content");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.post("/admin/website-content", {
        ...form,
        updated_by: adminUser?.id,
      });

      toast.success("Website content berhasil diupdate");
      fetchContent();
    } catch (error) {
      console.error("UPDATE WEBSITE CONTENT ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Gagal update website content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Panel Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-800">Master Content</h1>
            <p className="text-gray-500 mt-1">
              Kelola hero, informasi, dan video yang tampil di halaman customer.
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              Memuat website content...
            </div>
          ) : (
            <div className="space-y-6">
              {/* HERO SECTION */}
              <SectionCard
                icon={<LayoutTemplate size={20} />}
                title="Hero Section"
                subtitle="Atur judul utama, subjudul, dan gambar hero customer."
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InputField
                    icon={<Type size={18} />}
                    label="Hero Title"
                    name="hero_title"
                    value={form.hero_title}
                    onChange={handleChange}
                    placeholder="Masukkan judul hero"
                  />

                  <InputField
                    icon={<ImageIcon size={18} />}
                    label="Hero Image URL / Path"
                    name="hero_image"
                    value={form.hero_image}
                    onChange={handleChange}
                    placeholder="/images/hero-readyroom.jpg"
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Hero Subtitle"
                      name="hero_subtitle"
                      value={form.hero_subtitle}
                      onChange={handleChange}
                      placeholder="Masukkan subjudul hero"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* INFO SECTION */}
              <SectionCard
                icon={<Newspaper size={20} />}
                title="Info / Berita Section"
                subtitle="Atur card informasi, promo, atau berita untuk customer."
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InputField
                    icon={<Type size={18} />}
                    label="Info Title"
                    name="info_title"
                    value={form.info_title}
                    onChange={handleChange}
                    placeholder="Masukkan judul info"
                  />

                  <InputField
                    icon={<ImageIcon size={18} />}
                    label="Info Image URL / Path"
                    name="info_image"
                    value={form.info_image}
                    onChange={handleChange}
                    placeholder="/images/info-readyroom.jpg"
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Info Description"
                      name="info_description"
                      value={form.info_description}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi info / berita"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* VIDEO SECTION */}
              <SectionCard
                icon={<PlayCircle size={20} />}
                title="Video Section"
                subtitle="Atur judul, deskripsi, dan link video yang tampil di customer."
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InputField
                    icon={<Type size={18} />}
                    label="Video Title"
                    name="video_title"
                    value={form.video_title}
                    onChange={handleChange}
                    placeholder="Masukkan judul video"
                  />

                  <InputField
                    icon={<LinkIcon size={18} />}
                    label="Video URL"
                    name="video_url"
                    value={form.video_url}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Video Description"
                      name="video_description"
                      value={form.video_description}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi video"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* PREVIEW RINGAN */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Preview Ringan
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-red-600 mb-2">
                      HERO
                    </p>
                    <h3 className="text-xl font-bold text-gray-800">
                      {form.hero_title || "Hero title belum diisi"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {form.hero_subtitle || "Hero subtitle belum diisi"}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 break-all">
                      {form.hero_image || "Belum ada hero image"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-amber-600 mb-2">
                      INFO
                    </p>
                    <h3 className="text-xl font-bold text-gray-800">
                      {form.info_title || "Info title belum diisi"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {form.info_description || "Info description belum diisi"}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 break-all">
                      {form.info_image || "Belum ada info image"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-purple-600 mb-2">
                      VIDEO
                    </p>
                    <h3 className="text-xl font-bold text-gray-800">
                      {form.video_title || "Video title belum diisi"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {form.video_description || "Video description belum diisi"}
                    </p>
                    <p className="text-xs text-gray-400 mt-3 break-all">
                      {form.video_url || "Belum ada video URL"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function InputField({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
        />
      </div>
    </div>
  );
}

function TextAreaField({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-4 text-red-500">{icon}</div>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 outline-none shadow-sm transition focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
        />
      </div>
    </div>
  );
}