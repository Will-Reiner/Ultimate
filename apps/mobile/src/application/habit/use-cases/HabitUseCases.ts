import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';
import { CreateHabitInput, HabitDTO } from '../dtos/HabitDTO';
import { ID } from '@shared/types';

function toDTO(habit: Habit): HabitDTO {
  return {
    id: habit.id,
    userId: habit.userId,
    title: habit.title,
    description: habit.description,
    emoji: habit.emoji,
    frequency: habit.frequency.toJSON(),
    color: habit.color,
    isArchived: habit.isArchived,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}

export class CreateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(input: CreateHabitInput): Promise<HabitDTO> {
    const now = new Date();
    const habit = Habit.create({
      id: 'pending', // replaced by server-generated ID after save
      userId: input.userId,
      title: input.title,
      description: input.description,
      emoji: input.emoji,
      frequency: input.frequency,
      color: input.color,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const savedHabit = await this.habitRepository.save(habit);
    return toDTO(savedHabit);
  }
}

export class ListHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(userId: ID): Promise<HabitDTO[]> {
    const habits = await this.habitRepository.findAllByUserId(userId);
    return habits.map(toDTO);
  }
}
