import { AppError } from '@shared/errors/AppError';

export class HabitErrors {
  static invalidTitle(): AppError {
    return new AppError('Título do hábito não pode ser vazio.', 'INVALID_HABIT_TITLE', 400);
  }

  static invalidFrequency(): AppError {
    return new AppError('Frequência inválida.', 'INVALID_FREQUENCY', 400);
  }

  static notFound(): AppError {
    return new AppError('Hábito não encontrado.', 'HABIT_NOT_FOUND', 404);
  }

  static alreadyCompleted(): AppError {
    return new AppError('Hábito já foi completado hoje.', 'HABIT_ALREADY_COMPLETED', 409);
  }
}
