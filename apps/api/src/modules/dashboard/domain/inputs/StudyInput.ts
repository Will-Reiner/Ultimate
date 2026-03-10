export interface StudyItemInput {
  id: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'completed' | 'dropped';
  progressPercentage: number;
  rating: number | null;
  completedAt: Date | null;
}

export interface StudySessionInput {
  id: string;
  studyItemId: string;
  status: 'scheduled' | 'completed' | 'skipped';
  durationMinutes: number;
  scheduledAt: Date;
  completedAt: Date | null;
}
