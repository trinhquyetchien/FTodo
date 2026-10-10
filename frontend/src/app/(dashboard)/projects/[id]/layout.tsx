import * as React from "react";
import { ProjectNav } from "./project-nav";

const mockRole = "OWNER";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Project Sub-header / Tabs */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Dự án: E-Commerce App</h2>
        <React.Suspense fallback={<div>Loading navigation...</div>}>
          <ProjectNav />
        </React.Suspense>
      </div>

      {/* Project Content */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
