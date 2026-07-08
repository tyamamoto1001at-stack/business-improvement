"use client";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/50 px-4 py-10">
      <div className="ledger-card w-full max-w-lg rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ledger text-lg font-bold text-navy-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-md px-2 py-1 text-navy-900/60 hover:bg-navy-50 hover:text-navy-900"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
