export interface StudyOverviewData {
  inProgress: number;
  backlogCount: number;
  completedInPeriod: number;
  sessionCompletionRate: number;
  totalStudyMinutes: number;
  averageRating: number | null;
}

export class StudyOverview {
  private constructor(private readonly _data: StudyOverviewData) {}

  static create(data: StudyOverviewData): StudyOverview {
    return new StudyOverview({
      inProgress: data.inProgress,
      backlogCount: data.backlogCount,
      completedInPeriod: data.completedInPeriod,
      sessionCompletionRate: data.sessionCompletionRate,
      totalStudyMinutes: data.totalStudyMinutes,
      averageRating: data.averageRating,
    });
  }

  get inProgress(): number {
    return this._data.inProgress;
  }

  get backlogCount(): number {
    return this._data.backlogCount;
  }

  get completedInPeriod(): number {
    return this._data.completedInPeriod;
  }

  get sessionCompletionRate(): number {
    return this._data.sessionCompletionRate;
  }

  get totalStudyMinutes(): number {
    return this._data.totalStudyMinutes;
  }

  get averageRating(): number | null {
    return this._data.averageRating;
  }

  toJSON(): StudyOverviewData {
    return {
      inProgress: this._data.inProgress,
      backlogCount: this._data.backlogCount,
      completedInPeriod: this._data.completedInPeriod,
      sessionCompletionRate: this._data.sessionCompletionRate,
      totalStudyMinutes: this._data.totalStudyMinutes,
      averageRating: this._data.averageRating,
    };
  }
}
