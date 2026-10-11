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
  MessageSquare
} from "lucide-react";
import { AuthIllustration } from "@/components/auth-illustration";

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
      {/* 2. RIGHT SIDE: SHOWCASE WITH GRAPHIC ILLUSTRATION (Ảnh biểu tượng) */}
      {/* ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-10 xl:p-12 flex-col justify-between overflow-hidden border-l border-white/10 select-none">
        {/* Ambient background blur glow effects */}
        <div className="absolute -top-36 -right-36 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 backdrop-blur-md text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Nền tảng SDLC thế hệ mới
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" /> 99.9% Uptime SLA
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Sprint v2.4
          </span>
        </div>

        {/* Center: Cool Vector Illustration (Ảnh biểu tượng nghệ thuật) */}
        <div className="relative z-10 my-auto py-4">
          <AuthIllustration />

          {/* Testimonial Quote */}
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2 max-w-lg mx-auto shadow-xl">
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "FTodo kết nối liền mạch giữa đội ngũ kỹ thuật thực thi và ban điều hành tài chính, giúp rút ngắn 35% thời gian phát hành sản phẩm."
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="font-semibold text-white">Trần Minh Quân — Giám đốc Công nghệ (CTO)</span>
              <span className="text-slate-400 font-mono">FinTech Pay</span>
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
