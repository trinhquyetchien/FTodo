"use client";

import React from "react";
import { 
  Rocket, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  FolderKanban, 
  Layers, 
  Sparkles 
} from "lucide-react";

export function AuthIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center select-none py-4">
      {/* 1. BACKGROUND GLOW & GEOMETRIC TECH GRID */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="w-64 h-64 bg-indigo-500/25 rounded-full blur-2xl -translate-y-12 translate-x-12" />
        <div className="w-72 h-72 bg-violet-600/20 rounded-full blur-3xl translate-y-16 -translate-x-12" />
      </div>

      {/* 2. VECTOR SVG ILLUSTRATION (Biểu tượng nghệ thuật công nghệ Agile & Scrum) */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 520 380"
          className="w-full h-auto drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="gradSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradBoard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="gradCard1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="gradCard2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradCard3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradRocket" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="gradFlame" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective 3D Grid Floor */}
          <g opacity="0.35" stroke="#64748b" strokeWidth="1">
            <line x1="80" y1="340" x2="440" y2="340" />
            <line x1="40" y1="365" x2="480" y2="365" />
            <line x1="160" y1="310" x2="110" y2="375" />
            <line x1="260" y1="310" x2="260" y2="375" />
            <line x1="360" y1="310" x2="410" y2="375" />
          </g>

          {/* Central Isometric Scrum / Kanban Board */}
          <g transform="translate(70, 70)">
            {/* Main Board Canvas */}
            <rect
              x="0"
              y="0"
              width="380"
              height="240"
              rx="20"
              fill="url(#gradBoard)"
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Board Header Bar */}
            <rect x="0" y="0" width="380" height="42" rx="20" fill="#1e293b" opacity="0.8" />
            <circle cx="25" cy="21" r="5" fill="#ef4444" />
            <circle cx="42" cy="21" r="5" fill="#f59e0b" />
            <circle cx="59" cy="21" r="5" fill="#10b981" />
            
            {/* Header Text Mockup */}
            <rect x="80" y="16" width="120" height="10" rx="5" fill="#475569" />
            <rect x="310" y="15" width="50" height="12" rx="6" fill="#3b82f6" opacity="0.6" />

            {/* Column 1: TO DO */}
            <g transform="translate(18, 55)">
              <rect x="0" y="0" width="105" height="165" rx="10" fill="#0f172a" opacity="0.6" />
              <rect x="10" y="10" width="45" height="8" rx="4" fill="#64748b" />
              {/* Card 1 */}
              <rect x="8" y="28" width="89" height="58" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="16" y="38" width="50" height="6" rx="3" fill="#94a3b8" />
              <rect x="16" y="50" width="70" height="4" rx="2" fill="#475569" />
              <rect x="16" y="68" width="22" height="10" rx="5" fill="#0284c7" opacity="0.7" />
              {/* Card 2 */}
              <rect x="8" y="94" width="89" height="55" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="16" y="104" width="42" height="6" rx="3" fill="#94a3b8" />
              <rect x="16" y="116" width="60" height="4" rx="2" fill="#475569" />
              <rect x="16" y="132" width="22" height="10" rx="5" fill="#a855f7" opacity="0.7" />
            </g>

            {/* Column 2: IN PROGRESS (Featured Glowing Column) */}
            <g transform="translate(137, 55)">
              <rect x="0" y="0" width="105" height="165" rx="10" fill="#1e1b4b" opacity="0.4" stroke="#6366f1" strokeWidth="1" />
              <rect x="10" y="10" width="60" height="8" rx="4" fill="#818cf8" />
              {/* Glowing In-Progress Card */}
              <rect x="8" y="28" width="89" height="74" rx="8" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
              <rect x="16" y="38" width="28" height="10" rx="5" fill="#4f46e5" />
              <rect x="16" y="54" width="72" height="6" rx="3" fill="#f8fafc" />
              <rect x="16" y="65" width="55" height="4" rx="2" fill="#94a3b8" />
              {/* Mini progress bar inside card */}
              <rect x="16" y="78" width="72" height="4" rx="2" fill="#334155" />
              <rect x="16" y="78" width="50" height="4" rx="2" fill="#10b981" />
              {/* Card 2 */}
              <rect x="8" y="110" width="89" height="45" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="16" y="120" width="52" height="6" rx="3" fill="#94a3b8" />
              <rect x="16" y="132" width="22" height="10" rx="5" fill="#f59e0b" opacity="0.7" />
            </g>

            {/* Column 3: DONE */}
            <g transform="translate(256, 55)">
              <rect x="0" y="0" width="105" height="165" rx="10" fill="#064e3b" opacity="0.3" stroke="#10b981" strokeWidth="1" />
              <rect x="10" y="10" width="40" height="8" rx="4" fill="#34d399" />
              {/* Completed Card 1 */}
              <rect x="8" y="28" width="89" height="58" rx="8" fill="#1e293b" stroke="#059669" strokeWidth="1" />
              <rect x="16" y="38" width="58" height="6" rx="3" fill="#f1f5f9" />
              <circle cx="75" cy="65" r="7" fill="#10b981" />
              <path d="M72 65L74 67L78 63" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Completed Card 2 */}
              <rect x="8" y="94" width="89" height="55" rx="8" fill="#1e293b" stroke="#059669" strokeWidth="1" />
              <rect x="16" y="104" width="48" height="6" rx="3" fill="#f1f5f9" />
              <circle cx="75" cy="130" r="7" fill="#10b981" />
              <path d="M72 130L74 132L78 128" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* 3. FLYING SPEED ROCKET (Tên Lửa Sprint Velocity Đang Cất Cánh) */}
          <g transform="translate(385, 30) rotate(-15)">
            {/* Flame Trail */}
            <ellipse cx="25" cy="85" rx="10" ry="25" fill="url(#gradFlame)" filter="url(#glowFilter)" />
            <ellipse cx="25" cy="80" rx="6" ry="16" fill="#fef08a" />
            
            {/* Rocket Fins */}
            <path d="M5 60L15 45L15 70Z" fill="#3b82f6" />
            <path d="M45 60L35 45L35 70Z" fill="#3b82f6" />

            {/* Rocket Main Body */}
            <path
              d="M25 0C15 20 12 45 12 65C12 68 38 68 38 65C38 45 35 20 25 0Z"
              fill="url(#gradRocket)"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Rocket Window / Porthole */}
            <circle cx="25" cy="32" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <circle cx="23" cy="30" r="2.5" fill="#ffffff" />
            {/* Rocket Accent Stripes */}
            <path d="M13 52H37" stroke="#ef4444" strokeWidth="3" />
          </g>

          {/* 4. FLOATING PARTICLES & STARS */}
          <circle cx="45" cy="60" r="3" fill="#38bdf8" opacity="0.8" />
          <circle cx="490" cy="190" r="2.5" fill="#a855f7" opacity="0.8" />
          <circle cx="35" cy="220" r="2" fill="#34d399" opacity="0.8" />
          <circle cx="440" cy="310" r="3" fill="#f59e0b" opacity="0.8" />
          <path d="M60 140L63 146L70 147L64 152L66 158L60 154L54 158L56 152L50 147L57 146Z" fill="#facc15" opacity="0.7" />
          <path d="M465 70L467 74L472 75L468 79L469 84L465 81L461 84L462 79L458 75L463 74Z" fill="#facc15" opacity="0.7" />
        </svg>
      </div>

      {/* 3. THREE FLOATING 3D GLASS WIDGETS (Các Thẻ Biểu Tượng Nổi Tinh Tế) */}
      <div className="w-full grid grid-cols-3 gap-3 -mt-6 relative z-20 px-2">
        {/* Widget 1: Sprint Velocity */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2.5 hover:scale-105 transition-transform">
          <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium truncate">Sprint 1 Velocity</div>
            <div className="text-xs font-bold text-white truncate">28 Điểm SP</div>
          </div>
        </div>

        {/* Widget 2: Financial ROI / EVM */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2.5 hover:scale-105 transition-transform">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium truncate">Tỷ suất ROI & EVM</div>
            <div className="text-xs font-bold text-emerald-400 truncate">+140% (CPI 1.08)</div>
          </div>
        </div>

        {/* Widget 3: Security & RBAC */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2.5 hover:scale-105 transition-transform">
          <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-medium truncate">Bảo mật Dự án</div>
            <div className="text-xs font-bold text-amber-300 truncate">RBAC Chuẩn ISO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
