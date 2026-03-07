import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { HabitErrors } from '@domain/habit/errors/HabitErrors';
import { calculateStreak } from '@domain/habit/services/StreakCalculator';
import { HabitDetailDTO } from '../dtos/HabitDTO';
import { toDTO } from './HabitUseCases';
import { ID } from '@shared/types';

export class GetHabitDetailUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: ID): Promise<HabitDetailDTO> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) throw HabitErrors.notFound();

    const now = new Date();
    const monthEntries = await this.habitRepository.findEntriesByHabitIdForMonth(
      habitId,
      now.getFullYear(),
      now.getMonth(),
    );

    const streak = calculateStreak(monthEntries, habit.frequency);

    const todayEntry = await this.habitRepository.findEntryForToday(habitId);

    return {
      habit: toDTO(habit),
      streak,
      monthEntries: monthEntries.map((e) => ({
        id: e.id,
        habitId: e.habitId,
        completedAt: e.completedAt.toISOString(),
        value: e.value,
        note: e.note,
      })),
      completedToday: todayEntry !== null,
    };
  }
}
