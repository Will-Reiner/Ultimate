import { InvalidGoalError } from '../errors/HabitErrors';

export type GoalType = 'deadline' | 'ongoing';
export type GoalStatus = 'in_progress' | 'completed' | 'failed';

export interface GoalProps {
  type: GoalType;
  targetValue: number;
  targetUnit: string;
  deadline?: Date | null;
  status?: GoalStatus;
}

export class Goal {
  private constructor(
    private readonly _type: GoalType,
    private readonly _targetValue: number,
    private readonly _targetUnit: string,
    private readonly _deadline: Date | null,
    private readonly _status: GoalStatus,
  ) {}

  static create(props: GoalProps): Goal {
    if (props.type !== 'deadline' && props.type !== 'ongoing') {
      throw new InvalidGoalError(`Tipo desconhecido: "${props.type}".`);
    }

    if (!props.targetValue || props.targetValue <= 0) {
      throw new InvalidGoalError('targetValue deve ser maior que 0.');
    }

    if (!props.targetUnit || props.targetUnit.trim() === '') {
      throw new InvalidGoalError('targetUnit é obrigatório.');
    }

    if (props.type === 'deadline') {
      if (!props.deadline) {
        throw new InvalidGoalError('deadline é obrigatório para meta com prazo.');
      }
      if (props.deadline.getTime() < Date.now()) {
        throw new InvalidGoalError('deadline não pode ser no passado.');
      }
    }

    return new Goal(
      props.type,
      props.targetValue,
      props.targetUnit.trim(),
      props.type === 'deadline' ? props.deadline! : null,
      'in_progress',
    );
  }

  static restore(raw: GoalProps): Goal {
    return new Goal(
      raw.type,
      raw.targetValue,
      raw.targetUnit,
      raw.deadline ? new Date(raw.deadline) : null,
      raw.status ?? 'in_progress',
    );
  }

  calculateProgress(currentValue: number): number {
    const progress = (currentValue / this._targetValue) * 100;
    return Math.min(progress, 100);
  }

  evaluate(currentValue: number, now: Date): Goal {
    // Se já completada, permanece completada
    if (this._status === 'completed') {
      return this;
    }

    // Atingiu o target → completed
    if (currentValue >= this._targetValue) {
      return new Goal(this._type, this._targetValue, this._targetUnit, this._deadline, 'completed');
    }

    // Deadline expirou sem atingir → failed
    if (this._type === 'deadline' && this._deadline && now.getTime() > this._deadline.getTime()) {
      return new Goal(this._type, this._targetValue, this._targetUnit, this._deadline, 'failed');
    }

    return this;
  }

  get type(): GoalType { return this._type; }
  get targetValue(): number { return this._targetValue; }
  get targetUnit(): string { return this._targetUnit; }
  get deadline(): Date | null { return this._deadline; }
  get status(): GoalStatus { return this._status; }

  toJSON(): GoalProps {
    return {
      type: this._type,
      targetValue: this._targetValue,
      targetUnit: this._targetUnit,
      deadline: this._deadline,
      status: this._status,
    };
  }
}
