import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  LayoutTemplate,
  Newspaper,
  PlayCircle,
  Save,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Upload,
  Video,
  Sparkles,
  Info,
} from "lucide-react";

const STORAGE_BASE_URL =
  import.meta.env.VITE_STORAGE_URL || "/storage";

export default function MasterContent() {
  const adminUser =
    JSON.parse(localStorage.getItem("adminUser") || "null") ||
    JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    info_title: "",
    info_description: "",
    promo2_title: "",
    promo2_description: "",
    video_title: "",
    video_description: "",
    video_url: "",
  });

  const [existingImages, setExistingImages] = useState({
    hero_image: "",
    info_image: "",
    promo2_image: "",
  });

  const [imageFiles, setImageFiles] = useState({
    hero_image: null,
    info_image: null,
    promo2_image: null,
  });

  const [previewImages, setPreviewImages] = useState({
    hero_image: "",
    info_image: "",
    promo2_image: "",
  });

  const [existingVideo, setExistingVideo] = useState({
    video_path: "",
  });

  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    return () => {
      if (previewImages.hero_image?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImages.hero_image);
      }
      if (previewImages.info_image?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImages.info_image);
      }
      if (previewImages.promo2_image?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImages.promo2_image);
      }
    };
  }, [previewImages]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/website-content");
      const data = res.data?.data || {};

      setForm({
        hero_title: data.hero_title || "",
        hero_subtitle: data.hero_subtitle || "",
        info_title: data.info_title || "",
        info_description: data.info_description || "",
        promo2_title: data.promo2_title || "",
        promo2_description: data.promo2_description || "",
        video_title: data.video_title || "",
        video_description: data.video_description || "",
        video_url: data.video_url || "",
      });

      setExistingImages({
        hero_image: data.hero_image || "",
        info_image: data.info_image || "",
        promo2_image: data.promo2_image || "",
      });

      setPreviewImages({
        hero_image: data.hero_image ? buildStorageUrl(data.hero_image) : "",
        info_image: data.info_image ? buildStorageUrl(data.info_image) : "",
        promo2_image: data.promo2_image
          ? buildStorageUrl(data.promo2_image)
          : "",
      });

      setExistingVideo({
        video_path: data.video_path || "",
      });

      setImageFiles({
        hero_image: null,
        info_image: null,
        promo2_image: null,
      });

      setVideoFile(null);
    } catch (error) {
      console.error("GET WEBSITE CONTENT ERROR:", error.response?.data || error);
      toast.error("Gagal mengambil website content");
    } finally {
      setLoading(false);
    }
  };

const buildStorageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setImageFiles((prev) => ({
      ...prev,
      [name]: file,
    }));

    setPreviewImages((prev) => {
      if (prev[name]?.startsWith("blob:")) {
        URL.revokeObjectURL(prev[name]);
      }

      return {
        ...prev,
        [name]: URL.createObjectURL(file),
      };
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format video harus MP4, WEBM, MOV, atau AVI");
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      toast.error("Ukuran video maksimal 150MB");
      return;
    }

    setVideoFile(file);
    toast.success("Video lokal siap diupload");
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("updated_by", adminUser?.id || "");
      payload.append("hero_title", form.hero_title || "");
      payload.append("hero_subtitle", form.hero_subtitle || "");
      payload.append("info_title", form.info_title || "");
      payload.append("info_description", form.info_description || "");
      payload.append("promo2_title", form.promo2_title || "");
      payload.append("promo2_description", form.promo2_description || "");
      payload.append("video_title", form.video_title || "");
      payload.append("video_description", form.video_description || "");
      payload.append("video_url", form.video_url || "");

      if (imageFiles.hero_image) {
        payload.append("hero_image", imageFiles.hero_image);
      }

      if (imageFiles.info_image) {
        payload.append("info_image", imageFiles.info_image);
      }

      if (imageFiles.promo2_image) {
        payload.append("promo2_image", imageFiles.promo2_image);
      }

      if (videoFile) {
        payload.append("video_file", videoFile);
      }

      await api.post("/admin/website-content", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Website content berhasil diupdate");
      fetchContent();
    } catch (error) {
      console.error(
        "UPDATE WEBSITE CONTENT ERROR:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message || "Gagal update website content"
      );
    } finally {
      setSaving(false);
    }
  };

  const heroImageLabel = useMemo(() => {
    if (imageFiles.hero_image) return imageFiles.hero_image.name;
    if (existingImages.hero_image) return existingImages.hero_image;
    return "Belum ada gambar hero";
  }, [imageFiles.hero_image, existingImages.hero_image]);

  const infoImageLabel = useMemo(() => {
    if (imageFiles.info_image) return imageFiles.info_image.name;
    if (existingImages.info_image) return existingImages.info_image;
    return "Belum ada gambar info";
  }, [imageFiles.info_image, existingImages.info_image]);

  const promo2ImageLabel = useMemo(() => {
    if (imageFiles.promo2_image) return imageFiles.promo2_image.name;
    if (existingImages.promo2_image) return existingImages.promo2_image;
    return "Belum ada gambar promo 2";
  }, [imageFiles.promo2_image, existingImages.promo2_image]);

  const videoFileLabel = useMemo(() => {
    if (videoFile) return videoFile.name;
    if (existingVideo.video_path) return existingVideo.video_path;
    return "Belum ada video lokal";
  }, [videoFile, existingVideo.video_path]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-8 rounded-[2rem] border border-red-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                  <Sparkles size={16} />
                  Panel Admin Content
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                  Master Content
                </h1>
                <p className="mt-2 max-w-2xl text-gray-500">
                  Atur tampilan hero, info, promo tambahan, dan video homepage
                  customer dengan cara yang lebih mudah, ringan, dan nyaman untuk
                  admin.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Simpan perubahan setelah semua bagian selesai diisi.
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
              Memuat website content...
            </div>
          ) : (
            <div className="space-y-6">
              <SectionCard
                icon={<LayoutTemplate size={20} />}
                title="Hero Section"
                subtitle="Bagian paling atas homepage. Isi judul utama, subjudul, dan gambar hero."
                helperText="Tips: gunakan gambar landscape yang bersih dan tulisan yang singkat agar tampil lebih elegan."
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <InputField
                    icon={<Type size={18} />}
                    label="Hero Title"
                    name="hero_title"
                    value={form.hero_title}
                    onChange={handleChange}
                    placeholder="Contoh: Temukan Kamar Nyaman dengan Mudah"
                  />

                  <UploadField
                    label="Upload Gambar Hero"
                    name="hero_image"
                    onChange={handleImageChange}
                    fileLabel={heroImageLabel}
                    accept="image/*"
                    helpText="Format: JPG, PNG, JPEG, WEBP • Maksimal 5MB"
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Hero Subtitle"
                      name="hero_subtitle"
                      value={form.hero_subtitle}
                      onChange={handleChange}
                      placeholder="Masukkan subjudul singkat yang menjelaskan layanan ReadyRoom"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ImagePreviewCard
                      title="Preview Hero Image"
                      imageUrl={previewImages.hero_image}
                      emptyText="Belum ada preview hero image"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<Newspaper size={20} />}
                title="Info / Highlight Section"
                subtitle="Bagian ini cocok untuk promo, informasi penting, atau highlight layanan."
                helperText="Tips: isi judul yang menarik dan deskripsi yang tidak terlalu panjang."
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <InputField
                    icon={<Type size={18} />}
                    label="Info Title"
                    name="info_title"
                    value={form.info_title}
                    onChange={handleChange}
                    placeholder="Contoh: Promo Spesial ReadyRoom"
                  />

                  <UploadField
                    label="Upload Gambar Info"
                    name="info_image"
                    onChange={handleImageChange}
                    fileLabel={infoImageLabel}
                    accept="image/*"
                    helpText="Format: JPG, PNG, JPEG, WEBP • Maksimal 5MB"
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Info Description"
                      name="info_description"
                      value={form.info_description}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi promo atau informasi untuk customer"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ImagePreviewCard
                      title="Preview Info Image"
                      imageUrl={previewImages.info_image}
                      emptyText="Belum ada preview info image"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                icon={<Newspaper size={20} />}
                title="Promo 2 Section"
                subtitle="Tambahan promo kedua untuk memperkaya tampilan homepage customer."
                helperText="Gunakan untuk promo tambahan, keunggulan hotel, atau informasi campaign lainnya."
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <InputField
                    icon={<Type size={18} />}
                    label="Promo 2 Title"
                    name="promo2_title"
                    value={form.promo2_title}
                    onChange={handleChange}
                    placeholder="Contoh: Booking Lebih Fleksibel"
                  />

                  <UploadField
                    label="Upload Gambar Promo 2"
                    name="promo2_image"
                    onChange={handleImageChange}
                    fileLabel={promo2ImageLabel}
                    accept="image/*"
                    helpText="Format: JPG, PNG, JPEG, WEBP • Maksimal 5MB"
                  />

                  <div className="lg:col-span-2">
                    <TextAreaField
                      icon={<AlignLeft size={18} />}
                      label="Promo 2 Description"
                      name="promo2_description"
                      value={form.promo2_description}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi promo kedua"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ImagePreviewCard
                      title="Preview Promo 2 Image"
                      imageUrl={previewImages.promo2_image}
                      emptyText="Belum ada preview promo 2 image"
                    />
                  </div>
                </div>
              </SectionCard>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Info size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Preview Ringan
                    </h2>
                    <p className="text-sm text-gray-500">
                      Ringkasan cepat isi konten yang sedang diatur.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                  <PreviewMiniCard
                    label="HERO"
                    labelClass="text-red-600"
                    title={form.hero_title || "Hero title belum diisi"}
                    description={form.hero_subtitle || "Hero subtitle belum diisi"}
                    footer={heroImageLabel}
                  />

                  <PreviewMiniCard
                    label="INFO"
                    labelClass="text-amber-600"
                    title={form.info_title || "Info title belum diisi"}
                    description={
                      form.info_description || "Info description belum diisi"
                    }
                    footer={infoImageLabel}
                  />

                  <PreviewMiniCard
                    label="PROMO 2"
                    labelClass="text-green-600"
                    title={form.promo2_title || "Promo 2 title belum diisi"}
                    description={
                      form.promo2_description || "Promo 2 description belum diisi"
                    }
                    footer={promo2ImageLabel}
                  />

                  <PreviewMiniCard
                    label="VIDEO"
                    labelClass="text-purple-600"
                    title={form.video_title || "Video title belum diisi"}
                    description={
                      form.video_description || "Video description belum diisi"
                    }
                    footer={
                      videoFile
                        ? `Video lokal: ${videoFile.name}`
                        : form.video_url || videoFileLabel
                    }
                  />
                </div>
              </div>

              <div className="sticky bottom-4 z-10 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-600 disabled:opacity-60"
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

