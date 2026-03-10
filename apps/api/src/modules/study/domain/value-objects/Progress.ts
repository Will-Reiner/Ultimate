import { InvalidProgressError } from '../errors/StudyErrors';

export type ProgressType = 'simple' | 'percentage' | 'chapters';

export interface ProgressProps {
  type: ProgressType;
  currentValue?: number;
  totalValue?: number | null;
}

export class Progress {
  private constructor(
    private readonly _type: ProgressType,
    private readonly _currentValue: number,
    private readonly _totalValue: number | null,
  ) {}

  static create(props: ProgressProps): Progress {
    switch (props.type) {
      case 'simple':
        return new Progress('simple', 0, null);

      case 'percentage': {
        const value = props.currentValue ?? 0;
        if (value < 0) {
          throw new InvalidProgressError('Valor não pode ser negativo para progresso percentual.');
        }
        if (value > 100) {
          throw new InvalidProgressError('Valor não pode ser maior que 100 para progresso percentual.');
        }
        return new Progress('percentage', value, null);
      }

      case 'chapters': {
        const currentValue = props.currentValue ?? 0;
        const totalValue = props.totalValue ?? null;
        if (totalValue === null || totalValue <= 0) {
          throw new InvalidProgressError('totalValue deve ser maior que 0 para progresso por capítulos.');
        }
        if (currentValue < 0) {
          throw new InvalidProgressError('currentValue não pode ser negativo.');
        }
        if (currentValue > totalValue) {
          throw new InvalidProgressError('currentValue não pode ser maior que totalValue.');
        }
        return new Progress('chapters', currentValue, totalValue);
      }

      default:
        throw new InvalidProgressError(`Tipo de progresso desconhecido: "${props.type}".`);
    }
  }

  static restore(raw: ProgressProps): Progress {
    return new Progress(
      raw.type,
      raw.currentValue ?? 0,
      raw.totalValue ?? null,
    );
  }

  getPercentage(): number {
    switch (this._type) {
      case 'simple':
        return this._currentValue > 0 ? 100 : 0;
      case 'percentage':
        return this._currentValue;
      case 'chapters':
        if (this._totalValue === null || this._totalValue === 0) return 0;
        return Math.round((this._currentValue / this._totalValue) * 100);
      default:
        return 0;
    }
  }

  isComplete(): boolean {
    switch (this._type) {
      case 'simple':
        return false; // simple has no auto-complete
      case 'percentage':
        return this._currentValue === 100;
      case 'chapters':
        return this._totalValue !== null && this._currentValue === this._totalValue;
      default:
        return false;
    }
  }

  isStarted(): boolean {
    return this._currentValue > 0;
  }

  get type(): ProgressType { return this._type; }
  get currentValue(): number { return this._currentValue; }
  get totalValue(): number | null { return this._totalValue; }

  toJSON(): ProgressProps {
    return {
      type: this._type,
      currentValue: this._currentValue,
      ...(this._totalValue !== null && { totalValue: this._totalValue }),
    };
  }
}
