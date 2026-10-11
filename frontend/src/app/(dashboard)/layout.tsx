"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard-header";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Đang xác thực tài khoản...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

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