function SectionCard({ icon, title, subtitle, helperText, children }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        {helperText ? (
          <div className="max-w-md rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {helperText}
          </div>
        ) : null}
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
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 py-3.5 pl-12 pr-4 outline-none shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
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
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-4 text-red-400">{icon}</div>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-none rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 py-3.5 pl-12 pr-4 outline-none shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
        />
      </div>
    </div>
  );
}

function UploadField({
  label,
  name,
  onChange,
  fileLabel,
  accept,
  helpText,
  iconType = "image",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <label className="flex min-h-[64px] w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-3 transition hover:border-red-300 hover:from-rose-100 hover:to-red-100">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
          {iconType === "video" ? <Video size={18} /> : <Upload size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {fileLabel || "Pilih file"}
          </p>
          <p className="text-xs text-gray-500">{helpText}</p>
        </div>

        <input
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

function ImagePreviewCard({ title, imageUrl, emptyText }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>

      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <img
            src={imageUrl}
            alt={title}
            className="h-64 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-400">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function VideoInfoCard({
  title,
  videoFileLabel,
  hasVideoFile,
  hasStoredVideo,
  videoUrl,
}) {
  return (
    <div className="rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4">
      <p className="mb-3 text-sm font-semibold text-purple-700">{title}</p>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Video lokal:</span>{" "}
          {videoFileLabel || "Belum ada"}
        </p>
        <p>
          <span className="font-semibold">Status upload baru:</span>{" "}
          {hasVideoFile ? "Sudah dipilih" : "Belum dipilih"}
        </p>
        <p>
          <span className="font-semibold">Video tersimpan:</span>{" "}
          {hasStoredVideo ? "Sudah ada di sistem" : "Belum ada"}
        </p>
        <p className="break-all">
          <span className="font-semibold">Video URL:</span>{" "}
          {videoUrl || "Kosong"}
        </p>
      </div>
    </div>
  );
}

function PreviewMiniCard({ label, labelClass, title, description, footer }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5">
      <p className={`mb-2 text-xs font-semibold ${labelClass}`}>{label}</p>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <p className="mt-3 break-all text-xs text-gray-400">{footer}</p>
    </div>
  );
}