export type CalendarEventType = 'meeting' | 'personal' | 'task' | 'habit' | 'study';

export interface CalendarEventInput {
  id: string;
  title: string;
  type: CalendarEventType;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
}
