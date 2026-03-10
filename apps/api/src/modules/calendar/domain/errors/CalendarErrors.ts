export class InvalidEventTitleError extends Error {
  constructor(reason: string) {
    super(`Título do evento inválido: ${reason}`);
    this.name = 'InvalidEventTitleError';
  }
}

export class InvalidEventTimeRangeError extends Error {
  constructor() {
    super('Data/hora de fim deve ser após data/hora de início.');
    this.name = 'InvalidEventTimeRangeError';
  }
}

export class InvalidReminderMinutesError extends Error {
  constructor() {
    super('minutesBefore não pode ser negativo.');
    this.name = 'InvalidReminderMinutesError';
  }
}

export class InvalidParticipantNameError extends Error {
  constructor() {
    super('Nome do participante é obrigatório.');
    this.name = 'InvalidParticipantNameError';
  }
}

export class InvalidParticipantEmailError extends Error {
  constructor() {
    super('Formato de email inválido.');
    this.name = 'InvalidParticipantEmailError';
  }
}

export class InvalidRecurrenceError extends Error {
  constructor(reason: string) {
    super(`Recorrência inválida: ${reason}`);
    this.name = 'InvalidRecurrenceError';
  }
}

export class MeetingNotFoundError extends Error {
  constructor() {
    super('Reunião não encontrada.');
    this.name = 'MeetingNotFoundError';
  }
}

export class PersonalEventNotFoundError extends Error {
  constructor() {
    super('Evento pessoal não encontrado.');
    this.name = 'PersonalEventNotFoundError';
  }
}

export class InvalidTimeFormatError extends Error {
  constructor() {
    super('Horário deve estar no formato HH:mm (00:00–23:59).');
    this.name = 'InvalidTimeFormatError';
  }
}

export class InvalidDaysOfWeekError extends Error {
  constructor() {
    super('Dias da semana não pode ser vazio.');
    this.name = 'InvalidDaysOfWeekError';
  }
}
