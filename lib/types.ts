export interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
  avatar: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  assigneeId: number | null;
  columnId: number;
  order: number;
  assignee?: User;
}

export interface Column {
  id: number;
  name: string;
  order: number;
  tasks?: Task[];
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: User
} 