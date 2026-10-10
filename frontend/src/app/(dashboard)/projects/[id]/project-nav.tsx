"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { Kanban, ListTodo, Users, MessageSquare, DollarSign, LayoutDashboard, Plus, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectNav() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params?.id as string || "1";
  const role = searchParams?.get("role") || "owner"; // Mocking role from query param
  const isOwner = role === "owner";

  // Mock permissions state for Member (which tabs they added)
  // In real app, this would be from DB/Context
  const [activeTabs, setActiveTabs] = React.useState<string[]>(["overview", "board"]);

  const allNavItems = [
    { id: "overview", name: "Tổng quan", href: `/projects/${id}?role=${role}`, icon: LayoutDashboard, ownerOnly: false },
    { id: "board", name: "Bảng Scrum", href: `/projects/${id}/board?role=${role}`, icon: Kanban, ownerOnly: false },
    { id: "backlog", name: "Backlog", href: `/projects/${id}/backlog?role=${role}`, icon: ListTodo, ownerOnly: false },
    { id: "chat", name: "Kênh chat", href: `/projects/${id}/chat?role=${role}`, icon: MessageSquare, ownerOnly: false },
    { id: "members", name: "Thành viên", href: `/projects/${id}/members?role=${role}`, icon: Users, ownerOnly: true },
    { id: "cost", name: "Chi phí", href: `/projects/${id}/cost?role=${role}`, icon: DollarSign, ownerOnly: true },
  ];

  const visibleItems = isOwner 
    ? allNavItems 
    : allNavItems.filter(item => activeTabs.includes(item.id));

  const availableToAdd = allNavItems.filter(item => !item.ownerOnly && !activeTabs.includes(item.id));

  const toggleTab = (tabId: string) => {
    setActiveTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 overflow-x-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          // Simple path check ignoring query string
          const isActive = pathname === item.href.split('?')[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}

        {/* Member can add permitted tabs */}
        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1 text-slate-500" })}>
              <Plus className="h-4 w-4" /> Thêm trang
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Các trang được cấp quyền</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allNavItems.filter(i => !i.ownerOnly).map(item => {
                const isActive = activeTabs.includes(item.id);
                return (
                  <DropdownMenuItem key={item.id} onClick={() => toggleTab(item.id)} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-slate-500" />
                      {item.name}
                    </span>
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
