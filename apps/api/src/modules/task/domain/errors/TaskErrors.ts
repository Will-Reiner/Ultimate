export class ProjectNotFoundError extends Error {
    constructor() {
        super('Projeto nao encontrado.');
        this.name = 'ProjectNotFoundError';
    }
}

export class InvalidProjectNameError extends Error {
    constructor(reason: string) {
        super(`Nome do projeto invalido: ${reason}`);
        this.name = 'InvalidProjectNameError';
    }
}

export class TaskNotFoundError extends Error {
    constructor() {
        super('Tarefa nao encontrada.');
        this.name = 'TaskNotFoundError';
    }
}

export class InvalidTaskTitleError extends Error {
    constructor(reason: string) {
        super(`Titulo da tarefa invalido: ${reason}`);
        this.name = 'InvalidTaskTitleError';
    }
}

export class InvalidPriorityError extends Error {
    constructor(value: string) {
        super(`Prioridade invalida: ${value}`);
        this.name = 'InvalidPriorityError';
    }
}

export class InvalidTaskStatusError extends Error {
    constructor(reason: string) {
        super(`Status de tarefa invalido: ${reason}`);
        this.name = 'InvalidTaskStatusError';
    }
}

export class DuplicateTaskStatusNameError extends Error {
    constructor(name: string) {
        super(`Status com nome duplicado: ${name}`);
        this.name = 'DuplicateTaskStatusNameError';
    }
}

export class ImmutableDefaultStatusError extends Error {
    constructor() {
        super('Nao e possivel remover status global fixo.');
        this.name = 'ImmutableDefaultStatusError';
    }
}

export class InvalidTaskTagNameError extends Error {
    constructor(reason: string) {
        super(`Nome da tag invalido: ${reason}`);
        this.name = 'InvalidTaskTagNameError';
    }
}

export class DuplicateTaskTagNameError extends Error {
    constructor(name: string) {
        super(`Tag com nome duplicado: ${name}`);
        this.name = 'DuplicateTaskTagNameError';
    }
}

export class InvalidTaskNoteContentError extends Error {
    constructor(reason: string) {
        super(`Conteudo da nota invalido: ${reason}`);
        this.name = 'InvalidTaskNoteContentError';
    }
}

export class TaskNoteNotFoundError extends Error {
    constructor() {
        super('Nota nao encontrada.');
        this.name = 'TaskNoteNotFoundError';
    }
}

export class InvalidTaskReminderError extends Error {
    constructor(reason: string) {
        super(`Lembrete invalido: ${reason}`);
        this.name = 'InvalidTaskReminderError';
    }
}

export class TaskReminderNotFoundError extends Error {
    constructor() {
        super('Lembrete nao encontrado.');
        this.name = 'TaskReminderNotFoundError';
    }
}

export class InvalidSubtaskError extends Error {
    constructor(reason: string) {
        super(`Subtarefa invalida: ${reason}`);
        this.name = 'InvalidSubtaskError';
    }
}

export class InvalidProjectStatusTransitionError extends Error {
    constructor(from: string, to: string) {
        super(`Transicao de status do projeto invalida: ${from} -> ${to}`);
        this.name = 'InvalidProjectStatusTransitionError';
    }
}

export class InvalidTaskStatusAssignmentError extends Error {
    constructor(reason: string) {
        super(`Atribuicao de status invalida: ${reason}`);
        this.name = 'InvalidTaskStatusAssignmentError';
    }
}
