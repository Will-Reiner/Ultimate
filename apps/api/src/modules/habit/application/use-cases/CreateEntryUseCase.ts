import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { EntryResponseDto, toEntryResponseDto } from '../dtos/HabitResponseDto';

export interface CreateEntryInput {
  completedAt?: string;
  value?: number;
  note?: string;
}

@Injectable()
export class CreateEntryUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(habitId: string, userId: string, input: CreateEntryInput): Promise<EntryResponseDto> {
    const habit = await this.habitRepository.findOne(habitId, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    const completedAt = input.completedAt ? new Date(input.completedAt) : new Date();
    const startOfDay = new Date(completedAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existing = await this.habitRepository.findEntryBetween(habitId, startOfDay, endOfDay);
    if (existing) throw new ConflictException('Hábito já foi completado hoje.');

    const entry = await this.habitRepository.createEntry(
      habitId,
      completedAt,
      input.value ?? 1,
      input.note,
    );
    return toEntryResponseDto(entry);
  }
}
