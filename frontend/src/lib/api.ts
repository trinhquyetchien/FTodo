const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ftodo_token");
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ftodo_token", token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ftodo_token");
  localStorage.removeItem("ftodo_user");
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("ftodo_user");
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ftodo_user", JSON.stringify(user));
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Lỗi yêu cầu: ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiFetch<{ message: string; user: any; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string }) =>
      apiFetch<{ message: string; user: any; accessToken: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMe: () => apiFetch<any>("/auth/me"),
  },

  projects: {
    getAll: () =>
      apiFetch<{ owned: any[]; memberOf: any[] }>("/projects"),
    getOne: (id: string) =>
      apiFetch<any>(`/projects/${id}`),
    create: (data: { name: string; description?: string }) =>
      apiFetch<any>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; description?: string }) =>
      apiFetch<any>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<{ message: string }>(`/projects/${id}`, {
        method: "DELETE",
      }),
  },

  members: {
    getMembers: (projectId: string) =>
      apiFetch<any[]>(`/projects/${projectId}/members`),
    addMember: (projectId: string, data: { email: string; roleGroupId: string }) =>
      apiFetch<any>(`/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateMember: (projectId: string, memberId: string, data: { roleGroupId: string; extraPermissions: string[] }) =>
      apiFetch<any>(`/projects/${projectId}/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    removeMember: (projectId: string, memberId: string) =>
      apiFetch<{ message: string }>(`/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      }),
    getRoles: (projectId: string) =>
      apiFetch<any[]>(`/projects/${projectId}/roles`),
    createRole: (projectId: string, data: { name: string; permissions: string[] }) =>
      apiFetch<any>(`/projects/${projectId}/roles`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateRolePermissions: (projectId: string, roleId: string, permissions: string[]) =>
      apiFetch<any>(`/projects/${projectId}/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      }),
    deleteRole: (projectId: string, roleId: string) =>
      apiFetch<{ message: string }>(`/projects/${projectId}/roles/${roleId}`, {
        method: "DELETE",
      }),
  },

  tasks: {
    getTasks: (projectId: string, sprintId?: string) =>
      apiFetch<any[]>(`/projects/${projectId}/tasks${sprintId ? `?sprintId=${sprintId}` : ""}`),
    createTask: (projectId: string, data: any) =>
      apiFetch<any>(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTaskStatus: (projectId: string, taskId: string, status: string) =>
      apiFetch<any>(`/projects/${projectId}/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    deleteTask: (projectId: string, taskId: string) =>
      apiFetch<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      }),
  },

  sprints: {
    getSprints: (projectId: string) =>
      apiFetch<any[]>(`/projects/${projectId}/sprints`),
    createSprint: (projectId: string, data: any) =>
      apiFetch<any>(`/projects/${projectId}/sprints`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  costs: {
    getCosts: (projectId: string) =>
      apiFetch<{ costs: any[]; summary: any }>(`/projects/${projectId}/costs`),
    createCost: (projectId: string, data: any) =>
      apiFetch<any>(`/projects/${projectId}/costs`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  chat: {
    getChannels: (projectId: string) =>
      apiFetch<any[]>(`/projects/${projectId}/channels`),
    createChannel: (projectId: string, data: { name: string; description?: string }) =>
      apiFetch<any>(`/projects/${projectId}/channels`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMessages: (channelId: string) =>
      apiFetch<any[]>(`/channels/${channelId}/messages`),
    sendMessage: (channelId: string, data: { content: string; attachment?: string }) =>
      apiFetch<any>(`/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
