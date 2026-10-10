export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 text-primary">FTodo</h2>
          <p className="mt-2 text-sm text-slate-600">Quản lý dự án của bạn hiệu quả hơn</p>
        </div>
        {children}
      </div>
    </div>
  );
}
