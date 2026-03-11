export interface ViceMetricsData {
  habitId: string;
  daysClean: number;
  relapseFrequencyPerWeek: number;
  relapseFrequencyPerMonth: number;
  topTriggers: { trigger: string; count: number }[];
}

export class ViceMetrics {
  private constructor(private readonly _data: ViceMetricsData) {}

  static create(data: ViceMetricsData): ViceMetrics {
    return new ViceMetrics(data);
  }

  get habitId(): string {
    return this._data.habitId;
  }

  get daysClean(): number {
    return this._data.daysClean;
  }

  get relapseFrequencyPerWeek(): number {
    return this._data.relapseFrequencyPerWeek;
  }

  get relapseFrequencyPerMonth(): number {
    return this._data.relapseFrequencyPerMonth;
  }

  get topTriggers(): { trigger: string; count: number }[] {
    return this._data.topTriggers;
  }

  toJSON(): ViceMetricsData {
    return { ...this._data };
  }
}
