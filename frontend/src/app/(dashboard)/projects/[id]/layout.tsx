import * as React from "react";
import { ProjectProvider } from "./project-context";
import { ProjectNav } from "./project-nav";
import { ProjectSubheader } from "@/components/project-subheader";
import { ProjectSidebar } from "@/components/project-sidebar";

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

          {/* Right Workspace Main Working Area */}
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            {/* Workspace Subheader & Horizontal Tab Bar with Add Page button */}
            <div className="border-b pb-4 mb-6">
              <ProjectSubheader />
              <ProjectNav />
            </div>

            {/* Sub-page Content */}
            <div>{children}</div>
          </div>
        </div>
      </ProjectProvider>
    </React.Suspense>
  );
}
