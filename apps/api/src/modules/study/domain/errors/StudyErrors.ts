export class StudyItemNotFoundError extends Error {
  constructor() {
    super('Item de estudo não encontrado.');
    this.name = 'StudyItemNotFoundError';
  }
}

export class CollectionNotFoundError extends Error {
  constructor() {
    super('Coleção não encontrada.');
    this.name = 'CollectionNotFoundError';
  }
}

export class InvalidStudyItemTitleError extends Error {
  constructor(reason: string) {
    super(`Título do item de estudo inválido: ${reason}`);
    this.name = 'InvalidStudyItemTitleError';
  }
}

export class InvalidStudyItemTypeError extends Error {
  constructor(type: string) {
    super(`Tipo de item de estudo inválido: "${type}".`);
    this.name = 'InvalidStudyItemTypeError';
  }
}

export class InvalidProgressError extends Error {
  constructor(reason: string) {
    super(`Progresso inválido: ${reason}`);
    this.name = 'InvalidProgressError';
  }
}

export class InvalidRatingError extends Error {
  constructor(reason: string) {
    super(`Avaliação inválida: ${reason}`);
    this.name = 'InvalidRatingError';
  }
}

export class InvalidStudyStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} → ${to}`);
    this.name = 'InvalidStudyStatusTransitionError';
  }
}

export class InvalidCollectionNameError extends Error {
  constructor(reason: string) {
    super(`Nome da coleção inválido: ${reason}`);
    this.name = 'InvalidCollectionNameError';
  }
}

export class InvalidStudyNoteError extends Error {
  constructor(reason: string) {
    super(`Nota de estudo inválida: ${reason}`);
    this.name = 'InvalidStudyNoteError';
  }
}

export class InvalidStudySessionError extends Error {
  constructor(reason: string) {
    super(`Sessão de estudo inválida: ${reason}`);
    this.name = 'InvalidStudySessionError';
  }
}

export class InvalidStudyTagNameError extends Error {
  constructor(reason: string) {
    super(`Nome da tag de estudo inválido: ${reason}`);
    this.name = 'InvalidStudyTagNameError';
  }
}
