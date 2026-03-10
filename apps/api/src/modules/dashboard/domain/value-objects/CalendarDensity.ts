export type DayDensity = {
  date: string;
  eventCount: number;
  isHighDensity: boolean;
};

export class CalendarDensity {
  private constructor(private readonly _days: DayDensity[]) {}

  static create(days: DayDensity[]): CalendarDensity {
    return new CalendarDensity(days);
  }

  get days(): DayDensity[] {
    return this._days;
  }

  toJSON(): { days: DayDensity[] } {
    return { days: this._days };
  }
}
