export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type TaskFilter = "all" | "active" | "completed";

export interface TaskPayload {
  title: string;
  description?: string | null;
  completed?: boolean;
}
