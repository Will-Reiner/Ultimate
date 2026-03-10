import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';
import { TrackingMode } from '../../domain/entities/Habit';
import { Frequency, FrequencyType } from '../../domain/value-objects/Frequency';
import { Goal, GoalType } from '../../domain/value-objects/Goal';

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  trackingMode?: TrackingMode;
  dailyTarget?: number | null;
  targetUnit?: string | null;
  frequencyType?: FrequencyType;
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
export class UpdateHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(id: string, userId: string, input: UpdateHabitInput): Promise<HabitResponseDto> {
    const habit = await this.habitRepository.findOne(id, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    // Validate via domain entity mutations (throws domain errors)
    try {
      if (input.name !== undefined) habit.updateName(input.name);
      if (input.description !== undefined) habit.updateDescription(input.description);

      if (input.frequencyType !== undefined) {
        const frequency = Frequency.create({
          type: input.frequencyType,
          timesPerWeek: input.frequencyTimesPerWeek ?? undefined,
          days: input.frequencyDays,
          everyNDays: input.frequencyEveryNDays ?? undefined,
        });
        habit.updateFrequency(frequency);
      }

      if (input.trackingMode !== undefined) {
        if (input.trackingMode === 'quantitative' && input.dailyTarget && input.targetUnit) {
          habit.updateDailyTarget(input.dailyTarget, input.targetUnit);
        }
      } else if (input.dailyTarget !== undefined && input.targetUnit !== undefined) {
        habit.updateDailyTarget(input.dailyTarget!, input.targetUnit!);
      }

      if (input.categoryId !== undefined) habit.setCategory(input.categoryId);
      if (input.reminders !== undefined) habit.setReminders(input.reminders);

      if (input.goalType !== undefined) {
        if (input.goalType === null) {
          habit.setGoal(null);
        } else if (input.goalTargetValue != null && input.goalTargetUnit) {
          const goal = Goal.create({
            type: input.goalType,
            targetValue: input.goalTargetValue,
            targetUnit: input.goalTargetUnit,
            deadline: input.goalDeadline ? new Date(input.goalDeadline) : undefined,
          });
          habit.setGoal(goal);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.constructor.name.endsWith('Error') && !(err instanceof NotFoundException)) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    const updated = await this.habitRepository.update(id, {
      name: input.name,
      description: input.description,
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
      goalDeadline: input.goalDeadline ? new Date(input.goalDeadline) : input.goalDeadline as null | undefined,
      categoryId: input.categoryId,
      trackRelapseIntensity: input.trackRelapseIntensity,
      trackRelapseTrigger: input.trackRelapseTrigger,
      tagIds: input.tagIds,
      reminders: input.reminders,
    });
    return toHabitResponseDto(updated);
  }
}
