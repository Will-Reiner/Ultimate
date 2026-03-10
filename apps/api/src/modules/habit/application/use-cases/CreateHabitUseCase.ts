import { Inject, Injectable } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';
import { Habit, HabitType, TrackingMode } from '../../domain/entities/Habit';
import { Frequency, FrequencyType } from '../../domain/value-objects/Frequency';
import { Goal, GoalType } from '../../domain/value-objects/Goal';

export interface CreateHabitInput {
  userId: string;
  name: string;
  description?: string | null;
  type: HabitType;
  trackingMode: TrackingMode;
  dailyTarget?: number | null;
  targetUnit?: string | null;
  frequencyType: FrequencyType;
  frequencyTimesPerWeek?: number | null;
  frequencyDays?: number[];
  frequencyEveryNDays?: number | null;
  goalType?: GoalType | null;
  goalTargetValue?: number | null;
  goalTargetUnit?: string | null;
  goalDeadline?: string | null;
  categoryId?: string | null;
  trackRelapseIntensity?: boolean;
  trackRelapseTrigger?: boolean;
  tagIds?: string[];
  reminders?: string[];
}

@Injectable()
export class CreateHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(input: CreateHabitInput): Promise<HabitResponseDto> {
    const frequency = Frequency.create({
      type: input.frequencyType,
      timesPerWeek: input.frequencyTimesPerWeek ?? undefined,
      days: input.frequencyDays,
      everyNDays: input.frequencyEveryNDays ?? undefined,
    });

    const goal =
      input.goalType && input.goalTargetValue != null && input.goalTargetUnit
        ? Goal.create({
            type: input.goalType,
            targetValue: input.goalTargetValue,
            targetUnit: input.goalTargetUnit,
            deadline: input.goalDeadline ? new Date(input.goalDeadline) : undefined,
          })
        : undefined;

    // Validate via domain entity (throws domain errors)
    Habit.create({
      userId: input.userId,
      name: input.name,
      description: input.description,
      type: input.type,
      trackingMode: input.trackingMode,
      dailyTarget: input.dailyTarget,
      targetUnit: input.targetUnit,
      frequency,
      goal,
      categoryId: input.categoryId,
      tags: input.tagIds,
      reminders: input.reminders,
      trackRelapseIntensity: input.trackRelapseIntensity,
      trackRelapseTrigger: input.trackRelapseTrigger,
    });

    const habit = await this.habitRepository.create({
      userId: input.userId,
      name: input.name,
      description: input.description,
      type: input.type,
      trackingMode: input.trackingMode,
      dailyTarget: input.dailyTarget,
      targetUnit: input.targetUnit,
      frequencyType: input.frequencyType,
      frequencyTimesPerWeek: input.frequencyTimesPerWeek,
      frequencyDays: input.frequencyDays,
      frequencyEveryNDays: input.frequencyEveryNDays,
      goalType: input.goalType,
      goalTargetValue: input.goalTargetValue,
      goalTargetUnit: input.goalTargetUnit,
      goalDeadline: input.goalDeadline ? new Date(input.goalDeadline) : undefined,
      categoryId: input.categoryId,
      trackRelapseIntensity: input.trackRelapseIntensity,
      trackRelapseTrigger: input.trackRelapseTrigger,
      tagIds: input.tagIds,
      reminders: input.reminders,
    });
    return toHabitResponseDto(habit);
  }
}
