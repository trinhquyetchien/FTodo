import * as React from "react";
import { ProjectProvider } from "./project-context";
import { ProjectSidebar } from "@/components/project-sidebar";
import { WorkspaceMain } from "./workspace-main";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 text-xs text-muted-foreground">
          Đang tải không gian làm việc dự án...
        </div>
      }
    >
      <ProjectProvider>
        <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {/* Left Sidebar: Only appears inside the Project Workspace */}
          <ProjectSidebar />

          {/* Right Workspace Main Working Area (Tự động ẩn toolbar khi ở trang Chat) */}
          <WorkspaceMain>{children}</WorkspaceMain>
        </div>
      </ProjectProvider>
    </React.Suspense>
  );
}
