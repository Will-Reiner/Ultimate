import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IHabitRepository, HABIT_REPOSITORY } from '../../domain/repositories/IHabitRepository';
import { HabitResponseDto, toHabitResponseDto } from '../dtos/HabitResponseDto';

@Injectable()
export class EvaluateGoalUseCase {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(habitId: string, userId: string): Promise<HabitResponseDto> {
    const habit = await this.habitRepository.findOne(habitId, userId);
    if (!habit) throw new NotFoundException('Hábito não encontrado.');

    const goal = habit.goal;
    if (!goal) throw new BadRequestException('Este hábito não possui meta definida.');

    const entries = await this.habitRepository.getEntries(habitId, '1970-01-01', '2999-12-31', 'check_in');
    const currentValue = entries.reduce((sum, e) => sum + e.value, 0);

    const evaluatedGoal = goal.evaluate(currentValue, new Date());
    habit.setGoal(evaluatedGoal);

    if (evaluatedGoal.status !== goal.status) {
      await this.habitRepository.update(habitId, { goalStatus: evaluatedGoal.status });
    }

    return toHabitResponseDto(habit);
  }
}
