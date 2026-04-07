import { useEffect } from "react";
import { X } from "lucide-react";

export default function BroadcastModal({ broadcast, onClose }) {
  useEffect(() => {
    if (!broadcast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, [broadcast, onClose]);

  if (!broadcast) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              Broadcast Internal
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-800">
              {broadcast.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {broadcast.message}
          </p>

          <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Pesan internal dari{" "}
            <span className="font-semibold text-cyan-700">IT ReadyRoom</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}