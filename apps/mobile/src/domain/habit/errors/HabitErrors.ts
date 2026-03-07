import { AppError } from '@shared/errors/AppError';

export class HabitErrors {
  static invalidTitle(): AppError {
    return new AppError('Titulo do habito nao pode ser vazio.', 'INVALID_HABIT_TITLE', 400);
  }

  static invalidFrequency(): AppError {
    return new AppError('Frequencia invalida.', 'INVALID_FREQUENCY', 400);
  }

  static invalidType(): AppError {
    return new AppError('Tipo de habito invalido. Use "build" ou "quit".', 'INVALID_HABIT_TYPE', 400);
  }

  static invalidGoal(): AppError {
    return new AppError('Meta deve ser um valor maior que zero.', 'INVALID_HABIT_GOAL', 400);
  }

  static invalidReminderTime(): AppError {
    return new AppError('Horario do lembrete deve estar no formato HH:mm.', 'INVALID_REMINDER_TIME', 400);
  }

  static notFound(): AppError {
    return new AppError('Habito nao encontrado.', 'HABIT_NOT_FOUND', 404);
  }

  static alreadyCompleted(): AppError {
    return new AppError('Habito ja foi completado hoje.', 'HABIT_ALREADY_COMPLETED', 409);
  }
}
