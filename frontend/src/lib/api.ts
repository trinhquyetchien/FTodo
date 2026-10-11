const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ftodo_token");
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ftodo_refresh_token");
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ftodo_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("ftodo_refresh_token", refreshToken);
  }
}

export function removeStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ftodo_token");
  localStorage.removeItem("ftodo_refresh_token");
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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
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

  // Handle 401 Unauthorized with Automatic Refresh Token Rotation
  if (res.status === 401 && endpoint !== "/auth/login" && endpoint !== "/auth/refresh") {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setStoredTokens(data.accessToken, data.refreshToken);
            onTokenRefreshed(data.accessToken);
            isRefreshing = false;

            // Retry original request with new access token
            headers.set("Authorization", `Bearer ${data.accessToken}`);
            const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
            if (retryRes.ok) return retryRes.json();
          } else {
            removeStoredTokens();
            isRefreshing = false;
          }
        } catch {
          removeStoredTokens();
          isRefreshing = false;
        }
      } else {
        // Wait for active token refresh to finish
        return new Promise<T>((resolve, reject) => {
          refreshSubscribers.push(async (newToken: string) => {
            try {
              headers.set("Authorization", `Bearer ${newToken}`);
              const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
              });
              if (!retryRes.ok) throw new Error(`Lỗi yêu cầu: ${retryRes.status}`);
              resolve(retryRes.json());
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || `Lỗi yêu cầu: ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiFetch<{ message: string; user: any; accessToken: string; refreshToken: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      ),
    register: (data: { name: string; email: string; password: string }) =>
      apiFetch<{ message: string; user: any; accessToken: string; refreshToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    refresh: (refreshToken: string) =>
      apiFetch<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }),
    logout: () =>
      apiFetch<{ message: string }>("/auth/logout", {
        method: "POST",
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
