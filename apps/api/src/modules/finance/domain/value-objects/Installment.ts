import { InvalidInstallmentError } from '../errors/FinanceErrors';

export interface InstallmentProps {
  totalInstallments: number;
  currentInstallment: number;
  installmentAmount: number;
  parentTransactionId: string;
}

export class Installment {
  private constructor(
    private readonly _totalInstallments: number,
    private readonly _currentInstallment: number,
    private readonly _installmentAmount: number,
    private readonly _parentTransactionId: string,
  ) {}

  static create(props: InstallmentProps): Installment {
    if (props.totalInstallments <= 0) {
      throw new InvalidInstallmentError('totalInstallments deve ser maior que zero.');
    }

    if (props.currentInstallment < 1 || props.currentInstallment > props.totalInstallments) {
      throw new InvalidInstallmentError(
        'currentInstallment deve ser >= 1 e <= totalInstallments.',
      );
    }

    if (props.installmentAmount <= 0) {
      throw new InvalidInstallmentError('installmentAmount deve ser maior que zero.');
    }

    return new Installment(
      props.totalInstallments,
      props.currentInstallment,
      props.installmentAmount,
      props.parentTransactionId,
    );
  }

  static restore(props: InstallmentProps): Installment {
    return new Installment(
      props.totalInstallments,
      props.currentInstallment,
      props.installmentAmount,
      props.parentTransactionId,
    );
  }

  totalAmount(): number {
    return this._totalInstallments * this._installmentAmount;
  }

  get totalInstallments(): number {
    return this._totalInstallments;
  }

  get currentInstallment(): number {
    return this._currentInstallment;
  }

  get installmentAmount(): number {
    return this._installmentAmount;
  }

  get parentTransactionId(): string {
    return this._parentTransactionId;
  }

  toJSON(): InstallmentProps {
    return {
      totalInstallments: this._totalInstallments,
      currentInstallment: this._currentInstallment,
      installmentAmount: this._installmentAmount,
      parentTransactionId: this._parentTransactionId,
    };
  }
}
