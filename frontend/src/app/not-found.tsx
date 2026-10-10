import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-extrabold tracking-tight text-slate-300">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Không tìm thấy trang
          </h2>
          <p className="text-muted-foreground text-lg">
            Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang yêu cầu.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
