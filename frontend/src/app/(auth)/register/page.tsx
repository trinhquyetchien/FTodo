import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Register() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Đăng ký</CardTitle>
        <CardDescription>
          Tạo tài khoản mới để bắt đầu quản lý dự án
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" type="text" placeholder="Nguyễn Văn A" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Tạo tài khoản
        </Link>
        <div className="text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
