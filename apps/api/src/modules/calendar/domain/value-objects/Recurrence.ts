import { InvalidRecurrenceError } from '../errors/CalendarErrors';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type EndType = 'never' | 'after_count' | 'until_date';

export interface CreateRecurrenceProps {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  endType: EndType;
  endCount?: number | null;
  endDate?: Date | null;
}

const DAY_NAMES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export class Recurrence {
  private constructor(
    private readonly _type: RecurrenceType,
    private readonly _interval: number,
    private readonly _daysOfWeek: number[] | null,
    private readonly _dayOfMonth: number | null,
    private readonly _endType: EndType,
    private readonly _endCount: number | null,
    private readonly _endDate: Date | null,
  ) {}

  static create(props: CreateRecurrenceProps): Recurrence {
    if (props.interval <= 0) {
      throw new InvalidRecurrenceError('intervalo deve ser maior que 0.');
    }

    if (props.type === 'weekly') {
      if (!props.daysOfWeek || props.daysOfWeek.length === 0) {
        throw new InvalidRecurrenceError('daysOfWeek é obrigatório para recorrência semanal.');
      }
    }

    if (props.type === 'monthly') {
      const day = props.dayOfMonth;
      if (day !== undefined && day !== null && (day < 1 || day > 31)) {
        throw new InvalidRecurrenceError('dayOfMonth deve estar entre 1 e 31.');
      }
    }

    if (props.endType === 'after_count') {
      if (!props.endCount || props.endCount <= 0) {
        throw new InvalidRecurrenceError('endCount deve ser maior que 0.');
      }
    }

    if (props.endType === 'until_date') {
      if (!props.endDate || props.endDate < new Date()) {
        throw new InvalidRecurrenceError('endDate deve ser uma data futura.');
      }
    }

    return new Recurrence(
      props.type,
      props.interval,
      props.daysOfWeek ?? null,
      props.dayOfMonth ?? null,
      props.endType,
      props.endCount ?? null,
      props.endDate ?? null,
    );
  }

  getNextOccurrence(from: Date, currentCount?: number): Date | null {
    if (this._endType === 'after_count' && currentCount !== undefined && currentCount >= this._endCount!) {
      return null;
    }

    const next = new Date(from);

    switch (this._type) {
      case 'daily':
      case 'custom':
        next.setDate(next.getDate() + this._interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7 * this._interval);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + this._interval);
        if (this._dayOfMonth) {
          next.setDate(this._dayOfMonth);
        }
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + this._interval);
        break;
    }

    if (this._endType === 'until_date' && this._endDate && next > this._endDate) {
      return null;
    }

    return next;
  }

  toRRule(): string {
    const freqMap: Record<RecurrenceType, string> = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY',
      custom: 'DAILY',
    };

    const parts: string[] = [`FREQ=${freqMap[this._type]}`, `INTERVAL=${this._interval}`];

    if (this._type === 'weekly' && this._daysOfWeek) {
      const dayNames = this._daysOfWeek.map((d) => DAY_NAMES[d]);
      parts.push(`BYDAY=${dayNames.join(',')}`);
    }

    if (this._type === 'monthly' && this._dayOfMonth) {
      parts.push(`BYMONTHDAY=${this._dayOfMonth}`);
    }

    if (this._endType === 'after_count' && this._endCount) {
      parts.push(`COUNT=${this._endCount}`);
    }

    if (this._endType === 'until_date' && this._endDate) {
      const y = this._endDate.getUTCFullYear();
      const m = String(this._endDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(this._endDate.getUTCDate()).padStart(2, '0');
      parts.push(`UNTIL=${y}${m}${d}`);
    }

    return parts.join(';');
  }

  static fromRRule(rrule: string): Recurrence {
    const parts = rrule.split(';');
    const map: Record<string, string> = {};
    for (const part of parts) {
      const [key, value] = part.split('=');
      map[key] = value;
    }

    const freqReverseMap: Record<string, RecurrenceType> = {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
    };

    const type = freqReverseMap[map['FREQ']] ?? 'custom';
    const interval = parseInt(map['INTERVAL'] ?? '1', 10);

    let daysOfWeek: number[] | null = null;
    if (map['BYDAY']) {
      const reverseDay: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
      daysOfWeek = map['BYDAY'].split(',').map((d) => reverseDay[d]);
    }

    let dayOfMonth: number | null = null;
    if (map['BYMONTHDAY']) {
      dayOfMonth = parseInt(map['BYMONTHDAY'], 10);
    }

    let endType: EndType = 'never';
    let endCount: number | null = null;
    let endDate: Date | null = null;

    if (map['COUNT']) {
      endType = 'after_count';
      endCount = parseInt(map['COUNT'], 10);
    } else if (map['UNTIL']) {
      endType = 'until_date';
      const s = map['UNTIL'];
      endDate = new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
    }

    return new Recurrence(type, interval, daysOfWeek, dayOfMonth, endType, endCount, endDate);
  }

  get type(): RecurrenceType { return this._type; }
  get interval(): number { return this._interval; }
  get daysOfWeek(): number[] | null { return this._daysOfWeek ? [...this._daysOfWeek] : null; }
  get dayOfMonth(): number | null { return this._dayOfMonth; }
  get endType(): EndType { return this._endType; }
  get endCount(): number | null { return this._endCount; }
  get endDate(): Date | null { return this._endDate; }
}
