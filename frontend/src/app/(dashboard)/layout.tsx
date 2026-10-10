import Link from "next/link";
import { LayoutDashboard, FolderKanban, Settings, Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-primary">
          FTodo
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <FolderKanban className="h-5 w-5" />
            <span>Dự án</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Tài khoản</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {/* We could make this dynamic later */}
            Tổng quan
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
