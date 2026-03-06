import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';
import { HabitEntry } from '@domain/habit/entities/HabitEntry';
import { HabitErrors } from '@domain/habit/errors/HabitErrors';
import { HabitEntryDTO } from '../dtos/HabitDTO';
import { ID } from '@shared/types';

export class CompleteHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: ID, note?: string): Promise<HabitEntryDTO> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) throw HabitErrors.notFound();

    const existingEntry = await this.habitRepository.findEntryForToday(habitId);
    if (existingEntry) throw HabitErrors.alreadyCompleted();

    const entry = HabitEntry.create({
      id: crypto.randomUUID(),
      habitId,
      completedAt: new Date(),
      note,
    });

    await this.habitRepository.saveEntry(entry);

    return {
      id: entry.id,
      habitId: entry.habitId,
      completedAt: entry.completedAt.toISOString(),
      note: entry.note,
    };
  }
}
