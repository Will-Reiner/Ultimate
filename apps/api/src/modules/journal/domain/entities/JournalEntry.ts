import { Mood } from '../value-objects/Mood';
import {
  InvalidJournalContentError,
  InvalidAudioError,
} from '../errors/JournalErrors';

export type JournalEntryType = 'daily' | 'thought';
export type AudioTranscriptionStatus = 'pending' | 'completed' | 'failed';

export interface CreateJournalEntryProps {
  userId: string;
  type: JournalEntryType;
  date: Date;
  textContent?: string | null;
  audioUrl?: string | null;
  audioDurationSeconds?: number | null;
  mood?: Mood | null;
  tagIds?: string[];
}

export interface RestoreJournalEntryProps {
  id: string;
  userId: string;
  type: JournalEntryType;
  date: Date;
  textContent: string | null;
  audioUrl: string | null;
  audioTranscription: string | null;
  audioTranscriptionStatus: AudioTranscriptionStatus | null;
  audioDurationSeconds: number | null;
  mood: Mood | null;
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class JournalEntry {
  private _textContent: string | null;
  private _audioUrl: string | null;
  private _audioTranscription: string | null;
  private _audioTranscriptionStatus: AudioTranscriptionStatus | null;
  private _audioDurationSeconds: number | null;
  private _mood: Mood | null;
  private _tagIds: string[];
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _type: JournalEntryType,
    private readonly _date: Date,
    textContent: string | null,
    audioUrl: string | null,
    audioTranscription: string | null,
    audioTranscriptionStatus: AudioTranscriptionStatus | null,
    audioDurationSeconds: number | null,
    mood: Mood | null,
    tagIds: string[],
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._textContent = textContent;
    this._audioUrl = audioUrl;
    this._audioTranscription = audioTranscription;
    this._audioTranscriptionStatus = audioTranscriptionStatus;
    this._audioDurationSeconds = audioDurationSeconds;
    this._mood = mood;
    this._tagIds = tagIds;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateJournalEntryProps): JournalEntry {
    const textContent = props.textContent ?? null;
    const audioUrl = props.audioUrl ?? null;
    const audioDurationSeconds = props.audioDurationSeconds ?? null;

    if (!textContent && !audioUrl) {
      throw new InvalidJournalContentError('é necessário pelo menos texto ou áudio.');
    }

    if (audioUrl) {
      if (!audioDurationSeconds || audioDurationSeconds <= 0) {
        throw new InvalidAudioError('duração deve ser maior que 0.');
      }
    }

    const now = new Date();
    return new JournalEntry(
      '',
      props.userId,
      props.type,
      props.date,
      textContent,
      audioUrl,
      null,
      audioUrl ? 'pending' : null,
      audioUrl ? audioDurationSeconds : null,
      props.mood ?? null,
      props.tagIds ?? [],
      now,
      now,
    );
  }

  static restore(props: RestoreJournalEntryProps): JournalEntry {
    return new JournalEntry(
      props.id,
      props.userId,
      props.type,
      props.date,
      props.textContent,
      props.audioUrl,
      props.audioTranscription,
      props.audioTranscriptionStatus,
      props.audioDurationSeconds,
      props.mood,
      props.tagIds,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateText(text: string | null): void {
    this._textContent = text;
    this._updatedAt = new Date();
  }

  updateMood(mood: Mood | null): void {
    this._mood = mood;
    this._updatedAt = new Date();
  }

  addTag(tagId: string): void {
    if (!this._tagIds.includes(tagId)) {
      this._tagIds.push(tagId);
    }
  }

  removeTag(tagId: string): void {
    this._tagIds = this._tagIds.filter((t) => t !== tagId);
  }

  replaceAudio(url: string, durationSeconds: number): void {
    this._audioUrl = url;
    this._audioDurationSeconds = durationSeconds;
    this._audioTranscription = null;
    this._audioTranscriptionStatus = 'pending';
    this._updatedAt = new Date();
  }

  completeTranscription(text: string): void {
    this._audioTranscription = text;
    this._audioTranscriptionStatus = 'completed';
  }

  failTranscription(): void {
    this._audioTranscriptionStatus = 'failed';
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get type(): JournalEntryType { return this._type; }
  get date(): Date { return this._date; }
  get textContent(): string | null { return this._textContent; }
  get audioUrl(): string | null { return this._audioUrl; }
  get audioTranscription(): string | null { return this._audioTranscription; }
  get audioTranscriptionStatus(): AudioTranscriptionStatus | null { return this._audioTranscriptionStatus; }
  get audioDurationSeconds(): number | null { return this._audioDurationSeconds; }
  get mood(): Mood | null { return this._mood; }
  get tagIds(): string[] { return [...this._tagIds]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
