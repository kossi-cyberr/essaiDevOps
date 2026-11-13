import type { AuthResponse, Task, TaskFilter, TaskPayload, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const TOKEN_KEY = "todo_token";
export const USER_KEY = "todo_user";

/** Événement émis lorsque l'API rejette le token (expiré / invalide). */
export const UNAUTHORIZED_EVENT = "todo:unauthorized";

/** Erreur API normalisée, avec les éventuelles erreurs de validation par champ. */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function persistSession(token: string, user: User): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Route publique : ne pas joindre le token. */
  publicRoute?: boolean;
}

async function request<T>(path: string, { method = "GET", body, publicRoute = false }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getStoredToken();
  if (token && !publicRoute) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez que l'API est démarrée.", 0);
  }

  if (response.status === 401 && !publicRoute) {
    clearSession();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      "Une erreur est survenue. Veuillez réessayer.";
    throw new ApiError(message, response.status, data?.fieldErrors);
  }

  return data as T;
}

export const authApi = {
  register: (payload: { username: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: payload, publicRoute: true }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: payload, publicRoute: true }),
};

export const tasksApi = {
  list: (filter: TaskFilter = "all") => request<Task[]>(`/tasks?filter=${filter}`),

  create: (payload: TaskPayload) => request<Task>("/tasks", { method: "POST", body: payload }),

  update: (id: number, payload: TaskPayload) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: payload }),

  toggle: (id: number) => request<Task>(`/tasks/${id}/toggle`, { method: "PATCH" }),

  remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
