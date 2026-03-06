import { AppError } from '@shared/errors/AppError';

export class UserErrors {
  static invalidEmail(): AppError {
    return new AppError('Email inválido.', 'INVALID_EMAIL', 400);
  }

  static invalidName(): AppError {
    return new AppError('Nome deve ter pelo menos 2 caracteres.', 'INVALID_NAME', 400);
  }

  static weakPassword(): AppError {
    return new AppError(
      'Senha deve ter pelo menos 8 caracteres.',
      'WEAK_PASSWORD',
      400,
    );
  }

  static notFound(): AppError {
    return new AppError('Usuário não encontrado.', 'USER_NOT_FOUND', 404);
  }

  static alreadyExists(): AppError {
    return new AppError('Email já cadastrado.', 'USER_ALREADY_EXISTS', 409);
  }

  static invalidCredentials(): AppError {
    return new AppError('Email ou senha incorretos.', 'INVALID_CREDENTIALS', 401);
  }
}
