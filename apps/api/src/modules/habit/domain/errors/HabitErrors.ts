export class HabitNotFoundError extends Error {
  constructor() {
    super('Hábito não encontrado.');
    this.name = 'HabitNotFoundError';
  }
}

export class DuplicateEntryError extends Error {
  constructor() {
    super('Hábito já foi completado hoje.');
    this.name = 'DuplicateEntryError';
  }
}
