import { HabitErrors } from '../errors/HabitErrors';

export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface FrequencyProps {
  type: FrequencyType;
  /** For 'weekly': [0=Sun, 1=Mon, ... 6=Sat]. For 'daily': not required. */
  daysOfWeek?: number[];
}

export class Frequency {
  private constructor(private readonly props: FrequencyProps) {}

  static create(props: FrequencyProps): Frequency {
    if (!['daily', 'weekly', 'custom'].includes(props.type)) {
      throw HabitErrors.invalidFrequency();
    }

    if (props.type === 'weekly' && (!props.daysOfWeek || props.daysOfWeek.length === 0)) {
      throw HabitErrors.invalidFrequency();
    }

    return new Frequency(props);
  }

  get type(): FrequencyType { return this.props.type; }
  get daysOfWeek(): number[] | undefined { return this.props.daysOfWeek; }

  isActiveOn(date: Date): boolean {
    if (this.props.type === 'daily') return true;
    if (this.props.type === 'weekly') {
      return (this.props.daysOfWeek ?? []).includes(date.getDay());
    }
    return false;
  }

  toJSON(): FrequencyProps {
    return { ...this.props };
  }
}
