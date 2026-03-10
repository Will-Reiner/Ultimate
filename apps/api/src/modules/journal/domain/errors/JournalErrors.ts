export class JournalEntryNotFoundError extends Error {
  constructor() {
    super('Entrada do diário não encontrada.');
    this.name = 'JournalEntryNotFoundError';
  }
}

export class InvalidJournalContentError extends Error {
  constructor(reason: string) {
    super(`Conteúdo do diário inválido: ${reason}`);
    this.name = 'InvalidJournalContentError';
  }
}

export class DuplicateDailyEntryError extends Error {
  constructor() {
    super('Já existe uma entrada diária para este dia.');
    this.name = 'DuplicateDailyEntryError';
  }
}

export class InvalidMoodLevelError extends Error {
  constructor() {
    super('Nível de humor deve ser um inteiro entre 1 e 5.');
    this.name = 'InvalidMoodLevelError';
  }
}

export class InvalidJournalTagNameError extends Error {
  constructor(reason: string) {
    super(`Nome de tag inválido: ${reason}`);
    this.name = 'InvalidJournalTagNameError';
  }
}

export class PredefinedTagImmutableError extends Error {
  constructor() {
    super('Tags pré-definidas não podem ser editadas ou excluídas.');
    this.name = 'PredefinedTagImmutableError';
  }
}

export class DuplicateTagNameError extends Error {
  constructor() {
    super('Já existe uma tag com este nome.');
    this.name = 'DuplicateTagNameError';
  }
}

export class InvalidAudioError extends Error {
  constructor(reason: string) {
    super(`Áudio inválido: ${reason}`);
    this.name = 'InvalidAudioError';
  }
}
