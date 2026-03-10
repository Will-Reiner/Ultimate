import { InvalidTaskNoteContentError } from '../errors/TaskErrors';

export interface CreateTaskNoteProps {
  taskId: string;
  content: string;
}

export interface RestoreTaskNoteProps {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskNote {
  private _content: string;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _taskId: string,
    content: string,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._content = content;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateTaskNoteProps): TaskNote {
    TaskNote.validateContent(props.content);

    const now = new Date();
    return new TaskNote('', props.taskId, props.content.trim(), now, now);
  }

  static restore(props: RestoreTaskNoteProps): TaskNote {
    return new TaskNote(
      props.id,
      props.taskId,
      props.content,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateContent(content: string): void {
    TaskNote.validateContent(content);
    this._content = content.trim();
    this._updatedAt = new Date();
  }

  // ─── Validation ────────────────────────────────────────────────────────

  private static validateContent(content: string): void {
    const trimmed = content?.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new InvalidTaskNoteContentError('conteudo nao pode ser vazio.');
    }
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get taskId(): string { return this._taskId; }
  get content(): string { return this._content; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
