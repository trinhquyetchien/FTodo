"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Crown, Code2, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { login, quickSwitch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || "chien@example.com");
    router.push("/");
  };

  const handleQuickLogin = (role: "owner" | "dev" | "qa") => {
    quickSwitch(role);
    router.push("/");
  };

  return (
    <Card className="border-0 shadow-xl bg-card">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập FTodo</CardTitle>
        <CardDescription>
          Nhập thông tin xác thực để bắt đầu quản lý dự án Scrum
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="chien@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>
        </form>

        {/* Quick Demo Login Section */}
        <div className="pt-2 border-t space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Đăng nhập nhanh một chạm (Dữ liệu Demo)
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("owner")}
              className="w-full text-left p-2.5 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Crown className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Trịnh Quyết Chiến (Chủ dự án - Owner)</div>
                  <div className="text-[11px] text-muted-foreground">Toàn quyền cấu hình, quản lý thành viên, chi phí & xóa dự án</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("dev")}
              className="w-full text-left p-2.5 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Code2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Nguyễn Văn An (Thành viên DEV)</div>
                  <div className="text-[11px] text-muted-foreground">Nhóm DEV (Được chủ dự án cấp thêm quyền xem tab Chi phí)</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("qa")}
              className="w-full text-left p-2.5 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Trần Thị Bình (Thành viên QA)</div>
                  <div className="text-[11px] text-muted-foreground">Quyền nhân viên cơ bản (Không có quyền xem tab Chi phí)</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <div className="text-center text-xs text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
