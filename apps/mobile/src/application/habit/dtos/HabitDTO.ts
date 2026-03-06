import { FrequencyProps } from '@domain/habit/value-objects/Frequency';

export interface HabitDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  frequency: FrequencyProps;
  color?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitInput {
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  frequency: FrequencyProps;
  color?: string;
}

export interface HabitEntryDTO {
  id: string;
  habitId: string;
  completedAt: string;
  note?: string;
}
