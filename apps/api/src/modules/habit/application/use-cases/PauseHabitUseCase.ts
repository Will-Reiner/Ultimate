import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class PauseHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(id: string, userId: string): Promise<HabitResponseDto> {
    const habit = await this.habitRepository.findOne(id, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    try {
      habit.pause();
    } catch (err) {
      if (err instanceof Error) throw new BadRequestException(err.message);
      throw err;
    }

    const updated = await this.habitRepository.update(id, { status: 'paused' });
    return toHabitResponseDto(updated);
  }
}
