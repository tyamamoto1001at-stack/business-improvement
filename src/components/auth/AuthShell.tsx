export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-ledger text-2xl font-bold tracking-wide text-white">業務棚卸し台帳</p>
          <p className="mt-1 text-xs tracking-widest text-navy-300">GYOMU TANAOROSHI DAICHO</p>
        </div>
        <div className="rounded-lg border border-navy-700 bg-paper px-6 py-7 shadow-xl">
          <h1 className="font-ledger text-lg font-semibold text-navy-800">{title}</h1>
          <p className="mt-1 mb-5 text-xs text-navy-500">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
