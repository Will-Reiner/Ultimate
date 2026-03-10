export interface JournalEntryInput {
  id: string;
  date: Date;
  moodLevel: number | null;
  tagIds: string[];
}

export interface JournalTagInput {
  id: string;
  name: string;
}
