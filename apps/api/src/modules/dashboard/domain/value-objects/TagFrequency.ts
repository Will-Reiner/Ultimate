export interface TagCount {
  tagId: string;
  tagName: string;
  count: number;
}

export class TagFrequency {
  private constructor(
    private readonly _tags: TagCount[],
  ) {}

  static create(tags: TagCount[]): TagFrequency {
    const sorted = [...tags].sort((a, b) => b.count - a.count);
    return new TagFrequency(sorted);
  }

  get tags(): TagCount[] {
    return [...this._tags];
  }

  toJSON(): { tags: TagCount[] } {
    return { tags: [...this._tags] };
  }
}
