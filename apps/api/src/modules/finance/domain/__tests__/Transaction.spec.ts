import { Transaction, TransactionType } from '../entities/Transaction';
import { Installment } from '../value-objects/Installment';
import { TransactionRecurrence } from '../value-objects/TransactionRecurrence';
import {
  InvalidTransactionAmountError,
  InvalidTransactionDescriptionError,
  InvalidTransactionTypeError,
  InvalidTransactionSourceError,
  InvalidInstallmentError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    type: 'expense' as TransactionType,
    amount: 150.0,
    description: 'Supermercado',
    date: '2025-03-15',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    ...overrides,
  };
}

describe('Transaction', () => {
  describe('criacao', () => {
    it('deve criar uma transacao com campos obrigatorios (conta)', () => {
      const tx = Transaction.create(buildValidProps());

      expect(tx.id).toBe('');
      expect(tx.userId).toBe('user-1');
      expect(tx.type).toBe('expense');
      expect(tx.amount).toBe(150.0);
      expect(tx.description).toBe('Supermercado');
      expect(tx.date).toBe('2025-03-15');
      expect(tx.categoryId).toBe('cat-1');
      expect(tx.accountId).toBe('acc-1');
      expect(tx.creditCardId).toBeNull();
      expect(tx.tags).toEqual([]);
      expect(tx.installment).toBeNull();
      expect(tx.recurrence).toBeNull();
      expect(tx.note).toBeNull();
      expect(tx.createdAt).toBeInstanceOf(Date);
      expect(tx.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar uma transacao com cartao de credito', () => {
      const tx = Transaction.create(
        buildValidProps({ accountId: null, creditCardId: 'cc-1' }),
      );

      expect(tx.accountId).toBeNull();
      expect(tx.creditCardId).toBe('cc-1');
    });

    it('deve criar uma transacao de receita com conta', () => {
      const tx = Transaction.create(
        buildValidProps({ type: 'income', accountId: 'acc-1' }),
      );

      expect(tx.type).toBe('income');
      expect(tx.accountId).toBe('acc-1');
    });

    it('deve criar transacao com tags', () => {
      const tx = Transaction.create(
        buildValidProps({ tags: ['tag-1', 'tag-2'] }),
      );

      expect(tx.tags).toEqual(['tag-1', 'tag-2']);
    });

    it('deve criar transacao com installment em cartao de credito', () => {
      const installment = Installment.create({
        totalInstallments: 3,
        currentInstallment: 1,
        installmentAmount: 50,
        parentTransactionId: 'parent-1',
      });

      const tx = Transaction.create(
        buildValidProps({
          accountId: null,
          creditCardId: 'cc-1',
          installment,
        }),
      );

      expect(tx.installment).toBe(installment);
    });

    it('deve criar transacao com recurrence', () => {
      const recurrence = TransactionRecurrence.create({
        frequency: 'monthly',
        startDate: '2025-03-15',
      });

      const tx = Transaction.create(
        buildValidProps({ recurrence }),
      );

      expect(tx.recurrence).toBe(recurrence);
    });

    it('deve criar transacao com note', () => {
      const tx = Transaction.create(
        buildValidProps({ note: 'Compras da semana' }),
      );

      expect(tx.note).toBe('Compras da semana');
    });

    it('deve definir defaults para campos opcionais', () => {
      const tx = Transaction.create(buildValidProps());

      expect(tx.tags).toEqual([]);
      expect(tx.installment).toBeNull();
      expect(tx.recurrence).toBeNull();
      expect(tx.note).toBeNull();
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const tx = Transaction.create(buildValidProps());
      const after = new Date();

      expect(tx.id).toBe('');
      expect(tx.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tx.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tx.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    // ── Validacao de amount ─────────────────────────────────────────────

    it('deve rejeitar amount zero', () => {
      expect(() =>
        Transaction.create(buildValidProps({ amount: 0 })),
      ).toThrow(InvalidTransactionAmountError);
    });

    it('deve rejeitar amount negativo', () => {
      expect(() =>
        Transaction.create(buildValidProps({ amount: -10 })),
      ).toThrow(InvalidTransactionAmountError);
    });

    it('deve aceitar amount positivo', () => {
      const tx = Transaction.create(buildValidProps({ amount: 0.01 }));

      expect(tx.amount).toBe(0.01);
    });

    // ── Validacao de description ─────────────────────────────────────────

    it('deve rejeitar descricao vazia', () => {
      expect(() =>
        Transaction.create(buildValidProps({ description: '' })),
      ).toThrow(InvalidTransactionDescriptionError);
    });

    it('deve rejeitar descricao com apenas espacos', () => {
      expect(() =>
        Transaction.create(buildValidProps({ description: '   ' })),
      ).toThrow(InvalidTransactionDescriptionError);
    });

    it('deve rejeitar descricao com mais de 200 caracteres', () => {
      const longDesc = 'a'.repeat(201);
      expect(() =>
        Transaction.create(buildValidProps({ description: longDesc })),
      ).toThrow(InvalidTransactionDescriptionError);
    });

    it('deve aceitar descricao com exatamente 200 caracteres', () => {
      const desc = 'a'.repeat(200);
      const tx = Transaction.create(buildValidProps({ description: desc }));

      expect(tx.description).toBe(desc);
    });

    it('deve fazer trim na descricao', () => {
      const tx = Transaction.create(
        buildValidProps({ description: '  Supermercado  ' }),
      );

      expect(tx.description).toBe('Supermercado');
    });

    // ── Validacao de type ─────────────────────────────────────────

    it('deve rejeitar tipo invalido', () => {
      expect(() =>
        Transaction.create(buildValidProps({ type: 'transfer' })),
      ).toThrow(InvalidTransactionTypeError);
    });

    it('deve aceitar tipo income', () => {
      const tx = Transaction.create(
        buildValidProps({ type: 'income' }),
      );

      expect(tx.type).toBe('income');
    });

    it('deve aceitar tipo expense', () => {
      const tx = Transaction.create(
        buildValidProps({ type: 'expense' }),
      );

      expect(tx.type).toBe('expense');
    });

    // ── Validacao de source (accountId / creditCardId) ────────────

    it('deve rejeitar quando nenhuma origem e informada', () => {
      expect(() =>
        Transaction.create(
          buildValidProps({ accountId: null, creditCardId: null }),
        ),
      ).toThrow(InvalidTransactionSourceError);
    });

    it('deve rejeitar quando nenhuma origem e informada (undefined)', () => {
      expect(() =>
        Transaction.create(
          buildValidProps({ accountId: undefined, creditCardId: undefined }),
        ),
      ).toThrow(InvalidTransactionSourceError);
    });

    it('deve rejeitar quando ambas origens sao informadas', () => {
      expect(() =>
        Transaction.create(
          buildValidProps({ accountId: 'acc-1', creditCardId: 'cc-1' }),
        ),
      ).toThrow(InvalidTransactionSourceError);
    });

    it('deve rejeitar receita em cartao de credito', () => {
      expect(() =>
        Transaction.create(
          buildValidProps({
            type: 'income',
            accountId: null,
            creditCardId: 'cc-1',
          }),
        ),
      ).toThrow(InvalidTransactionSourceError);
    });

    // ── Validacao de installment ─────────────────────────────────

    it('deve rejeitar installment em conta (nao cartao)', () => {
      const installment = Installment.create({
        totalInstallments: 3,
        currentInstallment: 1,
        installmentAmount: 50,
        parentTransactionId: 'parent-1',
      });

      expect(() =>
        Transaction.create(
          buildValidProps({ accountId: 'acc-1', installment }),
        ),
      ).toThrow(InvalidInstallmentError);
    });

    it('deve aceitar installment em cartao de credito', () => {
      const installment = Installment.create({
        totalInstallments: 3,
        currentInstallment: 1,
        installmentAmount: 50,
        parentTransactionId: 'parent-1',
      });

      const tx = Transaction.create(
        buildValidProps({
          accountId: null,
          creditCardId: 'cc-1',
          installment,
        }),
      );

      expect(tx.installment).toBe(installment);
    });
  });

  describe('tags getter', () => {
    it('deve retornar copia das tags', () => {
      const tx = Transaction.create(
        buildValidProps({ tags: ['tag-1', 'tag-2'] }),
      );

      const tags = tx.tags;
      tags.push('tag-3');

      expect(tx.tags).toEqual(['tag-1', 'tag-2']);
    });
  });

  describe('edicao', () => {
    it('deve atualizar a descricao', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateDescription('Farmacia');

      expect(tx.description).toBe('Farmacia');
    });

    it('deve fazer trim na descricao ao atualizar', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateDescription('  Farmacia  ');

      expect(tx.description).toBe('Farmacia');
    });

    it('deve rejeitar descricao vazia na atualizacao', () => {
      const tx = Transaction.create(buildValidProps());

      expect(() => tx.updateDescription('')).toThrow(
        InvalidTransactionDescriptionError,
      );
    });

    it('deve rejeitar descricao com mais de 200 caracteres na atualizacao', () => {
      const tx = Transaction.create(buildValidProps());

      expect(() => tx.updateDescription('a'.repeat(201))).toThrow(
        InvalidTransactionDescriptionError,
      );
    });

    it('deve atualizar updatedAt ao atualizar descricao', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.updateDescription('Farmacia');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar o amount', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateAmount(200);

      expect(tx.amount).toBe(200);
    });

    it('deve rejeitar amount zero na atualizacao', () => {
      const tx = Transaction.create(buildValidProps());

      expect(() => tx.updateAmount(0)).toThrow(InvalidTransactionAmountError);
    });

    it('deve rejeitar amount negativo na atualizacao', () => {
      const tx = Transaction.create(buildValidProps());

      expect(() => tx.updateAmount(-5)).toThrow(InvalidTransactionAmountError);
    });

    it('deve atualizar updatedAt ao atualizar amount', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.updateAmount(200);

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a categoria', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateCategory('cat-2');

      expect(tx.categoryId).toBe('cat-2');
    });

    it('deve atualizar updatedAt ao atualizar categoria', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.updateCategory('cat-2');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a data', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateDate('2025-04-01');

      expect(tx.date).toBe('2025-04-01');
    });

    it('deve atualizar updatedAt ao atualizar data', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.updateDate('2025-04-01');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve adicionar uma tag', () => {
      const tx = Transaction.create(buildValidProps());
      tx.addTag('tag-1');

      expect(tx.tags).toEqual(['tag-1']);
    });

    it('nao deve adicionar tag duplicada', () => {
      const tx = Transaction.create(
        buildValidProps({ tags: ['tag-1'] }),
      );
      tx.addTag('tag-1');

      expect(tx.tags).toEqual(['tag-1']);
    });

    it('deve atualizar updatedAt ao adicionar tag', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.addTag('tag-1');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve remover uma tag', () => {
      const tx = Transaction.create(
        buildValidProps({ tags: ['tag-1', 'tag-2'] }),
      );
      tx.removeTag('tag-1');

      expect(tx.tags).toEqual(['tag-2']);
    });

    it('deve atualizar updatedAt ao remover tag', () => {
      const tx = Transaction.create(
        buildValidProps({ tags: ['tag-1'] }),
      );
      const originalUpdatedAt = tx.updatedAt;

      tx.removeTag('tag-1');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a nota', () => {
      const tx = Transaction.create(buildValidProps());
      tx.updateNote('Nota importante');

      expect(tx.note).toBe('Nota importante');
    });

    it('deve atualizar a nota para null', () => {
      const tx = Transaction.create(
        buildValidProps({ note: 'Nota antiga' }),
      );
      tx.updateNote(null);

      expect(tx.note).toBeNull();
    });

    it('deve atualizar updatedAt ao atualizar nota', () => {
      const tx = Transaction.create(buildValidProps());
      const originalUpdatedAt = tx.updatedAt;

      tx.updateNote('Nota nova');

      expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('restore', () => {
    it('deve restaurar uma transacao a partir dos dados do banco', () => {
      const now = new Date();
      const installment = Installment.restore({
        totalInstallments: 3,
        currentInstallment: 1,
        installmentAmount: 50,
        parentTransactionId: 'parent-1',
      });
      const recurrence = TransactionRecurrence.restore({
        frequency: 'monthly',
        startDate: '2025-03-15',
        nextOccurrence: '2025-04-15',
      });

      const tx = Transaction.restore({
        id: 'tx-1',
        userId: 'user-1',
        type: 'expense',
        amount: 150,
        description: 'Supermercado',
        date: '2025-03-15',
        categoryId: 'cat-1',
        accountId: null,
        creditCardId: 'cc-1',
        tags: ['tag-1'],
        installment,
        recurrence,
        note: 'Nota',
        createdAt: now,
        updatedAt: now,
      });

      expect(tx.id).toBe('tx-1');
      expect(tx.userId).toBe('user-1');
      expect(tx.type).toBe('expense');
      expect(tx.amount).toBe(150);
      expect(tx.description).toBe('Supermercado');
      expect(tx.date).toBe('2025-03-15');
      expect(tx.categoryId).toBe('cat-1');
      expect(tx.accountId).toBeNull();
      expect(tx.creditCardId).toBe('cc-1');
      expect(tx.tags).toEqual(['tag-1']);
      expect(tx.installment).toBe(installment);
      expect(tx.recurrence).toBe(recurrence);
      expect(tx.note).toBe('Nota');
      expect(tx.createdAt).toBe(now);
      expect(tx.updatedAt).toBe(now);
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      // Amount zero e descricao vazia nao devem lancar erro no restore
      const tx = Transaction.restore({
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 0,
        description: '',
        date: '2025-03-15',
        categoryId: 'cat-1',
        accountId: null,
        creditCardId: null,
        tags: [],
        installment: null,
        recurrence: null,
        note: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(tx.amount).toBe(0);
      expect(tx.description).toBe('');
      expect(tx.accountId).toBeNull();
      expect(tx.creditCardId).toBeNull();
    });
  });
});
