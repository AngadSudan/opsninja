"use client";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="w-full max-w-md rounded-3xl border border-[#dfe5dc] bg-white p-7 sm:p-8 shadow-2xl shadow-[#20251f]/15 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              isDestructive
                ? "bg-[#fff1f1] text-[#b91c1c]"
                : "bg-[#f0f5ee] text-[#59745b]"
            }`}
          >
            {isDestructive ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>

          <div className="flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold tracking-tight text-[#20251f]"
            >
              {title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#596257]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#f0f3ee] pt-5">
          <button
            className="rounded-xl border border-[#dfe5dc] bg-white px-5 py-2.5 text-xs font-bold text-[#596257] transition hover:border-[#20251f]/30 hover:bg-[#fafaf8] hover:text-[#20251f]"
            type="button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-[0.98] ${
              isDestructive
                ? "bg-[#b91c1c] shadow-red-700/15 hover:bg-[#991b1b]"
                : "bg-[#20251f] shadow-[#20251f]/15 hover:bg-[#323c31]"
            }`}
            type="button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
