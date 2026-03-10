export type MoodDataPoint = { date: string; level: number };
export type WeeklyAverage = { weekStart: string; average: number };

export class MoodGraph {
  private constructor(
    private readonly _dataPoints: MoodDataPoint[],
    private readonly _weeklyAverages: WeeklyAverage[],
  ) {}

  static create(
    dataPoints: MoodDataPoint[],
    weeklyAverages: WeeklyAverage[],
  ): MoodGraph {
    return new MoodGraph([...dataPoints], [...weeklyAverages]);
  }

  get dataPoints(): MoodDataPoint[] {
    return [...this._dataPoints];
  }

  get weeklyAverages(): WeeklyAverage[] {
    return [...this._weeklyAverages];
  }

  toJSON(): { dataPoints: MoodDataPoint[]; weeklyAverages: WeeklyAverage[] } {
    return {
      dataPoints: [...this._dataPoints],
      weeklyAverages: [...this._weeklyAverages],
    };
  }
}
