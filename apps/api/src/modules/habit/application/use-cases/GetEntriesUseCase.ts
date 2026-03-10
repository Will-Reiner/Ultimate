import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { EntryResponseDto, toEntryResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class GetEntriesUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(habitId: string, userId: string, from: string, to: string, entryType?: string): Promise<EntryResponseDto[]> {
    const habit = await this.habitRepository.findOne(habitId, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    const entries = await this.habitRepository.getEntries(habitId, from, to, entryType);
    return entries.map(toEntryResponseDto);
  }
}
