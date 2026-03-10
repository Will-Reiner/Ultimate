import { InvalidTransactionRecurrenceError } from '../errors/FinanceErrors';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const VALID_FREQUENCIES: RecurrenceFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export interface CreateTransactionRecurrenceProps {
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
}

export interface RestoreTransactionRecurrenceProps {
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string | null;
  nextOccurrence: string;
}

export interface TransactionRecurrenceJSON {
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate: string | null;
  nextOccurrence: string;
}

export class TransactionRecurrence {
  private constructor(
    private readonly _frequency: RecurrenceFrequency,
    private readonly _startDate: string,
    private readonly _endDate: string | null,
    private readonly _nextOccurrence: string,
  ) {}

  static create(props: CreateTransactionRecurrenceProps): TransactionRecurrence {
    if (!VALID_FREQUENCIES.includes(props.frequency)) {
      throw new InvalidTransactionRecurrenceError(
        `frequencia "${props.frequency}" nao e valida. Use: ${VALID_FREQUENCIES.join(', ')}.`,
      );
    }

    if (props.endDate && props.endDate <= props.startDate) {
      throw new InvalidTransactionRecurrenceError(
        'endDate deve ser posterior a startDate.',
      );
    }

    const nextOccurrence = TransactionRecurrence.computeNext(props.frequency, props.startDate);

    return new TransactionRecurrence(
      props.frequency,
      props.startDate,
      props.endDate ?? null,
      nextOccurrence,
    );
  }

  static restore(props: RestoreTransactionRecurrenceProps): TransactionRecurrence {
    return new TransactionRecurrence(
      props.frequency,
      props.startDate,
      props.endDate ?? null,
      props.nextOccurrence,
    );
  }

  calculateNextOccurrence(fromDate: string): string {
    return TransactionRecurrence.computeNext(this._frequency, fromDate);
  }

  private static computeNext(frequency: RecurrenceFrequency, fromDate: string): string {
    const date = new Date(fromDate + 'T00:00:00Z');

    switch (frequency) {
      case 'daily':
        date.setUTCDate(date.getUTCDate() + 1);
        break;
      case 'weekly':
        date.setUTCDate(date.getUTCDate() + 7);
        break;
      case 'monthly':
        date.setUTCMonth(date.getUTCMonth() + 1);
        break;
      case 'yearly':
        date.setUTCFullYear(date.getUTCFullYear() + 1);
        break;
    }

    return TransactionRecurrence.formatDate(date);
  }

  private static formatDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get frequency(): RecurrenceFrequency {
    return this._frequency;
  }

  get endDate(): string | null {
    return this._endDate;
  }

  get nextOccurrence(): string {
    return this._nextOccurrence;
  }

  toJSON(): TransactionRecurrenceJSON {
    return {
      frequency: this._frequency,
      startDate: this._startDate,
      endDate: this._endDate,
      nextOccurrence: this._nextOccurrence,
    };
  }
}
