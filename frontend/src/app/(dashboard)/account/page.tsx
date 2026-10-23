"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function AccountPage() {
  const { user, updateUser } = useAuth();

  // Profile Form state
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage({ type: "error", text: "Họ và tên không được để trống" });
      return;
    }

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await api.users.updateProfile({
        name: name.trim(),
        avatar: avatar.trim() || undefined,
      });

      updateUser({
        name: res.name,
        avatar: res.avatar || res.name.slice(0, 2).toUpperCase(),
      });

      setProfileMessage({ type: "success", text: "Đã cập nhật thông tin hồ sơ thành công!" });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Không thể cập nhật hồ sơ" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Xác nhận mật khẩu mới không khớp" });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      await api.users.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Không thể đổi mật khẩu" });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin hồ sơ */}
        <Card>
          <form onSubmit={handleSaveProfile}>
            <CardHeader className="pb-3">
              <CardTitle>Thông tin hồ sơ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMessage && (
                <div
                  className={`flex items-center gap-2 p-3 text-sm rounded-lg border ${
                    profileMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  <AvatarImage src={avatar.startsWith("http") ? avatar : undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {avatar && !avatar.startsWith("http")
                      ? avatar
                      : user?.name
                      ? user.name.slice(0, 2).toUpperCase()
                      : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user?.name || "Người dùng"}</p>
                  <p className="text-xs text-muted-foreground">{user?.jobTitle || "Thành viên"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên của bạn"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Ảnh đại diện</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Ví dụ: TC hoặc https://example.com/avatar.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email tài khoản</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={profileSaving} className="gap-2">
                {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Đổi mật khẩu */}
        <Card>
          <form onSubmit={handleChangePassword}>
            <CardHeader className="pb-3">
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 p-3 text-sm rounded-lg border ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="secondary" disabled={passwordSaving} className="gap-2">
                {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Cập nhật mật khẩu
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
