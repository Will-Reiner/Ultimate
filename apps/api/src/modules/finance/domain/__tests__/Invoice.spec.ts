import { Invoice, InvoiceStatus } from '../entities/Invoice';
import {
  InvalidInvoiceStatusTransitionError,
  InvalidInvoicePaymentError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    creditCardId: 'cc-1',
    userId: 'user-1',
    month: '2025-03',
    closingDate: '2025-03-20',
    dueDate: '2025-03-27',
    ...overrides,
  };
}

describe('Invoice', () => {
  describe('criacao', () => {
    it('deve criar uma fatura com campos obrigatorios', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(invoice.id).toBe('');
      expect(invoice.creditCardId).toBe('cc-1');
      expect(invoice.userId).toBe('user-1');
      expect(invoice.month).toBe('2025-03');
      expect(invoice.closingDate).toBe('2025-03-20');
      expect(invoice.dueDate).toBe('2025-03-27');
      expect(invoice.status).toBe('open');
      expect(invoice.totalAmount).toBe(0);
      expect(invoice.paidAmount).toBe(0);
      expect(invoice.paidWithAccountId).toBeNull();
      expect(invoice.createdAt).toBeInstanceOf(Date);
      expect(invoice.updatedAt).toBeInstanceOf(Date);
    });

    it('deve definir status como open', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(invoice.status).toBe('open');
    });

    it('deve definir totalAmount como 0', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(invoice.totalAmount).toBe(0);
    });

    it('deve definir paidAmount como 0', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(invoice.paidAmount).toBe(0);
    });

    it('deve definir paidWithAccountId como null', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(invoice.paidWithAccountId).toBeNull();
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const invoice = Invoice.create(buildValidProps());
      const after = new Date();

      expect(invoice.id).toBe('');
      expect(invoice.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(invoice.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(invoice.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(invoice.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('updateTotalAmount', () => {
    it('deve atualizar o totalAmount', () => {
      const invoice = Invoice.create(buildValidProps());
      invoice.updateTotalAmount(500);

      expect(invoice.totalAmount).toBe(500);
    });

    it('deve atualizar updatedAt ao atualizar totalAmount', () => {
      const invoice = Invoice.create(buildValidProps());
      const originalUpdatedAt = invoice.updatedAt;

      invoice.updateTotalAmount(500);

      expect(invoice.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('remainingAmount', () => {
    it('deve retornar totalAmount quando nao ha pagamento', () => {
      const invoice = Invoice.create(buildValidProps());
      invoice.updateTotalAmount(1000);

      expect(invoice.remainingAmount).toBe(1000);
    });

    it('deve retornar diferenca entre totalAmount e paidAmount', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'closed',
        totalAmount: 1000,
        paidAmount: 300,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(invoice.remainingAmount).toBe(700);
    });

    it('deve retornar zero quando totalmente pago', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'paid',
        totalAmount: 1000,
        paidAmount: 1000,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(invoice.remainingAmount).toBe(0);
    });
  });

  describe('close', () => {
    it('deve fechar uma fatura aberta', () => {
      const invoice = Invoice.create(buildValidProps());
      invoice.close();

      expect(invoice.status).toBe('closed');
    });

    it('deve atualizar updatedAt ao fechar', () => {
      const invoice = Invoice.create(buildValidProps());
      const originalUpdatedAt = invoice.updatedAt;

      invoice.close();

      expect(invoice.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve rejeitar fechamento de fatura ja fechada', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'closed',
        totalAmount: 500,
        paidAmount: 0,
        paidWithAccountId: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(() => invoice.close()).toThrow(InvalidInvoiceStatusTransitionError);
    });

    it('deve rejeitar fechamento de fatura paga', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'paid',
        totalAmount: 500,
        paidAmount: 500,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => invoice.close()).toThrow(InvalidInvoiceStatusTransitionError);
    });
  });

  describe('registerPayment', () => {
    function buildClosedInvoice() {
      const now = new Date();
      return Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'closed',
        totalAmount: 1000,
        paidAmount: 0,
        paidWithAccountId: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    it('deve registrar pagamento parcial', () => {
      const invoice = buildClosedInvoice();
      invoice.registerPayment(300, 'acc-1');

      expect(invoice.paidAmount).toBe(300);
      expect(invoice.paidWithAccountId).toBe('acc-1');
      expect(invoice.status).toBe('closed');
    });

    it('deve registrar pagamento total e mudar status para paid', () => {
      const invoice = buildClosedInvoice();
      invoice.registerPayment(1000, 'acc-1');

      expect(invoice.paidAmount).toBe(1000);
      expect(invoice.status).toBe('paid');
    });

    it('deve acumular pagamentos parciais', () => {
      const invoice = buildClosedInvoice();
      invoice.registerPayment(300, 'acc-1');
      invoice.registerPayment(700, 'acc-2');

      expect(invoice.paidAmount).toBe(1000);
      expect(invoice.paidWithAccountId).toBe('acc-2');
      expect(invoice.status).toBe('paid');
    });

    it('deve mudar para paid quando paidAmount excede totalAmount', () => {
      const invoice = buildClosedInvoice();
      invoice.registerPayment(1500, 'acc-1');

      expect(invoice.paidAmount).toBe(1500);
      expect(invoice.status).toBe('paid');
    });

    it('deve atualizar updatedAt ao registrar pagamento', () => {
      const invoice = buildClosedInvoice();
      const originalUpdatedAt = invoice.updatedAt;

      invoice.registerPayment(300, 'acc-1');

      expect(invoice.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve rejeitar pagamento em fatura aberta', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(() => invoice.registerPayment(100, 'acc-1')).toThrow(
        InvalidInvoicePaymentError,
      );
    });

    it('deve rejeitar pagamento em fatura paga', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'paid',
        totalAmount: 1000,
        paidAmount: 1000,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => invoice.registerPayment(100, 'acc-1')).toThrow(
        InvalidInvoicePaymentError,
      );
    });

    it('deve rejeitar pagamento com valor zero', () => {
      const invoice = buildClosedInvoice();

      expect(() => invoice.registerPayment(0, 'acc-1')).toThrow(
        InvalidInvoicePaymentError,
      );
    });

    it('deve rejeitar pagamento com valor negativo', () => {
      const invoice = buildClosedInvoice();

      expect(() => invoice.registerPayment(-10, 'acc-1')).toThrow(
        InvalidInvoicePaymentError,
      );
    });
  });

  describe('reopen', () => {
    it('deve reabrir uma fatura fechada', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'closed',
        totalAmount: 500,
        paidAmount: 200,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      invoice.reopen();

      expect(invoice.status).toBe('open');
      expect(invoice.paidAmount).toBe(0);
      expect(invoice.paidWithAccountId).toBeNull();
    });

    it('deve atualizar updatedAt ao reabrir', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'closed',
        totalAmount: 500,
        paidAmount: 0,
        paidWithAccountId: null,
        createdAt: now,
        updatedAt: now,
      });

      const originalUpdatedAt = invoice.updatedAt;
      invoice.reopen();

      expect(invoice.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve rejeitar reabertura de fatura aberta', () => {
      const invoice = Invoice.create(buildValidProps());

      expect(() => invoice.reopen()).toThrow(InvalidInvoiceStatusTransitionError);
    });

    it('deve rejeitar reabertura de fatura paga', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'paid',
        totalAmount: 500,
        paidAmount: 500,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => invoice.reopen()).toThrow(InvalidInvoiceStatusTransitionError);
    });
  });

  describe('restore', () => {
    it('deve restaurar uma fatura a partir dos dados do banco', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-1',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '2025-03',
        closingDate: '2025-03-20',
        dueDate: '2025-03-27',
        status: 'paid',
        totalAmount: 1000,
        paidAmount: 1000,
        paidWithAccountId: 'acc-1',
        createdAt: now,
        updatedAt: now,
      });

      expect(invoice.id).toBe('inv-1');
      expect(invoice.creditCardId).toBe('cc-1');
      expect(invoice.userId).toBe('user-1');
      expect(invoice.month).toBe('2025-03');
      expect(invoice.closingDate).toBe('2025-03-20');
      expect(invoice.dueDate).toBe('2025-03-27');
      expect(invoice.status).toBe('paid');
      expect(invoice.totalAmount).toBe(1000);
      expect(invoice.paidAmount).toBe(1000);
      expect(invoice.paidWithAccountId).toBe('acc-1');
      expect(invoice.createdAt).toBe(now);
      expect(invoice.updatedAt).toBe(now);
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      const invoice = Invoice.restore({
        id: 'inv-2',
        creditCardId: 'cc-1',
        userId: 'user-1',
        month: '',
        closingDate: '',
        dueDate: '',
        status: 'open',
        totalAmount: -100,
        paidAmount: -50,
        paidWithAccountId: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(invoice.month).toBe('');
      expect(invoice.totalAmount).toBe(-100);
      expect(invoice.paidAmount).toBe(-50);
    });
  });
});
