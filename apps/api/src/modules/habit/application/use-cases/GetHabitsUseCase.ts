import { Inject, Injectable } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';
import { HabitStatus } from '../../domain/entities/Habit';

@Injectable()
export class GetHabitsUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(userId: string, status?: HabitStatus): Promise<HabitResponseDto[]> {
    const habits = await this.habitRepository.findAll(userId, status);
    return habits.map(toHabitResponseDto);
  }
}
