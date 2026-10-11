import React, { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Header wrapped in Suspense for usePathname() / useParams() */}
      <Suspense fallback={<div className="h-16 bg-card border-b shrink-0" />}>
        <DashboardHeader />
      </Suspense>

      {/* Main Content Area (Full Width on Home/Dashboard) */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
