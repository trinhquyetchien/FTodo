"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ProjectNav } from "./project-nav";

export function WorkspaceMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname?.endsWith("/chat");

  if (isChat) {
    return (
      <div className="flex-1 h-full min-w-0 overflow-hidden flex flex-col bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 min-w-0">
      {/* Horizontal Navigation Tab Bar (Chỉ hiển thị ở các trang Home / Workspace) */}
      <div className="border-b pb-3 mb-6">
        <ProjectNav />
      </div>

      {/* Sub-page Content */}
      <div>{children}</div>
    </div>
  );
}
