import { Injectable } from '@nestjs/common';
import { GetHabitsUseCase } from '../application/use-cases/GetHabitsUseCase';
import { GetHabitUseCase } from '../application/use-cases/GetHabitUseCase';
import { CreateHabitUseCase } from '../application/use-cases/CreateHabitUseCase';
import { UpdateHabitUseCase } from '../application/use-cases/UpdateHabitUseCase';
import { DeleteHabitUseCase } from '../application/use-cases/DeleteHabitUseCase';
import { GetEntriesUseCase } from '../application/use-cases/GetEntriesUseCase';
import { CreateEntryUseCase } from '../application/use-cases/CreateEntryUseCase';
import { PauseHabitUseCase } from '../application/use-cases/PauseHabitUseCase';
import { ArchiveHabitUseCase } from '../application/use-cases/ArchiveHabitUseCase';
import { ReactivateHabitUseCase } from '../application/use-cases/ReactivateHabitUseCase';
import { GetStreakUseCase } from '../application/use-cases/GetStreakUseCase';
import { EvaluateGoalUseCase } from '../application/use-cases/EvaluateGoalUseCase';
import { CreateHabitDto } from './dtos/create-habit.dto';
import { UpdateHabitDto } from './dtos/update-habit.dto';
import { CreateEntryDto } from './dtos/create-entry.dto';
import { HabitStatus } from '../domain/entities/Habit';

@Injectable()
export class HabitsService {
  constructor(
    private readonly getHabitsUC: GetHabitsUseCase,
    private readonly getHabitUC: GetHabitUseCase,
    private readonly createHabitUC: CreateHabitUseCase,
    private readonly updateHabitUC: UpdateHabitUseCase,
    private readonly deleteHabitUC: DeleteHabitUseCase,
    private readonly getEntriesUC: GetEntriesUseCase,
    private readonly createEntryUC: CreateEntryUseCase,
    private readonly pauseHabitUC: PauseHabitUseCase,
    private readonly archiveHabitUC: ArchiveHabitUseCase,
    private readonly reactivateHabitUC: ReactivateHabitUseCase,
    private readonly getStreakUC: GetStreakUseCase,
    private readonly evaluateGoalUC: EvaluateGoalUseCase,
  ) {}

  findAll(userId: string, status?: HabitStatus) {
    return this.getHabitsUC.execute(userId, status);
  }

  findOne(id: string, userId: string) {
    return this.getHabitUC.execute(id, userId);
  }

  create(userId: string, dto: CreateHabitDto) {
    return this.createHabitUC.execute({
      userId,
      name: dto.name,
      description: dto.description,
      type: dto.type ?? 'build',
      trackingMode: dto.tracking_mode ?? 'boolean',
      dailyTarget: dto.daily_target,
      targetUnit: dto.target_unit,
      frequencyType: dto.frequency_type,
      frequencyTimesPerWeek: dto.frequency_times_per_week,
      frequencyDays: dto.frequency_days,
      frequencyEveryNDays: dto.frequency_every_n_days,
      goalType: dto.goal_type,
      goalTargetValue: dto.goal_target_value,
      goalTargetUnit: dto.goal_target_unit,
      goalDeadline: dto.goal_deadline,
      categoryId: dto.category_id,
      trackRelapseIntensity: dto.track_relapse_intensity,
      trackRelapseTrigger: dto.track_relapse_trigger,
      tagIds: dto.tag_ids,
      reminders: dto.reminders,
    });
  }

  update(id: string, userId: string, dto: UpdateHabitDto) {
    return this.updateHabitUC.execute(id, userId, {
      name: dto.name,
      description: dto.description,
      trackingMode: dto.tracking_mode,
      dailyTarget: dto.daily_target,
      targetUnit: dto.target_unit,
      frequencyType: dto.frequency_type,
      frequencyTimesPerWeek: dto.frequency_times_per_week,
      frequencyDays: dto.frequency_days,
      frequencyEveryNDays: dto.frequency_every_n_days,
      goalType: dto.goal_type,
      goalTargetValue: dto.goal_target_value,
      goalTargetUnit: dto.goal_target_unit,
      goalDeadline: dto.goal_deadline,
      categoryId: dto.category_id,
      trackRelapseIntensity: dto.track_relapse_intensity,
      trackRelapseTrigger: dto.track_relapse_trigger,
      tagIds: dto.tag_ids,
      reminders: dto.reminders,
    });
  }

  pause(id: string, userId: string) {
    return this.pauseHabitUC.execute(id, userId);
  }

  archive(id: string, userId: string) {
    return this.archiveHabitUC.execute(id, userId);
  }

  reactivate(id: string, userId: string) {
    return this.reactivateHabitUC.execute(id, userId);
  }

  remove(id: string, userId: string) {
    return this.deleteHabitUC.execute(id, userId);
  }

  getStreak(id: string, userId: string) {
    return this.getStreakUC.execute(id, userId);
  }

  evaluateGoal(id: string, userId: string) {
    return this.evaluateGoalUC.execute(id, userId);
  }

  listEntries(habitId: string, userId: string, from: string, to: string, entryType?: string) {
    return this.getEntriesUC.execute(habitId, userId, from, to, entryType);
  }

  addEntry(habitId: string, userId: string, dto: CreateEntryDto) {
    return this.createEntryUC.execute(habitId, userId, {
      date: dto.date,
      entryType: dto.entry_type,
      value: dto.value,
      note: dto.note,
      intensity: dto.intensity,
      trigger: dto.trigger,
    });
  }
}
