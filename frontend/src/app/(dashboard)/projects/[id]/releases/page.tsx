"use client";

import React, { useState } from "react";
import {
  Rocket,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  ExternalLink,
  ChevronRight,
  PackageCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProject } from "../project-context";

interface ReleaseVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  status: "released" | "in_progress" | "unreleased";
  releaseDate: string;
  progress: number;
  completedIssues: number;
  totalIssues: number;
}

const INITIAL_VERSIONS: ReleaseVersion[] = [
  {
    id: "v-1",
    version: "v1.0.0",
    name: "Initial Beta Launch",
    description: "Phiên bản MVP đầu tiên tích hợp đăng nhập JWT, quản lý dự án cơ bản và cấu hình database.",
    status: "released",
    releaseDate: "10/10/2026",
    progress: 100,
    completedIssues: 10,
    totalIssues: 10,
  },
  {
    id: "v-2",
    version: "v1.1.0",
    name: "Scrum Agile & Realtime Chat",
    description: "Bổ sung Bảng Scrum kéo thả, phân quyền nhóm linh hoạt cho thành viên và kênh chat realtime.",
    status: "in_progress",
    releaseDate: "25/10/2026",
    progress: 65,
    completedIssues: 13,
    totalIssues: 20,
  },
  {
    id: "v-3",
    version: "v2.0.0",
    name: "Enterprise Multi-Workspace",
    description: "Mở rộng hỗ trợ đa chi nhánh, tích hợp cổng thanh toán trực tuyến và báo cáo BI nâng cao.",
    status: "unreleased",
    releaseDate: "15/12/2026",
    progress: 0,
    completedIssues: 0,
    totalIssues: 15,
  },
];

export default function ReleasesPage() {
  const { project, isOwner } = useProject();
  const [versions, setVersions] = useState<ReleaseVersion[]>(INITIAL_VERSIONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion.trim()) return;

    const newVer: ReleaseVersion = {
      id: "v-" + Date.now(),
      version: newVersion.trim(),
      name: newName.trim() || newVersion.trim(),
      description: newDesc.trim() || "Phiên bản phát hành mới",
      status: "unreleased",
      releaseDate: "Chưa ấn định",
      progress: 0,
      completedIssues: 0,
      totalIssues: 0,
    };

    setVersions([...versions, newVer]);
    setNewVersion("");
    setNewName("");
    setNewDesc("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" /> Phiên bản phát hành (Releases)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Quản lý vòng đời phát hành phần mềm, changelog và trạng thái triển khai các version.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" /> Tạo phiên bản mới
        </Button>
      </div>

      {/* Version List */}
      <div className="space-y-4">
        {versions.map((ver) => (
          <Card key={ver.id} className="hover:shadow-xs transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                    {ver.version}
                  </span>
                  <CardTitle className="text-base font-semibold">{ver.name}</CardTitle>
                </div>

                <div>
                  {ver.status === "released" && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Đã phát hành ({ver.releaseDate})
                    </Badge>
                  )}
                  {ver.status === "in_progress" && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Clock className="h-3 w-3 mr-1" /> Đang phát triển (Dự kiến: {ver.releaseDate})
                    </Badge>
                  )}
                  {ver.status === "unreleased" && (
                    <Badge variant="outline" className="text-xs">
                      Chưa phát hành
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs mt-1">{ver.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiến độ hoàn thiện tác vụ</span>
                  <span className="font-semibold text-foreground">
                    {ver.completedIssues} / {ver.totalIssues} Issues ({ver.progress}%)
                  </span>
                </div>
                <Progress value={ver.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Version Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phiên bản phát hành mới</DialogTitle>
            <DialogDescription>
              Tạo phiên bản để gán các User Stories và Bugs theo kế hoạch triển khai.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ver-num">Mã phiên bản</Label>
              <Input
                id="ver-num"
                placeholder="VD: v1.2.0"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ver-name">Tên bản phát hành</Label>
              <Input
                id="ver-name"
                placeholder="VD: Sprint 3 Performance & Security Patch"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ver-desc">Mô tả phát hành</Label>
              <Input
                id="ver-desc"
                placeholder="Mô tả các tính năng cốt lõi sẽ có trong bản này..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Tạo phiên bản</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
