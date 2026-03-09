import { Inject, Injectable } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

export interface CreateHabitInput {
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  type?: string;
  frequencyType: string;
  daysOfWeek?: number[];
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
}

@Injectable()
export class CreateHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(input: CreateHabitInput): Promise<HabitResponseDto> {
    const habit = await this.habitRepository.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      emoji: input.emoji,
      type: input.type ?? 'build',
      frequencyType: input.frequencyType,
      daysOfWeek: input.daysOfWeek ?? [],
      goalValue: input.goalValue,
      goalUnit: input.goalUnit,
      reminderTime: input.reminderTime,
      color: input.color,
    });
    return toHabitResponseDto(habit);
  }
}
