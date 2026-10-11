import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-slate-50/70 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 selection:bg-primary/20">
      {/* Top Header Logo */}
      <div className="pt-4 sm:pt-6">
        <Link href="/">
          <Logo size="md" subtitleText="Quản trị Dự án Scrum & Tài chính EVM" />
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
