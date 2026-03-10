import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { calculateStreak } from '../../domain/services/StreakCalculator';
import { StreakResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class GetStreakUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(habitId: string, userId: string): Promise<StreakResponseDto> {
    const habit = await this.habitRepository.findOne(habitId, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    const entries = await this.habitRepository.getEntries(habitId, '1970-01-01', '2999-12-31');

    const result = calculateStreak({
      entries,
      frequency: habit.frequency,
      habitType: habit.type,
      dailyTarget: habit.dailyTarget,
      habitCreatedAt: habit.createdAt,
      status: habit.status,
      referenceDate: new Date(),
    });

    return {
      current_streak: result.currentStreak,
      longest_streak: result.longestStreak,
      credit_days: result.creditDays,
    };
  }
}
