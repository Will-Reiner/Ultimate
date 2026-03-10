import { InvalidFrequencyError } from '../errors/HabitErrors';

export type FrequencyType = 'daily' | 'weekly' | 'specific_days' | 'interval';

export interface FrequencyProps {
  type: FrequencyType;
  timesPerWeek?: number;
  days?: number[];
  everyNDays?: number;
}

export class Frequency {
  private constructor(
    private readonly _type: FrequencyType,
    private readonly _timesPerWeek: number | null,
    private readonly _days: number[],
    private readonly _everyNDays: number | null,
  ) {}

  static create(props: FrequencyProps): Frequency {
    switch (props.type) {
      case 'daily':
        return new Frequency('daily', null, [], null);

      case 'weekly':
        if (props.timesPerWeek == null) {
          throw new InvalidFrequencyError('timesPerWeek é obrigatório para frequência weekly.');
        }
        if (props.timesPerWeek < 1 || props.timesPerWeek > 7) {
          throw new InvalidFrequencyError('timesPerWeek deve ser entre 1 e 7.');
        }
        return new Frequency('weekly', props.timesPerWeek, [], null);

      case 'specific_days': {
        if (!props.days || props.days.length === 0) {
          throw new InvalidFrequencyError('days é obrigatório e não pode ser vazio para specific_days.');
        }
        for (const d of props.days) {
          if (d < 0 || d > 6) {
            throw new InvalidFrequencyError('Cada dia deve estar entre 0 (dom) e 6 (sáb).');
          }
        }
        const sorted = [...new Set(props.days)].sort((a, b) => a - b);
        return new Frequency('specific_days', null, sorted, null);
      }

      case 'interval':
        if (props.everyNDays == null) {
          throw new InvalidFrequencyError('everyNDays é obrigatório para frequência interval.');
        }
        if (props.everyNDays <= 0) {
          throw new InvalidFrequencyError('everyNDays deve ser maior que 0.');
        }
        return new Frequency('interval', null, [], props.everyNDays);

      default:
        throw new InvalidFrequencyError(`Tipo de frequência desconhecido: "${props.type}".`);
    }
  }

  static restore(raw: FrequencyProps): Frequency {
    return new Frequency(
      raw.type,
      raw.timesPerWeek ?? null,
      raw.days ?? [],
      raw.everyNDays ?? null,
    );
  }

  isDueOn(date: Date, habitCreatedAt: Date): boolean {
    switch (this._type) {
      case 'daily':
        return true;

      case 'weekly':
        // weekly com timesPerWeek: o controle real é feito pelo contador semanal
        // aqui todos os dias são potencialmente due (o uso decide a semana)
        return true;

      case 'specific_days':
        return this._days.includes(date.getDay());

      case 'interval': {
        const createdDate = new Date(habitCreatedAt);
        createdDate.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const diffMs = targetDate.getTime() - createdDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % this._everyNDays! === 0;
      }

      default:
        return false;
    }
  }

  get type(): FrequencyType { return this._type; }
  get timesPerWeek(): number | null { return this._timesPerWeek; }
  get days(): number[] { return [...this._days]; }
  get everyNDays(): number | null { return this._everyNDays; }

  toJSON(): FrequencyProps {
    return {
      type: this._type,
      ...(this._timesPerWeek != null && { timesPerWeek: this._timesPerWeek }),
      ...(this._days.length > 0 && { days: [...this._days] }),
      ...(this._everyNDays != null && { everyNDays: this._everyNDays }),
    };
  }
}
