import { Installment } from '../value-objects/Installment';
import { InvalidInstallmentError } from '../errors/FinanceErrors';

const buildValidProps = () => ({
  totalInstallments: 12,
  currentInstallment: 3,
  installmentAmount: 150.0,
  parentTransactionId: 'txn-uuid-456',
});

describe('Installment', () => {
  describe('criacao', () => {
    it('deve criar Installment com props validas', () => {
      const props = buildValidProps();
      const inst = Installment.create(props);

      expect(inst.totalInstallments).toBe(props.totalInstallments);
      expect(inst.currentInstallment).toBe(props.currentInstallment);
      expect(inst.installmentAmount).toBe(props.installmentAmount);
      expect(inst.parentTransactionId).toBe(props.parentTransactionId);
    });

    it('deve aceitar currentInstallment igual a 1', () => {
      const inst = Installment.create({ ...buildValidProps(), currentInstallment: 1 });
      expect(inst.currentInstallment).toBe(1);
    });

    it('deve aceitar currentInstallment igual a totalInstallments', () => {
      const inst = Installment.create({ ...buildValidProps(), currentInstallment: 12 });
      expect(inst.currentInstallment).toBe(12);
    });

    it('deve rejeitar totalInstallments igual a zero', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), totalInstallments: 0 }),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve rejeitar totalInstallments negativo', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), totalInstallments: -1 }),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve rejeitar currentInstallment menor que 1', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), currentInstallment: 0 }),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve rejeitar currentInstallment maior que totalInstallments', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), currentInstallment: 13 }),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve rejeitar installmentAmount igual a zero', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), installmentAmount: 0 }),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve rejeitar installmentAmount negativo', () => {
      expect(() =>
        Installment.create({ ...buildValidProps(), installmentAmount: -50 }),
      ).toThrow(InvalidInstallmentError);
    });
  });

  describe('restore', () => {
    it('deve restaurar Installment sem validacao', () => {
      const props = buildValidProps();
      const inst = Installment.restore(props);

      expect(inst.totalInstallments).toBe(props.totalInstallments);
      expect(inst.currentInstallment).toBe(props.currentInstallment);
      expect(inst.installmentAmount).toBe(props.installmentAmount);
      expect(inst.parentTransactionId).toBe(props.parentTransactionId);
    });
  });

  describe('totalAmount', () => {
    it('deve calcular valor total corretamente', () => {
      const inst = Installment.create(buildValidProps());
      expect(inst.totalAmount()).toBe(12 * 150.0);
    });

    it('deve calcular valor total com decimais', () => {
      const inst = Installment.create({
        ...buildValidProps(),
        totalInstallments: 3,
        installmentAmount: 33.33,
      });
      expect(inst.totalAmount()).toBeCloseTo(99.99, 2);
    });
  });

  describe('toJSON', () => {
    it('deve retornar representacao JSON correta', () => {
      const props = buildValidProps();
      const inst = Installment.create(props);

      expect(inst.toJSON()).toEqual({
        totalInstallments: props.totalInstallments,
        currentInstallment: props.currentInstallment,
        installmentAmount: props.installmentAmount,
        parentTransactionId: props.parentTransactionId,
      });
    });
  });
});
