export class CompletionRate {
  private constructor(
    private readonly _completed: number,
    private readonly _total: number,
  ) {}

  static create(completed: number, total: number): CompletionRate {
    return new CompletionRate(completed, total);
  }

  get completed(): number {
    return this._completed;
  }

  get total(): number {
    return this._total;
  }

  get percentage(): number {
    if (this._total === 0) return 0;
    return (this._completed / this._total) * 100;
  }

  toJSON(): { completed: number; total: number; percentage: number } {
    return {
      completed: this._completed,
      total: this._total,
      percentage: this.percentage,
    };
  }
}
