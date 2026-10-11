"use client";

import React from "react";
import { useProject } from "@/app/(dashboard)/projects/[id]/project-context";
import { Badge } from "@/components/ui/badge";
import { Crown, UserCheck } from "lucide-react";

export function ProjectSubheader() {
  const { project, isOwner } = useProject();

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {project?.name || "Dự án"}
        </h1>
        {isOwner ? (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
            <Crown className="h-3 w-3 mr-1" /> Bạn là Chủ dự án
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <UserCheck className="h-3 w-3 mr-1" /> Bạn là Thành viên
          </Badge>
        )}
      </div>
      {project?.description && (
        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
      )}
    </div>
  );
}
