"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  subtitleText?: string;
}

export function LogoIcon({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-primary/20 transition-transform group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="ftodoLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Glyph Light Gradient */}
          <linearGradient id="glyphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>

          {/* Accent Glow */}
          <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <filter id="logoInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Squircle Container */}
        <rect width="40" height="40" rx="12" fill="url(#ftodoLogoGrad)" />
        {/* Subtle Inner Highlight Ring */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* Diagonal Light Streak */}
        <path
          d="M0 24L24 0H36L0 36V24Z"
          fill="white"
          fillOpacity="0.08"
        />

        {/* Geometric Stylized Agile "F" Glyph */}
        {/* Vertical Stem */}
        <rect x="9.5" y="9.5" width="5.5" height="21" rx="2.75" fill="url(#glyphGrad)" />

        {/* Top Horizontal Bar */}
        <rect x="9.5" y="9.5" width="20" height="5.5" rx="2.75" fill="url(#glyphGrad)" />

        {/* Middle Horizontal Bar */}
        <rect x="9.5" y="17.5" width="14" height="5" rx="2.5" fill="url(#glyphGrad)" />

        {/* Agile Velocity Accent Pill (Cyan/Emerald) */}
        <rect
          x="26"
          y="18"
          width="5"
          height="5"
          rx="2.5"
          fill="url(#accentGlow)"
          filter="url(#logoInnerGlow)"
        />

        {/* Agile Completion Check Accent */}
        <circle cx="21" cy="27.5" r="2.5" fill="#38bdf8" />
        <circle cx="28.5" cy="27.5" r="2.5" fill="#34d399" />
      </svg>
    </div>
  );
}

export function Logo({
  className = "",
  size = "md",
  showSubtitle = true,
  subtitleText = "Quản trị Dự án Scrum & Tài chính",
}: LogoProps) {
  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 46,
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.2",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-0.5",
  };

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={iconSizes[size]} />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 leading-tight">
          <span className={`font-black tracking-tight text-foreground font-sans ${titleSizes[size]}`}>
            <span className="bg-linear-to-r from-primary via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              F
            </span>
            <span>Todo</span>
          </span>
          <span
            className={`font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 ${badgeSizes[size]}`}
          >
            Scrum SDLC
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-muted-foreground leading-tight truncate mt-0.5">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}
