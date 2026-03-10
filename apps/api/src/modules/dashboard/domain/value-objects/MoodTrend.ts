export type MoodDirection = 'improving' | 'worsening' | 'stable';

export class MoodTrend {
  private constructor(
    private readonly _direction: MoodDirection,
  ) {}

  static create(direction: MoodDirection): MoodTrend {
    return new MoodTrend(direction);
  }

  get direction(): MoodDirection {
    return this._direction;
  }

  toJSON(): { direction: MoodDirection } {
    return { direction: this._direction };
  }
}
