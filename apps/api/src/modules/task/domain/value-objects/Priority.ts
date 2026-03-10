import { InvalidPriorityError } from '../errors/TaskErrors';

export type PriorityLevel = 'none' | 'low' | 'medium' | 'high' | 'urgent';

const VALID_LEVELS: PriorityLevel[] = ['none', 'low', 'medium', 'high', 'urgent'];

const WEIGHT_MAP: Record<PriorityLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export class Priority {
  private constructor(private readonly _level: PriorityLevel) {}

  static create(level: string): Priority {
    if (!VALID_LEVELS.includes(level as PriorityLevel)) {
      throw new InvalidPriorityError(level);
    }
    return new Priority(level as PriorityLevel);
  }

  static restore(level: string): Priority {
    return new Priority(level as PriorityLevel);
  }

  get level(): PriorityLevel {
    return this._level;
  }

  get weight(): number {
    return WEIGHT_MAP[this._level];
  }

  isHigherThan(other: Priority): boolean {
    return this.weight > other.weight;
  }
}
