import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-slate-50/70 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 selection:bg-primary/20">
      {/* Top Header Logo */}
      <div className="pt-4 sm:pt-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              FTodo
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Scrum SDLC
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-none">
              Quản trị Dự án & Tài chính
            </p>
          </div>
        </Link>
      </div>

      {/* Center Form Container (Clean, minimal, centered UX/UI) */}
      <div className="w-full max-w-md my-auto py-6">
        {children}
      </div>

      {/* Bottom Footer */}
      <div className="pb-4 text-center text-xs text-muted-foreground space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Bảo mật dữ liệu chuẩn ISO 27001 & SSL 256-bit</span>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          © 2026 FTodo Platform. Mọi quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}
