export type HeatmapDay = {
  date: string;
  status: 'complete' | 'partial' | 'failed' | 'not_due';
};

export class HabitHeatmap {
  private constructor(private readonly _days: HeatmapDay[]) {}

  static create(days: HeatmapDay[]): HabitHeatmap {
    return new HabitHeatmap(days);
  }

  get days(): HeatmapDay[] {
    return this._days;
  }

  toJSON(): HeatmapDay[] {
    return this._days;
  }
}
