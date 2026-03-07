import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { HabitErrors } from '@domain/habit/errors/HabitErrors';
import { HabitDTO } from '../dtos/HabitDTO';
import { toDTO } from './HabitUseCases';
import { ID } from '@shared/types';

export class ArchiveHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: ID): Promise<HabitDTO> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) throw HabitErrors.notFound();

    const archived = habit.archive();
    await this.habitRepository.update(archived);
    return toDTO(archived);
  }
}
