import { InvalidMoodLevelError } from '../errors/JournalErrors';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'péssimo',
  2: 'ruim',
  3: 'neutro',
  4: 'bom',
  5: 'ótimo',
};

export class Mood {
  private constructor(private readonly _level: MoodLevel) {}

  static create(level: number): Mood {
    if (!Number.isInteger(level) || level < 1 || level > 5) {
      throw new InvalidMoodLevelError();
    }
    return new Mood(level as MoodLevel);
  }

  static restore(level: number): Mood {
    return new Mood(level as MoodLevel);
  }

  get level(): MoodLevel {
    return this._level;
  }

  get label(): string {
    return MOOD_LABELS[this._level];
  }
}
