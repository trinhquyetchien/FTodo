"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { INITIAL_MOCK_PROJECTS, MockProject, DEFAULT_INITIAL_ROLES, DEFAULT_INITIAL_MEMBERS } from "@/lib/mock-data";

export interface ProjectContextType {
  project: MockProject;
  isOwner: boolean;
  currentUserRole: "owner" | "member";
  effectivePermissions: string[];
  activeTabs: string[];
  hasPermission: (tabKey: string) => boolean;
  toggleTab: (tabKey: string) => void;
  updateProject: (data: { name?: string; description?: string }) => void;
  deleteProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = (params?.id as string) || "ftodo-core";

  const [projectState, setProjectState] = useState<MockProject>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_mock_projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const list = Array.isArray(parsed)
            ? parsed
            : [...(parsed.owned || []), ...(parsed.memberOf || [])];
          const found = list.find((p: any) => p.id === projectId);
          if (found) return found;
        } catch {
          // ignore
        }
      }
    }
    const defaultList = [...INITIAL_MOCK_PROJECTS.owned, ...INITIAL_MOCK_PROJECTS.memberOf];
    return (
      defaultList.find((p) => p.id === projectId) || defaultList[0]
    );
  });

  // Calculate whether current user is Owner or Member:
  // Strictly based on project.ownerId matching user.id.
  const isOwner = useMemo(() => {
    if (!user) return false;
    const projectOwnerId = projectState.ownerId || (projectId === "crm-enterprise" ? "u-an" : "u-chien");
    return user.id === projectOwnerId;
  }, [user, projectState, projectId]);

  const currentUserRole: "owner" | "member" = isOwner ? "owner" : "member";

  const [permVersion, setPermVersion] = useState(0);

  // Sync with live PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    const syncProject = async () => {
      try {
        const res = await api.projects.getAll();
        if (!isMounted || !res) return;
        const all = [...(res.owned || []), ...(res.memberOf || [])];
        const match = all.find((p: any) => {
          if (p.id === projectId) return true;
          const slug = projectId.toLowerCase().replace(/-/g, "");
          const nameNormalized = (p.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return nameNormalized.includes(slug) || slug.includes(nameNormalized);
        });

        if (match) {
          try {
            const detail = await api.projects.getOne(match.id);
            if (isMounted && detail) {
              setProjectState((prev) => ({
                ...prev,
                ...detail,
                id: detail.id,
                name: detail.name,
                description: detail.description,
                ownerId: detail.ownerId,
              }));
              return;
            }
          } catch {}
          if (isMounted) {
            setProjectState((prev) => ({
              ...prev,
              ...match,
              id: match.id,
              name: match.name,
              description: match.description,
            }));
          }
        }
      } catch (err) {
        // Fallback to local storage
      }
    };

    syncProject();
    return () => {
      isMounted = false;
    };
  }, [projectId, user?.id]);

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

  // Effective permissions based on user:
  // - Owner: all tabs
  // - Member: based on project members configuration or role
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

    let membersList = DEFAULT_INITIAL_MEMBERS;
    if (typeof window !== "undefined") {
      const savedMembers = localStorage.getItem(`ftodo_members_${projectId}`);
      if (savedMembers) {
        try {
          membersList = JSON.parse(savedMembers);
        } catch {}
      }
    }

    let rolesList = DEFAULT_INITIAL_ROLES;
    if (typeof window !== "undefined") {
      const savedRoles = localStorage.getItem(`ftodo_roles_${projectId}`);
      if (savedRoles) {
        try {
          rolesList = JSON.parse(savedRoles);
        } catch {}
      }
    }

    const member = membersList.find(
      (m: any) => m.email?.toLowerCase() === user.email?.toLowerCase() || m.id === user.id
    );

    if (member) {
      const foundRole = rolesList.find((r: any) => r.id === member.roleId);
      const rolePerms = foundRole?.permissions || [
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
      const combined = Array.from(new Set([...rolePerms, ...(member.extraPermissions || [])]));
      return combined.filter((p) => p !== "settings");
    }

    if (user.email === "an@example.com" || user.name?.includes("An")) {
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
        "chat",
        "activity",
      ];
    }
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
  }, [isOwner, user, projectId, permVersion]);

  // Active tabs on the toolbar: stored in localStorage per project & user
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
    if (tabKey === "settings") return false; // Members cannot access settings
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

  const updateProject = (data: { name?: string; description?: string }) => {
    const updated = {
      ...projectState,
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    };
    setProjectState(updated);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_mock_projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          let updatedStorage;
          if (Array.isArray(parsed)) {
            updatedStorage = parsed.map((p: any) => (p.id === projectId ? updated : p));
          } else {
            updatedStorage = {
              owned: (parsed.owned || []).map((p: any) => (p.id === projectId ? updated : p)),
              memberOf: (parsed.memberOf || []).map((p: any) => (p.id === projectId ? updated : p)),
            };
          }
          localStorage.setItem("ftodo_mock_projects", JSON.stringify(updatedStorage));
        } catch {
          // ignore
        }
      }
    }
  };

  const deleteProject = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ftodo_mock_projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          let updatedStorage;
          if (Array.isArray(parsed)) {
            updatedStorage = parsed.filter((p: any) => p.id !== projectId);
          } else {
            updatedStorage = {
              owned: (parsed.owned || []).filter((p: any) => p.id !== projectId),
              memberOf: (parsed.memberOf || []).filter((p: any) => p.id !== projectId),
            };
          }
          localStorage.setItem("ftodo_mock_projects", JSON.stringify(updatedStorage));
        } catch {
          // ignore
        }
      }
    }
    router.push("/");
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
