export interface TaskDistributionData {
  byPriority: Record<string, number>;
  overdueCount: number;
  withoutDeadlineCount: number;
  withoutAssigneeCount: number;
}

export class TaskDistribution {
  private constructor(private readonly _data: TaskDistributionData) {}

  static create(data: TaskDistributionData): TaskDistribution {
    return new TaskDistribution({
      byPriority: { ...data.byPriority },
      overdueCount: data.overdueCount,
      withoutDeadlineCount: data.withoutDeadlineCount,
      withoutAssigneeCount: data.withoutAssigneeCount,
    });
  }

  get byPriority(): Record<string, number> {
    return { ...this._data.byPriority };
  }

  get overdueCount(): number {
    return this._data.overdueCount;
  }

  get withoutDeadlineCount(): number {
    return this._data.withoutDeadlineCount;
  }

  get withoutAssigneeCount(): number {
    return this._data.withoutAssigneeCount;
  }

  toJSON(): TaskDistributionData {
    return {
      byPriority: { ...this._data.byPriority },
      overdueCount: this._data.overdueCount,
      withoutDeadlineCount: this._data.withoutDeadlineCount,
      withoutAssigneeCount: this._data.withoutAssigneeCount,
    };
  }
}
