import { Inject, Injectable } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class GetHabitsUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(userId: string): Promise<HabitResponseDto[]> {
    const habits = await this.habitRepository.findAll(userId);
    return habits.map(toHabitResponseDto);
  }
}
