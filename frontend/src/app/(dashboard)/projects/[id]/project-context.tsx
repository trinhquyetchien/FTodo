"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { MockProject } from "@/lib/mock-data";

export interface ProjectContextType {
  project: MockProject;
  isOwner: boolean;
  currentUserRole: "owner" | "member";
  effectivePermissions: string[];
  activeTabs: string[];
  hasPermission: (tabKey: string) => boolean;
  toggleTab: (tabKey: string) => void;
  updateProject: (data: { name?: string; description?: string }) => Promise<void>;
  deleteProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = (params?.id as string) || "";

  const [projectState, setProjectState] = useState<MockProject>({
    id: projectId,
    name: "Đang tải dự án...",
    description: "",
    ownerId: "",
    progress: 0,
    tasks: 0,
    completedTasks: 0,
    members: 1,
    createdAt: "",
  });

  const [permVersion, setPermVersion] = useState(0);

  // Sync with live PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    if (!projectId) return;

    const syncProject = async () => {
      try {
        const detail = await api.projects.getOne(projectId);
        if (isMounted && detail) {
          setProjectState({
            id: detail.id,
            name: detail.name,
            description: detail.description || "",
            ownerId: detail.ownerId,
            progress: detail.progress || 0,
            tasks: detail._count?.tasks || detail.tasks?.length || 0,
            completedTasks: detail.completedTasks || 0,
            members: detail.members?.length || 1,
            role: detail.currentUserRole,
            createdAt: detail.createdAt,
            ...detail,
          });
          return;
        }
      } catch (err) {
        // Fallback for slug URLs: search in all user projects
        try {
          const res = await api.projects.getAll();
          if (!isMounted || !res) return;
          const all = [...(res.owned || []), ...(res.memberOf || [])];
          const match = all.find((p: any) => {
            if (p.id === projectId) return true;
            const slug = projectId.toLowerCase().replace(/-/g, "");
            const nameNorm = (p.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            return nameNorm.includes(slug) || slug.includes(nameNorm);
          });

          if (match) {
            const detail = await api.projects.getOne(match.id);
            if (isMounted && detail) {
              setProjectState({
                id: detail.id,
                name: detail.name,
                description: detail.description || "",
                ownerId: detail.ownerId,
                progress: detail.progress || 0,
                tasks: detail._count?.tasks || detail.tasks?.length || 0,
                completedTasks: detail.completedTasks || 0,
                members: detail.members?.length || 1,
                role: detail.currentUserRole,
                createdAt: detail.createdAt,
                ...detail,
              });
            }
          }
        } catch {}
      }
    };

    syncProject();
    return () => {
      isMounted = false;
    };
  }, [projectId, user?.id, permVersion]);

  useEffect(() => {
    const handlePermUpdate = () => {
      setPermVersion((v) => v + 1);
    };
    window.addEventListener("ftodo_permissions_updated", handlePermUpdate);
    window.addEventListener("storage", handlePermUpdate);
    return () => {
      window.removeEventListener("ftodo_permissions_updated", handlePermUpdate);
      window.removeEventListener("storage", handlePermUpdate);
    };
  }, []);

  // Calculate whether current user is Owner or Member based strictly on ownerId and API response
  const isOwner = useMemo(() => {
    if (!user || !projectState) return false;
    return (
      projectState.ownerId === user.id ||
      (projectState as any).currentUserRole === "owner" ||
      projectState.role === "owner"
    );
  }, [user, projectState]);

  const currentUserRole: "owner" | "member" = isOwner ? "owner" : "member";

  // Effective permissions based on PostgreSQL response
  const effectivePermissions = useMemo(() => {
    if (isOwner) {
      return [
        "overview",
        "board",
        "backlog",
        "timeline",
        "issues",
        "reports",
        "releases",
        "components",
        "cost",
        "members",
        "chat",
        "activity",
        "settings",
      ];
    }

    if (!user) {
      return [
        "overview",
        "board",
        "backlog",
        "timeline",
        "issues",
      ];
    }

    // Use live permissions computed by backend if available
    const backendPerms = (projectState as any)?.effectivePermissions;
    if (Array.isArray(backendPerms) && backendPerms.length > 0) {
      return backendPerms.filter((p: string) => p !== "settings");
    }

    // Default member permissions
    return [
      "overview",
      "board",
      "backlog",
      "timeline",
      "issues",
      "reports",
      "releases",
      "components",
      "chat",
      "activity",
    ];
  }, [isOwner, user, projectState]);

  // Active tabs on the toolbar
  const [activeTabs, setActiveTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedTabs = localStorage.getItem(`ftodo_tabs_${projectId}_${user?.id}`);
      if (savedTabs) {
        try {
          const parsed = JSON.parse(savedTabs);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    if (isOwner) {
      return ["overview", "board", "backlog", "timeline", "issues", "reports", "releases", "components", "members", "cost", "activity", "settings"];
    }
    return ["overview", "board", "backlog", "timeline", "activity"];
  });

  // Load saved tabs when user or project or permissions change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTabs = localStorage.getItem(`ftodo_tabs_${projectId}_${user?.id}`);
      if (savedTabs) {
        try {
          const parsed = JSON.parse(savedTabs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = isOwner
              ? parsed
              : parsed.filter((t: string) => effectivePermissions.includes(t) && t !== "settings");
            if (filtered.length > 0) {
              setActiveTabs(filtered);
              return;
            }
          }
        } catch {}
      }
    }
    if (isOwner) {
      setActiveTabs(["overview", "board", "backlog", "timeline", "issues", "reports", "releases", "components", "members", "cost", "settings"]);
    } else {
      const defaults = ["overview", "board", "backlog", "timeline"].filter((t) =>
        effectivePermissions.includes(t)
      );
      setActiveTabs(defaults.length > 0 ? defaults : ["overview", "board"]);
    }
  }, [projectId, user?.id, isOwner, permVersion, effectivePermissions]);

  const hasPermission = (tabKey: string): boolean => {
    if (isOwner) return true;
    if (tabKey === "settings") return false;
    return effectivePermissions.includes(tabKey);
  };

  const toggleTab = (tabKey: string) => {
    setActiveTabs((prev) => {
      const next = prev.includes(tabKey)
        ? prev.filter((t) => t !== tabKey)
        : [...prev, tabKey];
      if (typeof window !== "undefined") {
        localStorage.setItem(`ftodo_tabs_${projectId}_${user?.id}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const updateProject = async (data: { name?: string; description?: string }) => {
    try {
      const targetId = projectState.id || projectId;
      const updated = await api.projects.update(targetId, data);
      setProjectState((prev) => ({
        ...prev,
        ...updated,
      }));
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật dự án");
    }
  };

  const deleteProject = async () => {
    try {
      const targetId = projectState.id || projectId;
      await api.projects.delete(targetId);
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa dự án");
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project: projectState,
        isOwner,
        currentUserRole,
        effectivePermissions,
        activeTabs,
        hasPermission,
        toggleTab,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
