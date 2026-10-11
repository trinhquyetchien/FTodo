"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

export function ProjectSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.id as string) || "ftodo-core";

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_sidebar_collapsed", String(nextState));
    }
  };

  const isChatActive = pathname === `/projects/${projectId}/chat`;

  return (
    <aside
      className={`bg-card border-r flex flex-col shrink-0 h-full select-none transition-all duration-200 ${
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

      {/* Main Sidebar Area: Rounded Chat Button */}
      <div className="flex-1 p-2.5 space-y-2">
        <Link
          href={`/projects/${projectId}/chat`}
          title={isCollapsed ? "Kênh chat dự án" : undefined}
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
              <div className="font-semibold truncate">Kênh chat dự án</div>
              <div
                className={`text-[10px] truncate ${
                  isChatActive ? "text-primary-foreground/80 font-normal" : "text-muted-foreground"
                }`}
              >
                Trao đổi realtime
              </div>
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
  );
}
