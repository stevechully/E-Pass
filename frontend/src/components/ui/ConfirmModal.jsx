import { Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  processing = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-70 shadow-md shadow-rose-600/20"
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : "Confirm"}
          </button>
        </div>

      </div>
    </div>
  );
}