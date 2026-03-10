import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class ArchiveHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(id: string, userId: string): Promise<HabitResponseDto> {
    const habit = await this.habitRepository.findOne(id, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    try {
      habit.archive();
    } catch (err) {
      if (err instanceof Error) throw new BadRequestException(err.message);
      throw err;
    }

    const updated = await this.habitRepository.update(id, { status: 'archived' });
    return toHabitResponseDto(updated);
  }
}
