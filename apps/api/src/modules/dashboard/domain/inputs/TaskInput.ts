export interface TaskInput {
  id: string;
  title: string;
  statusType: 'todo' | 'in_progress' | 'done';
  priorityLevel: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date | null;
  assigneeId: string | null;
  projectId: string | null;
  completedAt: Date | null;
}

export interface ProjectInput {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'completed';
  deadline: Date | null;
  totalTasks: number;
  doneTasks: number;
}
