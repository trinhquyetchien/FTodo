"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Layers,
  Code2,
  Database,
  Radio,
  Server,
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ArchitectureComponent {
  id: string;
  name: string;
  description: string;
  lead: string;
  issuesCount: number;
  completedCount: number;
  iconType: "frontend" | "backend" | "database" | "realtime" | "devops";
}

const INITIAL_COMPONENTS: ArchitectureComponent[] = [
  {
    id: "cmp-1",
    name: "Frontend Web UI (Next.js 16 & Tailwind)",
    description: "Toàn bộ giao diện người dùng, shadcn/ui components và luồng thao tác kéo thả Scrum.",
    lead: "Trịnh Quyết Chiến",
    issuesCount: 8,
    completedCount: 6,
    iconType: "frontend",
  },
  {
    id: "cmp-2",
    name: "Backend Core & Auth API (NestJS)",
    description: "Kiến trúc máy chủ NestJS, xác thực JWT, guards phân quyền và nghiệp vụ Sprint/Task.",
    lead: "Nguyễn Văn An",
    issuesCount: 7,
    completedCount: 5,
    iconType: "backend",
  },
  {
    id: "cmp-3",
    name: "Database & ORM (PostgreSQL & Prisma)",
    description: "Mô hình quan hệ dữ liệu, migrations, quan hệ dự án, thành viên và chi phí.",
    lead: "Trần Thị Bình",
    issuesCount: 4,
    completedCount: 4,
    iconType: "database",
  },
  {
    id: "cmp-4",
    name: "Realtime Chat & Events (Socket.io)",
    description: "Kênh trao đổi nội bộ thời gian thực theo từng dự án, broadcast sự kiện cập nhật task.",
    lead: "Nguyễn Văn An",
    issuesCount: 5,
    completedCount: 2,
    iconType: "realtime",
  },
  {
    id: "cmp-5",
    name: "DevOps & Cloud (Docker Compose & AWS)",
    description: "Containerization hệ thống, thiết lập PostgreSQL container và CI/CD tự động.",
    lead: "Trịnh Quyết Chiến",
    issuesCount: 3,
    completedCount: 2,
    iconType: "devops",
  },
];

export default function ComponentsPage() {
  const { project, isOwner } = useProject();
  const [components, setComponents] = useState<ArchitectureComponent[]>(INITIAL_COMPONENTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [lead, setLead] = useState("Nguyễn Văn An");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCmp: ArchitectureComponent = {
      id: "cmp-" + Date.now(),
      name: name.trim(),
      description: desc.trim() || "Hợp phần kiến trúc mới",
      lead: lead.trim(),
      issuesCount: 0,
      completedCount: 0,
      iconType: "backend",
    };

    setComponents([...components, newCmp]);
    setName("");
    setDesc("");
    setIsCreateOpen(false);
  };

  const renderIcon = (type: ArchitectureComponent["iconType"]) => {
    switch (type) {
      case "frontend":
        return <Code2 className="h-4 w-4 text-blue-500" />;
      case "backend":
        return <Server className="h-4 w-4 text-emerald-500" />;
      case "database":
        return <Database className="h-4 w-4 text-amber-500" />;
      case "realtime":
        return <Radio className="h-4 w-4 text-violet-500" />;
      case "devops":
        return <Boxes className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Hợp phần phần mềm (Components)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Phân rã kiến trúc dự án thành các module kỹ thuật để phân công phụ trách và phân loại tác vụ.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" /> Thêm hợp phần mới
        </Button>
      </div>

      {/* Components Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead>Tên hợp phần</TableHead>
                <TableHead>Mô tả kỹ thuật</TableHead>
                <TableHead className="w-48">Phụ trách chính (Lead)</TableHead>
                <TableHead className="w-32 text-center">Tác vụ</TableHead>
                <TableHead className="w-28 text-center">Tiến độ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="text-center">{renderIcon(c.iconType)}</TableCell>
                  <TableCell className="font-semibold text-xs text-foreground">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                    {c.description}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{c.lead}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {c.completedCount} / {c.issuesCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.completedCount === c.issuesCount && c.issuesCount > 0 ? "default" : "secondary"} className="text-[10px]">
                      {c.issuesCount > 0 ? Math.round((c.completedCount / c.issuesCount) * 100) : 0}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Component Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm hợp phần kiến trúc mới</DialogTitle>
            <DialogDescription>
              Tạo component đại diện cho một thư viện, vi dịch vụ hoặc tầng kiến trúc trong dự án.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Tên hợp phần</Label>
              <Input
                id="c-name"
                placeholder="VD: Payment Gateway Integration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-desc">Mô tả mục tiêu</Label>
              <Input
                id="c-desc"
                placeholder="Mô tả phạm vi kỹ thuật của module này..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-lead">Người phụ trách chính (Lead)</Label>
              <Input
                id="c-lead"
                placeholder="VD: Nguyễn Văn An"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Khởi tạo hợp phần</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
