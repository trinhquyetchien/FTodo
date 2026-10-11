"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email || "chien@example.com");
      router.push("/");
    }, 350);
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setIsLoading(true);
    setTimeout(() => {
      login("chien@example.com");
      router.push("/");
    }, 300);
  };

  return (
    <Card className="border shadow-xl rounded-2xl bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-1.5 pb-4 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Chào mừng trở lại
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập tài khoản</CardTitle>
        <CardDescription className="text-xs">
          Truy cập không gian làm việc Scrum và trung tâm tài chính dự án của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1. SOCIAL LOGIN BUTTONS (Google & GitHub như các trang web khác) */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            className="h-10 text-xs font-semibold gap-2 border-border/80 hover:bg-muted/60 rounded-xl"
            disabled={isLoading}
          >
            {/* Google Colorful G Logo SVG */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("github")}
            className="h-10 text-xs font-semibold gap-2 border-border/80 hover:bg-muted/60 rounded-xl"
            disabled={isLoading}
          >
            {/* GitHub Octocat SVG */}
            <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-card px-2.5 text-muted-foreground tracking-wider">
              Hoặc tiếp tục với Email
            </span>
          </div>
        </div>

        {/* 2. EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email công việc</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">Mật khẩu</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 text-sm h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus-visible:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 rounded-xl font-bold gap-2 shadow-sm text-sm bg-primary hover:bg-primary/95 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Đang kết nối hệ thống...</span>
            ) : (
              <>
                <span>Đăng nhập vào FTodo</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Subtle quick account hint */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Mặc định: <strong className="text-foreground">chien@example.com</strong></span>
          </span>
          <span className="text-[10px] text-muted-foreground/70 font-mono">Mật khẩu: bất kỳ</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <div className="text-center text-xs text-muted-foreground">
          Chưa có tài khoản FTodo?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
