"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Trash2, Save, ShieldAlert, ArrowLeft, Loader2, Check } from "lucide-react";

export default function ProjectSettingsPage() {
  const router = useRouter();
  const { project, isOwner, updateProject, deleteProject } = useProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
    }
  }, [project]);

  // Permission Guard: Only Owner can access settings
  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20">
          <CardHeader className="space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-rose-700 dark:text-rose-400">
              Quyền truy cập bị từ chối
            </CardTitle>
            <CardDescription className="text-sm text-rose-600/80 dark:text-rose-400/80">
              Chỉ <strong>Chủ sở hữu dự án (Owner)</strong> mới có quyền cấu hình, đổi tên hoặc xóa dự án này. Bạn hiện đang tham gia với tư cách <strong>Thành viên (Member)</strong>.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${project?.id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại trang Tổng quan dự án
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProject({ name: name.trim(), description: description.trim() });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật dự án:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== project?.name) return;

    setDeleting(true);
    try {
      await deleteProject();
    } catch (err) {
      console.error("Lỗi xóa dự án:", err);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cài đặt dự án</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Chỉ có bạn (Chủ dự án) có quyền chỉnh sửa thông tin hoặc xóa dự án này.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Thông tin dự án đã được cập nhật thành công vào cơ sở dữ liệu!</span>
        </div>
      )}

      {/* 1. General Project Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Thông tin chung</CardTitle>
          <CardDescription>Cập nhật tên hiển thị và mô tả phạm vi của dự án Scrum</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Tên dự án</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên dự án..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-desc">Mô tả dự án</Label>
              <Input
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả tóm tắt..."
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">ID dự án: {project?.id}</span>
            <Button type="submit" disabled={saving || !name.trim()} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Lưu thay đổi
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 2. Danger Zone (Delete Project) */}
      <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-rose-600 dark:text-rose-400">
            Khu vực nguy hiểm
          </CardTitle>
          <CardDescription>
            Hành động xóa dự án sẽ xóa vĩnh viễn toàn bộ công việc, Sprint, kênh chat, chi phí và quyền thành viên liên quan.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> Xóa dự án này
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600">Xác nhận xóa vĩnh viễn dự án</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Để tiếp tục, vui lòng gõ chính xác tên dự án{" "}
              <strong className="text-foreground">"{project?.name}"</strong> vào ô bên dưới:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Gõ đúng tên dự án để xác nhận"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deleteConfirmText !== project?.name}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xóa...
                </>
              ) : (
                "Xác nhận xóa dự án"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
