import { StudyTag } from '../value-objects/StudyTag';
import { InvalidStudyNoteError } from '../errors/StudyErrors';

export interface CreateStudyNoteProps {
  studyItemId: string;
  content: string;
  tags?: StudyTag[];
}

export interface RestoreStudyNoteProps {
  id: string;
  studyItemId: string;
  content: string;
  tags: StudyTag[];
  createdAt: Date;
  updatedAt: Date;
}

export class StudyNote {
  private _content: string;
  private _tags: StudyTag[];
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _studyItemId: string,
    content: string,
    tags: StudyTag[],
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._content = content;
    this._tags = [...tags];
    this._updatedAt = updatedAt;
  }

  static create(props: CreateStudyNoteProps): StudyNote {
    const content = StudyNote.validateContent(props.content);
    const now = new Date();
    return new StudyNote(
      '',
      props.studyItemId,
      content,
      props.tags ?? [],
      now,
      now,
    );
  }

  static restore(props: RestoreStudyNoteProps): StudyNote {
    return new StudyNote(
      props.id,
      props.studyItemId,
      props.content,
      props.tags,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateContent(content: string): void {
    this._content = StudyNote.validateContent(content);
    this._updatedAt = new Date();
  }

  addTag(tag: StudyTag): void {
    if (!this._tags.some((t) => t.id === tag.id && t.name === tag.name)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  removeTag(tagId: string): void {
    this._tags = this._tags.filter((t) => t.id !== tagId);
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get studyItemId(): string { return this._studyItemId; }
  get content(): string { return this._content; }
  get tags(): StudyTag[] { return [...this._tags]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateContent(content: string): string {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new InvalidStudyNoteError('conteúdo não pode ser vazio.');
    }
    return trimmed;
  }
}
