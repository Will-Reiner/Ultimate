export class UserNotFoundError extends Error {
  constructor() {
    super('Usuário não encontrado.');
    this.name = 'UserNotFoundError';
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('Email já cadastrado.');
    this.name = 'EmailAlreadyInUseError';
  }
}
