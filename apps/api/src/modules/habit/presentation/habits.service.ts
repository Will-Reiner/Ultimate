import { Injectable } from '@nestjs/common';
import { GetHabitsUseCase } from '../application/use-cases/GetHabitsUseCase';
import { GetHabitUseCase } from '../application/use-cases/GetHabitUseCase';
import { CreateHabitUseCase } from '../application/use-cases/CreateHabitUseCase';
import { UpdateHabitUseCase } from '../application/use-cases/UpdateHabitUseCase';
import { DeleteHabitUseCase } from '../application/use-cases/DeleteHabitUseCase';
import { GetEntriesUseCase } from '../application/use-cases/GetEntriesUseCase';
import { CreateEntryUseCase } from '../application/use-cases/CreateEntryUseCase';
import { CreateHabitDto } from './dtos/create-habit.dto';
import { UpdateHabitDto } from './dtos/update-habit.dto';
import { CreateEntryDto } from './dtos/create-entry.dto';

@Injectable()
export class HabitsService {
  constructor(
    private readonly getHabits: GetHabitsUseCase,
    private readonly getHabit: GetHabitUseCase,
    private readonly createHabit: CreateHabitUseCase,
    private readonly updateHabit: UpdateHabitUseCase,
    private readonly deleteHabit: DeleteHabitUseCase,
    private readonly getEntries: GetEntriesUseCase,
    private readonly createEntry: CreateEntryUseCase,
  ) {}

  findAll(userId: string) {
    return this.getHabits.execute(userId);
  }

  findOne(id: string, userId: string) {
    return this.getHabit.execute(id, userId);
  }

  create(userId: string, dto: CreateHabitDto) {
    return this.createHabit.execute({
      userId,
      title: dto.title,
      description: dto.description,
      emoji: dto.emoji,
      type: dto.type,
      frequencyType: dto.frequency_type,
      daysOfWeek: dto.days_of_week,
      goalValue: dto.goal_value,
      goalUnit: dto.goal_unit,
      reminderTime: dto.reminder_time,
      color: dto.color,
    });
  }

  update(id: string, userId: string, dto: UpdateHabitDto) {
    return this.updateHabit.execute(id, userId, {
      title: dto.title,
      description: dto.description,
      emoji: dto.emoji,
      type: dto.type,
      frequencyType: dto.frequency_type,
      daysOfWeek: dto.days_of_week,
      goalValue: dto.goal_value,
      goalUnit: dto.goal_unit,
      reminderTime: dto.reminder_time,
      color: dto.color,
      isArchived: dto.is_archived,
    });
  }

  remove(id: string, userId: string) {
    return this.deleteHabit.execute(id, userId);
  }

  listEntries(habitId: string, userId: string, from: Date, to: Date) {
    return this.getEntries.execute(habitId, userId, from, to);
  }

  addEntry(habitId: string, userId: string, dto: CreateEntryDto) {
    return this.createEntry.execute(habitId, userId, {
      completedAt: dto.completed_at,
      value: dto.value,
      note: dto.note,
    });
  }
}
