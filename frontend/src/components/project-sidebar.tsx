"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  X
} from "lucide-react";

export function ProjectSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.id as string) || "ftodo-core";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    }
  }, []);

  useEffect(() => {
    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);
    window.addEventListener("ftodo_toggle_mobile_sidebar", toggleMobile);
    window.addEventListener("ftodo_close_mobile_sidebar", closeMobile);
    return () => {
      window.removeEventListener("ftodo_toggle_mobile_sidebar", toggleMobile);
      window.removeEventListener("ftodo_close_mobile_sidebar", closeMobile);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_sidebar_collapsed", String(nextState));
    }
  };

  const isChatActive = pathname?.includes(`/projects/${projectId}/chat`);

  return (
    <>
      {/* Desktop Sidebar: Hidden on mobile screens */}
      <aside
        className={`hidden md:flex bg-card border-r flex-col shrink-0 h-full select-none transition-all duration-200 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
      {/* Top Header: Toggle Collapse / Expand Button */}
      <div className={`border-b p-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
            Menu dự án
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted"
          title={isCollapsed ? "Mở rộng menu bên trái" : "Thu gọn menu bên trái"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Sidebar Area: Home & Chat Navigation */}
      <div className="flex-1 p-2.5 space-y-2">
        {/* 1. Home / Workspace Pages */}
        <Link
          href={`/projects/${projectId}/board`}
          title={isCollapsed ? "Không gian dự án" : undefined}
          className={`flex items-center rounded-2xl text-xs font-medium transition-all ${
            isCollapsed
              ? "justify-center p-3 w-11 h-11 mx-auto"
              : "gap-3 px-3.5 py-3"
          } ${
            !isChatActive
              ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
              : "text-foreground bg-muted/40 hover:bg-muted border border-border/50 hover:border-primary/40 shadow-2xs"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl shrink-0 transition-colors ${
              !isChatActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            }`}
          >
            <Home className="h-4 w-4" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">Không gian dự án</div>
            </div>
          )}
        </Link>

        {/* 2. Chat / Kênh Chat & Cá nhân */}
        <Link
          href={`/projects/${projectId}/chat`}
          title={isCollapsed ? "Kênh chat & Tin nhắn" : undefined}
          className={`flex items-center rounded-2xl text-xs font-medium transition-all ${
            isCollapsed
              ? "justify-center p-3 w-11 h-11 mx-auto"
              : "gap-3 px-3.5 py-3"
          } ${
            isChatActive
              ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
              : "text-foreground bg-muted/40 hover:bg-muted border border-border/50 hover:border-primary/40 shadow-2xs"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl shrink-0 transition-colors ${
              isChatActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">Kênh chat & Tin nhắn</div>
            </div>
          )}
        </Link>
      </div>

      {/* Exit Workspace Button: Pinned at bottom */}
      <div className="p-2.5 border-t mt-auto bg-muted/10">
        <Link
          href="/"
          title={isCollapsed ? "Thoát không gian làm việc" : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900 ${
            isCollapsed
              ? "justify-center w-11 h-11 mx-auto p-0"
              : "gap-2.5 px-3 py-2.5"
          }`}
        >
          <LogOut className="h-4 w-4 text-rose-500 shrink-0" />
          {!isCollapsed && <span className="truncate">Thoát không gian</span>}
        </Link>
      </div>
    </aside>

    {/* Mobile Off-canvas Drawer (Only visible on mobile when toggled) */}
    {isMobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Drawer Content */}
        <aside className="relative w-64 max-w-[80vw] bg-card border-r h-full flex flex-col shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="border-b p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">
              Menu dự án
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Links */}
          <div className="flex-1 p-3 space-y-2">
            <Link
              href={`/projects/${projectId}/board`}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                !isChatActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "text-foreground bg-muted/40 hover:bg-muted border border-border/50"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl shrink-0 ${
                  !isChatActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                <Home className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">Không gian dự án</div>
              </div>
            </Link>

            <Link
              href={`/projects/${projectId}/chat`}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                isChatActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "text-foreground bg-muted/40 hover:bg-muted border border-border/50"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl shrink-0 ${
                  isChatActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">Kênh chat & Tin nhắn</div>
              </div>
            </Link>
          </div>

          {/* Exit Button */}
          <div className="p-3 border-t mt-auto bg-muted/10">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-200"
            >
              <LogOut className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Thoát không gian</span>
            </Link>
          </div>
        </aside>
      </div>
    )}
  </>
  );
}
