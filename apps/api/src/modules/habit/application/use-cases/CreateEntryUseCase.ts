import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { EntryResponseDto, toEntryResponseDto } from '../dtos/HabitResponseDto';
import { HabitEntry } from '../../domain/entities/HabitEntry';

export interface CreateEntryInput {
  date?: string;
  entryType?: string;
  value?: number;
  note?: string;
  intensity?: number;
  trigger?: string;
}

@Injectable()
export class CreateEntryUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(habitId: string, userId: string, input: CreateEntryInput): Promise<EntryResponseDto> {
    const habit = await this.habitRepository.findOne(habitId, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    const date = input.date ?? new Date().toISOString().slice(0, 10);
    const entryType = input.entryType ?? 'check_in';

    // Validate via domain entity (throws domain errors)
    try {
      if (entryType === 'check_in') {
        HabitEntry.createCheckIn({
          habitId,
          date,
          value: input.value ?? 1,
          note: input.note,
        });
      } else {
        HabitEntry.createRelapse({
          habitId,
          date,
          note: input.note,
          intensity: input.intensity,
          trigger: input.trigger,
          trackRelapseIntensity: habit.trackRelapseIntensity,
          trackRelapseTrigger: habit.trackRelapseTrigger,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    // For check_ins, prevent duplicate on same date
    if (entryType === 'check_in') {
      const existing = await this.habitRepository.findEntryByDate(habitId, date, 'check_in');
      if (existing) throw new ConflictException('Hábito já foi completado nesta data.');
    }

    const entry = await this.habitRepository.createEntry({
      habitId,
      date,
      entryType,
      value: input.value ?? 1,
      note: input.note,
      intensity: input.intensity,
      trigger: input.trigger,
    });
    return toEntryResponseDto(entry);
  }
}
