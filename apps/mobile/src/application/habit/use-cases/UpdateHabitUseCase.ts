import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { HabitErrors } from '@domain/habit/errors/HabitErrors';
import { UpdateHabitInput, HabitDTO } from '../dtos/HabitDTO';
import { toDTO } from './HabitUseCases';
import { ID } from '@shared/types';

export class UpdateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: ID, input: UpdateHabitInput): Promise<HabitDTO> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit) throw HabitErrors.notFound();

    const updated = habit.updateWith({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.emoji !== undefined && { emoji: input.emoji }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.frequency !== undefined && { frequency: input.frequency }),
      ...(input.goalValue !== undefined && { goalValue: input.goalValue }),
      ...(input.goalUnit !== undefined && { goalUnit: input.goalUnit }),
      ...(input.reminderTime !== undefined && { reminderTime: input.reminderTime }),
      ...(input.color !== undefined && { color: input.color }),
    });

    await this.habitRepository.update(updated);
    return toDTO(updated);
  }
}
