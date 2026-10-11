"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  Send, 
  RotateCw,
  ShieldCheck
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setResendCooldown(60);
    }, 500);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResendCooldown(60);
    }, 400);
  };

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <Card className="border shadow-xl rounded-2xl bg-card/95 backdrop-blur-sm">
      {!isSubmitted ? (
        /* ============================================================== */
        /* STATE 1: FORM NHẬP EMAIL KHÔI PHỤC                            */
        /* ============================================================== */
        <>
          <CardHeader className="space-y-1.5 pb-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Khôi phục tài khoản
              </span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Đừng lo lắng! Nhập email liên kết với tài khoản FTodo của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu tức thì.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email công việc đã đăng ký</Label>
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
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl font-bold gap-2 shadow-sm text-sm bg-primary hover:bg-primary/95 text-primary-foreground"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <span>Đang gửi mã xác thực...</span>
                ) : (
                  <>
                    <span>Gửi liên kết khôi phục</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Quy trình bảo mật nghiêm ngặt</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Liên kết đặt lại mật khẩu có hiệu lực trong vòng <strong>15 phút</strong> và chỉ sử dụng được 1 lần duy nhất để bảo đảm an toàn dữ liệu dự án.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t pt-4 text-xs">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Đăng nhập</span>
            </Link>

            <Link
              href="/register"
              className="text-primary hover:underline font-bold"
            >
              Đăng ký tài khoản mới
            </Link>
          </CardFooter>
        </>
      ) : (
        /* ============================================================== */
        /* STATE 2: ĐÃ GỬI EMAIL THÀNH CÔNG                               */
        /* ============================================================== */
        <>
          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Kiểm tra hộp thư của bạn</CardTitle>
            <CardDescription className="text-xs leading-relaxed max-w-sm mx-auto">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
              <br />
              <strong className="text-foreground text-sm font-semibold">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs space-y-2 text-muted-foreground">
              <p className="leading-relaxed">
                Nếu không thấy email trong hòm thư chính, hãy kiểm tra mục <strong>Thư rác (Spam)</strong> hoặc thư mục <strong>Quảng cáo</strong>.
              </p>
              <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                <span>Chưa nhận được email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`font-semibold transition-colors inline-flex items-center gap-1 ${
                    resendCooldown > 0
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-primary hover:underline cursor-pointer"
                  }`}
                >
                  <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email"}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={() => window.open(`mailto:${email}`, "_blank")}
                className="w-full h-10 rounded-xl font-bold gap-2 shadow-sm text-sm bg-primary hover:bg-primary/95 text-primary-foreground"
              >
                <span>Mở ứng dụng Email</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full h-9 rounded-xl text-xs font-semibold"
              >
                Nhập địa chỉ email khác
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4 text-xs">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
