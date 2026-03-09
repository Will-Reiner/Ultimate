import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';

@Injectable()
export class DeleteHabitUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const exists = await this.habitRepository.findOne(id, userId);
    if (!exists) throw new NotFoundException('Hábito não encontrado.');
    await this.habitRepository.remove(id);
  }
}
