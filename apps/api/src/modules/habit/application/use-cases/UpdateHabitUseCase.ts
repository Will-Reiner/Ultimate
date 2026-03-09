import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  emoji?: string;
  type?: string;
  frequencyType?: string;
  daysOfWeek?: number[];
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
  isArchived?: boolean;
}

@Injectable()
export class UpdateHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(id: string, userId: string, input: UpdateHabitInput): Promise<HabitResponseDto> {
    const exists = await this.habitRepository.findOne(id, userId);
    if (!exists) throw new NotFoundException('Hábito não encontrado.');

    const habit = await this.habitRepository.update(id, input);
    return toHabitResponseDto(habit);
  }
}
