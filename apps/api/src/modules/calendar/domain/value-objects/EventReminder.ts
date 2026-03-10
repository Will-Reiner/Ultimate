import { InvalidReminderMinutesError } from '../errors/CalendarErrors';

export type ReminderType = 'push';

export class EventReminder {
  private constructor(
    private readonly _minutesBefore: number,
    private readonly _type: ReminderType,
  ) {}

  static create(props: { minutesBefore: number }): EventReminder {
    if (props.minutesBefore < 0) {
      throw new InvalidReminderMinutesError();
    }
    return new EventReminder(props.minutesBefore, 'push');
  }

  get minutesBefore(): number { return this._minutesBefore; }
  get type(): ReminderType { return this._type; }
}
