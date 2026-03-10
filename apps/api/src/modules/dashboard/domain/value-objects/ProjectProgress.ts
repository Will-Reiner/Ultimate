export type ProjectProgressItem = {
  projectId: string;
  name: string;
  percentage: number;
  deadline: Date | null;
};

export class ProjectProgress {
  private constructor(private readonly _items: ProjectProgressItem[]) {}

  static create(items: ProjectProgressItem[]): ProjectProgress {
    return new ProjectProgress([...items]);
  }

  get items(): ProjectProgressItem[] {
    return [...this._items];
  }

  toJSON(): ProjectProgressItem[] {
    return [...this._items];
  }
}
