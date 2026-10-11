import React from "react";
import Link from "next/link";
import { 
  FolderKanban, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  MessageSquare,
  Lock
} from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background selection:bg-primary/20">
      {/* ============================================================== */}
      {/* 1. LEFT SIDE: FORM CONTAINER                                   */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 w-full lg:w-1/2 max-w-xl mx-auto lg:max-w-none">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-linear-to-tr from-primary via-indigo-600 to-violet-600 text-primary-foreground font-black flex items-center justify-center text-xl shadow-lg shadow-primary/25 group-hover:scale-105 transition-all">
              F
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                FTodo
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Agile SDLC
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Quản trị Dự án Scrum & Tài chính EVM
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Form Area (Login or Register) */}
        <div className="my-auto py-8 w-full max-w-md mx-auto">
          {children}
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Bảo mật chuẩn ISO 27001 & SSL 256-bit</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            © 2026 FTodo Software Platform
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. RIGHT SIDE: SHOWCASE & PRODUCT PREVIEW MOCKUP (Ảnh mẫu)     */}
      {/* ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-12 flex-col justify-between overflow-hidden border-l border-white/10 select-none">
        {/* Ambient background blur glow effects */}
        <div className="absolute -top-36 -right-36 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Nền tảng SDLC thế hệ mới
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" /> 99.9% Uptime SLA
          </span>
        </div>

        {/* Center: Showcase Illustration / Mockup Card (Ảnh mẫu sản phẩm trực quan) */}
        <div className="relative z-10 my-auto py-6 space-y-4 max-w-lg mx-auto w-full">
          {/* Main Mockup Card: Scrum Sprint & Velocity */}
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 shadow-2xl space-y-4 hover:border-white/25 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  <FolderKanban className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">FinTech Pay — Sprint 1</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">14 User Stories • Mục tiêu: Xác thực JWT & Phân quyền</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                Velocity 28 SP
              </span>
            </div>

            {/* Task Card Sample */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 font-semibold border border-blue-500/30">
                  FT-104 • Đang thực hiện
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  5 SP (Fibonacci)
                </span>
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                Tích hợp Swagger OpenAPI 3.0 & Xác thực Bearer Token
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-indigo-500 text-[10px] flex items-center justify-center font-bold text-white ring-1 ring-white/20">
                    VA
                  </div>
                  <span className="text-slate-200 font-medium">Nguyễn Văn An</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Hạn: 24/10/2026</span>
              </div>
            </div>

            {/* EVM / Financial Micro Card */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Chỉ số ROI</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">+140%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 font-medium">CPI (EVM)</div>
                <div className="text-sm font-bold text-blue-300 mt-0.5">1.08 (Tốt)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Runway</div>
                <div className="text-sm font-bold text-purple-300 mt-0.5">8 Sprints</div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2 shadow-lg">
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "FTodo kết nối hoàn hảo giữa đội ngũ kỹ thuật thực thi và ban điều hành tài chính, giúp rút ngắn 35% thời gian phát hành sản phẩm."
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="font-semibold text-white">Trần Minh Quân — Giám đốc Công nghệ (CTO)</span>
              <span className="text-slate-400">FinTech Pay</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Burndown & WBS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Quản trị ROI & EVM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Phân quyền RBAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-amber-400" />
            <span>Kênh Chat Realtime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
