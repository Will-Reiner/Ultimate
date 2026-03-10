export class InvalidTagNameError extends Error {
  constructor(message = 'Nome da tag é obrigatório e deve ter no máximo 30 caracteres.') {
    super(message);
    this.name = 'InvalidTagNameError';
  }
}

export class InvalidTagColorError extends Error {
  constructor(message = 'Cor da tag é obrigatória e deve ser um hex válido (#RRGGBB).') {
    super(message);
    this.name = 'InvalidTagColorError';
  }
}

export class DuplicateTagError extends Error {
  constructor(message = 'Já existe uma tag com este nome.') {
    super(message);
    this.name = 'DuplicateTagError';
  }
}

export class TagNotFoundError extends Error {
  constructor(message = 'Tag não encontrada.') {
    super(message);
    this.name = 'TagNotFoundError';
  }
}
