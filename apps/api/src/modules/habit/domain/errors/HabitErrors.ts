export class HabitNotFoundError extends Error {
  constructor() {
    super('Hábito não encontrado.');
    this.name = 'HabitNotFoundError';
  }
}

export class DuplicateEntryError extends Error {
  constructor() {
    super('Já existe um check-in para este dia.');
    this.name = 'DuplicateEntryError';
  }
}

export class InvalidHabitNameError extends Error {
  constructor(reason: string) {
    super(`Nome do hábito inválido: ${reason}`);
    this.name = 'InvalidHabitNameError';
  }
}

export class ImmutableTypeError extends Error {
  constructor() {
    super('O tipo do hábito (build/quit) não pode ser alterado após a criação.');
    this.name = 'ImmutableTypeError';
  }
}

export class InvalidFrequencyError extends Error {
  constructor(reason: string) {
    super(`Frequência inválida: ${reason}`);
    this.name = 'InvalidFrequencyError';
  }
}

export class InvalidGoalError extends Error {
  constructor(reason: string) {
    super(`Meta inválida: ${reason}`);
    this.name = 'InvalidGoalError';
  }
}

export class InvalidTrackingModeError extends Error {
  constructor(reason: string) {
    super(`Modo de rastreamento inválido: ${reason}`);
    this.name = 'InvalidTrackingModeError';
  }
}

export class InvalidEntryValueError extends Error {
  constructor(reason: string) {
    super(`Valor de entrada inválido: ${reason}`);
    this.name = 'InvalidEntryValueError';
  }
}

export class InvalidIntensityError extends Error {
  constructor() {
    super('Intensidade deve ser um número entre 1 e 10.');
    this.name = 'InvalidIntensityError';
  }
}

export class UnauthorizedTrackingFieldError extends Error {
  constructor(field: string) {
    super(`O campo "${field}" não é permitido para este hábito.`);
    this.name = 'UnauthorizedTrackingFieldError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} → ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class InvalidReminderTimeError extends Error {
  constructor() {
    super('Horário de lembrete deve estar no formato HH:mm.');
    this.name = 'InvalidReminderTimeError';
  }
}
